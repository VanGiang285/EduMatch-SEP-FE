"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { SelectWithSearch, SelectWithSearchItem } from '@/components/ui/form/select-with-search';
import { Camera, Save, Loader2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileService } from '@/services/userProfileService';
import { LocationService, ProvinceDto, SubDistrictDto } from '@/services/locationService';
import { toast } from 'sonner';
import { Gender } from '@/types/enums';
import { UserProfileDto } from '@/types/backend';
import { UserProfileUpdateRequest } from '@/types/requests';
import { MediaService } from '@/services/mediaService';

export function ProfileTab() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [originalData, setOriginalData] = useState<UserProfileDto | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<ProvinceDto[]>([]);
  const [provincesLoaded, setProvincesLoaded] = useState(false);
  const [subDistricts, setSubDistricts] = useState<SubDistrictDto[]>([]);
  const [subDistrictProvinceId, setSubDistrictProvinceId] = useState('');
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
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
    avatarUrlPublicId: '',
    latitude: '',
    longitude: '',
  });

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
        setProvincesLoaded(true);
      }
    };
    loadProvinces();
  }, []);

  // Load sub-districts when cityId changes
  useEffect(() => {
    const loadSubDistricts = async () => {
      if (!formData.cityId) {
        setSubDistricts([]);
        setSubDistrictProvinceId('');
        return;
      }

      if (subDistrictProvinceId === formData.cityId) {
        return;
      }

      const provinceId = parseInt(formData.cityId, 10);
      if (Number.isNaN(provinceId) || provinceId <= 0) {
        setSubDistricts([]);
        setSubDistrictProvinceId('');
        return;
      }

      setIsLoadingLocations(true);
      try {
        const response = await LocationService.getSubDistrictsByProvinceId(provinceId);
        if (response.success && response.data) {
          const districts = response.data;
          setSubDistricts(districts);
          setSubDistrictProvinceId(formData.cityId);
          setFormData((prev) => {
            if (!prev.subDistrictId) {
              return prev;
            }
            const matched = districts.find(
              (district) => district.id.toString() === prev.subDistrictId
            );
            if (matched && matched.name !== prev.subDistrictName) {
              return { ...prev, subDistrictName: matched.name };
            }
            return prev;
          });
        } else {
          setSubDistricts([]);
          setSubDistrictProvinceId('');
        }
      } catch (error) {
        console.error('Error loading sub-districts:', error);
        setSubDistricts([]);
        setSubDistrictProvinceId('');
      } finally {
        setIsLoadingLocations(false);
      }
    };
    loadSubDistricts();
  }, [formData.cityId, subDistrictProvinceId]);

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.email) {
        setIsLoading(false);
        return;
      }

      if (!provincesLoaded) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await UserProfileService.getUserProfile(user.email);
        if (response.success && response.data) {
          const profile = response.data;
          setOriginalData(profile);

          const dobFormatted = profile.dob
            ? new Date(profile.dob).toISOString().split('T')[0]
            : '';

          const cityIdStr = profile.cityId?.toString() || '';
          const districtIdStr = profile.subDistrictId?.toString() || '';
          const provinceMatch = provinces.find((province) => province.id === profile.cityId);
          const resolvedProvinceName = profile.province?.name || provinceMatch?.name || '';
          let resolvedSubDistrictName = profile.subDistrict?.name || '';

          if (!resolvedSubDistrictName && profile.cityId && profile.subDistrictId) {
            try {
              const subDistrictRes = await LocationService.getSubDistrictsByProvinceId(profile.cityId);
              if (subDistrictRes.success && subDistrictRes.data) {
                setSubDistricts(subDistrictRes.data);
                setSubDistrictProvinceId(profile.cityId.toString());
                const matchedDistrict = subDistrictRes.data.find(
                  (district) => district.id === profile.subDistrictId
                );
                resolvedSubDistrictName = matchedDistrict?.name || '';
              } else {
                setSubDistricts([]);
                setSubDistrictProvinceId('');
              }
            } catch (error) {
              console.error('Error resolving sub-district names:', error);
              setSubDistricts([]);
              setSubDistrictProvinceId('');
            }
          }

          setFormData({
            userName: profile.userEmailNavigation?.userName || user.name || user.email || '',
            email: user.email,
            phone: profile.userEmailNavigation?.phone || '',
            dob: dobFormatted,
            gender: profile.gender?.toString() || Gender.Unknown.toString(),
            cityId: cityIdStr,
            subDistrictId: districtIdStr,
            cityName: resolvedProvinceName,
            subDistrictName: resolvedSubDistrictName,
            addressLine: profile.addressLine || '',
            avatarUrl: profile.avatarUrl || '',
            avatarUrlPublicId: profile.avatarUrlPublicId || '',
            latitude: profile.latitude?.toString() || '',
            longitude: profile.longitude?.toString() || '',
          });

          if (profile.avatarUrl) {
            setAvatarPreview(profile.avatarUrl);
          }
        }
      } catch (error) {
        toast.error('Không thể tải thông tin người dùng. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [user?.email, user?.name, provincesLoaded, provinces]);

  const handleCancel = () => {
    if (originalData && user) {
      const dobFormatted = originalData.dob
        ? new Date(originalData.dob).toISOString().split('T')[0]
        : '';

      setFormData({
        userName: originalData.userEmailNavigation?.userName || user.name || user.email || '',
        email: user.email,
        phone: originalData.userEmailNavigation?.phone || '',
        dob: dobFormatted,
        gender: originalData.gender?.toString() || Gender.Unknown.toString(),
        cityId: originalData.cityId?.toString() || '',
        subDistrictId: originalData.subDistrictId?.toString() || '',
        cityName: originalData.province?.name || '',
        subDistrictName: originalData.subDistrict?.name || '',
        addressLine: originalData.addressLine || '',
        avatarUrl: originalData.avatarUrl || '',
        avatarUrlPublicId: originalData.avatarUrlPublicId || '',
        latitude: originalData.latitude?.toString() || '',
        longitude: originalData.longitude?.toString() || '',
      });
      setAvatarPreview(originalData.avatarUrl || null);
    }
    setIsEditing(false);
  };

  // Handle avatar file selection
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh hợp lệ (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload avatar immediately
    if (!user?.email) {
      toast.error('Không tìm thấy thông tin người dùng.');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const uploadResponse = await MediaService.uploadFile({
        file,
        ownerEmail: user.email,
        mediaType: 'Image',
      });
      const uploadPayload = uploadResponse.data as any;
      const secureUrl = uploadPayload?.secureUrl ?? uploadPayload?.data?.secureUrl;
      const publicId = uploadPayload?.publicId ?? uploadPayload?.data?.publicId;
      if (uploadResponse.success && secureUrl) {
        setFormData((prev) => ({
          ...prev,
          avatarUrl: secureUrl,
          avatarUrlPublicId: publicId || '',
        }));
        setAvatarPreview(secureUrl);
        toast.success('Tải ảnh đại diện thành công.');
      } else {
        const uploadErrorMessage =
          typeof uploadResponse.message === 'string' && uploadResponse.message
            ? uploadResponse.message
            : typeof uploadResponse.error === 'string' && uploadResponse.error
              ? uploadResponse.error
              : 'Upload thất bại';
        throw new Error(uploadErrorMessage);
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải ảnh lên. Vui lòng thử lại.');
      setAvatarPreview(formData.avatarUrl || null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Remove avatar
  const handleRemoveAvatar = () => {
    setFormData({
      ...formData,
      avatarUrl: '',
      avatarUrlPublicId: '',
    });
    setAvatarPreview(null);
  };

  const handleSave = async () => {
    if (!user?.email) {
      toast.error('Không tìm thấy thông tin người dùng.');
      return;
    }

    setIsSaving(true);
    try {
      const updateRequest: UserProfileUpdateRequest = {
        userEmail: user.email,
        userName: formData.userName || undefined,
        phone: formData.phone || undefined,
        dob: formData.dob || undefined,
        gender: parseInt(formData.gender) as Gender,
        addressLine: formData.addressLine || undefined,
        cityId: formData.cityId ? parseInt(formData.cityId) : undefined,
        subDistrictId: formData.subDistrictId ? parseInt(formData.subDistrictId) : undefined,
        avatarUrl: formData.avatarUrl || undefined,
        avatarUrlPublicId: formData.avatarUrlPublicId || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      };

      const response = await UserProfileService.updateUserProfile(updateRequest);

      if (response.success && response.data) {
        setOriginalData(response.data);

        // Cập nhật lại user trong AuthContext để Navbar hiển thị avatar/tên mới
        const newName =
          response.data.userEmailNavigation?.userName ||
          response.data.userEmailNavigation?.email ||
          user.email;
        updateUser({
          name: newName,
          fullName: newName,
          avatar: response.data.avatarUrl || undefined,
        });

        toast.success('Cập nhật thông tin thành công.');
        setIsEditing(false);
      } else {
        const message =
          typeof response.message === 'string' && response.message
            ? response.message
            : 'Cập nhật thất bại';
        throw new Error(message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.');
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
            <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]">
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

      <Card className="hover:shadow-md transition-shadow bg-white border border-gray-300">
        <CardHeader>
          <CardTitle className="text-gray-900">Ảnh đại diện</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-[#F2E5BF] border-2 border-gray-200">
                {avatarPreview || formData.avatarUrl || user?.avatar ? (
                  <img
                    src={avatarPreview || formData.avatarUrl || user?.avatar || ''}
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
                  className={`w-full h-full rounded-lg flex items-center justify-center text-2xl font-bold text-[#257180] bg-[#F2E5BF] ${avatarPreview || formData.avatarUrl || user?.avatar ? 'hidden' : 'flex'}`}
                  style={{ display: avatarPreview || formData.avatarUrl || user?.avatar ? 'none' : 'flex' }}
                >
                  {(formData.userName || user?.name || user?.email || 'U').slice(0, 2).toUpperCase()}
                </div>
              </div>
            </div>
            {isEditing && (
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                    id="avatar-upload"
                    disabled={isUploadingAvatar}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    disabled={isUploadingAvatar}
                    className="border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                  >
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang tải...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Tải ảnh lên
                      </>
                    )}
                  </Button>
                </div>
                {(avatarPreview || formData.avatarUrl) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={isUploadingAvatar}
                    className="text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Xóa ảnh
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow bg-white border border-gray-300">
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
                disabled={!isEditing}
                placeholder="Nhập số điện thoại"
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

      <Card className="hover:shadow-md transition-shadow bg-white border border-gray-300">
        <CardHeader>
          <CardTitle className="text-gray-900">Địa chỉ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Tỉnh/Thành phố</Label>
              <SelectWithSearch
                value={formData.cityId}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    cityId: value,
                    subDistrictId: '',
                    cityName: provinces.find((province) => province.id.toString() === value)?.name || '',
                    subDistrictName: '',
                  }));
                }}
                placeholder={isLoadingLocations ? 'Đang tải...' : 'Chọn tỉnh/thành phố'}
                disabled={!isEditing || isLoadingLocations}
              >
                {provinces.map((province) => (
                  <SelectWithSearchItem key={province.id} value={province.id.toString()}>
                    {province.name}
                  </SelectWithSearchItem>
                ))}
              </SelectWithSearch>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">Quận/Huyện</Label>
              <SelectWithSearch
                value={formData.subDistrictId}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    subDistrictId: value,
                    subDistrictName: subDistricts.find((district) => district.id.toString() === value)?.name || '',
                  }));
                }}
                placeholder={
                  isLoadingLocations
                    ? 'Đang tải...'
                    : formData.cityId
                      ? 'Chọn quận/huyện'
                      : 'Chọn tỉnh trước'
                }
                disabled={!isEditing || !formData.cityId || isLoadingLocations}
              >
                {subDistricts.map((district) => (
                  <SelectWithSearchItem key={district.id} value={district.id.toString()}>
                    {district.name}
                  </SelectWithSearchItem>
                ))}
              </SelectWithSearch>
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
        </CardContent>
      </Card>
    </div>
  );
}

