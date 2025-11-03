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
import { Home, Video, MapPin, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface CreateClassRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRequest?: any;
}

interface TimeSlotSelection {
  dayOfWeek: number;
  slotId: number;
}

export function CreateClassRequestDialog({ open, onOpenChange, editingRequest }: CreateClassRequestDialogProps) {
  const [step, setStep] = useState(1);
  
  // Form data - initialize with editingRequest if available
  const [subjectId, setSubjectId] = useState<string>(editingRequest?.subjectId?.toString() || '');
  const [gradeId, setGradeId] = useState<string>(editingRequest?.gradeId?.toString() || '');
  const [description, setDescription] = useState(editingRequest?.description || '');
  const [teachingMode, setTeachingMode] = useState<string>(editingRequest?.teachingMode?.toString() || '1'); // 0=Tại nhà, 1=Trực tuyến
  const [sessionPerWeek, setSessionPerWeek] = useState<string>(editingRequest?.sessionPerWeek?.toString() || '2');
  const [totalSessions, setTotalSessions] = useState<string>(editingRequest?.totalSessions?.toString() || '12');
  const [minPrice, setMinPrice] = useState<string>(editingRequest?.minPrice?.toString() || '150000');
  const [maxPrice, setMaxPrice] = useState<string>(editingRequest?.maxPrice?.toString() || '200000');
  const [location, setLocation] = useState(editingRequest?.location || '');
  const [selectedSlots, setSelectedSlots] = useState<TimeSlotSelection[]>([]);

  // Reset form when editingRequest changes
  React.useEffect(() => {
    if (editingRequest) {
      setSubjectId(editingRequest.subjectId?.toString() || '');
      setGradeId(editingRequest.gradeId?.toString() || '');
      setDescription(editingRequest.description || '');
      setTeachingMode(editingRequest.teachingMode?.toString() || '1');
      setSessionPerWeek(editingRequest.sessionPerWeek?.toString() || '2');
      setTotalSessions(editingRequest.totalSessions?.toString() || '12');
      setMinPrice(editingRequest.minPrice?.toString() || '150000');
      setMaxPrice(editingRequest.maxPrice?.toString() || '200000');
      setLocation(editingRequest.location || '');
    } else {
      // Reset to defaults when creating new
      setSubjectId('');
      setGradeId('');
      setDescription('');
      setTeachingMode('1');
      setSessionPerWeek('2');
      setTotalSessions('12');
      setMinPrice('150000');
      setMaxPrice('200000');
      setLocation('');
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

  const handleSubmit = () => {
    // Handle form submission
    const action = editingRequest ? 'Cập nhật' : 'Tạo mới';
    console.log(`${action} yêu cầu:`, {
      id: editingRequest?.id,
      subjectId,
      gradeId,
      description,
      teachingMode,
      sessionPerWeek,
      totalSessions,
      minPrice,
      maxPrice,
      location,
      selectedSlots
    });
    
    // Show success message
    if (editingRequest) {
      toast.success('Cập nhật yêu cầu mở lớp thành công!');
    } else {
      toast.success('Tạo yêu cầu mở lớp thành công!');
    }
    
    // Reset and close
    setStep(1);
    onOpenChange(false);
  };

  const canProceedStep1 = subjectId && gradeId && description.length >= 50;
  const canProceedStep2 = teachingMode && minPrice && maxPrice && parseInt(maxPrice) >= parseInt(minPrice);
  const canSubmit = selectedSlots.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[80vw] max-h-[90vh] overflow-y-auto">
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
              <Label htmlFor="description">Mô tả chi tiết yêu cầu *</Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về nhu cầu học tập, những khó khăn hiện tại, mục tiêu mong muốn... (Tối thiểu 50 ký tự)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 min-h-[150px]"
              />
              <p className="text-sm text-gray-500 mt-1">
                {description.length}/50 ký tự tối thiểu
              </p>
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
                <Label htmlFor="totalSessions">Tổng số buổi</Label>
                <Input
                  id="totalSessions"
                  type="number"
                  min="1"
                  value={totalSessions}
                  onChange={(e) => setTotalSessions(e.target.value)}
                  className="mt-2"
                />
              </div>
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
                disabled={!canSubmit}
                className="bg-[#257180] hover:bg-[#1f5a66]"
              >
                {editingRequest ? 'Cập nhật yêu cầu' : 'Tạo yêu cầu'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

