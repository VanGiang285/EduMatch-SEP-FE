"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Badge } from '@/components/ui/basic/badge';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Textarea } from '@/components/ui/form/textarea';
import { Progress } from '@/components/ui/feedback/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { Checkbox } from '@/components/ui/form/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/form/radio-group';
import { SelectWithSearch, SelectWithSearchItem } from '@/components/ui/form/select-with-search';
import { 
  Upload, 
  FileText, 
  DollarSign, 
  Star, 
  Check, 
  Video, 
  Award,
  Camera,
  MapPin,
  User,
  Phone,
  Play,
  Plus,
  Trash2,
  GraduationCap,
  AlertCircle,
  Loader2,
  Edit3,
  Save,
  X,
  Eye
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TutorService } from '@/services/tutorService';
import { FindTutorService } from '@/services/findTutorService';
import { UserProfileService } from '@/services/userProfileService';
import { MasterDataService } from '@/services/masterDataService';
import { useCustomToast } from '@/hooks/useCustomToast';
import { COMPONENT_STYLES } from '@/lib/style-system';
import { vietnamProvinces, getDistrictsByProvince } from '@/data/vietnam-locations';
import { FormatService } from '@/lib/format';

interface TutorProfileData {
  introduction: {
    fullName: string;
    email: string;
    province: string;
    district: string;
    subjects: Array<{
      subjectId: number;
      levels: number[];
    }>;
    birthDate: string;
    phone: string;
    teachingMode: number;
  };
  photo: {
    profileImage: string | null;
    hasImage: boolean;
  };
  certifications: {
    hasCertification: boolean | null;
    items: Array<{
      id: string;
      subjectId: number;
      certificateTypeId: number;
      issueDate: string;
      expiryDate: string;
      certificateFile: string | null;
    }>;
  };
  education: {
    hasEducation: boolean | null;
    items: Array<{
      id: string;
      institutionId: number;
      issueDate: string;
      degreeFile: string | null;
    }>;
  };
  description: {
    introduction: string;
    teachingExperience: string;
    attractiveTitle: string;
  };
  video: {
    videoFile: string | null;
    youtubeLink: string;
    hasVideo: boolean;
  };
  availability: {
    startDate: string;
    endDate: string;
    isRepeating: boolean;
    currentWeek: number;
    schedule: Record<string, Record<string, number[]>>;
  };
  pricing: {
    subjectPricing: Array<{
      subjectId: number;
      hourlyRate: string;
    }>;
  };
  stats: {
    rating: number;
    reviews: number;
    totalLessons: number;
    responseTime: string;
    memberSince: string;
    verified: boolean;
  };
}

export default function TeachingProfilePage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useCustomToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('introduction');
  const [loading, setLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const [profileData, setProfileData] = useState<TutorProfileData>({
    introduction: {
      fullName: '',
      email: user?.email || '',
      province: '',
      district: '',
      subjects: [],
      birthDate: '',
      phone: '',
      teachingMode: 2
    },
    photo: {
      profileImage: null,
      hasImage: false
    },
    certifications: {
      hasCertification: null,
      items: []
    },
    education: {
      hasEducation: null,
      items: []
    },
    description: {
      introduction: '',
      teachingExperience: '',
      attractiveTitle: ''
    },
    video: {
      videoFile: null,
      youtubeLink: '',
      hasVideo: false
    },
    availability: {
      startDate: '',
      endDate: '',
      isRepeating: true,
      currentWeek: 0,
      schedule: {}
    },
    pricing: {
      subjectPricing: []
    },
    stats: {
      rating: 4.9,
      reviews: 156,
      totalLessons: 280,
      responseTime: '1 giờ',
      memberSince: '2019',
      verified: true
    }
  });

  // Master data
  const [subjects, setSubjects] = useState<Array<{id: number, subjectName: string}>>([]);
  const [levels, setLevels] = useState<Array<{id: number, name: string}>>([]);
  const [educationInstitutions, setEducationInstitutions] = useState<Array<{id: number, name: string}>>([]);
  const [timeSlots, setTimeSlots] = useState<Array<{id: number, startTime: string, endTime: string}>>([]);
  const [certificateTypes, setCertificateTypes] = useState<Array<{id: number, name: string}>>([]);

  // Current editing items
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

  const availableDistricts = profileData.introduction.province 
    ? getDistrictsByProvince(profileData.introduction.province)
    : [];

  const weekDays = [
    { id: 0, name: 'Chủ nhật', short: 'CN' },
    { id: 1, name: 'Thứ hai', short: 'T2' },
    { id: 2, name: 'Thứ ba', short: 'T3' },
    { id: 3, name: 'Thứ tư', short: 'T4' },
    { id: 4, name: 'Thứ năm', short: 'T5' },
    { id: 5, name: 'Thứ sáu', short: 'T6' },
    { id: 6, name: 'Thứ bảy', short: 'T7' }
  ];

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

  // Load master data
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        // Load subjects
        const subjectsResponse = await MasterDataService.getAllSubjects();
        if (subjectsResponse.success) {
          setSubjects(subjectsResponse.data || []);
        }
        
        // Load levels
        const levelsResponse = await MasterDataService.getAllLevels();
        if (levelsResponse.success) {
          setLevels(levelsResponse.data || []);
        }
        
        // Load education institutions
        const institutionsResponse = await MasterDataService.getAllEducationInstitutions();
        if (institutionsResponse.success) {
          setEducationInstitutions(institutionsResponse.data || []);
        }
        
        // Load time slots
        const timeSlotsResponse = await MasterDataService.getAllTimeSlots();
        if (timeSlotsResponse.success) {
          setTimeSlots(timeSlotsResponse.data || []);
        }
        
        // Load certificate types
        const certTypesResponse = await MasterDataService.getAllCertificateTypesWithSubjects();
        if (certTypesResponse.success) {
          setCertificateTypes(certTypesResponse.data || []);
        }
      } catch (error) {
        console.error('Error loading master data:', error);
      }
    };
    
    loadMasterData();
  }, []);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.email) return;
      
      try {
        setLoading(true);
        
        // Load user profile for basic info
        const userResponse = await UserProfileService.getUserProfileByEmail(user.email);
        if (userResponse.success && userResponse.data) {
          const userData = userResponse.data as any;
          console.log('🔍 User data loaded:', userData);
          setProfileData(prev => ({
            ...prev,
            introduction: {
              ...prev.introduction,
              fullName: userData.userName || '',
              email: userData.userEmail || user.email,
              phone: userData.phone || '',
              birthDate: userData.dob ? userData.dob.split('T')[0] : '',
              province: userData.province?.name || '',
              district: userData.subDistrict?.name || ''
            },
            description: {
              ...prev.description,
              introduction: userData.bio || ''
            }
          }));
        }

        // Load tutor profile if user is a tutor
        console.log('🔍 User role:', user.role);
        console.log('🔍 User email:', user.email);
        if (user.role === 'tutor') {
          try {
            // Get all tutors and filter by email
            console.log('🔍 Getting all tutors...');
            const tutorResponse = await FindTutorService.getAllTutors();
            console.log('🔍 Tutor response:', tutorResponse);
            console.log('🔍 Tutor response success:', tutorResponse.success);
            console.log('🔍 Tutor response data:', tutorResponse.data);
            console.log('🔍 Tutor response data type:', typeof tutorResponse.data);
            console.log('🔍 Tutor response data length:', tutorResponse.data?.length);
            console.log('🔍 Tutor response message:', tutorResponse.message);
            console.log('🔍 Tutor response pagination:', tutorResponse.pagination);
            console.log('🔍 Tutor response error:', tutorResponse.error);
            console.log('🔍 Tutor response full object:', JSON.stringify(tutorResponse, null, 2));
            if (tutorResponse.success && tutorResponse.data) {
              // Filter tutors by user email
              const tutors = tutorResponse.data;
              console.log('🔍 All tutors:', tutors);
              console.log('🔍 Looking for email:', user.email);
              console.log('🔍 Tutor emails:', tutors.map((t: any) => t.userEmail));
              const tutorData = tutors.find((tutor: any) => tutor.userEmail === user.email) as any;
              console.log('🔍 Found tutor data:', tutorData);
              
              if (tutorData) {
                console.log('🔍 Tutor subjects:', tutorData.tutorSubjects);
                console.log('🔍 Tutor certificates:', tutorData.tutorCertificates);
                console.log('🔍 Tutor educations:', tutorData.tutorEducations);
                console.log('🔍 Avatar URL:', tutorData.avatarUrl);
                console.log('🔍 Video URL:', tutorData.videoIntroUrl);
              setProfileData(prev => ({
                ...prev,
                introduction: {
                  ...prev.introduction,
                  fullName: tutorData.userName || '',
                  phone: tutorData.phone || '',
                  birthDate: tutorData.dob ? tutorData.dob.split('T')[0] : '',
                  province: tutorData.province?.name || '',
                  district: tutorData.subDistrict?.name || '',
                  subjects: tutorData.tutorSubjects?.map((ts: any) => ({
                    subjectId: ts.subject.id,
                    levels: [ts.level.id]
                  })) || [],
                  teachingMode: tutorData.teachingModes || 2
                },
                description: {
                  ...prev.description,
                  introduction: tutorData.bio || '',
                  teachingExperience: tutorData.teachingExp || '',
                  attractiveTitle: tutorData.userName ? `Gia sư ${tutorData.userName}` : ''
                },
                photo: {
                  profileImage: tutorData.avatarUrl || '',
                  hasImage: !!tutorData.avatarUrl
                },
                video: {
                  videoFile: tutorData.videoIntroUrl,
                  youtubeLink: tutorData.videoIntroUrl || '',
                  hasVideo: !!tutorData.videoIntroUrl
                },
                certifications: {
                  hasCertification: tutorData.tutorCertificates?.length > 0,
                  items: tutorData.tutorCertificates?.map((cert: any) => ({
                    id: cert.id.toString(),
                    subjectId: 1,
                    certificateTypeId: cert.certificateType.id,
                    issueDate: cert.issueDate.split('T')[0],
                    expiryDate: cert.expiryDate.split('T')[0],
                    certificateFile: cert.certificateUrl
                  })) || []
                },
                education: {
                  hasEducation: tutorData.tutorEducations?.length > 0,
                  items: tutorData.tutorEducations?.map((edu: any) => ({
                    id: edu.id.toString(),
                    institutionId: edu.institution.id,
                    issueDate: edu.issueDate.split('T')[0],
                    degreeFile: edu.certificateUrl
                  })) || []
                },
                pricing: {
                  subjectPricing: tutorData.tutorSubjects?.map((ts: any) => ({
                    subjectId: ts.subject.id,
                    hourlyRate: ts.hourlyRate.toString()
                  })) || []
                },
  availability: {
                  startDate: tutorData.tutorAvailabilities?.[0]?.startDate?.split('T')[0] || getDefaultDates().startDate,
                  endDate: tutorData.tutorAvailabilities?.[0]?.endDate?.split('T')[0] || getDefaultDates().endDate,
                  isRepeating: true,
                  currentWeek: 0,
                  schedule: tutorData.tutorAvailabilities?.reduce((acc: any, availability: any) => {
                    const date = availability.startDate.split('T')[0];
                    const dayOfWeek = new Date(availability.startDate).getDay();
                    const timeSlot = `${availability.slot.startTime}-${availability.slot.endTime}`;
                    
                    if (!acc[dayOfWeek]) acc[dayOfWeek] = [];
                    acc[dayOfWeek].push({
                      time: timeSlot,
                      status: availability.status,
                      date: date
                    });
                    return acc;
                  }, {}) || {}
                },
                stats: {
                  rating: 4.9, // Default rating
                  reviews: 0, // Default reviews
                  totalLessons: 0, // Default lessons
                  responseTime: '1 giờ', // Default response time
                  memberSince: new Date(tutorData.createdAt).getFullYear().toString(),
                  verified: tutorData.status === 1
                }
              }));
              } else {
                console.log('🔍 No tutor found with email:', user.email);
              }
            }
          } catch (tutorError) {
            console.log('User is not a tutor or tutor profile not found:', tutorError);
          }
        }
        
        // Set fallback data for empty tabs
        setProfileData(prev => ({
          ...prev,
          description: {
            ...prev.description,
            introduction: prev.description.introduction || 'Chưa có giới thiệu',
            teachingExperience: prev.description.teachingExperience || 'Chưa có kinh nghiệm giảng dạy',
            attractiveTitle: prev.description.attractiveTitle || `Gia sư ${prev.introduction.fullName}`
          },
          photo: {
            ...prev.photo,
            hasImage: prev.photo.hasImage || false
          },
          video: {
            ...prev.video,
            hasVideo: prev.video.hasVideo || false
          },
          certifications: {
            ...prev.certifications,
            hasCertification: prev.certifications.hasCertification || false
          },
          education: {
            ...prev.education,
            hasEducation: prev.education.hasEducation || false
          },
          pricing: {
            ...prev.pricing,
            subjectPricing: prev.pricing.subjectPricing.length > 0 ? prev.pricing.subjectPricing : [
              { subjectId: 1, hourlyRate: '200000' }
            ]
          },
          availability: {
            ...prev.availability,
            startDate: prev.availability.startDate || getDefaultDates().startDate,
            endDate: prev.availability.endDate || getDefaultDates().endDate
          }
        }));
        
      } catch (error) {
        console.error('Error loading profile:', error);
        console.error('Không thể tải thông tin profile');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user?.email, user?.id, user?.role]);

  const updateProfileData = (section: keyof TutorProfileData, data: any) => {
    setProfileData(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], ...data }
    }));
  };

  const getProfileCompletion = () => {
    let completed = 0;
    const total = 8;
    
    if (profileData.introduction.fullName) completed++;
    if (profileData.introduction.phone) completed++;
    if (profileData.introduction.subjects.length > 0) completed++;
    if (profileData.introduction.province) completed++;
    if (profileData.description.introduction) completed++;
    if (profileData.description.teachingExperience) completed++;
    if (profileData.photo.hasImage) completed++;
    if (profileData.video.hasVideo) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const handleSave = async () => {
    try {
      // TODO: Implement save logic
      showSuccess('Cập nhật thông tin thành công');
      setIsEditing(false);
    } catch (error) {
      showError('Không thể cập nhật thông tin');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // TODO: Reset form data
  };

  if (loading) {
  return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
          <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Gia Sư</h1>
              <p className="text-gray-600 mt-2">Quản lý thông tin và hồ sơ gia sư của bạn</p>
          </div>
        </div>
      </div>


        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mb-6">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Chỉnh sửa Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Hủy
              </Button>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Lưu thay đổi
              </Button>
            </div>
            )}
          </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="introduction">Thông tin</TabsTrigger>
            <TabsTrigger value="photo">Ảnh</TabsTrigger>
            <TabsTrigger value="certifications">Chứng chỉ</TabsTrigger>
            <TabsTrigger value="education">Học vấn</TabsTrigger>
            <TabsTrigger value="description">Mô tả</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="availability">Lịch</TabsTrigger>
            <TabsTrigger value="pricing">Giá cả</TabsTrigger>
          </TabsList>

          {/* Tab 1: Introduction */}
          <TabsContent value="introduction">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <Input
                    id="fullName"
                    value={profileData.introduction.fullName}
                    onChange={(e) => updateProfileData('introduction', { fullName: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "text-gray-900 bg-gray-50" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.introduction.email}
                    disabled
                    className="text-gray-900 bg-gray-50"
                  />
            </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Tỉnh/Thành phố</Label>
                    <select 
                      className={`w-full px-3 py-2 border rounded-md ${COMPONENT_STYLES.input.default}`}
                      value={profileData.introduction.province}
                      onChange={(e) => updateProfileData('introduction', { province: e.target.value })}
                      disabled={!isEditing}
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      {vietnamProvinces.map((province) => (
                        <option key={province.code} value={province.name}>{province.name}</option>
                      ))}
                    </select>
              </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">Quận/Huyện</Label>
                    <select 
                      className={`w-full px-3 py-2 border rounded-md ${COMPONENT_STYLES.input.default}`}
                      value={profileData.introduction.district}
                      onChange={(e) => updateProfileData('introduction', { district: e.target.value })}
                      disabled={!isEditing}
                    >
                      <option value="">Chọn quận/huyện</option>
                      {availableDistricts.map((district) => (
                        <option key={district.code} value={district.name}>{district.name}</option>
                      ))}
                    </select>
            </div>
          </div>

                <div className="space-y-2">
                  <Label>Môn học</Label>
                  <p className="text-sm text-gray-700">Các môn học bạn có thể dạy</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={subject.id.toString()} 
                          checked={profileData.introduction.subjects.some(s => s.subjectId === subject.id)}
                          disabled={!isEditing}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateProfileData('introduction', { 
                                subjects: [...profileData.introduction.subjects, { subjectId: subject.id, levels: [] }] 
                              });
                            } else {
                              updateProfileData('introduction', { 
                                subjects: profileData.introduction.subjects.filter(s => s.subjectId !== subject.id) 
                              });
                            }
                          }}
                        />
                        <Label htmlFor={subject.id.toString()} className="text-sm">{subject.subjectName}</Label>
                      </div>
                    ))}
            </div>
          </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Ngày sinh</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={profileData.introduction.birthDate}
                      onChange={(e) => updateProfileData('introduction', { birthDate: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "text-gray-900 bg-gray-50" : ""}
                    />
          </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      value={profileData.introduction.phone}
                      onChange={(e) => updateProfileData('introduction', { phone: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "text-gray-900 bg-gray-50" : ""}
                    />
            </div>
                </div>

                <div className="space-y-2">
                  <Label>Phương thức giảng dạy</Label>
                  <RadioGroup 
                    value={profileData.introduction.teachingMode.toString()}
                    onValueChange={(value) => updateProfileData('introduction', { teachingMode: parseInt(value) })}
                    disabled={!isEditing}
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
                      <RadioGroupItem value="2" id="both" />
                      <Label htmlFor="both">Kết hợp</Label>
              </div>
                  </RadioGroup>
          </div>
        </CardContent>
      </Card>
          </TabsContent>

          {/* Tab 2: Photo */}
          <TabsContent value="photo">
            <Card>
        <CardHeader>
                <CardTitle>Ảnh đại diện</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                      {profileData.photo.profileImage ? (
                        <img 
                          src={profileData.photo.profileImage} 
                          alt="Profile" 
                          className="w-32 h-32 rounded-full object-cover"
                        />
                      ) : (
                        <Camera className="w-12 h-12 text-gray-400" />
            )}
          </div>
                  </div>
                <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Ảnh đại diện</h3>
                    <p className="text-sm text-gray-700 mt-1">
                      Tải lên ảnh đại diện để học viên có thể nhận diện bạn
                    </p>
                    {isEditing && (
                      <div className="mt-4">
                        <Button variant="outline" className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Tải lên ảnh
                    </Button>
                  </div>
                )}
              </div>
          </div>
        </CardContent>
      </Card>
          </TabsContent>

          {/* Tab 3: Certifications */}
          <TabsContent value="certifications">
            <Card>
        <CardHeader>
                <CardTitle>Chứng chỉ môn học</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {profileData.certifications.items.map((cert, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">Chứng chỉ {index + 1}</h4>
                          <p className="text-sm text-gray-700">
                            {certificateTypes.find(ct => ct.id === cert.certificateTypeId)?.name || `Loại ${cert.certificateTypeId}`}
                          </p>
                          <p className="text-xs text-gray-700">
                            Cấp ngày: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('vi-VN') : 'Không xác định'}
                          </p>
                          {cert.expiryDate && (
                            <p className="text-xs text-gray-700">
                              Hết hạn: {new Date(cert.expiryDate).toLocaleDateString('vi-VN')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {cert.certificateFile && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(cert.certificateFile, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {isEditing && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newItems = profileData.certifications.items.filter((_, i) => i !== index);
                                updateProfileData('certifications', { items: newItems });
                              }}
                            >
                              <X className="h-4 w-4" />
              </Button>
            )}
          </div>
                  </div>
                      {cert.certificateFile && (
                        <div className="mt-3">
                          <img 
                            src={cert.certificateFile} 
                            alt={`Chứng chỉ ${certificateTypes.find(ct => ct.id === cert.certificateTypeId)?.name || 'không xác định'}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                  </div>
                )}
              </div>
            ))}
                  
                  {isEditing && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newItems = [...profileData.certifications.items, {
                          id: Date.now().toString(),
                          subjectId: 1,
                          certificateTypeId: 1,
                          issueDate: '',
                          expiryDate: '',
                          certificateFile: null
                        }];
                        updateProfileData('certifications', { items: newItems });
                      }}
                    >
                <Plus className="h-4 w-4 mr-2" />
                Thêm chứng chỉ
              </Button>
            )}
          </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Education */}
          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle>Bằng cấp học vấn</CardTitle>
        </CardHeader>
              <CardContent className="space-y-6">
          <div className="space-y-4">
                  {profileData.education.items.map((edu, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                <div className="flex-1">
                          <h4 className="font-medium">Bằng cấp {index + 1}</h4>
                          <p className="text-sm text-gray-700">
                            {educationInstitutions.find(inst => inst.id === edu.institutionId)?.name || `Trường ${edu.institutionId}`}
                          </p>
                          <p className="text-xs text-gray-700">
                            Cấp ngày: {edu.issueDate ? new Date(edu.issueDate).toLocaleDateString('vi-VN') : 'Không xác định'}
                          </p>
                </div>
                  <div className="flex items-center space-x-2">
                          {edu.degreeFile && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(edu.degreeFile, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                    </Button>
                          )}
                          {isEditing && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newItems = profileData.education.items.filter((_, i) => i !== index);
                                updateProfileData('education', { items: newItems });
                              }}
                            >
                              <X className="h-4 w-4" />
                    </Button>
                          )}
                        </div>
                      </div>
                      {edu.degreeFile && (
                        <div className="mt-3">
                          <img 
                            src={edu.degreeFile} 
                            alt={`Bằng cấp ${educationInstitutions.find(inst => inst.id === edu.institutionId)?.name || 'không xác định'}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                  </div>
                )}
              </div>
            ))}
                  
                  {isEditing && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newItems = [...profileData.education.items, {
                          id: Date.now().toString(),
                          institutionId: 1,
                          issueDate: '',
                          degreeFile: null
                        }];
                        updateProfileData('education', { items: newItems });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm bằng cấp
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Description */}
          <TabsContent value="description">
            <Card>
              <CardHeader>
                <CardTitle>Mô tả bản thân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="attractiveTitle">Tiêu đề hấp dẫn</Label>
                  <Input
                    id="attractiveTitle"
                    value={profileData.description.attractiveTitle}
                    onChange={(e) => updateProfileData('description', { attractiveTitle: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "text-gray-900 bg-gray-50" : ""}
                    placeholder="Ví dụ: Gia sư Toán với 5 năm kinh nghiệm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="introduction">Giới thiệu bản thân</Label>
                  <Textarea
                    id="introduction"
                    className={`min-h-32 ${!isEditing ? "text-gray-900 bg-gray-50" : ""}`}
                    value={profileData.description.introduction}
                    onChange={(e) => updateProfileData('description', { introduction: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Giới thiệu về bản thân, kinh nghiệm giảng dạy..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teachingExperience">Kinh nghiệm giảng dạy</Label>
                  <Textarea
                    id="teachingExperience"
                    className={`min-h-32 ${!isEditing ? "text-gray-900 bg-gray-50" : ""}`}
                    value={profileData.description.teachingExperience}
                    onChange={(e) => updateProfileData('description', { teachingExperience: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Mô tả chi tiết về kinh nghiệm giảng dạy của bạn..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 6: Video */}
          <TabsContent value="video">
            <Card>
              <CardHeader>
                <CardTitle>Video giới thiệu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {profileData.video.hasVideo ? (
                    <div className="space-y-4">
                      <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                        <video 
                          src={profileData.video.videoFile || profileData.video.youtubeLink}
                          controls
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to YouTube link if video file fails
                            if (profileData.video.youtubeLink) {
                              e.currentTarget.src = profileData.video.youtubeLink;
                            }
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-900">Video giới thiệu của bạn</p>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có video giới thiệu</h3>
                      <p className="text-gray-700 mb-4">Tải lên video giới thiệu để tăng độ tin cậy</p>
                      {isEditing && (
                        <Button variant="outline" className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Tải lên video
                    </Button>
                      )}
                  </div>
                )}
          </div>
        </CardContent>
      </Card>
          </TabsContent>

          {/* Tab 7: Availability */}
          <TabsContent value="availability">
            <Card>
        <CardHeader>
                <CardTitle>Lịch khả dụng</CardTitle>
        </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Ngày bắt đầu</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={profileData.availability.startDate}
                      onChange={(e) => updateProfileData('availability', { startDate: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Ngày kết thúc</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={profileData.availability.endDate}
                      onChange={(e) => updateProfileData('availability', { endDate: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Lịch học trong tuần</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day) => (
                      <div key={day.id} className="text-center">
                        <div className="text-sm font-medium text-gray-700 mb-2">{day.short}</div>
                <div className="space-y-1">
                          {timeSlots.slice(0, 3).map((slot) => (
                            <div key={slot.id} className="text-xs text-gray-700">
                              {slot.startTime}
                            </div>
                  ))}
                </div>
              </div>
            ))}
                  </div>
          </div>
        </CardContent>
      </Card>
          </TabsContent>

          {/* Tab 8: Pricing */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Giá cả</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Giá cho từng môn học</Label>
                  {profileData.pricing.subjectPricing.map((pricing, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <Label>{subjects.find(s => s.id === pricing.subjectId)?.subjectName || `Môn ${pricing.subjectId}`}</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            className="pl-10 text-lg"
                            value={pricing.hourlyRate}
                            onChange={(e) => {
                              const newPricing = [...profileData.pricing.subjectPricing];
                              newPricing[index].hourlyRate = e.target.value;
                              updateProfileData('pricing', { subjectPricing: newPricing });
                            }}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      {isEditing && (
          <Button
            variant="outline"
                          size="sm"
                          onClick={() => {
                            const newPricing = profileData.pricing.subjectPricing.filter((_, i) => i !== index);
                            updateProfileData('pricing', { subjectPricing: newPricing });
                          }}
                        >
                          <X className="h-4 w-4" />
          </Button>
                      )}
                    </div>
                  ))}
                  
                  {isEditing && (
          <Button
                      variant="outline"
                      onClick={() => {
                        const newPricing = [...profileData.pricing.subjectPricing, { subjectId: 1, hourlyRate: '200000' }];
                        updateProfileData('pricing', { subjectPricing: newPricing });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm môn học
          </Button>
                  )}
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Lưu ý về giá cả</h4>
                  <div className="text-sm text-yellow-800 space-y-1">
                    <div>• EduMatch sẽ trích 10% phí dịch vụ từ mỗi buổi học</div>
                    <div>• Giá bạn đặt là giá học viên sẽ trả (đã bao gồm phí dịch vụ)</div>
                    <div>• Bạn có thể thay đổi giá bất cứ lúc nào</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
    </div>
  );
}