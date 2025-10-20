'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Textarea } from '@/components/ui/form/textarea';
import { Switch } from '@/components/ui/basic/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Save, Settings, Bell, Shield, Globe } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'EduMatch',
    siteDescription: 'Nền tảng kết nối gia sư và học viên',
    siteUrl: 'https://edumatch.cloud',
    adminEmail: 'admin@edumatch.cloud',
    
    // Tutor Settings
    autoApproveTutors: false,
    minTutorRating: 4.0,
    maxTutorHourlyRate: 1000000,
    tutorCommissionRate: 10,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Security Settings
    requireEmailVerification: true,
    requirePhoneVerification: false,
    maxLoginAttempts: 5,
    sessionTimeout: 24,
    
    // System Settings
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info',
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // Implement save logic here
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cài đặt hệ thống</h1>
        <p className="text-gray-600 mt-2">
          Quản lý cài đặt và cấu hình hệ thống
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Cài đặt chung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteName">Tên trang web</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="siteUrl">URL trang web</Label>
              <Input
                id="siteUrl"
                value={settings.siteUrl}
                onChange={(e) => handleSettingChange('siteUrl', e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="siteDescription">Mô tả trang web</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="adminEmail">Email quản trị viên</Label>
            <Input
              id="adminEmail"
              type="email"
              value={settings.adminEmail}
              onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tutor Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Cài đặt gia sư
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoApproveTutors">Tự động duyệt gia sư</Label>
              <p className="text-sm text-gray-500">Tự động duyệt đơn đăng ký gia sư mới</p>
            </div>
            <Switch
              id="autoApproveTutors"
              checked={settings.autoApproveTutors}
              onCheckedChange={(checked) => handleSettingChange('autoApproveTutors', checked)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="minTutorRating">Đánh giá tối thiểu</Label>
              <Input
                id="minTutorRating"
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={settings.minTutorRating}
                onChange={(e) => handleSettingChange('minTutorRating', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="maxTutorHourlyRate">Giá tối đa/giờ (VNĐ)</Label>
              <Input
                id="maxTutorHourlyRate"
                type="number"
                value={settings.maxTutorHourlyRate}
                onChange={(e) => handleSettingChange('maxTutorHourlyRate', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="tutorCommissionRate">Phí hoa hồng (%)</Label>
              <Input
                id="tutorCommissionRate"
                type="number"
                min="0"
                max="100"
                value={settings.tutorCommissionRate}
                onChange={(e) => handleSettingChange('tutorCommissionRate', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Cài đặt thông báo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Thông báo email</Label>
              <p className="text-sm text-gray-500">Gửi thông báo qua email</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="smsNotifications">Thông báo SMS</Label>
              <p className="text-sm text-gray-500">Gửi thông báo qua SMS</p>
            </div>
            <Switch
              id="smsNotifications"
              checked={settings.smsNotifications}
              onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="pushNotifications">Thông báo push</Label>
              <p className="text-sm text-gray-500">Gửi thông báo push notification</p>
            </div>
            <Switch
              id="pushNotifications"
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Cài đặt bảo mật
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="requireEmailVerification">Yêu cầu xác thực email</Label>
              <p className="text-sm text-gray-500">Bắt buộc xác thực email khi đăng ký</p>
            </div>
            <Switch
              id="requireEmailVerification"
              checked={settings.requireEmailVerification}
              onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="requirePhoneVerification">Yêu cầu xác thực số điện thoại</Label>
              <p className="text-sm text-gray-500">Bắt buộc xác thực số điện thoại</p>
            </div>
            <Switch
              id="requirePhoneVerification"
              checked={settings.requirePhoneVerification}
              onCheckedChange={(checked) => handleSettingChange('requirePhoneVerification', checked)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxLoginAttempts">Số lần đăng nhập tối đa</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                min="1"
                max="10"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="sessionTimeout">Thời gian hết hạn phiên (giờ)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min="1"
                max="168"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Cài đặt hệ thống
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenanceMode">Chế độ bảo trì</Label>
              <p className="text-sm text-gray-500">Tạm dừng dịch vụ để bảo trì</p>
            </div>
            <Switch
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="debugMode">Chế độ debug</Label>
              <p className="text-sm text-gray-500">Hiển thị thông tin debug</p>
            </div>
            <Switch
              id="debugMode"
              checked={settings.debugMode}
              onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
            />
          </div>
          <div>
            <Label htmlFor="logLevel">Mức độ log</Label>
            <Select value={settings.logLevel} onValueChange={(value) => handleSettingChange('logLevel', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="debug">Debug</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Lưu cài đặt
        </Button>
      </div>
    </div>
  );
}
