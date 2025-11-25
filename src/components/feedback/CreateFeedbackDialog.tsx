'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/feedback/dialog';
import { Button } from '../ui/basic/button';
import { Label } from '../ui/form/label';
import { Textarea } from '../ui/form/textarea';
import { Star } from 'lucide-react';
import { FeedbackService } from '@/services/feedbackService';
import { FeedbackCriterion } from '@/types/backend';
import { CreateTutorFeedbackRequest, CreateTutorFeedbackDetailRequest } from '@/types/requests';
import { useCustomToast } from '@/hooks/useCustomToast';
import { Loader2 } from 'lucide-react';

interface CreateFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutorId: number;
  bookingId: number;
  onSuccess?: () => void;
}

const getCriterionVietnameseName = (criterion: FeedbackCriterion): string => {
  const code = criterion.code?.toLowerCase().trim() || '';
  const name = criterion.name?.toLowerCase().trim() || '';
  
  const vietnameseMap: { [key: string]: string } = {
    'teaching_quality': 'Chất lượng giảng dạy',
    'teachingquality': 'Chất lượng giảng dạy',
    'communication': 'Giao tiếp',
    'punctuality': 'Đúng giờ',
    'professionalism': 'Chuyên nghiệp',
    'knowledge': 'Kiến thức',
    'patience': 'Kiên nhẫn',
    'preparation': 'Chuẩn bị bài học',
    'engagement': 'Tương tác',
    'feedback': 'Phản hồi',
    'flexibility': 'Linh hoạt',
    'clarity': 'Rõ ràng',
    'enthusiasm': 'Nhiệt tình',
    'lesson_quality': 'Chất lượng bài học',
    'lessonquality': 'Chất lượng bài học',
    'lesson quality': 'Chất lượng bài học',
    'support': 'Hỗ trợ',
    'teaching_skill': 'Kỹ năng giảng dạy',
    'teachingskill': 'Kỹ năng giảng dạy',
    'teaching skill': 'Kỹ năng giảng dạy',
    'satisfaction': 'Sự hài lòng',
  };
  
  const mappedName = vietnameseMap[code] || 
                    vietnameseMap[name] ||
                    (criterion.name && vietnameseMap[criterion.name.toLowerCase().trim()]) ||
                    criterion.name;
  
  return mappedName;
};

export function CreateFeedbackDialog({
  open,
  onOpenChange,
  tutorId,
  bookingId,
  onSuccess,
}: CreateFeedbackDialogProps) {
  const { showSuccess, showError } = useCustomToast();
  const showErrorRef = useRef(showError);
  const [criteria, setCriteria] = useState<FeedbackCriterion[]>([]);
  const [loadingCriteria, setLoadingCriteria] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState('');
  const [ratings, setRatings] = useState<{ [criterionId: number]: number }>({});
  const [hoveredRating, setHoveredRating] = useState<{ [criterionId: number]: number }>({});

  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);

  const loadCriteria = useCallback(async () => {
    setLoadingCriteria(true);
    try {
      const response = await FeedbackService.getAllCriteria();
      if (response.success && response.data) {
        setCriteria(response.data);
        const initialRatings: { [criterionId: number]: number } = {};
        response.data.forEach((criterion) => {
          initialRatings[criterion.id] = 0;
        });
        setRatings(initialRatings);
      } else {
        showErrorRef.current('Lỗi', 'Không thể tải danh sách tiêu chí đánh giá');
      }
    } catch (error) {
      showErrorRef.current('Lỗi', 'Không thể tải danh sách tiêu chí đánh giá');
    } finally {
      setLoadingCriteria(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadCriteria();
    } else {
      setComment('');
      setRatings({});
      setHoveredRating({});
    }
  }, [open, loadCriteria]);

  const handleRatingClick = (criterionId: number, rating: number) => {
    setRatings((prev) => ({
      ...prev,
      [criterionId]: rating,
    }));
  };

  const handleSubmit = async () => {
    const feedbackDetails: CreateTutorFeedbackDetailRequest[] = criteria
      .filter((criterion) => ratings[criterion.id] > 0)
      .map((criterion) => ({
        criterionId: criterion.id,
        rating: ratings[criterion.id],
      }));

    if (feedbackDetails.length !== criteria.length) {
      showError('Lỗi', 'Vui lòng đánh giá đầy đủ tất cả các tiêu chí');
      return;
    }

    setSubmitting(true);
    try {
      const request: CreateTutorFeedbackRequest = {
        bookingId,
        tutorId,
        comment: comment.trim() || undefined,
        feedbackDetails,
      };

      const response = await FeedbackService.createFeedback(request);
      if (response.success) {
        showSuccess('Thành công', 'Đánh giá đã được gửi thành công');
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        showError('Lỗi', response.message || 'Không thể gửi đánh giá');
      }
    } catch (error: any) {
      showError('Lỗi', error.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = () => {
    if (criteria.length === 0) return false;
    return criteria.every((criterion) => ratings[criterion.id] > 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Tạo đánh giá
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {loadingCriteria ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#257180]" />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">
                    Đánh giá theo tiêu chí
                  </h3>
                  <span className={`text-sm font-medium ${
                    Object.values(ratings).filter(r => r > 0).length === criteria.length
                      ? 'text-green-600'
                      : 'text-orange-600'
                  }`}>
                    {Object.values(ratings).filter(r => r > 0).length} / {criteria.length} tiêu chí đã đánh giá
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {criteria.map((criterion) => (
                    <div key={criterion.id} className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="mb-3">
                        <Label className="text-sm font-semibold text-gray-800">
                          {getCriterionVietnameseName(criterion)}
                        </Label>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => {
                          const currentRating = ratings[criterion.id] || 0;
                          const hovered = hoveredRating[criterion.id] || 0;
                          const isActive = rating <= currentRating;
                          const isHovered = rating <= hovered && hovered > 0;
                          
                          return (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => handleRatingClick(criterion.id, rating)}
                              onMouseEnter={() => setHoveredRating(prev => ({ ...prev, [criterion.id]: rating }))}
                              onMouseLeave={() => setHoveredRating(prev => ({ ...prev, [criterion.id]: 0 }))}
                              className="focus:outline-none transition-all hover:scale-110 active:scale-95"
                              aria-label={`Đánh giá ${rating} sao`}
                            >
                              <Star
                                className={`w-7 h-7 transition-colors ${
                                  isActive
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : isHovered
                                    ? 'fill-[#FD8B51] text-[#FD8B51]'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <Label htmlFor="comment" className="text-base font-semibold text-gray-900">
                    Nhận xét (tùy chọn)
                  </Label>
                  <Textarea
                    id="comment"
                    placeholder="Chia sẻ thêm về trải nghiệm học tập của bạn..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[120px] resize-none border-gray-300 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                    rows={5}
                  />
                  <p className="text-xs text-gray-500">
                    {comment.length} / 500 ký tự
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid() || submitting || loadingCriteria}
            className="bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang gửi...
              </>
            ) : (
              'Gửi đánh giá'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

