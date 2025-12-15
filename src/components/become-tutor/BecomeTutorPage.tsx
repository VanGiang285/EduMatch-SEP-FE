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
  Loader2,
  ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormatService } from "@/lib/format";
import { useBecomeTutor } from "@/hooks/useBecomeTutor";
import { useAuth } from "@/contexts/AuthContext";
import { useBecomeTutorMasterData } from "@/hooks/useBecomeTutorMasterData";
import { MediaService } from "@/services/mediaService";
import { CertificateService } from "@/services/certificateService";
import { LocationService, ProvinceDto, SubDistrictDto } from "@/services/locationService";
import { 
  BecomeTutorRequest,
  TutorAvailabilityCreateRequest,
  TutorSubjectCreateRequest,
  TutorCertificateCreateRequest,
  TutorEducationCreateRequest
} from "@/types/requests";
import { TeachingMode, InstitutionType } from "@/types/enums";
export function BecomeTutorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const { user, isAuthenticated, register } = useAuth();
  const { isSubmitting, error, submitApplication, clearError, isAuthenticated: isTutorAuthenticated } = useBecomeTutor();
  const { subjects, levels, educationInstitutions, timeSlots, error: masterDataError, loadMasterData } = useBecomeTutorMasterData();

  // Note: Authentication and authorization are now handled at page level
  const [pendingRegistration, setPendingRegistration] = useState<{
    fullName: string;
    email: string;
    password: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("PENDING_TUTOR_REGISTER");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data && data.fullName && data.email && data.password) {
          setPendingRegistration(data);
          setFormData(prev => ({
            ...prev,
            introduction: {
              ...prev.introduction,
              fullName: data.fullName,
              email: data.email,
            },
          }));
        }
      } catch {
      }
    }
  }, []);

  const getDefaultDates = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const endDate = new Date(tomorrow);
    endDate.setDate(tomorrow.getDate() + 30);
    
    return {
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const validateBirthDate = (birthDate: string) => {
    if (!birthDate) return 'Vui lòng chọn ngày sinh';
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    if (birth > today) return 'Ngày sinh không được sau hôm nay';
    if (age < 18) return 'Bạn phải đủ 18 tuổi để trở thành gia sư';
    if (age > 100) return 'Ngày sinh không hợp lệ';
    
    return '';
  };

  const validateIssueDate = (issueDate: string, fieldName: string = 'ngày cấp') => {
    if (!issueDate) return `Vui lòng chọn ${fieldName}`;
    
    const today = new Date();
    const issue = new Date(issueDate);
    const fiftyYearsAgo = new Date();
    fiftyYearsAgo.setFullYear(today.getFullYear() - 50);
    
    if (issue > today) return `${fieldName} không được sau hôm nay`;
    if (issue < fiftyYearsAgo) return `${fieldName} không được quá 50 năm trước`;
    
    return '';
  };

  const validateExpiryDate = (expiryDate: string, issueDate: string) => {
    if (!expiryDate) return 'Vui lòng chọn ngày hết hạn';
    if (!issueDate) return 'Vui lòng chọn ngày cấp trước';
    
    const expiry = new Date(expiryDate);
    const issue = new Date(issueDate);
    const tenYearsAfterIssue = new Date(issue);
    tenYearsAfterIssue.setFullYear(issue.getFullYear() + 10);
    
    if (expiry <= issue) return 'Ngày hết hạn phải sau ngày cấp';
    if (expiry > tenYearsAfterIssue) return 'Ngày hết hạn không được quá 10 năm sau ngày cấp';
    
    return '';
  };

  const validateAvailabilityStartDate = (startDate: string) => {
    if (!startDate) return 'Vui lòng chọn ngày bắt đầu';
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(today.getMonth() + 3);
    threeMonthsLater.setHours(23, 59, 59, 999);
    
    const start = new Date(startDate + 'T00:00:00');
    
    if (isNaN(start.getTime())) return 'Ngày không hợp lệ';
    if (start < tomorrow) return 'Ngày bắt đầu phải từ ngày mai trở đi';
    if (start > threeMonthsLater) return 'Ngày bắt đầu không được quá 3 tháng trong tương lai';
    
    return '';
  };

  const validateAvailabilityEndDate = (endDate: string, startDate: string) => {
    if (!endDate) return 'Vui lòng chọn ngày kết thúc';
    if (!startDate) return 'Vui lòng chọn ngày bắt đầu trước';
    
    const end = new Date(endDate + 'T00:00:00');
    const start = new Date(startDate + 'T00:00:00');
    
    if (isNaN(end.getTime()) || isNaN(start.getTime())) return 'Ngày không hợp lệ';
    
    const twoMonthsAfterStart = new Date(start);
    twoMonthsAfterStart.setMonth(start.getMonth() + 2);
    
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    sixMonthsLater.setHours(23, 59, 59, 999);
    
    if (end <= start) return 'Ngày kết thúc phải sau ngày bắt đầu';
    if (end > twoMonthsAfterStart) return 'Ngày kết thúc không được quá 2 tháng sau ngày bắt đầu';
    if (end > sixMonthsLater) return 'Ngày kết thúc không được quá 6 tháng trong tương lai';
    
    return '';
  };
  
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

  const [provinces, setProvinces] = useState<ProvinceDto[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrictDto[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
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
      startDate: getDefaultDates().startDate, // Ngày bắt đầu (mặc định ngày mai)
      endDate: getDefaultDates().endDate, // Ngày kết thúc (mặc định 1 tháng)
      isRepeating: true, // Toggle lặp lại
      currentWeek: 0, // 0 = tuần hiện tại trong range, 1 = tuần sau, -1 = tuần trước
      schedule: {} as Record<string, Record<string, number[]>> // {date: {dayOfWeek: [slotIds]}}
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
  // State cho tạo certificate type mới
  const [showNewCertificateInput, setShowNewCertificateInput] = useState(false);
  const [newCertificate, setNewCertificate] = useState({
    name: '',
    code: ''
  });
  const [isCreatingCertificate, setIsCreatingCertificate] = useState(false);
  // State cho tạo institution mới
  const [showNewInstitutionInput, setShowNewInstitutionInput] = useState(false);
  const [newInstitution, setNewInstitution] = useState({
    name: '',
    code: '',
    institutionType: undefined as InstitutionType | undefined
  });
  const [isCreatingInstitution, setIsCreatingInstitution] = useState(false);
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

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      setIsLoadingLocations(true);
      try {
        const response = await LocationService.getAllProvinces();
        if (response.success && response.data) {
          setProvinces(response.data);
        }
      } catch (error) {
        console.error('Error loading provinces:', error);
      } finally {
        setIsLoadingLocations(false);
      }
    };
    loadProvinces();
  }, []);

  // Load sub-districts when province changes
  useEffect(() => {
    const loadSubDistricts = async () => {
      if (!formData.introduction.province) {
        setSubDistricts([]);
        return;
      }
      
      const provinceId = parseInt(formData.introduction.province);
      if (isNaN(provinceId) || provinceId <= 0) {
        setSubDistricts([]);
        return;
      }

      setIsLoadingLocations(true);
      try {
        const response = await LocationService.getSubDistrictsByProvinceId(provinceId);
        if (response.success && response.data) {
          setSubDistricts(response.data);
        } else {
          setSubDistricts([]);
        }
      } catch (error) {
        console.error('Error loading sub-districts:', error);
        setSubDistricts([]);
      } finally {
        setIsLoadingLocations(false);
      }
    };
    loadSubDistricts();
  }, [formData.introduction.province]);

  const availableDistricts = subDistricts;

  const weekDays = [
    { key: 'monday', label: 'Thứ 2' },
    { key: 'tuesday', label: 'Thứ 3' },
    { key: 'wednesday', label: 'Thứ 4' },
    { key: 'thursday', label: 'Thứ 5' },
    { key: 'friday', label: 'Thứ 6' },
    { key: 'saturday', label: 'Thứ 7' },
    { key: 'sunday', label: 'Chủ nhật' }
  ];

  const generateCurrentWeekDates = () => {
    const startDate = new Date(formData.availability.startDate);
    const endDate = new Date(formData.availability.endDate);
    const currentWeek = formData.availability.currentWeek;
    
    const startOfWeek = new Date(startDate);
    const dayOfWeek = startDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(startDate.getDate() - daysToMonday + (currentWeek * 7));
    
    const datesByDay: Record<string, string> = {};
    
    weekDays.forEach((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      
      if (date >= startDate && date <= endDate) {
        const dayNum = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        datesByDay[day.key] = `${dayNum}/${month}`;
      } else {
        datesByDay[day.key] = '';
      }
    });

    return datesByDay;
  };

  const datesByDay = generateCurrentWeekDates();

  const getDateKey = (dayKey: string) => {
    const startDate = new Date(formData.availability.startDate);
    const currentWeek = formData.availability.currentWeek;
    
    const startOfWeek = new Date(startDate);
    const dayOfWeek = startDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(startDate.getDate() - daysToMonday + (currentWeek * 7));
    
    const dayIndex = weekDays.findIndex(d => d.key === dayKey);
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + dayIndex);
    
    return date.toISOString().split('T')[0];
  };

  const autoFillRepeatingSlots = (selectedDate: string, dayOfWeek: string, slotIds: number[]) => {
    if (!formData.availability.isRepeating) return;
    
    const startDate = new Date(formData.availability.startDate);
    const endDate = new Date(formData.availability.endDate);
    
    const dayOfWeekNumber = weekDays.findIndex(d => d.key === dayOfWeek) + 1;
    const adjustedDayOfWeek = dayOfWeekNumber === 7 ? 0 : dayOfWeekNumber;
    
    const repeatingDates: string[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      if (currentDate.getDay() === adjustedDayOfWeek) {
        const dateKey = currentDate.toISOString().split('T')[0];
        repeatingDates.push(dateKey);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const newSchedule = { ...formData.availability.schedule };
    repeatingDates.forEach(date => {
      newSchedule[date] = {
        ...newSchedule[date],
        [dayOfWeek]: slotIds
      };
    });
    
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        schedule: newSchedule
      }
    }));
  };

  const validatePricingStep = () => {
    return formData.pricing.subjectPricing.length === formData.introduction.subjects.length &&
           formData.pricing.subjectPricing.every(pricing => 
             pricing.hourlyRate.trim() !== '' && 
             !isNaN(Number(pricing.hourlyRate)) && 
             Number(pricing.hourlyRate) > 0
           ) &&
           formData.introduction.subjects.every(subject => subject.levels.length > 0);
  };
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
        const birthDateError = validateBirthDate(formData.introduction.birthDate);
        if (birthDateError) {
          errors.birthDate = birthDateError;
        }
        if (!formData.introduction.phone.trim()) {
          errors.phone = 'Vui lòng nhập số điện thoại';
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
        } else if (formData.certifications.hasCertification === true) {
          formData.certifications.items.forEach((cert, index) => {
            const issueDateError = validateIssueDate(cert.issueDate, 'ngày cấp chứng chỉ');
            if (issueDateError) {
              errors[`cert_issue_date_${index}`] = issueDateError;
            }
            
            const expiryDateError = validateExpiryDate(cert.expiryDate, cert.issueDate);
            if (expiryDateError) {
              errors[`cert_expiry_date_${index}`] = expiryDateError;
            }
          });
        }
        break;
      case 4:
        // Education is now required - must have at least one education item
        if (formData.education.items.length === 0) {
          errors.education = 'Vui lòng thêm ít nhất một bằng cấp';
        } else {
          formData.education.items.forEach((edu, index) => {
            const issueDateError = validateIssueDate(edu.issueDate, 'ngày cấp bằng');
            if (issueDateError) {
              errors[`edu_issue_date_${index}`] = issueDateError;
            }
          });
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
        const startDateError = validateAvailabilityStartDate(formData.availability.startDate);
        if (startDateError) {
          errors.startDate = startDateError;
        }
        
        const endDateError = validateAvailabilityEndDate(formData.availability.endDate, formData.availability.startDate);
        if (endDateError) {
          errors.endDate = endDateError;
        }
        
        const totalSlots = Object.values(formData.availability.schedule).reduce((total, dateSchedule) => {
          return total + Object.values(dateSchedule).reduce((dayTotal, slots) => dayTotal + slots.length, 0);
        }, 0);
        if (totalSlots < 1) {
          errors.schedule = 'Vui lòng chọn ít nhất 1 khung giờ';
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
  // Helper function để upload files
  const uploadFiles = async (): Promise<{
    avatarUrl?: string;
    videoIntroUrl?: string;
    certificateUrls: string[];
    educationUrls: string[];
  }> => {
    const result = {
      certificateUrls: [] as string[],
      educationUrls: [] as string[]
    };

    const ownerEmail = user?.email || pendingRegistration?.email;
    if (!ownerEmail) {
      throw new Error('Vui lòng đăng nhập hoặc cung cấp email để tiếp tục');
    }

    // Upload profile image
    if (formData.photo.profileImage) {
      const avatarResponse = await MediaService.uploadFile({
        file: formData.photo.profileImage,
        ownerEmail: ownerEmail,
        mediaType: 'Image'
      });
      if (avatarResponse.success && avatarResponse.data) {
        // ApiClient unwraps response.data, so avatarResponse.data is UploadToCloudResponse
        // UploadToCloudResponse has structure: { success, message, data?: { secureUrl, ... } }
        const uploadData = avatarResponse.data as any;
        if (uploadData.data?.secureUrl) {
          result.avatarUrl = uploadData.data.secureUrl;
        } else if (uploadData.secureUrl) {
          result.avatarUrl = uploadData.secureUrl;
        }
      } else {
        throw new Error(`Không thể upload ảnh đại diện: ${avatarResponse.message || 'Lỗi không xác định'}`);
      }
    }

    // Upload video file
    if (formData.video.videoFile) {
      const videoResponse = await MediaService.uploadFile({
        file: formData.video.videoFile,
        ownerEmail: ownerEmail,
        mediaType: 'Video'
      });
      if (videoResponse.success && videoResponse.data) {
        const uploadData = videoResponse.data as any;
        if (uploadData.data?.secureUrl) {
          result.videoIntroUrl = uploadData.data.secureUrl;
        } else if (uploadData.secureUrl) {
          result.videoIntroUrl = uploadData.secureUrl;
        }
      } else {
        throw new Error(`Không thể upload video: ${videoResponse.message || 'Lỗi không xác định'}`);
      }
    }

    // Upload certificate files
    if (formData.certifications.items.length > 0) {
      for (const cert of formData.certifications.items) {
        if (cert.certificateFile) {
          const certResponse = await MediaService.uploadFile({
            file: cert.certificateFile,
            ownerEmail: ownerEmail,
            mediaType: 'Image'
          });
          if (certResponse.success && certResponse.data) {
            const uploadData = certResponse.data as any;
            const url = uploadData.data?.secureUrl || uploadData.secureUrl;
            if (url) {
              result.certificateUrls.push(url);
            }
          } else {
            throw new Error(`Không thể upload chứng chỉ: ${certResponse.message || 'Lỗi không xác định'}`);
          }
        } else {
          result.certificateUrls.push(''); // Placeholder nếu không có file
        }
      }
    }

    // Upload education files (Required)
    if (formData.education.items.length > 0) {
      for (const edu of formData.education.items) {
        if (edu.degreeFile) {
          const eduResponse = await MediaService.uploadFile({
            file: edu.degreeFile,
            ownerEmail: ownerEmail,
            mediaType: 'Image'
          });
          if (eduResponse.success && eduResponse.data) {
            const uploadData = eduResponse.data as any;
            const url = uploadData.data?.secureUrl || uploadData.secureUrl;
            if (url) {
              result.educationUrls.push(url);
            }
          } else {
            throw new Error(`Không thể upload bằng cấp: ${eduResponse.message || 'Lỗi không xác định'}`);
          }
        } else {
          result.educationUrls.push(''); // Placeholder nếu không có file
        }
      }
    }

    return result;
  };

  const buildBecomeTutorRequest = (
    uploadedFiles: {
      avatarUrl?: string;
      videoIntroUrl?: string;
      certificateUrls: string[];
      educationUrls: string[];
    }
  ): BecomeTutorRequest => {
    const PLACEHOLDER_TUTOR_ID = 1;

    const availabilities = Object.entries(formData.availability.schedule).flatMap(([date, daySchedule]) =>
      Object.values(daySchedule).flatMap(slotIds =>
        slotIds.map(slotId => {
          const availability: TutorAvailabilityCreateRequest = {
            tutorId: PLACEHOLDER_TUTOR_ID,
            slotId: slotId,
            startDate: date + 'T00:00:00'
          };
          return availability;
        })
      )
    );

    const subjects = formData.introduction.subjects.flatMap(subject =>
      subject.levels.map(levelId => {
        const pricing = formData.pricing.subjectPricing.find(p => p.subjectId === subject.subjectId);
        const hourlyRate = pricing?.hourlyRate ? parseFloat(pricing.hourlyRate) : 0;
        
        const subjectName = displaySubjects.find(s => s.id === subject.subjectId)?.subjectName || 'N/A';
        if (hourlyRate <= 0) {
          throw new Error(`Vui lòng nhập giá cho môn học: ${subjectName}`);
        }

        const subjectData: TutorSubjectCreateRequest = {
          tutorId: PLACEHOLDER_TUTOR_ID,
          subjectId: subject.subjectId,
          hourlyRate: hourlyRate,
          levelId: levelId
        };
        return subjectData;
      })
    );

    const certificates = formData.certifications.items.length > 0
      ? formData.certifications.items.map((cert, idx) => {
          const certData: TutorCertificateCreateRequest = {
            tutorId: PLACEHOLDER_TUTOR_ID,
            certificateTypeId: cert.certificateTypeId,
            issueDate: cert.issueDate,
            expiryDate: cert.expiryDate,
            certificateUrl: uploadedFiles.certificateUrls[idx] || undefined
          };
          return certData;
        })
      : [];

    const educations = formData.education.items.length > 0
      ? formData.education.items.map((edu, idx) => {
          const eduData: TutorEducationCreateRequest = {
            tutorId: PLACEHOLDER_TUTOR_ID,
            institutionId: edu.institutionId,
            issueDate: edu.issueDate,
            certificateEducationUrl: uploadedFiles.educationUrls[idx] || undefined
          };
          return eduData;
        })
      : [];
    
    if (educations.length === 0) {
      throw new Error('Vui lòng thêm ít nhất một bằng cấp học vấn');
    }

    const provinceId = parseInt(formData.introduction.province);
    const subDistrictId = parseInt(formData.introduction.district);
    
    if (isNaN(provinceId) || provinceId <= 0) {
      throw new Error('Vui lòng chọn tỉnh/thành phố');
    }
    if (isNaN(subDistrictId) || subDistrictId <= 0) {
      throw new Error('Vui lòng chọn quận/huyện');
    }

    const request: BecomeTutorRequest = {
      tutorProfile: {
        userEmail: formData.introduction.email || user?.email || '',
        userName: formData.introduction.fullName,
        phone: formData.introduction.phone,
        bio: formData.description.introduction,
        dateOfBirth: formData.introduction.birthDate,
        avatarUrl: uploadedFiles.avatarUrl,
        provinceId: provinceId,
        subDistrictId: subDistrictId,
        teachingExp: formData.description.teachingExperience,
        videoIntroUrl: uploadedFiles.videoIntroUrl || formData.video.youtubeLink || undefined,
        teachingModes: formData.introduction.teachingMode as TeachingMode
      },
      educations: educations,
      certificates: certificates.length > 0 ? certificates : undefined,
      subjects: subjects,
      availabilities: availabilities
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('📤 Become Tutor Request:', JSON.stringify(request, null, 2));
    }

    return request;
  };

  const handleSubmit = async () => {
    if (!validatePricingStep()) {
      alert('Vui lòng điền đầy đủ thông tin giá cả cho tất cả môn học');
      return;
    }

    try {
      setIsUploadingFiles(true);
      clearError();

      const uploadedFiles = await uploadFiles();
      const request = buildBecomeTutorRequest(uploadedFiles);

      if (pendingRegistration) {
        await register(pendingRegistration.fullName, pendingRegistration.email, pendingRegistration.password);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("PENDING_TUTOR_REGISTER");
        }
        setPendingRegistration(null);
      }

      await submitApplication(request);
    } catch (err: any) {
      console.error('❌ Error in handleSubmit:', err);
      setFieldErrors({ submit: err.message || 'Lỗi khi gửi đơn đăng ký' });
      alert(err.message || 'Lỗi khi gửi đơn đăng ký. Vui lòng thử lại.');
    } finally {
      setIsUploadingFiles(false);
    }
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

  // Helper function để generate code từ name
  const generateCodeFromName = (name: string): string => {
    // Loại bỏ dấu tiếng Việt và chuyển thành uppercase
    const removeAccents = (str: string) => {
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };
    return removeAccents(name)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 20); // Giới hạn 20 ký tự
  };

  // Tạo certificate type mới
  const handleCreateCertificateType = async () => {
    if (!newCertificate.name.trim()) {
      alert('Vui lòng nhập tên chứng chỉ');
      return;
    }
    if (!currentCertification.subjectId) {
      alert('Vui lòng chọn môn học trước');
      return;
    }

    setIsCreatingCertificate(true);
    try {
      const code = newCertificate.code.trim() || generateCodeFromName(newCertificate.name);
      
      // Tạo certificate type mới
      const createResponse = await CertificateService.createCertificateType({
        name: newCertificate.name.trim(),
        code: code
      });

      if (!createResponse.success || !createResponse.data) {
        throw new Error(createResponse.message || 'Không thể tạo chứng chỉ mới');
      }

      const newCertificateTypeId = createResponse.data.id;

      // Link certificate type với subject
      const linkResponse = await CertificateService.addSubjectsToCertificateType(
        newCertificateTypeId,
        [currentCertification.subjectId]
      );

      if (!linkResponse.success) {
        throw new Error(linkResponse.message || 'Không thể liên kết chứng chỉ với môn học');
      }

      // Refresh master data để cập nhật danh sách
      await loadMasterData();

      // Chọn certificate type vừa tạo
      setCurrentCertification(prev => ({
        ...prev,
        certificateTypeId: newCertificateTypeId
      }));

      // Reset form và ẩn input
      setNewCertificate({ name: '', code: '' });
      setShowNewCertificateInput(false);
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi tạo chứng chỉ mới');
      console.error('Error creating certificate type:', error);
    } finally {
      setIsCreatingCertificate(false);
    }
  };

  // Tạo institution mới
  const handleCreateInstitution = async () => {
    if (!newInstitution.name.trim()) {
      alert('Vui lòng nhập tên tổ chức giáo dục');
      return;
    }

    setIsCreatingInstitution(true);
    try {
      const code = newInstitution.code.trim() || generateCodeFromName(newInstitution.name);
      
      // Tạo institution mới
      const createResponse = await CertificateService.createInstitution({
        name: newInstitution.name.trim(),
        code: code,
        institutionType: newInstitution.institutionType
      });

      if (!createResponse.success || !createResponse.data) {
        throw new Error(createResponse.message || 'Không thể tạo tổ chức giáo dục mới');
      }

      const newInstitutionId = createResponse.data.id;

      // Refresh master data để cập nhật danh sách
      await loadMasterData();

      // Chọn institution vừa tạo
      setCurrentEducation(prev => ({
        ...prev,
        institutionId: newInstitutionId
      }));

      // Reset form và ẩn input
      setNewInstitution({ name: '', code: '', institutionType: undefined });
      setShowNewInstitutionInput(false);
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi tạo tổ chức giáo dục mới');
      console.error('Error creating institution:', error);
    } finally {
      setIsCreatingInstitution(false);
    }
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
  const handleProvinceChange = (provinceId: string) => {
    setFormData(prev => ({
      ...prev,
      introduction: {
        ...prev.introduction,
        province: provinceId,
        district: '' // Reset district when province changes
      }
    }));
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-16">
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
      {!pendingRegistration && (
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2 leading-tight tracking-tight">
                TRỞ THÀNH GIA SƯ EDUMATCH
              </h1>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Chia sẻ kiến thức và kiếm thu nhập từ đam mê của bạn
              </p>
            </div>
          </div>
        </div>
      )}
      {pendingRegistration && (
        <div className="max-w-6xl mx-auto px-6 pt-6">
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2 text-sm border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            onClick={() => router.push("/register")}
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang đăng ký
          </Button>
        </div>
      )}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white border border-[#257180]/20 transition-shadow hover:shadow-md">
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
            <Card className="bg-white border border-[#257180]/20 transition-shadow hover:shadow-md">
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
                             className={`pl-10 border-gray-300 focus:border-[#257180] focus:ring-[#257180] ${fieldErrors.fullName ? 'border-red-500' : ''}`}
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
                            className={`pl-10 border-gray-300 focus:border-[#257180] focus:ring-[#257180] ${fieldErrors.email ? 'border-red-500' : ''}`}
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
                            placeholder={isLoadingLocations ? "Đang tải..." : "Chọn tỉnh/thành phố"}
                            disabled={isLoadingLocations}
                            className="pl-10 border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                          >
                            {provinces.map((province) => (
                              <SelectWithSearchItem 
                                key={province.id} 
                                value={province.id.toString()}
                                onClick={() => handleProvinceChange(province.id.toString())}
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
                            placeholder={
                              isLoadingLocations ? "Đang tải..." :
                              formData.introduction.province ? "Chọn quận/huyện" : "Chọn tỉnh trước"
                            }
                            disabled={!formData.introduction.province || isLoadingLocations}
                            className="pl-10 border-gray-300 focus:border-[#257180] focus:ring-[#257180] disabled:opacity-50"
                          >
                            {availableDistricts.map((district) => (
                              <SelectWithSearchItem 
                                key={district.id} 
                                value={district.id.toString()}
                                onClick={() => updateFormData('introduction', { district: district.id.toString() })}
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
                              <div key={subject.subjectId} className="bg-[#F2E5BF] border border-gray-300 rounded-lg p-4 shadow-sm">
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
                                            className="px-3 py-1.5 bg-[#FD8B51] text-white text-sm font-semibold rounded-lg shadow-sm border border-gray-300/20 flex items-center gap-1"
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
                      <div className="space-y-4 p-6 border border-gray-300 rounded-lg bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="new-subject" className="text-black text-sm sm:text-base">Chọn môn học</Label>
                            <SelectWithSearch
                              value={currentSubject.subjectId.toString()}
                              onValueChange={(value) => setCurrentSubject(prev => ({ ...prev, subjectId: parseInt(value), levels: [] }))}
                              placeholder="Chọn môn học"
                              className="border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
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
                              className="border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
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
                          className={`border-gray-300 focus:border-[#257180] focus:ring-[#257180] ${fieldErrors.birthDate ? 'border-red-500' : ''}`}
                          value={formData.introduction.birthDate}
                          onChange={(e) => updateFormData('introduction', { birthDate: e.target.value })}
                          max={new Date().toISOString().split('T')[0]}
                        />
                        {fieldErrors.birthDate && (
                          <p className="text-red-500 text-sm">{fieldErrors.birthDate}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-black text-sm sm:text-base">Số điện thoại <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            placeholder="0123 456 789"
                            className={`pl-10 border-gray-300 focus:border-[#257180] focus:ring-[#257180] ${fieldErrors.phone ? 'border-red-500' : ''}`}
                            value={formData.introduction.phone}
                            onChange={(e) => updateFormData('introduction', { phone: e.target.value })}
                          />
                        </div>
                        {fieldErrors.phone && (
                          <p className="text-red-500 text-sm">{fieldErrors.phone}</p>
                        )}
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
                    <div className="bg-[#F2E5BF] p-4 rounded-lg border border-gray-300">
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
                              <div key={cert.id} className="bg-[#F2E5BF] border border-gray-300 rounded-lg p-4">
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
                        <div className="space-y-4 p-6 border border-gray-300 rounded-lg bg-white">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cert-subject" className="text-black text-sm sm:text-base">Môn học <span className="text-red-500">*</span></Label>
                            <SelectWithSearch
                                value={currentCertification.subjectId > 0 ? currentCertification.subjectId.toString() : ""}
                                onValueChange={(value) => setCurrentCertification(prev => ({ ...prev, subjectId: parseInt(value), certificateTypeId: 0 }))}
                              placeholder="Chọn môn học"
                              className="border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
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
                            {!showNewCertificateInput ? (() => {
                              const selectedSubject = subjects.find(subject => subject.id === currentCertification.subjectId);
                              const availableCertificateTypes = selectedSubject?.certificateTypes || [];
                              
                              return (
                                <SelectWithSearch
                                  value={currentCertification.certificateTypeId > 0 ? currentCertification.certificateTypeId.toString() : ""}
                                  onValueChange={(value) => {
                                    if (value === "NEW_CERTIFICATE") {
                                      setShowNewCertificateInput(true);
                                    } else {
                                      setCurrentCertification(prev => ({ ...prev, certificateTypeId: parseInt(value) }));
                                    }
                                  }}
                                  placeholder={currentCertification.subjectId ? "Chọn chứng chỉ" : "Chọn môn học trước"}
                                  disabled={!currentCertification.subjectId}
                                  className="border-gray-300 focus:border-[#257180] focus:ring-[#257180] disabled:opacity-50"
                                >
                                  {currentCertification.subjectId > 0 && (
                                    <SelectWithSearchItem 
                                      value="NEW_CERTIFICATE"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Plus className="w-4 h-4 text-black" />
                                        <span>Không có trong hệ thống</span>
                                      </div>
                                    </SelectWithSearchItem>
                                  )}
                                  {currentCertification.subjectId > 0 && availableCertificateTypes.map((certType) => (
                                    <SelectWithSearchItem 
                                      key={certType.id} 
                                      value={certType.id.toString()}
                                    >
                                      {certType.code} - {certType.name}
                                    </SelectWithSearchItem>
                                  ))}
                                </SelectWithSearch>
                              );
                            })() : (
                              <div className="space-y-3 p-4 border border-[#257180] rounded-lg bg-gray-50">
                                <div className="space-y-2">
                                  <Label className="text-black text-sm sm:text-base">Tên chứng chỉ <span className="text-red-500">*</span></Label>
                                  <Input
                                    value={newCertificate.name}
                                    onChange={(e) => setNewCertificate(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="VD: Chứng chỉ Toán học Quốc tế"
                                    className="border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-black text-sm sm:text-base">Mã chứng chỉ (tùy chọn)</Label>
                                  <Input
                                    value={newCertificate.code}
                                    onChange={(e) => setNewCertificate(prev => ({ ...prev, code: e.target.value }))}
                                    placeholder="Để trống để tự động tạo mã"
                                    className="border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                                  />
                                  <p className="text-xs text-gray-500">Nếu để trống, mã sẽ được tự động tạo từ tên</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    onClick={handleCreateCertificateType}
                                    disabled={isCreatingCertificate || !newCertificate.name.trim()}
                                    className="bg-[#257180] hover:bg-[#1e5a66] text-white flex-1"
                                  >
                                    {isCreatingCertificate ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Đang tạo...
                                      </>
                                    ) : (
                                      'Tạo và chọn'
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setShowNewCertificateInput(false);
                                      setNewCertificate({ name: '', code: '' });
                                    }}
                                    disabled={isCreatingCertificate}
                                    className="flex-1"
                                  >
                                    Hủy
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="cert-issue-date" className="text-black text-sm sm:text-base">Ngày cấp <span className="text-red-500">*</span></Label>
                              <Input
                                id="cert-issue-date"
                                type="date"
                                className={`border-gray-300 focus:border-[#257180] focus:ring-[#257180] ${fieldErrors.cert_issue_date ? 'border-red-500' : ''}`}
                                value={currentCertification.issueDate}
                                onChange={(e) => {
                                  setCurrentCertification(prev => ({ ...prev, issueDate: e.target.value }));
                                  const error = validateIssueDate(e.target.value, 'ngày cấp chứng chỉ');
                                  if (error) {
                                    setFieldErrors(prev => ({ ...prev, cert_issue_date: error }));
                                  } else {
                                    setFieldErrors(prev => {
                                      const newErrors = { ...prev };
                                      delete newErrors.cert_issue_date;
                                      return newErrors;
                                    });
                                  }
                                }}
                                max={new Date().toISOString().split('T')[0]}
                              />
                              {fieldErrors.cert_issue_date && (
                                <p className="text-red-500 text-sm">{fieldErrors.cert_issue_date}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cert-expiry-date" className="text-black text-sm sm:text-base">Ngày hết hạn <span className="text-red-500">*</span></Label>
                              <Input
                                id="cert-expiry-date"
                                type="date"
                                className={`border-gray-300 focus:border-[#257180] focus:ring-[#257180] ${fieldErrors.cert_expiry_date ? 'border-red-500' : ''}`}
                                value={currentCertification.expiryDate}
                                onChange={(e) => {
                                  setCurrentCertification(prev => ({ ...prev, expiryDate: e.target.value }));
                                  const error = validateExpiryDate(e.target.value, currentCertification.issueDate);
                                  if (error) {
                                    setFieldErrors(prev => ({ ...prev, cert_expiry_date: error }));
                                  } else {
                                    setFieldErrors(prev => {
                                      const newErrors = { ...prev };
                                      delete newErrors.cert_expiry_date;
                                      return newErrors;
                                    });
                                  }
                                }}
                              />
                              {fieldErrors.cert_expiry_date && (
                                <p className="text-red-500 text-sm">{fieldErrors.cert_expiry_date}</p>
                              )}
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
                      <p className="text-gray-600">Thông tin về trình độ học vấn và bằng cấp <span className="text-red-500">*</span></p>
                    </div>
                    <div className="space-y-6">
                        {/* List of added education */}
                        {formData.education.items.length > 0 && (
                          <div className="space-y-3">
                            <Label className="text-black text-sm sm:text-base">Bằng cấp đã thêm ({formData.education.items.length})</Label>
                            {formData.education.items.map((edu) => (
                              <div key={edu.id} className="bg-[#F2E5BF] border border-gray-300 rounded-lg p-4">
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
                        <div className="space-y-4 p-6 border border-gray-300 rounded-lg bg-white">
                          <div className="space-y-2">
                            <Label htmlFor="institution" className="text-black text-sm sm:text-base">Tổ chức giáo dục <span className="text-red-500">*</span></Label>
                            {!showNewInstitutionInput ? (
                              <SelectWithSearch
                                value={currentEducation.institutionId.toString()}
                                onValueChange={(value) => {
                                  if (value === "NEW_INSTITUTION") {
                                    setShowNewInstitutionInput(true);
                                  } else {
                                    setCurrentEducation(prev => ({ ...prev, institutionId: parseInt(value) }));
                                  }
                                }}
                                placeholder="Chọn tổ chức giáo dục"
                                className="border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                              >
                                <SelectWithSearchItem 
                                  value="NEW_INSTITUTION"
                                  onClick={() => setShowNewInstitutionInput(true)}
                                >
                                  <div className="flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-black" />
                                    <span>Chưa có Tổ chức giáo dục này trong hệ thống</span>
                                  </div>
                                </SelectWithSearchItem>
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
                            ) : (
                              <div className="space-y-3 p-4 border border-[#257180] rounded-lg bg-gray-50">
                                <div className="space-y-2">
                                  <Label className="text-black text-sm sm:text-base">Tên tổ chức giáo dục <span className="text-red-500">*</span></Label>
                                  <Input
                                    value={newInstitution.name}
                                    onChange={(e) => setNewInstitution(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="VD: Đại học Bách khoa Hà Nội"
                                    className="border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-black text-sm sm:text-base">Mã tổ chức (tùy chọn)</Label>
                                  <Input
                                    value={newInstitution.code}
                                    onChange={(e) => setNewInstitution(prev => ({ ...prev, code: e.target.value }))}
                                    placeholder="Để trống để tự động tạo mã"
                                    className="border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                                  />
                                  <p className="text-xs text-gray-500">Nếu để trống, mã sẽ được tự động tạo từ tên</p>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-black text-sm sm:text-base">Loại tổ chức (tùy chọn)</Label>
                                  <SelectWithSearch
                                    value={newInstitution.institutionType?.toString() || ''}
                                    onValueChange={(value) => {
                                      if (value === '') {
                                        setNewInstitution(prev => ({ ...prev, institutionType: undefined }));
                                      } else {
                                        setNewInstitution(prev => ({ ...prev, institutionType: parseInt(value) as InstitutionType }));
                                      }
                                    }}
                                    placeholder="Chọn loại tổ chức"
                                    className="border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                                  >
                                    <SelectWithSearchItem value="" onClick={() => setNewInstitution(prev => ({ ...prev, institutionType: undefined }))}>
                                      Không chọn
                                    </SelectWithSearchItem>
                                    <SelectWithSearchItem value={InstitutionType.University.toString()} onClick={() => setNewInstitution(prev => ({ ...prev, institutionType: InstitutionType.University }))}>
                                      Đại học
                                    </SelectWithSearchItem>
                                    <SelectWithSearchItem value={InstitutionType.College.toString()} onClick={() => setNewInstitution(prev => ({ ...prev, institutionType: InstitutionType.College }))}>
                                      Cao đẳng
                                    </SelectWithSearchItem>
                                    <SelectWithSearchItem value={InstitutionType.Vocational.toString()} onClick={() => setNewInstitution(prev => ({ ...prev, institutionType: InstitutionType.Vocational }))}>
                                      Trung cấp
                                    </SelectWithSearchItem>
                                    <SelectWithSearchItem value={InstitutionType.Other.toString()} onClick={() => setNewInstitution(prev => ({ ...prev, institutionType: InstitutionType.Other }))}>
                                      Khác
                                    </SelectWithSearchItem>
                                  </SelectWithSearch>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    onClick={handleCreateInstitution}
                                    disabled={isCreatingInstitution || !newInstitution.name.trim()}
                                    className="bg-[#257180] hover:bg-[#1e5a66] text-white flex-1"
                                  >
                                    {isCreatingInstitution ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Đang tạo...
                                      </>
                                    ) : (
                                      'Tạo và chọn'
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setShowNewInstitutionInput(false);
                                      setNewInstitution({ name: '', code: '', institutionType: undefined });
                                    }}
                                    disabled={isCreatingInstitution}
                                    className="flex-1"
                                  >
                                    Hủy
                                  </Button>
                                </div>
                              </div>
                            )}
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="issueDate" className="text-black text-sm sm:text-base">Ngày cấp <span className="text-red-500">*</span></Label>
                              <Input
                              id="issueDate"
                              type="date"
                                className={`border-gray-300 focus:border-[#257180] focus:ring-[#257180] ${fieldErrors.edu_issue_date ? 'border-red-500' : ''}`}
                              value={currentEducation.issueDate}
                              onChange={(e) => {
                                setCurrentEducation(prev => ({ ...prev, issueDate: e.target.value }));
                                const error = validateIssueDate(e.target.value, 'ngày cấp bằng');
                                if (error) {
                                  setFieldErrors(prev => ({ ...prev, edu_issue_date: error }));
                                } else {
                                  setFieldErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors.edu_issue_date;
                                    return newErrors;
                                  });
                                }
                              }}
                              />
                              {fieldErrors.edu_issue_date && (
                                <p className="text-red-500 text-sm">{fieldErrors.edu_issue_date}</p>
                              )}
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
                        className={`border-gray-300 focus:border-[#257180] focus:ring-[#257180] ${fieldErrors.attractiveTitle ? 'border-red-500' : ''}`}
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
                        className={`min-h-32 border-gray-300 focus:border-[#257180] focus:ring-[#257180] ${fieldErrors.introduction ? 'border-red-500' : ''}`}
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
                        className={`min-h-32 border-gray-300 focus:border-[#257180] focus:ring-[#257180] ${fieldErrors.teachingExperience ? 'border-red-500' : ''}`}
                        value={formData.description.teachingExperience}
                        onChange={(e) => updateFormData('description', { teachingExperience: e.target.value })}
                      />
                      <p className="text-xs text-gray-500">Chia sẻ phương pháp và kinh nghiệm giảng dạy</p>
                      {fieldErrors.teachingExperience && (
                        <p className="text-red-500 text-sm">{fieldErrors.teachingExperience}</p>
                      )}
                    </div>
                    <div className="bg-[#F2E5BF] p-4 rounded-lg border border-gray-300">
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
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-300 cursor-pointer"
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
                            className="border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                          />
                          <p className="text-xs text-gray-500">
                            Dán link YouTube video giới thiệu của bạn
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#F2E5BF] p-4 rounded-lg border border-gray-300">
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
                      <p className="text-gray-600">Thiết lập lịch dạy trong khoảng thời gian</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-black text-sm sm:text-base mb-2">
                          Ngày bắt đầu <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={formData.availability.startDate}
                          min={getDefaultDates().startDate}
                          max={(() => {
                            const threeMonthsLater = new Date();
                            threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
                            return threeMonthsLater.toISOString().split('T')[0];
                          })()}
                          onChange={(e) => {
                            const newStartDate = e.target.value;
                            const endDate = new Date(formData.availability.endDate);
                            const startDate = new Date(newStartDate);
                            
                            const error = validateAvailabilityStartDate(newStartDate);
                            if (error) {
                              setFieldErrors(prev => ({ ...prev, startDate: error }));
                            } else {
                              setFieldErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.startDate;
                                return newErrors;
                              });
                            }
                            
                            if (startDate >= endDate) {
                              const newEndDate = new Date(startDate);
                              newEndDate.setDate(startDate.getDate() + 30);
                              updateFormData('availability', { 
                                startDate: newStartDate,
                                endDate: newEndDate.toISOString().split('T')[0]
                              });
                            } else {
                              updateFormData('availability', { startDate: newStartDate });
                            }
                          }}
                          className={`border-gray-300 focus:border-[#257180] focus:ring-[#257180] ${fieldErrors.startDate ? 'border-red-500' : ''}`}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Tối thiểu từ ngày mai, tối đa 3 tháng trong tương lai
                        </p>
                        {fieldErrors.startDate && (
                          <p className="text-red-500 text-sm mt-1">{fieldErrors.startDate}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-black text-sm sm:text-base mb-2">
                          Ngày kết thúc <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={formData.availability.endDate}
                          min={formData.availability.startDate}
                          max={(() => {
                            if (!formData.availability.startDate) return '';
                            const startDate = new Date(formData.availability.startDate);
                            if (isNaN(startDate.getTime())) return '';
                            startDate.setMonth(startDate.getMonth() + 2);
                            return startDate.toISOString().split('T')[0];
                          })()}
                          onChange={(e) => {
                            const newEndDate = e.target.value;
                            
                            const error = validateAvailabilityEndDate(newEndDate, formData.availability.startDate);
                            if (error) {
                              setFieldErrors(prev => ({ ...prev, endDate: error }));
                            } else {
                              setFieldErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.endDate;
                                return newErrors;
                              });
                              updateFormData('availability', { endDate: newEndDate });
                            }
                          }}
                          className={`border-gray-300 focus:border-[#257180] focus:ring-[#257180] ${fieldErrors.endDate ? 'border-red-500' : ''}`}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Tối đa 2 tháng từ ngày bắt đầu, không quá 6 tháng trong tương lai
                        </p>
                        {fieldErrors.endDate && (
                          <p className="text-red-500 text-sm mt-1">{fieldErrors.endDate}</p>
                        )}
                      </div>
                    </div>

                    {/* Repeat Toggle */}
                    <div className="flex items-center justify-between p-4 bg-[#F2E5BF] rounded-lg border border-gray-300">
                      <div>
                        <Label className="text-black text-sm sm:text-base font-medium">
                          Lặp lại lịch theo thứ trong tuần
                        </Label>
                        <p className="text-xs text-gray-600 mt-1">
                          Tự động áp dụng lịch cho cùng thứ trong tuần trong khoảng thời gian đã chọn
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm font-medium ${!formData.availability.isRepeating ? 'text-[#257180]' : 'text-gray-500'}`}>
                          Tắt
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            updateFormData('availability', { 
                              isRepeating: !formData.availability.isRepeating
                            });
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#FD8B51] focus:ring-offset-2 ${
                            formData.availability.isRepeating ? 'bg-[#FD8B51]' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              formData.availability.isRepeating ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`text-sm font-medium ${formData.availability.isRepeating ? 'text-[#257180]' : 'text-gray-500'}`}>
                          Bật
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateFormData('availability', { currentWeek: formData.availability.currentWeek - 1 })}
                          className="border-gray-300 hover:bg-[#FD8B51] hover:text-white"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Tuần trước
                        </Button>
                        <div className="text-sm font-medium text-[#257180]">
                          {formData.availability.currentWeek === 0 ? 'Tuần này' : 
                           formData.availability.currentWeek === 1 ? 'Tuần sau' :
                           formData.availability.currentWeek === -1 ? 'Tuần trước' :
                           `Tuần ${formData.availability.currentWeek > 0 ? '+' : ''}${formData.availability.currentWeek}`}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateFormData('availability', { currentWeek: formData.availability.currentWeek + 1 })}
                          className="border-gray-300 hover:bg-[#FD8B51] hover:text-white"
                        >
                          Tuần sau
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateFormData('availability', { currentWeek: 0 })}
                        className="border-gray-300/30 hover:bg-[#FD8B51]/10 text-[#FD8B51]"
                      >
                        Hôm nay
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-black text-sm sm:text-base">Chọn thời gian bạn có thể dạy</Label>
                        
                        <button
                          type="button"
                          onClick={() => {
                            updateFormData('availability', { 
                              schedule: {}
                            });
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                        >
                          Xóa tất cả
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <div className="min-w-full">
                          <div className="grid grid-cols-8 gap-2 mb-2">
                            <div className="p-2"></div>
                            {weekDays.map((day) => (
                              <div key={day.key} className="p-2 text-center font-medium text-black bg-[#F2E5BF] rounded border border-gray-300">
                                <div>{day.label}</div>
                                <div className="text-xs text-gray-600 mt-1">{datesByDay[day.key]}</div>
                              </div>
                            ))}
                          </div>
                          
                          {timeSlots.length > 0 ? timeSlots.map((slot) => (
                            <div key={slot.id} className="grid grid-cols-8 gap-2 mb-1">
                              <div className="p-2 text-sm font-medium text-gray-600 flex items-center">
                                {slot.startTime.split(':').slice(0, 2).join(':')}
                              </div>
                              {weekDays.map((day) => {
                                const dateKey = getDateKey(day.key);
                                const today = new Date();
                                const todayString = today.toISOString().split('T')[0];
                                const isPastDate = dateKey <= todayString;
                                const isInRange = datesByDay[day.key] !== '';
                                
                                const currentSlots = formData.availability.schedule[dateKey]?.[day.key] || [];
                                
                                return (
                                  <div key={`${day.key}-${slot.id}`} className="p-1">
                                    {!isInRange || isPastDate ? (
                                      <div className="w-full h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                        <span className="text-xs text-gray-400">-</span>
                                      </div>
                                    ) : (
                                      <Checkbox 
                                        id={`${day.key}-${slot.id}`} 
                                        className="w-full h-8 data-[state=checked]:bg-[#FD8B51]"
                                        checked={currentSlots.includes(slot.id)}
                                        onCheckedChange={(checked) => {
                                          const newSlots = checked 
                                            ? [...currentSlots, slot.id]
                                            : currentSlots.filter(s => s !== slot.id);
                                          
                                          const newSchedule = {
                                            ...formData.availability.schedule,
                                            [dateKey]: {
                                              ...formData.availability.schedule[dateKey],
                                              [day.key]: newSlots
                                            }
                                          };
                                          
                                          if (formData.availability.isRepeating) {
                                            autoFillRepeatingSlots(dateKey, day.key, newSlots);
                                          } else {
                                            updateFormData('availability', { schedule: newSchedule });
                                          }
                                        }}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )) : (
                            <div className="text-center text-gray-500 py-4">
                              Đang tải danh sách khung giờ...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>


                    <div className="bg-[#F2E5BF] p-4 rounded-lg border border-gray-300">
                      <h4 className="font-medium text-black mb-2">Lưu ý về lịch dạy</h4>
                      <div className="text-sm text-black space-y-1">
                        <div>• Chọn những khung giờ bạn thực sự có thể dạy</div>
                        <div>• Lịch này sẽ hiển thị cho học viên khi đặt lịch</div>
                        <div>• Bạn có thể thay đổi lịch sau trong phần quản lý hồ sơ</div>
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
                            className={`pl-10 text-lg border-gray-300 focus:border-[#257180] focus:ring-[#257180] ${fieldErrors[`pricing_${formData.introduction.subjects.indexOf(subject)}`] ? 'border-red-500' : ''}`}
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
                      <div className="bg-[#F2E5BF] p-4 rounded-lg text-center border border-gray-300">
                        <div className="text-2xl font-bold text-black">{FormatService.formatVND(150000)}-{FormatService.formatVND(200000)}</div>
                        <div className="text-sm text-black">Gia sư mới</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center border-2 border-gray-300">
                        <div className="text-2xl font-bold text-[#FD8B51]">{FormatService.formatVND(200000)}-{FormatService.formatVND(350000)}</div>
                        <div className="text-sm text-[#FD8B51]">Có kinh nghiệm</div>
                      </div>
                      <div className="bg-[#F2E5BF] p-4 rounded-lg text-center border border-[#CB6040]/30">
                        <div className="text-2xl font-bold text-[#CB6040]">{FormatService.formatVND(350000)}-{FormatService.formatVND(500000)}</div>
                        <div className="text-sm text-[#CB6040]">Chuyên gia</div>
                      </div>
                    </div>
                    <div className="bg-[#F2E5BF] p-4 rounded-lg border border-gray-300">
                      <h4 className="font-medium text-black mb-2">Lưu ý về giá cả</h4>
                      <div className="text-sm text-black space-y-1">
                        <div>• Giá hợp lý sẽ thu hút nhiều học viên hơn</div>
                        <div>• Bạn có thể điều chỉnh giá sau khi có đánh giá tốt</div>
                        <div>• EduMatch sẽ trích 10% phí dịch vụ từ mỗi buổi học</div>
                        <div>• Học viên có thể đặt buổi học thử với giá ưu đãi</div>
                      </div>
                    </div>
                    {/* Summary */}
                    <div className="bg-white p-6 rounded-lg border border-gray-300">
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
                              ? `${provinces.find(p => p.id.toString() === formData.introduction.province)?.name}, ${availableDistricts.find(d => d.id.toString() === formData.introduction.district)?.name}`
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
                      className="border-black text-black hover:bg-[#FD8B51] hover:text-white"
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
                      disabled={isSubmitting || isUploadingFiles}
                      className="bg-[#257180] hover:bg-[#1a5a66] text-white disabled:opacity-50 px-8 py-3 text-lg font-semibold"
                    >
                      {isUploadingFiles ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Đang tải file lên...
                        </>
                      ) : isSubmitting ? (
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
