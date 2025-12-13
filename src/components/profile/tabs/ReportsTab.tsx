"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/navigation/pagination';
import { Label } from '@/components/ui/form/label';
import { Search, Plus, Eye, Loader2, ArrowUpDown, X, Edit, Shield } from 'lucide-react';
import { ReportService, TutorService, MediaService } from '@/services';
import { ReportListItemDto, ReportFullDetailDto, TutorProfileDto } from '@/types/backend';
import { ReportStatus, MediaType, ReportEvidenceType, TutorStatus } from '@/types/enums';
import { ReportCreateRequest, ReportUpdateByLearnerRequest, ReportDefenseCreateRequest, BasicEvidenceRequest } from '@/types/requests';
import { useCustomToast } from '@/hooks/useCustomToast';
import { useAuth } from '@/hooks/useAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select';
import { SelectWithSearch, SelectWithSearchItem } from '@/components/ui/form/select-with-search';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/basic/avatar';

const ITEMS_PER_PAGE = 10;

type SortField = 'id' | 'createdAt' | 'status';
type SortOrder = 'asc' | 'desc';

const normalizeMediaType = (mediaType: number | string | undefined): number => {
  if (mediaType === undefined || mediaType === null) return MediaType.Video;
  if (typeof mediaType === 'string') {
    const parsed = parseInt(mediaType, 10);
    if (!isNaN(parsed)) return parsed;
    if (mediaType.toLowerCase() === 'image') return MediaType.Image;
    if (mediaType.toLowerCase() === 'video') return MediaType.Video;
    return MediaType.Video;
  }
  return Number(mediaType);
};

const isPendingStatus = (status: ReportStatus | number | string | undefined): boolean => {
  if (status === undefined || status === null) return false;
  if (typeof status === 'string') {
    if (status === 'Pending' || status === '0') return true;
    const parsed = parseInt(status, 10);
    return !isNaN(parsed) && parsed === 0;
  }
  if (typeof status === 'number') {
    return status === 0 || status === ReportStatus.Pending;
  }
  return status === ReportStatus.Pending;
};

const isPendingOrUnderReviewStatus = (status: ReportStatus | number | string | undefined): boolean => {
  if (status === undefined || status === null) return false;
  if (typeof status === 'string') {
    if (status === 'Pending' || status === '0') return true;
    if (status === 'UnderReview' || status === '1') return true;
    const parsed = parseInt(status, 10);
    return !isNaN(parsed) && (parsed === 0 || parsed === 1);
  }
  if (typeof status === 'number') {
    return status === 0 || status === 1 || status === ReportStatus.Pending || status === ReportStatus.UnderReview;
  }
  return status === ReportStatus.Pending || status === ReportStatus.UnderReview;
};

const getStatusLabel = (status: ReportStatus | number | string): string => {
  let statusNum: number;
  if (typeof status === 'string') {
    statusNum = parseInt(status, 10);
    if (isNaN(statusNum)) {
      if (status === 'Pending') return 'Chờ xử lý';
      if (status === 'UnderReview') return 'Đang xem xét';
      if (status === 'Resolved') return 'Đã giải quyết';
      if (status === 'Dismissed') return 'Đã bác bỏ';
      return 'Không xác định';
    }
  } else if (typeof status === 'number') {
    statusNum = status;
  } else {
    statusNum = status as number;
  }
  
  switch (statusNum) {
    case ReportStatus.Pending:
    case 0:
      return 'Chờ xử lý';
    case ReportStatus.UnderReview:
    case 1:
      return 'Đang xem xét';
    case ReportStatus.Resolved:
    case 2:
      return 'Đã giải quyết';
    case ReportStatus.Dismissed:
    case 3:
      return 'Đã bác bỏ';
    default:
      return 'Không xác định';
  }
};

const getStatusColor = (status: ReportStatus | number | string): string => {
  let statusNum: number;
  if (typeof status === 'string') {
    statusNum = parseInt(status, 10);
    if (isNaN(statusNum)) {
      if (status === 'Pending') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      if (status === 'UnderReview') return 'bg-blue-100 text-blue-800 border-blue-200';
      if (status === 'Resolved') return 'bg-green-100 text-green-800 border-green-200';
      if (status === 'Dismissed') return 'bg-red-100 text-red-800 border-red-200';
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  } else if (typeof status === 'number') {
    statusNum = status;
  } else {
    statusNum = status as number;
  }
  
  switch (statusNum) {
    case ReportStatus.Pending:
    case 0:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case ReportStatus.UnderReview:
    case 1:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case ReportStatus.Resolved:
    case 2:
      return 'bg-green-100 text-green-800 border-green-200';
    case ReportStatus.Dismissed:
    case 3:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function ReportsTab() {
  const { user } = useAuth();
  const { showSuccess, showError } = useCustomToast();
  const showErrorRef = React.useRef(showError);

  React.useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<ReportFullDetailDto | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDefenseDialog, setShowDefenseDialog] = useState(false);
  const [reports, setReports] = useState<ReportListItemDto[]>([]);
  const [tutors, setTutors] = useState<TutorProfileDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTutors, setLoadingTutors] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isProcessing, setIsProcessing] = useState(false);

  const isLearner = user?.role === 'learner';
  const isTutor = user?.role === 'tutor';

  const [formData, setFormData] = useState({
    reportedUserEmail: '',
    reason: '',
    evidences: [] as BasicEvidenceRequest[],
  });

  const [defenseFormData, setDefenseFormData] = useState({
    note: '',
    evidences: [] as BasicEvidenceRequest[],
  });

  const [uploading, setUploading] = useState(false);
  const [, setUploadingFiles] = useState<File[]>([]);
  const [, setUploadedUrls] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [tutorNames, setTutorNames] = useState<Record<string, string>>({});
  const [tutorAvatars, setTutorAvatars] = useState<Record<string, string>>({});
  const [uploadingDefense, setUploadingDefense] = useState(false);
  const [, setUploadingDefenseFiles] = useState<File[]>([]);
  const [, setUploadedDefenseUrls] = useState<string[]>([]);
  const [showConfirmDefense, setShowConfirmDefense] = useState(false);
  const [showConfirmUpdate, setShowConfirmUpdate] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [canSubmitDefense, setCanSubmitDefense] = useState(false);

  const fetchReports = useCallback(async () => {
    if (!user) {
      setReports([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = isLearner ? await ReportService.getLearnerReports() : await ReportService.getTutorReports();
      if (response.success && response.data) {
        setReports(response.data);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      showErrorRef.current('Lỗi', 'Không thể tải danh sách báo cáo');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [isLearner, user]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const fetchTutors = async () => {
    setLoadingTutors(true);
    try {
      const response = await TutorService.getTutorsByStatus(TutorStatus.Approved);
      if (response.success && response.data) {
        setTutors(response.data);
      } else {
        setTutors([]);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
      showError('Lỗi', 'Không thể tải danh sách gia sư');
      setTutors([]);
    } finally {
      setLoadingTutors(false);
    }
  };

  const handleViewDetail = async (report: ReportListItemDto) => {
    try {
      const response = await ReportService.getFullReportDetail(report.id);
      if (response.success && response.data) {
        const reportData = response.data;
        const tutorEvidences = reportData.tutorEvidences ?? [];
        if (reportData.reporterEvidences) {
          reportData.reporterEvidences = reportData.reporterEvidences.map((ev) => ({
            ...ev,
            mediaType: normalizeMediaType(ev.mediaType),
          }));
        }
        let defenses = reportData.defenses || [];
        if (defenses.length > 0) {
          const defensesResponse = await ReportService.getDefenses(reportData.id);
          if (defensesResponse.success && defensesResponse.data) {
            defenses = defensesResponse.data;
          }

          defenses = defenses.map((defense) => ({
            ...defense,
            evidences: (defense.evidences || []).map((ev) => ({
              ...ev,
              mediaType: normalizeMediaType(ev.mediaType),
            })),
          }));

          if (tutorEvidences.length > 0) {
            const usedEvidenceIds = new Set<number>();
            defenses = defenses.map((defense) => {
              if (!defense.evidences || defense.evidences.length === 0) {
                const defenseDate = new Date(defense.createdAt).getTime();
                const relatedEvidences = tutorEvidences
                  .filter((ev) => {
                    if (usedEvidenceIds.has(ev.id)) return false;
                    if (ev.submittedByEmail && defense.tutorEmail && ev.submittedByEmail !== defense.tutorEmail) return false;
                    const evDate = new Date(ev.createdAt).getTime();
                    const timeDiff = Math.abs(evDate - defenseDate);
                    return timeDiff < 60000;
                  })
                  .sort((a, b) => {
                    const aDiff = Math.abs(new Date(a.createdAt).getTime() - defenseDate);
                    const bDiff = Math.abs(new Date(b.createdAt).getTime() - defenseDate);
                    return aDiff - bDiff;
                  });
                
                if (relatedEvidences.length > 0) {
                  const closestEvidences = relatedEvidences.slice(0, 10);
                  const evidenceList = closestEvidences.map((ev) => {
                    usedEvidenceIds.add(ev.id);
                    return {
                      ...ev,
                      mediaType: normalizeMediaType(ev.mediaType),
                    };
                  });
                  return { ...defense, evidences: evidenceList };
                }
              }
              return {
                ...defense,
                evidences: (defense.evidences || []).map((ev) => ({
                  ...ev,
                  mediaType: normalizeMediaType(ev.mediaType),
                })),
              };
            });
          }
          reportData.defenses = defenses;
          
          const uniqueTutorEmails = Array.from(
            new Set(
              defenses
                .map((d) => d.tutorEmail)
                .filter((email): email is string => Boolean(email))
            )
          );
          const tutorNameMap: Record<string, string> = {};
          const tutorAvatarMap: Record<string, string> = {};
          await Promise.all(
            uniqueTutorEmails.map(async (email) => {
            try {
              const tutorResponse = await TutorService.getTutorByEmail(email);
              if (tutorResponse.success && tutorResponse.data) {
                tutorNameMap[email] = tutorResponse.data.userName || email;
                tutorAvatarMap[email] = tutorResponse.data.avatarUrl || '';
              } else {
                tutorNameMap[email] = email;
                tutorAvatarMap[email] = '';
              }
            } catch {
              tutorNameMap[email] = email;
              tutorAvatarMap[email] = '';
            }
            })
          );
          setTutorNames(tutorNameMap);
          setTutorAvatars(tutorAvatarMap);
        }
        setSelectedReport(reportData);
        const canDefenseResponse = await ReportService.canSubmitDefense(report.id);
        setCanSubmitDefense(!!canDefenseResponse.data && canDefenseResponse.success);
        setShowDetailDialog(true);
      } else {
        showError('Lỗi', 'Không thể tải chi tiết báo cáo');
      }
    } catch (error) {
      console.error('Error fetching report detail:', error);
      showError('Lỗi', 'Không thể tải chi tiết báo cáo');
    }
  };

  const handleCreate = () => {
    setFormData({ reportedUserEmail: '', reason: '', evidences: [] });
    setUploadingFiles([]);
    setUploadedUrls([]);
    fetchTutors();
    setShowCreateDialog(true);
  };

  const handleUpdate = (report: ReportFullDetailDto) => {
    setFormData({
      reportedUserEmail: report.reportedUserEmail,
      reason: report.reason,
      evidences: [],
    });
    setUploadingFiles([]);
    setUploadedUrls([]);
    setSelectedReport(report);
    setShowUpdateDialog(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.email) return;
    
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) {
        showError('Lỗi', 'Chỉ chấp nhận file ảnh hoặc video');
        return false;
      }
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        showError('Lỗi', `File ${file.name} vượt quá 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = validFiles.map(async (file) => {
        const mediaType = file.type.startsWith('image/') ? 'Image' : 'Video';
        const response = await MediaService.uploadFile({
          file,
          ownerEmail: user.email!,
          mediaType: mediaType as 'Image' | 'Video',
        });
        
        const uploadResult = response.data?.data;
        if (response.success && uploadResult?.secureUrl) {
          return {
            url: uploadResult.secureUrl,
            publicId: uploadResult.publicId,
            mediaType: file.type.startsWith('image/') ? MediaType.Image : MediaType.Video,
            file,
          };
        } else {
          throw new Error(`Không thể upload file ${file.name}`);
        }
      });

      const results = await Promise.all(uploadPromises);
      setUploadedUrls(prev => [...prev, ...results.map(r => r.url)]);
      setUploadingFiles(prev => [...prev, ...results.map(r => r.file)]);
      setFormData(prev => ({
        ...prev,
        evidences: [
          ...prev.evidences,
          ...results.map(r => ({
            mediaType: r.mediaType,
            fileUrl: r.url,
            filePublicId: r.publicId,
            caption: '',
          })),
        ],
      }));
      showSuccess('Thành công', `Đã upload ${results.length} file thành công`);
    } catch (error: any) {
      console.error('Error uploading files:', error);
      showError('Lỗi', error.message || 'Không thể upload file');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDefenseFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.email) return;
    
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) {
        showError('Lỗi', 'Chỉ chấp nhận file ảnh hoặc video');
        return false;
      }
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        showError('Lỗi', `File ${file.name} vượt quá 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploadingDefense(true);
    try {
      const uploadPromises = validFiles.map(async (file) => {
        const mediaType = file.type.startsWith('image/') ? 'Image' : 'Video';
        const response = await MediaService.uploadFile({
          file,
          ownerEmail: user.email!,
          mediaType: mediaType as 'Image' | 'Video',
        });
        
        const uploadResult = response.data?.data;
        if (response.success && uploadResult?.secureUrl) {
          return {
            url: uploadResult.secureUrl,
            publicId: uploadResult.publicId,
            mediaType: file.type.startsWith('image/') ? MediaType.Image : MediaType.Video,
            file,
          };
        } else {
          throw new Error(`Không thể upload file ${file.name}`);
        }
      });

      const results = await Promise.all(uploadPromises);
      setUploadedDefenseUrls(prev => [...prev, ...results.map(r => r.url)]);
      setUploadingDefenseFiles(prev => [...prev, ...results.map(r => r.file)]);
      setDefenseFormData(prev => ({
        ...prev,
        evidences: [
          ...prev.evidences,
          ...results.map(r => ({
            mediaType: r.mediaType,
            fileUrl: r.url,
            filePublicId: r.publicId,
            caption: '',
          })),
        ],
      }));
      showSuccess('Thành công', `Đã upload ${results.length} file thành công`);
    } catch (error: any) {
      console.error('Error uploading files:', error);
      showError('Lỗi', error.message || 'Không thể upload file');
    } finally {
      setUploadingDefense(false);
      e.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedUrls(prev => prev.filter((_, i) => i !== index));
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      evidences: prev.evidences.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveDefenseFile = (index: number) => {
    setUploadedDefenseUrls(prev => prev.filter((_, i) => i !== index));
    setUploadingDefenseFiles(prev => prev.filter((_, i) => i !== index));
    setDefenseFormData(prev => ({
      ...prev,
      evidences: prev.evidences.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitCreate = async () => {
    if (!user?.email) {
      showError('Lỗi', 'Vui lòng đăng nhập');
      return;
    }
    if (!formData.reportedUserEmail || !formData.reason.trim()) {
      showError('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setIsProcessing(true);
      const evidences = formData.evidences.length > 0 ? formData.evidences.map(ev => ({
        mediaType: typeof ev.mediaType === 'number' ? ev.mediaType : (ev.mediaType === MediaType.Image ? 0 : 1),
        fileUrl: ev.fileUrl,
        filePublicId: ev.filePublicId,
        caption: ev.caption,
      })) : undefined;
      const request: ReportCreateRequest = {
        reportedUserEmail: formData.reportedUserEmail,
        reason: formData.reason.trim(),
        evidences: evidences,
      };
      const response = await ReportService.createReport(request);
      if (response.success) {
        showSuccess('Thành công', 'Đã tạo báo cáo');
        setShowCreateDialog(false);
        setFormData({ reportedUserEmail: '', reason: '', evidences: [] });
        setUploadingFiles([]);
        setUploadedUrls([]);
        fetchReports();
      } else {
        showError('Lỗi', response.message || 'Không thể tạo báo cáo');
      }
    } catch (error) {
      console.error('Error creating report:', error);
      showError('Lỗi', 'Không thể tạo báo cáo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmUpdate = () => {
    if (!formData.reason.trim()) {
      showError('Lỗi', 'Vui lòng điền lý do báo cáo');
      return;
    }
    setShowConfirmUpdate(true);
  };

  const handleSubmitUpdate = async () => {
    if (!selectedReport) return;
    if (!formData.reason.trim()) {
      showError('Lỗi', 'Vui lòng điền lý do báo cáo');
      return;
    }

    setShowConfirmUpdate(false);
    try {
      setIsProcessing(true);
      const request: ReportUpdateByLearnerRequest = {
        reason: formData.reason.trim(),
      };
      const response = await ReportService.updateLearnerReport(selectedReport.id, request);
      if (response.success) {
        if (formData.evidences.length > 0 && selectedReport) {
          for (const evidence of formData.evidences) {
            const mediaTypeNum = typeof evidence.mediaType === 'number' ? evidence.mediaType : (evidence.mediaType === MediaType.Image ? 0 : 1);
            await ReportService.addEvidence(selectedReport.id, {
              mediaType: mediaTypeNum,
              fileUrl: evidence.fileUrl,
              filePublicId: evidence.filePublicId,
              caption: evidence.caption,
              evidenceType: ReportEvidenceType.ReporterEvidence,
            });
          }
        }
        showSuccess('Thành công', 'Đã cập nhật báo cáo');
        setShowUpdateDialog(false);
        setFormData({ reportedUserEmail: '', reason: '', evidences: [] });
        setUploadingFiles([]);
        setUploadedUrls([]);
        fetchReports();
        if (selectedReport) {
          const detailResponse = await ReportService.getFullReportDetail(selectedReport.id);
          if (detailResponse.success && detailResponse.data) {
            setSelectedReport(detailResponse.data);
          }
        }
      } else {
        showError('Lỗi', response.message || 'Không thể cập nhật báo cáo');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      showError('Lỗi', 'Không thể cập nhật báo cáo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmCancel = () => {
    setShowConfirmCancel(true);
  };

  const handleCancelReport = async () => {
    if (!selectedReport) return;
    setShowConfirmCancel(false);
    try {
      setIsProcessing(true);
      const response = await ReportService.cancelLearnerReport(selectedReport.id);
      if (response.success) {
        showSuccess('Thành công', 'Đã hủy báo cáo');
        setShowDetailDialog(false);
        fetchReports();
      } else {
        showError('Lỗi', response.message || 'Không thể hủy báo cáo');
      }
    } catch (error) {
      console.error('Error canceling report:', error);
      showError('Lỗi', 'Không thể hủy báo cáo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDefense = () => {
    setShowConfirmDefense(true);
  };

  const handleSubmitDefense = async () => {
    if (!selectedReport) return;
    if (!defenseFormData.note.trim()) {
      showError('Lỗi', 'Vui lòng điền nội dung kháng cáo');
      return;
    }

    setShowConfirmDefense(false);
    try {
      setIsProcessing(true);
      const evidences = defenseFormData.evidences.length > 0 ? defenseFormData.evidences.map(ev => ({
        mediaType: typeof ev.mediaType === 'number' ? ev.mediaType : (ev.mediaType === MediaType.Image ? 0 : 1),
        fileUrl: ev.fileUrl,
        filePublicId: ev.filePublicId,
        caption: ev.caption,
      })) : undefined;
      const request: ReportDefenseCreateRequest = {
        note: defenseFormData.note.trim(),
        evidences: evidences,
      };
      const response = await ReportService.addDefense(selectedReport.id, request);
      if (response.success) {
        showSuccess('Thành công', 'Đã gửi kháng cáo');
        setShowDefenseDialog(false);
        setDefenseFormData({ note: '', evidences: [] });
        setUploadingDefenseFiles([]);
        setUploadedDefenseUrls([]);
        const detailResponse = await ReportService.getFullReportDetail(selectedReport.id);
        if (detailResponse.success && detailResponse.data) {
          const reportData = detailResponse.data;
          if (reportData.reporterEvidences) {
            reportData.reporterEvidences = reportData.reporterEvidences.map(ev => ({
              ...ev,
              mediaType: normalizeMediaType(ev.mediaType),
            }));
          }
          const tutorEvidences = reportData.tutorEvidences ?? [];
          if (reportData.defenses && reportData.defenses.length > 0) {
            const defensesResponse = await ReportService.getDefenses(reportData.id);
            if (defensesResponse.success && defensesResponse.data) {
              for (const defenseFromApi of defensesResponse.data) {
                const existingDefense = reportData.defenses.find(d => d.id === defenseFromApi.id);
                if (existingDefense && defenseFromApi.evidences && defenseFromApi.evidences.length > 0) {
                  existingDefense.evidences = defenseFromApi.evidences.map(ev => ({
                    ...ev,
                    mediaType: normalizeMediaType(ev.mediaType),
                  }));
                }
              }
            }
            if (tutorEvidences.length > 0) {
              const usedEvidenceIds = new Set<number>();
            for (const defense of reportData.defenses) {
                if (!defense.evidences || defense.evidences.length === 0) {
                  const defenseDate = new Date(defense.createdAt).getTime();
                  const relatedEvidences = tutorEvidences
                    .filter(ev => {
                      if (usedEvidenceIds.has(ev.id)) return false;
                      if (ev.submittedByEmail && defense.tutorEmail && ev.submittedByEmail !== defense.tutorEmail) return false;
                      const evDate = new Date(ev.createdAt).getTime();
                      const timeDiff = Math.abs(evDate - defenseDate);
                      return timeDiff < 60000;
                    })
                    .sort((a, b) => {
                      const aDiff = Math.abs(new Date(a.createdAt).getTime() - defenseDate);
                      const bDiff = Math.abs(new Date(b.createdAt).getTime() - defenseDate);
                      return aDiff - bDiff;
                    });
                  
                  if (relatedEvidences.length > 0) {
                  const closestEvidences = relatedEvidences.slice(0, 10);
                  defense.evidences = closestEvidences.map(ev => {
                      usedEvidenceIds.add(ev.id);
                      return {
                        ...ev,
                        mediaType: normalizeMediaType(ev.mediaType),
                      };
                    });
                  }
                }
              }
            }
            reportData.defenses = reportData.defenses.map(defense => ({
              ...defense,
              evidences: defense.evidences?.map(ev => ({
                ...ev,
                mediaType: normalizeMediaType(ev.mediaType),
              })),
            }));
            
            const uniqueTutorEmails = Array.from(
              new Set(
                reportData.defenses
                  .map((d) => d.tutorEmail)
                  .filter((email): email is string => Boolean(email))
              )
            );
            const tutorNameMap: Record<string, string> = {};
            const tutorAvatarMap: Record<string, string> = {};
            for (const email of uniqueTutorEmails) {
              try {
                const tutorResponse = await TutorService.getTutorByEmail(email);
                if (tutorResponse.success && tutorResponse.data) {
                  tutorNameMap[email] = tutorResponse.data.userName || email;
                  tutorAvatarMap[email] = tutorResponse.data.avatarUrl || '';
                } else {
                  tutorNameMap[email] = email;
                  tutorAvatarMap[email] = '';
                }
              } catch {
                tutorNameMap[email] = email;
                tutorAvatarMap[email] = '';
              }
            }
            setTutorNames(tutorNameMap);
            setTutorAvatars(tutorAvatarMap);
          }
          setSelectedReport(reportData);
        }
        fetchReports();
      } else {
        showError('Lỗi', response.message || 'Không thể gửi kháng cáo');
      }
    } catch (error) {
      console.error('Error submitting defense:', error);
      showError('Lỗi', 'Không thể gửi kháng cáo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteEvidence = async (reportId: number, evidenceId: number) => {
    try {
      const response = await ReportService.deleteEvidence(reportId, evidenceId);
      if (response.success) {
        showSuccess('Thành công', 'Đã xóa bằng chứng');
        if (selectedReport) {
          const detailResponse = await ReportService.getFullReportDetail(selectedReport.id);
          if (detailResponse.success && detailResponse.data) {
            const reportData = detailResponse.data;
            if (reportData.reporterEvidences) {
              reportData.reporterEvidences = reportData.reporterEvidences.map(ev => ({
                ...ev,
                mediaType: normalizeMediaType(ev.mediaType),
              }));
            }
            setSelectedReport(reportData);
            fetchReports();
          }
        }
      } else {
        showError('Lỗi', response.message || 'Không thể xóa bằng chứng');
      }
    } catch (error) {
      console.error('Error deleting evidence:', error);
      showError('Lỗi', 'Không thể xóa bằng chứng');
    }
  };

  const filteredReports = useMemo(() => {
    const filtered = reports.filter(report => {
      const matchesSearch = searchTerm === '' || 
        report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (isLearner 
          ? (report.reportedUserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             report.reportedUserEmail.toLowerCase().includes(searchTerm.toLowerCase()))
          : (report.reporterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             report.reporterEmail.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [reports, searchTerm, statusFilter, sortField, sortOrder, isLearner]);

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#257180]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Báo cáo</h2>
          <p className="text-gray-600 mt-1">
            {isLearner ? 'Quản lý các báo cáo của bạn' : 'Danh sách báo cáo liên quan đến bạn'}
          </p>
        </div>
      </div>

      <Card className="bg-white border border-[#257180]/20 transition-shadow hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter === 'all' ? 'all' : statusFilter.toString()}
              onValueChange={(value) => {
                if (value === 'all') {
                  setStatusFilter('all');
                } else {
                  setStatusFilter(parseInt(value) as ReportStatus);
                }
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value={ReportStatus.Pending.toString()}>Chờ xử lý</SelectItem>
                <SelectItem value={ReportStatus.UnderReview.toString()}>Đang xem xét</SelectItem>
                <SelectItem value={ReportStatus.Resolved.toString()}>Đã giải quyết</SelectItem>
                <SelectItem value={ReportStatus.Dismissed.toString()}>Đã bác bỏ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-[#257180]/20 transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách báo cáo</CardTitle>
            <Badge variant="outline">{filteredReports.length} báo cáo</Badge>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (sortField === 'id') {
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortField('id');
                              setSortOrder('asc');
                            }
                          }}
                          className="h-8 px-2"
                        >
                          ID
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-left">{isLearner ? 'Báo cáo gia sư' : 'Người báo cáo'}</TableHead>
                      <TableHead className="text-left">Lý do</TableHead>
                      <TableHead className="text-left">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (sortField === 'status') {
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortField('status');
                              setSortOrder('asc');
                            }
                          }}
                          className="h-8 px-2"
                        >
                          Trạng thái
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-left">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (sortField === 'createdAt') {
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortField('createdAt');
                              setSortOrder('desc');
                            }
                          }}
                          className="h-8 px-2"
                        >
                          Ngày tạo
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-left">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          {isLearner ? 'Không có báo cáo nào' : 'Không có báo cáo nào liên quan đến bạn'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedReports.map((report, index) => (
                        <TableRow key={report.id} className="hover:bg-gray-50">
                          <TableCell className="text-left">
                            <span className="font-mono text-sm text-gray-600">{startIndex + index + 1}</span>
                          </TableCell>
                        <TableCell className="text-left">
                          <div className="flex items-center gap-2">
                            {isLearner ? (
                              <>
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={report.reportedAvatarUrl} alt={report.reportedUserName} />
                                  <AvatarFallback className="bg-[#F2E5BF] text-[#257180] text-xs">
                                    {report.reportedUserName?.[0]?.toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{report.reportedUserName || 'N/A'}</p>
                                  <p className="text-xs text-gray-500">{report.reportedUserEmail}</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={report.reporterAvatarUrl} alt={report.reporterName} />
                                  <AvatarFallback className="bg-[#F2E5BF] text-[#257180] text-xs">
                                    {report.reporterName?.[0]?.toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{report.reporterName || 'N/A'}</p>
                                  <p className="text-xs text-gray-500">{report.reporterEmail}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-left">
                          <p className="text-sm line-clamp-2">{report.reason}</p>
                        </TableCell>
                        <TableCell className="text-left">
                          <Badge className={getStatusColor(report.status)}>
                            {getStatusLabel(report.status)}
                          </Badge>
                        </TableCell>
                          <TableCell className="text-sm text-gray-600 text-left">
                            {formatDate(report.createdAt)}
                          </TableCell>
                          <TableCell className="text-left">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(report)}
                              className="p-2 hover:bg-[#FD8B51] hover:text-white"
                            >
                              <Eye className="h-5 w-5" />
                            </Button>
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

      {showDetailDialog && selectedReport && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby={undefined}>
            <DialogHeader className="flex-shrink-0 pb-2">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <DialogTitle className="text-xl font-semibold text-gray-900">Chi tiết báo cáo</DialogTitle>
                {isPendingOrUnderReviewStatus(selectedReport.status) && !canSubmitDefense && (
                  <span className="text-base font-bold text-gray-700">
                    Đã quá thời gian kháng cáo
                  </span>
                )}
              </div>
            </DialogHeader>
            {selectedReport && (
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                <Card className="bg-white border border-[#257180]/20 transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900">Thông tin cơ bản</CardTitle>
                  </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-gray-600">Người báo cáo</Label>
                          <div className="flex items-center gap-3 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={selectedReport.reporterAvatarUrl} alt={selectedReport.reporterName} />
                              <AvatarFallback className="bg-[#F2E5BF] text-[#257180] text-sm font-semibold">
                                {selectedReport.reporterName?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 truncate">{selectedReport.reporterName || 'N/A'}</p>
                              <p className="text-xs text-gray-500 truncate">{selectedReport.reporterEmail}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Người bị báo cáo</Label>
                          <div className="flex items-center gap-3 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={selectedReport.reportedAvatarUrl} alt={selectedReport.reportedUserName} />
                              <AvatarFallback className="bg-[#F2E5BF] text-[#257180] text-sm font-semibold">
                                {selectedReport.reportedUserName?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 truncate">{selectedReport.reportedUserName || 'N/A'}</p>
                              <p className="text-xs text-gray-500 truncate">{selectedReport.reportedUserEmail}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-gray-600">Trạng thái</Label>
                          <div className="mt-2">
                            <Badge className={getStatusColor(selectedReport.status)}>
                              {getStatusLabel(selectedReport.status)}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Ngày tạo</Label>
                          <p className="font-medium text-gray-900 mt-2">{formatDateTime(selectedReport.createdAt)}</p>
                        </div>
                      </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-[#257180]/20 transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900">Lý do báo cáo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-900 mt-2 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                      {selectedReport.reason}
                    </p>
                  </CardContent>
                </Card>

                {selectedReport.handledByAdminEmail && (
                  <Card className="border border-red-300 bg-red-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold text-red-900">
                        Xử lý bởi {selectedReport.handledByAdminEmail}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-red-900 mt-2 p-3 bg-white/70 rounded-lg border border-red-200 whitespace-pre-wrap">
                        {selectedReport.adminNotes && selectedReport.adminNotes.trim().length > 0
                          ? selectedReport.adminNotes
                          : 'Chưa có ghi chú xử lý'}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {selectedReport.reporterEvidences && selectedReport.reporterEvidences.length > 0 && (
                  <Card className="bg-white border border-[#257180]/20 transition-shadow hover:shadow-md">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-gray-900">
                        Bằng chứng từ người báo cáo ({selectedReport.reporterEvidences.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedReport.reporterEvidences.map((evidence) => {
                          const mediaTypeNum = normalizeMediaType(evidence.mediaType);
                          const isImage = mediaTypeNum === MediaType.Image || mediaTypeNum === 0;
                          return (
                            <div key={evidence.id} className="relative group">
                              <div 
                                className={`aspect-square rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-100 ${isImage ? 'cursor-pointer' : ''}`}
                                onClick={() => isImage && setPreviewImage(evidence.fileUrl)}
                              >
                                {isImage ? (
                                  <img
                                    src={evidence.fileUrl}
                                    alt={evidence.caption || 'Evidence'}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <video
                                    src={evidence.fileUrl}
                                    controls
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              {evidence.caption && (
                                <p className="text-xs text-gray-600 mt-2 line-clamp-2 text-left">{evidence.caption}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                  </div>

                  <div className="lg:col-span-1">
                    {selectedReport.defenses && selectedReport.defenses.length > 0 ? (
                      <Card className="bg-white border border-[#257180]/20 sticky top-0 transition-shadow hover:shadow-md">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-semibold text-gray-900">
                            Kháng cáo
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto">
                            {selectedReport.defenses.map((defense) => (
                              <div key={defense.id} className="p-4 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3 mb-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={tutorAvatars[defense.tutorEmail]} alt={tutorNames[defense.tutorEmail] || defense.tutorEmail} />
                                    <AvatarFallback className="bg-[#F2E5BF] text-[#257180] text-sm font-semibold">
                                      {(tutorNames[defense.tutorEmail] || defense.tutorEmail)[0]?.toUpperCase() || 'T'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-gray-900 truncate">{tutorNames[defense.tutorEmail] || defense.tutorEmail}</p>
                                    <p className="text-xs text-gray-500">{formatDateTime(defense.createdAt)}</p>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-900 mb-3 leading-relaxed whitespace-pre-wrap">{defense.note}</p>
                                {defense.evidences && defense.evidences.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <Label className="text-sm text-gray-600 mb-2 block">Bằng chứng kháng cáo ({defense.evidences.length})</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                      {defense.evidences.map((evidence) => {
                                        const mediaTypeNum = normalizeMediaType(evidence.mediaType);
                                        const isImage = mediaTypeNum === MediaType.Image || mediaTypeNum === 0;
                                        return (
                                          <div key={evidence.id} className="relative">
                                            <div 
                                              className={`aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-100 ${isImage ? 'cursor-pointer' : ''}`}
                                              onClick={() => isImage && setPreviewImage(evidence.fileUrl)}
                                            >
                                              {isImage ? (
                                                <img
                                                  src={evidence.fileUrl}
                                                  alt={evidence.caption || 'Evidence'}
                                                  className="w-full h-full object-cover"
                                                />
                                              ) : (
                                                <video
                                                  src={evidence.fileUrl}
                                                  controls
                                                  className="w-full h-full object-cover"
                                                />
                                              )}
                                            </div>
                                            {evidence.caption && (
                                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{evidence.caption}</p>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="bg-white border border-[#257180]/20 transition-shadow hover:shadow-md">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-semibold text-gray-900">Kháng cáo</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-500 text-center py-8">Chưa có kháng cáo</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              {isLearner && isPendingStatus(selectedReport.status) && (
                <>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const detailResponse = await ReportService.getFullReportDetail(selectedReport.id);
                      if (detailResponse.success && detailResponse.data) {
                        handleUpdate(detailResponse.data);
                      }
                    }}
                    disabled={isProcessing}
                    className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Thay đổi
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleConfirmCancel}
                    disabled={isProcessing}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Hủy báo cáo
                  </Button>
                </>
              )}
              {isTutor && isPendingOrUnderReviewStatus(selectedReport.status) && (
                canSubmitDefense ? (
                  <Button
                    onClick={() => {
                      setDefenseFormData({ note: '', evidences: [] });
                      setUploadingDefenseFiles([]);
                      setUploadedDefenseUrls([]);
                      setShowDefenseDialog(true);
                    }}
                    className="bg-[#257180] hover:bg-[#257180]/90 text-white"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Kháng cáo
                  </Button>
                ) : (
                  <span className="text-base font-semibold text-gray-600">
                    Đã quá thời gian kháng cáo
                  </span>
                )
              )}
              <Button
                variant="outline"
                onClick={() => setShowDetailDialog(false)}
                className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
              >
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0" aria-describedby={undefined}>
            <div className="relative w-full h-full flex items-center justify-center bg-black/90">
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[90vh] object-contain"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-white rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showCreateDialog && (
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo báo cáo mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Chọn gia sư báo cáo *</Label>
                <SelectWithSearch
                  value={formData.reportedUserEmail}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, reportedUserEmail: value }));
                  }}
                  placeholder="Chọn gia sư"
                  disabled={loadingTutors}
                  className="mt-2"
                >
                  {tutors.map((tutor) => (
                    <SelectWithSearchItem key={tutor.id} value={tutor.userEmail}>
                      {tutor.userName || tutor.userEmail}
                    </SelectWithSearchItem>
                  ))}
                </SelectWithSearch>
              </div>
              <div>
                <Label>Lý do báo cáo *</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Nhập lý do báo cáo..."
                  className="mt-2"
                  rows={4}
                />
              </div>
              <div>
                <Label>Bằng chứng (tùy chọn)</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileSelect}
                      disabled={uploading}
                      className="flex-1"
                    />
                    {uploading && <Loader2 className="h-4 w-4 animate-spin text-[#257180]" />}
                  </div>
                  {formData.evidences.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {formData.evidences.map((evidence, index) => {
                        const isImage = evidence.mediaType === MediaType.Image || evidence.mediaType === 0;
                        return (
                          <div key={index} className="relative group">
                            {isImage ? (
                              <img
                                src={evidence.fileUrl}
                                alt="Evidence"
                                className="w-full h-24 object-cover rounded border"
                              />
                            ) : (
                              <video
                                src={evidence.fileUrl}
                                controls
                                className="w-full h-24 object-cover rounded border"
                              />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFile(index)}
                              className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmitCreate}
                disabled={isProcessing || !formData.reportedUserEmail || !formData.reason.trim()}
                className="bg-[#257180] hover:bg-[#257180]/90 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Tạo báo cáo'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showUpdateDialog && selectedReport && (
        <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cập nhật báo cáo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Lý do báo cáo *</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Nhập lý do báo cáo..."
                  className="mt-2"
                  rows={4}
                />
              </div>
              {selectedReport.reporterEvidences && selectedReport.reporterEvidences.length > 0 && (
                <div>
                  <Label>Bằng chứng hiện tại</Label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedReport.reporterEvidences.map((evidence) => {
                      const mediaTypeNum = normalizeMediaType(evidence.mediaType);
                      const isImage = mediaTypeNum === MediaType.Image || mediaTypeNum === 0;
                      return (
                        <div key={evidence.id} className="relative group">
                          <div 
                            className={`aspect-square rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-100 ${isImage ? 'cursor-pointer' : ''}`}
                            onClick={() => isImage && setPreviewImage(evidence.fileUrl)}
                          >
                            {isImage ? (
                              <img
                                src={evidence.fileUrl}
                                alt={evidence.caption || 'Evidence'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video
                                src={evidence.fileUrl}
                                controls
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          {evidence.caption && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2 text-left">{evidence.caption}</p>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvidence(selectedReport.id, evidence.id)}
                            disabled={isProcessing}
                            className="absolute top-2 right-2 h-7 w-7 p-0 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div>
                <Label>Thêm bằng chứng mới (tùy chọn)</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileSelect}
                      disabled={uploading}
                      className="flex-1"
                    />
                    {uploading && <Loader2 className="h-4 w-4 animate-spin text-[#257180]" />}
                  </div>
                  {formData.evidences.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {formData.evidences.map((evidence, index) => {
                        const isImage = evidence.mediaType === MediaType.Image || evidence.mediaType === 0;
                        return (
                          <div key={index} className="relative group">
                            {isImage ? (
                              <img
                                src={evidence.fileUrl}
                                alt="Evidence"
                                className="w-full h-24 object-cover rounded border"
                              />
                            ) : (
                              <video
                                src={evidence.fileUrl}
                                controls
                                className="w-full h-24 object-cover rounded border"
                              />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFile(index)}
                              className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowUpdateDialog(false)}
                className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmUpdate}
                disabled={isProcessing || !formData.reason.trim()}
                className="bg-[#257180] hover:bg-[#257180]/90 text-white"
              >
                Cập nhật
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showDefenseDialog && selectedReport && (
        <Dialog open={showDefenseDialog} onOpenChange={setShowDefenseDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gửi kháng cáo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nội dung kháng cáo *</Label>
                <Textarea
                  value={defenseFormData.note}
                  onChange={(e) => setDefenseFormData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Nhập nội dung kháng cáo..."
                  className="mt-2"
                  rows={4}
                />
              </div>
              <div>
                <Label>Bằng chứng (tùy chọn)</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleDefenseFileSelect}
                      disabled={uploadingDefense}
                      className="flex-1"
                    />
                    {uploadingDefense && <Loader2 className="h-4 w-4 animate-spin text-[#257180]" />}
                  </div>
                  {defenseFormData.evidences.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {defenseFormData.evidences.map((evidence, index) => {
                        const isImage = evidence.mediaType === MediaType.Image || evidence.mediaType === 0;
                        return (
                          <div key={index} className="relative group">
                            {isImage ? (
                              <img
                                src={evidence.fileUrl}
                                alt="Evidence"
                                className="w-full h-24 object-cover rounded border"
                              />
                            ) : (
                              <video
                                src={evidence.fileUrl}
                                controls
                                className="w-full h-24 object-cover rounded border"
                              />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveDefenseFile(index)}
                              className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDefenseDialog(false)}
                className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmDefense}
                disabled={isProcessing || !defenseFormData.note.trim()}
                className="bg-[#257180] hover:bg-[#257180]/90 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Gửi kháng cáo'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={showConfirmDefense} onOpenChange={setShowConfirmDefense}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận gửi kháng cáo</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn gửi kháng cáo này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDefense(false)}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitDefense}
              className="bg-[#257180] hover:bg-[#257180]/90 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showConfirmUpdate} onOpenChange={setShowConfirmUpdate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận cập nhật báo cáo</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn cập nhật báo cáo này? Các thay đổi sẽ được lưu lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmUpdate(false)}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitUpdate}
              className="bg-[#257180] hover:bg-[#257180]/90 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showConfirmCancel} onOpenChange={setShowConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy báo cáo</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy báo cáo này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmCancel(false)}>
              Không
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelReport}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận hủy'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

