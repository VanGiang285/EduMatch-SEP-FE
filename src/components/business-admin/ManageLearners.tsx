'use client';
import React, { useState, useMemo } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/feedback/dialog';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/basic/avatar';
import { Search, Eye, Ban, CheckCircle, Filter, ArrowUpDown } from 'lucide-react';
import { mockLearners, formatCurrency } from '@/data/mockBusinessAdminData';
// Toast: import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

type SortField = 'id' | 'userName' | 'email' | 'totalClasses' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export function ManageLearners() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLearner, setSelectedLearner] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [learners, setLearners] = useState(mockLearners);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort learners
  const filteredLearners = useMemo(() => {
    let filtered = learners.filter((learner) => {
      const matchesSearch = learner.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           learner.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && learner.isActive) ||
                           (statusFilter === 'inactive' && !learner.isActive);
      const matchesCity = cityFilter === 'all' || learner.profile.cityName === cityFilter;
      
      return matchesSearch && matchesStatus && matchesCity;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'userName':
          aValue = a.userName.toLowerCase();
          bValue = b.userName.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'totalClasses':
          aValue = a.stats.totalClasses;
          bValue = b.stats.totalClasses;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [learners, searchTerm, statusFilter, cityFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredLearners.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLearners = filteredLearners.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Get unique cities for filter
  const cities = Array.from(new Set(mockLearners.map(l => l.profile.cityName)));

  const handleViewDetail = (learner: any) => {
    setSelectedLearner(learner);
    setShowDetailDialog(true);
  };

  const handleToggleStatus = (learnerId: number) => {
    setLearners(prev => prev.map(l => 
      l.id === learnerId ? { ...l, isActive: !l.isActive } : l
    ));
    const learner = learners.find(l => l.id === learnerId);
    console.log(learner?.isActive 
      ? `Đã vô hiệu hóa tài khoản ${learner.userName}` 
      : `Đã kích hoạt tài khoản ${learner?.userName}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quản lý Học viên</h1>
        <p className="text-gray-600 mt-1">Quản lý danh sách học viên trong hệ thống</p>
      </div>

      {/* Filters */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Đã vô hiệu hóa</SelectItem>
              </SelectContent>
            </Select>

            {/* City Filter */}
            <Select value={cityFilter} onValueChange={(value) => {
              setCityFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Thành phố" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thành phố</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Learners Table */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">Danh sách học viên</CardTitle>
            <Badge variant="outline">{filteredLearners.length} học viên</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-[80px]">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('id')} className="h-8 px-2">
                      ID <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('userName')} className="h-8 px-2">
                      Học viên <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('email')} className="h-8 px-2">
                      Email <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('totalClasses')} className="h-8 px-2">
                      Số lớp <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLearners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Không tìm thấy học viên nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLearners.map((learner) => (
                    <TableRow key={learner.id} className="hover:bg-gray-50 border-b border-gray-200">
                      <TableCell>
                        <span className="font-mono text-sm text-gray-600">{learner.id}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={learner.avatarUrl} alt={learner.userName} />
                            <AvatarFallback className="bg-[#257180] text-white">
                              {learner.userName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{learner.userName}</p>
                            <p className="text-xs text-gray-500">
                              Tham gia {new Date(learner.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{learner.email}</TableCell>
                      <TableCell className="text-sm text-gray-600">{learner.phone}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <div>
                          <p>{learner.profile.cityName}</p>
                          <p className="text-xs text-gray-500">{learner.profile.subDistrictName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{learner.stats.totalClasses} lớp</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={learner.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        }>
                          {learner.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(learner)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(learner.id)}
                            className={learner.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                          >
                            {learner.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
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
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, idx) => (
                    <PaginationItem key={idx}>
                      <PaginationLink
                        onClick={() => setCurrentPage(idx + 1)}
                        isActive={currentPage === idx + 1}
                        className="cursor-pointer"
                      >
                        {idx + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
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

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="!max-w-2xl sm:!max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Chi tiết học viên</DialogTitle>
          </DialogHeader>
          
          {selectedLearner && (
            <div className="space-y-6">
              {/* Profile Info */}
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedLearner.avatarUrl} alt={selectedLearner.userName} />
                  <AvatarFallback className="bg-[#257180] text-white text-2xl">
                    {selectedLearner.userName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900">{selectedLearner.userName}</h3>
                  <p className="text-gray-600">{selectedLearner.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={selectedLearner.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                    }>
                      {selectedLearner.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Tham gia {new Date(selectedLearner.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Số điện thoại</p>
                  <p className="font-medium">{selectedLearner.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày sinh</p>
                  <p className="font-medium">
                    {new Date(selectedLearner.profile.dob).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Giới tính</p>
                  <p className="font-medium">
                    {selectedLearner.profile.gender === 1 ? 'Nam' : 'Nữ'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Địa chỉ</p>
                  <p className="font-medium">{selectedLearner.profile.cityName}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Địa chỉ chi tiết</p>
                  <p className="font-medium">
                    {selectedLearner.profile.addressLine}, {selectedLearner.profile.subDistrictName}, {selectedLearner.profile.cityName}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">Tổng số lớp</p>
                    <p className="text-2xl font-semibold text-[#257180]">{selectedLearner.stats.totalClasses}</p>
                  </CardContent>
                </Card>
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">Tổng booking</p>
                    <p className="text-2xl font-semibold text-[#257180]">{selectedLearner.stats.totalBookings}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  Đóng
                </Button>
                <Button
                  variant={selectedLearner.isActive ? 'destructive' : 'default'}
                  size="lg"
                  onClick={() => {
                    handleToggleStatus(selectedLearner.id);
                    setShowDetailDialog(false);
                  }}
                  className={!selectedLearner.isActive ? 'bg-[#257180] hover:bg-[#257180]/90 text-white' : ''}
                >
                  {selectedLearner.isActive ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt tài khoản'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
