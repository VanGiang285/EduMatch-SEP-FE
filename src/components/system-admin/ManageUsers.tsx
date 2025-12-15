"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/basic/avatar';
import { Input } from '@/components/ui/form/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/navigation/pagination';
import { 
  Users,
  Search,
  UserPlus,
  CheckCircle,
  XCircle,
  Filter,
  Loader2,
  ArrowUpDown,
} from 'lucide-react';
import { CreateBusinessAdminDialog } from './CreateBusinessAdminDialog';
import { AdminService } from '@/services/adminService';
import { ManageUserDto } from '@/types/backend';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomToast } from '@/hooks/useCustomToast';

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
  [ROLE.SYSTEM_ADMIN]: {
    label: 'System Admin',
    className: 'bg-red-100 text-red-800 border-2 border-red-400 font-semibold px-3 py-1',
  },
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

export function ManageUsers() {
  const { user } = useAuth();
  const { showSuccess, showError } = useCustomToast();
  const [users, setUsers] = useState<ManageUserDto[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ManageUserDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState<string | null>(null);
  const [isDeactivating, setIsDeactivating] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'id' | 'name' | 'email' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Load users from API
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const response = await AdminService.getAllUsers();
        if (response.success && response.data) {
          // Filter out current system admin and ensure data has required fields
          const filtered = response.data
            .filter(u => u.email !== user?.email || resolveRoleId(u) !== ROLE.SYSTEM_ADMIN)
            .map(u => ({
              ...u,
              // Ensure roleId exists - map from roleName if needed
              roleId: u.roleId || (u.roleName === 'Learner' ? 1 : 
                                  u.roleName === 'Tutor' ? 2 :
                                  u.roleName === 'Business Admin' ? 3 :
                                  u.roleName === 'System Admin' ? 4 : 1),
              // Ensure isActive is boolean
              isActive: u.isActive !== undefined ? u.isActive : true
            }));
          setUsers(filtered);
        } else {
          showError('Lỗi', response.message || 'Không thể tải danh sách người dùng');
        }
      } catch (error: any) {
        console.error('Error loading users:', error);
        showError('Lỗi', 'Không thể tải danh sách người dùng. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Filter and sort users
  useEffect(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        (u.userName?.toLowerCase().includes(term) || false) ||
        u.email.toLowerCase().includes(term) ||
        (u.phone?.toLowerCase().includes(term) || false)
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      const selectedRoleId = Number(filterRole);
      filtered = filtered.filter((u) => resolveRoleId(u) === selectedRoleId);
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'active') {
        // Only show users with isActive === true
        filtered = filtered.filter(u => u.isActive === true);
      } else if (filterStatus === 'inactive') {
        // Show users with isActive === false, undefined, or null
        filtered = filtered.filter(u => u.isActive !== true);
      }
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
          valueA = (a.email || '').toLowerCase();
          valueB = (b.email || '').toLowerCase();
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
    setCurrentPage(1); // Reset to first page when filters change
  }, [users, searchTerm, filterRole, filterStatus, sortField, sortDirection]);

  const handleSort = (field: 'id' | 'name' | 'email' | 'createdAt') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'createdAt' ? 'desc' : 'asc');
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Get status badge
  const getStatusBadge = (isActive: boolean | undefined) => {
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Hoạt động</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Chưa kích hoạt</Badge>;
  };

  // Get role name
  const getRoleName = (roleId: number | null | undefined) => {
    switch (roleId) {
      case ROLE.LEARNER:
        return 'Học viên';
      case ROLE.TUTOR:
        return 'Gia sư';
      case ROLE.BUSINESS_ADMIN:
        return 'Business Admin';
      case ROLE.SYSTEM_ADMIN:
        return 'System Admin';
      default:
        return 'Không xác định';
    }
  };

  // Handle activate user
  const handleActivateUser = async (email: string) => {
    setIsActivating(email);
    try {
      const response = await AdminService.activateUser(email);
      if (response.success) {
        setUsers(users.map(u => 
          u.email === email ? { ...u, isActive: true } : u
        ));
        showSuccess('Thành công', 'Đã kích hoạt tài khoản thành công');
      } else {
        showError('Lỗi', response.message || 'Không thể kích hoạt tài khoản');
      }
    } catch (error: any) {
      console.error('Error activating user:', error);
      showError('Lỗi', 'Không thể kích hoạt tài khoản. Vui lòng thử lại.');
    } finally {
      setIsActivating(null);
    }
  };

  // Handle deactivate user
  const handleDeactivateUser = async (email: string) => {
    setIsDeactivating(email);
    try {
      const response = await AdminService.deactivateUser(email);
      if (response.success) {
        setUsers(users.map(u => 
          u.email === email ? { ...u, isActive: false } : u
        ));
        showSuccess('Thành công', 'Đã vô hiệu hóa tài khoản thành công');
      } else {
        showError('Lỗi', response.message || 'Không thể vô hiệu hóa tài khoản');
      }
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      showError('Lỗi', 'Không thể vô hiệu hóa tài khoản. Vui lòng thử lại.');
    } finally {
      setIsDeactivating(null);
    }
  };

  // Handle create admin success
  const handleCreateAdmin = () => {
    // Reload users after creating admin
    const loadUsers = async () => {
      try {
        const response = await AdminService.getAllUsers();
        if (response.success && response.data) {
          const filtered = response.data.filter(u => 
            u.email !== user?.email || u.roleId !== 4
          );
          setUsers(filtered);
          showSuccess('Thành công', 'Đã tạo tài khoản Business Admin thành công');
        }
      } catch (error) {
        console.error('Error reloading users:', error);
      }
    };
    loadUsers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý người dùng</h1>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý tất cả tài khoản người dùng trong hệ thống EduMatch
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          size="lg"
          className="bg-[#257180] hover:bg-[#257180]/90 text-white"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Tạo Business Admin
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Role */}
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
                <SelectItem value={ROLE.SYSTEM_ADMIN.toString()}>System Admin</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Status */}
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

      {/* Users Table */}
      <Card className="bg-white border border-gray-300">
        <CardHeader className="border-b border-[#257180]/20 bg-gray-50">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#257180]" />
            Danh sách người dùng
            <div className="flex items-center gap-2 ml-2 text-gray-700">
              <Users className="h-4 w-4" />
              <span className="font-medium text-gray-900">{filteredUsers.length} người dùng</span>
            </div>
          </CardTitle>
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
                    <TableRow className="bg-gray-50 border-b border-[#257180]/20">
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
                        <TableRow key={record.email} className="hover:bg-gray-50 border-b border-[#257180]/20">
                          <TableCell className="text-left">
                            <span className="font-mono text-sm text-gray-600">{startIndex + index + 1}</span>
                          </TableCell>
                          <TableCell className="text-left">
                            <div className="flex items-center gap-3 min-w-0 max-w-[220px]">
                              <Avatar className="h-10 w-10 rounded-lg border border-[#F2E5BF] bg-[#F2E5BF] text-[#257180] font-semibold">
                                <AvatarImage
                                  src={record.avatarUrl}
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
                              const badgeClass =
                                (roleId && ROLE_BADGES[roleId]?.className) ||
                                'bg-gray-100 text-gray-700 border-2 border-gray-300 font-semibold px-3 py-1';
                              return (
                                <Badge className={badgeClass}>
                                  {roleId ? ROLE_BADGES[roleId]?.label || getRoleName(roleId) : record.roleName || 'Không xác định'}
                                </Badge>
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

      {/* Create Business Admin Dialog */}
      <CreateBusinessAdminDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateSuccess={handleCreateAdmin}
      />
    </div>
  );
}
