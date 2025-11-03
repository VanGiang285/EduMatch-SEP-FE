"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/basic/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/basic/avatar';
import { Button } from '@/components/ui/basic/button';
import { Progress } from '@/components/ui/feedback/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { BookOpen, Calendar, MapPin, Video, MessageCircle, MoreHorizontal } from 'lucide-react';
import { 
  mockBookings, 
  formatCurrency, 
  getTeachingModeText,
  getBookingStatusText,
  getBookingStatusColor 
} from '@/data/mockLearnerData';

export function ClassesTab() {
  const [filter, setFilter] = useState<string>('all');

  const filteredBookings = mockBookings.filter((booking) => {
    if (filter === 'all') return true;
    if (filter === 'active') return booking.status === 1 && booking.remainingSessions > 0;
    if (filter === 'pending') return booking.status === 0;
    if (filter === 'completed') return booking.status === 2;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Lớp học của tôi</h2>
        <p className="text-gray-600 mt-1">Quản lý tất cả các khóa học đã đặt</p>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">Tất cả ({mockBookings.length})</TabsTrigger>
          <TabsTrigger value="active">
            Đang học ({mockBookings.filter(b => b.status === 1 && b.remainingSessions > 0).length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Chờ xác nhận ({mockBookings.filter(b => b.status === 0).length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Hoàn thành ({mockBookings.filter(b => b.status === 2).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6 space-y-4">
          {filteredBookings.length === 0 ? (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-600">Không có lớp học nào</p>
              </CardContent>
            </Card>
          ) : (
            filteredBookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Tutor Info */}
                    <div className="flex gap-4 flex-1">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={booking.tutorAvatar} alt={booking.tutorName} />
                        <AvatarFallback>{booking.tutorName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-lg">{booking.subject}</h3>
                            <p className="text-gray-600">Gia sư: {booking.tutorName}</p>
                          </div>
                          <Badge className={getBookingStatusColor(booking.status)}>
                            {getBookingStatusText(booking.status)}
                          </Badge>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            {booking.teachingMode === 1 ? (
                              <Video className="h-4 w-4" />
                            ) : (
                              <MapPin className="h-4 w-4" />
                            )}
                            <span>{getTeachingModeText(booking.teachingMode)}</span>
                            <span className="text-gray-400">•</span>
                            <span>{booking.level}</span>
                          </div>
                          {booking.nextSession && (
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                              <Calendar className="h-4 w-4" />
                              <span>Buổi tiếp theo: {new Date(booking.nextSession).toLocaleString('vi-VN')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress & Stats */}
                    <div className="lg:w-80 space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Tiến độ</span>
                          <span className="font-medium">
                            {booking.completedSessions}/{booking.totalSessions} buổi
                          </span>
                        </div>
                        <Progress 
                          value={(booking.completedSessions / booking.totalSessions) * 100} 
                          className="h-2"
                        />
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Giá/buổi:</span>
                          <span className="font-medium">{formatCurrency(booking.unitPrice)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tổng tiền:</span>
                          <span className="font-semibold text-[#257180]">
                            {formatCurrency(booking.totalAmount)}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Nhắn tin
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
