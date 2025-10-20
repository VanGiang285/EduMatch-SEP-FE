"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Badge } from '@/components/ui/basic/badge';
import { Clock, Plus, Edit, Trash2, Save, Calendar, Timer } from 'lucide-react';
import { useState } from 'react';
import { useCustomToast } from '@/hooks/useCustomToast';

// Mock data - in real app, this would come from API
const initialAvailability = {
  monday: ['14:00-17:00', '19:00-21:00'],
  tuesday: ['14:00-17:00', '19:00-21:00'],
  wednesday: ['14:00-17:00', '19:00-21:00'],
  thursday: ['14:00-17:00', '19:00-21:00'],
  friday: ['14:00-17:00', '19:00-21:00'],
  saturday: ['09:00-12:00', '14:00-17:00'],
  sunday: ['09:00-12:00']
};

const timeSlots = [
  '06:00-08:00', '08:00-10:00', '10:00-12:00', '12:00-14:00',
  '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00'
];

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState(initialAvailability);
  const [editing, setEditing] = useState(false);
  const { showSuccess, showError } = useCustomToast();

  const dayLabels = {
    monday: 'Thứ 2',
    tuesday: 'Thứ 3',
    wednesday: 'Thứ 4',
    thursday: 'Thứ 5',
    friday: 'Thứ 6',
    saturday: 'Thứ 7',
    sunday: 'Chủ nhật'
  };

  const handleToggleTimeSlot = (day: string, timeSlot: string) => {
    if (!editing) return;

    setAvailability(prev => {
      const daySlots = prev[day as keyof typeof prev];
      const isSelected = daySlots.includes(timeSlot);
      
      if (isSelected) {
        return {
          ...prev,
          [day]: daySlots.filter(slot => slot !== timeSlot)
        };
      } else {
        return {
          ...prev,
          [day]: [...daySlots, timeSlot]
        };
      }
    });
  };

  const handleSaveAvailability = () => {
    // TODO: Implement save availability API call
    showSuccess('Cập nhật lịch rảnh thành công');
    setEditing(false);
  };

  const handleResetAvailability = () => {
    setAvailability(initialAvailability);
    setEditing(false);
  };

  const getTotalHours = () => {
    return Object.values(availability).reduce((total, daySlots) => {
      return total + daySlots.length * 2; // Each slot is 2 hours
    }, 0);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[#FD8B51] p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Clock className="h-8 w-8 mr-3 text-[#257180]" />
              Lịch rảnh
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý thời gian có thể dạy học
            </p>
          </div>
          <div className="flex space-x-3">
            {editing ? (
              <>
                <Button
                  onClick={handleResetAvailability}
                  variant="outline"
                  className="border-gray-300 text-gray-700"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSaveAvailability}
                  className="bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setEditing(true)}
                variant="outline"
                className="border-[#FD8B51] text-[#257180] hover:bg-[#F2E5BF]"
              >
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng giờ rảnh/tuần</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">{getTotalHours()}h</p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ngày dạy/tuần</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {Object.values(availability).filter(day => day.length > 0).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Slot rảnh/tuần</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {Object.values(availability).reduce((total, day) => total + day.length, 0)}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Timer className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Availability Calendar */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-[#257180]" />
            Lịch rảnh theo tuần
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(availability).map(([day, daySlots]) => (
              <div key={day} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {dayLabels[day as keyof typeof dayLabels]}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
                      {daySlots.length} slot
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 border border-green-200">
                      {daySlots.length * 2}h
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                  {timeSlots.map((timeSlot) => {
                    const isSelected = daySlots.includes(timeSlot);
                    return (
                      <button
                        key={timeSlot}
                        onClick={() => handleToggleTimeSlot(day, timeSlot)}
                        disabled={!editing}
                        className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-[#FD8B51] text-white border-[#FD8B51]'
                            : editing
                            ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        {timeSlot}
                      </button>
                    );
                  })}
                </div>
                
                {daySlots.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Các slot đã chọn:</p>
                    <div className="flex flex-wrap gap-2">
                      {daySlots.map((slot, index) => (
                        <Badge key={index} className="bg-[#FD8B51] text-white">
                          {slot}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => {
                if (editing) {
                  // Set all weekdays to afternoon slots
                  setAvailability(prev => ({
                    ...prev,
                    monday: ['14:00-16:00', '16:00-18:00'],
                    tuesday: ['14:00-16:00', '16:00-18:00'],
                    wednesday: ['14:00-16:00', '16:00-18:00'],
                    thursday: ['14:00-16:00', '16:00-18:00'],
                    friday: ['14:00-16:00', '16:00-18:00'],
                    saturday: [],
                    sunday: []
                  }));
                }
              }}
              disabled={!editing}
            >
              <Clock className="h-6 w-6 text-blue-600" />
              <span className="text-sm">Lịch buổi chiều</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => {
                if (editing) {
                  // Set all weekdays to evening slots
                  setAvailability(prev => ({
                    ...prev,
                    monday: ['18:00-20:00', '20:00-22:00'],
                    tuesday: ['18:00-20:00', '20:00-22:00'],
                    wednesday: ['18:00-20:00', '20:00-22:00'],
                    thursday: ['18:00-20:00', '20:00-22:00'],
                    friday: ['18:00-20:00', '20:00-22:00'],
                    saturday: [],
                    sunday: []
                  }));
                }
              }}
              disabled={!editing}
            >
              <Clock className="h-6 w-6 text-purple-600" />
              <span className="text-sm">Lịch buổi tối</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => {
                if (editing) {
                  // Clear all availability
                  setAvailability({
                    monday: [],
                    tuesday: [],
                    wednesday: [],
                    thursday: [],
                    friday: [],
                    saturday: [],
                    sunday: []
                  });
                }
              }}
              disabled={!editing}
            >
              <Trash2 className="h-6 w-6 text-red-600" />
              <span className="text-sm">Xóa tất cả</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      {editing && (
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">i</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-2">Hướng dẫn</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Click vào các khung giờ để chọn/bỏ chọn slot rảnh</li>
                  <li>• Mỗi slot có thời lượng 2 giờ</li>
                  <li>• Học viên sẽ chỉ thấy các slot rảnh khi tìm kiếm gia sư</li>
                  <li>• Nhớ lưu thay đổi sau khi chỉnh sửa</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


