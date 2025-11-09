"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Camera, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileService } from '@/services/userProfileService';
import { useCustomToast } from '@/hooks/useCustomToast';
import { Gender } from '@/types/enums';
import { UserProfileDto } from '@/types/backend';
import { UserProfileUpdateRequest } from '@/types/requests';

export function ProfileTab() {
  const { user } = useAuth();
  const { showSuccess, showError } = useCustomToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalData, setOriginalData] = useState<UserProfileDto | null>(null);
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    phone: '',
    dob: '',
    gender: Gender.Unknown.toString(),
    cityId: '',
    subDistrictId: '',
    cityName: '',
    subDistrictName: '',
    addressLine: '',
    avatarUrl: '',
  });

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.email) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await UserProfileService.getUserProfile(user.email);
        if (response.success && response.data) {
          const profile = response.data;
          setOriginalData(profile);
          
          // Format date for input (YYYY-MM-DD)
          const dobFormatted = profile.dob 
            ? new Date(profile.dob).toISOString().split('T')[0]
            : '';

          setFormData({
            userName: user.name || user.email || '',
            email: user.email,
            phone: user.phone || '',
            dob: dobFormatted,
            gender: profile.gender?.toString() || Gender.Unknown.toString(),
            cityId: profile.cityId?.toString() || '',
            subDistrictId: profile.subDistrictId?.toString() || '',
            cityName: profile.province?.name || '',
            subDistrictName: profile.subDistrict?.name || '',
            addressLine: profile.addressLine || '',
            avatarUrl: profile.avatarUrl || '',
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        showError('Lỗi', 'Không thể tải thông tin người dùng. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [user?.email]);

  const handleCancel = () => {
    if (originalData && user) {
      const dobFormatted = originalData.dob 
        ? new Date(originalData.dob).toISOString().split('T')[0]
        : '';
      
      setFormData({
        userName: user.name || user.email || '',
        email: user.email,
        phone: user.phone || '',
        dob: dobFormatted,
        gender: originalData.gender?.toString() || Gender.Unknown.toString(),
        cityId: originalData.cityId?.toString() || '',
        subDistrictId: originalData.subDistrictId?.toString() || '',
        cityName: originalData.province?.name || '',
        subDistrictName: originalData.subDistrict?.name || '',
        addressLine: originalData.addressLine || '',
        avatarUrl: originalData.avatarUrl || '',
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user?.email) {
      showError('Lỗi', 'Không tìm thấy thông tin người dùng.');
      return;
    }

    setIsSaving(true);
    try {
      const updateRequest: UserProfileUpdateRequest = {
        userEmail: user.email,
        dob: formData.dob || undefined,
        gender: parseInt(formData.gender) as Gender,
        addressLine: formData.addressLine || undefined,
        cityId: formData.cityId ? parseInt(formData.cityId) : undefined,
        subDistrictId: formData.subDistrictId ? parseInt(formData.subDistrictId) : undefined,
        avatarUrl: formData.avatarUrl || undefined,
      };

      const response = await UserProfileService.updateUserProfile(updateRequest);
      
      if (response.success && response.data) {
        setOriginalData(response.data);
        showSuccess('Thành công', 'Cập nhật thông tin thành công.');
        setIsEditing(false);
      } else {
        throw new Error(response.message || 'Cập nhật thất bại');
      }
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      showError('Lỗi', error.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#257180]" />
        <span className="ml-2 text-gray-600">Đang tải thông tin...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Thông tin cá nhân</h2>
          <p className="text-gray-600 mt-1">Quản lý thông tin tài khoản của bạn</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} size="lg" className="bg-[#257180] hover:bg-[#257180]/90 text-white">
            Chỉnh sửa
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Hủy
            </Button>
            <Button 
              onClick={handleSave} 
              size="lg" 
              className="bg-[#257180] hover:bg-[#257180]/90 text-white"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-gray-900">Ảnh đại diện</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-[#F2E5BF]">
                {formData.avatarUrl || user?.avatar ? (
                  <img 
                    src={formData.avatarUrl || user?.avatar} 
                    alt={formData.userName}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div 
                  className={`w-full h-full rounded-lg flex items-center justify-center text-2xl font-bold text-[#257180] bg-[#F2E5BF] ${formData.avatarUrl || user?.avatar ? 'hidden' : 'flex'}`}
                  style={{ display: formData.avatarUrl || user?.avatar ? 'none' : 'flex' }}
                >
                  {(formData.userName || user?.name || user?.email || 'U').slice(0, 2).toUpperCase()}
                </div>
              </div>
            </div>
            {isEditing && (
              <Button variant="outline" disabled>
                <Camera className="h-4 w-4 mr-2" />
                Tải ảnh lên
                <span className="ml-2 text-xs text-gray-500">(Tính năng đang phát triển)</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-gray-900">Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Họ và tên</Label>
              <Input
                id="userName"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={true}
                className="bg-gray-50"
                placeholder="Số điện thoại (tính năng cập nhật đang phát triển)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Ngày sinh</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                disabled={!isEditing}
              >
                <SelectTrigger id="gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Không xác định</SelectItem>
                  <SelectItem value="1">Nam</SelectItem>
                  <SelectItem value="2">Nữ</SelectItem>
                  <SelectItem value="3">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-gray-900">Địa chỉ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Tỉnh/Thành phố</Label>
              <Input
                id="city"
                value={formData.cityName}
                disabled={true}
                className="bg-gray-50"
                placeholder="Tỉnh/Thành phố (chỉ đọc)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">Quận/Huyện</Label>
              <Input
                id="district"
                value={formData.subDistrictName}
                disabled={true}
                className="bg-gray-50"
                placeholder="Quận/Huyện (chỉ đọc)"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Địa chỉ chi tiết</Label>
              <Input
                id="address"
                value={formData.addressLine}
                onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                disabled={!isEditing}
                placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường, phường/xã)"
              />
            </div>
          </div>
          {isEditing && (
            <p className="text-sm text-gray-500 mt-2">
              Lưu ý: Tỉnh/Thành phố và Quận/Huyện hiện chỉ hiển thị. Địa chỉ chi tiết có thể được cập nhật.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

