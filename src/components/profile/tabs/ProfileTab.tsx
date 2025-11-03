"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/basic/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Camera, Save } from 'lucide-react';
import { mockCurrentUser } from '@/data/mockLearnerData';

export function ProfileTab() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    userName: mockCurrentUser.userName,
    email: mockCurrentUser.email,
    phone: mockCurrentUser.phone,
    dob: mockCurrentUser.dob,
    gender: mockCurrentUser.gender.toString(),
    cityName: mockCurrentUser.cityName,
    subDistrictName: mockCurrentUser.subDistrictName,
    addressLine: mockCurrentUser.addressLine,
  });

  const handleSave = () => {
    // Handle save logic here
    console.log('Save profile:', formData);
    setIsEditing(false);
  };

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
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} size="lg" className="bg-[#257180] hover:bg-[#257180]/90 text-white">
              <Save className="h-4 w-4 mr-2" />
              Lưu thay đổi
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
            <Avatar className="h-24 w-24">
              <AvatarImage src={mockCurrentUser.avatar} alt={mockCurrentUser.userName} />
              <AvatarFallback className="text-2xl">{mockCurrentUser.userName[0]}</AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Tải ảnh lên
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
                disabled={!isEditing}
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
                onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">Quận/Huyện</Label>
              <Input
                id="district"
                value={formData.subDistrictName}
                onChange={(e) => setFormData({ ...formData, subDistrictName: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Địa chỉ chi tiết</Label>
              <Input
                id="address"
                value={formData.addressLine}
                onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

