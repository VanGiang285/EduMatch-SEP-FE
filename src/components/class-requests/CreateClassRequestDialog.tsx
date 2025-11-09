'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/feedback/dialog';
import { Button } from '../ui/basic/button';
import { Input } from '../ui/form/input';
import { Textarea } from '../ui/form/textarea';
import { Label } from '../ui/form/label';
import { SelectWithSearch, SelectWithSearchItem } from '../ui/form/select-with-search';
import { Badge } from '../ui/basic/badge';
import { Card, CardContent } from '../ui/layout/card';
import { Separator } from '../ui/layout/separator';
import { RadioGroup, RadioGroupItem } from '../ui/form/radio-group';
import { 
  mockSubjects, 
  mockGradeLevels,
  mockTimeSlots,
  mockDaysOfWeek 
} from '@/data/mockClassRequests';
import { Home, Video, MapPin, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ClassRequestService } from '@/services/classRequestService';
import { CreateClassRequestRequest, CreateClassRequestSlotRequest } from '@/types/requests';
import { TeachingMode } from '@/types/enums';
import { useCustomToast } from '@/hooks/useCustomToast';

interface CreateClassRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRequest?: any;
  onSuccess?: () => void; // Callback khi tạo thành công
}

interface TimeSlotSelection {
  dayOfWeek: number;
  slotId: number;
}

export function CreateClassRequestDialog({ open, onOpenChange, editingRequest, onSuccess }: CreateClassRequestDialogProps) {
  const { showSuccess, showError } = useCustomToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data - initialize with editingRequest if available
  const [subjectId, setSubjectId] = useState<string>(editingRequest?.subjectId?.toString() || '');
  const [gradeId, setGradeId] = useState<string>(editingRequest?.gradeId?.toString() || '');
  const [title, setTitle] = useState<string>(editingRequest?.title || '');
  const [learningGoal, setLearningGoal] = useState<string>(editingRequest?.learningGoal || '');
  const [tutorRequirement, setTutorRequirement] = useState<string>(editingRequest?.tutorRequirement || '');
  const [teachingMode, setTeachingMode] = useState<string>(editingRequest?.teachingMode?.toString() || '1'); // 0=Tại nhà, 1=Trực tuyến
  const [sessionPerWeek, setSessionPerWeek] = useState<string>(editingRequest?.sessionPerWeek?.toString() || '2');
  const [totalSessions, setTotalSessions] = useState<string>(editingRequest?.totalSessions?.toString() || '12');
  const [minPrice, setMinPrice] = useState<string>(editingRequest?.minPrice?.toString() || '150000');
  const [maxPrice, setMaxPrice] = useState<string>(editingRequest?.maxPrice?.toString() || '200000');
  const [location, setLocation] = useState(editingRequest?.location || '');
  const [expectedStartDate, setExpectedStartDate] = useState<string>(editingRequest?.expectedStartDate || '');
  const [selectedSlots, setSelectedSlots] = useState<TimeSlotSelection[]>([]);

  // Reset form when editingRequest changes
  React.useEffect(() => {
      if (editingRequest) {
        setSubjectId(editingRequest.subjectId?.toString() || '');
        setGradeId(editingRequest.gradeId?.toString() || '');
        setTitle(editingRequest.title || '');
        setLearningGoal(editingRequest.learningGoal || '');
        setTutorRequirement(editingRequest.tutorRequirement || '');
        setTeachingMode(editingRequest.teachingMode?.toString() || '1');
        setSessionPerWeek(editingRequest.sessionPerWeek?.toString() || '2');
        setTotalSessions(editingRequest.totalSessions?.toString() || '12');
        setMinPrice(editingRequest.minPrice?.toString() || '150000');
        setMaxPrice(editingRequest.maxPrice?.toString() || '200000');
        setLocation(editingRequest.location || '');
        setExpectedStartDate(editingRequest.expectedStartDate || '');
      } else {
      // Reset to defaults when creating new
      setSubjectId('');
      setGradeId('');
      setTitle('');
      setLearningGoal('');
      setTutorRequirement('');
      setTeachingMode('1');
      setSessionPerWeek('2');
      setTotalSessions('12');
      setMinPrice('150000');
      setMaxPrice('200000');
      setLocation('');
      setExpectedStartDate('');
      setSelectedSlots([]);
    }
    setStep(1);
  }, [editingRequest, open]);

  // Get available grades based on selected subject
  const getAvailableGrades = () => {
    if (!subjectId) return [];
    
    const subjectIdNum = parseInt(subjectId);
    
    // Define which grades are available for each subject
    if ([1, 2, 3, 4, 5, 6].includes(subjectIdNum)) {
      // Math, Physics, Chemistry, Biology, Literature, English - all grades
      return mockGradeLevels;
    } else if ([7, 8].includes(subjectIdNum)) {
      // History, Geography - typically grade 6-12
      return mockGradeLevels.filter(g => g.id >= 6);
    } else if (subjectIdNum === 9) {
      // Computer Science - typically grade 6-12
      return mockGradeLevels.filter(g => g.id >= 6);
    }
    
    return mockGradeLevels;
  };

  const handleSlotToggle = (dayOfWeek: number, slotId: number) => {
    const exists = selectedSlots.find(
      (s) => s.dayOfWeek === dayOfWeek && s.slotId === slotId
    );

    if (exists) {
      setSelectedSlots(selectedSlots.filter(
        (s) => !(s.dayOfWeek === dayOfWeek && s.slotId === slotId)
      ));
    } else {
      setSelectedSlots([...selectedSlots, { dayOfWeek, slotId }]);
    }
  };

  const isSlotSelected = (dayOfWeek: number, slotId: number) => {
    return selectedSlots.some(
      (s) => s.dayOfWeek === dayOfWeek && s.slotId === slotId
    );
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (editingRequest) {
      // TODO: Implement update
      toast.success('Cập nhật yêu cầu mở lớp thành công!');
      setStep(1);
      onOpenChange(false);
      return;
    }

    // Tạo yêu cầu mới
    setIsSubmitting(true);
    try {
      // Map selectedSlots to CreateClassRequestSlotRequest format
      const slots: CreateClassRequestSlotRequest[] = selectedSlots.map(slot => {
        const timeSlot = mockTimeSlots.find(t => t.id === slot.slotId);
        return {
          dayOfWeek: slot.dayOfWeek,
          slotId: slot.slotId,
          // Backend có thể cần startTime và endTime từ timeSlot
        };
      });

      // Validate required fields
      if (!title.trim()) {
        showError('Lỗi', 'Vui lòng nhập tiêu đề yêu cầu');
        return;
      }
      if (!learningGoal.trim()) {
        showError('Lỗi', 'Vui lòng nhập mục tiêu học tập');
        return;
      }
      if (!tutorRequirement.trim()) {
        showError('Lỗi', 'Vui lòng nhập yêu cầu gia sư');
        return;
      }
      if (!expectedStartDate) {
        showError('Lỗi', 'Vui lòng chọn ngày bắt đầu dự kiến');
        return;
      }
      const sessionsNum = parseInt(totalSessions);
      if (isNaN(sessionsNum) || sessionsNum < 1 || sessionsNum > 100) {
        showError('Lỗi', 'Số buổi phải từ 1 đến 100');
        return;
      }

      const request: CreateClassRequestRequest = {
        subjectId: parseInt(subjectId),
        levelId: gradeId ? parseInt(gradeId) : undefined,
        teachingMode: parseInt(teachingMode) as TeachingMode,
        expectedTotalSessions: sessionsNum,
        expectedSessions: sessionsNum, // Backend may use this field name
        targetUnitPriceMin: minPrice ? parseInt(minPrice) : undefined,
        targetUnitPriceMax: maxPrice ? parseInt(maxPrice) : undefined,
        title: title.trim(),
        learningGoal: learningGoal.trim(),
        tutorRequirement: tutorRequirement.trim(),
        expectedStartDate: expectedStartDate, // ISO date string
        addressLine: location || undefined,
        slots: slots,
      };

      console.log('[Create Request] Submitting:', request);
      const response = await ClassRequestService.createClassRequest(request);
      console.log('[Create Request] Response:', response);

      if (response.success && response.data) {
        showSuccess('Thành công', 'Tạo yêu cầu mở lớp thành công!');
        console.log('[Create Request] Created request ID:', response.data.id);
        // Reset form
        setStep(1);
        setSubjectId('');
        setGradeId('');
        setTitle('');
        setLearningGoal('');
        setTutorRequirement('');
        setTeachingMode('1');
        setSessionPerWeek('2');
        setTotalSessions('12');
        setMinPrice('150000');
        setMaxPrice('200000');
        setLocation('');
        setExpectedStartDate('');
        setSelectedSlots([]);
        onOpenChange(false);
        // Call callback để reload danh sách
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(response.message || 'Tạo yêu cầu thất bại');
      }
    } catch (err: any) {
      console.error('[Create Request] Error:', err);
      // Kiểm tra nếu là lỗi 403 (Forbidden) - check status code
      if (err.status === 403 || err.message?.includes('403') || err.message?.includes('Forbidden')) {
        showError('Lỗi', 'Bạn không có quyền tạo yêu cầu. Vui lòng đăng nhập với tài khoản Learner.');
      } else if (err.status === 400 && (err.details?.errors || err.details)) {
        // Xử lý validation errors từ backend
        const errors = err.details?.errors || err.details;
        const errorMessages: string[] = [];
        if (errors.Title) errorMessages.push(`Tiêu đề: ${Array.isArray(errors.Title) ? errors.Title.join(', ') : errors.Title}`);
        if (errors.LearningGoal) errorMessages.push(`Mục tiêu học tập: ${Array.isArray(errors.LearningGoal) ? errors.LearningGoal.join(', ') : errors.LearningGoal}`);
        if (errors.TutorRequirement) errorMessages.push(`Yêu cầu gia sư: ${Array.isArray(errors.TutorRequirement) ? errors.TutorRequirement.join(', ') : errors.TutorRequirement}`);
        if (errors.ExpectedSessions) errorMessages.push(`Số buổi: ${Array.isArray(errors.ExpectedSessions) ? errors.ExpectedSessions.join(', ') : errors.ExpectedSessions}`);
        if (errors.ExpectedStartDate) errorMessages.push(`Ngày bắt đầu: ${Array.isArray(errors.ExpectedStartDate) ? errors.ExpectedStartDate.join(', ') : errors.ExpectedStartDate}`);
        showError('Lỗi validation', errorMessages.length > 0 ? errorMessages.join('\n') : 'Vui lòng kiểm tra lại thông tin đã nhập');
      } else {
        showError('Lỗi', err.message || 'Không thể tạo yêu cầu. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedStep1 = subjectId && gradeId && title.trim().length > 0 && learningGoal.trim().length > 0 && tutorRequirement.trim().length > 0 && expectedStartDate && totalSessions && parseInt(totalSessions) >= 1 && parseInt(totalSessions) <= 100;
  const canProceedStep2 = teachingMode && minPrice && maxPrice && parseInt(maxPrice) >= parseInt(minPrice);
  const canSubmit = selectedSlots.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full !max-w-[95vw] sm:!max-w-[80vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl">
            {editingRequest ? 'Chỉnh sửa yêu cầu mở lớp' : 'Tạo yêu cầu mở lớp'} - Bước {step}/3
          </DialogTitle>
          <DialogDescription className="text-base">
            {step === 1 && 'Thông tin môn học và mô tả yêu cầu'}
            {step === 2 && 'Hình thức dạy học và ngân sách'}
            {step === 3 && 'Chọn khung giờ học mong muốn'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`h-2 rounded-full flex-1 ${
                  s <= step ? 'bg-[#257180]' : 'bg-gray-200'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Step 1: Subject & Description */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Môn học *</Label>
                <SelectWithSearch
                  value={subjectId}
                  onValueChange={(val) => {
                    setSubjectId(val);
                    setGradeId(''); // Reset grade when subject changes
                  }}
                  placeholder="Chọn môn học"
                  className="mt-2"
                >
                  {mockSubjects.map((subject) => (
                    <SelectWithSearchItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectWithSearchItem>
                  ))}
                </SelectWithSearch>
              </div>

              <div>
                <Label htmlFor="grade">Lớp *</Label>
                <SelectWithSearch
                  value={gradeId}
                  onValueChange={setGradeId}
                  placeholder="Chọn lớp"
                  disabled={!subjectId}
                  className="mt-2"
                >
                  {getAvailableGrades().map((grade) => (
                    <SelectWithSearchItem key={grade.id} value={grade.id.toString()}>
                      {grade.name}
                    </SelectWithSearchItem>
                  ))}
                </SelectWithSearch>
                {!subjectId && (
                  <p className="text-sm text-gray-500 mt-1">Vui lòng chọn môn học trước</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="title">Tiêu đề yêu cầu *</Label>
              <Input
                id="title"
                placeholder="Ví dụ: Tìm gia sư dạy Toán lớp 12"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="learningGoal">Mục tiêu học tập *</Label>
              <Textarea
                id="learningGoal"
                placeholder="Ví dụ: Ôn thi THPT Quốc gia, nâng cao điểm số, củng cố kiến thức cơ bản..."
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                className="mt-2 min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="tutorRequirement">Yêu cầu gia sư *</Label>
              <Textarea
                id="tutorRequirement"
                placeholder="Ví dụ: Có kinh nghiệm dạy THPT, nhiệt tình, có phương pháp dạy phù hợp..."
                value={tutorRequirement}
                onChange={(e) => setTutorRequirement(e.target.value)}
                className="mt-2 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sessionPerWeek">Số buổi/tuần</Label>
                <Input
                  id="sessionPerWeek"
                  type="number"
                  min="1"
                  max="7"
                  value={sessionPerWeek}
                  onChange={(e) => setSessionPerWeek(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="totalSessions">Tổng số buổi * (1-100)</Label>
                <Input
                  id="totalSessions"
                  type="number"
                  min="1"
                  max="100"
                  value={totalSessions}
                  onChange={(e) => setTotalSessions(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="expectedStartDate">Ngày bắt đầu dự kiến *</Label>
              <Input
                id="expectedStartDate"
                type="date"
                value={expectedStartDate}
                onChange={(e) => setExpectedStartDate(e.target.value)}
                className="mt-2"
                min={new Date().toISOString().split('T')[0]} // Không cho chọn ngày trong quá khứ
              />
            </div>
          </div>
        )}

        {/* Step 2: Teaching Mode & Budget */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <Label>Hình thức dạy học *</Label>
              <RadioGroup value={teachingMode} onValueChange={setTeachingMode} className="mt-2">
                <Card className="mb-2">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="online" />
                      <Label htmlFor="online" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Video className="h-5 w-5 text-[#257180]" />
                          <div>
                            <p className="font-medium">Trực tuyến</p>
                            <p className="text-sm text-gray-600">Học qua Google Meet, Zoom, v.v.</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="offline" />
                      <Label htmlFor="offline" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Home className="h-5 w-5 text-[#257180]" />
                          <div>
                            <p className="font-medium">Tại nhà</p>
                            <p className="text-sm text-gray-600">Gia sư đến tận nhà dạy</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              </RadioGroup>
            </div>

            {teachingMode === '0' && (
              <div>
                <Label htmlFor="location">Địa chỉ học *</Label>
                <div className="relative mt-2">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, thành phố"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            )}

            <Separator />

            <div>
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Khoảng giá mong muốn (₫/buổi) *
              </Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="minPrice" className="text-sm text-gray-600">Giá tối thiểu</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    step="10000"
                    min="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="maxPrice" className="text-sm text-gray-600">Giá tối đa</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    step="10000"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              {parseInt(maxPrice) < parseInt(minPrice) && (
                <p className="text-sm text-red-500 mt-1">Giá tối đa phải lớn hơn hoặc bằng giá tối thiểu</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Time Slots Selection */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Hướng dẫn:</strong> Chọn các khung giờ bạn mong muốn học. Mỗi ô tương ứng với 1 giờ học.
                Bạn có thể chọn nhiều khung giờ khác nhau.
              </p>
              <p className="text-sm text-blue-700 mt-2">
                Đã chọn: <strong>{selectedSlots.length}</strong> khung giờ
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-100 sticky left-0 z-10">Giờ</th>
                    {mockDaysOfWeek.map((day) => (
                      <th key={day.id} className="border p-2 bg-gray-100 text-sm">
                        {day.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockTimeSlots
                    .filter((slot) => slot.id >= 6 && slot.id <= 22) // Only show 6:00 - 22:00
                    .map((slot) => (
                      <tr key={slot.id}>
                        <td className="border p-2 text-sm font-medium bg-gray-50 sticky left-0 z-10">
                          {slot.display}
                        </td>
                        {mockDaysOfWeek.map((day) => (
                          <td key={day.id} className="border p-0">
                            <button
                              type="button"
                              onClick={() => handleSlotToggle(day.id, slot.id)}
                              className={`w-full h-12 transition-colors ${
                                isSlotSelected(day.id, slot.id)
                                  ? 'bg-[#257180] hover:bg-[#1f5a66] text-white'
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              {isSlotSelected(day.id, slot.id) && '✓'}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {selectedSlots.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-2">Khung giờ đã chọn:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSlots.map((slot, index) => {
                    const day = mockDaysOfWeek.find((d) => d.id === slot.dayOfWeek);
                    const timeSlot = mockTimeSlots.find((t) => t.id === slot.slotId);
                    return (
                      <Badge key={index} variant="secondary" className="bg-[#257180] text-white">
                        {day?.shortName} {timeSlot?.display}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-6 border-t mt-6">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Quay lại
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2)
                }
                className="bg-[#257180] hover:bg-[#1f5a66]"
              >
                Tiếp tục
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="bg-[#257180] hover:bg-[#1f5a66]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  editingRequest ? 'Cập nhật yêu cầu' : 'Tạo yêu cầu'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

