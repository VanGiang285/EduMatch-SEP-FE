"use client";

import React, { useState } from 'react';
import { AdminService, ManageUserDto } from '@/services/adminService';
import { ROLE_LABELS, ROLE_ID_MAP } from '@/constants';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { Badge } from '@/components/ui/basic/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/layout/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/feedback/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/feedback/alert-dialog';
import { useCustomToast } from '@/hooks/useCustomToast';
import { Search, Filter, MoreHorizontal, UserCheck, UserX, Shield, Mail, Phone, Calendar, Eye, Users, UserPlus, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface SystemAdminUserManagementProps {
  className?: string;
}

export default function SystemAdminUserManagement({ className }: SystemAdminUserManagementProps) {
  const [users, setUsers] = useState<ManageUserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<ManageUserDto | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [newRoleId, setNewRoleId] = useState<number>(1);
  const [showCreateAdminDialog, setShowCreateAdminDialog] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const { showSuccess, showError } = useCustomToast();

  // Load users on component mount
  React.useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await AdminService.getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        showError('Không thể tải danh sách người dùng');
      }
    } catch (error) {
      showError('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateUser = async (email: string) => {
    try {
      const response = await AdminService.deactivateUser(email);
      if (response.success) {
        showSuccess(`Đã vô hiệu hóa tài khoản ${email}`);
        loadUsers();
      } else {
        showError('Lỗi khi vô hiệu hóa tài khoản');
      }
    } catch (error) {
      showError('Lỗi khi vô hiệu hóa tài khoản');
    }
  };

  const handleActivateUser = async (email: string) => {
    try {
      const response = await AdminService.activateUser(email);
      if (response.success) {
        showSuccess(`Đã kích hoạt tài khoản ${email}`);
        loadUsers();
      } else {
        showError('Lỗi khi kích hoạt tài khoản');
      }
    } catch (error) {
      showError('Lỗi khi kích hoạt tài khoản');
    }
  };

  const handleUpdateUserRole = async (email: string, roleId: number) => {
    try {
      const response = await AdminService.updateUserRole(email, roleId);
      if (response.success) {
        showSuccess('Đã cập nhật vai trò người dùng');
        loadUsers();
      } else {
        showError('Lỗi khi cập nhật vai trò');
      }
    } catch (error) {
      showError('Lỗi khi cập nhật vai trò');
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdminEmail.trim()) {
      showError('Vui lòng nhập email');
      return;
    }

    try {
      const response = await AdminService.createAdminAccount({ email: newAdminEmail });
      if (response.success) {
        showSuccess('Đã tạo tài khoản Business Admin thành công');
        setNewAdminEmail('');
        setShowCreateAdminDialog(false);
        loadUsers();
      } else {
        showError('Lỗi khi tạo tài khoản admin');
      }
    } catch (error) {
      showError('Lỗi khi tạo tài khoản admin');
    }
  };

  const openRoleDialog = (user: ManageUserDto) => {
    setSelectedUser(user);
    setNewRoleId(getUserRole(user));
    setShowRoleDialog(true);
  };

  const openUserDetail = (user: ManageUserDto) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  const getUserRole = (user: ManageUserDto) => {
    // Determine role based on subjects length and email patterns
    if (user.subjects && user.subjects.length > 0) {
      return 2; // Tutor
    } else if (user.email.includes('admin') || user.email.includes('business')) {
      return 3; // Business Admin
    } else if (user.email.includes('system')) {
      return 4; // System Admin
    } else {
      return 1; // Learner
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const userRole = getUserRole(user).toString();
    const matchesRole = roleFilter === 'all' || userRole === roleFilter;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive === true) ||
      (statusFilter === 'inactive' && user.isActive === false) ||
      (statusFilter === 'null' && user.isActive === null);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const getRoleLabel = (user: ManageUserDto) => {
    const roleId = getUserRole(user);
    const roleKey = ROLE_ID_MAP[roleId as keyof typeof ROLE_ID_MAP];
    return roleKey ? ROLE_LABELS[roleKey as keyof typeof ROLE_LABELS] : 'Không xác định';
  };

  const getRoleColor = (user: ManageUserDto) => {
    const roleId = getUserRole(user);
    switch (roleId) {
      case 1: return 'bg-blue-100 text-blue-800 border-blue-200'; // learner
      case 2: return 'bg-green-100 text-green-800 border-green-200'; // tutor
      case 3: return 'bg-purple-100 text-purple-800 border-purple-200'; // business admin
      case 4: return 'bg-red-100 text-red-800 border-red-200'; // system admin
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string | undefined | null, formatStr: string = 'dd/MM/yyyy') => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, formatStr, { locale: vi });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };

  // Statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive === true);
  const systemAdmins = users.filter(u => getUserRole(u) === 4);
  const businessAdmins = users.filter(u => getUserRole(u) === 3);
  const tutors = users.filter(u => getUserRole(u) === 2);
  const learners = users.filter(u => getUserRole(u) === 1);

  const currentUserEmail = "adminsystem@gmail.com"; // This should come from auth context

  return (
    <div className={`space-y-6 ${className}`} style={{ 
      overflowX: 'hidden'
    }}>
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[#FD8B51] p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="h-8 w-8 mr-3 text-[#257180]" />
              Quản lý người dùng
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý tài khoản người dùng và phân quyền trong hệ thống
            </p>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={() => setShowCreateAdminDialog(true)}
              className="bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Tạo Admin
            </Button>
            <Button 
              onClick={loadUsers} 
              disabled={loading}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-[#F2E5BF] hover:border-[#FD8B51]"
            >
              {loading ? 'Đang tải...' : 'Làm mới'}
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">{totalUsers}</p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Admin</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">{systemAdmins.length}</p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Business Admin</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">{businessAdmins.length}</p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gia sư</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">{tutors.length}</p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Học viên</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">{learners.length}</p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo email, tên..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                />
              </div>
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-[#257180] focus:ring-[#257180]">
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent className="z-[9999]" style={{ overflowY: 'visible' }}>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="1">Học viên</SelectItem>
                <SelectItem value="2">Gia sư</SelectItem>
                <SelectItem value="3">Business Admin</SelectItem>
                <SelectItem value="4">System Admin</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-[#257180] focus:ring-[#257180]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="z-[9999]" style={{ overflowY: 'visible' }}>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Bị vô hiệu hóa</SelectItem>
                <SelectItem value="null">Chưa xác định</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <Users className="h-5 w-5 mr-2 text-gray-600" />
            Danh sách người dùng ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#F2E5BF]">
                <TableRow>
                  <TableHead className="font-semibold text-gray-900">Thông tin</TableHead>
                  <TableHead className="font-semibold text-gray-900">Vai trò</TableHead>
                  <TableHead className="font-semibold text-gray-900">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-gray-900">Ngày tạo</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user, index) => (
                  <TableRow key={`${user.email}-${index}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-[#F2E5BF] flex items-center justify-center">
                          <span className="text-sm font-medium text-[#257180]">
                            {user.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.userName}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={`${getRoleColor(user)} border`}>
                        {getRoleLabel(user)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <Badge 
                        className={`border ${
                          user.isActive === true 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : user.isActive === false
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        }`}
                      >
                        {user.isActive === true ? 'Hoạt động' : user.isActive === false ? 'Vô hiệu hóa' : 'Chưa xác định'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(user.createAt)}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUserDetail(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {user.email !== currentUserEmail && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRoleDialog(user)}
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                            
                            {user.isActive ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Vô hiệu hóa người dùng</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bạn có chắc chắn muốn vô hiệu hóa người dùng {user.email}? 
                                      Họ sẽ không thể đăng nhập vào hệ thống.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeactivateUser(user.email)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Vô hiệu hóa
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Kích hoạt người dùng</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bạn có chắc chắn muốn kích hoạt người dùng {user.email}? 
                                      Họ sẽ có thể đăng nhập vào hệ thống.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleActivateUser(user.email)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Kích hoạt
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Không tìm thấy người dùng nào</p>
                <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc để tìm kiếm</p>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Hiển thị</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                  setItemsPerPage(parseInt(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]" style={{ overflowY: 'visible' }}>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-700">
                  trong {filteredUsers.length} kết quả
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 p-0 ${
                          currentPage === pageNum 
                            ? "bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white" 
                            : ""
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-[#F2E5BF] flex items-center justify-center">
                  <span className="text-lg font-medium text-[#257180]">
                    {selectedUser.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedUser.userName}
                  </h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Vai trò</label>
                  <p className="text-sm">
                    <Badge className={`${getRoleColor(selectedUser)} border`}>
                      {getRoleLabel(selectedUser)}
                    </Badge>
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                  <p className="text-sm">
                    <Badge 
                      className={`border ${
                        selectedUser.isActive === true 
                          ? "bg-green-100 text-green-800 border-green-200" 
                          : selectedUser.isActive === false
                          ? "bg-red-100 text-red-800 border-red-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      }`}
                    >
                      {selectedUser.isActive === true ? 'Hoạt động' : selectedUser.isActive === false ? 'Vô hiệu hóa' : 'Chưa xác định'}
                    </Badge>
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                  <p className="text-sm">
                    {formatDate(selectedUser.createAt, 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                
                {selectedUser.subjects && selectedUser.subjects.length > 0 && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Môn học</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedUser.subjects.map((subject, index) => (
                        <Badge key={index} className="bg-blue-100 text-blue-800 border border-blue-200">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedUser.hourlyRate && selectedUser.hourlyRate.length > 0 && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Mức phí (VND/giờ)</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedUser.hourlyRate.map((rate, index) => (
                        <Badge key={index} className="bg-green-100 text-green-800 border border-green-200">
                          {rate.toLocaleString('vi-VN')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDetail(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thay đổi vai trò</DialogTitle>
            <DialogDescription>
              Thay đổi vai trò cho tài khoản {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Vai trò hiện tại</label>
              <p className="text-sm">
                {selectedUser && (
                  <Badge className={`${getRoleColor(selectedUser)} border`}>
                    {getRoleLabel(selectedUser)}
                  </Badge>
                )}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Vai trò mới</label>
              <Select value={newRoleId.toString()} onValueChange={(value: string) => setNewRoleId(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[9999]" style={{ overflowY: 'visible' }}>
                  <SelectItem value="1">Học viên</SelectItem>
                  <SelectItem value="2">Gia sư</SelectItem>
                  <SelectItem value="3">Business Admin</SelectItem>
                  <SelectItem value="4">System Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Hủy
            </Button>
            <Button 
              onClick={() => {
                if (selectedUser) {
                  handleUpdateUserRole(selectedUser.email, newRoleId);
                  setShowRoleDialog(false);
                }
              }}
              className="bg-[#FD8B51] hover:bg-[#FD8B51]/90"
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Admin Dialog */}
      <Dialog open={showCreateAdminDialog} onOpenChange={setShowCreateAdminDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo tài khoản Business Admin</DialogTitle>
            <DialogDescription>
              Tạo tài khoản Business Admin mới
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <Input
                type="email"
                placeholder="admin@example.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateAdminDialog(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleCreateAdmin}
              className="bg-[#FD8B51] hover:bg-[#FD8B51]/90"
            >
              Tạo tài khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}