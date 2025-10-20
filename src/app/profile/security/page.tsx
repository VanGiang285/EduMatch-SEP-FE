"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Badge } from '@/components/ui/basic/badge';
import { Shield, Key, Smartphone, Eye, EyeOff, Check, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { useState } from 'react';
import { useCustomToast } from '@/hooks/useCustomToast';

export default function SecurityPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { showSuccess, showError } = useCustomToast();

  // Mock data - in real app, this would come from API
  const mockSecurityData = {
    lastPasswordChange: '2024-01-01',
    twoFactorEnabled: false,
    activeSessions: [
      {
        id: 1,
        device: 'Chrome on Windows',
        location: 'Hà Nội, Việt Nam',
        lastActive: '2024-01-15T14:30:00',
        current: true
      },
      {
        id: 2,
        device: 'Safari on iPhone',
        location: 'TP.HCM, Việt Nam',
        lastActive: '2024-01-14T20:15:00',
        current: false
      }
    ],
    loginHistory: [
      {
        id: 1,
        date: '2024-01-15T14:30:00',
        device: 'Chrome on Windows',
        location: 'Hà Nội, Việt Nam',
        status: 'success'
      },
      {
        id: 2,
        date: '2024-01-14T20:15:00',
        device: 'Safari on iPhone',
        location: 'TP.HCM, Việt Nam',
        status: 'success'
      },
      {
        id: 3,
        date: '2024-01-13T09:45:00',
        device: 'Chrome on Windows',
        location: 'Hà Nội, Việt Nam',
        status: 'failed'
      }
    ]
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword.length < 8) {
      showError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    // TODO: Implement change password API call
    showSuccess('Đổi mật khẩu thành công');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleToggleTwoFactor = () => {
    // TODO: Implement two-factor authentication toggle
    setTwoFactorEnabled(!twoFactorEnabled);
    showSuccess(twoFactorEnabled ? 'Đã tắt xác thực 2 yếu tố' : 'Đã bật xác thực 2 yếu tố');
  };

  const handleTerminateSession = (sessionId: number) => {
    // TODO: Implement terminate session API call
    showSuccess('Đã đăng xuất phiên này');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[#FD8B51] p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Shield className="h-8 w-8 mr-3 text-[#257180]" />
              Bảo mật
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý bảo mật tài khoản và phiên đăng nhập
            </p>
          </div>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trạng thái bảo mật</p>
                <p className="text-lg font-bold text-green-600 mt-1">Tốt</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Xác thực 2 yếu tố</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {twoFactorEnabled ? 'Đã bật' : 'Chưa bật'}
                </p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Phiên hoạt động</p>
                <p className="text-lg font-bold text-blue-600 mt-1">
                  {mockSecurityData.activeSessions.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Key className="h-5 w-5 mr-2 text-[#257180]" />
            Đổi mật khẩu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Mật khẩu hiện tại</label>
            <div className="relative mt-1">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#257180] focus:border-transparent"
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Mật khẩu mới</label>
            <div className="relative mt-1">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#257180] focus:border-transparent"
                placeholder="Nhập mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Xác nhận mật khẩu mới</label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#257180] focus:border-transparent"
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleChangePassword}
              className="bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white"
            >
              Đổi mật khẩu
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Smartphone className="h-5 w-5 mr-2 text-[#257180]" />
            Xác thực 2 yếu tố
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {twoFactorEnabled ? 'Đã bật xác thực 2 yếu tố' : 'Chưa bật xác thực 2 yếu tố'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {twoFactorEnabled 
                  ? 'Tài khoản của bạn được bảo vệ bằng xác thực 2 yếu tố'
                  : 'Bật xác thực 2 yếu tố để tăng cường bảo mật tài khoản'
                }
              </p>
            </div>
            <Button
              onClick={handleToggleTwoFactor}
              variant={twoFactorEnabled ? "outline" : "default"}
              className={twoFactorEnabled 
                ? "border-red-300 text-red-600 hover:bg-red-50" 
                : "bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white"
              }
            >
              {twoFactorEnabled ? 'Tắt' : 'Bật'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Lock className="h-5 w-5 mr-2 text-[#257180]" />
            Phiên đăng nhập hoạt động
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSecurityData.activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{session.device}</h3>
                    <p className="text-sm text-gray-600">{session.location}</p>
                    <p className="text-xs text-gray-500">
                      Hoạt động lần cuối: {formatDate(session.lastActive)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {session.current && (
                    <Badge className="bg-green-100 text-green-800 border border-green-200">
                      Phiên hiện tại
                    </Badge>
                  )}
                  {!session.current && (
                    <Button
                      onClick={() => handleTerminateSession(session.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      Đăng xuất
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-[#257180]" />
            Lịch sử đăng nhập
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockSecurityData.loginHistory.map((login) => (
              <div key={login.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    login.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {login.status === 'success' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{login.device}</p>
                    <p className="text-xs text-gray-600">{login.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">{formatDate(login.date)}</p>
                  <Badge className={`text-xs ${
                    login.status === 'success' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    {login.status === 'success' ? 'Thành công' : 'Thất bại'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


