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
  mockGradeLevels,
  mockTimeSlots,
  mockDaysOfWeek 
} from '@/data/mockClassRequests';
import { Home, Video, MapPin, DollarSign, Loader2, Info, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ClassRequestService } from '@/services/classRequestService';
import { CreateClassRequestRequest, CreateClassRequestSlotRequest, UpdateClassRequestRequest } from '@/types/requests';
import { TeachingMode } from '@/types/enums';
import { useCustomToast } from '@/hooks/useCustomToast';
import { SubjectService } from '@/services/subjectService';
import { SubjectDto } from '@/types/backend';

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
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  
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

  const findSlotIdByTime = (startTime: string, endTime: string): number | null => {
    const start = startTime.substring(0, 5);
    const end = endTime.substring(0, 5);
    const slot = mockTimeSlots.find(
      s => s.startTime.substring(0, 5) === start && s.endTime.substring(0, 5) === end
    );
    return slot ? slot.id : null;
  };

  React.useEffect(() => {
    if (editingRequest) {
      const subject = subjects.find(s => s.subjectName === editingRequest.subjectName);
      setSubjectId(subject?.id?.toString() || editingRequest.subjectId?.toString() || '');
      
      const grade = mockGradeLevels.find(g => g.name === editingRequest.level);
      setGradeId(grade?.id?.toString() || editingRequest.gradeId?.toString() || '');
      
      setTitle(editingRequest.title || '');
      setLearningGoal(editingRequest.learningGoal || '');
      setTutorRequirement(editingRequest.tutorRequirement || '');
      
      const modeNum = typeof editingRequest.mode === 'number' 
        ? editingRequest.mode 
        : editingRequest.mode === 'Online' || editingRequest.mode === '1' ? 1 
        : editingRequest.mode === 'Offline' || editingRequest.mode === '0' ? 0 
        : 1;
      setTeachingMode(modeNum.toString());
      
      setSessionPerWeek(editingRequest.sessionPerWeek?.toString() || editingRequest.expectedSessions?.toString() || '2');
      setTotalSessions(editingRequest.totalSessions?.toString() || editingRequest.expectedSessions?.toString() || '12');
      setMinPrice(editingRequest.minPrice?.toString() || editingRequest.targetUnitPriceMin?.toString() || '150000');
      setMaxPrice(editingRequest.maxPrice?.toString() || editingRequest.targetUnitPriceMax?.toString() || '200000');
      setLocation(editingRequest.location || editingRequest.addressLine || '');
      setExpectedStartDate(editingRequest.expectedStartDate || '');

      if (editingRequest.slots && Array.isArray(editingRequest.slots)) {
        const mappedSlots: TimeSlotSelection[] = editingRequest.slots
          .map((slot: any) => {
            const slotId = findSlotIdByTime(slot.startTime || '', slot.endTime || '');
            if (slotId !== null && slot.dayOfWeek !== undefined) {
              return {
                dayOfWeek: slot.dayOfWeek,
                slotId: slotId,
              };
            }
            return null;
          })
          .filter((s): s is TimeSlotSelection => s !== null);
        setSelectedSlots(mappedSlots);
      } else {
        setSelectedSlots([]);
      }
    } else {
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
  }, [editingRequest, open, subjects]);

  React.useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await SubjectService.getAllSubjects();
        if (response.success && response.data) {
          setSubjects(response.data);
        } else {
          setSubjects([]);
        }
      } catch {
        setSubjects([]);
      }
    };

    loadSubjects();
  }, []);

  const getAvailableGrades = () => {
    if (!subjectId) return [];
    
    const subjectIdNum = parseInt(subjectId);
    
    if ([1, 2, 3, 4, 5, 6].includes(subjectIdNum)) {
      return mockGradeLevels;
    } else if ([7, 8].includes(subjectIdNum)) {
      return mockGradeLevels.filter(g => g.id >= 6);
    } else if (subjectIdNum === 9) {
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
      setIsSubmitting(true);
      try {
        if (!title.trim()) {
          showError('Lỗi', 'Vui lòng nhập tiêu đề yêu cầu');
          setIsSubmitting(false);
          return;
        }
        if (!learningGoal.trim()) {
          showError('Lỗi', 'Vui lòng nhập mục tiêu học tập');
          setIsSubmitting(false);
          return;
        }
        if (!tutorRequirement.trim()) {
          showError('Lỗi', 'Vui lòng nhập yêu cầu gia sư');
          setIsSubmitting(false);
          return;
        }
        if (!expectedStartDate) {
          showError('Lỗi', 'Vui lòng chọn ngày bắt đầu dự kiến');
          setIsSubmitting(false);
          return;
        }
        const sessionsNum = parseInt(totalSessions);
        if (isNaN(sessionsNum) || sessionsNum < 1 || sessionsNum > 100) {
          showError('Lỗi', 'Số buổi phải từ 1 đến 100');
          setIsSubmitting(false);
          return;
        }
        if (selectedSlots.length === 0) {
          showError('Lỗi', 'Vui lòng chọn ít nhất một khung giờ học');
          setIsSubmitting(false);
          return;
        }

        const slots: CreateClassRequestSlotRequest[] = selectedSlots.map(slot => ({
          dayOfWeek: slot.dayOfWeek,
          slotId: slot.slotId,
        }));

        if (!gradeId) {
          showError('Lỗi', 'Vui lòng chọn lớp học');
          setIsSubmitting(false);
          return;
        }
        if (!minPrice || !maxPrice) {
          showError('Lỗi', 'Vui lòng nhập mức giá mong muốn');
          setIsSubmitting(false);
          return;
        }

        const teachingModeNum = parseInt(teachingMode) as TeachingMode;
        const updateRequest: UpdateClassRequestRequest = {
          id: editingRequest.id,
          subjectId: parseInt(subjectId),
          levelId: parseInt(gradeId), // Backend yêu cầu Required
          mode: teachingModeNum, // Backend yêu cầu field này (int), không phải teachingMode
          expectedSessions: sessionsNum, // Backend yêu cầu Required
          targetUnitPriceMin: parseInt(minPrice), // Backend yêu cầu Required
          targetUnitPriceMax: parseInt(maxPrice), // Backend yêu cầu Required
          title: title.trim(),
          learningGoal: learningGoal.trim(),
          tutorRequirement: tutorRequirement.trim(),
          expectedStartDate: expectedStartDate, // Backend yêu cầu Required (DateOnly)
          addressLine: location || undefined,
          slots: slots, // Backend yêu cầu Required
        };

        const response = await ClassRequestService.updateClassRequest(editingRequest.id, updateRequest);

        if (response.success) {
          showSuccess('Thành công', 'Cập nhật yêu cầu mở lớp thành công!');
          setStep(1);
          onOpenChange(false);
          if (onSuccess) {
            await new Promise(resolve => setTimeout(resolve, 300));
            onSuccess();
          }
        } else {
          throw new Error(response.message || 'Cập nhật yêu cầu thất bại');
        }
      } catch (err: any) {
        if (err.status === 400 && (err.details?.errors || err.details)) {
          const errors = err.details?.errors || err.details;
          const errorMessages: string[] = [];
          if (errors.Title) errorMessages.push(`Tiêu đề: ${Array.isArray(errors.Title) ? errors.Title.join(', ') : errors.Title}`);
          if (errors.LearningGoal) errorMessages.push(`Mục tiêu học tập: ${Array.isArray(errors.LearningGoal) ? errors.LearningGoal.join(', ') : errors.LearningGoal}`);
          if (errors.TutorRequirement) errorMessages.push(`Yêu cầu gia sư: ${Array.isArray(errors.TutorRequirement) ? errors.TutorRequirement.join(', ') : errors.TutorRequirement}`);
          if (errors.ExpectedSessions) errorMessages.push(`Số buổi: ${Array.isArray(errors.ExpectedSessions) ? errors.ExpectedSessions.join(', ') : errors.ExpectedSessions}`);
          if (errors.ExpectedStartDate) errorMessages.push(`Ngày bắt đầu: ${Array.isArray(errors.ExpectedStartDate) ? errors.ExpectedStartDate.join(', ') : errors.ExpectedStartDate}`);
          if (errors.Slots) errorMessages.push(`Khung giờ: ${Array.isArray(errors.Slots) ? errors.Slots.join(', ') : errors.Slots}`);
          showError('Lỗi validation', errorMessages.length > 0 ? errorMessages.join('\n') : 'Vui lòng kiểm tra lại thông tin đã nhập');
        } else {
          showError('Lỗi', err.message || 'Không thể cập nhật yêu cầu. Vui lòng thử lại.');
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const slots: CreateClassRequestSlotRequest[] = selectedSlots.map(slot => {
        const timeSlot = mockTimeSlots.find(t => t.id === slot.slotId);
        return {
          dayOfWeek: slot.dayOfWeek,
          slotId: slot.slotId,
        };
      });
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
        expectedSessions: sessionsNum,
        targetUnitPriceMin: minPrice ? parseInt(minPrice) : undefined,
        targetUnitPriceMax: maxPrice ? parseInt(maxPrice) : undefined,
        title: title.trim(),
        learningGoal: learningGoal.trim(),
        tutorRequirement: tutorRequirement.trim(),
        expectedStartDate: expectedStartDate,
        addressLine: location || undefined,
        slots: slots,
      };

      const response = await ClassRequestService.createClassRequest(request);

      if (response.success && response.data) {
        showSuccess('Thành công', 'Tạo yêu cầu mở lớp thành công!');
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
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(response.message || 'Tạo yêu cầu thất bại');
      }
    } catch (err: any) {
      if (err.status === 403 || err.message?.includes('403') || err.message?.includes('Forbidden')) {
        showError('Lỗi', 'Bạn không có quyền tạo yêu cầu. Vui lòng đăng nhập với tài khoản Learner.');
      } else if (err.status === 400 && (err.details?.errors || err.details)) {
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
                  {subjects.map((subject) => (
                    <SelectWithSearchItem key={subject.id} value={subject.id.toString()}>
                      {subject.subjectName}
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

        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-[#F2E5BF]/30 border border-[#257180]/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-[#257180] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Hướng dẫn chọn khung giờ
                  </p>
                  <p className="text-sm text-gray-600">
                    Chọn các khung giờ bạn mong muốn học. Mỗi ô tương ứng với 1 giờ học. Bạn có thể chọn nhiều khung giờ khác nhau trong tuần.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge className="bg-[#257180] text-white">
                      Đã chọn: {selectedSlots.length} khung giờ
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#257180] text-white">
                      <th className="border border-[#257180] p-3 text-left font-semibold sticky left-0 z-10 bg-[#257180] min-w-[120px]">
                        Khung giờ
                      </th>
                      {mockDaysOfWeek.map((day) => (
                        <th key={day.id} className="border border-[#257180] p-3 text-center font-semibold min-w-[100px]">
                          {day.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockTimeSlots
                      .filter((slot) => slot.id >= 6 && slot.id <= 22)
                      .map((slot) => (
                        <tr key={slot.id} className="hover:bg-gray-50 transition-colors">
                          <td className="border border-gray-200 p-3 text-sm font-medium bg-gray-50 sticky left-0 z-10">
                            <div className="flex flex-col">
                              <span className="text-gray-900">{slot.startTime.substring(0, 5)}</span>
                              <span className="text-gray-500 text-xs">- {slot.endTime.substring(0, 5)}</span>
                            </div>
                          </td>
                          {mockDaysOfWeek.map((day) => {
                            const isSelected = isSlotSelected(day.id, slot.id);
                            return (
                              <td key={day.id} className="border border-gray-200 p-0">
                                <button
                                  type="button"
                                  onClick={() => handleSlotToggle(day.id, slot.id)}
                                  className={`w-full h-14 transition-all duration-200 ${
                                    isSelected
                                      ? 'bg-[#257180] text-white hover:bg-[#1e5a66]'
                                      : 'bg-white hover:bg-[#F2E5BF]/30 text-gray-600 hover:text-[#257180]'
                                  }`}
                                >
                                  {isSelected ? (
                                    <div className="flex items-center justify-center">
                                      <CheckCircle className="h-5 w-5" />
                                    </div>
                                  ) : (
                                    <span className="text-xs">+</span>
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedSlots.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#257180]" />
                  Khung giờ đã chọn ({selectedSlots.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedSlots.map((slot, index) => {
                    const day = mockDaysOfWeek.find((d) => d.id === slot.dayOfWeek);
                    const timeSlot = mockTimeSlots.find((t) => t.id === slot.slotId);
                    return (
                      <Badge 
                        key={index} 
                        className="bg-[#257180] text-white hover:bg-[#1e5a66] cursor-default px-3 py-1.5"
                      >
                        {day?.shortName} {timeSlot?.startTime.substring(0, 5)}-{timeSlot?.endTime.substring(0, 5)}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

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

