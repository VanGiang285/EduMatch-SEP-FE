# Cấu trúc dự án Modern Login Page Design

## Tổng quan
Dự án này là một frontend-only application sử dụng Next.js 14 với App Router. Tất cả logic backend được xử lý thông qua API calls đến external backend services.

## Cấu trúc thư mục

```
src/
├── app/                    # Next.js App Router - Chứa các trang và layout
│   ├── (auth)/            # Route group cho authentication
│   │   └── layout.tsx     # Layout cho các trang auth
│   ├── (dashboard)/       # Route group cho dashboard
│   │   └── layout.tsx     # Layout cho dashboard
│   ├── (public)/          # Route group cho các trang public
│   │   └── layout.tsx     # Layout cho các trang public
│   ├── forgot-password/   # Forgot password page
│   │   └── page.tsx       # Forgot password component
│   ├── login/             # Login page
│   │   └── page.tsx       # Login page component
│   ├── register/          # Register page
│   │   └── page.tsx       # Register page component
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Các component React tái sử dụng
│   ├── figma/             # Components từ Figma design
│   │   └── ImageWithFallback.tsx
│   ├── ui/                # UI components được tổ chức theo nhóm chức năng
│   │   ├── basic/         # Basic UI components
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── role-badge.tsx
│   │   │   └── index.ts
│   │   ├── form/          # Form components
│   │   │   ├── calendar.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── command.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── label.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── select.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   └── index.ts
│   │   ├── layout/        # Layout components
│   │   │   ├── accordion.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── resizable.tsx
│   │   │   ├── responsive-grid.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── stats-card.tsx
│   │   │   ├── table.tsx
│   │   │   └── index.ts
│   │   ├── feedback/      # Feedback components
│   │   │   ├── alert.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── loading-spinner.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── status-indicator.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── index.ts
│   │   ├── navigation/    # Navigation components
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── index.ts
│   │   ├── utils.ts       # UI utility functions
│   │   ├── use-mobile.ts  # Mobile detection hook
│   │   └── index.ts       # Export tất cả UI components
│   ├── Footer.tsx         # Footer component
│   ├── ForgotPasswordPage.tsx
│   ├── LandingPage.tsx    # Landing page component
│   ├── LoginPage.tsx      # Login page component
│   ├── Navbar.tsx         # Navigation bar
│   ├── RegisterPage.tsx   # Register page component
│   └── TermsAndPrivacyModal.tsx
├── constants/             # Các hằng số của dự án
│   └── index.ts           # Export tất cả constants
├── contexts/              # React Contexts cho quản lý state
│   └── AuthContext.tsx    # Authentication context
├── hooks/                 # Custom React hooks
│   └── useAuth.ts         # Authentication hook
├── lib/                   # Các hàm phụ trợ, cấu hình thư viện
│   ├── auth.ts            # Authentication utilities
│   ├── db.ts              # Database configuration (nếu cần)
│   └── utils.ts           # Utility functions
├── services/              # API calls và giao tiếp với backend
│   ├── authService.ts     # Authentication API calls
│   ├── tutorService.ts    # Tutor management API calls
│   └── index.ts           # Export tất cả services
├── styles/                # CSS toàn cục
│   └── globals.css        # Global styles
├── types/                 # Định nghĩa các interface và type
│   └── index.ts           # Type definitions
├── guidelines/            # Tài liệu hướng dẫn
│   └── Guidelines.md      # Development guidelines
└── Attributions.md        # File attributions
```

## Root level files

```
├── middleware.ts          # Next.js middleware (đã di chuyển từ src/middleware/)
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies và scripts
└── README.md              # Project documentation
```

## Quy tắc tổ chức

### 1. App Router (`src/app/`)
- Chứa các trang và layout theo chuẩn Next.js 14
- Sử dụng route groups `(auth)`, `(dashboard)`, `(public)` để tổ chức
- **Không chứa API routes** vì đây là frontend-only project

### 2. Components (`src/components/`)
- **UI components**: Được tổ chức theo nhóm chức năng:
  - `basic/`: Các component cơ bản (button, badge, avatar)
  - `form/`: Các component form (input, select, checkbox)
  - `layout/`: Các component layout (card, table, sidebar)
  - `feedback/`: Các component feedback (alert, dialog, loading)
  - `navigation/`: Các component navigation (menu, tabs, breadcrumb)
- **Page components**: Các component cho từng trang cụ thể
- **Figma components**: Components được tạo từ Figma design

### 3. Services (`src/services/`)
- Chứa **chỉ API calls** từ client-side đến external backend
- Không chứa logic xử lý backend
- Cung cấp interface rõ ràng cho việc giao tiếp với backend services

### 4. Hooks (`src/hooks/`)
- Custom React hooks cho logic tái sử dụng
- Ví dụ: `useAuth` cho authentication logic

### 5. Contexts (`src/contexts/`)
- React Contexts cho state management
- Quản lý state toàn cục như authentication

### 6. Types (`src/types/`)
- TypeScript type definitions
- Interface cho các object và API responses

### 7. Constants (`src/constants/`)
- Các hằng số được sử dụng trong toàn bộ ứng dụng
- API endpoints, configuration values, etc.

### 8. Lib (`src/lib/`)
- Utility functions và configuration
- Authentication helpers, validation functions, etc.

## Lợi ích của cấu trúc này

1. **Frontend-only**: Tập trung vào UI/UX, không phức tạp với backend logic
2. **Tổ chức UI components**: Components được nhóm theo chức năng, dễ tìm và sử dụng
3. **Tách biệt rõ ràng**: Mỗi thư mục có chức năng cụ thể
4. **Dễ bảo trì**: Code được tổ chức logic, dễ tìm và sửa
5. **Scalable**: Dễ dàng thêm tính năng mới
6. **Team collaboration**: Các developer có thể làm việc độc lập
7. **Type safety**: TypeScript được sử dụng xuyên suốt
8. **Modern practices**: Sử dụng Next.js 14 App Router và React best practices
9. **Clean code**: Không có comments không cần thiết, code tự giải thích
