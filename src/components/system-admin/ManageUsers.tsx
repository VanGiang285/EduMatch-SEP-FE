"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/navigation/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/feedback/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/navigation/pagination';
import { Alert, AlertDescription } from '@/components/ui/feedback/alert';
import { 
  Users, 
  Search, 
  MoreHorizontal, 
  UserPlus,
  CheckCircle,
  XCircle,
  Ban,
  RotateCcw,
  Eye,
  Filter,
  Trash2
} from 'lucide-react';
import { CreateBusinessAdminDialog } from './CreateBusinessAdminDialog';

// Mock data
const initialUsers = [
  {
    userId: 1,
    fullName: 'Trần Thị Hoa',
    email: 'hoa.tran@gmail.com',
    phoneNumber: '0901234567',
    avatarUrl: '',
    status: 1, // Active
    roles: [
      { roleType: 0, roleName: 'Học viên', isPrimary: true },
    ],
    createdAt: '2024-01-15',
  },
  {
    userId: 2,
    fullName: 'Nguyễn Văn Nam',
    email: 'nam.nguyen@gmail.com',
    phoneNumber: '0912345678',
    avatarUrl: '',
    status: 1,
    roles: [
      { roleType: 0, roleName: 'Học viên', isPrimary: true },
      { roleType: 1, roleName: 'Gia sư', isPrimary: false },
    ],
    createdAt: '2024-02-20',
  },
  {
    userId: 3,
    fullName: 'Phạm Minh Tuấn',
    email: 'tuan.pham@gmail.com',
    phoneNumber: '0923456789',
    avatarUrl: '',
    status: 2, // Suspended
    roles: [
      { roleType: 1, roleName: 'Gia sư', isPrimary: true },
    ],
    createdAt: '2024-03-10',
  },
  {
    userId: 4,
    fullName: 'Lê Thị Mai',
    email: 'mai.le@gmail.com',
    phoneNumber: '0934567890',
    avatarUrl: '',
    status: 0, // Inactive
    roles: [
      { roleType: 0, roleName: 'Học viên', isPrimary: true },
    ],
    createdAt: '2024-04-05',
  },
  {
    userId: 5,
    fullName: 'Hoàng Văn Đức',
    email: 'duc.hoang@edumatch.vn',
    phoneNumber: '0945678901',
    avatarUrl: '',
    status: 1,
    roles: [
      { roleType: 2, roleName: 'System Admin', isPrimary: true },
    ],
    createdAt: '2023-12-01',
  },
  {
    userId: 6,
    fullName: 'Võ Thị Lan',
    email: 'lan.vo@edumatch.vn',
    phoneNumber: '0956789012',
    avatarUrl: '',
    status: 1,
    roles: [
      { roleType: 3, roleName: 'Business Admin', isPrimary: true },
    ],
    createdAt: '2024-01-01',
  },
  {
    userId: 7,
    fullName: 'Đỗ Minh Quang',
    email: 'quang.do@gmail.com',
    phoneNumber: '0967890123',
    avatarUrl: '',
    status: 3, // Deleted
    roles: [
      { roleType: 0, roleName: 'Học viên', isPrimary: true },
    ],
    createdAt: '2024-02-15',
  },
  {
    userId: 8,
    fullName: 'Bùi Thị Thảo',
    email: 'thao.bui@gmail.com',
    phoneNumber: '0978901234',
    avatarUrl: '',
    status: 1,
    roles: [
      { roleType: 1, roleName: 'Gia sư', isPrimary: true },
    ],
    createdAt: '2024-03-20',
  },
  {
    userId: 9,
    fullName: 'Phan Văn Long',
    email: 'long.phan@gmail.com',
    phoneNumber: '0989012345',
    avatarUrl: '',
    status: 2,
    roles: [
      { roleType: 0, roleName: 'Học viên', isPrimary: true },
      { roleType: 1, roleName: 'Gia sư', isPrimary: false },
    ],
    createdAt: '2024-04-10',
  },
];

export function ManageUsers() {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Get status badge
  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">Chưa kích hoạt</Badge>;
      case 1:
        return <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Hoạt động</Badge>;
      case 2:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Tạm khóa</Badge>;
      case 3:
        return <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">Đã xóa</Badge>;
      default:
        return <Badge variant="secondary">Không xác định</Badge>;
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (roleType: number) => {
    switch (roleType) {
      case 0:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 1:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 2:
        return 'bg-red-100 text-red-800 border-red-200';
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || 
      user.roles.some(role => role.roleType === parseInt(filterRole));
    
    const matchesStatus = filterStatus === 'all' || 
      user.status === parseInt(filterStatus);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterStatus]);

  // Show success message
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Actions
  const handleActivateUser = (userId: number) => {
    setUsers(users.map(u => 
      u.userId === userId ? { ...u, status: 1 } : u
    ));
    showSuccess('Đã kích hoạt tài khoản thành công');
  };

  const handleDeactivateUser = (userId: number) => {
    setAlertDialog({
      open: true,
      title: 'Xác nhận vô hiệu hóa tài khoản',
      description: 'Người dùng sẽ không thể đăng nhập sau khi bị vô hiệu hóa. Bạn có chắc chắn muốn tiếp tục?',
      action: () => {
        setUsers(users.map(u => 
          u.userId === userId ? { ...u, status: 0 } : u
        ));
        showSuccess('Đã vô hiệu hóa tài khoản');
        setAlertDialog(null);
      }
    });
  };

  const handleSuspendUser = (userId: number) => {
    setAlertDialog({
      open: true,
      title: 'Xác nhận tạm khóa tài khoản',
      description: 'Tài khoản sẽ bị tạm khóa và người dùng không thể truy cập hệ thống. Bạn có muốn tiếp tục?',
      action: () => {
        setUsers(users.map(u => 
          u.userId === userId ? { ...u, status: 2 } : u
        ));
        showSuccess('Đã tạm khóa tài khoản');
        setAlertDialog(null);
      }
    });
  };

  const handleRestoreUser = (userId: number) => {
    setUsers(users.map(u => 
      u.userId === userId ? { ...u, status: 1 } : u
    ));
    showSuccess('Đã khôi phục tài khoản');
  };

  const handleDeleteUser = (userId: number) => {
    setAlertDialog({
      open: true,
      title: 'Xác nhận xóa tài khoản',
      description: 'Tài khoản sẽ bị đánh dấu là đã xóa. Bạn có chắc chắn muốn xóa tài khoản này?',
      action: () => {
        setUsers(users.map(u => 
          u.userId === userId ? { ...u, status: 3 } : u
        ));
        showSuccess('Đã xóa tài khoản');
        setAlertDialog(null);
      }
    });
  };

  const handleCreateAdmin = (adminData: any) => {
    setUsers([adminData, ...users]);
    showSuccess('Đã tạo tài khoản Business Admin thành công');
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

      {/* Success Message */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 text-sm">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc email..."
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
                <SelectItem value="0">Học viên</SelectItem>
                <SelectItem value="1">Gia sư</SelectItem>
                <SelectItem value="2">System Admin</SelectItem>
                <SelectItem value="3">Business Admin</SelectItem>
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
                <SelectItem value="0">Chưa kích hoạt</SelectItem>
                <SelectItem value="1">Hoạt động</SelectItem>
                <SelectItem value="2">Tạm khóa</SelectItem>
                <SelectItem value="3">Đã xóa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="hover:shadow-md transition-shadow">
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-[80px] text-left font-semibold text-gray-900">ID</TableHead>
                  <TableHead className="w-[200px] text-left font-semibold text-gray-900">Tên người dùng</TableHead>
                  <TableHead className="text-left font-semibold text-gray-900">Email</TableHead>
                  <TableHead className="text-left font-semibold text-gray-900">Vai trò</TableHead>
                  <TableHead className="text-left font-semibold text-gray-900">Trạng thái</TableHead>
                  <TableHead className="text-left font-semibold text-gray-900">Ngày tạo</TableHead>
                  <TableHead className="text-center font-semibold text-gray-900 w-[120px]">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow className="border-b border-gray-200">
                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-12 w-12 text-gray-300" />
                        <p>Không tìm thấy người dùng nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user, index) => (
                    <TableRow key={user.userId} className="hover:bg-gray-50 border-b border-gray-200">
                      <TableCell className="text-left">
                        <span className="font-mono text-sm text-gray-600">{startIndex + index + 1}</span>
                      </TableCell>
                      <TableCell className="text-left">
                        <p className="font-medium text-gray-900">{user.fullName}</p>
                      </TableCell>
                      <TableCell className="text-left text-sm text-gray-700">{user.email}</TableCell>
                      <TableCell className="text-left">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role, idx) => (
                            <Badge 
                              key={idx} 
                              variant="secondary" 
                              className={`text-xs ${getRoleBadgeColor(role.roleType)}`}
                            >
                              {role.roleName}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-left">
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell className="text-left text-sm text-gray-700">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <button className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors">
                                <MoreHorizontal className="h-4 w-4 text-gray-600" />
                              </button>
                            </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-white border border-[#FD8B51] z-[9999]">
                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            
                            {user.status === 0 && (
                              <DropdownMenuItem 
                                onClick={() => handleActivateUser(user.userId)}
                                className="cursor-pointer text-green-600 focus:text-green-600 focus:bg-green-50"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Kích hoạt
                              </DropdownMenuItem>
                            )}
                            
                            {user.status === 1 && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleDeactivateUser(user.userId)}
                                  className="cursor-pointer text-orange-600 focus:text-orange-600 focus:bg-orange-50"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Vô hiệu hóa
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleSuspendUser(user.userId)}
                                  className="cursor-pointer text-yellow-600 focus:text-yellow-600 focus:bg-yellow-50"
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  Tạm khóa
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {(user.status === 2 || user.status === 3) && (
                              <DropdownMenuItem 
                                onClick={() => handleRestoreUser(user.userId)}
                                className="cursor-pointer text-blue-600 focus:text-blue-600 focus:bg-blue-50"
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Khôi phục
                              </DropdownMenuItem>
                            )}

                            {user.status !== 3 && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteUser(user.userId)}
                                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Xóa tài khoản
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    // Show first page, last page, current page, and pages around current
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
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Business Admin Dialog */}
      <CreateBusinessAdminDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateSuccess={handleCreateAdmin}
      />

      {/* Confirmation Dialog */}
      {alertDialog && (
        <AlertDialog open={alertDialog.open} onOpenChange={() => setAlertDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {alertDialog.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setAlertDialog(null)}>
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={alertDialog.action}
                className="bg-[#257180] hover:bg-[#257180]/90 text-white"
              >
                Xác nhận
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

