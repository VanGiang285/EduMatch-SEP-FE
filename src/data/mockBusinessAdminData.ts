// Mock data for Business Admin features

// Helper functions
export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0₫';
  }
  return `${amount.toLocaleString('vi-VN')}₫`;
};

// ============== LEARNERS DATA ==============
export const mockLearners = [
  {
    id: 1,
    email: 'nguyenvana@gmail.com',
    userName: 'Nguyễn Văn A',
    phone: '0901234567',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
    isActive: true,
    createdAt: '2025-01-15T08:30:00',
    profile: {
      dob: '1995-05-20',
      gender: 1, // Nam
      cityName: 'Hà Nội',
      subDistrictName: 'Quận Cầu Giấy',
      addressLine: '123 Trần Duy Hưng',
    },
    stats: {
      totalClasses: 5,
      totalBookings: 12,
      totalSpent: 3500000,
      walletBalance: 500000,
    }
  },
  {
    id: 2,
    email: 'tranthib@gmail.com',
    userName: 'Trần Thị B',
    phone: '0912345678',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    isActive: true,
    createdAt: '2025-02-10T14:20:00',
    profile: {
      dob: '1998-08-15',
      gender: 2, // Nữ
      cityName: 'Thành phố Hồ Chí Minh',
      subDistrictName: 'Quận 1',
      addressLine: '456 Nguyễn Huệ',
    },
    stats: {
      totalClasses: 3,
      totalBookings: 8,
      totalSpent: 2400000,
      walletBalance: 300000,
    }
  },
  {
    id: 3,
    email: 'phamvanc@gmail.com',
    userName: 'Phạm Văn C',
    phone: '0923456789',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    isActive: false,
    createdAt: '2025-03-05T10:15:00',
    profile: {
      dob: '2000-12-10',
      gender: 1,
      cityName: 'Đà Nẵng',
      subDistrictName: 'Quận Hải Châu',
      addressLine: '789 Lê Duẩn',
    },
    stats: {
      totalClasses: 1,
      totalBookings: 2,
      totalSpent: 600000,
      walletBalance: 0,
    }
  },
  {
    id: 4,
    email: 'lethid@gmail.com',
    userName: 'Lê Thị D',
    phone: '0934567890',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    isActive: true,
    createdAt: '2025-04-12T16:45:00',
    profile: {
      dob: '1997-03-25',
      gender: 2,
      cityName: 'Hà Nội',
      subDistrictName: 'Quận Hoàn Kiếm',
      addressLine: '321 Hàng Bài',
    },
    stats: {
      totalClasses: 7,
      totalBookings: 18,
      totalSpent: 5200000,
      walletBalance: 800000,
    }
  },
  {
    id: 5,
    email: 'hoangvane@gmail.com',
    userName: 'Hoàng Văn E',
    phone: '0945678901',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    isActive: true,
    createdAt: '2025-05-20T09:30:00',
    profile: {
      dob: '1999-07-08',
      gender: 1,
      cityName: 'Cần Thơ',
      subDistrictName: 'Quận Ninh Kiều',
      addressLine: '654 Mậu Thân',
    },
    stats: {
      totalClasses: 2,
      totalBookings: 5,
      totalSpent: 1500000,
      walletBalance: 200000,
    }
  },
];

// ============== TUTORS DATA ==============
export const mockTutors = [
  {
    id: 1,
    email: 'tutor1@gmail.com',
    userName: 'Nguyễn Thị Mai',
    phone: '0987654321',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    isActive: true,
    createdAt: '2024-11-10T08:00:00',
    profile: {
      cityName: 'Hà Nội',
      subDistrictName: 'Quận Cầu Giấy',
      addressLine: '123 Trần Duy Hưng',
    },
    tutorProfile: {
      status: 1, // Đã duyệt
      teachingModes: 2, // Kết hợp
      bio: 'Gia sư với 7 năm kinh nghiệm dạy Toán THPT',
      rating: 4.8,
      totalReviews: 45,
      totalStudents: 120,
      totalEarnings: 15000000,
    },
    subjects: [
      { name: 'Toán', level: 'Lớp 12', hourlyRate: 250000 },
      { name: 'Toán', level: 'Lớp 11', hourlyRate: 220000 },
    ],
    education: [
      {
        id: 1,
        institutionName: 'Đại học Sư phạm Hà Nội',
        issueDate: '2016-06-15',
        verified: 1,
      },
    ],
    certificates: [
      {
        id: 1,
        certificateName: 'Chứng chỉ Giáo viên Toán',
        issueDate: '2019-03-20',
        verified: 1,
      },
    ],
  },
  {
    id: 2,
    email: 'tutor2@gmail.com',
    userName: 'Trần Văn Hoàng',
    phone: '0976543210',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    isActive: true,
    createdAt: '2024-12-05T14:30:00',
    profile: {
      cityName: 'Thành phố Hồ Chí Minh',
      subDistrictName: 'Quận 1',
      addressLine: '456 Nguyễn Huệ',
    },
    tutorProfile: {
      status: 1,
      teachingModes: 1, // Online
      bio: 'Thạc sỹ Toán học, chuyên luyện thi THPT Quốc gia',
      rating: 4.9,
      totalReviews: 67,
      totalStudents: 150,
      totalEarnings: 22000000,
    },
    subjects: [
      { name: 'Toán', level: 'Lớp 12', hourlyRate: 280000 },
    ],
    education: [
      {
        id: 1,
        institutionName: 'Đại học Khoa học Tự nhiên TPHCM',
        issueDate: '2018-06-15',
        verified: 1,
      },
    ],
    certificates: [],
  },
  {
    id: 3,
    email: 'tutor3@gmail.com',
    userName: 'Lê Minh Tuấn',
    phone: '0965432109',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    isActive: false,
    createdAt: '2025-01-20T10:00:00',
    profile: {
      cityName: 'Đà Nẵng',
      subDistrictName: 'Quận Hải Châu',
      addressLine: '789 Lê Duẩn',
    },
    tutorProfile: {
      status: 3, // Tạm khóa
      teachingModes: 0, // Offline
      bio: 'Giảng viên Vật Lý tại trường THPT chuyên',
      rating: 4.7,
      totalReviews: 32,
      totalStudents: 85,
      totalEarnings: 9500000,
    },
    subjects: [
      { name: 'Vật Lý', level: 'Lớp 11', hourlyRate: 200000 },
      { name: 'Vật Lý', level: 'Lớp 10', hourlyRate: 180000 },
    ],
    education: [
      {
        id: 1,
        institutionName: 'Đại học Sư phạm Đà Nẵng',
        issueDate: '2017-06-15',
        verified: 1,
      },
    ],
    certificates: [],
  },
  {
    id: 4,
    email: 'tutor4@gmail.com',
    userName: 'Phạm Thị Lan',
    phone: '0954321098',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    isActive: true,
    createdAt: '2025-02-15T11:20:00',
    profile: {
      cityName: 'Hà Nội',
      subDistrictName: 'Quận Hoàn Kiếm',
      addressLine: '321 Hàng Bài',
    },
    tutorProfile: {
      status: 1,
      teachingModes: 2,
      bio: 'Cử nhân Hóa học, 5 năm kinh nghiệm',
      rating: 4.6,
      totalReviews: 28,
      totalStudents: 65,
      totalEarnings: 7200000,
    },
    subjects: [
      { name: 'Hóa Học', level: 'Lớp 10', hourlyRate: 190000 },
      { name: 'Hóa Học', level: 'Lớp 11', hourlyRate: 210000 },
    ],
    education: [
      {
        id: 1,
        institutionName: 'Đại học Bách Khoa Hà Nội',
        issueDate: '2019-06-15',
        verified: 1,
      },
    ],
    certificates: [
      {
        id: 1,
        certificateName: 'Chứng chỉ Giáo viên Hóa học',
        issueDate: '2020-08-10',
        verified: 1,
      },
    ],
  },
  {
    id: 5,
    email: 'tutor5@gmail.com',
    userName: 'Đỗ Văn Nam',
    phone: '0943210987',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    isActive: true,
    createdAt: '2025-03-10T15:45:00',
    profile: {
      cityName: 'Cần Thơ',
      subDistrictName: 'Quận Ninh Kiều',
      addressLine: '654 Mậu Thân',
    },
    tutorProfile: {
      status: 1,
      teachingModes: 1,
      bio: 'Giáo viên Tiếng Anh IELTS 8.0',
      rating: 4.9,
      totalReviews: 52,
      totalStudents: 95,
      totalEarnings: 12500000,
    },
    subjects: [
      { name: 'Tiếng Anh', level: 'Lớp 9', hourlyRate: 230000 },
      { name: 'Tiếng Anh', level: 'Lớp 12', hourlyRate: 270000 },
    ],
    education: [
      {
        id: 1,
        institutionName: 'Đại học Ngoại ngữ - Đại học Quốc gia Hà Nội',
        issueDate: '2015-06-15',
        verified: 1,
      },
    ],
    certificates: [
      {
        id: 1,
        certificateName: 'IELTS 8.0',
        issueDate: '2018-11-15',
        verified: 1,
      },
      {
        id: 2,
        certificateName: 'TESOL Certificate',
        issueDate: '2019-05-20',
        verified: 1,
      },
    ],
  },
];

// ============== TUTOR APPLICATIONS DATA ==============
export const mockTutorApplications = [
  {
    id: 1,
    email: 'newtutor1@gmail.com',
    userName: 'Vũ Thị Hương',
    phone: '0932109876',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    appliedAt: '2025-10-25T09:00:00',
    tutorProfile: {
      status: 0, // Chờ duyệt
      teachingModes: 2,
      bio: 'Cử nhân Sư phạm Toán, mong muốn chia sẻ kiến thức với học sinh',
      videoIntroUrl: null,
    },
    profile: {
      dob: '1996-04-15',
      gender: 2,
      cityName: 'Hà Nội',
      subDistrictName: 'Quận Đống Đa',
      addressLine: '88 Nguyễn Chí Thanh',
    },
    education: [
      {
        id: 1,
        institutionName: 'Đại học Sư phạm Hà Nội',
        institutionType: 2, // University
        issueDate: '2018-06-20',
        certificateUrl: 'https://example.com/cert1.pdf',
        verified: 0, // Chờ duyệt
        rejectReason: null,
      }
    ],
    certificates: [
      {
        id: 1,
        typeName: 'Chứng chỉ sư phạm',
        issueDate: '2018-08-15',
        expiryDate: null,
        certificateUrl: 'https://example.com/cert2.pdf',
        verified: 0,
        rejectReason: null,
      }
    ],
    subjects: [
      { name: 'Toán', level: 'Lớp 10', hourlyRate: 180000 },
      { name: 'Toán', level: 'Lớp 11', hourlyRate: 200000 },
    ]
  },
  {
    id: 2,
    email: 'newtutor2@gmail.com',
    userName: 'Bùi Văn Đức',
    phone: '0921098765',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    appliedAt: '2025-10-28T14:30:00',
    tutorProfile: {
      status: 0,
      teachingModes: 1, // Online
      bio: 'Sinh viên năm 4 chuyên ngành Vật Lý, có kinh nghiệm dạy kèm 2 năm',
      videoIntroUrl: 'https://example.com/intro-video.mp4',
    },
    profile: {
      dob: '2002-09-10',
      gender: 1,
      cityName: 'Thành phố Hồ Chí Minh',
      subDistrictName: 'Quận 3',
      addressLine: '123 Võ Văn Tần',
    },
    education: [
      {
        id: 2,
        institutionName: 'Đại học Khoa học Tự nhiên TP.HCM',
        institutionType: 2,
        issueDate: null, // Chưa tốt nghiệp
        certificateUrl: null,
        verified: 0,
        rejectReason: null,
      }
    ],
    certificates: [],
    subjects: [
      { name: 'Vật Lý', level: 'Lớp 10', hourlyRate: 160000 },
      { name: 'Vật Lý', level: 'Lớp 11', hourlyRate: 180000 },
    ]
  },
  {
    id: 3,
    email: 'newtutor3@gmail.com',
    userName: 'Ngô Thị Thanh',
    phone: '0910987654',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    appliedAt: '2025-10-30T10:15:00',
    tutorProfile: {
      status: 0,
      teachingModes: 0, // Offline
      bio: 'Giáo viên Hóa học 10 năm kinh nghiệm, từng giảng dạy tại THPT chuyên',
      videoIntroUrl: null,
    },
    profile: {
      dob: '1985-12-20',
      gender: 2,
      cityName: 'Hà Nội',
      subDistrictName: 'Quận Thanh Xuân',
      addressLine: '456 Nguyễn Trãi',
    },
    education: [
      {
        id: 3,
        institutionName: 'Đại học Bách khoa Hà Nội',
        institutionType: 2,
        issueDate: '2007-06-15',
        certificateUrl: 'https://example.com/cert3.pdf',
        verified: 1, // Đã xác minh
        rejectReason: null,
      },
      {
        id: 4,
        institutionName: 'Đại học Sư phạm Hà Nội',
        institutionType: 2,
        issueDate: '2010-08-20',
        certificateUrl: 'https://example.com/cert4.pdf',
        verified: 0, // Chờ duyệt
        rejectReason: null,
      }
    ],
    certificates: [
      {
        id: 2,
        typeName: 'Chứng chỉ giảng viên',
        issueDate: '2010-09-01',
        expiryDate: null,
        certificateUrl: 'https://example.com/cert5.pdf',
        verified: 1,
        rejectReason: null,
      },
      {
        id: 3,
        typeName: 'Giấy chứng nhận giáo viên xuất sắc',
        issueDate: '2020-10-10',
        expiryDate: null,
        certificateUrl: 'https://example.com/cert6.pdf',
        verified: 0,
        rejectReason: null,
      }
    ],
    subjects: [
      { name: 'Hóa Học', level: 'Lớp 10', hourlyRate: 200000 },
      { name: 'Hóa Học', level: 'Lớp 11', hourlyRate: 220000 },
      { name: 'Hóa Học', level: 'Lớp 12', hourlyRate: 250000 },
    ]
  },
];

// ============== CLASS REQUESTS DATA ==============
export const mockClassRequestsForAdmin = [
  {
    id: 1,
    learnerEmail: 'nguyenvana@gmail.com',
    learnerName: 'Nguyễn Văn A',
    learnerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
    subjectName: 'Toán',
    levelName: 'Lớp 12',
    teachingMode: 1, // Online
    cityName: 'Hà Nội',
    subDistrictName: 'Quận Cầu Giấy',
    expectedTotalSessions: 20,
    targetUnitPriceMin: 180000,
    targetUnitPriceMax: 250000,
    description: 'Cần gia sư dạy Toán 12 để ôn thi THPT Quốc gia. Học sinh cần nắm vững kiến thức hàm số, đạo hàm và tích phân.',
    status: 0, // Chờ duyệt
    createdAt: '2025-11-01T08:30:00',
    totalApplicants: 0,
    slots: [
      { dayOfWeek: 1, timeSlot: '19:00 - 21:00' },
      { dayOfWeek: 3, timeSlot: '19:00 - 21:00' },
      { dayOfWeek: 5, timeSlot: '19:00 - 21:00' },
    ]
  },
  {
    id: 2,
    learnerEmail: 'tranthib@gmail.com',
    learnerName: 'Trần Thị B',
    learnerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    subjectName: 'Tiếng Anh',
    levelName: 'Lớp 9',
    teachingMode: 0, // Offline
    cityName: 'Thành phố Hồ Chí Minh',
    subDistrictName: 'Quận 1',
    expectedTotalSessions: 15,
    targetUnitPriceMin: 200000,
    targetUnitPriceMax: 300000,
    description: 'Tìm gia sư Tiếng Anh để ôn thi vào lớp 10. Cần tập trung vào ngữ pháp và kỹ năng làm bài thi.',
    status: 1, // Đã duyệt
    createdAt: '2025-10-28T14:20:00',
    totalApplicants: 5,
    slots: [
      { dayOfWeek: 2, timeSlot: '17:00 - 19:00' },
      { dayOfWeek: 4, timeSlot: '17:00 - 19:00' },
    ]
  },
  {
    id: 3,
    learnerEmail: 'lethid@gmail.com',
    learnerName: 'Lê Thị D',
    learnerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    subjectName: 'Vật Lý',
    levelName: 'Lớp 11',
    teachingMode: 1,
    cityName: 'Hà Nội',
    subDistrictName: 'Quận Hoàn Kiếm',
    expectedTotalSessions: 16,
    targetUnitPriceMin: 180000,
    targetUnitPriceMax: 250000,
    description: 'Học sinh cần bổ sung kiến thức Vật Lý 11, đặc biệt là phần điện học và dao động cơ.',
    status: 0,
    createdAt: '2025-11-02T09:15:00',
    totalApplicants: 0,
    slots: [
      { dayOfWeek: 1, timeSlot: '18:00 - 20:00' },
      { dayOfWeek: 3, timeSlot: '18:00 - 20:00' },
    ]
  },
];

// ============== REPORTS DATA ==============
export const mockReports = [
  {
    id: 1,
    reporterEmail: 'nguyenvana@gmail.com',
    reporterName: 'Nguyễn Văn A',
    reporterAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
    reportedTutorId: 3,
    reportedTutorName: 'Lê Minh Tuấn',
    reportedTutorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    reason: 'Gia sư thường xuyên đến muộn và không thông báo trước',
    description: 'Trong 5 buổi học gần đây, gia sư đã đến muộn 3 buổi, mỗi lần khoảng 15-20 phút. Điều này ảnh hưởng đến tiến độ học của con tôi.',
    evidenceUrls: [
      'https://example.com/evidence1.jpg',
      'https://example.com/evidence2.jpg',
    ],
    status: 0, // Chờ xử lý
    createdAt: '2025-10-20T10:30:00',
    relatedBookingId: 5,
  },
  {
    id: 2,
    reporterEmail: 'tranthib@gmail.com',
    reporterName: 'Trần Thị B',
    reporterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    reportedTutorId: 1,
    reportedTutorName: 'Nguyễn Thị Mai',
    reportedTutorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    reason: 'Nội dung giảng dạy không đúng với mô tả',
    description: 'Gia sư cam kết sẽ dạy chuyên sâu về giải tích nhưng thực tế chỉ dạy lại kiến thức cơ bản.',
    evidenceUrls: [],
    status: 1, // Đã xử lý
    createdAt: '2025-10-15T14:00:00',
    relatedBookingId: 3,
    adminNote: 'Đã xác minh với gia sư. Gia sư đồng ý điều chỉnh nội dung giảng dạy theo yêu cầu.',
    resolvedAt: '2025-10-18T16:30:00',
  },
  {
    id: 3,
    reporterEmail: 'lethid@gmail.com',
    reporterName: 'Lê Thị D',
    reporterAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    reportedTutorId: 2,
    reportedTutorName: 'Trần Văn Hoàng',
    reportedTutorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    reason: 'Gia sư có thái độ không phù hợp',
    description: 'Gia sư thường xuyên la mắng con tôi khi làm bài sai, gây ảnh hưởng đến tâm lý học tập.',
    evidenceUrls: [
      'https://example.com/evidence3.mp4',
    ],
    status: 0,
    createdAt: '2025-10-28T11:20:00',
    relatedBookingId: 8,
  },
];

// ============== WALLET TRANSACTIONS DATA ==============
export const mockSystemWalletTransactions = [
  {
    id: 1,
    walletId: 1,
    amount: 3000000,
    transactionType: 1, // CREDIT (Cộng tiền)
    reason: 2, // THANH TOÁN BOOKING
    status: 1, // COMPLETED
    balanceBefore: 50000000,
    balanceAfter: 53000000,
    createdAt: '2025-11-01T10:00:00',
    referenceCode: 'BOOKING-001',
    bookingId: 1,
    userEmail: 'nguyenvana@gmail.com',
    userName: 'Nguyễn Văn A',
  },
  {
    id: 2,
    walletId: 1,
    amount: 2700000,
    transactionType: 0, // DEBIT (Trừ tiền)
    reason: 4, // NHẬN TIỀN TỪ BOOKING
    status: 1,
    balanceBefore: 53000000,
    balanceAfter: 50300000,
    createdAt: '2025-11-05T15:30:00',
    referenceCode: 'BOOKING-001-PAYOUT',
    bookingId: 1,
    tutorEmail: 'tutor1@gmail.com',
    tutorName: 'Nguyễn Thị Mai',
  },
  {
    id: 3,
    walletId: 1,
    amount: 300000,
    transactionType: 1, // CREDIT
    reason: 5, // THU PHÍ NỀN TẢNG
    status: 1,
    balanceBefore: 50300000,
    balanceAfter: 50600000,
    createdAt: '2025-11-05T15:30:00',
    referenceCode: 'BOOKING-001-FEE',
    bookingId: 1,
  },
  {
    id: 4,
    walletId: 1,
    amount: 2400000,
    transactionType: 1,
    reason: 2,
    status: 1,
    balanceBefore: 50600000,
    balanceAfter: 53000000,
    createdAt: '2025-11-03T09:20:00',
    referenceCode: 'BOOKING-002',
    bookingId: 2,
    userEmail: 'tranthib@gmail.com',
    userName: 'Trần Thị B',
  },
];

// ============== DASHBOARD STATS ==============
export const mockDashboardStats = {
  overview: {
    totalRevenue: 50600000, // Tổng doanh thu (số dư ví hệ thống)
    totalTransactions: 1250,
    totalLearners: 350,
    totalTutors: 180,
    pendingApprovals: 15, // Chờ duyệt (tutor apps + class requests)
  },
  revenueByMonth: [
    { month: 'T1', revenue: 3500000 },
    { month: 'T2', revenue: 4200000 },
    { month: 'T3', revenue: 5800000 },
    { month: 'T4', revenue: 4900000 },
    { month: 'T5', revenue: 6300000 },
    { month: 'T6', revenue: 7100000 },
    { month: 'T7', revenue: 6800000 },
    { month: 'T8', revenue: 7500000 },
    { month: 'T9', revenue: 8200000 },
    { month: 'T10', revenue: 9100000 },
    { month: 'T11', revenue: 7600000, current: true },
  ],
  transactionsByType: [
    { name: 'Thanh toán Booking', value: 45, color: '#257180' },
    { name: 'Phí nền tảng', value: 35, color: '#FD8B51' },
    { name: 'Hoàn tiền', value: 12, color: '#CB6040' },
    { name: 'Chi trả gia sư', value: 8, color: '#F2E5BF' },
  ],
  recentTransactions: mockSystemWalletTransactions.slice(0, 5),
};

// Helper functions for status
export const getTutorStatusText = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: 'Chờ duyệt',
    1: 'Đã duyệt',
    2: 'Bị từ chối',
    3: 'Tạm khóa',
    4: 'Ngừng hoạt động',
  };
  return statusMap[status] || 'Không xác định';
};

export const getTutorStatusColor = (status: number): string => {
  const colorMap: Record<number, string> = {
    0: 'bg-yellow-100 text-yellow-800',
    1: 'bg-green-100 text-green-800',
    2: 'bg-red-100 text-red-800',
    3: 'bg-orange-100 text-orange-800',
    4: 'bg-gray-100 text-gray-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const getVerifyStatusText = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: 'Chờ duyệt',
    1: 'Đã xác minh',
    2: 'Bị từ chối',
    3: 'Hết hạn',
    4: 'Đã xóa',
  };
  return statusMap[status] || 'Không xác định';
};

export const getVerifyStatusColor = (status: number): string => {
  const colorMap: Record<number, string> = {
    0: 'bg-yellow-100 text-yellow-800',
    1: 'bg-green-100 text-green-800',
    2: 'bg-red-100 text-red-800',
    3: 'bg-gray-100 text-gray-800',
    4: 'bg-gray-100 text-gray-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const getClassRequestStatusText = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: 'Đang mở',        // Open
    1: 'Chờ duyệt',      // Reviewing
    2: 'Đã chọn gia sư', // Selected
    3: 'Đã đóng',        // Closed
    4: 'Đã hủy',         // Cancelled
    5: 'Hết hạn',        // Expired
  };
  return statusMap[status] || 'Không xác định';
};

export const getClassRequestStatusColor = (status: number): string => {
  const colorMap: Record<number, string> = {
    0: 'bg-yellow-100 text-yellow-800',
    1: 'bg-green-100 text-green-800',
    2: 'bg-blue-100 text-blue-800',
    3: 'bg-gray-100 text-gray-800',
    4: 'bg-red-100 text-red-800',
    5: 'bg-gray-100 text-gray-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const getReportStatusText = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: 'Chờ xử lý',
    1: 'Đã xử lý',
    2: 'Đã từ chối',
  };
  return statusMap[status] || 'Không xác định';
};

export const getReportStatusColor = (status: number): string => {
  const colorMap: Record<number, string> = {
    0: 'bg-yellow-100 text-yellow-800',
    1: 'bg-green-100 text-green-800',
    2: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const getTeachingModeText = (mode: number): string => {
  const modeMap: Record<number, string> = {
    0: 'Tại nhà',
    1: 'Trực tuyến',
    2: 'Kết hợp',
  };
  return modeMap[mode] || 'Không xác định';
};

export const getDayOfWeekText = (day: number): string => {
  const dayMap: Record<number, string> = {
    0: 'Chủ nhật',
    1: 'Thứ 2',
    2: 'Thứ 3',
    3: 'Thứ 4',
    4: 'Thứ 5',
    5: 'Thứ 6',
    6: 'Thứ 7',
  };
  return dayMap[day] || 'Không xác định';
};
