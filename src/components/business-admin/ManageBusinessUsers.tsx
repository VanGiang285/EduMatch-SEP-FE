"use client";

import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Badge } from '@/components/ui/basic/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/layout/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/feedback/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/navigation/pagination';
import { Input } from '@/components/ui/form/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select';
import {
  Search,
  Filter,
  Users,
  Eye,
  XCircle,
  CheckCircle,
  Loader2,
  ArrowUpDown,
  Calendar,
  Phone,
  Mail,
  Star,
  Shield,
  MapPin,
  Globe,
  Maximize2,
  FileText,
  ExternalLink,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/basic/avatar';
import { AdminService } from '@/services/adminService';
import { ManageUserDto, UserProfileDto } from '@/types/backend';
import { useAuth } from '@/hooks/useAuth';
import { useCustomToast } from '@/hooks/useCustomToast';
import { UserProfileService } from '@/services/userProfileService';
import { LocationService, ProvinceDto } from '@/services/locationService';
import { EnumHelpers, Gender, VerifyStatus, TeachingMode } from '@/types/enums';
import { TutorService } from '@/services/tutorService';
import { DetailTutorProfile, mapTutorProfileToDetail } from './ManageTutorApplications';
import { Separator } from '@/components/ui/layout/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/navigation/tabs';
import { formatCurrency } from '@/data/mockBusinessAdminData';
import { FeedbackService } from '@/services/feedbackService';
import { TutorRatingSummary } from '@/types/backend';
import { BookOpen } from 'lucide-react';

type SortField = 'id' | 'name' | 'email' | 'createdAt';

function formatLevels(levels: string[]): string {
  if (levels.length === 0) return '';
  
  if (levels.some(level => level.toLowerCase().includes('tất cả') || level.toLowerCase().includes('all'))) {
    return 'Tất cả cấp';
  }
  
  const hasTHPT = levels.some(level => level.toUpperCase().includes('THPT'));
  if (hasTHPT && levels.length === 1) {
    return 'THPT';
  }
  
  const numbers = levels
    .map(level => {
      const num = parseInt(level.replace(/\D/g, ''));
      return isNaN(num) ? null : num;
    })
    .filter((num): num is number => num !== null)
    .sort((a, b) => a - b);
  
  if (numbers.length === 0) {
    return levels.join(', ');
  }
  
  if (numbers.length > 1) {
    let isConsecutive = true;
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] !== numbers[i - 1] + 1) {
        isConsecutive = false;
        break;
      }
    }
    
    if (isConsecutive) {
      return `Lớp ${numbers[0]}-${numbers[numbers.length - 1]}`;
    }
  }
  
  return `Lớp ${numbers.join(', ')}`;
}

function groupSubjectsBySubjectName(tutorSubjects: any[]): Array<{ subjectName: string; levelText: string; hourlyRate?: number; minRate?: number; maxRate?: number }> {
  if (!tutorSubjects || tutorSubjects.length === 0) return [];
  
  const grouped = new Map<string, { levels: Set<string>; hourlyRates: number[] }>();
  
  tutorSubjects.forEach((ts) => {
    const subjectName = ts.subject?.subjectName || `Subject ${ts.id}`;
    const levelName = ts.level?.name || '';
    const hourlyRate = ts.hourlyRate || 0;
    
    if (!grouped.has(subjectName)) {
      grouped.set(subjectName, { levels: new Set(), hourlyRates: [] });
    }
    
    const group = grouped.get(subjectName)!;
    if (levelName) {
      group.levels.add(levelName);
    }
    if (hourlyRate > 0) {
      group.hourlyRates.push(hourlyRate);
    }
  });
  
  return Array.from(grouped.entries()).map(([subjectName, { levels, hourlyRates }]) => {
    const levelsArray = Array.from(levels).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
    
    const levelText = formatLevels(levelsArray);
    const minRate = hourlyRates.length > 0 ? Math.min(...hourlyRates) : undefined;
    const maxRate = hourlyRates.length > 0 ? Math.max(...hourlyRates) : undefined;
    const hourlyRate = minRate && maxRate && minRate === maxRate ? minRate : undefined;
    
    return {
      subjectName,
      levelText,
      hourlyRate,
      minRate,
      maxRate
    };
  });
}

function groupConsecutiveSlots(slots: string[]): string[] {
  if (!slots || slots.length === 0) return [];
  
  // Parse slots to time ranges
  const parseSlot = (slot: string): { start: number; end: number; original: string } | null => {
    // Format: "08:00 - 09:00" or "8h - 9h"
    const match = slot.match(/(\d{1,2})[h:](\d{0,2})\s*-\s*(\d{1,2})[h:](\d{0,2})/);
    if (!match) return null;
    
    const startHour = parseInt(match[1]);
    const startMin = match[2] ? parseInt(match[2]) : 0;
    const endHour = parseInt(match[3]);
    const endMin = match[4] ? parseInt(match[4]) : 0;
    
    const startTime = startHour * 60 + startMin; // Convert to minutes
    const endTime = endHour * 60 + endMin;
    
    return { start: startTime, end: endTime, original: slot };
  };
  
  // Format time back to string
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${hours}h`;
  };
  
  const parsedSlots = slots
    .map(parseSlot)
    .filter((slot): slot is { start: number; end: number; original: string } => slot !== null)
    .sort((a, b) => a.start - b.start);
  
  if (parsedSlots.length === 0) return slots;
  
  // Group consecutive slots
  const ranges: Array<{ start: number; end: number }> = [];
  let currentRange: { start: number; end: number } | null = null;
  
  for (const slot of parsedSlots) {
    if (!currentRange) {
      currentRange = { start: slot.start, end: slot.end };
    } else if (currentRange.end === slot.start) {
      // Consecutive slot, extend range
      currentRange.end = slot.end;
    } else {
      // Not consecutive, save current range and start new one
      ranges.push(currentRange);
      currentRange = { start: slot.start, end: slot.end };
    }
  }
  
  if (currentRange) {
    ranges.push(currentRange);
  }
  
  // Format ranges back to strings
  return ranges.map(range => {
    const startStr = formatTime(range.start);
    const endStr = formatTime(range.end);
    return `${startStr} - ${endStr}`;
  });
}

function groupAvailabilitiesByWeek(availabilities: any[], weeksToShow: number = 4): Array<{
  weekOffset: number;
  weekStart: Date;
  weekEnd: Date;
  weekDays: Array<{
    day: string;
    dayOfWeek: number;
    date: Date;
    slots: string[];
  }>;
  totalSlots: number;
}> {
  if (!availabilities || availabilities.length === 0) return [];
  
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : timeStr;
  };
  
  const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  
  const weeks: Array<{
    weekOffset: number;
    weekStart: Date;
    weekEnd: Date;
    weekDays: Map<number, { day: string; dayOfWeek: number; date: Date; slots: Set<string> }>;
    totalSlots: number;
  }> = [];
  
  // Initialize weeks
  for (let weekOffset = 0; weekOffset < weeksToShow; weekOffset++) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + (weekOffset * 7) - today.getDay() + 1); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday
    
    weeks.push({
      weekOffset,
      weekStart,
      weekEnd,
      weekDays: new Map(),
      totalSlots: 0
    });
  }
  
  // Group availabilities by week
  availabilities.forEach((avail) => {
    if (!avail.startDate) return;
    const availDate = new Date(avail.startDate);
    if (isNaN(availDate.getTime())) return;
    
    const dayOfWeek = avail.slot?.dayOfWeek !== undefined
      ? avail.slot.dayOfWeek
      : availDate.getDay();
    
    const timeSlot = avail.slot?.startTime && avail.slot?.endTime
      ? `${formatTime(avail.slot.startTime)} - ${formatTime(avail.slot.endTime)}`
      : '';
    
    if (!timeSlot) return;
    
    // Find which week this availability belongs to
    for (const week of weeks) {
      if (availDate >= week.weekStart && availDate <= week.weekEnd) {
        if (!week.weekDays.has(dayOfWeek)) {
          week.weekDays.set(dayOfWeek, {
            day: dayNames[dayOfWeek] || '',
            dayOfWeek,
            date: availDate,
            slots: new Set()
          });
        }
        week.weekDays.get(dayOfWeek)!.slots.add(timeSlot);
        week.totalSlots++;
        break;
      }
    }
  });
  
  return weeks
    .filter(week => week.weekDays.size > 0)
    .map(week => ({
      weekOffset: week.weekOffset,
      weekStart: week.weekStart,
      weekEnd: week.weekEnd,
      weekDays: Array.from(week.weekDays.values())
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
        .map(dayInfo => ({
          day: dayInfo.day,
          dayOfWeek: dayInfo.dayOfWeek,
          date: dayInfo.date,
          slots: groupConsecutiveSlots(Array.from(dayInfo.slots).sort())
        })),
      totalSlots: week.totalSlots
    }));
}

const ROLE = {
  LEARNER: 1,
  TUTOR: 2,
  BUSINESS_ADMIN: 3,
  SYSTEM_ADMIN: 4,
};

const getInitials = (value?: string) => {
  if (!value) return 'NA';
  const trimmed = value.trim();
  if (!trimmed) return 'NA';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
};

const ROLE_BADGES: Record<number, { label: string; className: string }> = {
  [ROLE.LEARNER]: {
    label: 'Học viên',
    className: 'bg-[#257180] text-white border border-[#257180] font-semibold px-3 py-1',
  },
  [ROLE.TUTOR]: {
    label: 'Gia sư',
    className: 'bg-[#FD8B51] text-white border border-[#FD8B51] font-semibold px-3 py-1',
  },
  [ROLE.BUSINESS_ADMIN]: {
    label: 'Business Admin',
    className: 'bg-amber-100 text-amber-800 border-2 border-amber-400 font-semibold px-3 py-1',
  },
};

const getTeachingModeText = (modes: TeachingMode | string | number): string => {
  const parsedModes = EnumHelpers.parseTeachingMode(modes);
  const modeLabels: string[] = [];
  if (parsedModes & TeachingMode.Offline) modeLabels.push('Dạy trực tiếp');
  if (parsedModes & TeachingMode.Online) modeLabels.push('Dạy online');
  if (parsedModes & TeachingMode.Hybrid) modeLabels.push('Kết hợp');
  return modeLabels.length > 0 ? modeLabels.join(', ') : 'Chưa cập nhật';
};

const getVerifyStatusText = (status: VerifyStatus | number): string => {
  const parsedStatus = EnumHelpers.parseVerifyStatus(status);
  switch (parsedStatus) {
    case VerifyStatus.Pending:
      return 'Chờ duyệt';
    case VerifyStatus.Verified:
      return 'Đã xác minh';
    case VerifyStatus.Rejected:
      return 'Bị từ chối';
    case VerifyStatus.Expired:
      return 'Hết hạn';
    case VerifyStatus.Removed:
      return 'Đã xóa';
    default:
      return 'Không xác định';
  }
};

const getVerifyStatusColor = (status: VerifyStatus | number): string => {
  const parsedStatus = EnumHelpers.parseVerifyStatus(status);
  switch (parsedStatus) {
    case VerifyStatus.Pending:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case VerifyStatus.Verified:
      return 'bg-green-100 text-green-800 border-green-200';
    case VerifyStatus.Rejected:
      return 'bg-red-100 text-red-800 border-red-200';
    case VerifyStatus.Expired:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case VerifyStatus.Removed:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const resolveRoleId = (input: ManageUserDto | number | string | undefined | null): number | null => {
  if (typeof input === 'object' && input !== null) {
    const record = input as ManageUserDto;
    const roleFromId = resolveRoleId(record.roleId as number | undefined);
    if (roleFromId !== null) {
      return roleFromId;
    }
    if (record.roleName) {
      return resolveRoleId(record.roleName);
    }
    return null;
  }

  if (typeof input === 'number' && !Number.isNaN(input)) {
    return input;
  }

  if (typeof input === 'string') {
    const numeric = Number(input);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }

    const normalized = input.trim().toLowerCase();
    if (normalized.includes('học') || normalized.includes('learner')) {
      return ROLE.LEARNER;
    }
    if (normalized.includes('gia sư') || normalized.includes('tutor')) {
      return ROLE.TUTOR;
    }
    if (normalized.includes('business')) {
      return ROLE.BUSINESS_ADMIN;
    }
    if (normalized.includes('system')) {
      return ROLE.SYSTEM_ADMIN;
    }
  }

  return null;
};

export function ManageBusinessUsers() {
  const { user } = useAuth();
  const { showSuccess, showError } = useCustomToast();
  const showErrorRef = useRef(showError);
  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);
  const [users, setUsers] = useState<ManageUserDto[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ManageUserDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState<string | null>(null);
  const [isDeactivating, setIsDeactivating] = useState<string | null>(null);

  const [detailType, setDetailType] = useState<'learner' | 'tutor' | null>(null);
  const [detailLearner, setDetailLearner] = useState<UserProfileDto | null>(null);
  const [detailTutor, setDetailTutor] = useState<DetailTutorProfile | null>(null);
  const [detailUser, setDetailUser] = useState<ManageUserDto | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [detailLoadingEmail, setDetailLoadingEmail] = useState<string | null>(null);
  const [avatarCache, setAvatarCache] = useState<Record<string, string>>({});
  const avatarCacheRef = useRef<Record<string, string>>({});
  const [tutorRating, setTutorRating] = useState<TutorRatingSummary | null>(null);
  const [loadingRating, setLoadingRating] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    avatarCacheRef.current = avatarCache;
  }, [avatarCache]);
  const [provinces, setProvinces] = useState<ProvinceDto[]>([]);

  const preloadAvatars = useCallback(async (list: ManageUserDto[]) => {
    const targets = list.filter((u) => u.email && !avatarCacheRef.current[u.email]);
    if (!targets.length) return;

    await Promise.all(
      targets.map(async (account) => {
        if (!account.email) return;
        try {
          const response = await UserProfileService.getUserProfile(account.email);
          if (response.success && response.data?.avatarUrl) {
            setAvatarCache((prev) => {
              if (prev[account.email!]) {
                return prev;
              }
              const next = { ...prev, [account.email!]: response.data?.avatarUrl || '' };
              avatarCacheRef.current = next;
              return next;
            });
          }
        } catch {
          // ignore avatar errors
        }
      })
    );
  }, []);

  useEffect(() => {
    if (!user?.email) {
      return;
    }

    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const response = await AdminService.getAllUsers();
        if (response.success && response.data) {
          const filtered = response.data
            .filter((u) => {
              const roleId = resolveRoleId(u);
              return roleId !== ROLE.SYSTEM_ADMIN && roleId !== ROLE.BUSINESS_ADMIN;
            })
            .filter((u) => u.email !== user?.email);
          setUsers(filtered);
          preloadAvatars(filtered);
        } else {
          showErrorRef.current?.('Lỗi', response.message || 'Không thể tải danh sách người dùng');
        }
      } catch (error) {
        console.error('Error loading users:', error);
        showErrorRef.current?.('Lỗi', 'Không thể tải danh sách người dùng.');
      } finally {
        setIsLoading(false);
      }
    };

    const loadProvinces = async () => {
      try {
        const response = await LocationService.getAllProvinces();
        if (response.success && response.data) {
          setProvinces(response.data);
        }
      } catch (error) {
        console.error('Error loading provinces:', error);
      }
    };

    loadUsers();
    loadProvinces();
  }, [user?.email, preloadAvatars]);

  useEffect(() => {
    let filtered = [...users];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          (u.userName?.toLowerCase().includes(term) || false) ||
          u.email.toLowerCase().includes(term) ||
          (u.phone?.toLowerCase().includes(term) || false)
      );
    }

    if (filterRole !== 'all') {
      const selectedRoleId = Number(filterRole);
      filtered = filtered.filter((u) => resolveRoleId(u) === selectedRoleId);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((u) => (filterStatus === 'active' ? u.isActive : !u.isActive));
    }

    filtered.sort((a, b) => {
      let valueA: string | number = '';
      let valueB: string | number = '';

      switch (sortField) {
        case 'id':
          valueA = a.id || 0;
          valueB = b.id || 0;
          break;
        case 'name':
          valueA = (a.userName || '').toLowerCase();
          valueB = (b.userName || '').toLowerCase();
          break;
        case 'email':
          valueA = a.email.toLowerCase();
          valueB = b.email.toLowerCase();
          break;
        case 'createdAt':
        default:
          valueA = new Date(a.createAt || a.createdAt || '').getTime();
          valueB = new Date(b.createAt || b.createdAt || '').getTime();
          break;
      }

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
    preloadAvatars(filtered);
  }, [users, searchTerm, filterRole, filterStatus, sortField, sortDirection, preloadAvatars]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'createdAt' ? 'desc' : 'asc');
    }
  };

  const totalPages = useMemo(() => Math.ceil(filteredUsers.length / itemsPerPage), [filteredUsers.length, itemsPerPage]);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (isActive: boolean | undefined) => {
    if (isActive) {
      return (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="font-medium text-gray-900">Hoạt động</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <XCircle className="h-4 w-4 text-gray-600" />
        <span className="font-medium text-gray-900">Chưa kích hoạt</span>
      </div>
    );
  };

  const getRoleName = (roleId: number | null | undefined) => {
    switch (roleId) {
      case ROLE.LEARNER:
        return 'Học viên';
      case ROLE.TUTOR:
        return 'Gia sư';
      case ROLE.BUSINESS_ADMIN:
        return 'Business Admin';
      default:
        return 'Không xác định';
    }
  };

  const handleActivateUser = async (email: string) => {
    setIsActivating(email);
    try {
      const response = await AdminService.activateUser(email);
      if (response.success) {
        setUsers((prev) => prev.map((u) => (u.email === email ? { ...u, isActive: true } : u)));
        showSuccess('Thành công', 'Đã kích hoạt tài khoản');
      } else {
        showError('Lỗi', response.message || 'Không thể kích hoạt tài khoản');
      }
    } catch (error) {
      console.error('Error activating user:', error);
      showError('Lỗi', 'Không thể kích hoạt tài khoản.');
    } finally {
      setIsActivating(null);
    }
  };

  const handleDeactivateUser = async (email: string) => {
    setIsDeactivating(email);
    try {
      const response = await AdminService.deactivateUser(email);
      if (response.success) {
        setUsers((prev) => prev.map((u) => (u.email === email ? { ...u, isActive: false } : u)));
        showSuccess('Thành công', 'Đã vô hiệu hóa tài khoản');
      } else {
        showError('Lỗi', response.message || 'Không thể vô hiệu hóa tài khoản');
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      showError('Lỗi', 'Không thể vô hiệu hóa tài khoản.');
    } finally {
      setIsDeactivating(null);
    }
  };

  const handleViewDetail = async (userData: ManageUserDto) => {
    const roleId = resolveRoleId(userData);
    if (roleId !== ROLE.LEARNER && roleId !== ROLE.TUTOR) {
      return;
    }
    setDetailUser(userData);
    setDetailLoadingEmail(userData.email);
    setIsDetailLoading(true);

    try {
      if (roleId === ROLE.LEARNER) {
        const response = await UserProfileService.getUserProfile(userData.email);
        if (response.success && response.data) {
          const profile = response.data;
          let provinceName = profile.province?.name;
          if (!provinceName && profile.cityId) {
            const found = provinces.find((p) => p.id === profile.cityId);
            provinceName = found?.name;
          }

          let subDistrictName = profile.subDistrict?.name;
          if (!subDistrictName && profile.cityId && profile.subDistrictId) {
            const subDistrictRes = await LocationService.getSubDistrictsByProvinceId(profile.cityId);
            if (subDistrictRes.success && subDistrictRes.data) {
              subDistrictName = subDistrictRes.data.find((d) => d.id === profile.subDistrictId)?.name;
            }
          }

          const resolvedProvince = provinceName
            ? profile.province
              ? { ...profile.province, name: provinceName }
              : profile.cityId
                ? { id: profile.cityId, name: provinceName }
                : profile.province
            : profile.province;

          const resolvedSubDistrict = subDistrictName
            ? profile.subDistrict
              ? { ...profile.subDistrict, name: subDistrictName }
              : profile.subDistrictId
                ? {
                    id: profile.subDistrictId,
                    provinceId: profile.cityId ?? 0,
                    name: subDistrictName,
                  }
                : profile.subDistrict
            : profile.subDistrict;

          setDetailLearner({
            ...profile,
            province: resolvedProvince,
            subDistrict: resolvedSubDistrict,
          });
          setDetailType('learner');
        } else {
          showError('Lỗi', response.message || 'Không thể tải thông tin học viên');
        }
      } else if (roleId === ROLE.TUTOR) {
        const response = await TutorService.getTutorByEmail(userData.email);
        if (response.success && response.data) {
          const detail = mapTutorProfileToDetail(response.data);
          setDetailTutor(detail);
          setDetailType('tutor');
          
          // Load rating
          if (detail.id) {
            setLoadingRating(true);
            try {
              const ratingResponse = await FeedbackService.getTutorRatingSummary(detail.id);
              if (ratingResponse.success && ratingResponse.data) {
                setTutorRating(ratingResponse.data);
              }
            } catch (error) {
              console.error('Error loading rating:', error);
            } finally {
              setLoadingRating(false);
            }
          }
        } else {
          showError('Lỗi', response.message || 'Không thể tải thông tin gia sư');
        }
      }
    } catch (error) {
      console.error('Error loading detail:', error);
      showError('Lỗi', 'Không thể tải chi tiết người dùng.');
    } finally {
      setIsDetailLoading(false);
      setDetailLoadingEmail(null);
    }
  };

  useEffect(() => {
    if (detailType !== 'tutor') {
      setTutorRating(null);
    }
  }, [detailType]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý người dùng</h1>
          <p className="text-sm text-gray-600 mt-1">Theo dõi học viên và gia sư trong hệ thống</p>
        </div>
      </div>

      <Card className="bg-white border-gray-300">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Lọc theo vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value={ROLE.LEARNER.toString()}>Học viên</SelectItem>
                <SelectItem value={ROLE.TUTOR.toString()}>Gia sư</SelectItem>
                <SelectItem value={ROLE.BUSINESS_ADMIN.toString()}>Business Admin</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Chưa kích hoạt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách người dùng</CardTitle>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-900">{filteredUsers.length} người dùng</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#257180]" />
              <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[80px] text-left">
                        <Button variant="ghost" size="sm" onClick={() => handleSort('id')} className="h-8 px-2">
                          ID <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-left">
                        <Button variant="ghost" size="sm" onClick={() => handleSort('name')} className="h-8 px-2">
                          Tên người dùng <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-left">
                        <Button variant="ghost" size="sm" onClick={() => handleSort('email')} className="h-8 px-2">
                          Email <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-left font-semibold text-gray-900">Số điện thoại</TableHead>
                      <TableHead className="text-left font-semibold text-gray-900">Vai trò</TableHead>
                      <TableHead className="text-left font-semibold text-gray-900">Trạng thái</TableHead>
                      <TableHead className="text-left">
                        <Button variant="ghost" size="sm" onClick={() => handleSort('createdAt')} className="h-8 px-2">
                          Ngày tạo <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-center font-semibold text-gray-900 w-[160px]">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                          Không tìm thấy người dùng nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedUsers.map((record, index) => (
                        <TableRow key={record.email} className="hover:bg-gray-50">
                          <TableCell className="text-left">
                            <span className="font-mono text-sm text-gray-600">{startIndex + index + 1}</span>
                          </TableCell>
                          <TableCell className="text-left">
                            <div className="flex items-center gap-3 min-w-0 max-w-[220px]">
                              <Avatar className="h-10 w-10 rounded-lg border border-[#F2E5BF] bg-[#F2E5BF] text-[#257180] font-semibold">
                                <AvatarImage
                                  src={avatarCache[record.email] || record.avatarUrl}
                                  alt={record.userName || record.email}
                                  className="object-cover"
                                />
                                <AvatarFallback>{getInitials(record.userName || record.email)}</AvatarFallback>
                              </Avatar>
                              <p className="font-medium text-gray-900 truncate" title={record.userName || record.email}>
                                {record.userName || record.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-left text-sm text-gray-700 max-w-[220px]">
                            <span className="truncate block" title={record.email}>
                              {record.email}
                            </span>
                          </TableCell>
                          <TableCell className="text-left text-sm text-gray-700">{record.phone || '-'}</TableCell>
                          <TableCell className="text-left">
                            {(() => {
                              const roleId = resolveRoleId(record);
                              const roleLabel = roleId ? ROLE_BADGES[roleId]?.label || getRoleName(roleId) : record.roleName || 'Không xác định';
                              let IconComponent = Users;
                              if (roleId === ROLE.LEARNER) {
                                IconComponent = Users;
                              } else if (roleId === ROLE.TUTOR) {
                                IconComponent = GraduationCap;
                              } else if (roleId === ROLE.BUSINESS_ADMIN) {
                                IconComponent = Shield;
                              }
                              return (
                                <div className="flex items-center gap-2">
                                  <IconComponent className="h-4 w-4 text-gray-600" />
                                  <span className="font-medium text-gray-900">{roleLabel}</span>
                                </div>
                              );
                            })()}
                          </TableCell>
                          <TableCell className="text-left">{getStatusBadge(record.isActive)}</TableCell>
                          <TableCell className="text-left text-sm text-gray-700">
                            {record.createAt || record.createdAt ? (
                              new Date(record.createAt || record.createdAt || '').toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                              })
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              {(() => {
                                const roleId = resolveRoleId(record);
                                return roleId === ROLE.LEARNER || roleId === ROLE.TUTOR ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-2 hover:bg-[#FD8B51] hover:text-white"
                                    onClick={() => handleViewDetail(record)}
                                    title="Xem chi tiết"
                                  >
                                    {detailLoadingEmail === record.email && isDetailLoading ? (
                                      <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                      <Eye className="h-5 w-5" />
                                    )}
                                  </Button>
                                ) : null;
                              })()}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  record.isActive ? handleDeactivateUser(record.email) : handleActivateUser(record.email)
                                }
                                disabled={isActivating === record.email || isDeactivating === record.email}
                                className="p-2 hover:bg-[#FD8B51] hover:text-white"
                                title={record.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                              >
                                {isActivating === record.email || isDeactivating === record.email ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : record.isActive ? (
                                  <XCircle className="h-5 w-5" />
                                ) : (
                                  <CheckCircle className="h-5 w-5" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-end px-6 py-4 border-t border-[#257180]/20">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        >
                          Trước
                        </PaginationPrevious>
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, idx) => {
                        const pageNum = idx + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => setCurrentPage(pageNum)}
                                isActive={currentPage === pageNum}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        >
                          Sau
                        </PaginationNext>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailType === 'learner'} onOpenChange={(open) => !open && setDetailType(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-gray-300 shadow-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Chi tiết học viên</DialogTitle>
          </DialogHeader>
          {isDetailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#257180]" />
            </div>
          ) : detailLearner && detailUser ? (
            <div className="space-y-6">
              <Card className="border border-gray-300">
                <CardContent className="p-6 flex flex-col sm:flex-row gap-6">
                  <Avatar className="h-24 w-24 rounded-xl border border-[#F2E5BF] bg-[#F2E5BF] text-[#257180] text-2xl font-semibold">
                    <AvatarImage src={detailLearner.avatarUrl} alt={detailUser.userName || detailUser.email} className="object-cover" />
                    <AvatarFallback>{getInitials(detailUser.userName || detailUser.email)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-2xl font-semibold text-gray-900">{detailUser.userName || detailUser.email}</h3>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {detailUser.email}
                    </p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {detailUser.phone || 'Chưa cập nhật'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border border-gray-300">
                  <CardHeader>
                    <CardTitle>Thông tin cá nhân</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Họ và tên</p>
                      <p className="font-medium text-gray-900">{detailUser.userName || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ngày sinh</p>
                      <p className="font-medium text-gray-900">
                        {detailLearner.dob ? new Date(detailLearner.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Giới tính</p>
                      <p className="font-medium text-gray-900">
                        {EnumHelpers.getGenderLabel((detailLearner.gender as Gender) ?? Gender.Unknown)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tình trạng tài khoản</p>
                      <p className="font-medium text-gray-900">
                        {detailLearner.userEmailNavigation?.isActive ? 'Đang hoạt động' : 'Chưa kích hoạt'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-300">
                  <CardHeader>
                    <CardTitle>Địa chỉ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Tỉnh/Thành phố</p>
                      <p className="font-medium text-gray-900">{detailLearner.province?.name || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quận/Huyện</p>
                      <p className="font-medium text-gray-900">{detailLearner.subDistrict?.name || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Địa chỉ chi tiết</p>
                      <p className="font-medium text-gray-900">{detailLearner.addressLine || 'Chưa cập nhật'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-6">Không có dữ liệu</div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={detailType === 'tutor'} onOpenChange={(open) => !open && setDetailType(null)}>
        <DialogContent className="!max-w-7xl sm:!max-w-7xl max-h-[95vh] overflow-y-auto border-gray-300 shadow-lg" aria-describedby={undefined}>
          <DialogHeader className="border-b border-[#257180]/20 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">Hồ sơ gia sư</DialogTitle>
          </DialogHeader>
          {isDetailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#257180]" />
            </div>
          ) : detailTutor ? (
            <div className="pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border border-gray-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6 flex-col sm:flex-row">
                        <div className="relative flex-shrink-0">
                          <Avatar className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border border-[#F2E5BF] bg-[#F2E5BF] text-[#257180] text-3xl font-semibold">
                            <AvatarImage src={detailTutor.avatarUrl} alt={detailTutor.userName} className="object-cover" />
                            <AvatarFallback>
                              {detailTutor.userName
                                .split(' ')
                                .slice(-2)
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white bg-blue-600">
                            <Shield className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-3">
                            <div className="min-w-0">
                              <h1 className="text-gray-900 text-2xl font-semibold mb-2 truncate" title={detailTutor.userName}>
                                {detailTutor.userName}
                              </h1>
                              <div className="flex items-center gap-3 flex-wrap text-sm text-gray-600">
                                <div className="flex items-center gap-1.5">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  {loadingRating ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                  ) : (
                                    <>
                                      <span className="text-gray-900">{tutorRating?.averageRating.toFixed(1) || '0.0'}</span>
                                      <span className="text-gray-500">({tutorRating?.totalFeedbackCount || 0} đánh giá)</span>
                                    </>
                                  )}
                                </div>
                                <span className="text-gray-400">•</span>
                                <span>{detailTutor.totalStudents} học viên</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {(() => {
                                const teachingModeText = getTeachingModeText(detailTutor.teachingModes);
                                if (!teachingModeText || teachingModeText === 'Chưa cập nhật') return null;
                                return (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                    {teachingModeText}
                              </Badge>
                                );
                              })()}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-gray-600 min-w-0">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">
                                  {detailTutor.subDistrictName || 'Chưa cập nhật'}
                                  {detailTutor.provinceName ? `, ${detailTutor.provinceName}` : ''}
                                </span>
                              </div>
                              {(() => {
                                const teachingModeText = getTeachingModeText(detailTutor.teachingModes);
                                return (
                              <div className="flex items-center gap-2 text-gray-600 min-w-0">
                                <Globe className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">
                                      {teachingModeText || 'Chưa cập nhật'}
                                    </span>
                              </div>
                                );
                              })()}
                              <div className="flex items-center gap-2 text-gray-600 min-w-0">
                                <Users className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{detailTutor.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 min-w-0">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">
                                  Tham gia {new Date(detailTutor.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Tabs defaultValue="about" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 bg-[#F2E5BF]">
                      <TabsTrigger value="about" className="data-[state=active]:bg-[#257180] data-[state=active]:text-white data-[state=active]:border-[#257180]">
                        Giới thiệu
                      </TabsTrigger>
                      <TabsTrigger
                        value="education"
                        className="data-[state=active]:bg-[#257180] data-[state=active]:text-white data-[state=active]:border-[#257180]"
                      >
                        Học vấn & Chứng chỉ
                      </TabsTrigger>
                      <TabsTrigger
                        value="availability"
                        className="data-[state=active]:bg-[#257180] data-[state=active]:text-white data-[state=active]:border-[#257180]"
                      >
                        Lịch khả dụng
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="about" className="space-y-6">
                      <Card className="border border-gray-300">
                        <CardHeader>
                          <CardTitle className="font-bold">Về tôi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line break-words">
                              {detailTutor.bio || 'Chưa có thông tin giới thiệu.'}
                            </p>
                          </div>
                          <Separator className="border-[#257180]/20" />
                          <div>
                            <h3 className="text-gray-900 mb-3 font-bold">Kinh nghiệm giảng dạy</h3>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line break-words">
                              {detailTutor.teachingExp && detailTutor.teachingExp.trim()
                                ? detailTutor.teachingExp
                                : 'Chưa cập nhật.'}
                            </p>
                          </div>
                          <Separator className="border-[#257180]/20" />
                          <div>
                            <h3 className="text-gray-900 mb-3 font-bold">Môn học đăng ký</h3>
                            {detailTutor.subjects.length > 0 ? (
                              <div className="space-y-2">
                                {groupSubjectsBySubjectName(detailTutor.subjects).map((grouped, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <BookOpen className="w-4 h-4 text-[#257180] flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-gray-900">{grouped.subjectName}</p>
                                        <p className="text-sm text-gray-600">{grouped.levelText || 'Chưa có thông tin'}</p>
                                      </div>
                                    </div>
                                    <p className="font-semibold text-[#257180]">
                                      {grouped.hourlyRate 
                                        ? `${formatCurrency(grouped.hourlyRate)}/giờ`
                                        : grouped.minRate && grouped.maxRate
                                        ? `${formatCurrency(grouped.minRate)} - ${formatCurrency(grouped.maxRate)}/giờ`
                                        : 'Chưa cập nhật'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500">Chưa có môn học nào.</p>
                            )}
                          </div>
                          <Separator className="border-[#257180]/20" />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="education" className="space-y-6">
                      <Card className="border border-gray-300">
                        <CardHeader>
                          <CardTitle className="font-bold">Học vấn</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {detailTutor.educations.length > 0 ? (
                            detailTutor.educations.map((edu) => (
                              <div key={edu.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                  <div>
                                    <p className="font-medium text-gray-900">{edu.institution?.name || 'Chưa có tên'}</p>
                                    {edu.issueDate && (
                                      <p className="text-sm text-gray-600">
                                        Tốt nghiệp: {new Date(edu.issueDate).toLocaleDateString('vi-VN')}
                                      </p>
                                    )}
                                  </div>
                                  <Badge className={getVerifyStatusColor(edu.verified)}>
                                    {getVerifyStatusText(edu.verified)}
                                  </Badge>
                                </div>
                                {edu.certificateUrl && (
                                  <div className="relative group cursor-zoom-in" onClick={() => setPreviewImage(edu.certificateUrl ?? null)}>
                                    <img
                                      src={edu.certificateUrl}
                                      alt="Bằng cấp"
                                      className="w-full max-h-64 object-cover rounded-lg border"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center">
                                      <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                                    </div>
                                  </div>
                                )}
                                {edu.certificateUrl && (
                                  <a
                                    href={edu.certificateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-[#257180] hover:underline flex items-center gap-1"
                                  >
                                    <FileText className="h-4 w-4" />
                                    Xem bằng cấp
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                                {edu.verified === VerifyStatus.Rejected && edu.rejectReason && (
                                  <div className="p-2 bg-red-50 rounded text-sm text-red-800">
                                    <p className="font-medium">Lý do từ chối:</p>
                                    <p>{edu.rejectReason}</p>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500">Chưa có thông tin học vấn.</p>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-300">
                        <CardHeader>
                          <CardTitle className="font-bold">Chứng chỉ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {detailTutor.certificates.length > 0 ? (
                            detailTutor.certificates.map((cert) => (
                              <div key={cert.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {cert.certificateType?.name || 'Chưa có tên'}
                                    </p>
                                    {cert.issueDate && (
                                      <p className="text-sm text-gray-600">
                                        Cấp ngày: {new Date(cert.issueDate).toLocaleDateString('vi-VN')}
                                      </p>
                                    )}
                                  </div>
                                  <Badge className={getVerifyStatusColor(cert.verified)}>
                                    {getVerifyStatusText(cert.verified)}
                                  </Badge>
                                </div>
                                {cert.certificateUrl && (
                                  <div className="relative group cursor-zoom-in" onClick={() => setPreviewImage(cert.certificateUrl ?? null)}>
                                    <img
                                      src={cert.certificateUrl}
                                      alt="Chứng chỉ"
                                      className="w-full max-h-64 object-cover rounded-lg border"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center">
                                      <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                                    </div>
                                  </div>
                                )}
                                {cert.certificateUrl && (
                                  <a
                                    href={cert.certificateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-[#257180] hover:underline flex items-center gap-1"
                                  >
                                    <FileText className="h-4 w-4" />
                                    Xem chứng chỉ
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                                {cert.verified === VerifyStatus.Rejected && cert.rejectReason && (
                                  <div className="p-2 bg-red-50 rounded text-sm text-red-800">
                                    <p className="font-medium">Lý do từ chối:</p>
                                    <p>{cert.rejectReason}</p>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500">Chưa có thông tin chứng chỉ.</p>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="availability" className="space-y-6">
                      {detailTutor.availabilities.length > 0 ? (
                        <Card className="border border-gray-300">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-bold">
                              <Calendar className="h-5 w-5 text-[#257180]" />
                              Lịch khả dụng 4 tuần tới
                            </CardTitle>
                            <p className="text-xs text-gray-500 mt-1">Click để xem chi tiết từng tuần</p>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {groupAvailabilitiesByWeek(detailTutor.availabilities, 4).map((week) => {
                              const isExpanded = expandedWeeks.has(week.weekOffset);
                              
                              return (
                                <div key={week.weekOffset} className="border border-gray-300 rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => {
                                      const newExpanded = new Set(expandedWeeks);
                                      if (isExpanded) {
                                        newExpanded.delete(week.weekOffset);
                                      } else {
                                        newExpanded.add(week.weekOffset);
                                      }
                                      setExpandedWeeks(newExpanded);
                                    }}
                                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                  >
                                    <div className="flex items-center gap-2">
                                      {isExpanded ? (
                                        <ChevronUp className="h-4 w-4 text-gray-500" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                      )}
                                      <div className="text-left">
                                        <p className="text-sm font-medium text-gray-900">
                                          {week.weekStart.getDate()}/{week.weekStart.getMonth() + 1} - {week.weekEnd.getDate()}/{week.weekEnd.getMonth() + 1}/{week.weekEnd.getFullYear()}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {week.weekDays.length} ngày
                                        </p>
                                      </div>
                                    </div>
                                  </button>
                                  
                                  {isExpanded && (
                                    <div className="p-3 space-y-2 border-t border-[#257180]/20 bg-white">
                                      {week.weekDays.map((dayInfo, idx) => (
                                        <div key={idx} className="space-y-1.5">
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">
                                              {dayInfo.day}, {dayInfo.date.getDate()}/{dayInfo.date.getMonth() + 1}
                                            </span>
                                          </div>
                                          <div className="flex flex-wrap gap-1.5">
                                            {dayInfo.slots.map((slot, slotIdx) => (
                                              <div
                                                key={slotIdx}
                                                className="text-xs bg-gray-50 text-gray-700 border border-gray-300 rounded px-2 py-1 flex items-center gap-1"
                                              >
                                                <Clock className="h-3 w-3 text-[#257180]" />
                                                {slot}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </CardContent>
                        </Card>
                      ) : (
                        <Card className="border border-gray-300">
                          <CardContent className="p-6">
                            <p className="text-gray-500 text-center">Chưa cập nhật lịch khả dụng.</p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="lg:col-span-1 space-y-6">

                  <Card className="border border-gray-300">
                    <CardHeader>
                      <CardTitle className="text-base font-bold">Thông tin nhanh</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium truncate">{detailTutor.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Số điện thoại:</span>
                          <span className="font-medium">{detailTutor.phone || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Môn học:</span>
                          <span className="font-medium">{detailTutor.subjects.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Chứng chỉ:</span>
                          <span className="font-medium">{detailTutor.certificates.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hình thức:</span>
                          <span className="font-medium truncate">{getTeachingModeText(detailTutor.teachingModes)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Không tìm thấy thông tin gia sư</div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl bg-transparent border-gray-300 shadow-lg p-0" aria-describedby={undefined}>
          {previewImage && (
            <div className="relative">
              <img src={previewImage} alt="Preview" className="w-full max-h-[80vh] object-contain rounded-lg bg-white" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

