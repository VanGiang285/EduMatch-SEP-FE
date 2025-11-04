'use client';
import React, { useState, useMemo } from 'react';
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
} from '@/components/ui/feedback/dialog';
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
import { Separator } from '@/components/ui/layout/separator';
import { Label } from '@/components/ui/form/label';
import { Search, Eye, CheckCircle, XCircle, AlertTriangle, FileText, ExternalLink, ArrowUpDown } from 'lucide-react';
import { 
  mockReports,
  getReportStatusText,
  getReportStatusColor,
} from '@/data/mockBusinessAdminData';
// Toast: import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

type SortField = 'id' | 'reporterName' | 'reportedTutorName' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export function ManageReports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [reports, setReports] = useState(mockReports);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    let filtered = reports.filter((report) => {
      const matchesSearch = report.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.reportedTutorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'pending' && report.status === 0) ||
                           (statusFilter === 'resolved' && report.status === 1);
      
      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'reporterName':
          aValue = a.reporterName.toLowerCase();
          bValue = b.reporterName.toLowerCase();
          break;
        case 'reportedTutorName':
          aValue = a.reportedTutorName.toLowerCase();
          bValue = b.reportedTutorName.toLowerCase();
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
  }, [reports, searchTerm, statusFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleViewDetail = (report: any) => {
    setSelectedReport(report);
    setShowDetailDialog(true);
  };

  const handleResolve = () => {
    if (!adminNote.trim()) {
      console.log('Error: Vui lòng nhập ghi chú xử lý');
      return;
    }
    setReports(prev => prev.map(rep => 
      rep.id === selectedReport.id 
        ? { ...rep, status: 1, adminNote, resolvedAt: new Date().toISOString() } 
        : rep
    ));
    console.log('Success: Đã xử lý báo cáo');
    setShowResolveDialog(false);
    setShowDetailDialog(false);
    setAdminNote('');
  };

  const handleReject = () => {
    if (!adminNote.trim()) {
      console.log('Error: Vui lòng nhập lý do từ chối');
      return;
    }
    setReports(prev => prev.map(rep => 
      rep.id === selectedReport.id 
        ? { ...rep, status: 2, adminNote } 
        : rep
    ));
    console.log('Success: Đã từ chối báo cáo');
    setShowRejectDialog(false);
    setShowDetailDialog(false);
    setAdminNote('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Quản lý Báo cáo</h1>
        <p className="text-gray-600 mt-1">Xử lý báo cáo từ người dùng về gia sư</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo người báo cáo hoặc gia sư..."
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
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="resolved">Đã xử lý</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách báo cáo</CardTitle>
            <Badge variant="outline">{filteredReports.length} báo cáo</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[80px]">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('id')} className="h-8 px-2">
                      ID <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('reporterName')} className="h-8 px-2">
                      Người báo cáo <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('reportedTutorName')} className="h-8 px-2">
                      Gia sư bị báo cáo <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Lý do</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('createdAt')} className="h-8 px-2">
                      Ngày báo cáo <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Không tìm thấy báo cáo nào
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedReports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-gray-50">
                      <TableCell>
                        <span className="font-mono text-sm text-gray-600">{report.id}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={report.reporterAvatar} alt={report.reporterName} />
                            <AvatarFallback className="bg-[#257180] text-white">
                              {report.reporterName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{report.reporterName}</p>
                            <p className="text-xs text-gray-500">{report.reporterEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={report.reportedTutorAvatar} alt={report.reportedTutorName} />
                            <AvatarFallback className="bg-red-100 text-red-800">
                              {report.reportedTutorName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-sm font-medium text-gray-900">{report.reportedTutorName}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-gray-900 truncate">{report.reason}</p>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <Badge className={getReportStatusColor(report.status)}>
                          {getReportStatusText(report.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(report)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Chi tiết báo cáo</DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <Badge className={getReportStatusColor(selectedReport.status)}>
                  {getReportStatusText(selectedReport.status)}
                </Badge>
                <span className="text-sm text-gray-500">
                  Báo cáo ngày {new Date(selectedReport.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>

              {/* Reporter Info */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Người báo cáo</p>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedReport.reporterAvatar} alt={selectedReport.reporterName} />
                    <AvatarFallback className="bg-[#257180] text-white">
                      {selectedReport.reporterName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{selectedReport.reporterName}</p>
                    <p className="text-sm text-gray-600">{selectedReport.reporterEmail}</p>
                  </div>
                </div>
              </div>

              {/* Reported Tutor Info */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Gia sư bị báo cáo</p>
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedReport.reportedTutorAvatar} alt={selectedReport.reportedTutorName} />
                    <AvatarFallback className="bg-red-100 text-red-800">
                      {selectedReport.reportedTutorName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{selectedReport.reportedTutorName}</p>
                    <p className="text-sm text-gray-600">ID Gia sư: {selectedReport.reportedTutorId}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Report Details */}
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Lý do báo cáo</p>
                    <p className="font-medium text-gray-900">{selectedReport.reason}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Mô tả chi tiết</p>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedReport.description}</p>
              </div>

              {/* Evidence */}
              {selectedReport.evidenceUrls && selectedReport.evidenceUrls.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-3">Bằng chứng ({selectedReport.evidenceUrls.length})</p>
                  <div className="space-y-2">
                    {selectedReport.evidenceUrls.map((url: string, index: number) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="h-5 w-5 text-[#257180]" />
                        <span className="text-sm text-gray-900">Bằng chứng {index + 1}</span>
                        <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Booking */}
              {selectedReport.relatedBookingId && (
                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Liên quan đến Booking <span className="font-mono font-semibold">{selectedReport.relatedBookingId}</span>
                  </p>
                </div>
              )}

              {/* Admin Note */}
              {selectedReport.adminNote && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium mb-1">Ghi chú xử lý</p>
                  <p className="text-sm text-gray-900">{selectedReport.adminNote}</p>
                  {selectedReport.resolvedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Xử lý ngày {new Date(selectedReport.resolvedAt).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  Đóng
                </Button>
                {selectedReport.status === 0 && (
                  <>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => {
                        setShowDetailDialog(false);
                        setShowRejectDialog(true);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Từ chối báo cáo
                    </Button>
                    <Button
                      className="bg-[#257180] hover:bg-[#1f5a66]"
                      onClick={() => {
                        setShowDetailDialog(false);
                        setShowResolveDialog(true);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Xử lý báo cáo
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <AlertDialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xử lý báo cáo</AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng nhập ghi chú về cách xử lý báo cáo này
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="admin-note">Ghi chú xử lý</Label>
            <Textarea
              id="admin-note"
              placeholder="Nhập ghi chú về cách xử lý..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAdminNote('')}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleResolve} className="bg-[#257180] hover:bg-[#1f5a66]">
              Xác nhận xử lý
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Từ chối báo cáo</AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng nhập lý do từ chối báo cáo này
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-note">Lý do từ chối</Label>
            <Textarea
              id="reject-note"
              placeholder="Nhập lý do từ chối..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAdminNote('')}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} className="bg-red-600 hover:bg-red-700">
              Xác nhận từ chối
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
