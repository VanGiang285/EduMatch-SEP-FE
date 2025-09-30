# EduMatch - Nền tảng gia sư 1-kèm-1

EduMatch là nền tảng kết nối gia sư và học viên hàng đầu Việt Nam, cho phép học tập 1-kèm-1 trực tuyến với các môn học từ cấp 1 đến đại học.

## 🚀 Công nghệ sử dụng

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Database**: Prisma (có thể thay đổi)
- **Authentication**: NextAuth.js (có thể thêm)

## 📁 Cấu trúc thư mục

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group cho authentication
│   │   ├── layout.tsx           # Layout cho auth pages
│   │   ├── login/               # Trang đăng nhập
│   │   └── register/            # Trang đăng ký
│   ├── (dashboard)/             # Route group cho dashboard
│   │   ├── layout.tsx           # Layout cho dashboard
│   │   ├── dashboard/           # Trang dashboard chính
│   │   ├── profile/             # Trang profile
│   │   ├── bookings/            # Trang quản lý lịch học
│   │   └── tutors/              # Trang danh sách gia sư
│   ├── (public)/                # Route group cho public pages
│   │   ├── layout.tsx           # Layout cho public pages
│   │   └── about/               # Trang giới thiệu
│   ├── api/                     # API Routes
│   │   ├── auth/                # Authentication API
│   │   ├── tutors/              # Tutors API
│   │   ├── bookings/            # Bookings API
│   │   └── users/               # Users API
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Homepage
├── components/                   # React Components
│   ├── ui/                      # Reusable UI components (shadcn/ui)
│   ├── figma/                   # Figma-specific components
│   ├── auth/                    # Authentication components
│   ├── dashboard/               # Dashboard components
│   ├── tutors/                  # Tutor-related components
│   ├── bookings/                # Booking components
│   ├── Navbar.tsx               # Navigation bar
│   ├── Footer.tsx               # Footer
│   ├── LandingPage.tsx          # Landing page
│   ├── LoginPage.tsx            # Login page
│   └── RegisterPage.tsx         # Register page
├── lib/                         # Utility libraries
│   ├── auth.ts                  # Authentication utilities
│   ├── db.ts                    # Database connection
│   └── utils.ts                 # General utilities
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts               # Authentication hook
│   ├── useTutors.ts             # Tutors data hook
│   └── useBookings.ts           # Bookings data hook
├── types/                       # TypeScript type definitions
│   └── index.ts                 # Global types
├── constants/                   # Application constants
│   └── index.ts                 # Routes, subjects, etc.
├── contexts/                    # React contexts
│   ├── AuthContext.tsx          # Authentication context
│   └── ThemeContext.tsx         # Theme context
├── store/                       # State management (Redux/Zustand)
│   ├── authStore.ts             # Authentication store
│   └── tutorsStore.ts           # Tutors store
├── middleware.ts                # Next.js middleware
└── styles/                      # Additional styles
    └── globals.css              # Global CSS
```

## 🎨 Color Palette

```css
/* Primary Colors */
--primary: #257180;        /* Teal - Background lớn, vùng nghỉ mắt */
--secondary: #F2E5BF;      /* Cream - Background nội dung chính */
--accent: #FD8B51;         /* Orange - Màu nhấn chính */
--accent-dark: #CB6040;    /* Dark Orange - Màu nhấn phụ */

/* Usage Strategy */
- #257180: Header, Footer, CTA sections (vùng nghỉ mắt)
- #F2E5BF: Content areas, Login/Register backgrounds (dễ đọc)
- #FD8B51 & #CB6040: Buttons, links, icons, hover effects (điểm nhấn)
```

## 📝 Quy ước đặt tên

### 🗂️ Files và Folders

#### **Folders**
- **kebab-case**: `user-profile`, `booking-management`
- **PascalCase cho components**: `UserProfile`, `BookingManagement`
- **lowercase cho utilities**: `lib`, `hooks`, `types`

#### **Files**
- **PascalCase cho React components**: `UserProfile.tsx`, `BookingCard.tsx`
- **camelCase cho utilities**: `authUtils.ts`, `dateHelpers.ts`
- **kebab-case cho pages**: `user-profile/page.tsx`, `booking-details/page.tsx`

### 🏷️ Components

#### **Component Names**
```typescript
// ✅ Good
export function UserProfile() {}
export function BookingCard() {}
export function TutorSearchForm() {}

// ❌ Bad
export function userProfile() {}
export function booking_card() {}
export function TutorSearchform() {}
```

#### **Props Interface**
```typescript
// ✅ Good
interface UserProfileProps {
  user: User;
  onEdit: () => void;
  showActions?: boolean;
}

// ❌ Bad
interface userProfileProps {}
interface UserProfilePropsInterface {}
```

### 🎯 Variables và Functions

#### **Variables**
```typescript
// ✅ Good
const userProfile = {};
const isAuthenticated = true;
const bookingList = [];
const MAX_RETRY_ATTEMPTS = 3;

// ❌ Bad
const user_profile = {};
const IsAuthenticated = true;
const bookinglist = [];
```

#### **Functions**
```typescript
// ✅ Good
const fetchUserProfile = async () => {};
const handleBookingSubmit = () => {};
const validateEmail = (email: string) => {};

// ❌ Bad
const fetch_user_profile = async () => {};
const HandleBookingSubmit = () => {};
const validateemail = (email: string) => {};
```

### 🗃️ Database & API

#### **Database Tables**
```sql
-- ✅ Good
users
tutor_profiles
booking_sessions
user_reviews

-- ❌ Bad
Users
tutorProfiles
bookingSessions
user_reviews
```

#### **API Routes**
```typescript
// ✅ Good
/api/users
/api/tutor-profiles
/api/booking-sessions
/api/user-reviews

// ❌ Bad
/api/Users
/api/tutorProfiles
/api/bookingSessions
```

## 🚀 Cách chạy dự án

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy development server
```bash
npm run dev
```

### 3. Build cho production
```bash
npm run build
npm start
```

## 📋 Scripts có sẵn

- `npm run dev` - Chạy development server
- `npm run build` - Build cho production
- `npm run start` - Chạy production server
- `npm run lint` - Chạy ESLint
- `npm run type-check` - Kiểm tra TypeScript types

## 🎯 Tính năng chính

### 👨‍🎓 Cho Học viên
- Tìm kiếm gia sư theo môn học, cấp độ
- Đặt lịch học linh hoạt
- Học 1-kèm-1 trực tuyến
- Đánh giá và review gia sư
- Theo dõi tiến độ học tập

### 👨‍🏫 Cho Gia sư
- Tạo profile chuyên nghiệp
- Quản lý lịch dạy
- Nhận booking từ học viên
- Thu nhập ổn định
- Phát triển kỹ năng giảng dạy

### 📚 Môn học hỗ trợ
- **Khoa học Tự nhiên**: Toán, Lý, Hóa, Sinh
- **Khoa học Xã hội**: Văn, Sử, Địa, GDCD
- **Ngoại ngữ**: Tiếng Anh, Tiếng Trung, Tiếng Nhật
- **Luyện thi**: THPT Quốc gia, IELTS, TOEIC

## 🔧 Cấu hình

### Environment Variables
Tạo file `.env.local`:
```env
DATABASE_URL="your_database_url"
NEXTAUTH_SECRET="your_secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Tailwind Config
File `tailwind.config.ts` đã được cấu hình với:
- Custom color palette
- shadcn/ui integration
- Responsive design utilities

## 📖 Hướng dẫn phát triển

### 1. Thêm Component mới
```bash
# Tạo component trong thư mục phù hợp
src/components/tutors/TutorCard.tsx
```

### 2. Thêm API Route
```bash
# Tạo API route
src/app/api/tutors/[id]/route.ts
```

### 3. Thêm Page mới
```bash
# Tạo page trong route group phù hợp
src/app/(dashboard)/tutors/page.tsx
```

### 4. Thêm Type mới
```typescript
// Thêm vào src/types/index.ts
export interface NewFeature {
  id: string;
  name: string;
}
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Tạo Pull Request

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

**EduMatch** - Học tập thông minh, tương lai rộng mở! 🌟