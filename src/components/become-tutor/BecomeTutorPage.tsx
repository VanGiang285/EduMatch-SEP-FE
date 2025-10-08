"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/layout/card";
import { Button } from "../ui/basic/button";
import { Input } from "../ui/form/input";
import { Label } from "../ui/form/label";
import { Textarea } from "../ui/form/textarea";
import { Badge } from "../ui/basic/badge";
import { Progress } from "../ui/feedback/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/form/select";
import { SelectWithSearch, SelectWithSearchItem } from "../ui/form/select-with-search";
import { Checkbox } from "../ui/form/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/form/radio-group";
import { 
  Upload, 
  FileText, 
  DollarSign, 
  Users, 
  BookOpen, 
  Star, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Globe, 
  Video, 
  Clock, 
  Award,
  Camera,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  Play,
  Youtube,
  Plus,
  Trash2,
  X,
  GraduationCap
} from "lucide-react";
import { vietnamProvinces, getDistrictsByProvince } from "@/data/vietnam-locations";

export function BecomeTutorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Giới thiệu
    introduction: {
      firstName: '',
      lastName: '',
      email: '',
      province: '',
      district: '',
      subjects: [] as string[],
      birthDate: '',
      phone: ''
    },
    // Step 2: Ảnh
    photo: {
      profileImage: null as File | null,
      hasImage: false
    },
    // Step 3: Chứng nhận
    certifications: {
      hasCertification: null as boolean | null,
      items: [] as Array<{
        id: string;
        subject: string;
        certificationName: string;
        certificationFile: null | File;
      }>
    },
    // Step 4: Giáo dục
    education: {
      hasEducation: null as boolean | null,
      items: [] as Array<{
        id: string;
        university: string;
        degree: string;
        duration: string;
        degreeFile: null | File;
      }>
    },
    // Step 5: Mô tả
    description: {
      introduction: '',
      teachingExperience: '',
      attractiveTitle: ''
    },
    // Step 6: Video
    video: {
      videoFile: null as File | null,
      youtubeLink: '',
      hasVideo: false
    },
    // Step 7: Thời gian khả dụng
    availability: {
      schedule: {} as Record<string, string[]>
    },
    // Step 8: Giá cả
    pricing: {
      hourlyRate: '',
      description: ''
    }
  });

  // Current certification being added
  const [currentCertification, setCurrentCertification] = useState({
    subject: '',
    certificationName: '',
    certificationFile: null as null | File
  });

  // Current education being added
  const [currentEducation, setCurrentEducation] = useState({
    university: '',
    degree: '',
    duration: '',
    degreeFile: null as null | File
  });

  const steps = [
    { id: 1, title: 'Giới thiệu', description: 'Thông tin cá nhân' },
    { id: 2, title: 'Ảnh', description: 'Ảnh đại diện' },
    { id: 3, title: 'Chứng nhận', description: 'Chứng chỉ môn học' },
    { id: 4, title: 'Giáo dục', description: 'Bằng cấp học vấn' },
    { id: 5, title: 'Mô tả', description: 'Giới thiệu bản thân' },
    { id: 6, title: 'Video', description: 'Video giới thiệu' },
    { id: 7, title: 'Thời gian', description: 'Lịch khả dụng' },
    { id: 8, title: 'Giá cả', description: 'Mức học phí' }
  ];

  const subjects = [
    'Toán học', 'Vật lý', 'Hóa học', 'Sinh học', 'Tiếng Anh', 'Tiếng Pháp',
    'Văn học', 'Lịch sử', 'Địa lý', 'Tin học', 'Lập trình', 'Kinh tế',
    'Toán cao cấp', 'Vật lý đại cương', 'Hóa học hữu cơ', 'Sinh học phân tử',
    'Tiếng Anh giao tiếp', 'Tiếng Anh thương mại', 'Tiếng Anh học thuật',
    'Văn học Việt Nam', 'Văn học thế giới', 'Lịch sử Việt Nam', 'Lịch sử thế giới',
    'Địa lý tự nhiên', 'Địa lý kinh tế', 'Tin học văn phòng', 'Lập trình Python',
    'Lập trình Java', 'Lập trình C++', 'Kinh tế vi mô', 'Kinh tế vĩ mô',
    'Triết học', 'Tâm lý học', 'Xã hội học', 'Chính trị học', 'Luật học',
    'Y học', 'Dược học', 'Kiến trúc', 'Xây dựng', 'Cơ khí', 'Điện tử',
    'Marketing', 'Quản trị kinh doanh', 'Kế toán', 'Tài chính', 'Ngân hàng'
  ];

  // Get available districts based on selected province
  const availableDistricts = formData.introduction.province 
    ? getDistrictsByProvince(formData.introduction.province)
    : [];

  const certificationTypes = [
    'TOEFL', 'IELTS', 'TOEIC', 'Chứng chỉ Tin học', 'Bằng cử nhân', 'Bằng thạc sĩ',
    'Chứng chỉ giảng dạy', 'Chứng chỉ khác', 'TOEFL iBT', 'TOEFL PBT', 'IELTS Academic',
    'IELTS General', 'TOEIC Listening & Reading', 'TOEIC Speaking & Writing',
    'Chứng chỉ Tin học văn phòng', 'Chứng chỉ Tin học quốc tế', 'Bằng cử nhân Khoa học',
    'Bằng cử nhân Nghệ thuật', 'Bằng thạc sĩ Khoa học', 'Bằng thạc sĩ Nghệ thuật',
    'Bằng tiến sĩ', 'Chứng chỉ giảng dạy tiếng Anh', 'Chứng chỉ giảng dạy Toán',
    'Chứng chỉ giảng dạy Vật lý', 'Chứng chỉ giảng dạy Hóa học', 'Chứng chỉ giảng dạy Sinh học',
    'Chứng chỉ Microsoft Office', 'Chứng chỉ Adobe', 'Chứng chỉ Google',
    'Chứng chỉ AWS', 'Chứng chỉ Cisco', 'Chứng chỉ CompTIA', 'Chứng chỉ PMP',
    'Chứng chỉ CFA', 'Chứng chỉ CPA', 'Chứng chỉ ACCA', 'Chứng chỉ FRM'
  ];

  const degrees = [
    'Cử nhân', 'Kỹ sư', 'Thạc sĩ', 'Tiến sĩ', 'Cao đẳng', 'Trung cấp',
    'Cử nhân Khoa học', 'Cử nhân Nghệ thuật', 'Cử nhân Kinh tế', 'Cử nhân Luật',
    'Kỹ sư Công nghệ thông tin', 'Kỹ sư Xây dựng', 'Kỹ sư Cơ khí', 'Kỹ sư Điện tử',
    'Thạc sĩ Khoa học', 'Thạc sĩ Nghệ thuật', 'Thạc sĩ Kinh tế', 'Thạc sĩ Luật',
    'Thạc sĩ Quản trị kinh doanh', 'Thạc sĩ Công nghệ thông tin', 'Thạc sĩ Xây dựng',
    'Tiến sĩ Khoa học', 'Tiến sĩ Nghệ thuật', 'Tiến sĩ Kinh tế', 'Tiến sĩ Luật',
    'Cao đẳng Kỹ thuật', 'Cao đẳng Nghề', 'Cao đẳng Sư phạm', 'Cao đẳng Y tế',
    'Trung cấp Kỹ thuật', 'Trung cấp Nghề', 'Trung cấp Sư phạm', 'Trung cấp Y tế'
  ];

  const timeSlots = [
    '6:00-7:00', '7:00-8:00', '8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00',
    '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
    '18:00-19:00', '19:00-20:00', '20:00-21:00', '21:00-22:00'
  ];

  const weekDays = [
    { key: 'monday', label: 'Thứ 2' },
    { key: 'tuesday', label: 'Thứ 3' },
    { key: 'wednesday', label: 'Thứ 4' },
    { key: 'thursday', label: 'Thứ 5' },
    { key: 'friday', label: 'Thứ 6' },
    { key: 'saturday', label: 'Thứ 7' },
    { key: 'sunday', label: 'Chủ nhật' }
  ];

  const handleNext = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Tutor application submitted:', formData);
    alert('Đăng ký thành công! Chúng tôi sẽ xem xét hồ sơ của bạn trong vòng 24-48 giờ.');
  };

  const updateFormData = (step: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: { ...prev[step as keyof typeof prev], ...data }
    }));
  };

  // Add certification
  const addCertification = () => {
    if (!currentCertification.subject || !currentCertification.certificationName) {
      alert('Vui lòng điền đầy đủ thông tin môn học và tên chứng nhận');
      return;
    }

    const newCert = {
      id: Date.now().toString(),
      ...currentCertification
    };

    setFormData(prev => ({
      ...prev,
      certifications: {
        ...prev.certifications,
        items: [...prev.certifications.items, newCert]
      }
    }));

    // Reset form
    setCurrentCertification({
      subject: '',
      certificationName: '',
      certificationFile: null
    });
  };

  // Remove certification
  const removeCertification = (id: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: {
        ...prev.certifications,
        items: prev.certifications.items.filter(item => item.id !== id)
      }
    }));
  };

  // Add education
  const addEducation = () => {
    if (!currentEducation.university || !currentEducation.degree || !currentEducation.duration) {
      alert('Vui lòng điền đầy đủ thông tin trường, bằng cấp và thời hạn');
      return;
    }

    const newEdu = {
      id: Date.now().toString(),
      ...currentEducation
    };

    setFormData(prev => ({
      ...prev,
      education: {
        ...prev.education,
        items: [...prev.education.items, newEdu]
      }
    }));

    // Reset form
    setCurrentEducation({
      university: '',
      degree: '',
      duration: '',
      degreeFile: null
    });
  };

  // Remove education
  const removeEducation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      education: {
        ...prev.education,
        items: prev.education.items.filter(item => item.id !== id)
      }
    }));
  };

  // Handle subject selection
  const handleSubjectChange = (subject: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      introduction: {
        ...prev.introduction,
        subjects: checked 
          ? [...prev.introduction.subjects, subject]
          : prev.introduction.subjects.filter(s => s !== subject)
      }
    }));
  };

  // Handle province change
  const handleProvinceChange = (provinceCode: string) => {
    setFormData(prev => ({
      ...prev,
      introduction: {
        ...prev.introduction,
        province: provinceCode,
        district: '' // Reset district when province changes
      }
    }));
  };

  return (
    <div className="min-h-screen bg-[#F2E5BF] pt-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#257180] mb-2">Trở thành Gia sư EduMatch</h1>
            <p className="text-gray-600">Chia sẻ kiến thức và kiếm thu nhập từ đam mê của bạn</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar - Progress */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white border border-[#257180]/20">
              <CardHeader>
                <CardTitle className="text-lg text-[#257180]">Tiến trình đăng ký</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={(currentStep / 8) * 100} className="w-full" />
                <p className="text-sm text-gray-600">Bước {currentStep} / 8</p>
                
                <div className="space-y-2">
                  {steps.map((step) => (
                    <div key={step.id} className={`flex items-center gap-3 text-sm ${ 
                      step.id === currentStep ? 'text-[#FD8B51]' : 
                      step.id < currentStep ? 'text-[#257180]' : 'text-gray-400'
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        step.id === currentStep ? 'bg-[#FD8B51] text-white' : 
                        step.id < currentStep ? 'bg-[#257180] text-white' : 'bg-gray-100'
                      }`}>
                        {step.id < currentStep ? <Check className="w-3 h-3" /> : step.id}
                      </div>
                      <div>
                        <div className="font-medium">{step.title}</div>
                        <div className="text-xs text-gray-500">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg bg-white border border-[#257180]/20">
              <CardContent className="p-8">
                
                {/* Step 1: Giới thiệu */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#257180] mb-2">Giới thiệu</h2>
                      <p className="text-gray-600">Vui lòng cung cấp thông tin cá nhân của bạn</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-[#257180]">Tên <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="firstName"
                            placeholder="Nhập tên của bạn"
                            className="pl-10 border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                            value={formData.introduction.firstName}
                            onChange={(e) => updateFormData('introduction', { firstName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-[#257180]">Họ và tên đệm <span className="text-red-500">*</span></Label>
                        <Input
                          id="lastName"
                          placeholder="Nhập họ và tên đệm"
                          className="border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                          value={formData.introduction.lastName}
                          onChange={(e) => updateFormData('introduction', { lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[#257180]">Email <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="email@example.com"
                          className="pl-10 border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                          value={formData.introduction.email}
                          onChange={(e) => updateFormData('introduction', { email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="province" className="text-[#257180]">Tỉnh/Thành phố <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                          <SelectWithSearch
                            value={formData.introduction.province}
                            onValueChange={handleProvinceChange}
                            placeholder="Chọn tỉnh/thành phố"
                            className="pl-10 border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                          >
                            {vietnamProvinces.map((province) => (
                              <SelectWithSearchItem 
                                key={province.code} 
                                value={province.code}
                                onClick={() => handleProvinceChange(province.code)}
                              >
                                {province.name}
                              </SelectWithSearchItem>
                            ))}
                          </SelectWithSearch>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="district" className="text-[#257180]">Quận/Huyện <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                          <SelectWithSearch
                            value={formData.introduction.district}
                            onValueChange={(value) => updateFormData('introduction', { district: value })}
                            placeholder={formData.introduction.province ? "Chọn quận/huyện" : "Chọn tỉnh trước"}
                            disabled={!formData.introduction.province}
                            className="pl-10 border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51] disabled:opacity-50"
                          >
                            {availableDistricts.map((district) => (
                              <SelectWithSearchItem 
                                key={district.code} 
                                value={district.code}
                                onClick={() => updateFormData('introduction', { district: district.code })}
                              >
                                {district.name}
                              </SelectWithSearchItem>
                            ))}
                          </SelectWithSearch>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#257180]">Môn học <span className="text-red-500">*</span></Label>
                      <p className="text-sm text-gray-600">Chọn các môn học bạn có thể dạy</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {subjects.map((subject) => (
                          <div key={subject} className="flex items-center space-x-2">
                            <Checkbox 
                              id={subject} 
                              checked={formData.introduction.subjects.includes(subject)}
                              onCheckedChange={(checked) => handleSubjectChange(subject, checked as boolean)}
                            />
                            <Label htmlFor={subject} className="text-sm">{subject}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="birthDate" className="text-[#257180]">Ngày sinh <span className="text-red-500">*</span></Label>
                        <Input
                          id="birthDate"
                          type="date"
                          className="border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                          value={formData.introduction.birthDate}
                          onChange={(e) => updateFormData('introduction', { birthDate: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-[#257180]">Số điện thoại (Tùy chọn)</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            placeholder="0123 456 789"
                            className="pl-10 border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                            value={formData.introduction.phone}
                            onChange={(e) => updateFormData('introduction', { phone: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Ảnh */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#257180] mb-2">Ảnh đại diện</h2>
                      <p className="text-gray-600">Tải lên ảnh đại diện chuyên nghiệp để thu hút học viên</p>
                    </div>

                    <div className="flex flex-col items-center space-y-6">
                      <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center border-4 border-dashed border-gray-300">
                        {formData.photo.hasImage ? (
                          <div className="w-36 h-36 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="w-16 h-16 text-gray-600" />
                          </div>
                        ) : (
                          <Camera className="w-16 h-16 text-gray-400" />
                        )}
                      </div>

                      <div className="text-center">
                        <Button className="mb-4 bg-[#FD8B51] hover:bg-[#CB6040]">
                          <Upload className="w-4 h-4 mr-2" />
                          Tải lên ảnh
                        </Button>
                        <div className="text-sm text-gray-500">
                          <p>Định dạng: JPG, PNG</p>
                          <p>Kích thước tối đa: 5MB</p>
                          <p>Tỷ lệ khuyến nghị: 1:1 (hình vuông)</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F2E5BF] p-4 rounded-lg border border-[#257180]/20">
                      <h4 className="font-medium text-[#257180] mb-2">Mẹo chụp ảnh tốt</h4>
                      <div className="text-sm text-[#257180] space-y-1">
                        <div>• Chụp ở nơi có ánh sáng tự nhiên</div>
                        <div>• Mặc trang phục chuyên nghiệp</div>
                        <div>• Nhìn thẳng vào camera và mỉm cười</div>
                        <div>• Nền đơn giản, không bị phân tâm</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Chứng nhận */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#257180] mb-2">Chứng nhận</h2>
                      <p className="text-gray-600">Thông tin về các chứng chỉ liên quan đến môn học</p>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[#257180]">Bạn có chứng chỉ liên quan đến môn học không?</Label>
                      <RadioGroup 
                        value={formData.certifications.hasCertification?.toString()} 
                        onValueChange={(value) => updateFormData('certifications', { hasCertification: value === 'true' })}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="no-cert" />
                          <Label htmlFor="no-cert">Không có chứng chỉ</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="has-cert" />
                          <Label htmlFor="has-cert">Có chứng chỉ</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.certifications.hasCertification && (
                      <div className="space-y-6">
                        {/* List of added certifications */}
                        {formData.certifications.items.length > 0 && (
                          <div className="space-y-3">
                            <Label className="text-[#257180]">Chứng chỉ đã thêm ({formData.certifications.items.length})</Label>
                            {formData.certifications.items.map((cert) => (
                              <div key={cert.id} className="bg-[#F2E5BF] border border-[#257180]/20 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Award className="w-4 h-4 text-[#257180]" />
                                      <span className="font-medium text-[#257180]">{cert.certificationName}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      <span className="font-medium">Môn học:</span> {cert.subject}
                                    </div>
                                    {cert.certificationFile && (
                                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <FileText className="w-3 h-3" />
                                        File đã tải lên
                                      </div>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCertification(cert.id)}
                                    className="text-gray-600 hover:text-red-600 hover:bg-gray-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add new certification form */}
                        <div className="space-y-4 p-6 border border-[#257180]/20 rounded-lg bg-white">
                          <div className="space-y-2">
                            <Label htmlFor="cert-subject" className="text-[#257180]">Môn học <span className="text-red-500">*</span></Label>
                            <SelectWithSearch
                              value={currentCertification.subject}
                              onValueChange={(value) => setCurrentCertification(prev => ({ ...prev, subject: value }))}
                              placeholder="Chọn môn học"
                              className="border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                            >
                              {subjects.map((subject) => (
                                <SelectWithSearchItem 
                                  key={subject} 
                                  value={subject}
                                  onClick={() => setCurrentCertification(prev => ({ ...prev, subject }))}
                                >
                                  {subject}
                                </SelectWithSearchItem>
                              ))}
                            </SelectWithSearch>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="cert-name" className="text-[#257180]">Tên chứng nhận <span className="text-red-500">*</span></Label>
                            <SelectWithSearch
                              value={currentCertification.certificationName}
                              onValueChange={(value) => setCurrentCertification(prev => ({ ...prev, certificationName: value }))}
                              placeholder="Chọn loại chứng nhận"
                              className="border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                            >
                              {certificationTypes.map((cert) => (
                                <SelectWithSearchItem 
                                  key={cert} 
                                  value={cert}
                                  onClick={() => setCurrentCertification(prev => ({ ...prev, certificationName: cert }))}
                                >
                                  {cert}
                                </SelectWithSearchItem>
                              ))}
                            </SelectWithSearch>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-[#257180]">Tải lên chứng nhận của bạn (Tùy chọn)</Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 cursor-pointer bg-gray-50">
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-600">Tải lên ảnh chứng chỉ</p>
                              <p className="text-xs text-gray-500">JPG, PNG, PDF. Tối đa 10MB</p>
                            </div>
                          </div>

                          <Button 
                            onClick={addCertification}
                            className="bg-[#FD8B51] hover:bg-[#CB6040]"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm chứng chỉ
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Giáo dục */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#257180] mb-2">Giáo dục</h2>
                      <p className="text-gray-600">Thông tin về trình độ học vấn và bằng cấp</p>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[#257180]">Bạn có bằng cấp giáo dục không?</Label>
                      <RadioGroup 
                        value={formData.education.hasEducation?.toString()} 
                        onValueChange={(value) => updateFormData('education', { hasEducation: value === 'true' })}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="no-edu" />
                          <Label htmlFor="no-edu">Không có bằng cấp giáo dục</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="has-edu" />
                          <Label htmlFor="has-edu">Có bằng cấp</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.education.hasEducation && (
                      <div className="space-y-6">
                        {/* List of added education */}
                        {formData.education.items.length > 0 && (
                          <div className="space-y-3">
                            <Label className="text-[#257180]">Bằng cấp đã thêm ({formData.education.items.length})</Label>
                            {formData.education.items.map((edu) => (
                              <div key={edu.id} className="bg-[#F2E5BF] border border-[#257180]/20 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <GraduationCap className="w-4 h-4 text-[#257180]" />
                                      <span className="font-medium text-[#257180]">{edu.degree}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <div>
                                        <span className="font-medium">Trường:</span> {edu.university}
                                      </div>
                                      <div>
                                        <span className="font-medium">Thời gian:</span> {edu.duration}
                                      </div>
                                    </div>
                                    {edu.degreeFile && (
                                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <FileText className="w-3 h-3" />
                                        File đã tải lên
                                      </div>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeEducation(edu.id)}
                                    className="text-gray-600 hover:text-red-600 hover:bg-gray-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add new education form */}
                        <div className="space-y-4 p-6 border border-[#257180]/20 rounded-lg bg-white">
                          <div className="space-y-2">
                            <Label htmlFor="university" className="text-[#257180]">Trường đại học <span className="text-red-500">*</span></Label>
                            <Input
                              id="university"
                              placeholder="Tên trường đại học"
                              className="border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                              value={currentEducation.university}
                              onChange={(e) => setCurrentEducation(prev => ({ ...prev, university: e.target.value }))}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="degree" className="text-[#257180]">Bằng cấp <span className="text-red-500">*</span></Label>
                              <SelectWithSearch
                                value={currentEducation.degree}
                                onValueChange={(value) => setCurrentEducation(prev => ({ ...prev, degree: value }))}
                                placeholder="Chọn bằng cấp"
                                className="border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                              >
                                {degrees.map((degree) => (
                                  <SelectWithSearchItem 
                                    key={degree} 
                                    value={degree}
                                    onClick={() => setCurrentEducation(prev => ({ ...prev, degree }))}
                                  >
                                    {degree}
                                  </SelectWithSearchItem>
                                ))}
                              </SelectWithSearch>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="duration" className="text-[#257180]">Thời hạn (năm) <span className="text-red-500">*</span></Label>
                              <Input
                                id="duration"
                                placeholder="2018-2022"
                                className="border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                                value={currentEducation.duration}
                                onChange={(e) => setCurrentEducation(prev => ({ ...prev, duration: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-[#257180]">Tải lên bằng cấp của bạn (Tùy chọn)</Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 cursor-pointer bg-gray-50">
                              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-600">Tải lên ảnh bằng cấp</p>
                              <p className="text-xs text-gray-500">JPG, PNG, PDF. Tối đa 10MB</p>
                            </div>
                          </div>

                          <Button 
                            onClick={addEducation}
                            className="bg-[#FD8B51] hover:bg-[#CB6040]"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm bằng cấp
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Mô tả */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#257180] mb-2">Mô tả</h2>
                      <p className="text-gray-600">Giới thiệu bản thân và kinh nghiệm giảng dạy</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="attractive-title" className="text-[#257180]">Viết 1 tiêu đề hấp dẫn</Label>
                      <Input
                        id="attractive-title"
                        placeholder="VD: Gia sư Toán 10 năm kinh nghiệm, giúp học sinh cải thiện điểm số nhanh chóng"
                        className="border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                        value={formData.description.attractiveTitle}
                        onChange={(e) => updateFormData('description', { attractiveTitle: e.target.value })}
                      />
                      <p className="text-xs text-gray-500">Tiêu đề sẽ hiển thị đầu tiên trong hồ sơ gia sư</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="introduction" className="text-[#257180]">Giới thiệu bản thân</Label>
                      <Textarea
                        id="introduction"
                        placeholder="Hãy viết một đoạn giới thiệu về bản thân, sở thích, tính cách và động lực dạy học..."
                        className="min-h-32 border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                        value={formData.description.introduction}
                        onChange={(e) => updateFormData('description', { introduction: e.target.value })}
                      />
                      <p className="text-xs text-gray-500">Tối thiểu 100 ký tự</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teaching-experience" className="text-[#257180]">Kinh nghiệm giảng dạy</Label>
                      <Textarea
                        id="teaching-experience"
                        placeholder="Mô tả kinh nghiệm giảng dạy, phương pháp dạy học, các thành tích đã đạt được..."
                        className="min-h-32 border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                        value={formData.description.teachingExperience}
                        onChange={(e) => updateFormData('description', { teachingExperience: e.target.value })}
                      />
                      <p className="text-xs text-gray-500">Chia sẻ phương pháp và kinh nghiệm giảng dạy</p>
                    </div>

                    <div className="bg-[#F2E5BF] p-4 rounded-lg border border-[#257180]/20">
                      <h4 className="font-medium text-[#257180] mb-2">Mẹo viết mô tả tốt</h4>
                      <div className="text-sm text-[#257180] space-y-1">
                        <div>• Thể hiện đam mê và nhiệt huyết với giảng dạy</div>
                        <div>• Nêu rõ phương pháp dạy học độc đáo</div>
                        <div>• Đề cập đến thành tích học tập hoặc giảng dạy</div>
                        <div>• Sử dụng ngôn ngữ tích cực và chuyên nghiệp</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 6: Video */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#257180] mb-2">Video giới thiệu</h2>
                      <p className="text-gray-600">Tạo video giới thiệu để thu hút học viên</p>
                    </div>

                    <div className="space-y-6">
                      {/* Video Preview */}
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        {formData.video.hasVideo ? (
                          <div className="text-center">
                            <Play className="w-16 h-16 text-gray-600 mx-auto mb-2" />
                            <p className="text-gray-600">Video preview</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Video className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">Chưa có video</p>
                          </div>
                        )}
                      </div>

                      {/* Upload Video */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[#257180]">Tải lên video từ máy tính</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#FD8B51] cursor-pointer">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">Tải lên video giới thiệu</p>
                            <p className="text-xs text-gray-500">MP4, MOV, AVI. Tối đa 100MB, dài không quá 5 phút</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-px bg-gray-200"></div>
                          <span className="text-gray-500 text-sm">HOẶC</span>
                          <div className="flex-1 h-px bg-gray-200"></div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="youtube-link" className="text-[#257180]">Đường dẫn YouTube</Label>
                          <div className="relative">
                            <Youtube className="absolute left-3 top-3 h-4 w-4 text-red-500" />
                            <Input
                              id="youtube-link"
                              placeholder="https://youtube.com/watch?v=..."
                              className="pl-10 border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                              value={formData.video.youtubeLink}
                              onChange={(e) => updateFormData('video', { youtubeLink: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F2E5BF] p-4 rounded-lg border border-[#257180]/20">
                      <h4 className="font-medium text-[#257180] mb-2">Gợi ý quay video</h4>
                      <div className="text-sm text-[#257180] space-y-1">
                        <div>• Giới thiệu tên, kinh nghiệm và môn dạy</div>
                        <div>• Nói về phương pháp giảng dạy của bạn</div>
                        <div>• Thể hiện sự nhiệt tình và chuyên nghiệp</div>
                        <div>• Quay ở nơi yên tĩnh, ánh sáng tốt</div>
                        <div>• Thời lượng từ 1-3 phút</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 7: Thời gian khả dụng */}
                {currentStep === 7 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#257180] mb-2">Thời gian khả dụng</h2>
                      <p className="text-gray-600">Thiết lập lịch dạy trong tuần</p>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[#257180]">Chọn thời gian bạn có thể dạy (chọn tối thiểu 5 khung giờ)</Label>
                      
                      <div className="overflow-x-auto">
                        <div className="min-w-full">
                          {/* Header */}
                          <div className="grid grid-cols-8 gap-2 mb-2">
                            <div className="p-2"></div>
                            {weekDays.map((day) => (
                              <div key={day.key} className="p-2 text-center font-medium text-[#257180] bg-[#F2E5BF] rounded border border-[#257180]/20">
                                {day.label}
                              </div>
                            ))}
                          </div>

                          {/* Time Slots */}
                          {timeSlots.map((timeSlot) => (
                            <div key={timeSlot} className="grid grid-cols-8 gap-2 mb-1">
                              <div className="p-2 text-sm font-medium text-gray-600 flex items-center">
                                {timeSlot}
                              </div>
                              {weekDays.map((day) => (
                                <div key={`${day.key}-${timeSlot}`} className="p-1">
                                  <Checkbox 
                                    id={`${day.key}-${timeSlot}`} 
                                    className="w-full h-8 data-[state=checked]:bg-[#FD8B51]"
                                  />
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F2E5BF] p-4 rounded-lg border border-[#257180]/20">
                      <h4 className="font-medium text-[#257180] mb-2">Lưu ý về lịch dạy</h4>
                      <div className="text-sm text-[#257180] space-y-1">
                        <div>• Chọn những khung giờ bạn thực sự có thể dạy</div>
                        <div>• Lịch này sẽ hiển thị cho học viên khi đặt lịch</div>
                        <div>• Bạn có thể thay đổi lịch sau trong phần quản lý hồ sơ</div>
                        <div>• Nên chọn ít nhất 10-15 khung giờ để tăng cơ hội được chọn</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 8: Giá cả */}
                {currentStep === 8 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#257180] mb-2">Giá cả</h2>
                      <p className="text-gray-600">Thiết lập mức học phí cho mỗi buổi học</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="hourly-rate" className="text-[#257180]">Giá cho mỗi 1 tiếng/1 slot học (VND)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="hourly-rate"
                            type="number"
                            min="0"
                            placeholder="200000"
                            className="pl-10 text-lg border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                            value={formData.pricing.hourlyRate}
                            onChange={(e) => updateFormData('pricing', { hourlyRate: e.target.value })}
                          />
                        </div>
                        <p className="text-sm text-gray-500">
                          Giá trung bình: 150,000 - 300,000 VND/giờ
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price-description" className="text-[#257180]">Mô tả về giá (tùy chọn)</Label>
                        <Textarea
                          id="price-description"
                          placeholder="VD: Bao gồm tài liệu học tập, bài tập về nhà, và hỗ trợ sau buổi học..."
                          className="min-h-24 border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                          value={formData.pricing.description}
                          onChange={(e) => updateFormData('pricing', { description: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-[#F2E5BF] p-4 rounded-lg text-center border border-[#257180]/20">
                        <div className="text-2xl font-bold text-[#257180]">150K-200K</div>
                        <div className="text-sm text-[#257180]">Gia sư mới</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center border-2 border-[#FD8B51]">
                        <div className="text-2xl font-bold text-[#FD8B51]">200K-350K</div>
                        <div className="text-sm text-[#FD8B51]">Có kinh nghiệm</div>
                      </div>
                      <div className="bg-[#F2E5BF] p-4 rounded-lg text-center border border-[#CB6040]/30">
                        <div className="text-2xl font-bold text-[#CB6040]">350K-500K</div>
                        <div className="text-sm text-[#CB6040]">Chuyên gia</div>
                      </div>
                    </div>

                    <div className="bg-[#F2E5BF] p-4 rounded-lg border border-[#257180]/20">
                      <h4 className="font-medium text-[#257180] mb-2">Lưu ý về giá cả</h4>
                      <div className="text-sm text-[#257180] space-y-1">
                        <div>• Giá hợp lý sẽ thu hút nhiều học viên hơn</div>
                        <div>• Bạn có thể điều chỉnh giá sau khi có đánh giá tốt</div>
                        <div>• EduMatch sẽ trích 15% phí dịch vụ từ mỗi buổi học</div>
                        <div>• Học viên có thể đặt buổi học thử với giá ưu đãi</div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-white p-6 rounded-lg border border-[#257180]/20">
                      <h4 className="font-medium text-[#257180] mb-4">Tóm tắt đăng ký</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Họ tên:</span>
                          <span className="font-medium">{formData.introduction.lastName} {formData.introduction.firstName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Email:</span>
                          <span className="font-medium">{formData.introduction.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vị trí:</span>
                          <span className="font-medium">
                            {formData.introduction.province && formData.introduction.district 
                              ? `${vietnamProvinces.find(p => p.code === formData.introduction.province)?.name}, ${availableDistricts.find(d => d.code === formData.introduction.district)?.name}`
                              : 'Chưa chọn'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Học phí:</span>
                          <span className="font-medium">{formData.pricing.hourlyRate ? `${Number(formData.pricing.hourlyRate).toLocaleString('vi-VN')} VND/giờ` : 'Chưa thiết lập'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-8 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="border-[#257180]/30 text-[#257180] hover:bg-[#F2E5BF]"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Quay lại
                  </Button>
                  
                  {currentStep < 8 ? (
                    <Button 
                      onClick={handleNext}
                      className="bg-[#FD8B51] hover:bg-[#CB6040]"
                    >
                      Tiếp theo
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit} 
                      className="bg-[#257180] hover:bg-[#1e5a66]"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Gửi đơn đăng ký
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
