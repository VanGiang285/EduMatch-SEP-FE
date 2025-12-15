'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { Badge } from '@/components/ui/basic/badge';
import { Textarea } from '@/components/ui/form/textarea';
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
  DialogFooter,
} from '@/components/ui/feedback/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/navigation/pagination';
import { Label } from '@/components/ui/form/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select';
import { Search, Eye, Plus, Edit, Loader2, ArrowUpDown, CheckCircle, XCircle, FileText } from 'lucide-react';
import { RefundPolicyService } from '@/services';
import { RefundPolicyDto } from '@/types/backend';
import { RefundPolicyCreateRequest, RefundPolicyUpdateRequest } from '@/types/requests';
import { useCustomToast } from '@/hooks/useCustomToast';

const ITEMS_PER_PAGE = 10;

type SortField = 'id' | 'name' | 'refundPercentage' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export function ManageRefundPolicies() {
  const { showSuccess, showError } = useCustomToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPolicy, setSelectedPolicy] = useState<RefundPolicyDto | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [policies, setPolicies] = useState<RefundPolicyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    refundPercentage: 0,
  });

  useEffect(() => {
    fetchPolicies();
  }, [statusFilter]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      let response;
      
      if (statusFilter === 'all') {
        const [activeRes, inactiveRes] = await Promise.all([
          RefundPolicyService.getAll(true),
          RefundPolicyService.getAll(false),
        ]);
        
        const allPolicies: RefundPolicyDto[] = [];
        if (activeRes.success && activeRes.data) allPolicies.push(...activeRes.data);
        if (inactiveRes.success && inactiveRes.data) allPolicies.push(...inactiveRes.data);
        
        setPolicies(allPolicies);
      } else {
        response = await RefundPolicyService.getAll(statusFilter === 'active');
        if (response.success && response.data) {
          setPolicies(response.data);
        } else {
          setPolicies([]);
        }
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      showError('Lỗi', 'Không thể tải danh sách chính sách hoàn tiền');
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredPolicies = useMemo(() => {
    let filtered = policies.filter((policy) => {
      const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (policy.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'refundPercentage':
          aValue = a.refundPercentage;
          bValue = b.refundPercentage;
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
  }, [policies, searchTerm, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredPolicies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPolicies = filteredPolicies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleViewDetail = (policy: RefundPolicyDto) => {
    setSelectedPolicy(policy);
    setShowDetailDialog(true);
  };

  const handleCreate = () => {
    setFormData({ name: '', description: '', refundPercentage: 0 });
    setShowCreateDialog(true);
  };

  const handleEdit = (policy: RefundPolicyDto) => {
    setSelectedPolicy(policy);
    setFormData({
      name: policy.name,
      description: policy.description || '',
      refundPercentage: policy.refundPercentage,
    });
    setShowEditDialog(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.name.trim()) {
      showError('Lỗi', 'Vui lòng nhập tên chính sách');
      return;
    }
    if (formData.refundPercentage < 0 || formData.refundPercentage > 100) {
      showError('Lỗi', 'Phần trăm hoàn tiền phải từ 0 đến 100');
      return;
    }

    try {
      setIsProcessing(true);
      const request: RefundPolicyCreateRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        refundPercentage: formData.refundPercentage,
      };
      const response = await RefundPolicyService.create(request);
      if (response.success) {
        showSuccess('Thành công', 'Đã tạo chính sách hoàn tiền mới');
        setShowCreateDialog(false);
        fetchPolicies();
      } else {
        showError('Lỗi', response.message || 'Không thể tạo chính sách hoàn tiền');
      }
    } catch (error) {
      console.error('Error creating policy:', error);
      showError('Lỗi', 'Không thể tạo chính sách hoàn tiền');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitUpdate = async () => {
    if (!selectedPolicy) return;
    if (!formData.name.trim()) {
      showError('Lỗi', 'Vui lòng nhập tên chính sách');
      return;
    }
    if (formData.refundPercentage < 0 || formData.refundPercentage > 100) {
      showError('Lỗi', 'Phần trăm hoàn tiền phải từ 0 đến 100');
      return;
    }

    try {
      setIsProcessing(true);
      const request: RefundPolicyUpdateRequest = {
        id: selectedPolicy.id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        refundPercentage: formData.refundPercentage,
      };
      const response = await RefundPolicyService.update(request);
      if (response.success) {
        showSuccess('Thành công', 'Đã cập nhật chính sách hoàn tiền');
        setShowEditDialog(false);
        fetchPolicies();
      } else {
        showError('Lỗi', response.message || 'Không thể cập nhật chính sách hoàn tiền');
      }
    } catch (error) {
      console.error('Error updating policy:', error);
      showError('Lỗi', 'Không thể cập nhật chính sách hoàn tiền');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleActive = async (policy: RefundPolicyDto) => {
    try {
      setIsProcessing(true);
      const response = await RefundPolicyService.updateIsActive(policy.id, !policy.isActive);
      if (response.success) {
        showSuccess('Thành công', `Đã ${policy.isActive ? 'vô hiệu hóa' : 'kích hoạt'} chính sách hoàn tiền`);
        fetchPolicies();
      } else {
        showError('Lỗi', response.message || 'Không thể cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error toggling active:', error);
      showError('Lỗi', 'Không thể cập nhật trạng thái');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Quản lý Chính sách Hoàn tiền</h1>
        <p className="text-gray-600 mt-1">Quản lý các chính sách hoàn tiền cho học viên</p>
      </div>

      <Card className="bg-white border border-gray-300">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as 'all' | 'active' | 'inactive');
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleCreate} className="bg-[#257180] hover:bg-[#257180]/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Thêm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách chính sách hoàn tiền</CardTitle>
            <div className="flex items-center gap-2 text-gray-700">
              <FileText className="h-4 w-4" />
              <span className="font-medium">{filteredPolicies.length} chính sách</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#257180]" />
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
                          Tên chính sách <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-left">
                        <Button variant="ghost" size="sm" onClick={() => handleSort('refundPercentage')} className="h-8 px-2">
                          Phần trăm hoàn tiền <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-left">Trạng thái</TableHead>
                      <TableHead className="text-left">
                        <Button variant="ghost" size="sm" onClick={() => handleSort('createdAt')} className="h-8 px-2">
                          Ngày tạo <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-left">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPolicies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Không có chính sách hoàn tiền nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedPolicies.map((policy, index) => (
                        <TableRow key={policy.id} className="hover:bg-gray-50">
                          <TableCell className="text-left">
                            <span className="font-mono text-sm text-gray-600">{startIndex + index + 1}</span>
                          </TableCell>
                          <TableCell className="text-left">
                            <p className="font-medium text-gray-900">{policy.name}</p>
                            {policy.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{policy.description}</p>
                            )}
                          </TableCell>
                          <TableCell className="text-left">
                            <span className="font-semibold text-[#257180]">{policy.refundPercentage}%</span>
                          </TableCell>
                          <TableCell className="text-left">
                            <Badge className={policy.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                              {policy.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 text-left">
                            {new Date(policy.createdAt).toLocaleDateString('vi-VN')}
                          </TableCell>
                          <TableCell className="text-left">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(policy)}
                                className="p-2 hover:bg-[#FD8B51] hover:text-white"
                              >
                                <Eye className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(policy)}
                                className="p-2 hover:bg-[#FD8B51] hover:text-white"
                              >
                                <Edit className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleActive(policy)}
                                disabled={isProcessing}
                                className={`p-2 hover:bg-[#FD8B51] hover:text-white ${policy.isActive ? 'text-red-600' : 'text-green-600'}`}
                              >
                                {policy.isActive ? <XCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
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
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl border-gray-300 shadow-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Chi tiết chính sách hoàn tiền</DialogTitle>
          </DialogHeader>
          {selectedPolicy && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-600">Tên chính sách</Label>
                <p className="font-medium text-gray-900 mt-1">{selectedPolicy.name}</p>
              </div>
              {selectedPolicy.description && (
                <div>
                  <Label className="text-sm text-gray-600">Mô tả</Label>
                  <p className="text-gray-900 mt-1">{selectedPolicy.description}</p>
                </div>
              )}
              <div>
                <Label className="text-sm text-gray-600">Phần trăm hoàn tiền</Label>
                <p className="font-semibold text-[#257180] text-lg mt-1">{selectedPolicy.refundPercentage}%</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Trạng thái</Label>
                <Badge className={`mt-1 ${selectedPolicy.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                  {selectedPolicy.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                </Badge>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Ngày tạo</Label>
                <p className="text-gray-900 mt-1">{new Date(selectedPolicy.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              {selectedPolicy.updatedAt && (
                <div>
                  <Label className="text-sm text-gray-600">Ngày cập nhật</Label>
                  <p className="text-gray-900 mt-1">{new Date(selectedPolicy.updatedAt).toLocaleString('vi-VN')}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl border-gray-300 shadow-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Thêm chính sách hoàn tiền mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Tên chính sách *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên chính sách..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả..."
                className="mt-1"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="refundPercentage">Phần trăm hoàn tiền (%) *</Label>
              <Input
                id="refundPercentage"
                type="number"
                min="0"
                max="100"
                value={formData.refundPercentage}
                onChange={(e) => setFormData({ ...formData, refundPercentage: parseFloat(e.target.value) || 0 })}
                placeholder="0-100"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]">
              Hủy
            </Button>
            <Button onClick={handleSubmitCreate} disabled={isProcessing} className="bg-[#257180] hover:bg-[#257180]/90 text-white">
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Tạo mới
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl border-gray-300 shadow-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Cập nhật chính sách hoàn tiền</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Tên chính sách *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên chính sách..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả..."
                className="mt-1"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="edit-refundPercentage">Phần trăm hoàn tiền (%) *</Label>
              <Input
                id="edit-refundPercentage"
                type="number"
                min="0"
                max="100"
                value={formData.refundPercentage}
                onChange={(e) => setFormData({ ...formData, refundPercentage: parseFloat(e.target.value) || 0 })}
                placeholder="0-100"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]">
              Hủy
            </Button>
            <Button onClick={handleSubmitUpdate} disabled={isProcessing} className="bg-[#257180] hover:bg-[#257180]/90 text-white">
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

