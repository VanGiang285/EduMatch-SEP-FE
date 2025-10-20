"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Badge } from '@/components/ui/basic/badge';
import { GraduationCap, BookOpen, Award, DollarSign, MapPin, Clock, Edit, Plus, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { useCustomToast } from '@/hooks/useCustomToast';

// Mock data - in real app, this would come from API
const mockTutorProfile = {
  id: 1,
  bio: 'Tôi là một gia sư có kinh nghiệm 5 năm trong việc giảng dạy Toán và Vật lý. Tôi đã giúp nhiều học sinh đạt được kết quả tốt trong các kỳ thi quan trọng.',
  subjects: [
    { id: 1, name: 'Toán học', level: 'Lớp 10-12', hourlyRate: 200000 },
    { id: 2, name: 'Vật lý', level: 'Lớp 10-12', hourlyRate: 250000 },
    { id: 3, name: 'Hóa học', level: 'Lớp 10-11', hourlyRate: 180000 }
  ],
  education: [
    {
      id: 1,
      institution: 'Đại học Bách Khoa Hà Nội',
      degree: 'Cử nhân Kỹ thuật',
      year: '2018',
      verified: true
    },
    {
      id: 2,
      institution: 'Đại học Sư phạm Hà Nội',
      degree: 'Thạc sĩ Giáo dục',
      year: '2020',
      verified: true
    }
  ],
  certificates: [
    {
      id: 1,
      name: 'Chứng chỉ sư phạm',
      issuer: 'Bộ Giáo dục và Đào tạo',
      year: '2019',
      verified: true
    },
    {
      id: 2,
      name: 'Chứng chỉ IELTS 8.0',
      issuer: 'British Council',
      year: '2021',
      verified: true
    }
  ],
  experience: 5,
  teachingModes: ['online', 'offline'],
  availability: {
    monday: ['14:00-17:00', '19:00-21:00'],
    tuesday: ['14:00-17:00', '19:00-21:00'],
    wednesday: ['14:00-17:00', '19:00-21:00'],
    thursday: ['14:00-17:00', '19:00-21:00'],
    friday: ['14:00-17:00', '19:00-21:00'],
    saturday: ['09:00-12:00', '14:00-17:00'],
    sunday: ['09:00-12:00']
  },
  location: {
    province: 'Hà Nội',
    district: 'Cầu Giấy',
    address: 'Số 1 Đại Cồ Việt, Hai Bà Trưng'
  }
};

export default function TeachingProfilePage() {
  const [profile, setProfile] = useState(mockTutorProfile);
  const [editing, setEditing] = useState(false);
  const { showSuccess, showError } = useCustomToast();

  const handleSaveProfile = () => {
    // TODO: Implement save profile API call
    showSuccess('Cập nhật profile gia sư thành công');
    setEditing(false);
  };

  const getVerificationColor = (verified: boolean) => {
    return verified 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getVerificationLabel = (verified: boolean) => {
    return verified ? 'Đã xác minh' : 'Chờ xác minh';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[#FD8B51] p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <GraduationCap className="h-8 w-8 mr-3 text-[#257180]" />
              Profile gia sư
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý thông tin chuyên môn và kinh nghiệm giảng dạy
            </p>
          </div>
          <Button
            onClick={() => setEditing(!editing)}
            variant="outline"
            className="border-[#FD8B51] text-[#257180] hover:bg-[#F2E5BF]"
          >
            <Edit className="h-4 w-4 mr-2" />
            {editing ? 'Hủy' : 'Chỉnh sửa'}
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-[#257180]" />
            Thông tin cơ bản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Giới thiệu bản thân</label>
            {editing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                rows={4}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#257180] focus:border-transparent"
                placeholder="Viết giới thiệu về bản thân và kinh nghiệm giảng dạy..."
              />
            ) : (
              <p className="text-sm text-gray-900 mt-1">{profile.bio}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Kinh nghiệm giảng dạy</label>
              {editing ? (
                <input
                  type="number"
                  value={profile.experience}
                  onChange={(e) => setProfile({...profile, experience: parseInt(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#257180] focus:border-transparent"
                />
              ) : (
                <p className="text-sm text-gray-900 mt-1">{profile.experience} năm</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Phương thức giảng dạy</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.teachingModes.map((mode, index) => (
                  <Badge key={index} className="bg-blue-100 text-blue-800 border border-blue-200">
                    {mode === 'online' ? 'Online' : 'Offline'}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
            <div className="flex items-center text-sm text-gray-900 mt-1">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{profile.location.address}, {profile.location.district}, {profile.location.province}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-[#257180]" />
              Môn học giảng dạy
            </CardTitle>
            {editing && (
              <Button size="sm" className="bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Thêm môn
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profile.subjects.map((subject) => (
              <div key={subject.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                    <Badge className="bg-green-100 text-green-800 border border-green-200">
                      {subject.level}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>{subject.hourlyRate.toLocaleString('vi-VN')} VND/giờ</span>
                  </div>
                </div>
                {editing && (
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-[#257180]" />
              Học vấn
            </CardTitle>
            {editing && (
              <Button size="sm" className="bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Thêm học vấn
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profile.education.map((edu) => (
              <div key={edu.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                    <Badge className={getVerificationColor(edu.verified)}>
                      {getVerificationLabel(edu.verified)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{edu.institution}</p>
                  <p className="text-sm text-gray-500">Năm tốt nghiệp: {edu.year}</p>
                </div>
                {editing && (
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Tải chứng chỉ
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certificates */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Award className="h-5 w-5 mr-2 text-[#257180]" />
              Chứng chỉ & Bằng cấp
            </CardTitle>
            {editing && (
              <Button size="sm" className="bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Thêm chứng chỉ
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profile.certificates.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{cert.name}</h3>
                    <Badge className={getVerificationColor(cert.verified)}>
                      {getVerificationLabel(cert.verified)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{cert.issuer}</p>
                  <p className="text-sm text-gray-500">Năm cấp: {cert.year}</p>
                </div>
                {editing && (
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Tải chứng chỉ
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-[#257180]" />
            Lịch rảnh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(profile.availability).map(([day, times]) => (
              <div key={day} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 capitalize mb-2">
                  {day === 'monday' ? 'Thứ 2' :
                   day === 'tuesday' ? 'Thứ 3' :
                   day === 'wednesday' ? 'Thứ 4' :
                   day === 'thursday' ? 'Thứ 5' :
                   day === 'friday' ? 'Thứ 6' :
                   day === 'saturday' ? 'Thứ 7' : 'Chủ nhật'}
                </h3>
                <div className="space-y-1">
                  {times.map((time, index) => (
                    <Badge key={index} className="bg-blue-100 text-blue-800 border border-blue-200">
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {editing && (
        <div className="flex justify-end space-x-3">
          <Button
            onClick={() => setEditing(false)}
            variant="outline"
            className="border-gray-300 text-gray-700"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSaveProfile}
            className="bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white"
          >
            Lưu thay đổi
          </Button>
        </div>
      )}
    </div>
  );
}


