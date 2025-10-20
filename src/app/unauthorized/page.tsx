'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/basic/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Shield, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Truy cập bị từ chối
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={() => router.back()}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            
            <Button 
              onClick={() => router.push('/')}
              className="w-full bg-[#FD8B51] hover:bg-[#CB6040] text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

