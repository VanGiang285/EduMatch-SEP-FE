'use client';
import React, { useState } from 'react';
import { Card, CardContent } from '../ui/layout/card';
import { Button } from '../ui/basic/button';
import { Badge } from '../ui/basic/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/feedback/dialog';
import { Slider } from '../ui/form/slider';
import { SelectWithSearch, SelectWithSearchItem } from '../ui/form/select-with-search';
import { useAuth } from '@/contexts/AuthContext';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/navigation/pagination';
import {
  Plus,
  MapPin,
  Video,
  Clock,
  Calendar,
  Users,
  Home,
  ArrowUpDown,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import {
  mockClassRequests,
  mockClassApplications,
  mockSubjects,
  mockGradeLevels,
  getTeachingModeText,
  getClassRequestStatusText,
  getClassRequestStatusColor,
} from '@/data/mockClassRequests';
import { Separator } from '../ui/layout/separator';
import { FormatService } from '@/lib/format';
import { CreateClassRequestDialog } from './CreateClassRequestDialog';

export function ClassRequestsPage() {
  const { user } = useAuth();
  const currentUserId = user?.id || user?.email || 'user123'; // Fallback to mock user ID for demo
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Filters
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [teachingModeFilter, setTeachingModeFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number[]>([0, 500000]);
  const [sortBy, setSortBy] = useState<string>('newest'); // newest, price-low, price-high
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const filteredRequests = mockClassRequests.filter((request) => {
    // Chỉ hiển thị các yêu cầu có status = 1 (Đang mở)
    if (request.status !== 1) return false;

    // Subject filter
    if (subjectFilter !== 'all' && request.subjectId.toString() !== subjectFilter) {
      return false;
    }

    // Grade filter
    if (gradeFilter !== 'all' && request.gradeId.toString() !== gradeFilter) {
      return false;
    }

    // Teaching mode filter
    if (teachingModeFilter !== 'all' && request.teachingMode.toString() !== teachingModeFilter) {
      return false;
    }

    // Price filter - check if request price range overlaps with filter range
    const requestMaxPrice = request.maxPrice;
    const requestMinPrice = request.minPrice;
    if (requestMinPrice > priceRange[1] || requestMaxPrice < priceRange[0]) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    // Sort
    if (sortBy === 'price-low') {
      return a.minPrice - b.minPrice;
    } else if (sortBy === 'price-high') {
      return b.maxPrice - a.maxPrice;
    } else {
      // newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [subjectFilter, gradeFilter, teachingModeFilter, sortBy, priceRange]);

  const handleViewDetail = (requestId: number) => {
    setSelectedRequest(requestId);
    setShowDetailDialog(true);
  };

  const selectedRequestData = mockClassRequests.find(r => r.id === selectedRequest);
  const applicants = selectedRequest ? mockClassApplications[selectedRequest] || [] : [];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Filters Section - Sticky */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            {/* Subject Filter */}
            <div className="flex-1 min-w-[140px]">
              <SelectWithSearch 
                value={subjectFilter} 
                onValueChange={setSubjectFilter}
                placeholder="Môn học"
              >
                <SelectWithSearchItem value="all">Tất cả môn học</SelectWithSearchItem>
                {mockSubjects.map((subject) => (
                  <SelectWithSearchItem key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </SelectWithSearchItem>
                ))}
              </SelectWithSearch>
            </div>

            {/* Grade Filter */}
            <div className="flex-1 min-w-[140px]">
              <SelectWithSearch 
                value={gradeFilter} 
                onValueChange={setGradeFilter}
                placeholder="Lớp"
              >
                <SelectWithSearchItem value="all">Tất cả lớp</SelectWithSearchItem>
                {mockGradeLevels.map((grade) => (
                  <SelectWithSearchItem key={grade.id} value={grade.id.toString()}>
                    {grade.name}
                  </SelectWithSearchItem>
                ))}
              </SelectWithSearch>
            </div>

            {/* Teaching Mode Filter */}
            <div className="flex-1 min-w-[140px]">
              <SelectWithSearch 
                value={teachingModeFilter} 
                onValueChange={setTeachingModeFilter}
                placeholder="Hình thức"
              >
                <SelectWithSearchItem value="all">Tất cả hình thức</SelectWithSearchItem>
                <SelectWithSearchItem value="0">Tại nhà</SelectWithSearchItem>
                <SelectWithSearchItem value="1">Trực tuyến</SelectWithSearchItem>
              </SelectWithSearch>
            </div>

            {/* Sort */}
            <div className="flex-1 min-w-[140px]">
              <SelectWithSearch 
                value={sortBy} 
                onValueChange={setSortBy}
                placeholder="Sắp xếp"
              >
                <SelectWithSearchItem value="newest">Mới nhất</SelectWithSearchItem>
                <SelectWithSearchItem value="price-low">Giá thấp - cao</SelectWithSearchItem>
                <SelectWithSearchItem value="price-high">Giá cao - thấp</SelectWithSearchItem>
              </SelectWithSearch>
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
               <label className="text-sm font-semibold text-gray-800">
                 Khoảng giá (₫/giờ)
               </label>
              <div className="flex items-center gap-2 text-sm bg-white px-3 py-1.5 rounded-md border border-gray-300 shadow-sm">
                <span className="font-medium text-[#257180]">
                  {FormatService.formatVND(priceRange[0])}
                </span>
                <span className="text-gray-400">-</span>
                <span className="font-medium text-[#257180]">
                  {FormatService.formatVND(priceRange[1])}
                </span>
              </div>
            </div>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              min={0}
              max={500000}
              step={10000}
              className="w-full [&_.bg-primary]:bg-[#257180]"
            />
          </div>
        </div>
      </div>

      {/* Create Request Button - Not Sticky */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowCreateDialog(true)} className="bg-[#257180] hover:bg-[#1e5a66] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Tạo yêu cầu
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Request List */}
        <div className="grid grid-cols-1 gap-6">
          {paginatedRequests.map((request) => (
            <Card key={request.id} className="hover:border-[#257180]/40 hover:shadow-md transition-all duration-200 bg-white">
              <CardContent className="p-6">
                <div className="flex gap-4 sm:gap-5">
                  {/* Left: Avatar & Basic Info */}
                  <div className="relative flex-shrink-0 self-center sm:self-start">
                    <div className="relative w-24 h-24 sm:w-36 sm:h-36 rounded-lg overflow-hidden bg-[#F2E5BF]">
                      {request.learnerAvatar ? (
                        <img 
                          src={request.learnerAvatar} 
                          alt={request.learnerName}
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
                        className={`w-full h-full rounded-lg flex items-center justify-center text-2xl font-bold text-[#257180] bg-[#F2E5BF] ${request.learnerAvatar ? 'hidden' : 'flex'}`}
                        style={{ display: request.learnerAvatar ? 'none' : 'flex' }}
                      >
                        {request.learnerName.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Details */}
                  <div className="flex-1">
                    {/* Title & Status */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-3">
                      <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{request.displayName}</h3>
                        {request.learnerId === currentUserId && (
                          <Badge className="bg-[#FD8B51] text-white text-xs px-2 py-0.5">
                            Của tôi
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getClassRequestStatusColor(request.status)} text-xs px-3 py-1`}>
                          {getClassRequestStatusText(request.status)}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Học viên: {request.learnerName}</p>

                    {/* Description */}
                    <p className="text-gray-700 mb-4 line-clamp-2">{request.description}</p>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        {request.teachingMode === 1 ? (
                          <Video className="h-4 w-4 text-[#257180] flex-shrink-0" />
                        ) : (
                          <Home className="h-4 w-4 text-[#257180] flex-shrink-0" />
                        )}
                        <span className="truncate">{getTeachingModeText(request.teachingMode)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="h-4 w-4 text-[#257180] flex-shrink-0" />
                        <span>{request.sessionPerWeek} buổi/tuần</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="h-4 w-4 text-[#257180] flex-shrink-0" />
                        <span>{request.totalSessions} buổi</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="h-4 w-4 text-[#257180] flex-shrink-0" />
                        <span className="truncate">{request.cityName}</span>
                      </div>
                    </div>

                    {/* Bottom: Price & Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-[#257180]/20 gap-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Khoảng giá mong muốn</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl text-black font-bold">
                              {request.minPrice === request.maxPrice 
                                ? FormatService.formatVND(request.minPrice)
                                : `${FormatService.formatVND(request.minPrice)} - ${FormatService.formatVND(request.maxPrice)}`
                              }
                            </span>
                             <span className="text-base text-gray-600">/giờ</span>
                          </div>
                        </div>
                        <Separator orientation="vertical" className="h-12 hidden sm:block" />
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-gray-600" />
                          <span className="text-sm text-gray-700">
                            <span className="font-bold text-gray-900">{request.totalApplicants}</span> Ứng viên
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button 
                          variant="outline"
                          onClick={() => handleViewDetail(request.id)}
                          className="flex-1 sm:flex-none hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                        >
                          Xem chi tiết
                        </Button>
                        {request.status === 1 && (
                          <Button className="bg-[#FD8B51] hover:bg-[#CB6040] text-white flex-1 sm:flex-none">
                            Ứng tuyển
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredRequests.length === 0 && (
            <Card className="bg-white">
              <CardContent className="p-12 text-center">
                <p className="text-gray-500 text-sm">Không tìm thấy yêu cầu nào phù hợp</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="text-sm text-gray-600">
              Hiển thị <span className="font-bold text-gray-900">{startIndex + 1}</span> - <span className="font-bold text-gray-900">{Math.min(endIndex, filteredRequests.length)}</span> trong tổng số <span className="font-bold text-gray-900">{filteredRequests.length}</span> yêu cầu
            </div>
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

        {/* Detail Dialog */}
        {selectedRequestData && (
          <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
            <DialogContent className="w-full max-w-[95vw] sm:max-w-[70vw] max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle className="text-2xl sm:text-3xl font-bold text-gray-900">Chi tiết yêu cầu mở lớp</DialogTitle>
                <DialogDescription className="text-sm sm:text-base text-gray-600">
                  Thông tin chi tiết về yêu cầu và danh sách gia sư ứng tuyển
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* Left Column: Request Details */}
                <div className="space-y-6 lg:col-span-2">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row items-start gap-5 bg-gradient-to-r from-[#F2E5BF]/20 to-transparent p-6 rounded-lg">
                    <div className="relative flex-shrink-0">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-[#F2E5BF] border-4 border-white shadow-md">
                        {selectedRequestData.learnerAvatar ? (
                          <img 
                            src={selectedRequestData.learnerAvatar} 
                            alt={selectedRequestData.learnerName}
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
                          className={`w-full h-full rounded-lg flex items-center justify-center text-lg sm:text-xl font-bold text-[#257180] bg-[#F2E5BF] ${selectedRequestData.learnerAvatar ? 'hidden' : 'flex'}`}
                          style={{ display: selectedRequestData.learnerAvatar ? 'none' : 'flex' }}
                        >
                          {selectedRequestData.learnerName.slice(0, 2).toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">{selectedRequestData.displayName}</h3>
                      <p className="text-gray-600 mb-3 text-sm sm:text-base">
                        Học viên: <span className="font-bold text-gray-900">{selectedRequestData.learnerName}</span>
                      </p>
                      <Badge className={`${getClassRequestStatusColor(selectedRequestData.status)} text-xs sm:text-sm px-3 py-1`}>
                        {getClassRequestStatusText(selectedRequestData.status)}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="my-2" />

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-5 bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-gray-500 mb-1">Môn học</p>
                      <p className="font-semibold text-lg">{selectedRequestData.displayName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Hình thức dạy</p>
                      <p className="font-semibold text-lg">{getTeachingModeText(selectedRequestData.teachingMode)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Số buổi/tuần</p>
                      <p className="font-semibold text-lg">{selectedRequestData.sessionPerWeek} buổi</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Tổng số buổi</p>
                      <p className="font-semibold text-lg">{selectedRequestData.totalSessions} buổi</p>
                    </div>
                    <div className="col-span-2 bg-[#F2E5BF]/40 p-5 rounded-lg -m-1">
                      <p className="text-gray-600 mb-2 text-base">Khoảng giá mong muốn</p>
                      <p className="text-3xl font-semibold text-[#257180]">
                        {FormatService.formatVND(selectedRequestData.minPrice)} - {FormatService.formatVND(selectedRequestData.maxPrice)}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-white border border-gray-200 p-5 rounded-lg">
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900">
                      <BookOpen className="h-6 w-6 text-[#257180]" />
                      Mô tả chi tiết
                    </h4>
                    <p className="text-gray-700 leading-relaxed text-base">{selectedRequestData.description}</p>
                  </div>

                  {/* Location */}
                  {selectedRequestData.location && (
                    <div className="bg-white border border-gray-200 p-5 rounded-lg">
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900">
                        <MapPin className="h-6 w-6 text-[#257180]" />
                        Địa điểm học
                      </h4>
                      <p className="text-gray-700 text-base font-medium">{selectedRequestData.location}</p>
                      <p className="text-gray-600 mt-2">
                        {selectedRequestData.subDistrictName}, {selectedRequestData.cityName}
                      </p>
                    </div>
                  )}

                  {!selectedRequestData.location && (
                    <div className="bg-white border border-gray-200 p-5 rounded-lg">
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900">
                        <MapPin className="h-6 w-6 text-[#257180]" />
                        Khu vực
                      </h4>
                      <p className="text-gray-700 text-base font-medium">
                        {selectedRequestData.subDistrictName}, {selectedRequestData.cityName}
                      </p>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-5 bg-white border border-gray-200 p-5 rounded-lg">
                    <div>
                      <p className="text-gray-500 mb-1">Ngày đăng</p>
                      <p className="font-semibold text-base">{FormatService.formatDate(selectedRequestData.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Hết hạn</p>
                      <p className="font-semibold text-base">{FormatService.formatDate(selectedRequestData.expiresAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Applicants */}
                <div className="border-l-2 pl-6 lg:col-span-1">
                  <h4 className="text-xl font-semibold mb-5 flex items-center gap-2 text-gray-900">
                    <GraduationCap className="h-6 w-6 text-[#257180]" />
                    Gia sư ứng tuyển ({applicants.length})
                  </h4>

                  {applicants.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">Chưa có gia sư nào ứng tuyển</p>
                      <p className="text-gray-500 mt-1 text-sm">Hãy quay lại sau nhé!</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                      {applicants.map((applicant) => (
                        <Card key={applicant.id} className="border hover:border-[#257180]/30 transition-all">
                          <CardContent className="p-4">
                            <div className="flex gap-3 mb-3">
                              <div className="relative flex-shrink-0">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F2E5BF] border-2 border-gray-200">
                                  {applicant.tutorAvatar ? (
                                    <img 
                                      src={applicant.tutorAvatar} 
                                      alt={applicant.tutorName}
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
                                    className={`w-full h-full rounded-lg flex items-center justify-center text-sm font-bold text-[#257180] bg-[#F2E5BF] ${applicant.tutorAvatar ? 'hidden' : 'flex'}`}
                                    style={{ display: applicant.tutorAvatar ? 'none' : 'flex' }}
                                  >
                                    {applicant.tutorName.slice(0, 2).toUpperCase()}
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-lg font-semibold mb-1 truncate">{applicant.tutorName}</h5>
                                <div className="flex items-center gap-1 text-gray-600 mb-1 text-sm">
                                  <span className="text-yellow-500">⭐</span>
                                  <span className="font-medium">{applicant.rating}</span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-xs">{applicant.experience}y</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600 mt-1">
                                  <span className="text-xs text-gray-500">Giá:</span>
                                  <span className="font-semibold text-[#257180]">{FormatService.formatVND(applicant.proposedPrice)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="mb-3">
                              <p className="text-gray-500 text-xs mb-1">Thư giới thiệu:</p>
                              <p className="text-gray-700 leading-relaxed text-sm">{applicant.coverLetter}</p>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1 border-[#257180] text-[#257180] hover:bg-[#257180] hover:text-white text-xs">
                                Xem hồ sơ
                              </Button>
                              {selectedRequestData.learnerId === 'user123' && applicant.status === 0 && (
                                <Button size="sm" className="flex-1 bg-[#FD8B51] hover:bg-[#CB6040] text-white text-xs">
                                  Chấp nhận
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Create Request Dialog */}
        <CreateClassRequestDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </div>
  );
}

