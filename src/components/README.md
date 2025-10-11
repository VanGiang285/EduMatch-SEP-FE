# EduMatch - Tutor Components

## Tổng quan

Dự án đã được cập nhật với 3 trang mới dựa trên UI/UX từ mockups:

1. **Find Tutor** - Trang tìm kiếm gia sư
2. **Tutor Detail Profile** - Trang chi tiết hồ sơ gia sư  
3. **Saved Tutors** - Trang gia sư đã lưu

## Cấu trúc thư mục

```
src/
├── components/
│   ├── find-tutor/
│   │   └── FindTutorPage.tsx
│   ├── tutor-detail/
│   │   └── TutorDetailProfilePage.tsx
│   └── saved-tutors/
│       └── SavedTutorsPage.tsx
├── app/
│   ├── find-tutor/
│   │   └── page.tsx
│   ├── tutor/
│   │   └── [id]/
│   │       └── page.tsx
│   └── saved-tutors/
│       └── page.tsx
└── styles/
    └── globals.css (đã cập nhật với line-clamp utilities)
```

## Các tính năng chính

### 1. Find Tutor (`/find-tutor`)

**Tính năng:**
- Tìm kiếm gia sư theo tên
- Bộ lọc đa dạng: môn học, thành phố, đánh giá, hình thức, giới tính
- Thanh trượt giá cả
- Hiển thị danh sách gia sư với thông tin chi tiết
- Video preview bên phải
- Phân trang
- Responsive design

**UI/UX:**
- Layout 2 cột: danh sách gia sư (8/12) + video preview (4/12)
- Card gia sư với avatar, thông tin, đánh giá, môn học
- Hover effects và transitions
- Sticky sidebar cho video preview

### 2. Tutor Detail Profile (`/tutor/[id]`)

**Tính năng:**
- Header với thông tin cơ bản và nút quay lại
- Video giới thiệu
- 3 tabs: Giới thiệu, Đánh giá, Lịch trống
- Thông tin học vấn và chứng chỉ
- Danh sách đánh giá từ học viên
- Lịch đặt buổi học
- Sidebar với giá cả và thông tin nhanh

**UI/UX:**
- Layout 2 cột: nội dung chính (2/3) + sidebar (1/3)
- Tabs navigation
- Calendar component
- Time slots selection
- Responsive design

### 3. Saved Tutors (`/saved-tutors`)

**Tính năng:**
- Hiển thị danh sách gia sư đã lưu
- Nút bỏ lưu (heart icon)
- Video preview bên phải
- Phân trang
- Empty state khi chưa có gia sư nào được lưu

**UI/UX:**
- Tương tự Find Tutor nhưng với heart icon đã được fill
- Empty state với icon và CTA button
- Responsive design

## Các component UI được sử dụng

- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Button` với các variants
- `Badge` với các variants
- `Avatar`, `AvatarFallback`, `AvatarImage`
- `Input` với search icon
- `Select` với dropdown
- `Slider` cho price range
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`
- `Calendar` cho date picker
- `Pagination` components
- `Separator`

## Icons (Lucide React)

- `Search`, `Star`, `Heart`, `MapPin`, `Play`
- `MessageCircle`, `Calendar`, `Award`, `Users`
- `BookOpen`, `Video`, `Send`, `Clock`
- `Shield`, `CheckCircle2`, `TrendingUp`, `Globe`
- `ArrowLeft`

## Responsive Design

- **Mobile**: Single column layout, ẩn video preview
- **Tablet**: Grid responsive với breakpoints
- **Desktop**: 2-column layout với sticky sidebar

## CSS Utilities

Đã thêm vào `globals.css`:
- `.line-clamp-1`, `.line-clamp-2`, `.line-clamp-3` cho text truncation

## Mock Data

Tất cả các component đều sử dụng mock data tương tự như trong mockups, bao gồm:
- Thông tin gia sư (tên, avatar, bio, kinh nghiệm)
- Môn học và chuyên môn
- Đánh giá và reviews
- Lịch trống
- Học vấn và chứng chỉ

## Cách sử dụng

1. **Truy cập trang Find Tutor**: `/find-tutor`
2. **Xem chi tiết gia sư**: `/tutor/[id]` (ví dụ: `/tutor/1`)
3. **Xem gia sư đã lưu**: `/saved-tutors`
4. **Test navigation**: `/test-navigation`

## Navigation & Routing

### Navbar Integration
- Tất cả các trang đều sử dụng `PageWrapper` với navbar
- Link "Tìm gia sư" trong navbar hoạt động và điều hướng đến `/find-tutor`
- Navbar responsive cho cả desktop và mobile

### Navigation Flow
1. **Từ trang chính** → Click "Tìm gia sư" trong navbar → `/find-tutor`
2. **Từ Find Tutor** → Click tutor card hoặc "Xem hồ sơ đầy đủ" → `/tutor/[id]`
3. **Từ Tutor Detail** → Click "Quay lại" → Trở về trang trước
4. **Từ Saved Tutors** → Click tutor card hoặc "Xem hồ sơ đầy đủ" → `/tutor/[id]`
5. **Từ Saved Tutors (empty)** → Click "Tìm gia sư" → `/find-tutor`

### Technical Implementation
- Sử dụng Next.js `useRouter` cho navigation
- `PageWrapper` component quản lý navbar và routing
- Fixed navbar với `pt-16` cho content padding
- Dynamic routes cho tutor detail (`/tutor/[id]`)
- CSS `overflow-y: scroll` để tránh navbar shift khi có scrollbar
- Event handling với `stopPropagation()` để tránh conflict giữa card click và button click
- State management cho favorite tutors với `useState<Set<number>>`
- Custom CSS cho slider với màu sắc rõ ràng
- Fixed width cho select filters để tránh layout shift

## Tính năng mới được cập nhật

### 🎯 **Interactive Features**
- **Heart Toggle**: Click trái tim để lưu/bỏ lưu gia sư (đỏ = đã lưu, xám = chưa lưu)
- **Button Functions**: Các button có chức năng riêng thay vì chuyển hướng:
  - "Nhắn tin" → Console log (sẵn sàng cho modal messaging)
  - "Đặt buổi học thử" → Console log (sẵn sàng cho modal booking)
  - "Đặt lịch học" → Console log (sẵn sàng cho calendar modal)
  - "Xem lịch dạy" → Console log (sẵn sàng cho schedule modal)
  - "Xem hồ sơ đầy đủ" → Navigate đến trang chi tiết

### 🎨 **UI/UX Improvements**
- **Fixed Layout**: Select filters có width cố định, không bị shift
- **Enhanced Slider**: Price range slider có màu sắc rõ ràng (xanh #257180)
- **Real-time Updates**: Số lượng saved tutors cập nhật real-time
- **Smooth Interactions**: Hover effects và transitions mượt mà

### 🔧 **Technical Enhancements**
- **State Management**: `useState<Set<number>>` cho favorite tutors
- **Event Handling**: `stopPropagation()` để tránh conflict events
- **Custom CSS**: Slider styling với hover effects
- **Responsive Design**: Fixed width cho select components

## Lưu ý

- Tất cả các component đều là client-side (`'use client'`)
- Sử dụng TypeScript với interfaces được định nghĩa rõ ràng
- Mock data có thể được thay thế bằng API calls thực tế
- Responsive design đã được tối ưu cho mobile, tablet và desktop
- Console logs sẵn sàng để implement các modal/functionality thực tế
