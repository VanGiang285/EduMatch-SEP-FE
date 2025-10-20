"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Badge } from '@/components/ui/basic/badge';
import { Settings, Globe, Bell, Palette, Database, Trash2, Download, Upload, Save } from 'lucide-react';
import { useState } from 'react';
import { useCustomToast } from '@/hooks/useCustomToast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Input } from '@/components/ui/form/input';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    theme: 'light',
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    dataSharing: false,
    analytics: true
  });
  const { showSuccess, showError } = useCustomToast();

  const handleSaveSettings = () => {
    // TODO: Implement save settings API call
    showSuccess('Đã lưu cài đặt thành công');
  };

  const handleExportData = () => {
    // TODO: Implement export data functionality
    showSuccess('Đang xuất dữ liệu...');
  };

  const handleDeleteAccount = () => {
    // TODO: Implement delete account functionality
    showError('Tính năng này đang được phát triển');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[#FD8B51] p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="h-8 w-8 mr-3 text-[#257180]" />
              Cài đặt
            </h1>
            <p className="text-gray-600 mt-1">
              Tùy chỉnh trải nghiệm sử dụng và quản lý tài khoản
            </p>
          </div>
          <Button
            onClick={handleSaveSettings}
            className="bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Lưu cài đặt
          </Button>
        </div>
      </div>

      {/* General Settings */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-[#257180]" />
            Cài đặt chung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Ngôn ngữ</label>
              <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                <SelectTrigger className="mt-1 border-gray-300 focus:border-[#257180] focus:ring-[#257180]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Múi giờ</label>
              <Select value={settings.timezone} onValueChange={(value) => setSettings({...settings, timezone: value})}>
                <SelectTrigger className="mt-1 border-gray-300 focus:border-[#257180] focus:ring-[#257180]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (UTC+7)</SelectItem>
                  <SelectItem value="UTC">UTC (UTC+0)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Giao diện</label>
            <Select value={settings.theme} onValueChange={(value) => setSettings({...settings, theme: value})}>
              <SelectTrigger className="mt-1 border-gray-300 focus:border-[#257180] focus:ring-[#257180]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Sáng</SelectItem>
                <SelectItem value="dark">Tối</SelectItem>
                <SelectItem value="auto">Tự động</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-[#257180]" />
            Thông báo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Thông báo email</h3>
              <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FD8B51]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FD8B51]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Thông báo đẩy</h3>
              <p className="text-sm text-gray-600">Nhận thông báo trên trình duyệt</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => setSettings({...settings, pushNotifications: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FD8B51]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FD8B51]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Thông báo SMS</h3>
              <p className="text-sm text-gray-600">Nhận thông báo qua tin nhắn</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FD8B51]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FD8B51]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Email marketing</h3>
              <p className="text-sm text-gray-600">Nhận email về sản phẩm và dịch vụ mới</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.marketingEmails}
                onChange={(e) => setSettings({...settings, marketingEmails: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FD8B51]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FD8B51]"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Database className="h-5 w-5 mr-2 text-[#257180]" />
            Quyền riêng tư & Dữ liệu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Chia sẻ dữ liệu</h3>
              <p className="text-sm text-gray-600">Cho phép chia sẻ dữ liệu ẩn danh để cải thiện dịch vụ</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.dataSharing}
                onChange={(e) => setSettings({...settings, dataSharing: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FD8B51]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FD8B51]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Phân tích sử dụng</h3>
              <p className="text-sm text-gray-600">Thu thập dữ liệu về cách bạn sử dụng ứng dụng</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.analytics}
                onChange={(e) => setSettings({...settings, analytics: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FD8B51]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FD8B51]"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Database className="h-5 w-5 mr-2 text-[#257180]" />
            Quản lý dữ liệu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Xuất dữ liệu</h3>
              <p className="text-sm text-gray-600">Tải xuống tất cả dữ liệu tài khoản của bạn</p>
            </div>
            <Button
              onClick={handleExportData}
              variant="outline"
              className="border-[#FD8B51] text-[#257180] hover:bg-[#F2E5BF]"
            >
              <Download className="h-4 w-4 mr-2" />
              Xuất dữ liệu
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h3 className="text-sm font-medium text-red-900">Xóa tài khoản</h3>
              <p className="text-sm text-red-600">Xóa vĩnh viễn tài khoản và tất cả dữ liệu</p>
            </div>
            <Button
              onClick={handleDeleteAccount}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa tài khoản
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Thông tin tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Ngày tạo tài khoản</label>
              <p className="text-sm text-gray-900 mt-1">15/01/2024</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Lần đăng nhập cuối</label>
              <p className="text-sm text-gray-900 mt-1">15/01/2024 14:30</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


