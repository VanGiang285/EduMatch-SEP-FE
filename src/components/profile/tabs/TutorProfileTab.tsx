"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Textarea } from '@/components/ui/form/textarea';
import { Badge } from '@/components/ui/basic/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/form/radio-group';
import { Checkbox } from '@/components/ui/form/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { Separator } from '@/components/ui/layout/separator';
import { Alert, AlertDescription } from '@/components/ui/feedback/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/feedback/dialog';
import { 
  Upload, 
  User,
  Star,
  MapPin,
  Edit3,
  Save,
  X,
  Info,
  GraduationCap,
  FileText,
  Video,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  Loader2,
  MessageCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChatContext } from '@/contexts/ChatContext';
import { TutorService, CertificateService, SubjectService } from '@/services';
import { MasterDataService } from '@/services/masterDataService';
import { AvailabilityService } from '@/services/availabilityService';
import { MediaService } from '@/services/mediaService';
import { UserProfileService } from '@/services/userProfileService';
import { LocationService, ProvinceDto, SubDistrictDto } from '@/services/locationService';
import { useCustomToast } from '@/hooks/useCustomToast';
import { TutorProfileDto, TutorEducationDto, TutorCertificateDto, TutorSubjectDto, TutorAvailabilityDto } from '@/types/backend';
import { TutorProfileUpdateRequest, TutorEducationCreateRequest, TutorCertificateCreateRequest, TutorSubjectCreateRequest, TutorEducationUpdateRequest, TutorCertificateUpdateRequest, TutorSubjectUpdateRequest, TutorAvailabilityCreateRequest } from '@/types/requests';
import { TeachingMode, VerifyStatus, EnumHelpers, TutorAvailabilityStatus, DayOfWeekEnum, MediaType } from '@/types/enums';

// Types dựa trên database schema
interface TutorEducation {
  id: number;
  institutionId: number;
  institutionName: string;
  institutionType: number; // 0=Trung cấp, 1=CĐ, 2=ĐH, 3=Khác
  issueDate: string;
  certificateUrl?: string;
  verified: number; // 0=Chờ duyệt, 1=Đã xác minh, 2=Bị từ chối
  rejectReason?: string;
}

interface TutorCertificate {
  id: number;
  certificateTypeId: number;
  certificateName: string;
  subjectName?: string;
  issueDate: string;
  expiryDate?: string;
  certificateUrl?: string;
  verified: number; // 0=Chờ duyệt, 1=Đã xác minh, 2=Bị từ chối
  rejectReason?: string;
}

interface TutorSubject {
  id: number;
  subjectId: number;
  subjectName: string;
  levelId?: number;
  levelName?: string;
  hourlyRate: number;
}

export function TutorProfileTab() {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, showWarning } = useCustomToast();
  const { openChatWithTutor } = useChatContext();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCertificate, setIsUploadingCertificate] = useState(false);
  const [isUploadingEducation, setIsUploadingEducation] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [tutorProfile, setTutorProfile] = useState<TutorProfileDto | null>(null);
  const [tutorId, setTutorId] = useState<number | null>(null);
  
  const handleOpenChat = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      showWarning(
        'Vui lòng đăng nhập',
        'Bạn cần đăng nhập để nhắn tin với gia sư.'
      );
      router.push('/login');
      return;
    }

    if (!tutorId || !tutorProfile?.userEmail) {
      return;
    }

    await openChatWithTutor(
      tutorId,
      tutorProfile.userEmail || "",
      tutorProfile.userName,
      tutorProfile.avatarUrl
    );
  };

  const [provinces, setProvinces] = useState<ProvinceDto[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrictDto[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  
  // Modal states
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingEducation, setEditingEducation] = useState<TutorEducationDto | null>(null);
  const [editingCertificate, setEditingCertificate] = useState<TutorCertificateDto | null>(null);
  const [editingSubject, setEditingSubject] = useState<TutorSubjectDto | null>(null);
  
  const [profileData, setProfileData] = useState({
    // Thông tin cơ bản từ user_profiles
    basic: {
      firstName: 'Minh',
      lastName: 'Nguyễn Thị',
      email: 'minh.nguyen@email.com',
      phone: '0901234567',
      dob: '1990-05-15',
      gender: 2, // 0=Không xác định, 1=Nam, 2=Nữ
      cityId: 1,
      cityName: 'Hà Nội',
      subDistrictId: 1,
      subDistrictName: 'Quận Ba Đình',
      addressLine: 'Số 123, Đường ABC',
      avatarUrl: '',
    },
    // Thông tin gia sư từ tutor_profiles
    tutorProfile: {
      bio: 'Tôi là một gia sư toán học đam mê với hơn 5 năm kinh nghiệm giúp học sinh đạt được mục tiêu học tập. Tôi chuyên biến những khái niệm toán học phức tạp thành dễ hiểu thông qua các ví dụ thực tế và phương pháp học tương tác.',
      teachingExp: 'Với 5 năm kinh nghiệm giảng dạy, tôi đã giúp hơn 200 học sinh cải thiện điểm số toán. Phương pháp của tôi tập trung vào việc xây dựng nền tảng vững chắc và áp dụng kiến thức vào thực tế.',
      videoIntroUrl: 'https://youtube.com/watch?v=sample123',
      teachingModes: TeachingMode.Offline, // 0=Offline, 1=Online, 2=Hybrid
      status: 1, // 0=Chờ duyệt, 1=Đã duyệt, 2=Bị từ chối
    },
    // Học vấn từ tutor_education
    educations: [
      {
        id: 1,
        institutionId: 1,
        institutionName: 'Đại học Quốc gia Hà Nội',
        institutionType: 2, // ĐH
        issueDate: '2020-06-15',
        verified: 1,
      },
      {
        id: 2,
        institutionId: 2,
        institutionName: 'Đại học Bách Khoa Hà Nội',
        institutionType: 2,
        issueDate: '2018-06-15',
        verified: 1,
      }
    ] as TutorEducation[],
    // Chứng chỉ từ tutor_certificates
    certificates: [
      {
        id: 1,
        certificateTypeId: 1,
        certificateName: 'Chứng chỉ giảng dạy quốc tế TESOL',
        subjectName: 'Tiếng Anh',
        issueDate: '2019-08-20',
        expiryDate: '2024-08-20',
        verified: 1,
      },
      {
        id: 2,
        certificateTypeId: 2,
        certificateName: 'Chứng chỉ Giáo viên dạy giỏi',
        issueDate: '2021-03-10',
        verified: 1,
      }
    ] as TutorCertificate[],
    // Môn học từ tutor_subjects
    subjects: [
      {
        id: 1,
        subjectId: 1,
        subjectName: 'Toán học',
        levelId: 10,
        levelName: 'Lớp 10',
        hourlyRate: 200000,
      },
      {
        id: 2,
        subjectId: 1,
        subjectName: 'Toán học',
        levelId: 8,
        levelName: 'Lớp 8',
        hourlyRate: 150000,
      }
    ] as TutorSubject[],
    // Lịch khả dụng từ tutor_availabilities (array of TutorAvailabilityDto)
    availabilities: [] as TutorAvailabilityDto[],
  });

  // Form states for modals
  // Master data states
  const [masterData, setMasterData] = useState({
    institutions: [] as any[],
    certificateTypes: [] as any[],
    subjects: [] as any[],
    levels: [] as any[],
    timeSlots: [] as any[],
    isLoading: false,
  });

  const [newEducation, setNewEducation] = useState({
    institutionId: 0,
    issueDate: '',
    certificateUrl: '',
    certificateFile: null as File | null,
  });

  const [newCertificate, setNewCertificate] = useState({
    certificateTypeId: 0,
    certificateName: '',
    issueDate: '',
    expiryDate: '',
    certificateUrl: '',
    certificateFile: null as File | null,
  });

  const [newSubject, setNewSubject] = useState({
    subjectId: 0,
    subjectName: '',
    selectedLevels: [] as number[],
    hourlyRate: '',
  });

  const [newTimeSlot, setNewTimeSlot] = useState({
    dayOfWeek: DayOfWeekEnum.Monday.toString(),
    slotId: 0,
    startDate: '', // ISO date string for the specific date
  });

  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  
  // Pending changes (certificates, educations, subjects to be created/deleted when saving)
  const [pendingCertificates, setPendingCertificates] = useState<{
    toCreate: Array<{ certificateTypeId: number; issueDate?: string; expiryDate?: string; certificateUrl: string; certificateFile: File }>;
    toDelete: number[];
  }>({ toCreate: [], toDelete: [] });
  
  const [pendingEducations, setPendingEducations] = useState<{
    toCreate: Array<{ institutionId: number; issueDate?: string; certificateEducationUrl: string; certificateFile: File }>;
    toDelete: number[];
  }>({ toCreate: [], toDelete: [] });
  
  const [pendingSubjects, setPendingSubjects] = useState<{
    toCreate: Array<{ subjectId: number; levelId: number; hourlyRate: number }>;
    toDelete: number[];
  }>({ toCreate: [], toDelete: [] });
  
  // Calendar view state for availability
  const [availabilityCalendar, setAvailabilityCalendar] = useState({
    currentWeek: 0,
    startDate: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    })(),
    endDate: (() => {
      const date = new Date();
      date.setDate(date.getDate() + 31);
      return date.toISOString().split('T')[0];
    })(),
    schedule: {} as Record<string, Record<string, number[]>>,
    originalSchedule: {} as Record<string, Record<string, number[]>>,
  });

  // Load master data
  useEffect(() => {
    const loadMasterData = async () => {
      setMasterData(prev => ({ ...prev, isLoading: true }));
      try {
        const [institutionsRes, certificateTypesRes, subjectsRes, levelsRes, timeSlotsRes] = await Promise.all([
          CertificateService.getAllInstitutions(),
          CertificateService.getAllCertificateTypesWithSubjects(),
          SubjectService.getAllSubjects(),
          CertificateService.getAllLevels(),
          MasterDataService.getAllTimeSlots(),
        ]);

        console.log('Loaded timeSlots:', timeSlotsRes.success ? timeSlotsRes.data : 'Failed');

        setMasterData({
          institutions: institutionsRes.success ? institutionsRes.data || [] : [],
          certificateTypes: certificateTypesRes.success ? certificateTypesRes.data || [] : [],
          subjects: subjectsRes.success ? subjectsRes.data || [] : [],
          levels: levelsRes.success ? levelsRes.data || [] : [],
          timeSlots: timeSlotsRes.success ? timeSlotsRes.data || [] : [],
          isLoading: false,
        });
      } catch (error) {
        console.error('Error loading master data:', error);
        setMasterData(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadMasterData();
  }, []);

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      setIsLoadingLocations(true);
      try {
        const response = await LocationService.getAllProvinces();
        if (response.success && response.data) {
          setProvinces(response.data);
        }
      } catch (error) {
        console.error('Error loading provinces:', error);
      } finally {
        setIsLoadingLocations(false);
      }
    };
    loadProvinces();
  }, []);

  // Load sub-districts when cityId changes
  useEffect(() => {
    const loadSubDistricts = async () => {
      if (!profileData.basic.cityId || profileData.basic.cityId === 0) {
        setSubDistricts([]);
        return;
      }
      
      const provinceId = profileData.basic.cityId;
      if (provinceId <= 0) {
        setSubDistricts([]);
        return;
      }

      setIsLoadingLocations(true);
      try {
        const response = await LocationService.getSubDistrictsByProvinceId(provinceId);
        if (response.success && response.data) {
          setSubDistricts(response.data);
        } else {
          setSubDistricts([]);
        }
      } catch (error) {
        console.error('Error loading sub-districts:', error);
        setSubDistricts([]);
      } finally {
        setIsLoadingLocations(false);
      }
    };
    loadSubDistricts();
  }, [profileData.basic.cityId]);

  const institutionTypes = [
    { value: 0, label: 'Trung cấp' },
    { value: 1, label: 'Cao đẳng' },
    { value: 2, label: 'Đại học' },
    { value: 3, label: 'Khác' },
  ];

  const genders = [
    { value: 0, label: 'Không xác định' },
    { value: 1, label: 'Nam' },
    { value: 2, label: 'Nữ' },
    { value: 3, label: 'Giới tính khác' },
  ];

  const verifyStatusColors = (status: number | string | VerifyStatus) => {
    const parsedStatus = EnumHelpers.parseVerifyStatus(status);
    switch(parsedStatus) {
      case VerifyStatus.Pending: return 'bg-yellow-100 text-yellow-800';
      case VerifyStatus.Verified: return 'bg-green-100 text-green-800';
      case VerifyStatus.Rejected: return 'bg-red-100 text-red-800';
      case VerifyStatus.Expired: return 'bg-orange-100 text-orange-800';
      case VerifyStatus.Removed: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const verifyStatusText = (status: number | string | VerifyStatus) => {
    return EnumHelpers.getVerifyStatusLabel(status);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + '₫';
  };

  // Helper function to check if URL is YouTube
  const isYouTubeUrl = (url: string): boolean => {
    if (!url) return false;
    return /youtube\.com|youtu\.be/.test(url);
  };

  // Helper function to check if URL is Cloudinary
  const isCloudinaryUrl = (url: string): boolean => {
    if (!url) return false;
    return /cloudinary\.com|res\.cloudinary\.com/.test(url);
  };

  // Helper function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  // Helper function to get YouTube embed URL
  const getYouTubeEmbedUrl = (url: string): string | null => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  };

  // Load tutor profile từ email
  useEffect(() => {
    const loadTutorProfile = async () => {
      if (!user?.email) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await TutorService.getTutorByEmail(user.email);
        if (response.success && response.data) {
          const profile = response.data;
          setTutorProfile(profile);
          setTutorId(profile.id);
          
          // Map data từ TutorProfileDto vào profileData
          const educations: TutorEducation[] = (profile.tutorEducations || []).map((edu) => ({
            id: edu.id,
            institutionId: edu.institutionId,
            institutionName: edu.institution?.name || '',
            institutionType: edu.institution?.institutionType || 0,
            issueDate: edu.issueDate || '',
            certificateUrl: edu.certificateUrl,
            verified: edu.verified,
            rejectReason: edu.rejectReason,
          }));

          const certificates: TutorCertificate[] = (profile.tutorCertificates || []).map((cert) => ({
            id: cert.id,
            certificateTypeId: cert.certificateTypeId,
            certificateName: cert.certificateType?.name || '',
            subjectName: cert.certificateType?.subjects?.[0]?.subjectName,
            issueDate: cert.issueDate || '',
            expiryDate: cert.expiryDate,
            certificateUrl: cert.certificateUrl,
            verified: cert.verified,
            rejectReason: cert.rejectReason,
          }));

          const subjects: TutorSubject[] = (profile.tutorSubjects || []).map((subj) => ({
            id: subj.id,
            subjectId: subj.subjectId,
            subjectName: subj.subject?.subjectName || '',
            levelId: subj.levelId,
            levelName: subj.level?.name || '',
            hourlyRate: subj.hourlyRate || 0,
          }));

          // Load availabilities from tutorProfile
          const availabilities: TutorAvailabilityDto[] = profile.tutorAvailabilities || [];

          setProfileData(prev => ({
            ...prev,
            basic: {
              firstName: profile.userName?.split(' ').slice(0, -1).join(' ') || '',
              lastName: profile.userName?.split(' ').slice(-1)[0] || '',
              email: profile.userEmail,
              phone: profile.phone || '',
              dob: profile.dob || '',
              gender: profile.gender || 0,
              cityId: profile.province?.id || 0,
              cityName: profile.province?.name || '',
              subDistrictId: profile.subDistrict?.id || 0,
              subDistrictName: profile.subDistrict?.name || '',
              addressLine: profile.addressLine || '',
              avatarUrl: profile.avatarUrl || '',
            },
            tutorProfile: {
              bio: profile.bio || '',
              teachingExp: profile.teachingExp || '',
              videoIntroUrl: profile.videoIntroUrl || '',
              teachingModes: profile.teachingModes ?? TeachingMode.Offline, // Default to Offline if undefined
              status: profile.status,
            },
            educations,
            certificates,
            subjects,
            availabilities,
          }));

          // Convert availabilities to schedule format for calendar view
          const schedule: Record<string, Record<string, number[]>> = {};
          availabilities.forEach((av) => {
            if (av.slot?.id && av.startDate) {
              const dateKey = av.startDate.split('T')[0];
              const dayOfWeek = av.slot.dayOfWeek;
              const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek] || 'monday';
              
              if (!schedule[dateKey]) {
                schedule[dateKey] = {};
              }
              if (!schedule[dateKey][dayKey]) {
                schedule[dateKey][dayKey] = [];
              }
              if (!schedule[dateKey][dayKey].includes(av.slot.id)) {
                schedule[dateKey][dayKey].push(av.slot.id);
              }
            }
          });
          const originalSchedule = JSON.parse(JSON.stringify(schedule));
          setAvailabilityCalendar(prev => ({ ...prev, schedule, originalSchedule }));
        } else {
          // Không có tutor profile - có thể chưa đăng ký làm gia sư
          showError('Thông báo', 'Bạn chưa có hồ sơ gia sư. Vui lòng đăng ký làm gia sư trước.');
        }
      } catch (error: any) {
        console.error('Error loading tutor profile:', error);
        if (error.status === 404) {
          showError('Thông báo', 'Bạn chưa có hồ sơ gia sư. Vui lòng đăng ký làm gia sư trước.');
        } else {
          showError('Lỗi', 'Không thể tải thông tin hồ sơ gia sư. Vui lòng thử lại.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTutorProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const handleSave = async () => {
    if (!tutorId || !tutorProfile) {
      showError('Lỗi', 'Không tìm thấy thông tin gia sư.');
      return;
    }

    setIsSaving(true);
    try {
      // Combine firstName and lastName for userName
      const userName = `${profileData.basic.firstName} ${profileData.basic.lastName}`.trim();
      
      // Get required fields with fallback to tutorProfile values
      const phone = profileData.basic.phone || tutorProfile.phone || '';
      const finalUserName = userName || tutorProfile.userName || '';
      const userEmail = profileData.basic.email || tutorProfile.userEmail || '';
      const dateOfBirth = profileData.basic.dob || tutorProfile.dob || '';
      
      // Validate required fields
      if (!phone) {
        showError('Lỗi', 'Vui lòng nhập số điện thoại.');
        setIsSaving(false);
        return;
      }
      if (!finalUserName) {
        showError('Lỗi', 'Vui lòng nhập họ và tên.');
        setIsSaving(false);
        return;
      }
      if (!userEmail) {
        showError('Lỗi', 'Email không được để trống.');
        setIsSaving(false);
        return;
      }
      if (!dateOfBirth) {
        showError('Lỗi', 'Vui lòng nhập ngày sinh.');
        setIsSaving(false);
        return;
      }
      
      const updateRequest: TutorProfileUpdateRequest = {
        id: tutorId,
        phone: phone,
        userName: finalUserName,
        userEmail: userEmail,
        dateOfBirth: dateOfBirth,
        bio: profileData.tutorProfile.bio,
        teachingExp: profileData.tutorProfile.teachingExp,
        videoIntroUrl: profileData.tutorProfile.videoIntroUrl,
        teachingModes: profileData.tutorProfile.teachingModes,
        provinceId: profileData.basic.cityId && profileData.basic.cityId > 0 ? profileData.basic.cityId : undefined,
        subDistrictId: profileData.basic.subDistrictId && profileData.basic.subDistrictId > 0 ? profileData.basic.subDistrictId : undefined,
      };

      const response = await TutorService.updateTutorProfile(updateRequest);
      if (response.success) {
        const originalSchedule = availabilityCalendar.originalSchedule;
        const currentSchedule = availabilityCalendar.schedule;
        
        const availabilitiesToDelete: number[] = [];
        const availabilitiesToCreate: TutorAvailabilityCreateRequest[] = [];
        
        const existingAvailabilityMap = new Map<string, TutorAvailabilityDto>();
        profileData.availabilities.forEach(av => {
          if (av.slot?.id && av.startDate) {
            const dateKey = av.startDate.split('T')[0];
            const key = `${dateKey}-${av.slot.id}`;
            existingAvailabilityMap.set(key, av);
          }
        });
        
        const allDateKeys = new Set([
          ...Object.keys(originalSchedule),
          ...Object.keys(currentSchedule)
        ]);
        
        allDateKeys.forEach(dateKey => {
          const originalDays = originalSchedule[dateKey] || {};
          const currentDays = currentSchedule[dateKey] || {};
          const allDays = new Set([
            ...Object.keys(originalDays),
            ...Object.keys(currentDays)
          ]);
          
          allDays.forEach(dayKey => {
            const originalSlots = originalDays[dayKey] || [];
            const currentSlots = currentDays[dayKey] || [];
            
            const slotsToDelete = originalSlots.filter(id => !currentSlots.includes(id));
            const slotsToAdd = currentSlots.filter(id => !originalSlots.includes(id));
            
            slotsToDelete.forEach(slotId => {
              const key = `${dateKey}-${slotId}`;
              const availability = existingAvailabilityMap.get(key);
              if (availability && (availability.status === TutorAvailabilityStatus.Available || availability.status === TutorAvailabilityStatus.Booked)) {
                availabilitiesToDelete.push(availability.id);
              }
            });
            
            slotsToAdd.forEach(slotId => {
              const slot = masterData.timeSlots.find(s => s.id === slotId);
              if (slot) {
                const key = `${dateKey}-${slotId}`;
                const existingAvailability = existingAvailabilityMap.get(key);
                if (!existingAvailability) {
                  const timeParts = slot.startTime.split(':');
                  let startTimeFormatted: string;
                  if (timeParts.length >= 3) {
                    startTimeFormatted = `${timeParts[0]}:${timeParts[1]}:${timeParts[2]}`;
                  } else if (timeParts.length === 2) {
                    startTimeFormatted = `${timeParts[0]}:${timeParts[1]}:00`;
                  } else {
                    startTimeFormatted = slot.startTime + ':00';
                  }
                  const startDateTime = `${dateKey}T${startTimeFormatted}`;
                  availabilitiesToCreate.push({
                    tutorId: tutorId,
                    slotId: slotId,
                    startDate: startDateTime,
                  });
                }
              }
            });
          });
        });
        
        if (availabilitiesToDelete.length > 0) {
          await AvailabilityService.deleteAvailabilities(availabilitiesToDelete);
        }
        
        if (availabilitiesToCreate.length > 0) {
          await AvailabilityService.createAvailabilities(availabilitiesToCreate);
        }
        
        if (pendingCertificates.toDelete.length > 0) {
          await Promise.all(
            pendingCertificates.toDelete.map(id => 
              CertificateService.deleteTutorCertificate(tutorId, id)
            )
          );
        }
        
        if (pendingCertificates.toCreate.length > 0 && user?.email) {
          for (const cert of pendingCertificates.toCreate) {
            try {
              const uploadResponse = await MediaService.uploadFile({
                file: cert.certificateFile,
                ownerEmail: user.email,
                mediaType: 'Image' as MediaType,
              });
              
              if (uploadResponse.success && uploadResponse.data) {
                const uploadData = uploadResponse.data as any;
                const certificateUrl = uploadData?.data?.secureUrl || uploadData?.data?.originalUrl || uploadData?.secureUrl || uploadData?.originalUrl;
                
                if (certificateUrl) {
                  const request: Omit<TutorCertificateCreateRequest, 'tutorId'> = {
                    certificateTypeId: cert.certificateTypeId,
                    issueDate: cert.issueDate || undefined,
                    expiryDate: cert.expiryDate || undefined,
                    certificateUrl: certificateUrl,
                  };
                  await CertificateService.createTutorCertificate(tutorId, request);
                }
              }
            } catch (error) {
              console.error('Error creating certificate:', error);
            }
          }
        }
        
        if (pendingEducations.toDelete.length > 0) {
          await Promise.all(
            pendingEducations.toDelete.map(id => 
              CertificateService.deleteTutorEducation(tutorId, id)
            )
          );
        }
        
        if (pendingEducations.toCreate.length > 0 && user?.email) {
          for (const edu of pendingEducations.toCreate) {
            try {
              const uploadResponse = await MediaService.uploadFile({
                file: edu.certificateFile,
                ownerEmail: user.email,
                mediaType: 'Image' as MediaType,
              });
              
              if (uploadResponse.success && uploadResponse.data) {
                const uploadData = uploadResponse.data as any;
                const certificateUrl = uploadData?.data?.secureUrl || uploadData?.data?.originalUrl || uploadData?.secureUrl || uploadData?.originalUrl;
                
                if (certificateUrl) {
                  const request: Omit<TutorEducationCreateRequest, 'tutorId'> = {
                    institutionId: edu.institutionId,
                    issueDate: edu.issueDate || undefined,
                    certificateEducationUrl: certificateUrl,
                  };
                  await CertificateService.createTutorEducation(tutorId, request);
                }
              }
            } catch (error) {
              console.error('Error creating education:', error);
            }
          }
        }
        
        if (pendingSubjects.toDelete.length > 0) {
          await Promise.all(
            pendingSubjects.toDelete.map(id => 
              SubjectService.deleteTutorSubject(tutorId, id)
            )
          );
        }
        
        if (pendingSubjects.toCreate.length > 0) {
          await Promise.all(
            pendingSubjects.toCreate.map(request => 
              SubjectService.createTutorSubject(tutorId, request)
            )
          );
        }
        
        setPendingCertificates({ toCreate: [], toDelete: [] });
        setPendingEducations({ toCreate: [], toDelete: [] });
        setPendingSubjects({ toCreate: [], toDelete: [] });
        
        setIsEditing(false);
        setSaveSuccess(true);
        showSuccess('Thành công', 'Cập nhật hồ sơ gia sư thành công.');
        setTimeout(() => setSaveSuccess(false), 3000);
        
        await reloadTutorProfile();
      } else {
        showError('Lỗi', response.message || 'Không thể cập nhật hồ sơ gia sư.');
      }
    } catch (error: any) {
      console.error('Error updating tutor profile:', error);
      showError('Lỗi', 'Không thể cập nhật hồ sơ gia sư. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfileData = (section: string, data: any) => {
    setProfileData(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], ...data }
    }));
  };

  // Helper function to reload tutor profile
  const reloadTutorProfile = async () => {
    if (!user?.email) return;

    try {
      const response = await TutorService.getTutorByEmail(user.email);
      if (response.success && response.data) {
        const profile = response.data;
        setTutorProfile(profile);
        setTutorId(profile.id);
        
        const educations: TutorEducation[] = (profile.tutorEducations || []).map((edu) => ({
          id: edu.id,
          institutionId: edu.institutionId,
          institutionName: edu.institution?.name || '',
          institutionType: edu.institution?.institutionType || 0,
          issueDate: edu.issueDate || '',
          certificateUrl: edu.certificateUrl,
          verified: edu.verified,
          rejectReason: edu.rejectReason,
        }));

        const certificates: TutorCertificate[] = (profile.tutorCertificates || []).map((cert) => ({
          id: cert.id,
          certificateTypeId: cert.certificateTypeId,
          certificateName: cert.certificateType?.name || '',
          subjectName: cert.certificateType?.subjects?.[0]?.subjectName,
          issueDate: cert.issueDate || '',
          expiryDate: cert.expiryDate,
          certificateUrl: cert.certificateUrl,
          verified: cert.verified,
          rejectReason: cert.rejectReason,
        }));

          const subjects: TutorSubject[] = (profile.tutorSubjects || []).map((subj) => ({
            id: subj.id,
            subjectId: subj.subjectId,
            subjectName: subj.subject?.subjectName || '',
            levelId: subj.levelId,
            levelName: subj.level?.name || '',
            hourlyRate: subj.hourlyRate || 0,
          }));

          // Load availabilities from tutorProfile
          const availabilities: TutorAvailabilityDto[] = profile.tutorAvailabilities || [];

    setProfileData(prev => ({
      ...prev,
          tutorProfile: {
            bio: profile.bio || '',
            teachingExp: profile.teachingExp || '',
            videoIntroUrl: profile.videoIntroUrl || '',
            teachingModes: profile.teachingModes ?? TeachingMode.Offline, // Default to Offline if undefined
            status: profile.status,
          },
          educations,
          certificates,
          subjects,
          availabilities,
        }));
      }
    } catch (error) {
      console.error('Error reloading tutor profile:', error);
    }
  };

  // Handlers for education
  const handleAddEducation = async () => {
    if (!tutorId || tutorId <= 0) {
      showError('Lỗi', 'Không tìm thấy thông tin gia sư.');
      return;
    }

    if (!newEducation.institutionId) {
      showError('Lỗi', 'Vui lòng chọn trường học.');
      return;
    }

    if (!newEducation.certificateFile) {
      showError('Lỗi', 'Vui lòng tải lên bằng cấp (PDF, JPG, PNG).');
      return;
    }

    if (!user?.email) {
      showError('Lỗi', 'Không tìm thấy thông tin người dùng.');
      return;
    }

    if (isEditing) {
      setPendingEducations(prev => ({
        ...prev,
        toCreate: [...prev.toCreate, {
          institutionId: newEducation.institutionId,
          issueDate: newEducation.issueDate || undefined,
          certificateEducationUrl: '',
          certificateFile: newEducation.certificateFile!,
        }]
      }));
      showSuccess('Thành công', 'Học vấn đã được thêm vào danh sách. Nhấn "Lưu thay đổi" để lưu.');
      setShowEducationModal(false);
      setNewEducation({
        institutionId: 0,
        issueDate: '',
        certificateUrl: '',
        certificateFile: null,
      });
      return;
    }

    setIsUploadingEducation(true);
    try {
      const uploadResponse = await MediaService.uploadFile({
        file: newEducation.certificateFile,
        ownerEmail: user.email,
        mediaType: 'Image' as MediaType,
      });

      if (!uploadResponse.success || !uploadResponse.data) {
        showError('Lỗi', uploadResponse.message || 'Không thể upload file. Vui lòng thử lại.');
        setIsUploadingEducation(false);
        return;
      }

      const uploadData = uploadResponse.data as any;
      const certificateUrl = uploadData?.data?.secureUrl || uploadData?.data?.originalUrl || uploadData?.secureUrl || uploadData?.originalUrl;
      
      if (!certificateUrl) {
        console.error('Cannot extract URL from upload response:', uploadResponse);
        showError('Lỗi', 'Không thể lấy URL file sau khi upload.');
        setIsUploadingEducation(false);
        return;
      }

      const request: Omit<TutorEducationCreateRequest, 'tutorId'> = {
        institutionId: newEducation.institutionId,
        issueDate: newEducation.issueDate || undefined,
        certificateEducationUrl: certificateUrl,
      };

      const response = await CertificateService.createTutorEducation(tutorId, request);
      if (response.success && response.data) {
        showSuccess('Thành công', 'Thêm học vấn thành công.');
        setShowEducationModal(false);
        setNewEducation({
          institutionId: 0,
          issueDate: '',
          certificateUrl: '',
          certificateFile: null,
        });
        await reloadTutorProfile();
      } else {
        showError('Lỗi', response.message || 'Không thể thêm học vấn.');
      }
    } catch (error: any) {
      console.error('Error adding education:', error);
      showError('Lỗi', error.message || 'Không thể thêm học vấn. Vui lòng thử lại.');
    } finally {
      setIsUploadingEducation(false);
    }
  };

  const handleDeleteEducation = async (id: number) => {
    if (!tutorId) {
      showError('Lỗi', 'Không tìm thấy thông tin gia sư.');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn xóa học vấn này?')) {
      return;
    }

    if (isEditing) {
      setPendingEducations(prev => ({
        ...prev,
        toDelete: [...prev.toDelete, id]
      }));
      setProfileData(prev => ({
        ...prev,
        educations: prev.educations.filter(e => e.id !== id)
      }));
      showSuccess('Thành công', 'Học vấn đã được đánh dấu xóa. Nhấn "Lưu thay đổi" để xác nhận.');
      return;
    }

    try {
      const response = await CertificateService.deleteTutorEducation(tutorId, id);
      if (response.success) {
        showSuccess('Thành công', 'Xóa học vấn thành công.');
        await reloadTutorProfile();
      } else {
        showError('Lỗi', response.message || 'Không thể xóa học vấn.');
      }
    } catch (error: any) {
      console.error('Error deleting education:', error);
      showError('Lỗi', 'Không thể xóa học vấn. Vui lòng thử lại.');
    }
  };

  // Handlers for certificate
  const handleAddCertificate = async () => {
    if (!tutorId || tutorId <= 0) {
      showError('Lỗi', 'Không tìm thấy thông tin gia sư.');
      return;
    }

    if (!newCertificate.certificateTypeId) {
      showError('Lỗi', 'Vui lòng chọn loại chứng chỉ.');
      return;
    }

    if (!newCertificate.certificateFile) {
      showError('Lỗi', 'Vui lòng tải lên chứng chỉ (PDF, JPG, PNG).');
      return;
    }

    if (!user?.email) {
      showError('Lỗi', 'Không tìm thấy thông tin người dùng.');
      return;
    }

    if (isEditing) {
      setPendingCertificates(prev => ({
        ...prev,
        toCreate: [...prev.toCreate, {
          certificateTypeId: newCertificate.certificateTypeId,
          issueDate: newCertificate.issueDate || undefined,
          expiryDate: newCertificate.expiryDate || undefined,
          certificateUrl: '',
          certificateFile: newCertificate.certificateFile!,
        }]
      }));
      showSuccess('Thành công', 'Chứng chỉ đã được thêm vào danh sách. Nhấn "Lưu thay đổi" để lưu.');
      setShowCertificateModal(false);
      setNewCertificate({
        certificateTypeId: 0,
        certificateName: '',
        issueDate: '',
        expiryDate: '',
        certificateUrl: '',
        certificateFile: null,
      });
      return;
    }

    setIsUploadingCertificate(true);
    try {
      const uploadResponse = await MediaService.uploadFile({
        file: newCertificate.certificateFile,
        ownerEmail: user.email,
        mediaType: 'Image' as MediaType,
      });

      if (!uploadResponse.success || !uploadResponse.data) {
        showError('Lỗi', uploadResponse.message || 'Không thể upload file. Vui lòng thử lại.');
        setIsUploadingCertificate(false);
        return;
      }

      const uploadData = uploadResponse.data as any;
      const certificateUrl = uploadData?.data?.secureUrl || uploadData?.data?.originalUrl || uploadData?.secureUrl || uploadData?.originalUrl;
      
      if (!certificateUrl) {
        console.error('Cannot extract URL from upload response:', uploadResponse);
        showError('Lỗi', 'Không thể lấy URL file sau khi upload.');
        setIsUploadingCertificate(false);
        return;
      }

      const request: Omit<TutorCertificateCreateRequest, 'tutorId'> = {
        certificateTypeId: newCertificate.certificateTypeId,
        issueDate: newCertificate.issueDate || undefined,
        expiryDate: newCertificate.expiryDate || undefined,
        certificateUrl: certificateUrl,
      };

      const response = await CertificateService.createTutorCertificate(tutorId, request);
      if (response.success && response.data) {
        showSuccess('Thành công', 'Thêm chứng chỉ thành công.');
        setShowCertificateModal(false);
        setNewCertificate({
          certificateTypeId: 0,
          certificateName: '',
          issueDate: '',
          expiryDate: '',
          certificateUrl: '',
          certificateFile: null,
        });
        await reloadTutorProfile();
      } else {
        showError('Lỗi', response.message || 'Không thể thêm chứng chỉ.');
      }
    } catch (error: any) {
      console.error('Error adding certificate:', error);
      showError('Lỗi', error.message || 'Không thể thêm chứng chỉ. Vui lòng thử lại.');
    } finally {
      setIsUploadingCertificate(false);
    }
  };

  const handleDeleteCertificate = async (id: number) => {
    if (!tutorId) {
      showError('Lỗi', 'Không tìm thấy thông tin gia sư.');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn xóa chứng chỉ này?')) {
      return;
    }

    if (isEditing) {
      setPendingCertificates(prev => ({
        ...prev,
        toDelete: [...prev.toDelete, id]
      }));
      setProfileData(prev => ({
        ...prev,
        certificates: prev.certificates.filter(c => c.id !== id)
      }));
      showSuccess('Thành công', 'Chứng chỉ đã được đánh dấu xóa. Nhấn "Lưu thay đổi" để xác nhận.');
      return;
    }

    try {
      const response = await CertificateService.deleteTutorCertificate(tutorId, id);
      if (response.success) {
        showSuccess('Thành công', 'Xóa chứng chỉ thành công.');
        await reloadTutorProfile();
      } else {
        showError('Lỗi', response.message || 'Không thể xóa chứng chỉ.');
      }
    } catch (error: any) {
      console.error('Error deleting certificate:', error);
      showError('Lỗi', 'Không thể xóa chứng chỉ. Vui lòng thử lại.');
    }
  };

  const handleAddSubject = async () => {
    if (!tutorId) {
      showError('Lỗi', 'Không tìm thấy thông tin gia sư.');
      return;
    }

    if (!newSubject.subjectId || newSubject.selectedLevels.length === 0 || !newSubject.hourlyRate) {
      showError('Lỗi', 'Vui lòng điền đầy đủ thông tin môn học và chọn ít nhất một cấp độ.');
      return;
    }

    try {
      const hourlyRate = parseFloat(newSubject.hourlyRate);
      if (isNaN(hourlyRate) || hourlyRate <= 0) {
        showError('Lỗi', 'Vui lòng nhập giá hợp lệ.');
        return;
      }

      const requests: Omit<TutorSubjectCreateRequest, 'tutorId'>[] = newSubject.selectedLevels.map(levelId => ({
        subjectId: newSubject.subjectId,
        levelId: levelId,
        hourlyRate: hourlyRate,
      }));

      if (isEditing) {
        setPendingSubjects(prev => ({
          ...prev,
          toCreate: [...prev.toCreate, ...requests]
        }));
        showSuccess('Thành công', `Đã thêm ${requests.length} môn học vào danh sách. Nhấn "Lưu thay đổi" để lưu.`);
        setShowSubjectModal(false);
        setNewSubject({
          subjectId: 0,
          subjectName: '',
          selectedLevels: [],
          hourlyRate: '',
        });
        return;
      }

      const results = await Promise.all(
        requests.map(request => SubjectService.createTutorSubject(tutorId, request))
      );

      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        showError('Lỗi', `Không thể thêm ${failed.length} môn học. Vui lòng thử lại.`);
        return;
      }

      showSuccess('Thành công', `Thêm ${results.length} môn học thành công.`);
      setShowSubjectModal(false);
      setNewSubject({
        subjectId: 0,
        subjectName: '',
        selectedLevels: [],
        hourlyRate: '',
      });
      await reloadTutorProfile();
    } catch (error: any) {
      console.error('Error adding subject:', error);
      showError('Lỗi', 'Không thể thêm môn học. Vui lòng thử lại.');
    }
  };

  const handleDeleteSubject = async (id: number) => {
    if (!tutorId) {
      showError('Lỗi', 'Không tìm thấy thông tin gia sư.');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn xóa môn học này?')) {
      return;
    }

    if (isEditing) {
      setPendingSubjects(prev => ({
        ...prev,
        toDelete: [...prev.toDelete, id]
      }));
      setProfileData(prev => ({
        ...prev,
        subjects: prev.subjects.filter(s => s.id !== id)
      }));
      showSuccess('Thành công', 'Môn học đã được đánh dấu xóa. Nhấn "Lưu thay đổi" để xác nhận.');
      return;
    }

    try {
      const response = await SubjectService.deleteTutorSubject(tutorId, id);
      if (response.success) {
        showSuccess('Thành công', 'Xóa môn học thành công.');
        await reloadTutorProfile();
      } else {
        showError('Lỗi', response.message || 'Không thể xóa môn học.');
      }
    } catch (error: any) {
      console.error('Error deleting subject:', error);
      showError('Lỗi', 'Không thể xóa môn học. Vui lòng thử lại.');
    }
  };

  // Handlers for time slots
  const handleAddTimeSlot = async () => {
    if (!tutorId || tutorId <= 0) {
      showError('Lỗi', 'Không tìm thấy thông tin gia sư.');
      return;
    }

    if (!newTimeSlot.slotId || !newTimeSlot.startDate) {
      showError('Lỗi', 'Vui lòng chọn slot và ngày bắt đầu.');
      return;
    }

    try {
      // Convert date to ISO 8601 date-time format
      const selectedSlot = masterData.timeSlots.find(slot => slot.id === newTimeSlot.slotId);
      const startDateTime = selectedSlot 
        ? `${newTimeSlot.startDate}T${selectedSlot.startTime}:00`
        : `${newTimeSlot.startDate}T00:00:00`;

      const request: TutorAvailabilityCreateRequest = {
        tutorId: tutorId,
        slotId: newTimeSlot.slotId,
        startDate: startDateTime, // ISO 8601 date-time
      };

      const response = await AvailabilityService.createAvailabilities([request]);
      if (response.success && response.data) {
        showSuccess('Thành công', 'Thêm khung giờ thành công.');
        setShowTimeSlotModal(false);
        setNewTimeSlot({
          dayOfWeek: DayOfWeekEnum.Monday.toString(),
          slotId: 0,
          startDate: '',
        });
        
        // Reload tutor profile
        await reloadTutorProfile();
      } else {
        showError('Lỗi', response.message || 'Không thể thêm khung giờ.');
      }
    } catch (error: any) {
      console.error('Error adding time slot:', error);
      showError('Lỗi', 'Không thể thêm khung giờ. Vui lòng thử lại.');
    }
  };

  // Helper functions for calendar view
  const weekDays = [
    { key: 'monday', label: 'Thứ 2' },
    { key: 'tuesday', label: 'Thứ 3' },
    { key: 'wednesday', label: 'Thứ 4' },
    { key: 'thursday', label: 'Thứ 5' },
    { key: 'friday', label: 'Thứ 6' },
    { key: 'saturday', label: 'Thứ 7' },
    { key: 'sunday', label: 'Chủ nhật' }
  ];

  const generateCurrentWeekDates = () => {
    const startDate = new Date(availabilityCalendar.startDate);
    const endDate = new Date(availabilityCalendar.endDate);
    const currentWeek = availabilityCalendar.currentWeek;
    
    const startOfWeek = new Date(startDate);
    const dayOfWeek = startDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(startDate.getDate() - daysToMonday + (currentWeek * 7));
    
    const datesByDay: Record<string, string> = {};
    
    weekDays.forEach((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      
      if (date >= startDate && date <= endDate) {
        const dayNum = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        datesByDay[day.key] = `${dayNum}/${month}`;
      } else {
        datesByDay[day.key] = '';
      }
    });

    return datesByDay;
  };

  const datesByDay = generateCurrentWeekDates();

  const getDateKey = (dayKey: string) => {
    const startDate = new Date(availabilityCalendar.startDate);
    const currentWeek = availabilityCalendar.currentWeek;
    
    const startOfWeek = new Date(startDate);
    const dayOfWeek = startDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(startDate.getDate() - daysToMonday + (currentWeek * 7));
    
    const dayIndex = weekDays.findIndex(d => d.key === dayKey);
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + dayIndex);
    
    return date.toISOString().split('T')[0];
  };

  const handleToggleTimeSlot = (dayKey: string, slotId: number) => {
    if (!isEditing) return;

    const dateKey = getDateKey(dayKey);
    const currentSlots = availabilityCalendar.schedule[dateKey]?.[dayKey] || [];
    const isSelected = currentSlots.includes(slotId);

    const newSchedule = { ...availabilityCalendar.schedule };
    
    if (isSelected) {
      if (newSchedule[dateKey]?.[dayKey]) {
        newSchedule[dateKey][dayKey] = newSchedule[dateKey][dayKey].filter(id => id !== slotId);
        if (newSchedule[dateKey][dayKey].length === 0) {
          delete newSchedule[dateKey][dayKey];
        }
        if (Object.keys(newSchedule[dateKey]).length === 0) {
          delete newSchedule[dateKey];
        }
      }
    } else {
      if (!newSchedule[dateKey]) {
        newSchedule[dateKey] = {};
      }
      if (!newSchedule[dateKey][dayKey]) {
        newSchedule[dateKey][dayKey] = [];
      }
      if (!newSchedule[dateKey][dayKey].includes(slotId)) {
        newSchedule[dateKey][dayKey].push(slotId);
      }
    }
    
    setAvailabilityCalendar(prev => ({ ...prev, schedule: newSchedule }));
  };

  const handleDeleteTimeSlot = async (availabilityId: number) => {
    if (!tutorId || tutorId <= 0) {
      showError('Lỗi', 'Không tìm thấy thông tin gia sư.');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn xóa khung giờ này?')) {
      return;
    }

    try {
      const response = await AvailabilityService.deleteAvailabilities([availabilityId]);
      if (response.success) {
        showSuccess('Thành công', 'Xóa khung giờ thành công.');
        
        // Reload tutor profile
        await reloadTutorProfile();
      } else {
        showError('Lỗi', response.message || 'Không thể xóa khung giờ.');
      }
    } catch (error: any) {
      console.error('Error deleting time slot:', error);
      showError('Lỗi', 'Không thể xóa khung giờ. Vui lòng thử lại.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#257180]" />
          <p className="text-gray-600">Đang tải thông tin hồ sơ gia sư...</p>
        </div>
      </div>
    );
  }

  // No tutor profile
  if (!tutorProfile || !tutorId) {
    return (
      <div className="space-y-6">
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Bạn chưa có hồ sơ gia sư. Vui lòng đăng ký làm gia sư trước.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Hồ sơ gia sư</h2>
          <p className="text-gray-600 mt-1">Quản lý thông tin hồ sơ gia sư của bạn</p>
        </div>
        <div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} size="lg" className="bg-[#257180] hover:bg-[#257180]/90 text-white">
              <Edit3 className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                onClick={() => {
                  setPendingCertificates({ toCreate: [], toDelete: [] });
                  setPendingEducations({ toCreate: [], toDelete: [] });
                  setPendingSubjects({ toCreate: [], toDelete: [] });
                  setIsEditing(false);
                  if (tutorProfile) {
                    setProfileData(prev => ({
                      ...prev,
                      tutorProfile: {
                        bio: tutorProfile.bio || '',
                        teachingExp: tutorProfile.teachingExp || '',
                        videoIntroUrl: tutorProfile.videoIntroUrl || '',
                        teachingModes: tutorProfile.teachingModes,
                        status: tutorProfile.status,
                      },
                    }));
                  }
                  setAvailabilityCalendar(prev => ({
                    ...prev,
                    schedule: JSON.parse(JSON.stringify(prev.originalSchedule))
                  }));
                }}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>
              <Button 
                onClick={handleSave} 
                size="lg" 
                className="bg-[#257180] hover:bg-[#257180]/90 text-white"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {saveSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Cập nhật hồ sơ gia sư thành công!
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="description">Mô tả</TabsTrigger>
          <TabsTrigger value="education">Học vấn</TabsTrigger>
          <TabsTrigger value="certificates">Chứng chỉ</TabsTrigger>
          <TabsTrigger value="subjects">Môn học & Giá</TabsTrigger>
          <TabsTrigger value="availability">Lịch khả dụng</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow bg-white border border-gray-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <User className="h-5 w-5" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6 mb-6">
                <div className="relative flex-shrink-0">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-[#F2E5BF]">
                    {profileData.basic.avatarUrl || tutorProfile?.avatarUrl || user?.avatar ? (
                      <img 
                        src={profileData.basic.avatarUrl || tutorProfile?.avatarUrl || user?.avatar} 
                        alt={profileData.basic.firstName + ' ' + profileData.basic.lastName || user?.name || 'User'}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-full h-full rounded-lg flex items-center justify-center text-2xl font-bold text-[#257180] bg-[#F2E5BF] ${profileData.basic.avatarUrl || tutorProfile?.avatarUrl || user?.avatar ? 'hidden' : 'flex'}`}
                      style={{ display: profileData.basic.avatarUrl || tutorProfile?.avatarUrl || user?.avatar ? 'none' : 'flex' }}
                    >
                      {(profileData.basic.firstName?.[0] || profileData.basic.lastName?.[0] || user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                    </div>
                  </div>
                </div>
                <div>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/jpeg,image/jpg,image/png"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      if (!user?.email) {
                        showError('Lỗi', 'Không tìm thấy thông tin người dùng.');
                        return;
                      }

                      // Validate file size (5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        showError('Lỗi', 'Kích thước file không được vượt quá 5MB.');
                        return;
                      }

                      // Validate file type
                      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
                        showError('Lỗi', 'Chỉ chấp nhận file JPG, JPEG, PNG.');
                        return;
                      }

                      setIsUploadingAvatar(true);
                      try {
                        const uploadResponse = await UserProfileService.uploadAvatar(file, user.email);
                        
                        if (uploadResponse.success && uploadResponse.data?.avatarUrl) {
                          // Update local state
                          setProfileData(prev => ({
                            ...prev,
                            basic: {
                              ...prev.basic,
                              avatarUrl: uploadResponse.data!.avatarUrl,
                            },
                          }));

                          // Update user profile with new avatar
                          const updateResponse = await UserProfileService.updateUserProfile({
                            userEmail: user.email,
                            avatarUrl: uploadResponse.data!.avatarUrl,
                            avatarUrlPublicId: uploadResponse.data!.avatarUrlPublicId,
                          });

                          if (updateResponse.success) {
                            showSuccess('Thành công', 'Cập nhật ảnh đại diện thành công.');
                            // Reload tutor profile to get updated avatar
                            await reloadTutorProfile();
                          } else {
                            showError('Lỗi', 'Upload thành công nhưng không thể cập nhật profile.');
                          }
                        } else {
                          showError('Lỗi', uploadResponse.message || 'Không thể upload ảnh. Vui lòng thử lại.');
                        }
                      } catch (error: any) {
                        console.error('Error uploading avatar:', error);
                        showError('Lỗi', error.message || 'Không thể upload ảnh. Vui lòng thử lại.');
                      } finally {
                        setIsUploadingAvatar(false);
                        // Reset input
                        e.target.value = '';
                      }
                    }}
                    disabled={!isEditing || isUploadingAvatar}
                  />
                  <Button 
                    disabled={!isEditing || isUploadingAvatar} 
                    variant="outline"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang upload...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Tải ảnh lên
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">JPG, PNG. Tối đa 5MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">Họ và tên đệm</Label>
                  <Input
                    id="lastName"
                    value={profileData.basic.lastName}
                    onChange={(e) => updateProfileData('basic', { lastName: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "disabled:text-black disabled:opacity-100" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">Tên</Label>
                  <Input
                    id="firstName"
                    value={profileData.basic.firstName}
                    onChange={(e) => updateProfileData('basic', { firstName: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "disabled:text-black disabled:opacity-100" : ""}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.basic.email}
                    disabled
                    className="disabled:text-black disabled:opacity-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={profileData.basic.phone}
                    onChange={(e) => updateProfileData('basic', { phone: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "disabled:text-black disabled:opacity-100" : ""}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Ngày sinh</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={profileData.basic.dob}
                    onChange={(e) => updateProfileData('basic', { dob: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "disabled:text-black disabled:opacity-100" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Giới tính</Label>
                  <Select 
                    value={profileData.basic.gender.toString()}
                    onValueChange={(value) => updateProfileData('basic', { gender: parseInt(value) })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className={!isEditing ? "disabled:text-black disabled:opacity-100" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map((gender) => (
                        <SelectItem key={gender.value} value={gender.value.toString()}>
                          {gender.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Địa chỉ</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Tỉnh/Thành phố</Label>
                    <Select 
                      value={profileData.basic.cityId?.toString() || ''}
                      onValueChange={(value) => {
                        const provinceId = parseInt(value);
                        const provinceName = provinces.find(p => p.id === provinceId)?.name || '';
                        updateProfileData('basic', { 
                          cityId: provinceId,
                          cityName: provinceName,
                          subDistrictId: 0,
                          subDistrictName: '',
                        });
                      }}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={!isEditing ? "disabled:text-black disabled:opacity-100" : ""}>
                        <SelectValue placeholder={isLoadingLocations ? "Đang tải..." : "Chọn tỉnh/thành phố"} />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province.id} value={province.id.toString()}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subDistrict">Quận/Huyện</Label>
                    <Select
                      value={profileData.basic.subDistrictId?.toString() || ''}
                      onValueChange={(value) => {
                        const subDistrictId = parseInt(value);
                        const subDistrictName = subDistricts.find(d => d.id === subDistrictId)?.name || '';
                        updateProfileData('basic', { 
                          subDistrictId: subDistrictId,
                          subDistrictName: subDistrictName,
                        });
                      }}
                      disabled={!isEditing || !profileData.basic.cityId || isLoadingLocations}
                    >
                      <SelectTrigger className={!isEditing ? "disabled:text-black disabled:opacity-100" : ""}>
                        <SelectValue placeholder={
                          isLoadingLocations ? "Đang tải..." :
                          profileData.basic.cityId ? "Chọn quận/huyện" : "Chọn tỉnh trước"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {subDistricts.map((district) => (
                          <SelectItem key={district.id} value={district.id.toString()}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine">Địa chỉ chi tiết</Label>
                  <Input
                    id="addressLine"
                    value={profileData.basic.addressLine}
                    onChange={(e) => updateProfileData('basic', { addressLine: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Số nhà, tên đường..."
                    className={!isEditing ? "disabled:text-black disabled:opacity-100" : ""}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Hình thức dạy học</Label>
                <RadioGroup 
                  value={profileData.tutorProfile.teachingModes?.toString() ?? TeachingMode.Offline.toString()}
                  onValueChange={(value) => {
                    updateProfileData('tutorProfile', { teachingModes: parseInt(value) as TeachingMode });
                      }}
                      disabled={!isEditing}
                      className={!isEditing ? "[&_label]:text-black [&_label]:opacity-100" : ""}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={TeachingMode.Offline.toString()} id="offline" />
                    <Label htmlFor="offline" className={`cursor-pointer ${!isEditing ? "text-black opacity-100" : ""}`}>{EnumHelpers.getTeachingModeLabel(TeachingMode.Offline)}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={TeachingMode.Online.toString()} id="online" />
                    <Label htmlFor="online" className={`cursor-pointer ${!isEditing ? "text-black opacity-100" : ""}`}>{EnumHelpers.getTeachingModeLabel(TeachingMode.Online)}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={TeachingMode.Hybrid.toString()} id="hybrid" />
                    <Label htmlFor="hybrid" className={`cursor-pointer ${!isEditing ? "text-black opacity-100" : ""}`}>{EnumHelpers.getTeachingModeLabel(TeachingMode.Hybrid)}</Label>
                </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="description" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow bg-white border border-gray-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <FileText className="h-5 w-5" />
                Giới thiệu bản thân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Mô tả chung</Label>
                <p className="text-sm text-gray-600">Giới thiệu về bản thân, đam mê và triết lý giảng dạy của bạn</p>
                <Textarea
                  id="bio"
                  className={`min-h-32 ${!isEditing ? "disabled:text-black disabled:opacity-100" : ""}`}
                  value={profileData.tutorProfile.bio}
                  onChange={(e) => updateProfileData('tutorProfile', { bio: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Hãy chia sẻ về bản thân bạn..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teachingExp">Kinh nghiệm giảng dạy</Label>
                <p className="text-sm text-gray-600">Mô tả kinh nghiệm giảng dạy, thành tích và kết quả đạt được</p>
                <Textarea
                  id="teachingExp"
                  className={`min-h-32 ${!isEditing ? "disabled:text-black disabled:opacity-100" : ""}`}
                  value={profileData.tutorProfile.teachingExp}
                  onChange={(e) => updateProfileData('tutorProfile', { teachingExp: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Chia sẻ kinh nghiệm giảng dạy của bạn..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow bg-white border border-gray-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Video className="h-5 w-5" />
                Video giới thiệu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="videoIntroUrl">Đường dẫn YouTube</Label>
                <p className="text-sm text-gray-600">Video giới thiệu giúp học viên hiểu rõ hơn về phong cách dạy của bạn</p>
                <Input
                  id="videoIntroUrl"
                  value={profileData.tutorProfile.videoIntroUrl}
                  onChange={(e) => updateProfileData('tutorProfile', { videoIntroUrl: e.target.value })}
                  disabled={!isEditing}
                  placeholder="https://youtube.com/watch?v=..."
                  className={!isEditing ? "disabled:text-black disabled:opacity-100" : ""}
                />
              </div>
              
              {/* Video Preview */}
              {profileData.tutorProfile.videoIntroUrl && (
                <div className="space-y-2">
                  <Label>Preview video</Label>
                  {isYouTubeUrl(profileData.tutorProfile.videoIntroUrl) && getYouTubeEmbedUrl(profileData.tutorProfile.videoIntroUrl) ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      <iframe
                        src={getYouTubeEmbedUrl(profileData.tutorProfile.videoIntroUrl) || ''}
                        title="Video giới thiệu"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : isCloudinaryUrl(profileData.tutorProfile.videoIntroUrl) ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      <video
                        src={profileData.tutorProfile.videoIntroUrl}
                        controls
                        className="w-full h-full object-contain"
                        preload="metadata"
                      >
                        Trình duyệt của bạn không hỗ trợ video tag.
                      </video>
                    </div>
                  ) : (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      <video
                        src={profileData.tutorProfile.videoIntroUrl}
                        controls
                        className="w-full h-full object-contain"
                        preload="metadata"
                      >
                        Trình duyệt của bạn không hỗ trợ video tag.
                      </video>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow bg-white border border-gray-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <GraduationCap className="h-5 w-5" />
                  Học vấn
                </CardTitle>
                <Button 
                  onClick={() => setShowEducationModal(true)}
                  disabled={!isEditing}
                  size="lg"
                  className="bg-[#257180] hover:bg-[#257180]/90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm học vấn
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData.educations.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Chưa có thông tin học vấn</p>
              ) : (
                profileData.educations.map((edu) => (
                  <div key={edu.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex gap-3 flex-1">
                      <GraduationCap className="w-5 h-5 text-[#257180] mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{edu.institutionName}</h4>
                          <Badge className={verifyStatusColors(edu.verified)}>
                            {verifyStatusText(edu.verified)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {institutionTypes.find(t => t.value === edu.institutionType)?.label}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Ngày cấp bằng: {new Date(edu.issueDate).toLocaleDateString('vi-VN')}
                        </p>
                        {edu.rejectReason && (
                          <Alert className="mt-2 bg-red-50 border-red-200">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800 text-sm">
                              Lý do từ chối: {edu.rejectReason}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                    {isEditing && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow bg-white border border-gray-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <FileText className="h-5 w-5" />
                  Chứng chỉ
                </CardTitle>
                <Button 
                  onClick={() => setShowCertificateModal(true)}
                  disabled={!isEditing}
                  size="lg"
                  className="bg-[#257180] hover:bg-[#257180]/90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm chứng chỉ
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData.certificates.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Chưa có chứng chỉ</p>
              ) : (
                profileData.certificates.map((cert) => (
                  <div key={cert.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex gap-3 flex-1">
                      <FileText className="w-5 h-5 text-[#257180] mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{cert.certificateName}</h4>
                          <Badge className={verifyStatusColors(cert.verified)}>
                            {verifyStatusText(cert.verified)}
                          </Badge>
                        </div>
                        {cert.subjectName && (
                          <p className="text-sm text-gray-600">Môn: {cert.subjectName}</p>
                        )}
                        <div className="text-sm text-gray-600 mt-1">
                          <p>Ngày cấp: {new Date(cert.issueDate).toLocaleDateString('vi-VN')}</p>
                          {cert.expiryDate && (
                            <p>Hết hạn: {new Date(cert.expiryDate).toLocaleDateString('vi-VN')}</p>
                          )}
                        </div>
                        {cert.rejectReason && (
                          <Alert className="mt-2 bg-red-50 border-red-200">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800 text-sm">
                              Lý do từ chối: {cert.rejectReason}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                    {isEditing && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteCertificate(cert.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow bg-white border border-gray-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <DollarSign className="h-5 w-5" />
                  Môn học & Giá dạy
                </CardTitle>
                <Button 
                  onClick={() => setShowSubjectModal(true)}
                  disabled={!isEditing}
                  size="lg"
                  className="bg-[#257180] hover:bg-[#257180]/90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm môn học
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData.subjects.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Chưa có môn học</p>
              ) : (
                profileData.subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{subject.subjectName}</h4>
                        {subject.levelName && (
                          <Badge variant="secondary">{subject.levelName}</Badge>
                        )}
                      </div>
                      <p className="text-[#257180] font-semibold mt-1">
                        {formatCurrency(subject.hourlyRate)}/slot
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">1 slot = 1 giờ</p>
                    </div>
                    {isEditing && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow bg-white border border-gray-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Calendar className="h-5 w-5" />
                Lịch khả dụng trong tuần
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setAvailabilityCalendar(prev => ({ ...prev, currentWeek: prev.currentWeek - 1 }))}
                    className="border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Tuần trước
                  </Button>
                  <div className="text-sm font-medium text-[#257180]">
                    {availabilityCalendar.currentWeek === 0 ? 'Tuần này' : 
                     availabilityCalendar.currentWeek === 1 ? 'Tuần sau' :
                     availabilityCalendar.currentWeek === -1 ? 'Tuần trước' :
                     `Tuần ${availabilityCalendar.currentWeek > 0 ? '+' : ''}${availabilityCalendar.currentWeek}`}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAvailabilityCalendar(prev => ({ ...prev, currentWeek: prev.currentWeek + 1 }))}
                    className="border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                  >
                    Tuần sau
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                {isEditing && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setAvailabilityCalendar(prev => ({ ...prev, currentWeek: 0 }))}
                    className="border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                  >
                    Hôm nay
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-black text-sm sm:text-base">Chọn thời gian bạn có thể dạy</Label>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm('Bạn có chắc chắn muốn xóa tất cả khung giờ trong tuần này?')) return;
                        const dateKeys = Object.keys(availabilityCalendar.schedule).filter(key => {
                          const date = new Date(key);
                          const startOfWeek = new Date(availabilityCalendar.startDate);
                          const dayOfWeek = startOfWeek.getDay();
                          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                          startOfWeek.setDate(startOfWeek.getDate() - daysToMonday + (availabilityCalendar.currentWeek * 7));
                          const endOfWeek = new Date(startOfWeek);
                          endOfWeek.setDate(startOfWeek.getDate() + 6);
                          return date >= startOfWeek && date <= endOfWeek;
                        });
                        const availabilitiesToDelete = profileData.availabilities.filter(av => 
                          av.startDate && dateKeys.some(key => av.startDate?.startsWith(key))
                        );
                        if (availabilitiesToDelete.length > 0) {
                          const ids = availabilitiesToDelete.map(av => av.id);
                          const response = await AvailabilityService.deleteAvailabilities(ids);
                          if (response.success) {
                            await reloadTutorProfile();
                            showSuccess('Thành công', 'Đã xóa tất cả khung giờ trong tuần');
                          }
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
                    >
                      Xóa tất cả
                    </button>
                              )}
                            </div>
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    <div className="grid grid-cols-8 gap-2 mb-2">
                      <div className="p-2"></div>
                      {weekDays.map((day) => (
                        <div key={day.key} className="p-2 text-center font-medium text-black bg-[#F2E5BF] rounded border border-gray-300">
                          <div>{day.label}</div>
                          <div className="text-xs text-gray-600 mt-1">{datesByDay[day.key]}</div>
                        </div>
                      ))}
                    </div>
                    
                    {masterData.timeSlots.length > 0 ? masterData.timeSlots.map((slot) => (
                      <div key={slot.id} className="grid grid-cols-8 gap-2 mb-1">
                        <div className="p-2 text-sm font-medium text-gray-600 flex items-center">
                          {slot.startTime.split(':').slice(0, 2).join(':')}
                        </div>
                        {weekDays.map((day) => {
                          const dateKey = getDateKey(day.key);
                          const today = new Date();
                          const todayString = today.toISOString().split('T')[0];
                          const isPastDate = dateKey <= todayString;
                          const isInRange = datesByDay[day.key] !== '';
                          
                          const currentSlots = availabilityCalendar.schedule[dateKey]?.[day.key] || [];
                          const isSelected = currentSlots.includes(slot.id);
                          
                          // Check if this slot is booked/in progress/cancelled
                          const existingAvailability = profileData.availabilities.find(
                            av => av.slot?.id === slot.id && av.startDate?.startsWith(dateKey)
                          );
                          const status = existingAvailability 
                            ? EnumHelpers.parseTutorAvailabilityStatus(existingAvailability.status)
                            : null;
                          const isBooked = status === TutorAvailabilityStatus.Booked || status === TutorAvailabilityStatus.InProgress;
                          const isCancelled = status === TutorAvailabilityStatus.Cancelled;
                          
                          return (
                            <div key={`${day.key}-${slot.id}`} className="p-1">
                              {!isInRange || isPastDate ? (
                                <div className="w-full h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                  <span className="text-xs text-gray-400">-</span>
                      </div>
                              ) : isBooked ? (
                                <div className="w-full h-8 bg-yellow-100 rounded border border-yellow-300 flex items-center justify-center">
                                  <span className="text-xs text-yellow-700">Đã đặt</span>
                                </div>
                              ) : isCancelled ? (
                                <div className="w-full h-8 bg-red-100 rounded border border-red-300 flex items-center justify-center">
                                  <span className="text-xs text-red-700">Đã hủy</span>
                                </div>
                              ) : (
                                <Checkbox 
                                  id={`${day.key}-${slot.id}`} 
                                  className="w-full h-8 data-[state=checked]:bg-[#257180]"
                                  checked={isSelected}
                                  onCheckedChange={() => handleToggleTimeSlot(day.key, slot.id)}
                                  disabled={!isEditing}
                                />
                    )}
                  </div>
                );
              })}
                      </div>
                    )) : (
                      <div className="text-center text-gray-500 py-4">
                        Đang tải danh sách khung giờ...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showEducationModal} onOpenChange={setShowEducationModal}>
        <DialogContent className="sm:max-w-md border-gray-300 shadow-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Thêm học vấn</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="institutionId">Tên trường *</Label>
              <Select 
                value={newEducation.institutionId.toString()}
                onValueChange={(value) => {
                  const institutionId = parseInt(value);
                  setNewEducation({ ...newEducation, institutionId });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trường học" />
                </SelectTrigger>
                <SelectContent>
                  {masterData.institutions.map((institution) => (
                    <SelectItem key={institution.id} value={institution.id.toString()}>
                      {institution.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eduIssueDate">Ngày cấp bằng</Label>
              <Input
                id="eduIssueDate"
                type="date"
                value={newEducation.issueDate}
                onChange={(e) => setNewEducation({ ...newEducation, issueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eduCertFile">Tải lên bằng cấp (PDF, JPG, PNG) *</Label>
              <Input
                id="eduCertFile"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setNewEducation({ ...newEducation, certificateFile: e.target.files?.[0] || null })}
                required
              />
              {newEducation.certificateFile && (
                <p className="text-sm text-green-600">Đã chọn: {newEducation.certificateFile.name}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEducationModal(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleAddEducation}
              disabled={!newEducation.institutionId || !newEducation.issueDate || !newEducation.certificateFile || isUploadingEducation}
              size="lg"
              className="bg-[#257180] hover:bg-[#257180]/90 text-white"
            >
              {isUploadingEducation ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang upload...
                </>
              ) : (
                'Thêm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCertificateModal} onOpenChange={setShowCertificateModal}>
        <DialogContent className="sm:max-w-md border-gray-300 shadow-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Thêm chứng chỉ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="certificateTypeId">Loại chứng chỉ *</Label>
              <Select 
                value={newCertificate.certificateTypeId.toString()}
                onValueChange={(value) => {
                  const certType = masterData.certificateTypes.find(ct => ct.id === parseInt(value));
                  setNewCertificate({ 
                    ...newCertificate, 
                    certificateTypeId: parseInt(value),
                    certificateName: certType?.name || '',
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại chứng chỉ" />
                </SelectTrigger>
                <SelectContent>
                  {masterData.certificateTypes.map((certType) => (
                    <SelectItem key={certType.id} value={certType.id.toString()}>
                      {certType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certIssueDate">Ngày cấp</Label>
                <Input
                  id="certIssueDate"
                  type="date"
                  value={newCertificate.issueDate}
                  onChange={(e) => setNewCertificate({ ...newCertificate, issueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certExpiryDate">Ngày hết hạn</Label>
                <Input
                  id="certExpiryDate"
                  type="date"
                  value={newCertificate.expiryDate}
                  onChange={(e) => setNewCertificate({ ...newCertificate, expiryDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="certFile">Tải lên chứng chỉ (PDF, JPG, PNG) *</Label>
              <Input
                id="certFile"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setNewCertificate({ ...newCertificate, certificateFile: e.target.files?.[0] || null })}
                required
              />
              {newCertificate.certificateFile && (
                <p className="text-sm text-green-600">Đã chọn: {newCertificate.certificateFile.name}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCertificateModal(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleAddCertificate}
              disabled={!newCertificate.certificateTypeId || !newCertificate.issueDate || !newCertificate.certificateFile || isUploadingCertificate}
              size="lg"
              className="bg-[#257180] hover:bg-[#257180]/90 text-white"
            >
              {isUploadingCertificate ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang upload...
                </>
              ) : (
                'Thêm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSubjectModal} onOpenChange={setShowSubjectModal}>
        <DialogContent className="sm:max-w-md border-gray-300 shadow-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Thêm môn học</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subjectId">Môn học *</Label>
              <Select 
                value={newSubject.subjectId.toString()}
                onValueChange={(value) => {
                  const subject = masterData.subjects.find(s => s.id === parseInt(value));
                  setNewSubject({ 
                    ...newSubject, 
                    subjectId: parseInt(value),
                    subjectName: subject?.subjectName || '',
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  {masterData.subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cấp độ * (có thể chọn nhiều)</Label>
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                {masterData.levels.length === 0 ? (
                  <p className="text-sm text-gray-500">Đang tải danh sách cấp độ...</p>
                ) : (
                  masterData.levels.map((level) => (
                    <div key={level.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`level-${level.id}`}
                        checked={newSubject.selectedLevels.includes(level.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewSubject({
                              ...newSubject,
                              selectedLevels: [...newSubject.selectedLevels, level.id],
                            });
                          } else {
                            setNewSubject({
                              ...newSubject,
                              selectedLevels: newSubject.selectedLevels.filter(id => id !== level.id),
                            });
                          }
                        }}
                      />
                      <Label
                        htmlFor={`level-${level.id}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {level.name}
                      </Label>
                    </div>
                  ))
                )}
              </div>
              {newSubject.selectedLevels.length > 0 && (
                <p className="text-xs text-gray-500">
                  Đã chọn: {newSubject.selectedLevels.length} cấp độ
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Giá mỗi slot (₫)</Label>
              <p className="text-xs text-gray-500">1 slot = 1 giờ</p>
              <Input
                id="hourlyRate"
                type="number"
                value={newSubject.hourlyRate}
                onChange={(e) => setNewSubject({ ...newSubject, hourlyRate: e.target.value })}
                placeholder="200000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubjectModal(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleAddSubject}
              disabled={!newSubject.subjectId || newSubject.selectedLevels.length === 0 || !newSubject.hourlyRate}
              size="lg"
              className="bg-[#257180] hover:bg-[#257180]/90 text-white"
            >
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTimeSlotModal} onOpenChange={setShowTimeSlotModal}>
        <DialogContent className="sm:max-w-md border-gray-300 shadow-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Thêm khung giờ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Ngày trong tuần</Label>
              <Select 
                value={newTimeSlot.dayOfWeek}
                onValueChange={(value) => setNewTimeSlot({ ...newTimeSlot, dayOfWeek: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DayOfWeekEnum.Sunday.toString()}>Chủ Nhật</SelectItem>
                  <SelectItem value={DayOfWeekEnum.Monday.toString()}>Thứ Hai</SelectItem>
                  <SelectItem value={DayOfWeekEnum.Tuesday.toString()}>Thứ Ba</SelectItem>
                  <SelectItem value={DayOfWeekEnum.Wednesday.toString()}>Thứ Tư</SelectItem>
                  <SelectItem value={DayOfWeekEnum.Thursday.toString()}>Thứ Năm</SelectItem>
                  <SelectItem value={DayOfWeekEnum.Friday.toString()}>Thứ Sáu</SelectItem>
                  <SelectItem value={DayOfWeekEnum.Saturday.toString()}>Thứ Bảy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slotId">Khung giờ *</Label>
              <Select 
                value={newTimeSlot.slotId.toString()}
                onValueChange={(value) => {
                  const slotId = parseInt(value);
                  setNewTimeSlot({ ...newTimeSlot, slotId });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khung giờ" />
                </SelectTrigger>
                <SelectContent>
                  {masterData.timeSlots.length === 0 ? (
                    <SelectItem value="0" disabled>Đang tải...</SelectItem>
                  ) : (
                    masterData.timeSlots
                      .filter(slot => {
                        // TimeSlot có thể có hoặc không có dayOfWeek
                        // Nếu có dayOfWeek thì filter theo dayOfWeek, nếu không thì hiển thị tất cả
                        const slotDayOfWeek = (slot as any).dayOfWeek;
                        if (slotDayOfWeek !== undefined && slotDayOfWeek !== null) {
                          return slotDayOfWeek === parseInt(newTimeSlot.dayOfWeek);
                        }
                        // Nếu không có dayOfWeek, hiển thị tất cả slots
                        return true;
                      })
                      .map((slot) => (
                        <SelectItem key={slot.id} value={slot.id.toString()}>
                          {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                          {(slot as any).dayOfWeek !== undefined && (slot as any).dayOfWeek !== null && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({EnumHelpers.getDayOfWeekLabel((slot as any).dayOfWeek)})
                            </span>
                          )}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              {masterData.timeSlots.length === 0 && (
                <p className="text-sm text-gray-500">Đang tải danh sách khung giờ...</p>
              )}
              {masterData.timeSlots.length > 0 && masterData.timeSlots.filter(slot => {
                const slotDayOfWeek = (slot as any).dayOfWeek;
                if (slotDayOfWeek !== undefined && slotDayOfWeek !== null) {
                  return slotDayOfWeek === parseInt(newTimeSlot.dayOfWeek);
                }
                return true;
              }).length === 0 && (
                <p className="text-sm text-gray-500">Không có khung giờ nào cho ngày này</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Ngày bắt đầu *</Label>
              <Input
                id="startDate"
                type="date"
                value={newTimeSlot.startDate}
                onChange={(e) => setNewTimeSlot({ ...newTimeSlot, startDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500">Chọn ngày cụ thể để thêm khung giờ này</p>
            </div>
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                Mỗi khung giờ tương ứng với 1 slot (1 giờ học). Bạn cần chọn ngày cụ thể để thêm khung giờ.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimeSlotModal(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleAddTimeSlot}
              disabled={!newTimeSlot.slotId || !newTimeSlot.startDate}
              size="lg"
              className="bg-[#257180] hover:bg-[#257180]/90 text-white"
            >
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
