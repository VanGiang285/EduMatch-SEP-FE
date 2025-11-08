"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/basic/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/basic/avatar';
import { Button } from '@/components/ui/basic/button';
import { Calendar, Clock, MapPin, Video, MessageCircle } from 'lucide-react';
import { mockUpcomingSchedule, getTeachingModeText } from '@/data/mockLearnerData';

export function ScheduleTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Lịch học sắp tới</h2>
        <p className="text-gray-600 mt-1">Các buổi học trong tuần này</p>
      </div>

      {mockUpcomingSchedule.length === 0 ? (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-600">Chưa có lịch học nào</p>
              </CardContent>
            </Card>
      ) : (
        <div className="space-y-4">
          {mockUpcomingSchedule.map((schedule) => (
            <Card key={schedule.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Date Box */}
                  <div className="flex-shrink-0">
                    <div className="bg-[#257180]/10 rounded-lg p-4 text-center w-20">
                      <div className="text-2xl font-bold text-[#257180]">
                        {new Date(schedule.date).getDate()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Tháng {new Date(schedule.date).getMonth() + 1}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {schedule.dayOfWeek}
                      </div>
                    </div>
                  </div>

                  {/* Schedule Info */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={schedule.tutorAvatar} alt={schedule.tutorName} />
                          <AvatarFallback>{schedule.tutorName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{schedule.subject}</h3>
                          <p className="text-gray-600">Gia sư: {schedule.tutorName}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {getTeachingModeText(schedule.teachingMode)}
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{schedule.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        {schedule.teachingMode === 1 ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                        <span className="line-clamp-1">{schedule.location}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="lg" className="hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Nhắn tin
                      </Button>
                      {schedule.teachingMode === 1 && (
                        <Button size="lg" className="bg-[#257180] hover:bg-[#257180]/90 text-white">
                          <Video className="h-4 w-4 mr-2" />
                          Tham gia lớp học
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Weekly Calendar View (Optional Enhancement) */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Lịch tuần</h3>
              <div className="text-center text-gray-600 py-8">
                Xem lịch đầy đủ trong phần "Danh sách lớp học"
              </div>
            </CardContent>
          </Card>
    </div>
  );
}
