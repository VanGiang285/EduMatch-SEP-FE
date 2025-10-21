"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit } from 'lucide-react';
import { Button } from '@/components/ui/basic/button';
import { Badge } from '@/components/ui/basic/badge';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserProfileService } from '@/services/userProfileService';
import { useCustomToast } from '@/hooks/useCustomToast';

export default function ProfilePage() {
  const { user } = useAuth();
  const { showError } = useCustomToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.email) return;
      
      try {
        setLoading(true);
        const response = await UserProfileService.getUserProfileByEmail(user.email);
        
        if (response.success && response.data) {
          setProfile(response.data);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        showError('Không thể tải thông tin profile');
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [user?.email]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-[#FD8B51] p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[#FD8B51] p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <User className="h-8 w-8 mr-3 text-[#257180]" />
              Thông tin cá nhân
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý thông tin cá nhân và cài đặt tài khoản
            </p>
          </div>
          <Button className="bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white">
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
                    <div className="text-center">
              <div className="h-24 w-24 rounded-full bg-[#F2E5BF] flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-medium text-[#257180]">
                  JD
                </span>
                    </div>
              <h3 className="text-xl font-semibold text-gray-900">{profile?.userName || 'Chưa cập nhật'}</h3>
              <p className="text-gray-600">Học viên</p>
              <div className="mt-4">
                <Badge className="bg-green-100 text-green-800 border border-green-200">
                  Đang hoạt động
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2 border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Thông tin cá nhân</CardTitle>
                  </CardHeader>
          <CardContent>
            <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{profile?.userEmail || 'Chưa cập nhật'}</p>
                      </div>
                    </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Số điện thoại</p>
                    <p className="text-sm text-gray-600">{profile?.phone || 'Chưa cập nhật'}</p>
                        </div>
                      </div>
                      
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Địa chỉ</p>
                    <p className="text-sm text-gray-600">
                      {profile?.addressLine || 'Chưa cập nhật'}
                      {profile?.province?.name && `, ${profile.province.name}`}
                      {profile?.subDistrict?.name && `, ${profile.subDistrict.name}`}
                    </p>
                      </div>
                    </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ngày sinh</p>
                    <p className="text-sm text-gray-600">
                      {profile?.dob ? new Date(profile.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                    </p>
                        </div>
                      </div>
                    </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Giới thiệu bản thân</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {profile?.bio || 'Chưa có giới thiệu về bản thân'}
                </p>
              </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Tài khoản</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Trạng thái tài khoản</span>
                <Badge className="bg-green-100 text-green-800 border border-green-200">
                  Hoạt động
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Xác thực email</span>
                <Badge className="bg-green-100 text-green-800 border border-green-200">
                  Đã xác thực
                                  </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Ngày tham gia</span>
                <span className="text-sm text-gray-600">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Bảo mật</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Mật khẩu</span>
                <Button variant="outline" size="sm">
                  Đổi mật khẩu
                                    </Button>
                                  </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Xác thực 2FA</span>
                <Button variant="outline" size="sm">
                  Bật 2FA
                </Button>
              </div>
                      <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Đăng nhập gần đây</span>
                <span className="text-sm text-gray-600">Hôm nay</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}