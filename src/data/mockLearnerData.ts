// ========== MOCK DATA FOR LEARNER ==========
// Based on EduMatch database schema

// Subjects Master Data
export const mockSubjects = [
  { id: 1, name: 'Toán', icon: '📐' },
  { id: 2, name: 'Vật Lý', icon: '⚛️' },
  { id: 3, name: 'Hóa Học', icon: '🧪' },
  { id: 4, name: 'Sinh Học', icon: '🧬' },
  { id: 5, name: 'Ngữ Văn', icon: '📚' },
  { id: 6, name: 'Tiếng Anh', icon: '🇬🇧' },
  { id: 7, name: 'Lịch Sử', icon: '📜' },
  { id: 8, name: 'Địa Lý', icon: '🌍' },
  { id: 9, name: 'Tin Học', icon: '💻' },
];

// Grade Levels
export const mockGradeLevels = [
  { id: 1, name: 'Lớp 1', educationLevel: 'Tiểu học' },
  { id: 2, name: 'Lớp 2', educationLevel: 'Tiểu học' },
  { id: 3, name: 'Lớp 3', educationLevel: 'Tiểu học' },
  { id: 4, name: 'Lớp 4', educationLevel: 'Tiểu học' },
  { id: 5, name: 'Lớp 5', educationLevel: 'Tiểu học' },
  { id: 6, name: 'Lớp 6', educationLevel: 'THCS' },
  { id: 7, name: 'Lớp 7', educationLevel: 'THCS' },
  { id: 8, name: 'Lớp 8', educationLevel: 'THCS' },
  { id: 9, name: 'Lớp 9', educationLevel: 'THCS' },
  { id: 10, name: 'Lớp 10', educationLevel: 'THPT' },
  { id: 11, name: 'Lớp 11', educationLevel: 'THPT' },
  { id: 12, name: 'Lớp 12', educationLevel: 'THPT' },
];

// Time Slots (24 slots per day, each slot = 1 hour)
export const mockTimeSlots = [
  { id: 0, startTime: '00:00', endTime: '01:00', display: '00:00 - 01:00' },
  { id: 1, startTime: '01:00', endTime: '02:00', display: '01:00 - 02:00' },
  { id: 2, startTime: '02:00', endTime: '03:00', display: '02:00 - 03:00' },
  { id: 3, startTime: '03:00', endTime: '04:00', display: '03:00 - 04:00' },
  { id: 4, startTime: '04:00', endTime: '05:00', display: '04:00 - 05:00' },
  { id: 5, startTime: '05:00', endTime: '06:00', display: '05:00 - 06:00' },
  { id: 6, startTime: '06:00', endTime: '07:00', display: '06:00 - 07:00' },
  { id: 7, startTime: '07:00', endTime: '08:00', display: '07:00 - 08:00' },
  { id: 8, startTime: '08:00', endTime: '09:00', display: '08:00 - 09:00' },
  { id: 9, startTime: '09:00', endTime: '10:00', display: '09:00 - 10:00' },
  { id: 10, startTime: '10:00', endTime: '11:00', display: '10:00 - 11:00' },
  { id: 11, startTime: '11:00', endTime: '12:00', display: '11:00 - 12:00' },
  { id: 12, startTime: '12:00', endTime: '13:00', display: '12:00 - 13:00' },
  { id: 13, startTime: '13:00', endTime: '14:00', display: '13:00 - 14:00' },
  { id: 14, startTime: '14:00', endTime: '15:00', display: '14:00 - 15:00' },
  { id: 15, startTime: '15:00', endTime: '16:00', display: '15:00 - 16:00' },
  { id: 16, startTime: '16:00', endTime: '17:00', display: '16:00 - 17:00' },
  { id: 17, startTime: '17:00', endTime: '18:00', display: '17:00 - 18:00' },
  { id: 18, startTime: '18:00', endTime: '19:00', display: '18:00 - 19:00' },
  { id: 19, startTime: '19:00', endTime: '20:00', display: '19:00 - 20:00' },
  { id: 20, startTime: '20:00', endTime: '21:00', display: '20:00 - 21:00' },
  { id: 21, startTime: '21:00', endTime: '22:00', display: '21:00 - 22:00' },
  { id: 22, startTime: '22:00', endTime: '23:00', display: '22:00 - 23:00' },
  { id: 23, startTime: '23:00', endTime: '00:00', display: '23:00 - 00:00' },
];

// Days of Week
export const mockDaysOfWeek = [
  { id: 1, name: 'Thứ 2', shortName: 'T2' },
  { id: 2, name: 'Thứ 3', shortName: 'T3' },
  { id: 3, name: 'Thứ 4', shortName: 'T4' },
  { id: 4, name: 'Thứ 5', shortName: 'T5' },
  { id: 5, name: 'Thứ 6', shortName: 'T6' },
  { id: 6, name: 'Thứ 7', shortName: 'T7' },
  { id: 0, name: 'Chủ nhật', shortName: 'CN' },
];

export const mockCurrentUser = {
  email: 'nguyenvana@gmail.com',
  userName: 'Nguyễn Văn A',
  phone: '0912345678',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
  dob: '1995-05-15',
  gender: 1, // 1=Nam
  cityId: 1,
  cityName: 'Hà Nội',
  subDistrictId: 5,
  subDistrictName: 'Quận Ba Đình',
  addressLine: '123 Đường Láng',
  balance: 2500000,
  lockedBalance: 500000,
};

export const mockMessages = [
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

export const mockUpcomingSchedule = [
  {
    id: 1,
    bookingId: 1,
    tutorId: 1,
    tutorName: 'Nguyễn Thị Mai',
    tutorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    subject: 'Toán 12',
    date: '2025-11-10',
    dayOfWeek: 'Thứ 3',
    timeSlot: '19:00 - 21:00',
    teachingMode: 1, // 1=Trực tuyến
    location: 'Google Meet',
    status: 0, // 0=Sắp diễn ra
  },
  {
    id: 2,
    bookingId: 2,
    tutorId: 2,
    tutorName: 'Trần Văn Hoàng',
    tutorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    subject: 'Vật Lý 11',
    date: '2025-11-10',
    dayOfWeek: 'Thứ 3',
    timeSlot: '15:00 - 17:00',
    teachingMode: 0, // 0=Tại nhà
    location: '123 Đường Láng, Ba Đình, Hà Nội',
    status: 0,
  },
  {
    id: 3,
    bookingId: 3,
    tutorId: 3,
    tutorName: 'Lê Minh Tuấn',
    tutorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    subject: 'Tiếng Anh IELTS',
    date: '2025-11-11',
    dayOfWeek: 'Thứ 4',
    timeSlot: '17:00 - 19:00',
    teachingMode: 1,
    location: 'Zoom Meeting',
    status: 0,
  },
  {
    id: 4,
    bookingId: 4,
    tutorId: 4,
    tutorName: 'Phạm Thị Lan',
    tutorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    subject: 'Hóa 10',
    date: '2025-11-12',
    dayOfWeek: 'Thứ 5',
    timeSlot: '16:00 - 18:00',
    teachingMode: 0,
    location: '456 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    status: 0,
  },
  {
    id: 5,
    bookingId: 5,
    tutorId: 5,
    tutorName: 'Đỗ Văn Thành',
    tutorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    subject: 'Sinh 9',
    date: '2025-11-13',
    dayOfWeek: 'Thứ 6',
    timeSlot: '14:00 - 16:00',
    teachingMode: 1,
    location: 'Microsoft Teams',
    status: 0,
  },
];

export const mockBookings = [
  {
    id: 1,
    tutorId: 1,
    tutorName: 'Nguyễn Thị Mai',
    tutorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    subject: 'Toán 12',
    level: 'THPT',
    teachingMode: 1, // Trực tuyến
    totalSessions: 20,
    completedSessions: 5,
    remainingSessions: 15,
    unitPrice: 200000,
    totalAmount: 4000000,
    paidAmount: 4000000,
    status: 1, // 1=Đã xác nhận
    paymentStatus: 1, // 1=Đã thanh toán
    bookingDate: '2025-10-01',
    nextSession: '2025-11-10 19:00',
  },
  {
    id: 2,
    tutorId: 2,
    tutorName: 'Trần Văn Hoàng',
    tutorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    subject: 'Vật Lý 11',
    level: 'THPT',
    teachingMode: 0, // Tại nhà
    totalSessions: 15,
    completedSessions: 3,
    remainingSessions: 12,
    unitPrice: 250000,
    totalAmount: 3750000,
    paidAmount: 3750000,
    status: 1,
    paymentStatus: 1,
    bookingDate: '2025-10-15',
    nextSession: '2025-11-10 15:00',
  },
  {
    id: 3,
    tutorId: 3,
    tutorName: 'Lê Minh Tuấn',
    tutorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    subject: 'Tiếng Anh IELTS',
    level: 'Người lớn',
    teachingMode: 1,
    totalSessions: 24,
    completedSessions: 8,
    remainingSessions: 16,
    unitPrice: 300000,
    totalAmount: 7200000,
    paidAmount: 7200000,
    status: 1,
    paymentStatus: 1,
    bookingDate: '2025-09-20',
    nextSession: '2025-11-11 17:00',
  },
  {
    id: 4,
    tutorId: 4,
    tutorName: 'Phạm Thị Lan',
    tutorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    subject: 'Hóa 10',
    level: 'THPT',
    teachingMode: 0,
    totalSessions: 12,
    completedSessions: 10,
    remainingSessions: 2,
    unitPrice: 180000,
    totalAmount: 2160000,
    paidAmount: 2160000,
    status: 1,
    paymentStatus: 1,
    bookingDate: '2025-08-01',
    nextSession: '2025-11-12 16:00',
  },
  {
    id: 5,
    tutorId: 5,
    tutorName: 'Đỗ Văn Thành',
    tutorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    subject: 'Sinh 9',
    level: 'THCS',
    teachingMode: 1,
    totalSessions: 10,
    completedSessions: 2,
    remainingSessions: 8,
    unitPrice: 150000,
    totalAmount: 1500000,
    paidAmount: 1500000,
    status: 1,
    paymentStatus: 1,
    bookingDate: '2025-10-25',
    nextSession: '2025-11-13 14:00',
  },
  {
    id: 6,
    tutorId: 6,
    tutorName: 'Hoàng Văn Nam',
    tutorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    subject: 'Toán 8',
    level: 'THCS',
    teachingMode: 0,
    totalSessions: 8,
    completedSessions: 8,
    remainingSessions: 0,
    unitPrice: 160000,
    totalAmount: 1280000,
    paidAmount: 1280000,
    status: 2, // 2=Hoàn thành
    paymentStatus: 1,
    bookingDate: '2025-07-01',
    nextSession: null,
  },
  {
    id: 7,
    tutorId: 7,
    tutorName: 'Vũ Thị Hằng',
    tutorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    subject: 'Văn 12',
    level: 'THPT',
    teachingMode: 1,
    totalSessions: 16,
    completedSessions: 0,
    remainingSessions: 16,
    unitPrice: 190000,
    totalAmount: 3040000,
    paidAmount: 3040000,
    status: 0, // 0=Chờ xác nhận
    paymentStatus: 1,
    bookingDate: '2025-11-05',
    nextSession: null,
  },
];

export const mockWalletTransactions = [
  {
    id: 1,
    amount: 500000,
    transactionType: 1, // 1=CREDIT (Nạp)
    reason: 0, // 0=Nạp tiền
    status: 1, // 1=Hoàn thành
    balanceBefore: 2000000,
    balanceAfter: 2500000,
    createdAt: '2025-11-09 14:30:00',
    referenceCode: 'DEP-20251109-001',
    description: 'Nạp tiền qua VNPay',
  },
  {
    id: 2,
    amount: 4000000,
    transactionType: 0, // 0=DEBIT (Trừ)
    reason: 2, // 2=Thanh toán booking
    status: 1,
    balanceBefore: 6000000,
    balanceAfter: 2000000,
    createdAt: '2025-10-01 10:15:00',
    referenceCode: 'BKG-1',
    description: 'Thanh toán lớp Toán 12 - 20 buổi',
  },
  {
    id: 3,
    amount: 3750000,
    transactionType: 0,
    reason: 2,
    status: 1,
    balanceBefore: 9750000,
    balanceAfter: 6000000,
    createdAt: '2025-10-15 16:20:00',
    referenceCode: 'BKG-2',
    description: 'Thanh toán lớp Vật Lý 11 - 15 buổi',
  },
  {
    id: 4,
    amount: 200000,
    transactionType: 1,
    reason: 3, // 3=Hoàn tiền
    status: 1,
    balanceBefore: 1800000,
    balanceAfter: 2000000,
    createdAt: '2025-11-08 09:00:00',
    referenceCode: 'REF-20251108-001',
    description: 'Hoàn tiền buổi học bị hủy',
  },
  {
    id: 5,
    amount: 1000000,
    transactionType: 1,
    reason: 0,
    status: 1,
    balanceBefore: 8750000,
    balanceAfter: 9750000,
    createdAt: '2025-10-10 11:45:00',
    referenceCode: 'DEP-20251010-002',
    description: 'Nạp tiền qua MoMo',
  },
];

// Mock Class Requests Data (Yêu cầu mở lớp) - Only first 3 for brevity
export const mockClassRequests = [
  {
    id: 1,
    learnerId: 'user123',
    learnerName: 'Nguyễn Văn A',
    learnerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
    subjectId: 1, // Toán
    subjectName: 'Toán',
    gradeId: 12, // Lớp 12
    gradeName: 'Lớp 12',
    displayName: 'Toán 12',
    description: 'Cần tìm gia sư dạy Toán 12 để ôn thi THPT Quốc gia. Tôi đang gặp khó khăn với chuyên đề hàm số, đạo hàm và tích phân. Mong muốn tìm gia sư nhiệt tình, giảng dạy dễ hiểu và có phương pháp học hiệu quả. Ưu tiên gia sư có kinh nghiệm luyện thi THPT Quốc gia.',
    teachingMode: 1, // 1=Trực tuyến
    sessionPerWeek: 3,
    totalSessions: 20,
    minPrice: 180000,
    maxPrice: 220000,
    location: null,
    cityId: 1,
    cityName: 'Hà Nội',
    subDistrictId: 5,
    subDistrictName: 'Quận Ba Đình',
    status: 1, // 0=Draft, 1=Open, 2=Closed, 3=Cancelled
    totalApplicants: 5,
    createdAt: '2025-11-01 10:00:00',
    expiresAt: '2025-11-20 23:59:59',
  },
  // ... more requests would be here but truncated for brevity
];

// Mock Class Applications (Ứng tuyển vào yêu cầu mở lớp)
export const mockClassApplications = {
  1: [ // Class Request ID 1
    {
      id: 1,
      tutorId: 1,
      tutorName: 'Nguyễn Thị Mai',
      tutorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      rating: 4.8,
      totalReviews: 45,
      experience: 5, // năm
      education: 'Cử nhân Toán - ĐH Sư phạm Hà Nội',
      proposedPrice: 200000,
      coverLetter: 'Em có 5 năm kinh nghiệm dạy Toán THPT, đặc biệt chuyên về luyện thi THPT Quốc gia. Em đã giúp nhiều học sinh đạt điểm 9-10 môn Toán.',
      appliedAt: '2025-11-02 08:30:00',
      status: 0, // 0=Pending, 1=Accepted, 2=Rejected
    },
  ],
};

// Mock Notifications (Thông báo)
export const mockNotifications = [
  {
    id: 1,
    type: 'class_request', // class_request, tutor_application, payment, message, system
    title: 'Có gia sư mới ứng tuyển',
    message: 'Gia sư Nguyễn Thị Mai vừa ứng tuyển vào yêu cầu "Dạy Toán lớp 12" của bạn',
    isRead: false,
    createdAt: '2025-11-03 09:30:00',
    link: '/profile?tab=classRequests',
    relatedId: 1, // Class Request ID
  },
  {
    id: 2,
    type: 'payment',
    title: 'Thanh toán thành công',
    message: 'Bạn đã nạp 500.000₫ vào ví thành công',
    isRead: false,
    createdAt: '2025-11-02 14:20:00',
    link: '/profile?tab=wallet',
    relatedId: null,
  },
  {
    id: 3,
    type: 'class_request',
    title: 'Yêu cầu mở lớp sắp hết hạn',
    message: 'Yêu cầu "Luyện thi IELTS Speaking" của bạn sẽ hết hạn vào 15/12/2025',
    isRead: false,
    createdAt: '2025-11-02 10:00:00',
    link: '/profile?tab=classRequests',
    relatedId: 2,
  },
  {
    id: 4,
    type: 'tutor_application',
    title: '3 gia sư mới ứng tuyển',
    message: 'Có 3 gia sư vừa ứng tuyển vào yêu cầu "Dạy Toán lớp 12" của bạn',
    isRead: true,
    createdAt: '2025-11-02 08:15:00',
    link: '/profile?tab=classRequests',
    relatedId: 1,
  },
  {
    id: 5,
    type: 'message',
    title: 'Tin nhắn mới từ gia sư',
    message: 'Trần Văn Hoàng đã gửi tin nhắn cho bạn',
    isRead: true,
    createdAt: '2025-11-01 16:45:00',
    link: '/profile?tab=messages',
    relatedId: null,
  },
  {
    id: 6,
    type: 'system',
    title: 'Cập nhật điều khoản sử dụng',
    message: 'Chúng tôi đã cập nhật điều khoản sử dụng. Vui lòng xem lại',
    isRead: true,
    createdAt: '2025-11-01 09:00:00',
    link: null,
    relatedId: null,
  },
  {
    id: 7,
    type: 'payment',
    title: 'Thanh toán lớp học thành công',
    message: 'Bạn đã thanh toán 2.400.000₫ cho lớp "Toán 12 - Chuyên đề Hàm số"',
    isRead: true,
    createdAt: '2025-10-30 11:20:00',
    link: '/profile?tab=wallet',
    relatedId: null,
  },
  {
    id: 8,
    type: 'class_request',
    title: 'Yêu cầu mở lớp đã được duyệt',
    message: 'Yêu cầu "Dạy Toán lớp 12" của bạn đã được duyệt và công khai',
    isRead: true,
    createdAt: '2025-10-29 14:00:00',
    link: '/profile?tab=classRequests',
    relatedId: 1,
  },
];

// Helper functions
export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0₫';
  }
  return amount.toLocaleString('vi-VN') + '₫';
};

export const getTeachingModeText = (mode: number): string => {
  switch (mode) {
    case 0:
      return 'Tại nhà';
    case 1:
      return 'Trực tuyến';
    case 2:
      return 'Kết hợp';
    default:
      return 'Không xác định';
  }
};

export const getBookingStatusText = (status: number): string => {
  switch (status) {
    case 0:
      return 'Chờ xác nhận';
    case 1:
      return 'Đã xác nhận';
    case 2:
      return 'Hoàn thành';
    case 3:
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
};

export const getBookingStatusColor = (status: number): string => {
  switch (status) {
    case 0:
      return 'bg-yellow-100 text-yellow-800';
    case 1:
      return 'bg-green-100 text-green-800';
    case 2:
      return 'bg-blue-100 text-blue-800';
    case 3:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getClassRequestStatusText = (status: number): string => {
  switch (status) {
    case 0:
      return 'Nháp';
    case 1:
      return 'Đang mở';
    case 2:
      return 'Đã đóng';
    case 3:
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
};

export const getClassRequestStatusColor = (status: number): string => {
  switch (status) {
    case 0:
      return 'bg-gray-100 text-gray-800';
    case 1:
      return 'bg-green-100 text-green-800';
    case 2:
      return 'bg-blue-100 text-blue-800';
    case 3:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

