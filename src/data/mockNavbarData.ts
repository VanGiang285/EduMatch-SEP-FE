// Mock data for Navbar dropdowns

export interface MessageItem {
  id: number;
  tutorId: number;
  tutorName: string;
  tutorAvatar: string | null;
  lastMessage: string;
  timestamp: string;
  isRead: boolean;
  unreadCount: number;
}

export interface NotificationItem {
  id: number;
  type: 'class_request' | 'tutor_application' | 'payment' | 'message' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const mockNavbarMessages: MessageItem[] = [
  {
    id: 1,
    tutorId: 1,
    tutorName: 'Nguyễn Thị Mai',
    tutorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    lastMessage: 'Em có thể học vào buổi tối thứ 3 được không ạ?',
    timestamp: '10 phút trước',
    isRead: false,
    unreadCount: 2,
  },
  {
    id: 2,
    tutorId: 2,
    tutorName: 'Trần Văn Hoàng',
    tutorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    lastMessage: 'Cảm ơn em đã đặt lịch. Thầy sẽ chuẩn bị tài liệu cho buổi học đầu tiên nhé.',
    timestamp: '2 giờ trước',
    isRead: true,
    unreadCount: 0,
  },
  {
    id: 3,
    tutorId: 3,
    tutorName: 'Lê Minh Tuấn',
    tutorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    lastMessage: 'Link Zoom cho buổi học mai: https://zoom.us/j/123456789',
    timestamp: '1 ngày trước',
    isRead: true,
    unreadCount: 0,
  },
  {
    id: 4,
    tutorId: 4,
    tutorName: 'Phạm Thị Lan',
    tutorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    lastMessage: 'Em đã hoàn thành bài tập chưa?',
    timestamp: '2 ngày trước',
    isRead: true,
    unreadCount: 0,
  },
  {
    id: 5,
    tutorId: 5,
    tutorName: 'Đỗ Văn Thành',
    tutorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    lastMessage: 'Buổi học hôm nay rất tốt! Cố gắng luyện tập thêm nhé.',
    timestamp: '3 ngày trước',
    isRead: true,
    unreadCount: 0,
  },
];

export const mockNavbarNotifications: NotificationItem[] = [
  {
    id: 1,
    type: 'class_request',
    title: 'Có gia sư mới ứng tuyển',
    message: 'Gia sư Nguyễn Thị Mai vừa ứng tuyển vào yêu cầu "Dạy Toán lớp 12" của bạn',
    isRead: false,
    createdAt: '2025-11-03 09:30:00',
  },
  {
    id: 2,
    type: 'payment',
    title: 'Thanh toán thành công',
    message: 'Bạn đã nạp 500.000₫ vào ví thành công',
    isRead: false,
    createdAt: '2025-11-02 14:20:00',
  },
  {
    id: 3,
    type: 'class_request',
    title: 'Yêu cầu mở lớp sắp hết hạn',
    message: 'Yêu cầu "Luyện thi IELTS Speaking" của bạn sẽ hết hạn vào 15/12/2025',
    isRead: false,
    createdAt: '2025-11-02 10:00:00',
  },
  {
    id: 4,
    type: 'tutor_application',
    title: '3 gia sư mới ứng tuyển',
    message: 'Có 3 gia sư vừa ứng tuyển vào yêu cầu "Dạy Toán lớp 12" của bạn',
    isRead: true,
    createdAt: '2025-11-02 08:15:00',
  },
  {
    id: 5,
    type: 'message',
    title: 'Tin nhắn mới từ gia sư',
    message: 'Trần Văn Hoàng đã gửi tin nhắn cho bạn',
    isRead: true,
    createdAt: '2025-11-01 16:45:00',
  },
  {
    id: 6,
    type: 'system',
    title: 'Cập nhật hệ thống',
    message: 'Hệ thống sẽ được bảo trì từ 02:00-04:00 ngày 16/11/2025',
    isRead: true,
    createdAt: '2025-11-01 12:00:00',
  },
  {
    id: 7,
    type: 'payment',
    title: 'Rút tiền thành công',
    message: 'Bạn đã rút 1.000.000₫ về tài khoản ngân hàng thành công',
    isRead: true,
    createdAt: '2025-10-30 15:30:00',
  },
  {
    id: 8,
    type: 'tutor_application',
    title: 'Gia sư đã chấp nhận yêu cầu',
    message: 'Gia sư Lê Minh Tuấn đã chấp nhận yêu cầu "Dạy Hóa học lớp 11" của bạn',
    isRead: true,
    createdAt: '2025-10-29 09:20:00',
  },
];

