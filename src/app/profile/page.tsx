"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card";
import { Button } from "@/components/ui/basic/button";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { Textarea } from "@/components/ui/form/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/basic/avatar";
import { Badge } from "@/components/ui/basic/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import { Switch } from "@/components/ui/form/switch";
import { 
  UserCircle, 
  Wallet, 
  MessageCircle, 
  Bell, 
  Camera, 
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  DollarSign,
  Send,
  CheckCircle,
  Trash2,
  Star,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  TrendingUp,
  Search,
  Paperclip,
  Smile,
  Video,
  MoreVertical,
  Pin,
  Phone as PhoneIcon
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['profile', 'wallet', 'messages', 'notifications'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const [selectedChat, setSelectedChat] = useState(1);
  const [newMessage, setNewMessage] = useState('');
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false
  });

  const conversations = [
    {
      id: 1,
      name: "Nguyễn Thị Mai Anh",
      avatar: "/placeholder-avatar-1.jpg",
      lastMessage: "Cảm ơn bạn đã đặt lịch học!",
      time: "10:30",
      unread: 2,
      isOnline: true,
      subject: "Toán học",
      type: "tutor"
    },
    {
      id: 2,
      name: "Trần Văn Hùng",
      avatar: "/placeholder-avatar-2.jpg",
      lastMessage: "Tôi sẽ gửi tài liệu cho bạn",
      time: "09:15",
      unread: 0,
      isOnline: false,
      subject: "Tiếng Anh",
      type: "tutor"
    },
    {
      id: 3,
      name: "Lê Thị Hương",
      avatar: "/placeholder-avatar-3.jpg",
      lastMessage: "Buổi học hôm nay thế nào?",
      time: "08:45",
      unread: 1,
      isOnline: true,
      subject: "Vật lý",
      type: "tutor"
    },
    {
      id: 4,
      name: "EduMatch Support",
      avatar: "/support-avatar.jpg",
      lastMessage: "Đánh giá buổi học của bạn đã được ghi nhận. Cảm ơn!",
      time: "1 ngày",
      unread: 1,
      isOnline: true,
      subject: "Hỗ trợ",
      type: "support"
    }
  ];

  const messages = [
    {
      id: 1,
      senderId: 1,
      content: "Chào bạn! Tôi đã nhận được thông tin đặt lịch học.",
      time: "10:25",
      isOwn: false
    },
    {
      id: 2,
      senderId: 0,
      content: "Cảm ơn cô! Tôi rất mong được học với cô.",
      time: "10:28",
      isOwn: true
    },
    {
      id: 3,
      senderId: 1,
      content: "Cảm ơn bạn đã đặt lịch học!",
      time: "10:30",
      isOwn: false
    }
  ];

  const notifications = [
    {
      id: 1,
      type: 'session_reminder',
      title: 'Nhắc nhở buổi học sắp tới',
      message: 'Lớp Toán học với cô Nguyễn Thị Mai Anh sẽ bắt đầu trong 30 phút',
      time: '10 phút trước',
      read: false,
      priority: 'high',
      icon: Calendar,
      color: 'text-[#257180]',
      bgColor: 'bg-[#257180]/10',
      tutor: {
        name: 'Nguyễn Thị Mai Anh',
        avatar: '/placeholder-avatar-1.jpg'
      }
    },
    {
      id: 2,
      type: 'booking_confirmed',
      title: 'Xác nhận đặt lịch',
      message: 'Yêu cầu học Tiếng Anh của bạn đã được thầy Trần Văn Hùng xác nhận',
      time: '2 giờ trước',
      read: false,
      priority: 'normal',
      icon: CheckCircle,
      color: 'text-[#257180]',
      bgColor: 'bg-[#257180]/10',
      tutor: {
        name: 'Trần Văn Hùng',
        avatar: '/placeholder-avatar-2.jpg'
      }
    },
    {
      id: 3,
      type: 'payment_completed',
      title: 'Thanh toán thành công',
      message: 'Bạn đã thanh toán thành công 200.000₫ cho lớp Vật lý với cô Lê Thị Hương',
      time: '5 giờ trước',
      read: true,
      priority: 'normal',
      icon: DollarSign,
      color: 'text-[#257180]',
      bgColor: 'bg-[#257180]/10',
      tutor: {
        name: 'Lê Thị Hương',
        avatar: '/placeholder-avatar-3.jpg'
      }
    },
    {
      id: 4,
      type: 'new_message',
      title: 'Tin nhắn mới',
      message: 'Thầy Phạm Minh Hải đã gửi tin nhắn về bài tập tuần tới',
      time: '1 ngày trước',
      read: true,
      priority: 'normal',
      icon: MessageCircle,
      color: 'text-[#FD8B51]',
      bgColor: 'bg-[#FD8B51]/10',
      tutor: {
        name: 'Phạm Minh Hải',
        avatar: '/placeholder-avatar-4.jpg'
      }
    },
    {
      id: 5,
      type: 'session_completed',
      title: 'Buổi học hoàn thành',
      message: 'Buổi học Hóa học với thầy Võ Văn An đã hoàn thành. Hãy đánh giá buổi học!',
      time: '2 ngày trước',
      read: true,
      priority: 'normal',
      icon: Star,
      color: 'text-[#FD8B51]',
      bgColor: 'bg-[#FD8B51]/10',
      tutor: {
        name: 'Võ Văn An',
        avatar: '/placeholder-avatar-5.jpg'
      }
    }
  ];

  const transactions = [
    {
      id: 1,
      type: "payment",
      description: "Lớp học Toán",
      amount: -200000,
      date: "15/01/2024",
      time: "14:30",
      status: "completed",
      tutor: "Cô Nguyễn Thị Mai Anh"
    },
    {
      id: 2,
      type: "topup",
      description: "Nạp tiền qua thẻ tín dụng",
      amount: +1000000,
      date: "14/01/2024", 
      time: "10:15",
      status: "completed",
      reference: "NAP-12345"
    },
    {
      id: 3,
      type: "refund",
      description: "Hoàn tiền lớp học bị hủy",
      amount: +180000,
      date: "13/01/2024",
      time: "16:45", 
      status: "completed",
      tutor: "Thầy Trần Văn Hùng"
    },
    {
      id: 4,
      type: "payment",
      description: "Lớp học Vật lý",
      amount: -180000,
      date: "12/01/2024",
      time: "11:00",
      status: "completed",
      tutor: "Cô Lê Thị Hương"
    },
    {
      id: 5,
      type: "payment",
      description: "Lớp học Tiếng Anh",
      amount: -250000,
      date: "11/01/2024",
      time: "15:15",
      status: "pending",
      tutor: "Thầy Phạm Đức Anh"
    }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setNewMessage('');
    }
  };

  const getTransactionIcon = (type: string) => {
    switch(type) {
      case 'payment': return <ArrowUpRight className="w-4 h-4 text-[#CB6040]" />;
      case 'topup': return <ArrowDownLeft className="w-4 h-4 text-[#257180]" />;
      case 'refund': return <ArrowDownLeft className="w-4 h-4 text-[#257180]" />;
      default: return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return <Badge variant="default" className="bg-[#257180] text-white">Hoàn thành</Badge>;
      case 'pending': return <Badge variant="secondary" className="bg-[#FD8B51] text-white">Đang xử lý</Badge>;
      case 'failed': return <Badge variant="destructive" className="bg-[#CB6040] text-white">Thất bại</Badge>;
      default: return <Badge variant="secondary" className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const currentConversation = conversations.find(c => c.id === selectedChat);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationsByType = (type: string) => {
    if (type === 'all') return notifications;
    if (type === 'unread') return notifications.filter(n => !n.read);
    if (type === 'important') return notifications.filter(n => n.priority === 'high');
    return notifications.filter(n => n.type === type);
  };

  const handleMarkAsRead = (notificationId: number) => {
    console.log('Mark as read:', notificationId);
  };


  const handleDeleteNotification = (notificationId: number) => {
    console.log('Delete notification:', notificationId);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-16">
      <div className="bg-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-black text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 leading-tight tracking-tight">
              QUẢN LÝ TÀI KHOẢN
            </h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Quản lý thông tin cá nhân, ví, tin nhắn và thông báo
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-[#F2E5BF] border border-gray-300 shadow-sm">
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 data-[state=active]:bg-[#257180] data-[state=active]:text-white"
            >
              <UserCircle className="w-4 h-4" />
              Thông tin cá nhân
            </TabsTrigger>
            <TabsTrigger 
              value="wallet" 
              className="flex items-center gap-2 data-[state=active]:bg-[#257180] data-[state=active]:text-white"
            >
              <Wallet className="w-4 h-4" />
              Ví
            </TabsTrigger>
            <TabsTrigger 
              value="messages" 
              className="flex items-center gap-2 data-[state=active]:bg-[#257180] data-[state=active]:text-white"
            >
              <MessageCircle className="w-4 h-4" />
              Tin nhắn
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex items-center gap-2 data-[state=active]:bg-[#257180] data-[state=active]:text-white"
            >
              <Bell className="w-4 h-4" />
              Thông báo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card className="bg-white border-[#FD8B51] shadow-lg">
                  <CardHeader className="border-b border-gray-300">
                    <CardTitle className="text-black text-lg">Ảnh Đại diện</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center space-y-4 p-6">
                    <div className="relative">
                      <Avatar className="w-32 h-32">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="bg-[#257180] text-white text-2xl">
                          <User className="w-16 h-16" />
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute bottom-0 right-0 rounded-full p-2 h-8 w-8 bg-[#FD8B51] hover:bg-[#CB6040] text-white"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-center">
                      <Button variant="outline" size="sm" className="border-gray-300 text-black hover:bg-[#FD8B51] hover:text-white">
                        Tải ảnh mới
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        JPG, PNG hoặc GIF. Dung lượng tối đa 2MB
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6 bg-white border-gray-300 shadow-lg">
                  <CardHeader className="border-b border-gray-300">
                    <CardTitle className="text-black text-lg">Trạng thái Tài khoản</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Email đã xác thực</span>
                        <Badge className="bg-[#257180] text-white text-xs">
                          Đã xác thực
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Số điện thoại đã xác thực</span>
                        <Badge className="bg-[#FD8B51] text-white text-xs">
                          Chờ xử lý
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Hồ sơ hoàn thiện</span>
                        <Badge className="bg-[#257180] text-white text-xs">
                          85%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card className="bg-white border-[#FD8B51] shadow-lg">
                  <CardHeader className="border-b border-gray-300">
                    <CardTitle className="text-black text-lg">Thông tin Cá nhân</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-black font-medium">Tên</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="firstName" 
                            placeholder="Nguyễn" 
                            className="pl-10 border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                            defaultValue={user?.name?.split(' ')[0] || ""}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-black font-medium">Họ và tên đệm</Label>
                        <Input 
                          id="lastName" 
                          placeholder="Văn A" 
                          className="border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                          defaultValue={user?.name?.split(' ').slice(1).join(' ') || ""}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-black font-medium">Địa chỉ Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="email" 
                            type="email"
                            placeholder="nguyen@example.com" 
                            className="pl-10 border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                            defaultValue={user?.email || ""}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-black font-medium">Số điện thoại</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="phone" 
                            placeholder="+84 (90) 123-4567" 
                            className="pl-10 border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-black font-medium">Tuổi</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="age" 
                            type="number"
                            placeholder="20" 
                            className="pl-10 border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-black font-medium">Địa chỉ</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            id="location" 
                            placeholder="Hà Nội, Việt Nam" 
                            className="pl-10 border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-black font-medium">Giới thiệu bản thân</Label>
                      <Textarea 
                        id="bio"
                        placeholder="Hãy kể về bản thân, mục tiêu học tập và sở thích của bạn..."
                        className="min-h-24 border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                        defaultValue="Tôi đam mê học tập và luôn muốn mở rộng kiến thức trong nhiều lĩnh vực khác nhau. Tôi thích các buổi học tương tác và đánh giá cao những gia sư có thể giải thích các khái niệm phức tạp một cách đơn giản."
                      />
                      <p className="text-xs text-gray-500">
                        Thông tin này sẽ giúp gia sư hiểu phong cách học tập và mục tiêu của bạn.
                      </p>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-gray-300">
                      <h3 className="text-base font-medium text-black">Sở thích Học tập</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="subjects" className="text-black font-medium">Môn học quan tâm</Label>
                          <Input 
                            id="subjects" 
                            placeholder="Toán học, Vật lý, Tiếng Anh" 
                            className="border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                            defaultValue="Toán học, Vật lý, Tiếng Anh"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="level" className="text-black font-medium">Trình độ học vấn</Label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#257180] focus:ring-[#257180]">
                            <option>Trung học phổ thông</option>
                            <option>Đại học</option>
                            <option>Sau đại học</option>
                            <option>Chuyên nghiệp</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-gray-300">
                      <Button variant="outline" className="flex-1 border-gray-300 text-black hover:bg-[#FD8B51] hover:text-white">
                        Hủy thay đổi
                      </Button>
                      <Button className="flex-1 bg-[#FD8B51] hover:bg-[#CB6040] text-white">
                        Lưu hồ sơ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="wallet">
            <div className="space-y-8">
              <Card className="bg-gradient-to-r from-[#257180] to-[#1e5a66] text-white border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-6 h-6" />
                        <span className="text-white/80">Số dư hiện tại</span>
                      </div>
                      <h2 className="text-4xl font-bold mb-2">2.475.000₫</h2>
                      <p className="text-white/80">Có thể sử dụng cho các lớp học</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-white/80 text-sm mb-1">Chi tiêu tháng này</div>
                      <div className="text-2xl font-semibold">1.350.000₫</div>
                      <div className="flex items-center gap-1 text-white/80 text-sm">
                        <TrendingUp className="w-4 h-4" />
                        <span>+12% so với tháng trước</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-gray-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#257180]/10 rounded-lg flex items-center justify-center">
                        <Plus className="w-6 h-6 text-[#257180]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-black">Nạp tiền</h3>
                        <p className="text-gray-600 text-sm">Thêm tiền vào ví của bạn</p>
                      </div>
                      <Button className="bg-[#257180] hover:bg-[#1e5a66] text-white">
                        Nạp tiền
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white border-gray-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#FD8B51]/10 rounded-lg flex items-center justify-center">
                        <ArrowUpRight className="w-6 h-6 text-[#FD8B51]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-black">Rút tiền</h3>
                        <p className="text-gray-600 text-sm">Chuyển về tài khoản ngân hàng</p>
                      </div>
                      <Button variant="outline" className="border-gray-300 text-[#FD8B51] hover:bg-[#FD8B51] hover:text-white">
                        Rút tiền
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-[#FD8B51] shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-[#257180]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <DollarSign className="w-6 h-6 text-[#257180]" />
                    </div>
                    <h3 className="font-semibold text-black">Tổng chi tiêu</h3>
                    <p className="text-2xl font-bold text-black mt-1">12.450.000₫</p>
                    <p className="text-gray-600 text-sm">Tổng cộng</p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-[#FD8B51] shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-[#FD8B51]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-[#FD8B51]" />
                    </div>
                    <h3 className="font-semibold text-black">Lớp đã thanh toán</h3>
                    <p className="text-2xl font-bold text-black mt-1">28</p>
                    <p className="text-gray-600 text-sm">Tháng này</p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-[#FD8B51] shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-[#CB6040]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <CreditCard className="w-6 h-6 text-[#CB6040]" />
                    </div>
                    <h3 className="font-semibold text-black">Chi phí TB/lớp</h3>
                    <p className="text-2xl font-bold text-black mt-1">445.000₫</p>
                    <p className="text-gray-600 text-sm">Mỗi lớp học</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white border-[#FD8B51] shadow-lg">
                <CardHeader className="border-b border-gray-300">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-black">Giao dịch gần đây</CardTitle>
                    <Button variant="outline" size="sm" className="border-gray-300 text-black hover:bg-[#FD8B51] hover:text-white">
                      Xem tất cả lịch sử
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center gap-4 p-4 bg-[#257180]/5 rounded-lg">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-300">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-black">{transaction.description}</h4>
                            <span className={`font-semibold ${
                              transaction.amount > 0 ? 'text-[#257180]' : 'text-black'
                            }`}>
                              {transaction.amount > 0 ? '+' : ''}{Math.abs(transaction.amount).toLocaleString('vi-VN')}₫
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-4">
                              <span>{transaction.date} at {transaction.time}</span>
                              {transaction.tutor && (
                                <span>• {transaction.tutor}</span>
                              )}
                              {transaction.reference && (
                                <span>• {transaction.reference}</span>
                              )}
                            </div>
                            {getStatusBadge(transaction.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#FD8B51] shadow-lg">
                <CardHeader className="border-b border-gray-300">
                  <CardTitle className="text-black">Phương thức thanh toán</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#257180]/10 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-[#257180]" />
                        </div>
                        <div>
                          <h4 className="font-medium text-black">•••• •••• •••• 4532</h4>
                          <p className="text-sm text-gray-600">Hết hạn 12/26</p>
                        </div>
                        <Badge className="bg-[#257180] text-white ml-2">Chính</Badge>
                      </div>
                      <Button variant="outline" size="sm" className="border-gray-300 text-black hover:bg-[#FD8B51] hover:text-white">
                        Chỉnh sửa
                      </Button>
                    </div>
                    
                    <Button variant="outline" className="w-full border-gray-300 text-black hover:bg-[#FD8B51] hover:text-white">
                      + Thêm phương thức thanh toán mới
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-300px)]">
              <div className="col-span-4">
                <Card className="h-full bg-white border-gray-300 shadow-lg">
                  <CardContent className="p-0">
                    <div className="p-4 border-b border-gray-300">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          placeholder="Tìm kiếm cuộc trò chuyện..." 
                          className="pl-10 border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                        />
                      </div>
                    </div>

                    <div className="overflow-y-auto">
                      {conversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          onClick={() => setSelectedChat(conversation.id)}
                          className={`p-4 border-b border-[#257180]/10 cursor-pointer hover:bg-[#FD8B51] hover:text-white transition-colors ${
                            selectedChat === conversation.id ? 'bg-[#257180]/10 border-gray-300' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={conversation.avatar} />
                                <AvatarFallback className="bg-[#257180] text-white">
                                  {conversation.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              {conversation.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-medium text-black truncate">
                                  {conversation.name}
                                </h3>
                                <span className="text-xs text-gray-500">{conversation.time}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-1">
                                <Badge 
                                  variant={conversation.type === 'support' ? 'default' : 'secondary'} 
                                  className={`text-xs ${conversation.type === 'support' ? 'bg-[#257180] text-white' : 'bg-[#FD8B51] text-white'}`}
                                >
                                  {conversation.subject}
                                </Badge>
                                {conversation.unread > 0 && (
                                  <Badge className="bg-[#CB6040] text-white text-xs">
                                    {conversation.unread}
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-600 truncate">
                                {conversation.lastMessage}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="col-span-8">
                <Card className="h-full flex flex-col bg-white border-gray-300 shadow-lg">
                  {currentConversation && (
                    <div className="p-4 border-b border-gray-300 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={currentConversation.avatar} />
                            <AvatarFallback className="bg-[#257180] text-white">
                              {currentConversation.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {currentConversation.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-black">{currentConversation.name}</h3>
                          <p className="text-sm text-gray-600">
                            {currentConversation.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
                          </p>
                        </div>
                        <Badge className="bg-[#257180] text-white">{currentConversation.subject}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-[#257180] hover:bg-[#257180]/10">
                          <PhoneIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-[#257180] hover:bg-[#257180]/10">
                          <Video className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-[#257180] hover:bg-[#257180]/10">
                          <Pin className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-[#257180] hover:bg-[#257180]/10">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${message.isOwn ? 'order-1' : 'order-2'}`}>
                          <div
                            className={`px-4 py-2 rounded-lg ${
                              message.isOwn
                                ? 'bg-[#FD8B51] text-white'
                                : 'bg-gray-100 text-black'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <p className={`text-xs text-gray-500 mt-1 ${message.isOwn ? 'text-right' : 'text-left'}`}>
                            {message.time}
                          </p>
                        </div>
                        
                        {!message.isOwn && (
                          <Avatar className="w-8 h-8 order-1 mr-2">
                            <AvatarImage src={currentConversation?.avatar} />
                            <AvatarFallback className="text-xs bg-[#257180] text-white">
                              {currentConversation?.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-gray-300">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Button variant="ghost" size="sm" className="text-[#257180] hover:bg-[#257180]/10">
                            <Paperclip className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-[#257180] hover:bg-[#257180]/10">
                            <Smile className="w-4 h-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Nhập tin nhắn..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="min-h-10 border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                        />
                      </div>
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={!newMessage.trim()}
                        className="bg-[#FD8B51] hover:bg-[#CB6040] text-white"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <Tabs defaultValue="all" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4 bg-[#F2E5BF] border border-gray-300 shadow-sm">
                    <TabsTrigger value="all" className="data-[state=active]:bg-[#257180] data-[state=active]:text-white">
                      Tất cả ({notifications.length})
                    </TabsTrigger>
                    <TabsTrigger value="unread" className="data-[state=active]:bg-[#257180] data-[state=active]:text-white">
                      Chưa đọc ({unreadCount})
                    </TabsTrigger>
                    <TabsTrigger value="important" className="data-[state=active]:bg-[#257180] data-[state=active]:text-white">
                      Quan trọng
                    </TabsTrigger>
                    <TabsTrigger value="session_reminder" className="data-[state=active]:bg-[#257180] data-[state=active]:text-white">
                      Lịch học
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    <div className="space-y-4">
                      {getNotificationsByType('all').map((notification) => (
                        <Card key={notification.id} className={`${notification.read ? 'bg-white' : 'bg-[#257180]/5'} hover:shadow-md transition-shadow cursor-pointer border-gray-300`}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-lg ${notification.bgColor} flex items-center justify-center flex-shrink-0`}>
                                <notification.icon className={`w-5 h-5 ${notification.color}`} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className={`font-medium ${notification.read ? 'text-black' : 'text-[#257180]'}`}>
                                        {notification.title}
                                      </h3>
                                      {!notification.read && (
                                        <div className="w-2 h-2 bg-[#257180] rounded-full"></div>
                                      )}
                                      {notification.priority === 'high' && (
                                        <Badge className="bg-[#CB6040] text-white text-xs">
                                          Khẩn cấp
                                        </Badge>
                                      )}
                                    </div>
                                    <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-[#257180]'}`}>
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2">
                                      <span className="text-xs text-gray-500">{notification.time}</span>
                                      {notification.tutor && (
                                        <div className="flex items-center gap-2">
                                          <Avatar className="w-5 h-5">
                                            <AvatarImage src={notification.tutor.avatar} />
                                            <AvatarFallback className="bg-[#257180] text-white text-xs">{notification.tutor.name.charAt(0)}</AvatarFallback>
                                          </Avatar>
                                          <span className="text-xs text-gray-500">{notification.tutor.name}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    {!notification.read && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        className="text-[#257180] hover:text-[#1e5a66] hover:bg-[#257180]/10"
                                      >
                                        Đánh dấu đã đọc
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteNotification(notification.id)}
                                      className="text-[#CB6040] hover:text-[#CB6040] hover:bg-[#CB6040]/10"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="unread">
                    <div className="space-y-4">
                      {getNotificationsByType('unread').map((notification) => (
                        <Card key={notification.id} className="bg-[#257180]/5 hover:shadow-md transition-shadow cursor-pointer border-gray-300">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-lg ${notification.bgColor} flex items-center justify-center flex-shrink-0`}>
                                <notification.icon className={`w-5 h-5 ${notification.color}`} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-medium text-[#257180]">
                                        {notification.title}
                                      </h3>
                                      <div className="w-2 h-2 bg-[#257180] rounded-full"></div>
                                      {notification.priority === 'high' && (
                                        <Badge className="bg-[#CB6040] text-white text-xs">
                                          Khẩn cấp
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-[#257180]">
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2">
                                      <span className="text-xs text-gray-500">{notification.time}</span>
                                      {notification.tutor && (
                                        <div className="flex items-center gap-2">
                                          <Avatar className="w-5 h-5">
                                            <AvatarImage src={notification.tutor.avatar} />
                                            <AvatarFallback className="bg-[#257180] text-white text-xs">{notification.tutor.name.charAt(0)}</AvatarFallback>
                                          </Avatar>
                                          <span className="text-xs text-gray-500">{notification.tutor.name}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleMarkAsRead(notification.id)}
                                      className="text-[#257180] hover:text-[#1e5a66] hover:bg-[#257180]/10"
                                    >
                                      Đánh dấu đã đọc
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteNotification(notification.id)}
                                      className="text-[#CB6040] hover:text-[#CB6040] hover:bg-[#CB6040]/10"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="important">
                    <div className="space-y-4">
                      {getNotificationsByType('important').map((notification) => (
                        <Card key={notification.id} className="border-[#CB6040]/20 bg-[#CB6040]/5 hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-lg bg-[#CB6040]/10 flex items-center justify-center flex-shrink-0">
                                <notification.icon className="w-5 h-5 text-[#CB6040]" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-medium text-[#CB6040]">
                                        {notification.title}
                                      </h3>
                                      <Badge className="bg-[#CB6040] text-white text-xs">
                                        Khẩn cấp
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-[#CB6040]">
                                      {notification.message}
                                    </p>
                                    <span className="text-xs text-gray-500 mt-2 block">{notification.time}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="session_reminder">
                    <div className="space-y-4">
                      {getNotificationsByType('session_reminder').map((notification) => (
                        <Card key={notification.id} className="hover:shadow-md transition-shadow cursor-pointer bg-white border-gray-300">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-lg bg-[#257180]/10 flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-5 h-5 text-[#257180]" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h3 className="font-medium text-black mb-1">
                                      {notification.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      {notification.message}
                                    </p>
                                    <span className="text-xs text-gray-500 mt-2 block">{notification.time}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="lg:col-span-1">
                <Card className="bg-white border-[#FD8B51] shadow-lg">
                  <CardHeader className="border-b border-gray-300">
                    <CardTitle className="text-black text-lg">Cài đặt Thông báo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-black">Email</p>
                          <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
                        </div>
                        <Switch
                          checked={notificationSettings.email}
                          onCheckedChange={(checked) =>
                            setNotificationSettings(prev => ({ ...prev, email: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-black">Push</p>
                          <p className="text-sm text-gray-600">Thông báo đẩy trên thiết bị</p>
                        </div>
                        <Switch
                          checked={notificationSettings.push}
                          onCheckedChange={(checked) =>
                            setNotificationSettings(prev => ({ ...prev, push: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-black">SMS</p>
                          <p className="text-sm text-gray-600">Tin nhắn qua điện thoại</p>
                        </div>
                        <Switch
                          checked={notificationSettings.sms}
                          onCheckedChange={(checked) =>
                            setNotificationSettings(prev => ({ ...prev, sms: checked }))
                          }
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-300 pt-4">
                      <h4 className="font-medium mb-3 text-black">Loại thông báo</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-black">Nhắc nhở lịch học</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-black">Tin nhắn mới</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-black">Thanh toán</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-black">Đánh giá</span>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full border-gray-300 text-black hover:bg-[#FD8B51] hover:text-white">
                      Lưu cài đặt
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}