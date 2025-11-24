"use client";

import React, { useEffect, useMemo, useState, useRef } from 'react';
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
  MapPin,
  Calendar,
  Phone,
  Mail,
  Shield,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/basic/avatar';
import { AdminService } from '@/services/adminService';
import { ManageUserDto, UserProfileDto } from '@/types/backend';
import { useAuth } from '@/hooks/useAuth';
import { useCustomToast } from '@/hooks/useCustomToast';
import { UserProfileService } from '@/services/userProfileService';
import { LocationService, ProvinceDto } from '@/services/locationService';
import { EnumHelpers, Gender } from '@/types/enums';
import { TutorService } from '@/services/tutorService';
import { DetailTutorProfile, mapTutorProfileToDetail } from './ManageTutorApplications';

type SortField = 'id' | 'name' | 'email' | 'createdAt';

const ROLE = {
  LEARNER: 1,
  TUTOR: 2,
  BUSINESS_ADMIN: 3,
  SYSTEM_ADMIN: 4,
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
  const [provinces, setProvinces] = useState<ProvinceDto[]>([]);

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
            .filter((u) => u.roleId !== ROLE.SYSTEM_ADMIN)
            .filter((u) => u.email !== user?.email);
          setUsers(filtered);
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
  }, [user?.email]);

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
      const roleId = parseInt(filterRole);
      filtered = filtered.filter((u) => u.roleId === roleId);
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
  }, [users, searchTerm, filterRole, filterStatus, sortField, sortDirection]);

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
      return <Badge className="bg-green-100 text-green-800 border-green-200">Hoạt động</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Chưa kích hoạt</Badge>;
  };

  const getRoleName = (roleId: number) => {
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
    if (userData.roleId !== ROLE.LEARNER && userData.roleId !== ROLE.TUTOR) {
      return;
    }
    setDetailUser(userData);
    setIsDetailLoading(true);

    try {
      if (userData.roleId === ROLE.LEARNER) {
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

          setDetailLearner({
            ...profile,
            province: provinceName ? { ...(profile.province || {}), name: provinceName } : profile.province,
            subDistrict: subDistrictName ? { ...(profile.subDistrict || {}), name: subDistrictName } : profile.subDistrict,
          });
          setDetailType('learner');
        } else {
          showError('Lỗi', response.message || 'Không thể tải thông tin học viên');
        }
      } else if (userData.roleId === ROLE.TUTOR) {
        const response = await TutorService.getTutorByEmail(userData.email);
        if (response.success && response.data) {
          const detail = mapTutorProfileToDetail(response.data);
          setDetailTutor(detail);
          setDetailType('tutor');
        } else {
          showError('Lỗi', response.message || 'Không thể tải thông tin gia sư');
        }
      }
    } catch (error) {
      console.error('Error loading detail:', error);
      showError('Lỗi', 'Không thể tải chi tiết người dùng.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý người dùng</h1>
          <p className="text-sm text-gray-600 mt-1">Theo dõi học viên và gia sư trong hệ thống</p>
        </div>
      </div>

      <Card className="bg-white">
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

      <Card className="bg-white">
        <CardHeader className="border-b border-gray-200 bg-gray-50">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#257180]" />
            Danh sách người dùng
            <Badge variant="secondary" className="ml-2 bg-[#257180] text-white">
              {filteredUsers.length} người dùng
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
                    <TableRow className="bg-gray-50 border-b border-gray-200">
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
                        <TableRow key={record.email} className="hover:bg-gray-50 border-b border-gray-200">
                          <TableCell className="text-left">
                            <span className="font-mono text-sm text-gray-600">{startIndex + index + 1}</span>
                          </TableCell>
                          <TableCell className="text-left">
                            <div className="flex items-center gap-3 min-w-0 max-w-[220px]">
                              <Avatar className="h-10 w-10 rounded-lg">
                                <AvatarImage src={record.avatarUrl} />
                                <AvatarFallback className="bg-[#F2E5BF] text-[#257180]">
                                  {(record.userName || record.email || 'U').slice(0, 2).toUpperCase()}
                                </AvatarFallback>
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
                            <Badge className="bg-[#F2E5BF] text-[#257180] border-[#257180]/20 text-xs">
                              {record.roleName || getRoleName(record.roleId)}
                            </Badge>
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
                              {record.roleId === ROLE.LEARNER || record.roleId === ROLE.TUTOR ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 border border-gray-200 text-[#257180] hover:bg-[#257180]/10"
                                  onClick={() => handleViewDetail(record)}
                                  title="Xem chi tiết"
                                >
                                  {isDetailLoading && detailUser?.email === record.email ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              ) : null}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  record.isActive ? handleDeactivateUser(record.email) : handleActivateUser(record.email)
                                }
                                disabled={isActivating === record.email || isDeactivating === record.email}
                                className={`h-9 w-9 border ${
                                  record.isActive
                                    ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                                    : 'border-green-200 text-green-600 hover:bg-green-50'
                                }`}
                                title={record.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                              >
                                {isActivating === record.email || isDeactivating === record.email ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : record.isActive ? (
                                  <XCircle className="h-4 w-4" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
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
                <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200">
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Chi tiết học viên</DialogTitle>
          </DialogHeader>
          {isDetailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#257180]" />
            </div>
          ) : detailLearner && detailUser ? (
            <div className="space-y-6">
              <Card className="border border-gray-200">
                <CardContent className="p-6 flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={detailLearner.avatarUrl} />
                    <AvatarFallback className="bg-[#F2E5BF] text-[#257180] text-2xl">
                      {(detailUser.userName || detailUser.email || 'U').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">{detailUser.userName || detailUser.email}</h3>
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4" />
                      {detailUser.email}
                    </p>
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4" />
                      {detailUser.phone || 'Chưa cập nhật'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle>Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Họ và tên</p>
                    <p className="font-medium text-gray-900">{detailUser.userName || detailUser.email}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Ngày sinh</p>
                    <p className="font-medium text-gray-900">
                      {detailLearner.dob ? new Date(detailLearner.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Giới tính</p>
                    <p className="font-medium text-gray-900">
                      {EnumHelpers.getGenderLabel((detailLearner.gender as Gender) ?? Gender.Unknown)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Tài khoản</p>
                    <p className="font-medium text-gray-900">
                      {detailLearner.userEmailNavigation?.isActive ? 'Đang hoạt động' : 'Chưa kích hoạt'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle>Địa chỉ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Tỉnh/Thành phố</p>
                      <p className="font-medium text-gray-900">
                        {detailLearner.province?.name || 'Chưa cập nhật'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Quận/Huyện</p>
                      <p className="font-medium text-gray-900">
                        {detailLearner.subDistrict?.name || 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Địa chỉ chi tiết</p>
                    <p className="font-medium text-gray-900">
                      {detailLearner.addressLine || 'Chưa cập nhật'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-6">Không có dữ liệu</div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={detailType === 'tutor'} onOpenChange={(open) => !open && setDetailType(null)}>
        <DialogContent className="!max-w-7xl max-h-[95vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader className="border-b pb-4">
            <DialogTitle>Hồ sơ gia sư</DialogTitle>
          </DialogHeader>
          {isDetailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#257180]" />
            </div>
          ) : detailTutor ? (
            <div className="pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border border-gray-200">
                    <CardContent className="p-6 flex flex-col sm:flex-row gap-6">
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-28 h-28 sm:w-32 sm:h-32">
                          <AvatarImage src={detailTutor.avatarUrl} />
                          <AvatarFallback className="text-3xl bg-[#F2E5BF] text-[#257180]">
                            {detailTutor.userName.split(' ').slice(-2).map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white bg-blue-600">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-3">
                        <div>
                          <h1 className="text-2xl font-semibold text-gray-900 truncate">{detailTutor.userName}</h1>
                          <p className="text-gray-600 flex items-center gap-2 mt-1">
                            <Mail className="h-4 w-4" />
                            {detailTutor.email}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {EnumHelpers.getTeachingModeLabel(detailTutor.teachingModes)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {detailTutor.subDistrictName || 'Chưa cập nhật'}
                              {detailTutor.provinceName ? `, ${detailTutor.provinceName}` : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Tham gia {new Date(detailTutor.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardHeader>
                      <CardTitle>Giới thiệu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-gray-700 whitespace-pre-line">
                        {detailTutor.bio || 'Chưa có thông tin giới thiệu.'}
                      </p>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Môn học đăng ký</h3>
                        {detailTutor.subjects.length > 0 ? (
                          <div className="space-y-2">
                            {detailTutor.subjects.map((subject) => (
                              <div
                                key={subject.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium text-gray-900">{subject.subject?.subjectName || 'Chưa có tên'}</p>
                                  {subject.level && (
                                    <p className="text-sm text-gray-600">{subject.level.name}</p>
                                  )}
                                </div>
                                <p className="font-semibold text-[#257180]">
                                  {subject.hourlyRate ? subject.hourlyRate.toLocaleString('vi-VN') : 'Chưa cập nhật'}/giờ
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">Chưa có môn học nào.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardHeader>
                      <CardTitle>Lịch khả dụng</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {detailTutor.availabilities.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {detailTutor.availabilities.map((avail) => (
                            <div key={avail.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                              <span>
                                {avail.slot?.dayOfWeek !== undefined &&
                                  ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][avail.slot.dayOfWeek]}
                              </span>
                              {avail.slot?.startTime && avail.slot?.endTime && (
                                <span className="text-gray-600">
                                  {avail.slot.startTime} - {avail.slot.endTime}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">Chưa cập nhật lịch.</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardHeader>
                      <CardTitle>Học vấn & Chứng chỉ</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-3">Bằng cấp</h4>
                        {detailTutor.educations.length > 0 ? (
                          <div className="space-y-3">
                            {detailTutor.educations.map((edu) => (
                              <div key={edu.id} className="p-4 border rounded-lg space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                  <div>
                                    <p className="font-medium text-gray-900">{edu.institution?.name || 'Chưa có tên'}</p>
                                    {edu.issueDate && (
                                      <p className="text-sm text-gray-600">
                                        Tốt nghiệp: {new Date(edu.issueDate).toLocaleDateString('vi-VN')}
                                      </p>
                                    )}
                                  </div>
                                  <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                                    {EnumHelpers.getVerifyStatusLabel(edu.verified)}
                                  </Badge>
                                </div>
                                {edu.certificateUrl && (
                                  <div className="relative group cursor-zoom-in" onClick={() => setPreviewImage(edu.certificateUrl)}>
                                    <img
                                      src={edu.certificateUrl}
                                      alt="Bằng cấp"
                                      className="w-full max-h-64 object-cover rounded-lg border"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">Chưa có thông tin bằng cấp.</p>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Chứng chỉ</h4>
                        {detailTutor.certificates.length > 0 ? (
                          <div className="space-y-3">
                            {detailTutor.certificates.map((cert) => (
                              <div key={cert.id} className="p-4 border rounded-lg space-y-3">
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
                                  <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                                    {EnumHelpers.getVerifyStatusLabel(cert.verified)}
                                  </Badge>
                                </div>
                                {cert.certificateUrl && (
                                  <div className="relative group cursor-zoom-in" onClick={() => setPreviewImage(cert.certificateUrl)}>
                                    <img
                                      src={cert.certificateUrl}
                                      alt="Chứng chỉ"
                                      className="w-full max-h-64 object-cover rounded-lg border"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">Chưa có thông tin chứng chỉ.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                  <Card className="border border-gray-200">
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
                          <span className="font-medium">{EnumHelpers.getTeachingModeLabel(detailTutor.teachingModes)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-6">Không có dữ liệu</div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl bg-transparent border-none shadow-none p-0" aria-describedby={undefined}>
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

