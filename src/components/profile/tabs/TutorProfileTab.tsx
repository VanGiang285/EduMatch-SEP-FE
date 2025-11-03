"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Textarea } from '@/components/ui/form/textarea';
import { Badge } from '@/components/ui/basic/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Checkbox } from '@/components/ui/form/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { Separator } from '@/components/ui/layout/separator';
import { Alert, AlertDescription } from '@/components/ui/feedback/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/feedback/dialog';
import { 
  Upload, 
  User,
  Star,
  MapPin,
  Edit3,
  Save,
  X,
  Info,
  GraduationCap,
  FileText,
  Video,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Eye
} from 'lucide-react';

// Types dựa trên database schema
interface TutorEducation {
  id: number;
  institutionId: number;
  institutionName: string;
  institutionType: number; // 0=Trung cấp, 1=CĐ, 2=ĐH, 3=Khác
  issueDate: string;
  certificateUrl?: string;
  verified: number; // 0=Chờ duyệt, 1=Đã xác minh, 2=Bị từ chối
  rejectReason?: string;
}

interface TutorCertificate {
  id: number;
  certificateTypeId: number;
  certificateName: string;
  subjectName?: string;
  issueDate: string;
  expiryDate?: string;
  certificateUrl?: string;
  verified: number; // 0=Chờ duyệt, 1=Đã xác minh, 2=Bị từ chối
  rejectReason?: string;
}

interface TutorSubject {
  id: number;
  subjectId: number;
  subjectName: string;
  levelId?: number;
  levelName?: string;
  hourlyRate: number;
}

export function TutorProfileTab() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Modal states
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  
  const [profileData, setProfileData] = useState({
    // Thông tin cơ bản từ user_profiles
    basic: {
      firstName: 'Minh',
      lastName: 'Nguyễn Thị',
      email: 'minh.nguyen@email.com',
      phone: '0901234567',
      dob: '1990-05-15',
      gender: 2, // 0=Không xác định, 1=Nam, 2=Nữ
      cityId: 1,
      cityName: 'Hà Nội',
      subDistrictId: 1,
      subDistrictName: 'Quận Ba Đình',
      addressLine: 'Số 123, Đường ABC',
      avatarUrl: '',
    },
    // Thông tin gia sư từ tutor_profiles
    tutorProfile: {
      bio: 'Tôi là một gia sư toán học đam mê với hơn 5 năm kinh nghiệm giúp học sinh đạt được mục tiêu học tập. Tôi chuyên biến những khái niệm toán học phức tạp thành dễ hiểu thông qua các ví dụ thực tế và phương pháp học tương tác.',
      teachingExp: 'Với 5 năm kinh nghiệm giảng dạy, tôi đã giúp hơn 200 học sinh cải thiện điểm số toán. Phương pháp của tôi tập trung vào việc xây dựng nền tảng vững chắc và áp dụng kiến thức vào thực tế.',
      videoIntroUrl: 'https://youtube.com/watch?v=sample123',
      teachingModes: 2, // 0=Offline, 1=Online, 2=Cả hai
      status: 1, // 0=Chờ duyệt, 1=Đã duyệt, 2=Bị từ chối
    },
    // Học vấn từ tutor_education
    educations: [
      {
        id: 1,
        institutionId: 1,
        institutionName: 'Đại học Quốc gia Hà Nội',
        institutionType: 2, // ĐH
        issueDate: '2020-06-15',
        verified: 1,
      },
      {
        id: 2,
        institutionId: 2,
        institutionName: 'Đại học Bách Khoa Hà Nội',
        institutionType: 2,
        issueDate: '2018-06-15',
        verified: 1,
      }
    ] as TutorEducation[],
    // Chứng chỉ từ tutor_certificates
    certificates: [
      {
        id: 1,
        certificateTypeId: 1,
        certificateName: 'Chứng chỉ giảng dạy quốc tế TESOL',
        subjectName: 'Tiếng Anh',
        issueDate: '2019-08-20',
        expiryDate: '2024-08-20',
        verified: 1,
      },
      {
        id: 2,
        certificateTypeId: 2,
        certificateName: 'Chứng chỉ Giáo viên dạy giỏi',
        issueDate: '2021-03-10',
        verified: 1,
      }
    ] as TutorCertificate[],
    // Môn học từ tutor_subjects
    subjects: [
      {
        id: 1,
        subjectId: 1,
        subjectName: 'Toán học',
        levelId: 10,
        levelName: 'Lớp 10',
        hourlyRate: 200000,
      },
      {
        id: 2,
        subjectId: 1,
        subjectName: 'Toán học',
        levelId: 8,
        levelName: 'Lớp 8',
        hourlyRate: 150000,
      }
    ] as TutorSubject[],
    // Lịch khả dụng từ tutor_availabilities
    availabilities: {
      monday: [
        { slotId: 1, startTime: '08:00', endTime: '09:00', status: 0 },
        { slotId: 2, startTime: '09:00', endTime: '10:00', status: 0 },
        { slotId: 3, startTime: '14:00', endTime: '15:00', status: 1 },
      ],
      tuesday: [
        { slotId: 4, startTime: '08:00', endTime: '09:00', status: 0 },
        { slotId: 5, startTime: '10:00', endTime: '11:00', status: 0 },
      ],
      wednesday: [
        { slotId: 6, startTime: '08:00', endTime: '09:00', status: 0 },
        { slotId: 7, startTime: '14:00', endTime: '15:00', status: 0 },
      ],
      thursday: [
        { slotId: 8, startTime: '08:00', endTime: '09:00', status: 2 },
        { slotId: 9, startTime: '15:00', endTime: '16:00', status: 0 },
      ],
      friday: [
        { slotId: 10, startTime: '08:00', endTime: '09:00', status: 0 },
        { slotId: 11, startTime: '09:00', endTime: '10:00', status: 0 },
      ],
      saturday: [],
      sunday: [],
    },
  });

  // Form states for modals
  const [newEducation, setNewEducation] = useState({
    institutionName: '',
    institutionType: 2,
    issueDate: '',
    certificateFile: null as File | null,
  });

  const [newCertificate, setNewCertificate] = useState({
    certificateName: '',
    subjectName: '',
    issueDate: '',
    expiryDate: '',
    certificateFile: null as File | null,
  });

  const [newSubject, setNewSubject] = useState({
    subjectName: '',
    levelName: '',
    hourlyRate: '',
  });

  const [newTimeSlot, setNewTimeSlot] = useState({
    dayOfWeek: 'monday',
    startTime: '',
    endTime: '',
  });

  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);

  const subjects = [
    'Toán học', 'Vật lý', 'Hóa học', 'Sinh học', 'Tiếng Anh', 'Tiếng Pháp',
    'Văn học', 'Lịch sử', 'Địa lý', 'Tin học', 'Lập trình', 'Kinh tế'
  ];

  const levels = [
    'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6',
    'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'
  ];

  const cities = [
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Biên Hòa',
    'Hải Dương', 'Thủ Dầu Một', 'Nam Định', 'Quy Nhơn'
  ];

  const institutionTypes = [
    { value: 0, label: 'Trung cấp' },
    { value: 1, label: 'Cao đẳng' },
    { value: 2, label: 'Đại học' },
    { value: 3, label: 'Khác' },
  ];

  const genders = [
    { value: 0, label: 'Không xác định' },
    { value: 1, label: 'Nam' },
    { value: 2, label: 'Nữ' },
    { value: 3, label: 'Giới tính khác' },
  ];

  const verifyStatusColors = (status: number) => {
    switch(status) {
      case 0: return 'bg-yellow-100 text-yellow-800';
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const verifyStatusText = (status: number) => {
    switch(status) {
      case 0: return 'Chờ duyệt';
      case 1: return 'Đã xác minh';
      case 2: return 'Bị từ chối';
      default: return 'Không xác định';
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + '₫';
  };

  const handleSave = () => {
    console.log('Profile updated:', profileData);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const updateProfileData = (section: string, data: any) => {
    setProfileData(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], ...data }
    }));
  };

  // Handlers for education
  const handleAddEducation = () => {
    const education: TutorEducation = {
      id: Date.now(),
      institutionId: 0,
      institutionName: newEducation.institutionName,
      institutionType: newEducation.institutionType,
      issueDate: newEducation.issueDate,
      verified: 0, // Chờ duyệt
    };
    setProfileData(prev => ({
      ...prev,
      educations: [...prev.educations, education]
    }));
    setShowEducationModal(false);
    setNewEducation({
      institutionName: '',
      institutionType: 2,
      issueDate: '',
      certificateFile: null,
    });
  };

  const handleDeleteEducation = (id: number) => {
    setProfileData(prev => ({
      ...prev,
      educations: prev.educations.filter(e => e.id !== id)
    }));
  };

  // Handlers for certificate
  const handleAddCertificate = () => {
    const certificate: TutorCertificate = {
      id: Date.now(),
      certificateTypeId: 0,
      certificateName: newCertificate.certificateName,
      subjectName: newCertificate.subjectName,
      issueDate: newCertificate.issueDate,
      expiryDate: newCertificate.expiryDate || undefined,
      verified: 0, // Chờ duyệt
    };
    setProfileData(prev => ({
      ...prev,
      certificates: [...prev.certificates, certificate]
    }));
    setShowCertificateModal(false);
    setNewCertificate({
      certificateName: '',
      subjectName: '',
      issueDate: '',
      expiryDate: '',
      certificateFile: null,
    });
  };

  const handleDeleteCertificate = (id: number) => {
    setProfileData(prev => ({
      ...prev,
      certificates: prev.certificates.filter(c => c.id !== id)
    }));
  };

  // Handlers for subject
  const handleAddSubject = () => {
    const subject: TutorSubject = {
      id: Date.now(),
      subjectId: 0,
      subjectName: newSubject.subjectName,
      levelId: 0,
      levelName: newSubject.levelName,
      hourlyRate: parseFloat(newSubject.hourlyRate),
    };
    setProfileData(prev => ({
      ...prev,
      subjects: [...prev.subjects, subject]
    }));
    setShowSubjectModal(false);
    setNewSubject({
      subjectName: '',
      levelName: '',
      hourlyRate: '',
    });
  };

  const handleDeleteSubject = (id: number) => {
    setProfileData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id)
    }));
  };

  // Handlers for time slots
  const handleAddTimeSlot = () => {
    const newSlot = {
      slotId: Date.now(),
      startTime: newTimeSlot.startTime,
      endTime: newTimeSlot.endTime,
      status: 0, // Trống
    };
    
    setProfileData(prev => ({
      ...prev,
      availabilities: {
        ...prev.availabilities,
        [newTimeSlot.dayOfWeek]: [
          ...prev.availabilities[newTimeSlot.dayOfWeek as keyof typeof prev.availabilities],
          newSlot
        ]
      }
    }));
    
    setShowTimeSlotModal(false);
    setNewTimeSlot({
      dayOfWeek: 'monday',
      startTime: '',
      endTime: '',
    });
  };

  const handleDeleteTimeSlot = (dayKey: string, slotId: number) => {
    setProfileData(prev => ({
      ...prev,
      availabilities: {
        ...prev.availabilities,
        [dayKey]: prev.availabilities[dayKey as keyof typeof prev.availabilities].filter(
          (slot: any) => slot.slotId !== slotId
        )
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Hồ sơ gia sư</h2>
          <p className="text-gray-600 mt-1">Quản lý thông tin hồ sơ gia sư của bạn</p>
        </div>
        <div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} size="lg" className="bg-[#257180] hover:bg-[#257180]/90 text-white">
              <Edit3 className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>
              <Button onClick={handleSave} size="lg" className="bg-[#257180] hover:bg-[#257180]/90 text-white">
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Success Alert */}
      {saveSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Cập nhật hồ sơ gia sư thành công!
          </AlertDescription>
        </Alert>
      )}

      {/* Status Alert */}
      <Alert className={profileData.tutorProfile.status === 1 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}>
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          {profileData.tutorProfile.status === 0 && 'Hồ sơ gia sư của bạn đang chờ duyệt.'}
          {profileData.tutorProfile.status === 1 && 'Hồ sơ gia sư của bạn đã được xác minh và công khai.'}
          {profileData.tutorProfile.status === 2 && 'Hồ sơ gia sư của bạn đã bị từ chối.'}
        </AlertDescription>
      </Alert>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="description">Mô tả</TabsTrigger>
          <TabsTrigger value="education">Học vấn</TabsTrigger>
          <TabsTrigger value="certificates">Chứng chỉ</TabsTrigger>
          <TabsTrigger value="subjects">Môn học & Giá</TabsTrigger>
          <TabsTrigger value="availability">Lịch khả dụng</TabsTrigger>
        </TabsList>

        {/* Tab: Thông tin cơ bản */}
        <TabsContent value="basic" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <User className="h-5 w-5" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
                <div>
                  <Button disabled={!isEditing} variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Tải ảnh lên
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">JPG, PNG. Tối đa 5MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">Họ và tên đệm</Label>
                  <Input
                    id="lastName"
                    value={profileData.basic.lastName}
                    onChange={(e) => updateProfileData('basic', { lastName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">Tên</Label>
                  <Input
                    id="firstName"
                    value={profileData.basic.firstName}
                    onChange={(e) => updateProfileData('basic', { firstName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.basic.email}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={profileData.basic.phone}
                    onChange={(e) => updateProfileData('basic', { phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Ngày sinh</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={profileData.basic.dob}
                    onChange={(e) => updateProfileData('basic', { dob: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Giới tính</Label>
                  <Select 
                    value={profileData.basic.gender.toString()}
                    onValueChange={(value) => updateProfileData('basic', { gender: parseInt(value) })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map((gender) => (
                        <SelectItem key={gender.value} value={gender.value.toString()}>
                          {gender.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Địa chỉ</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Tỉnh/Thành phố</Label>
                    <Select 
                      value={profileData.basic.cityName}
                      onValueChange={(value) => updateProfileData('basic', { cityName: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subDistrict">Quận/Huyện</Label>
                    <Input
                      id="subDistrict"
                      value={profileData.basic.subDistrictName}
                      onChange={(e) => updateProfileData('basic', { subDistrictName: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Ví dụ: Quận Ba Đình"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine">Địa chỉ chi tiết</Label>
                  <Input
                    id="addressLine"
                    value={profileData.basic.addressLine}
                    onChange={(e) => updateProfileData('basic', { addressLine: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Số nhà, tên đường..."
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Hình thức dạy học</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="offline" 
                      checked={profileData.tutorProfile.teachingModes === 0 || profileData.tutorProfile.teachingModes === 2}
                      onCheckedChange={(checked) => {
                        const current = profileData.tutorProfile.teachingModes;
                        let newMode = current;
                        if (checked) {
                          newMode = current === 1 ? 2 : 0;
                        } else {
                          newMode = current === 2 ? 1 : current;
                        }
                        updateProfileData('tutorProfile', { teachingModes: newMode });
                      }}
                      disabled={!isEditing}
                    />
                    <Label htmlFor="offline">Tại nhà</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="online" 
                      checked={profileData.tutorProfile.teachingModes === 1 || profileData.tutorProfile.teachingModes === 2}
                      onCheckedChange={(checked) => {
                        const current = profileData.tutorProfile.teachingModes;
                        let newMode = current;
                        if (checked) {
                          newMode = current === 0 ? 2 : 1;
                        } else {
                          newMode = current === 2 ? 0 : current;
                        }
                        updateProfileData('tutorProfile', { teachingModes: newMode });
                      }}
                      disabled={!isEditing}
                    />
                    <Label htmlFor="online">Trực tuyến</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Mô tả */}
        <TabsContent value="description" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <FileText className="h-5 w-5" />
                Giới thiệu bản thân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Mô tả chung</Label>
                <p className="text-sm text-gray-600">Giới thiệu về bản thân, đam mê và triết lý giảng dạy của bạn</p>
                <Textarea
                  id="bio"
                  className="min-h-32"
                  value={profileData.tutorProfile.bio}
                  onChange={(e) => updateProfileData('tutorProfile', { bio: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Hãy chia sẻ về bản thân bạn..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teachingExp">Kinh nghiệm giảng dạy</Label>
                <p className="text-sm text-gray-600">Mô tả kinh nghiệm giảng dạy, thành tích và kết quả đạt được</p>
                <Textarea
                  id="teachingExp"
                  className="min-h-32"
                  value={profileData.tutorProfile.teachingExp}
                  onChange={(e) => updateProfileData('tutorProfile', { teachingExp: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Chia sẻ kinh nghiệm giảng dạy của bạn..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Video className="h-5 w-5" />
                Video giới thiệu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="videoIntroUrl">Đường dẫn YouTube</Label>
                <p className="text-sm text-gray-600">Video giới thiệu giúp học viên hiểu rõ hơn về phong cách dạy của bạn</p>
                <Input
                  id="videoIntroUrl"
                  value={profileData.tutorProfile.videoIntroUrl}
                  onChange={(e) => updateProfileData('tutorProfile', { videoIntroUrl: e.target.value })}
                  disabled={!isEditing}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <Button disabled={!isEditing} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Tải video lên
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Học vấn */}
        <TabsContent value="education" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <GraduationCap className="h-5 w-5" />
                  Học vấn
                </CardTitle>
                <Button 
                  onClick={() => setShowEducationModal(true)}
                  disabled={!isEditing}
                  size="lg"
                  className="bg-[#257180] hover:bg-[#257180]/90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm học vấn
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData.educations.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Chưa có thông tin học vấn</p>
              ) : (
                profileData.educations.map((edu) => (
                  <div key={edu.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex gap-3 flex-1">
                      <GraduationCap className="w-5 h-5 text-[#257180] mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{edu.institutionName}</h4>
                          <Badge className={verifyStatusColors(edu.verified)}>
                            {verifyStatusText(edu.verified)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {institutionTypes.find(t => t.value === edu.institutionType)?.label}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Ngày cấp bằng: {new Date(edu.issueDate).toLocaleDateString('vi-VN')}
                        </p>
                        {edu.rejectReason && (
                          <Alert className="mt-2 bg-red-50 border-red-200">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800 text-sm">
                              Lý do từ chối: {edu.rejectReason}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                    {isEditing && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Chứng chỉ */}
        <TabsContent value="certificates" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <FileText className="h-5 w-5" />
                  Chứng chỉ
                </CardTitle>
                <Button 
                  onClick={() => setShowCertificateModal(true)}
                  disabled={!isEditing}
                  size="lg"
                  className="bg-[#257180] hover:bg-[#257180]/90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm chứng chỉ
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData.certificates.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Chưa có chứng chỉ</p>
              ) : (
                profileData.certificates.map((cert) => (
                  <div key={cert.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex gap-3 flex-1">
                      <FileText className="w-5 h-5 text-[#257180] mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{cert.certificateName}</h4>
                          <Badge className={verifyStatusColors(cert.verified)}>
                            {verifyStatusText(cert.verified)}
                          </Badge>
                        </div>
                        {cert.subjectName && (
                          <p className="text-sm text-gray-600">Môn: {cert.subjectName}</p>
                        )}
                        <div className="text-sm text-gray-600 mt-1">
                          <p>Ngày cấp: {new Date(cert.issueDate).toLocaleDateString('vi-VN')}</p>
                          {cert.expiryDate && (
                            <p>Hết hạn: {new Date(cert.expiryDate).toLocaleDateString('vi-VN')}</p>
                          )}
                        </div>
                        {cert.rejectReason && (
                          <Alert className="mt-2 bg-red-50 border-red-200">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800 text-sm">
                              Lý do từ chối: {cert.rejectReason}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                    {isEditing && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteCertificate(cert.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Môn học & Giá */}
        <TabsContent value="subjects" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <DollarSign className="h-5 w-5" />
                  Môn học & Giá dạy
                </CardTitle>
                <Button 
                  onClick={() => setShowSubjectModal(true)}
                  disabled={!isEditing}
                  size="lg"
                  className="bg-[#257180] hover:bg-[#257180]/90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm môn học
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData.subjects.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Chưa có môn học</p>
              ) : (
                profileData.subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{subject.subjectName}</h4>
                        {subject.levelName && (
                          <Badge variant="secondary">{subject.levelName}</Badge>
                        )}
                      </div>
                      <p className="text-[#257180] font-semibold mt-1">
                        {formatCurrency(subject.hourlyRate)}/slot
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">1 slot = 1 giờ</p>
                    </div>
                    {isEditing && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Lịch khả dụng */}
        <TabsContent value="availability" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Calendar className="h-5 w-5" />
                Lịch khả dụng trong tuần
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  Quản lý lịch rảnh của bạn. Học viên sẽ dựa vào lịch này để đặt buổi học.
                </AlertDescription>
              </Alert>

              {[
                { key: 'monday', label: 'Thứ Hai' },
                { key: 'tuesday', label: 'Thứ Ba' },
                { key: 'wednesday', label: 'Thứ Tư' },
                { key: 'thursday', label: 'Thứ Năm' },
                { key: 'friday', label: 'Thứ Sáu' },
                { key: 'saturday', label: 'Thứ Bảy' },
                { key: 'sunday', label: 'Chủ Nhật' },
              ].map((day) => {
                const daySlots = profileData.availabilities[day.key as keyof typeof profileData.availabilities] || [];
                return (
                  <div key={day.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{day.label}</h4>
                      {isEditing && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-[#257180] border-[#257180] hover:bg-[#257180] hover:text-white"
                          onClick={() => {
                            setNewTimeSlot({ ...newTimeSlot, dayOfWeek: day.key });
                            setShowTimeSlotModal(true);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Thêm khung giờ
                        </Button>
                      )}
                    </div>
                    
                    {daySlots.length === 0 ? (
                      <p className="text-sm text-gray-600 italic">Chưa có khung giờ nào</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {daySlots.map((slot: any) => {
                          let statusColor = 'bg-green-50 border-green-200 text-green-800';
                          let statusText = 'Trống';
                          if (slot.status === 1) {
                            statusColor = 'bg-yellow-50 border-yellow-200 text-yellow-800';
                            statusText = 'Đã đặt';
                          } else if (slot.status === 2) {
                            statusColor = 'bg-blue-50 border-blue-200 text-blue-800';
                            statusText = 'Có lịch học';
                          }
                          
                          return (
                            <div 
                              key={slot.slotId} 
                              className={`flex items-center justify-between p-3 rounded-lg border border-gray-200 ${statusColor}`}
                            >
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {slot.startTime} - {slot.endTime}
                                </p>
                                <p className="text-xs mt-0.5">{statusText}</p>
                              </div>
                              {isEditing && slot.status === 0 && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-red-100"
                                  onClick={() => handleDeleteTimeSlot(day.key, slot.slotId)}
                                >
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal: Thêm học vấn */}
      <Dialog open={showEducationModal} onOpenChange={setShowEducationModal}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Thêm học vấn</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="institutionName">Tên trường</Label>
              <Input
                id="institutionName"
                value={newEducation.institutionName}
                onChange={(e) => setNewEducation({ ...newEducation, institutionName: e.target.value })}
                placeholder="Ví dụ: Đại học Quốc gia Hà Nội"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institutionType">Loại trường</Label>
              <Select 
                value={newEducation.institutionType.toString()}
                onValueChange={(value) => setNewEducation({ ...newEducation, institutionType: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {institutionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value.toString()}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eduIssueDate">Ngày cấp bằng</Label>
              <Input
                id="eduIssueDate"
                type="date"
                value={newEducation.issueDate}
                onChange={(e) => setNewEducation({ ...newEducation, issueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eduCertFile">Tải lên bằng cấp (PDF, JPG, PNG)</Label>
              <Input
                id="eduCertFile"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setNewEducation({ ...newEducation, certificateFile: e.target.files?.[0] || null })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEducationModal(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleAddEducation}
              disabled={!newEducation.institutionName || !newEducation.issueDate}
              size="lg"
              className="bg-[#257180] hover:bg-[#257180]/90 text-white"
            >
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Thêm chứng chỉ */}
      <Dialog open={showCertificateModal} onOpenChange={setShowCertificateModal}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Thêm chứng chỉ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="certificateName">Tên chứng chỉ</Label>
              <Input
                id="certificateName"
                value={newCertificate.certificateName}
                onChange={(e) => setNewCertificate({ ...newCertificate, certificateName: e.target.value })}
                placeholder="Ví dụ: Chứng chỉ TESOL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certSubjectName">Môn học (tùy chọn)</Label>
              <Select 
                value={newCertificate.subjectName}
                onValueChange={(value) => setNewCertificate({ ...newCertificate, subjectName: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certIssueDate">Ngày cấp</Label>
                <Input
                  id="certIssueDate"
                  type="date"
                  value={newCertificate.issueDate}
                  onChange={(e) => setNewCertificate({ ...newCertificate, issueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certExpiryDate">Ngày hết hạn</Label>
                <Input
                  id="certExpiryDate"
                  type="date"
                  value={newCertificate.expiryDate}
                  onChange={(e) => setNewCertificate({ ...newCertificate, expiryDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="certFile">Tải lên chứng chỉ (PDF, JPG, PNG)</Label>
              <Input
                id="certFile"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setNewCertificate({ ...newCertificate, certificateFile: e.target.files?.[0] || null })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCertificateModal(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleAddCertificate}
              disabled={!newCertificate.certificateName || !newCertificate.issueDate}
              size="lg"
              className="bg-[#257180] hover:bg-[#257180]/90 text-white"
            >
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Thêm môn học */}
      <Dialog open={showSubjectModal} onOpenChange={setShowSubjectModal}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Thêm môn học</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subjectName">Môn học</Label>
              <Select 
                value={newSubject.subjectName}
                onValueChange={(value) => setNewSubject({ ...newSubject, subjectName: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="levelName">Cấp độ</Label>
              <Select 
                value={newSubject.levelName}
                onValueChange={(value) => setNewSubject({ ...newSubject, levelName: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cấp độ" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Giá mỗi slot (₫)</Label>
              <p className="text-xs text-gray-500">1 slot = 1 giờ</p>
              <Input
                id="hourlyRate"
                type="number"
                value={newSubject.hourlyRate}
                onChange={(e) => setNewSubject({ ...newSubject, hourlyRate: e.target.value })}
                placeholder="200000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubjectModal(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleAddSubject}
              disabled={!newSubject.subjectName || !newSubject.levelName || !newSubject.hourlyRate}
              size="lg"
              className="bg-[#257180] hover:bg-[#257180]/90 text-white"
            >
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Thêm khung giờ */}
      <Dialog open={showTimeSlotModal} onOpenChange={setShowTimeSlotModal}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Thêm khung giờ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Ngày trong tuần</Label>
              <Select 
                value={newTimeSlot.dayOfWeek}
                onValueChange={(value) => setNewTimeSlot({ ...newTimeSlot, dayOfWeek: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Thứ Hai</SelectItem>
                  <SelectItem value="tuesday">Thứ Ba</SelectItem>
                  <SelectItem value="wednesday">Thứ Tư</SelectItem>
                  <SelectItem value="thursday">Thứ Năm</SelectItem>
                  <SelectItem value="friday">Thứ Sáu</SelectItem>
                  <SelectItem value="saturday">Thứ Bảy</SelectItem>
                  <SelectItem value="sunday">Chủ Nhật</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Giờ bắt đầu</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newTimeSlot.startTime}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Giờ kết thúc</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newTimeSlot.endTime}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, endTime: e.target.value })}
                />
              </div>
            </div>
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                Mỗi khung giờ tương ứng với 1 slot (1 giờ học). Ví dụ: 08:00 - 09:00
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimeSlotModal(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleAddTimeSlot}
              disabled={!newTimeSlot.startTime || !newTimeSlot.endTime}
              size="lg"
              className="bg-[#257180] hover:bg-[#257180]/90 text-white"
            >
              Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
