// Mock data cho Class Requests (Yêu cầu mở lớp)
// Based on EduMatch database schema

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

export const mockDaysOfWeek = [
  { id: 1, name: 'Thứ 2', shortName: 'T2' },
  { id: 2, name: 'Thứ 3', shortName: 'T3' },
  { id: 3, name: 'Thứ 4', shortName: 'T4' },
  { id: 4, name: 'Thứ 5', shortName: 'T5' },
  { id: 5, name: 'Thứ 6', shortName: 'T6' },
  { id: 6, name: 'Thứ 7', shortName: 'T7' },
  { id: 0, name: 'Chủ nhật', shortName: 'CN' },
];

// Class Request Status: 0=Draft, 1=Open, 2=Closed, 3=Cancelled, 4=Expired
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
    status: 1, // 1=Open
    totalApplicants: 5,
    createdAt: '2025-11-01 10:00:00',
    expiresAt: '2025-11-20 23:59:59',
  },
  {
    id: 2,
    learnerId: 'user456',
    learnerName: 'Trần Thị B',
    learnerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    subjectId: 6, // Tiếng Anh
    subjectName: 'Tiếng Anh',
    gradeId: 12, // Lớp 12
    gradeName: 'Lớp 12',
    displayName: 'Tiếng Anh 12',
    description: 'Học sinh lớp 12 cần ôn luyện Tiếng Anh để thi tốt nghiệp và xét tuyển đại học. Hiện tại em đang ở mức trung bình, cần cải thiện ngữ pháp, từ vựng và kỹ năng làm bài thi. Ưu tiên gia sư có phương pháp dạy sinh động, nhiều bài tập thực hành.',
    teachingMode: 0, // 0=Tại nhà
    sessionPerWeek: 2,
    totalSessions: 24,
    minPrice: 250000,
    maxPrice: 350000,
    location: '456 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    cityId: 1,
    cityName: 'Hà Nội',
    subDistrictId: 10,
    subDistrictName: 'Quận Thanh Xuân',
    status: 1,
    totalApplicants: 8,
    createdAt: '2025-11-03 14:20:00',
    expiresAt: '2025-11-25 23:59:59',
  },
  {
    id: 3,
    learnerId: 'user789',
    learnerName: 'Lê Minh C',
    learnerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    subjectId: 2, // Vật Lý
    subjectName: 'Vật Lý',
    gradeId: 11, // Lớp 11
    gradeName: 'Lớp 11',
    displayName: 'Vật Lý 11',
    description: 'Con đang học lớp 11 và gặp nhiều khó khăn với môn Vật Lý. Cần gia sư giúp con hiểu bài và làm bài tập về điện học và dao động cơ. Gia sư cần giải thích từ cơ bản, kiên nhẫn với học sinh.',
    teachingMode: 1,
    sessionPerWeek: 2,
    totalSessions: 16,
    minPrice: 200000,
    maxPrice: 280000,
    location: null,
    cityId: 1,
    cityName: 'Hà Nội',
    subDistrictId: 3,
    subDistrictName: 'Quận Đống Đa',
    status: 1,
    totalApplicants: 3,
    createdAt: '2025-11-05 09:15:00',
    expiresAt: '2025-11-30 23:59:59',
  },
  {
    id: 4,
    learnerId: 'user123',
    learnerName: 'Nguyễn Văn A',
    learnerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
    subjectId: 3, // Hóa Học
    subjectName: 'Hóa Học',
    gradeId: 10, // Lớp 10
    gradeName: 'Lớp 10',
    displayName: 'Hóa Học 10',
    description: 'Học sinh lớp 10 cần học bù môn Hóa học vì đã bỏ lỡ nhiều bài trong học kỳ 1. Cần gia sư giúp nắm vững kiến thức cơ bản về nguyên tử, bảng tuần hoàn và liên kết hóa học. Giải thích kỹ từng khái niệm, nhiều bài tập thực hành.',
    teachingMode: 1,
    sessionPerWeek: 2,
    totalSessions: 12,
    minPrice: 150000,
    maxPrice: 200000,
    location: null,
    cityId: 1,
    cityName: 'Hà Nội',
    subDistrictId: 5,
    subDistrictName: 'Quận Ba Đình',
    status: 2, // Closed
    totalApplicants: 6,
    createdAt: '2025-10-20 11:30:00',
    expiresAt: '2025-11-10 23:59:59',
  },
  {
    id: 5,
    learnerId: 'user999',
    learnerName: 'Phạm Thị D',
    learnerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    subjectId: 1, // Toán
    subjectName: 'Toán',
    gradeId: 8, // Lớp 8
    gradeName: 'Lớp 8',
    displayName: 'Toán 8',
    description: 'Tìm gia sư dạy Toán cho con gái lớp 8. Con đang yếu môn Toán, cần gia sư nữ kiên nhẫn, có phương pháp dạy phù hợp với học sinh THCS. Ưu tiên gia sư có thể đến nhà dạy.',
    teachingMode: 0,
    sessionPerWeek: 3,
    totalSessions: 15,
    minPrice: 140000,
    maxPrice: 180000,
    location: '234 Trần Duy Hưng, Cầu Giấy, Hà Nội',
    cityId: 1,
    cityName: 'Hà Nội',
    subDistrictId: 8,
    subDistrictName: 'Quận Cầu Giấy',
    status: 1,
    totalApplicants: 12,
    createdAt: '2025-11-06 16:45:00',
    expiresAt: '2025-12-05 23:59:59',
  },
  {
    id: 6,
    learnerId: 'user888',
    learnerName: 'Hoàng Văn E',
    learnerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    subjectId: 5, // Ngữ Văn
    subjectName: 'Ngữ Văn',
    gradeId: 9, // Lớp 9
    gradeName: 'Lớp 9',
    displayName: 'Ngữ Văn 9',
    description: 'Học sinh lớp 9 cần ôn thi vào lớp 10. Cần gia sư giúp rèn luyện kỹ năng làm bài nghị luận xã hội, nghị luận văn học và phân tích văn bản. Có thể học online qua Zoom. Ưu tiên gia sư có kinh nghiệm luyện thi vào 10.',
    teachingMode: 1,
    sessionPerWeek: 2,
    totalSessions: 18,
    minPrice: 160000,
    maxPrice: 200000,
    location: null,
    cityId: 1,
    cityName: 'Hà Nội',
    subDistrictId: 2,
    subDistrictName: 'Quận Hoàn Kiếm',
    status: 1,
    totalApplicants: 4,
    createdAt: '2025-11-07 10:00:00',
    expiresAt: '2025-12-01 23:59:59',
  },
];

// Class Applications (Gia sư ứng tuyển vào class request)
export const mockClassApplications: Record<number, Array<{
  id: number;
  tutorId: number;
  tutorName: string;
  tutorAvatar: string;
  rating: number;
  totalReviews: number;
  experience: number;
  education: string;
  proposedPrice: number;
  coverLetter: string;
  appliedAt: string;
  status: number; // 0=Pending, 1=Accepted, 2=Rejected
}>> = {
  1: [
    {
      id: 1,
      tutorId: 1,
      tutorName: 'Nguyễn Thị Mai',
      tutorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      rating: 4.8,
      totalReviews: 45,
      experience: 5,
      education: 'Cử nhân Sư phạm Toán - ĐHSP Hà Nội',
      proposedPrice: 200000,
      coverLetter: 'Chào bạn, tôi là giáo viên có 5 năm kinh nghiệm dạy Toán 12 và luyện thi THPT Quốc gia. Tôi đã có nhiều học sinh đạt điểm cao trong kỳ thi. Tôi sẽ giúp bạn nắm vững các chuyên đề khó như hàm số, đạo hàm và tích phân. Rất mong được đồng hành cùng bạn!',
      appliedAt: '2025-11-01 11:00:00',
      status: 0,
    },
    {
      id: 2,
      tutorId: 2,
      tutorName: 'Trần Văn Hoàng',
      tutorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      rating: 4.5,
      totalReviews: 32,
      experience: 3,
      education: 'Thạc sĩ Toán học - ĐH KHTN',
      proposedPrice: 220000,
      coverLetter: 'Xin chào, tôi là thạc sĩ Toán học với nhiều năm kinh nghiệm dạy Toán 12. Tôi có phương pháp dạy hiện đại, kết hợp lý thuyết và thực hành. Tôi sẽ giúp bạn tự tin với các dạng bài thi THPT.',
      appliedAt: '2025-11-01 14:30:00',
      status: 0,
    },
  ],
  2: [
    {
      id: 3,
      tutorId: 3,
      tutorName: 'Lê Minh Tuấn',
      tutorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      rating: 4.9,
      totalReviews: 67,
      experience: 7,
      education: 'Thạc sĩ Ngôn ngữ Anh - ĐHNN ĐHQGHN',
      proposedPrice: 300000,
      coverLetter: 'Chào bạn, tôi là giáo viên tiếng Anh có 7 năm kinh nghiệm. Tôi đã giúp nhiều học sinh cải thiện điểm số và đỗ vào các trường đại học tốp đầu. Tôi sẽ giúp bạn nắm vững ngữ pháp và từ vựng.',
      appliedAt: '2025-11-03 16:00:00',
      status: 0,
    },
  ],
};

// Helper functions
export function getClassRequestStatusText(status: number): string {
  // Map theo ClassRequestStatus enum:
  // Open = 0, Reviewing = 1, Selected = 2, Closed = 3, Cancelled = 4, Expired = 5
  switch (status) {
    case 0: return 'Đang mở';        // Open
    case 1: return 'Chờ duyệt';      // Reviewing
    case 2: return 'Đã chọn gia sư';  // Selected
    case 3: return 'Đã đóng';        // Closed
    case 4: return 'Đã hủy';         // Cancelled
    case 5: return 'Hết hạn';        // Expired
    default: return 'Không xác định';
  }
}

export function getClassRequestStatusColor(status: number): string {
  // Map theo ClassRequestStatus enum:
  // Open = 0, Reviewing = 1, Selected = 2, Closed = 3, Cancelled = 4, Expired = 5
  switch (status) {
    case 0: return 'bg-yellow-100 text-yellow-800';  // Open - Đang mở
    case 1: return 'bg-orange-100 text-orange-800'; // Reviewing - Chờ duyệt
    case 2: return 'bg-blue-100 text-blue-800';     // Selected - Đã chọn gia sư
    case 3: return 'bg-gray-100 text-gray-800';      // Closed - Đã đóng
    case 4: return 'bg-red-100 text-red-800';       // Cancelled - Đã hủy
    case 5: return 'bg-gray-100 text-gray-800';      // Expired - Hết hạn
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function getTeachingModeText(mode: number): string {
  switch (mode) {
    case 0: return 'Tại nhà';
    case 1: return 'Trực tuyến';
    case 2: return 'Kết hợp';
    default: return 'Không xác định';
  }
}

