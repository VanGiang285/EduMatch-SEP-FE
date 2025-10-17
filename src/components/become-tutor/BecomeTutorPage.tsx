"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/layout/card";
import { Button } from "../ui/basic/button";
import { Input } from "../ui/form/input";
import { Label } from "../ui/form/label";
import { Textarea } from "../ui/form/textarea";
import { Progress } from "../ui/feedback/progress";
import { SelectWithSearch, SelectWithSearchItem } from "../ui/form/select-with-search";
import { Checkbox } from "../ui/form/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/form/radio-group";
import { 
  Upload, 
  FileText, 
  Banknote, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Video, 
  Award,
  Camera,
  MapPin,
  User,
  Mail,
  Phone,
  Play,
  Plus,
  Trash2,
  GraduationCap,
  AlertCircle,
  Loader2
} from "lucide-react";
import { vietnamProvinces, getDistrictsByProvince } from "@/data/vietnam-locations";
import { FormatService } from "@/lib/format";
import { useBecomeTutor } from "@/hooks/useBecomeTutor";
import { useAuth } from "@/contexts/AuthContext";
import { useBecomeTutorMasterData } from "@/hooks/useBecomeTutorMasterData";
export function BecomeTutorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { user, isAuthenticated } = useAuth();
  const { isSubmitting, error, submitApplication, clearError } = useBecomeTutor();
  const { subjects, levels, educationInstitutions, error: masterDataError, loadMasterData } = useBecomeTutorMasterData();
  
  const fallbackSubjects = [
    { id: 1, subjectName: 'Toán học' },
    { id: 2, subjectName: 'Vật lý' },
    { id: 3, subjectName: 'Hóa học' },
    { id: 4, subjectName: 'Sinh học' },
    { id: 5, subjectName: 'Ngữ văn' },
    { id: 6, subjectName: 'Lịch sử' },
    { id: 7, subjectName: 'Địa lý' },
    { id: 8, subjectName: 'Tiếng Anh' },
    { id: 9, subjectName: 'Tiếng Trung' },
    { id: 10, subjectName: 'Tin học' }
  ];

  const displaySubjects = subjects.length > 0 ? subjects : fallbackSubjects;
  
  useEffect(() => {
    if (user && isAuthenticated) {
      setFormData(prev => ({
        ...prev,
        introduction: {
          ...prev.introduction,
          fullName: user.name || '',
          email: user.email || '',
          phone: ''
        }
      }));
    }
  }, [user, isAuthenticated]);

  const [formData, setFormData] = useState({
    introduction: {
      fullName: '',
      email: '',
      province: '',
      district: '',
      subjects: [] as Array<{
        subjectId: number;
        levels: number[];
      }>,
      birthDate: '',
      phone: '',
      teachingMode: 2 as number
    },
    photo: {
      profileImage: null as File | null,
      hasImage: false
    },
    certifications: {
      hasCertification: null as boolean | null,
      items: [] as Array<{
        id: string;
        subjectId: number;
        certificateTypeId: number;
        issueDate: string;
        expiryDate: string;
        certificateFile: null | File;
      }>
    },
    education: {
      hasEducation: null as boolean | null,
      items: [] as Array<{
        id: string;
        institutionId: number;
        issueDate: string;
        degreeFile: null | File;
      }>
    },
    description: {
      introduction: '',
      teachingExperience: '',
      attractiveTitle: ''
    },
    video: {
      videoFile: null as File | null,
      youtubeLink: '',
      hasVideo: false
    },
    availability: {
      schedule: {} as Record<string, string[]>
    },
    pricing: {
      subjectPricing: [] as Array<{
        subjectId: number;
        hourlyRate: string;
      }>
    }
  });
  const [currentCertification, setCurrentCertification] = useState({
    subjectId: 0,
    certificateTypeId: 0,
    issueDate: '',
    expiryDate: '',
    certificateFile: null as null | File
  });
  const [currentEducation, setCurrentEducation] = useState({
    institutionId: 0,
    issueDate: '',
    degreeFile: null as null | File
  });
  const [currentSubject, setCurrentSubject] = useState({
    subjectId: 0,
    levels: [] as number[]
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
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      slots.push({ startTime, endTime });
    }
    return slots;
  };

  const timeSlotsGenerated = generateTimeSlots();
  const availableDistricts = formData.introduction.province 
    ? getDistrictsByProvince(formData.introduction.province)
    : [];

  const validatePricingStep = () => {
    return formData.pricing.subjectPricing.length === formData.introduction.subjects.length &&
           formData.pricing.subjectPricing.every(pricing => 
             pricing.hourlyRate.trim() !== '' && 
             !isNaN(Number(pricing.hourlyRate)) && 
             Number(pricing.hourlyRate) > 0
           ) &&
           formData.introduction.subjects.every(subject => subject.levels.length > 0);
  };
  const weekDays = [
    { key: 'monday', label: 'Thứ 2' },
    { key: 'tuesday', label: 'Thứ 3' },
    { key: 'wednesday', label: 'Thứ 4' },
    { key: 'thursday', label: 'Thứ 5' },
    { key: 'friday', label: 'Thứ 6' },
    { key: 'saturday', label: 'Thứ 7' },
    { key: 'sunday', label: 'Chủ nhật' }
  ];
  const validateCurrentStepFields = () => {
    const errors: Record<string, string> = {};
    
    switch (currentStep) {
      case 1:
        if (!formData.introduction.fullName.trim()) {
          errors.fullName = 'Vui lòng nhập tên của bạn';
        }
        if (!formData.introduction.email.trim()) {
          errors.email = 'Vui lòng nhập email';
        }
        if (formData.introduction.subjects.length === 0) {
          errors.subjects = 'Vui lòng chọn ít nhất một môn học';
        } else if (formData.introduction.subjects.some(subject => subject.levels.length === 0)) {
          errors.subjects = 'Vui lòng chọn ít nhất một lớp cho mỗi môn học';
        }
        if (!formData.introduction.birthDate) {
          errors.birthDate = 'Vui lòng chọn ngày sinh';
        }
        break;
      case 2:
        if (!formData.photo.profileImage) {
          errors.profileImage = 'Vui lòng tải lên ảnh đại diện';
        }
        break;
      case 3:
        if (formData.certifications.hasCertification === null) {
          errors.hasCertification = 'Vui lòng chọn có chứng chỉ hay không';
        } else if (formData.certifications.hasCertification === true && formData.certifications.items.length === 0) {
          errors.certifications = 'Vui lòng thêm ít nhất một chứng chỉ';
        }
        break;
      case 4:
        if (formData.education.hasEducation === null) {
          errors.hasEducation = 'Vui lòng chọn có bằng cấp hay không';
        } else if (formData.education.hasEducation === true && formData.education.items.length === 0) {
          errors.education = 'Vui lòng thêm ít nhất một bằng cấp';
        }
        break;
      case 5:
        if (!formData.description.introduction.trim()) {
          errors.introduction = 'Vui lòng nhập giới thiệu bản thân';
        }
        if (!formData.description.teachingExperience.trim()) {
          errors.teachingExperience = 'Vui lòng nhập kinh nghiệm giảng dạy';
        }
        if (!formData.description.attractiveTitle.trim()) {
          errors.attractiveTitle = 'Vui lòng nhập tiêu đề hấp dẫn';
        }
        break;
      case 6:
        if (!formData.video.videoFile && !formData.video.youtubeLink.trim()) {
          errors.video = 'Vui lòng tải lên video file hoặc nhập link YouTube';
        }
        break;
      case 7:
        const totalSlots = Object.values(formData.availability.schedule).reduce((total, slots) => total + slots.length, 0);
        if (totalSlots === 0) {
          errors.schedule = 'Vui lòng chọn ít nhất một khung giờ';
        }
        break;
      case 8:
        if (formData.pricing.subjectPricing.length !== formData.introduction.subjects.length) {
          errors.pricing = 'Vui lòng nhập giá cho tất cả môn học đã chọn';
        } else {
          formData.pricing.subjectPricing.forEach((pricing, index) => {
            if (!pricing.hourlyRate.trim() || isNaN(Number(pricing.hourlyRate)) || Number(pricing.hourlyRate) <= 0) {
              errors[`pricing_${index}`] = 'Vui lòng nhập giá hợp lệ';
            }
          });
        }
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStepFields() && currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleSubmit = async () => {
    if (!validatePricingStep()) {
      alert('Vui lòng điền đầy đủ thông tin giá cả cho tất cả môn học');
      return;
    }

           const applicationData = {
             fullName: formData.introduction.fullName,
             email: formData.introduction.email,
             province: formData.introduction.province,
             district: formData.introduction.district,
             subjects: formData.introduction.subjects.flatMap(subject => 
               subject.levels.map(levelId => ({
                 subjectId: subject.subjectId,
                 levelId: levelId,
                 hourlyRate: formData.pricing.subjectPricing.find(p => p.subjectId === subject.subjectId)?.hourlyRate || '0'
               }))
             ),
             birthDate: formData.introduction.birthDate,
             phone: formData.introduction.phone,
             teachingMode: formData.introduction.teachingMode,
             profileImage: formData.photo.profileImage || undefined,
             certifications: formData.certifications.hasCertification ? formData.certifications.items.map(cert => ({
               subjectId: cert.subjectId,
               certificateTypeId: cert.certificateTypeId,
               issueDate: cert.issueDate,
               expiryDate: cert.expiryDate,
               certificateFile: cert.certificateFile || undefined
             })) : undefined,
             education: formData.education.hasEducation ? formData.education.items.map(edu => ({
               institutionId: edu.institutionId,
               issueDate: edu.issueDate,
               degreeFile: edu.degreeFile || undefined
             })) : undefined,
             introduction: formData.description.introduction,
             teachingExperience: formData.description.teachingExperience,
             attractiveTitle: formData.description.attractiveTitle,
             videoFile: formData.video.videoFile || undefined,
             youtubeLink: formData.video.youtubeLink || undefined,
             schedule: formData.availability.schedule,
             hourlyRate: formData.pricing.subjectPricing[0]?.hourlyRate || '0',
           };

    await submitApplication(applicationData);
  };
  const updateFormData = (step: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: { ...prev[step as keyof typeof prev], ...data }
    }));
    
    const fieldKeys = Object.keys(data);
    const newErrors = { ...fieldErrors };
    fieldKeys.forEach(key => {
      delete newErrors[key];
    });
    setFieldErrors(newErrors);
  };

  const updateSubjectPricing = (subjects: Array<{subjectId: number; levels: number[]}>) => {
    setFormData(prev => {
      const currentPricing = prev.pricing.subjectPricing;
      const newPricing = subjects.map(subject => {
        const existing = currentPricing.find(p => p.subjectId === subject.subjectId);
        return existing || { subjectId: subject.subjectId, hourlyRate: '' };
      });
      return {
        ...prev,
        pricing: {
          ...prev.pricing,
          subjectPricing: newPricing
        }
      };
    });
  };

  const handleProfileImageUpload = async (file: File) => {
    setFormData(prev => ({
      ...prev,
      photo: {
        ...prev.photo,
        profileImage: file,
        hasImage: true
      }
    }));
    return true;
  };

  // Handle file upload for certification
  const handleCertificationFileUpload = async (file: File) => {
    // Skip file upload service - send file directly in become-tutor API
    setCurrentCertification(prev => ({
      ...prev,
      certificateFile: file
    }));
    return true;
  };
  const addCertification = () => {
    if (!currentCertification.subjectId || !currentCertification.certificateTypeId || 
        !currentCertification.issueDate || !currentCertification.expiryDate ||
        !currentCertification.certificateFile) {
      alert('Vui lòng điền đầy đủ thông tin chứng chỉ');
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
    setCurrentCertification({
      subjectId: 0,
      certificateTypeId: 0,
      issueDate: '',
      expiryDate: '',
      certificateFile: null
    });
  };
  const removeCertification = (id: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: {
        ...prev.certifications,
        items: prev.certifications.items.filter(item => item.id !== id)
      }
    }));
  };
  const addEducation = () => {
    if (!currentEducation.institutionId || !currentEducation.issueDate || !currentEducation.degreeFile) {
      alert('Vui lòng điền đầy đủ thông tin giáo dục');
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
    setCurrentEducation({
      institutionId: 0,
      issueDate: '',
      degreeFile: null
    });
  };
  const removeEducation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      education: {
        ...prev.education,
        items: prev.education.items.filter(item => item.id !== id)
      }
    }));
  };
  const handleSubjectChange = (subjectId: number, checked: boolean) => {
    const newSubjects = checked 
      ? [...formData.introduction.subjects, { subjectId, levels: [] }]
      : formData.introduction.subjects.filter(s => s.subjectId !== subjectId);
    
    setFormData(prev => ({
      ...prev,
      introduction: {
        ...prev.introduction,
        subjects: newSubjects
      }
    }));
    
    updateSubjectPricing(newSubjects);
  };


  const addSubject = () => {
    if (!currentSubject.subjectId || currentSubject.levels.length === 0) {
      alert('Vui lòng chọn môn học và ít nhất một lớp');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      introduction: {
        ...prev.introduction,
        subjects: [...prev.introduction.subjects, currentSubject]
      }
    }));
    
    updateSubjectPricing([...formData.introduction.subjects, currentSubject]);
    
    setCurrentSubject({
      subjectId: 0,
      levels: []
    });
  };
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
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={clearError}
                className="mt-2 text-sm text-red-600 underline"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2 leading-tight tracking-tight">TRỞ THÀNH GIA SƯ EDUMATCH</h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">Chia sẻ kiến thức và kiếm thu nhập từ đam mê của bạn</p>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white border border-[#257180]/20">
              <CardHeader>
                <CardTitle className="text-lg text-black font-bold">Tiến trình đăng ký</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={(currentStep / 8) * 100} className="w-full" />
                <p className="text-sm text-gray-600">Bước {currentStep} / 8</p>
                <div className="space-y-2">
                  {steps.map((step) => (
                    <div key={step.id} className={`flex items-center gap-3 text-sm ${ 
                      step.id === currentStep ? 'text-[#FD8B51]' : 
                      step.id < currentStep ? 'text-black' : 'text-gray-400'
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        step.id === currentStep ? 'bg-[#FD8B51] text-white' : 
                        step.id < currentStep ? 'bg-black text-white' : 'bg-gray-100'
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
          <div className="lg:col-span-3">
            <Card className="shadow-lg bg-white border border-[#257180]/20">
              <CardContent className="p-8">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-black mb-2">Giới thiệu</h2>
                      <p className="text-gray-600">Vui lòng cung cấp thông tin cá nhân của bạn</p>
                    </div>
                      <div className="space-y-2">
                               <Label htmlFor="fullName" className="text-black text-sm sm:text-base">Tên của bạn <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                                  id="fullName"
                                  placeholder="Nhập tên đầy đủ của bạn"
                             className={`pl-10 border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51] ${fieldErrors.fullName ? 'border-red-500' : ''}`}
                                  value={formData.introduction.fullName}
                                  onChange={(e) => updateFormData('introduction', { fullName: e.target.value })}
                          />
                        </div>
                       {fieldErrors.fullName && (
                         <p className="text-red-500 text-sm">{fieldErrors.fullName}</p>
                       )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-black text-sm sm:text-base">Email <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="email@example.com"
                            className={`pl-10 border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51] ${fieldErrors.email ? 'border-red-500' : ''}`}
                          value={formData.introduction.email}
                          onChange={(e) => updateFormData('introduction', { email: e.target.value })}
                        />
                      </div>
                        {fieldErrors.email && (
                          <p className="text-red-500 text-sm">{fieldErrors.email}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="province" className="text-black text-sm sm:text-base">Tỉnh/Thành phố <span className="text-red-500">*</span></Label>
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
                        <Label htmlFor="district" className="text-black text-sm sm:text-base">Quận/Huyện <span className="text-red-500">*</span></Label>
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
                    <div className="space-y-4">
                      <Label className="text-black text-sm sm:text-base">Môn học <span className="text-red-500">*</span></Label>
                      <p className="text-sm text-gray-600">Chọn các môn học và lớp bạn có thể dạy</p>
                      
                      {masterDataError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-600 text-sm">
                            Lỗi tải danh sách môn học: {masterDataError}
                          </p>
                          <button 
                            onClick={loadMasterData}
                            className="text-red-600 text-sm underline mt-1"
                          >
                            Thử lại
                          </button>
                        </div>
                      )}

                      {/* Display selected subjects */}
                      {formData.introduction.subjects.length > 0 && (
                        <div className="space-y-3">
                          <Label className="text-black text-sm sm:text-base">Môn học đã chọn ({formData.introduction.subjects.length})</Label>
                          {formData.introduction.subjects.map((subject) => {
                            const subjectData = displaySubjects.find(s => s.id === subject.subjectId);
                            const selectedLevels = subject.levels.map(levelId => 
                              levels.find(l => l.id === levelId)?.name
                            ).filter(Boolean);
                            
                            return (
                              <div key={subject.subjectId} className="bg-[#F2E5BF] border border-[#257180]/20 rounded-lg p-4 shadow-sm">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-8 h-8 bg-[#FD8B51] rounded-full flex items-center justify-center">
                                        <Award className="w-4 h-4 text-white" />
                                      </div>
                                      <span className="font-semibold text-black text-base">{subjectData?.subjectName || 'Unknown'}</span>
                                    </div>
                                    <div className="ml-10">
                                      <div className="text-sm font-medium text-gray-700 mb-2">
                                        <span>Lớp có thể dạy:</span>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {selectedLevels.map((levelName, index) => (
                                          <span 
                                            key={index}
                                            className="px-3 py-1.5 bg-[#FD8B51] text-white text-sm font-semibold rounded-lg shadow-sm border border-[#FD8B51]/20 flex items-center gap-1"
                                          >
                                            <GraduationCap className="w-3 h-3" />
                                            {levelName}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSubjectChange(subject.subjectId, false)}
                                    className="text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full p-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add new subject form */}
                      <div className="space-y-4 p-6 border border-[#257180]/20 rounded-lg bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="new-subject" className="text-black text-sm sm:text-base">Chọn môn học</Label>
                            <SelectWithSearch
                              value={currentSubject.subjectId.toString()}
                              onValueChange={(value) => setCurrentSubject(prev => ({ ...prev, subjectId: parseInt(value), levels: [] }))}
                              placeholder="Chọn môn học"
                              className="border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                            >
                              {displaySubjects
                                .filter(subject => !formData.introduction.subjects.some(s => s.subjectId === subject.id))
                                .map((subject) => (
                                <SelectWithSearchItem 
                                  key={subject.id} 
                                  value={subject.id.toString()}
                                  onClick={() => setCurrentSubject(prev => ({ ...prev, subjectId: subject.id, levels: [] }))}
                                >
                                  {subject.subjectName}
                                </SelectWithSearchItem>
                              ))}
                            </SelectWithSearch>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-level" className="text-black text-sm sm:text-base">Chọn lớp có thể dạy <span className="text-red-500">*</span></Label>
                            
                            <SelectWithSearch
                              value=""
                              onValueChange={(value) => {
                                const levelId = parseInt(value);
                                if (!currentSubject.levels.includes(levelId)) {
                                  setCurrentSubject(prev => ({
                                    ...prev,
                                    levels: [...prev.levels, levelId]
                                  }));
                                }
                              }}
                              placeholder={levels && levels.length > 0 ? "Chọn lớp để thêm" : "Đang tải danh sách lớp..."}
                              className="border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                            >
                              {levels && levels.length > 0 ? (
                                levels
                                  .filter(level => !currentSubject.levels.includes(level.id))
                                  .map((level) => (
                                    <SelectWithSearchItem 
                                      key={level.id} 
                                      value={level.id.toString()}
                                    >
                                      {level.name}
                                    </SelectWithSearchItem>
                                  ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-gray-500 cursor-not-allowed">
                                  {levels && levels.length === 0 ? "Không có lớp nào" : "Đang tải danh sách lớp..."}
                                </div>
                              )}
                            </SelectWithSearch>
                            
                            {/* Display selected levels */}
                            {currentSubject.levels.length > 0 && (
                              <div className="space-y-2">
                                <div className="text-sm text-gray-600">
                                  Đã chọn {currentSubject.levels.length} lớp:
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {currentSubject.levels.map((levelId) => {
                                    const level = levels.find(l => l.id === levelId);
                                    return (
                                      <div 
                                        key={levelId}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-[#FD8B51] text-white text-sm font-medium rounded-full shadow-sm"
                                      >
                                        <span className="font-semibold">{level?.name || `Lớp ${levelId}`}</span>
                                        <button
                                          onClick={() => {
                                            setCurrentSubject(prev => ({
                                              ...prev,
                                              levels: prev.levels.filter(l => l !== levelId)
                                            }));
                                          }}
                                          className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                          title="Xóa lớp này"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            
                            {/* Show message when no levels selected */}
                            {currentSubject.subjectId > 0 && currentSubject.levels.length === 0 && (
                              <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  <span>Vui lòng chọn ít nhất một lớp cho môn học này</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button 
                          onClick={addSubject}
                          className="bg-[#FD8B51] hover:bg-[#CB6040]"
                          disabled={!currentSubject.subjectId || currentSubject.levels.length === 0}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Thêm môn học
                        </Button>
                      </div>
                      
                      {fieldErrors.subjects && (
                        <p className="text-red-500 text-sm">{fieldErrors.subjects}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="birthDate" className="text-black text-sm sm:text-base">Ngày sinh <span className="text-red-500">*</span></Label>
                        <Input
                          id="birthDate"
                          type="date"
                          className={`border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51] ${fieldErrors.birthDate ? 'border-red-500' : ''}`}
                          value={formData.introduction.birthDate}
                          onChange={(e) => updateFormData('introduction', { birthDate: e.target.value })}
                          max={new Date().toISOString().split('T')[0]}
                        />
                        {fieldErrors.birthDate && (
                          <p className="text-red-500 text-sm">{fieldErrors.birthDate}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-black text-sm sm:text-base">Số điện thoại (Tùy chọn)</Label>
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
                    <div className="space-y-2">
                      <Label className="text-black text-sm sm:text-base">Phương thức giảng dạy <span className="text-red-500">*</span></Label>
                      <RadioGroup 
                        value={formData.introduction.teachingMode.toString()}
                        onValueChange={(value) => updateFormData('introduction', { teachingMode: parseInt(value) })}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="0" id="offline" />
                          <Label htmlFor="offline">Dạy trực tiếp</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id="online" />
                          <Label htmlFor="online">Dạy online</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2" id="hybrid" />
                          <Label htmlFor="hybrid">Kết hợp (trực tiếp + online)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-black mb-2">Ảnh đại diện</h2>
                      <p className="text-gray-600">Tải lên ảnh đại diện chuyên nghiệp để thu hút học viên</p>
                    </div>
                    <div className="flex flex-col items-center space-y-6">
                      <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center border-4 border-dashed border-gray-300 overflow-hidden">
                        {formData.photo.hasImage && formData.photo.profileImage ? (
                          <Image 
                            src={URL.createObjectURL(formData.photo.profileImage)} 
                            alt="Profile" 
                            width={160}
                            height={160}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <Camera className="w-16 h-16 text-gray-400" />
                        )}
                      </div>
                      <div className="text-center">
                        <input
                          type="file"
                          id="profile-image-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              await handleProfileImageUpload(file);
                            }
                          }}
                        />
                        <Button 
                          className="mb-4 bg-[#FD8B51] hover:bg-[#CB6040]"
                          onClick={() => document.getElementById('profile-image-upload')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {formData.photo.hasImage ? 'Thay đổi ảnh' : 'Tải lên ảnh'}
                        </Button>
                        <div className="text-sm text-gray-500">
                          <p>Định dạng: JPG, PNG</p>
                          <p>Kích thước tối đa: 5MB</p>
                          <p>Tỷ lệ khuyến nghị: 1:1 (hình vuông)</p>
                        </div>
                        {fieldErrors.profileImage && (
                          <p className="text-red-500 text-sm text-center mt-2">{fieldErrors.profileImage}</p>
                        )}
                      </div>
                    </div>
                    <div className="bg-[#F2E5BF] p-4 rounded-lg border border-[#257180]/20">
                      <h4 className="font-medium text-black mb-2">Mẹo chụp ảnh tốt</h4>
                      <div className="text-sm text-black space-y-1">
                        <div>• Chụp ở nơi có ánh sáng tự nhiên</div>
                        <div>• Mặc trang phục chuyên nghiệp</div>
                        <div>• Nhìn thẳng vào camera và mỉm cười</div>
                        <div>• Nền đơn giản, không bị phân tâm</div>
                      </div>
                    </div>
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-black mb-2">Chứng nhận</h2>
                      <p className="text-gray-600">Thông tin về các chứng chỉ liên quan đến môn học</p>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-black text-sm sm:text-base">Bạn có chứng chỉ liên quan đến môn học không? <span className="text-red-500">*</span></Label>
                      <RadioGroup 
                        value={formData.certifications.hasCertification?.toString() || null} 
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
                      {fieldErrors.hasCertification && (
                        <p className="text-red-500 text-sm">{fieldErrors.hasCertification}</p>
                      )}
                    </div>
                    {formData.certifications.hasCertification && (
                      <div className="space-y-6">
                        {formData.certifications.items.length > 0 && (
                          <div className="space-y-3">
                            <Label className="text-black text-sm sm:text-base">Chứng chỉ đã thêm ({formData.certifications.items.length})</Label>
                            {formData.certifications.items.map((cert) => (
                              <div key={cert.id} className="bg-[#F2E5BF] border border-[#257180]/20 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Award className="w-4 h-4 text-black" />
                                      <span className="font-medium text-black">
                                        {(() => {
                                          const subject = subjects.find(s => s.id === cert.subjectId);
                                          const certType = subject?.certificateTypes?.find(ct => ct.id === cert.certificateTypeId);
                                          return certType ? `${certType.code} - ${certType.name}` : 'Unknown Certificate';
                                        })()}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      <span className="font-medium">Môn học:</span> {subjects.find(s => s.id === cert.subjectId)?.subjectName || 'Unknown'}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      <span className="font-medium">Thời hạn:</span> {cert.issueDate} - {cert.expiryDate}
                                    </div>
                                    {cert.certificateFile && (
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
                        <div className="space-y-4 p-6 border border-[#257180]/20 rounded-lg bg-white">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cert-subject" className="text-black text-sm sm:text-base">Môn học <span className="text-red-500">*</span></Label>
                            <SelectWithSearch
                                value={currentCertification.subjectId.toString()}
                                onValueChange={(value) => setCurrentCertification(prev => ({ ...prev, subjectId: parseInt(value), certificateTypeId: 0 }))}
                              placeholder="Chọn môn học"
                              className="border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                            >
                                {formData.introduction.subjects.map((subject) => {
                                  const subjectData = subjects.find(s => s.id === subject.subjectId);
                                  return (
                                <SelectWithSearchItem 
                                      key={subject.subjectId} 
                                      value={subject.subjectId.toString()}
                                      onClick={() => setCurrentCertification(prev => ({ ...prev, subjectId: subject.subjectId, certificateTypeId: 0 }))}
                                    >
                                      {subjectData?.subjectName || 'Unknown'}
                                </SelectWithSearchItem>
                                  );
                                })}
                            </SelectWithSearch>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="cert-type" className="text-black text-sm sm:text-base">Chứng chỉ <span className="text-red-500">*</span></Label>
                            <SelectWithSearch
                                value={currentCertification.certificateTypeId.toString()}
                                onValueChange={(value) => setCurrentCertification(prev => ({ ...prev, certificateTypeId: parseInt(value) }))}
                                placeholder={currentCertification.subjectId ? "Chọn chứng chỉ" : "Chọn môn học trước"}
                                disabled={!currentCertification.subjectId}
                                className="border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51] disabled:opacity-50"
                              >
                                {currentCertification.subjectId && (() => {
                                  const selectedSubject = subjects.find(subject => subject.id === currentCertification.subjectId);
                                  const availableCertificateTypes = selectedSubject?.certificateTypes || [];
                                  
                                  return availableCertificateTypes.map((certType) => (
                                <SelectWithSearchItem 
                                      key={certType.id} 
                                      value={certType.id.toString()}
                                      onClick={() => setCurrentCertification(prev => ({ ...prev, certificateTypeId: certType.id }))}
                                    >
                                      {certType.code} - {certType.name}
                                </SelectWithSearchItem>
                                  ));
                                })()}
                            </SelectWithSearch>
                          </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="cert-issue-date" className="text-black text-sm sm:text-base">Ngày cấp <span className="text-red-500">*</span></Label>
                              <Input
                                id="cert-issue-date"
                                type="date"
                                className="border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                                value={currentCertification.issueDate}
                                onChange={(e) => setCurrentCertification(prev => ({ ...prev, issueDate: e.target.value }))}
                                max={new Date().toISOString().split('T')[0]}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cert-expiry-date" className="text-black text-sm sm:text-base">Ngày hết hạn <span className="text-red-500">*</span></Label>
                              <Input
                                id="cert-expiry-date"
                                type="date"
                                className="border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                                value={currentCertification.expiryDate}
                                onChange={(e) => setCurrentCertification(prev => ({ ...prev, expiryDate: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-black text-sm sm:text-base">Tải lên chứng nhận <span className="text-red-500">*</span></Label>
                            <input
                              type="file"
                              id="cert-file-upload"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  await handleCertificationFileUpload(file);
                                }
                              }}
                            />
                            <div 
                              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 cursor-pointer bg-gray-50"
                              onClick={() => document.getElementById('cert-file-upload')?.click()}
                            >
                              {currentCertification.certificateFile ? (
                                <div>
                                  <FileText className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                  <p className="text-green-600 font-medium">File đã chọn: {currentCertification.certificateFile.name}</p>
                                  <p className="text-xs text-gray-500">Click để thay đổi</p>
                                </div>
                              ) : (
                                <div>
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-gray-600">Tải lên file chứng chỉ</p>
                                  <p className="text-xs text-gray-500">PDF, JPG, PNG. Tối đa 10MB</p>
                                </div>
                              )}
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
                      {fieldErrors.certifications && (
                        <p className="text-red-500 text-sm">{fieldErrors.certifications}</p>
                      )}
                      </div>
                    )}
                  </div>
                )}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-black mb-2">Giáo dục</h2>
                      <p className="text-gray-600">Thông tin về trình độ học vấn và bằng cấp</p>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-black text-sm sm:text-base">Bạn có bằng cấp giáo dục không? <span className="text-red-500">*</span></Label>
                      <RadioGroup 
                        value={formData.education.hasEducation?.toString() || null} 
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
                      {fieldErrors.hasEducation && (
                        <p className="text-red-500 text-sm">{fieldErrors.hasEducation}</p>
                      )}
                    </div>
                    {formData.education.hasEducation && (
                      <div className="space-y-6">
                        {/* List of added education */}
                        {formData.education.items.length > 0 && (
                          <div className="space-y-3">
                            <Label className="text-black text-sm sm:text-base">Bằng cấp đã thêm ({formData.education.items.length})</Label>
                            {formData.education.items.map((edu) => (
                              <div key={edu.id} className="bg-[#F2E5BF] border border-[#257180]/20 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <GraduationCap className="w-4 h-4 text-black" />
                                      <span className="font-medium text-black">
                                        {(() => {
                                          const institution = educationInstitutions.find(inst => inst.id === edu.institutionId);
                                          return institution ? `${institution.code} - ${institution.name}` : 'Unknown';
                                        })()}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <div>
                                        <span className="font-medium">Trường:</span> {(() => {
                                          const institution = educationInstitutions.find(inst => inst.id === edu.institutionId);
                                          return institution ? `${institution.code} - ${institution.name}` : 'Unknown';
                                        })()}
                                      </div>
                                      <div>
                                        <span className="font-medium">Ngày cấp:</span> {edu.issueDate}
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
                            <Label htmlFor="institution" className="text-black text-sm sm:text-base">Tổ chức giáo dục <span className="text-red-500">*</span></Label>
                              <SelectWithSearch
                              value={currentEducation.institutionId.toString()}
                              onValueChange={(value) => setCurrentEducation(prev => ({ ...prev, institutionId: parseInt(value) }))}
                              placeholder="Chọn tổ chức giáo dục"
                                className="border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                              >
                              {educationInstitutions.map((institution) => (
                                  <SelectWithSearchItem 
                                  key={institution.id} 
                                  value={institution.id.toString()}
                                  onClick={() => setCurrentEducation(prev => ({ ...prev, institutionId: institution.id }))}
                                >
                                  {`${institution.code} - ${institution.name}`}
                                  </SelectWithSearchItem>
                                ))}
                              </SelectWithSearch>
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="issueDate" className="text-black text-sm sm:text-base">Ngày cấp <span className="text-red-500">*</span></Label>
                              <Input
                              id="issueDate"
                              type="date"
                                className="border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                              value={currentEducation.issueDate}
                              onChange={(e) => setCurrentEducation(prev => ({ ...prev, issueDate: e.target.value }))}
                              />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-black text-sm sm:text-base">Tải lên bằng cấp <span className="text-red-500">*</span></Label>
                            <input
                              type="file"
                              id="education-file-upload"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  // Skip file upload service - send file directly in become-tutor API
                                  setCurrentEducation(prev => ({
                                    ...prev,
                                    degreeFile: file
                                  }));
                                }
                              }}
                            />
                            <div 
                              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 cursor-pointer bg-gray-50"
                              onClick={() => document.getElementById('education-file-upload')?.click()}
                            >
                              {currentEducation.degreeFile ? (
                                <div>
                                  <FileText className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                  <p className="text-green-600 font-medium">File đã chọn: {currentEducation.degreeFile.name}</p>
                                  <p className="text-xs text-gray-500">Click để thay đổi</p>
                                </div>
                              ) : (
                                <div>
                                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-gray-600">Tải lên file bằng cấp</p>
                                  <p className="text-xs text-gray-500">PDF, JPG, PNG. Tối đa 10MB</p>
                                </div>
                              )}
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
                      {fieldErrors.education && (
                        <p className="text-red-500 text-sm">{fieldErrors.education}</p>
                      )}
                      </div>
                    )}
                  </div>
                )}
                {/* Step 5: Mô tả */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-black mb-2">Mô tả</h2>
                      <p className="text-gray-600">Giới thiệu bản thân và kinh nghiệm giảng dạy</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="attractive-title" className="text-black text-sm sm:text-base">Viết 1 tiêu đề hấp dẫn <span className="text-red-500">*</span></Label>
                      <Input
                        id="attractive-title"
                        placeholder="VD: Gia sư Toán 10 năm kinh nghiệm, giúp học sinh cải thiện điểm số nhanh chóng"
                        className={`border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51] ${fieldErrors.attractiveTitle ? 'border-red-500' : ''}`}
                        value={formData.description.attractiveTitle}
                        onChange={(e) => updateFormData('description', { attractiveTitle: e.target.value })}
                      />
                      <p className="text-xs text-gray-500">Tiêu đề sẽ hiển thị đầu tiên trong hồ sơ gia sư</p>
                      {fieldErrors.attractiveTitle && (
                        <p className="text-red-500 text-sm">{fieldErrors.attractiveTitle}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="introduction" className="text-black text-sm sm:text-base">Giới thiệu bản thân <span className="text-red-500">*</span></Label>
                      <Textarea
                        id="introduction"
                        placeholder="Hãy viết một đoạn giới thiệu về bản thân, sở thích, tính cách và động lực dạy học..."
                        className={`min-h-32 border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51] ${fieldErrors.introduction ? 'border-red-500' : ''}`}
                        value={formData.description.introduction}
                        onChange={(e) => updateFormData('description', { introduction: e.target.value })}
                      />
                      <p className="text-xs text-gray-500">Tối thiểu 100 ký tự</p>
                      {fieldErrors.introduction && (
                        <p className="text-red-500 text-sm">{fieldErrors.introduction}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teaching-experience" className="text-black text-sm sm:text-base">Kinh nghiệm giảng dạy <span className="text-red-500">*</span></Label>
                      <Textarea
                        id="teaching-experience"
                        placeholder="Mô tả kinh nghiệm giảng dạy, phương pháp dạy học, các thành tích đã đạt được..."
                        className={`min-h-32 border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51] ${fieldErrors.teachingExperience ? 'border-red-500' : ''}`}
                        value={formData.description.teachingExperience}
                        onChange={(e) => updateFormData('description', { teachingExperience: e.target.value })}
                      />
                      <p className="text-xs text-gray-500">Chia sẻ phương pháp và kinh nghiệm giảng dạy</p>
                      {fieldErrors.teachingExperience && (
                        <p className="text-red-500 text-sm">{fieldErrors.teachingExperience}</p>
                      )}
                    </div>
                    <div className="bg-[#F2E5BF] p-4 rounded-lg border border-[#257180]/20">
                      <h4 className="font-medium text-black mb-2">Mẹo viết mô tả tốt</h4>
                      <div className="text-sm text-black space-y-1">
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
                      <h2 className="text-2xl font-bold text-black mb-2">Video giới thiệu</h2>
                      <p className="text-gray-600">Tạo video giới thiệu để thu hút học viên</p>
                    </div>
                    <div className="space-y-6">
                      {/* Video Preview */}
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                        {formData.video.videoFile ? (
                          <video 
                            src={URL.createObjectURL(formData.video.videoFile)} 
                            controls 
                            className="w-full h-full object-cover"
                          />
                        ) : formData.video.youtubeLink ? (
                          <div className="text-center p-4">
                            <Play className="w-16 h-16 text-red-500 mx-auto mb-2" />
                            <p className="text-red-600 font-medium">YouTube Video</p>
                            <p className="text-xs text-gray-500 break-all">{formData.video.youtubeLink}</p>
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
                          <Label className="text-black text-sm sm:text-base">Tải lên video từ máy tính <span className="text-red-500">*</span></Label>
                          <input
                            type="file"
                            id="video-upload"
                            accept="video/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Skip file upload service - send file directly in become-tutor API
                                setFormData(prev => ({
                                  ...prev,
                                  video: {
                                    ...prev.video,
                                    videoFile: file,
                                    youtubeLink: '', // Clear YouTube link when file is selected
                                    hasVideo: true
                                  }
                                }));
                              }
                            }}
                          />
                          <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#FD8B51] cursor-pointer"
                            onClick={() => document.getElementById('video-upload')?.click()}
                          >
                            {formData.video.videoFile ? (
                              <div>
                                <Play className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                <p className="text-green-600 font-medium">Video đã chọn: {formData.video.videoFile.name}</p>
                                <p className="text-xs text-gray-500">Click để thay đổi</p>
                              </div>
                            ) : (
                              <div>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">Tải lên video giới thiệu</p>
                            <p className="text-xs text-gray-500">MP4, MOV, AVI. Tối đa 100MB, dài không quá 5 phút</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* YouTube URL Input */}
                        <div className="space-y-2">
                          <Label className="text-black text-sm sm:text-base">Hoặc dán link YouTube</Label>
                          <Input
                            type="url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={formData.video.youtubeLink}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                video: {
                                  ...prev.video,
                                  youtubeLink: e.target.value,
                                  videoFile: null, // Clear file when YouTube link is entered
                                  hasVideo: e.target.value.trim() !== ''
                                }
                              }));
                            }}
                            className="border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51]"
                          />
                          <p className="text-xs text-gray-500">
                            Dán link YouTube video giới thiệu của bạn
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#F2E5BF] p-4 rounded-lg border border-[#257180]/20">
                      <h4 className="font-medium text-black mb-2">Gợi ý quay video</h4>
                      <div className="text-sm text-black space-y-1">
                        <div>• Giới thiệu tên, kinh nghiệm và môn dạy</div>
                        <div>• Nói về phương pháp giảng dạy của bạn</div>
                        <div>• Thể hiện sự nhiệt tình và chuyên nghiệp</div>
                        <div>• Quay ở nơi yên tĩnh, ánh sáng tốt</div>
                        <div>• Thời lượng từ 1-3 phút</div>
                      </div>
                    </div>
                    {fieldErrors.video && (
                      <p className="text-red-500 text-sm text-center">{fieldErrors.video}</p>
                    )}
                  </div>
                )}
                {/* Step 7: Thời gian khả dụng */}
                {currentStep === 7 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-black mb-2">Thời gian khả dụng</h2>
                      <p className="text-gray-600">Thiết lập lịch dạy trong tuần</p>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-black text-sm sm:text-base">Chọn thời gian bạn có thể dạy (chọn tối thiểu 5 khung giờ)</Label>
                      <div className="overflow-x-auto">
                        <div className="min-w-full">
                          {/* Header */}
                          <div className="grid grid-cols-8 gap-2 mb-2">
                            <div className="p-2"></div>
                            {weekDays.map((day) => (
                              <div key={day.key} className="p-2 text-center font-medium text-black bg-[#F2E5BF] rounded border border-[#257180]/20">
                                {day.label}
                              </div>
                            ))}
                          </div>
                          {/* Time Slots */}
                          {timeSlotsGenerated.map((timeSlot) => (
                            <div key={timeSlot.startTime} className="grid grid-cols-8 gap-2 mb-1">
                              <div className="p-2 text-sm font-medium text-gray-600 flex items-center">
                                {timeSlot.startTime} - {timeSlot.endTime}
                              </div>
                              {weekDays.map((day) => (
                                <div key={`${day.key}-${timeSlot.startTime}`} className="p-1">
                                  <Checkbox 
                                    id={`${day.key}-${timeSlot.startTime}`} 
                                    className="w-full h-8 data-[state=checked]:bg-[#FD8B51]"
                                    checked={formData.availability.schedule[day.key]?.includes(timeSlot.startTime) || false}
                                    onCheckedChange={(checked) => {
                                      const currentSlots = formData.availability.schedule[day.key] || [];
                                      const newSlots = checked 
                                        ? [...currentSlots, timeSlot.startTime]
                                        : currentSlots.filter(slot => slot !== timeSlot.startTime);
                                      updateFormData('availability', {
                                        schedule: {
                                          ...formData.availability.schedule,
                                          [day.key]: newSlots
                                        }
                                      });
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#F2E5BF] p-4 rounded-lg border border-[#257180]/20">
                      <h4 className="font-medium text-black mb-2">Lưu ý về lịch dạy</h4>
                      <div className="text-sm text-black space-y-1">
                        <div>• Chọn những khung giờ bạn thực sự có thể dạy</div>
                        <div>• Lịch này sẽ hiển thị cho học viên khi đặt lịch</div>
                        <div>• Bạn có thể thay đổi lịch sau trong phần quản lý hồ sơ</div>
                        <div>• Nên chọn ít nhất 10-15 khung giờ để tăng cơ hội được chọn</div>
                      </div>
                    </div>
                    {fieldErrors.schedule && (
                      <p className="text-red-500 text-sm text-center">{fieldErrors.schedule}</p>
                    )}
                  </div>
                )}
                {/* Step 8: Giá cả */}
                {currentStep === 8 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-black mb-2">Giá cả</h2>
                      <p className="text-gray-600">Thiết lập mức học phí cho từng môn học</p>
                    </div>
                    <div className="space-y-4">
                      {formData.introduction.subjects.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>Vui lòng chọn ít nhất một môn học ở bước trước</p>
                        </div>
                      ) : (
                        formData.introduction.subjects.map((subject) => {
                          const subjectData = subjects.find(s => s.id === subject.subjectId);
                          const pricing = formData.pricing.subjectPricing.find(p => p.subjectId === subject.subjectId);
                          
                          return (
                            <div key={subject.subjectId} className="space-y-2">
                              <Label className="text-black text-sm sm:text-base">
                                Giá cho môn {subjectData?.subjectName || 'Unknown'} <span className="text-red-500">*</span>
                              </Label>
                        <div className="relative">
                          <Banknote className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            min="0"
                            placeholder="200000"
                            className={`pl-10 text-lg border-[#257180]/30 focus:border-[#FD8B51] focus:ring-[#FD8B51] ${fieldErrors[`pricing_${formData.introduction.subjects.indexOf(subject)}`] ? 'border-red-500' : ''}`}
                                  value={pricing?.hourlyRate || ''}
                                  onChange={(e) => {
                                    const newPricing = formData.pricing.subjectPricing.map(p => 
                                      p.subjectId === subject.subjectId 
                                        ? { ...p, hourlyRate: e.target.value }
                                        : p
                                    );
                                    setFormData(prev => ({
                                      ...prev,
                                      pricing: {
                                        ...prev.pricing,
                                        subjectPricing: newPricing
                                      }
                                    }));
                                    
                                    // Clear error for this field
                                    const newErrors = { ...fieldErrors };
                                    delete newErrors[`pricing_${formData.introduction.subjects.indexOf(subject)}`];
                                    setFieldErrors(newErrors);
                                  }}
                          />
                        </div>
                        <p className="text-sm text-gray-500">
                          Giá trung bình: {FormatService.formatVNDWithUnit(150000)} - {FormatService.formatVNDWithUnit(300000)}
                        </p>
                        {fieldErrors[`pricing_${formData.introduction.subjects.indexOf(subject)}`] && (
                          <p className="text-red-500 text-sm">{fieldErrors[`pricing_${formData.introduction.subjects.indexOf(subject)}`]}</p>
                        )}
                      </div>
                          );
                        })
                      )}
                      {fieldErrors.pricing && (
                        <p className="text-red-500 text-sm text-center">{fieldErrors.pricing}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-[#F2E5BF] p-4 rounded-lg text-center border border-[#257180]/20">
                        <div className="text-2xl font-bold text-black">{FormatService.formatVND(150000)}-{FormatService.formatVND(200000)}</div>
                        <div className="text-sm text-black">Gia sư mới</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center border-2 border-[#FD8B51]">
                        <div className="text-2xl font-bold text-[#FD8B51]">{FormatService.formatVND(200000)}-{FormatService.formatVND(350000)}</div>
                        <div className="text-sm text-[#FD8B51]">Có kinh nghiệm</div>
                      </div>
                      <div className="bg-[#F2E5BF] p-4 rounded-lg text-center border border-[#CB6040]/30">
                        <div className="text-2xl font-bold text-[#CB6040]">{FormatService.formatVND(350000)}-{FormatService.formatVND(500000)}</div>
                        <div className="text-sm text-[#CB6040]">Chuyên gia</div>
                      </div>
                    </div>
                    <div className="bg-[#F2E5BF] p-4 rounded-lg border border-[#257180]/20">
                      <h4 className="font-medium text-black mb-2">Lưu ý về giá cả</h4>
                      <div className="text-sm text-black space-y-1">
                        <div>• Giá hợp lý sẽ thu hút nhiều học viên hơn</div>
                        <div>• Bạn có thể điều chỉnh giá sau khi có đánh giá tốt</div>
                        <div>• EduMatch sẽ trích 15% phí dịch vụ từ mỗi buổi học</div>
                        <div>• Học viên có thể đặt buổi học thử với giá ưu đãi</div>
                      </div>
                    </div>
                    {/* Summary */}
                    <div className="bg-white p-6 rounded-lg border border-[#257180]/20">
                      <h4 className="font-medium text-black mb-4">Tóm tắt đăng ký</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Họ tên:</span>
                          <span className="font-medium">{formData.introduction.fullName}</span>
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
                          <div className="text-right">
                            {formData.pricing.subjectPricing.length > 0 ? (
                              formData.pricing.subjectPricing.map((pricing) => {
                                const subject = subjects.find(s => s.id === pricing.subjectId);
                                const subjectWithLevels = formData.introduction.subjects.find(s => s.subjectId === pricing.subjectId);
                                const selectedLevels = subjectWithLevels?.levels.map(levelId => 
                                  levels.find(l => l.id === levelId)?.name || `Lớp ${levelId}`
                                ).filter(Boolean).join(', ') || 'Chưa chọn lớp';
                                
                                return (
                                  <div key={pricing.subjectId} className="text-sm">
                                    <div className="font-medium">{subject?.subjectName}: {pricing.hourlyRate ? FormatService.formatVNDWithUnit(Number(pricing.hourlyRate)) : 'Chưa thiết lập'}</div>
                                    <div className="text-xs text-gray-500">Lớp: {selectedLevels}</div>
                                  </div>
                                );
                              })
                            ) : (
                              <span className="font-medium">Chưa thiết lập</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Navigation Buttons */}
                <div className="flex justify-between pt-8 border-t border-gray-200">
                  {currentStep > 1 && (
                    <Button 
                      variant="outline" 
                      onClick={handlePrevious}
                      className="border-black text-black hover:bg-[#F2E5BF]"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Quay lại
                    </Button>
                  )}
                  {currentStep === 1 && <div></div>}
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
                      disabled={isSubmitting}
                      className="bg-[#257180] hover:bg-[#1a5a66] text-white disabled:opacity-50 px-8 py-3 text-lg font-semibold"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Đang gửi đơn đăng ký...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Gửi đơn đăng ký gia sư
                        </>
                      )}
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
