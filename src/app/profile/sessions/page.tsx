"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Badge } from '@/components/ui/basic/badge';
import { Calendar, Clock, User, MapPin, Video, Phone, BookOpen, Plus, Filter, Search } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Input } from '@/components/ui/form/input';

// Mock data - in real app, this would come from API
const mockSessions = [
  {
    id: 1,
    tutorName: 'Nguyễn Văn A',
    tutorAvatar: null,
    subject: 'Toán học',
    level: 'Lớp 12',
    date: '2024-01-15',
    time: '14:00 - 15:30',
    status: 'upcoming',
    type: 'online',
    location: 'Google Meet',
    price: 200000,
    notes: 'Ôn tập chương 1: Hàm số'
  },
  {
    id: 2,
    tutorName: 'Trần Thị B',
    tutorAvatar: null,
    subject: 'Vật lý',
    level: 'Lớp 11',
    date: '2024-01-10',
    time: '16:00 - 17:30',
    status: 'completed',
    type: 'offline',
    location: 'Nhà học viên',
    price: 250000,
    notes: 'Bài tập về dao động điều hòa'
  },
  {
    id: 3,
    tutorName: 'Lê Văn C',
    tutorAvatar: null,
    subject: 'Hóa học',
    level: 'Lớp 10',
    date: '2024-01-08',
    time: '19:00 - 20:30',
    status: 'cancelled',
    type: 'online',
    location: 'Zoom',
    price: 180000,
    notes: 'Học viên hủy do bận việc'
  }
];

export default function SessionsPage() {
  const [sessions] = useState(mockSessions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Sắp tới';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      case 'in-progress': return 'Đang diễn ra';
      default: return 'Không xác định';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'online' ? Video : MapPin;
  };

  const getTypeLabel = (type: string) => {
    return type === 'online' ? 'Online' : 'Offline';
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.tutorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    const matchesType = typeFilter === 'all' || session.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const upcomingSessions = sessions.filter(s => s.status === 'upcoming');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[#FD8B51] p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calendar className="h-8 w-8 mr-3 text-[#257180]" />
              Sessions & Bookings
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý lịch học và đặt lịch với gia sư
            </p>
          </div>
          <Button className="bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Đặt lịch mới
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sessions sắp tới</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">{upcomingSessions.length}</p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sessions đã hoàn thành</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">{completedSessions.length}</p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng sessions</p>
                <p className="text-3xl font-bold text-[#257180] mt-1">{sessions.length}</p>
              </div>
              <div className="h-12 w-12 bg-[#F2E5BF] rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-[#257180]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo gia sư, môn học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-[#257180] focus:ring-[#257180]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="upcoming">Sắp tới</SelectItem>
                <SelectItem value="completed">Đã hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
                <SelectItem value="in-progress">Đang diễn ra</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-[#257180] focus:ring-[#257180]">
                <SelectValue placeholder="Loại học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <Calendar className="h-5 w-5 mr-2 text-gray-600" />
            Danh sách Sessions ({filteredSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {filteredSessions.map((session) => {
              const TypeIcon = getTypeIcon(session.type);
              return (
                <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Tutor Avatar */}
                      <div className="h-12 w-12 rounded-full bg-[#F2E5BF] flex items-center justify-center">
                        {session.tutorAvatar ? (
                          <img 
                            src={session.tutorAvatar} 
                            alt={session.tutorName} 
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-[#257180]">
                            {session.tutorName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Session Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {session.tutorName}
                          </h3>
                          <Badge className={`${getStatusColor(session.status)} border`}>
                            {getStatusLabel(session.status)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <BookOpen className="h-4 w-4 mr-2" />
                              <span>{session.subject} - {session.level}</span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{new Date(session.date).toLocaleDateString('vi-VN')}</span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>{session.time}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <TypeIcon className="h-4 w-4 mr-2" />
                              <span>{getTypeLabel(session.type)} - {session.location}</span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="font-medium text-[#257180]">
                                {session.price.toLocaleString('vi-VN')} VND
                              </span>
                            </div>
                            
                            {session.notes && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Ghi chú:</span> {session.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {session.status === 'upcoming' && (
                        <>
                          <Button variant="outline" size="sm">
                            Tham gia
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            Hủy
                          </Button>
                        </>
                      )}
                      
                      {session.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          Đánh giá
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        Chi tiết
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredSessions.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Không tìm thấy session nào</p>
              <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc để tìm kiếm</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


