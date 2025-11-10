# ✅ ĐÃ SỬA XONG MÀN HÌNH "TRỞ THÀNH GIA SƯ"

## 🎯 TÓM TẮT THAY ĐỔI

### 1. **Hook `useBecomeTutor.ts`** ✅
- ✅ Đổi từ `TutorManagementService.becomeTutor()` → `BecomeTutorService.becomeTutor()`
- ✅ Type: `LegacyBecomeTutorRequest` → `BecomeTutorRequest`

### 2. **Types `src/types/requests.ts`** ✅
- ✅ **TutorProfileCreateRequest**: Thêm các fields:
  - `userName`, `phone`, `dateOfBirth`, `avatarUrl`, `provinceId`, `subDistrictId`, `latitude`, `longitude`
- ✅ **TutorEducationCreateRequest**: 
  - Đổi `certificateUrl` → `certificateEducationUrl` (match backend)
- ✅ **TutorSubjectCreateRequest**: 
  - `hourlyRate` và `levelId` giờ là Required
- ✅ **TutorAvailabilityCreateRequest**: 
  - Remove `endDate` và `status` (backend không cần)

### 3. **Component `BecomeTutorPage.tsx`** ✅

#### **File Upload Flow:**
- ✅ Tạo `uploadFiles()` function:
  - Upload profile image → Get `avatarUrl`
  - Upload video file → Get `videoIntroUrl`
  - Upload certificate files → Get `certificateUrls[]`
  - Upload education files → Get `educationUrls[]`
  - Handle errors nếu upload fail

#### **Request Builder:**
- ✅ Tạo `buildBecomeTutorRequest()` function:
  - Build `tutorProfile` với đúng field names:
    - `fullName` → `userName`
    - `email` → `userEmail`
    - `province` (string) → `provinceId` (int)
    - `district` (string) → `subDistrictId` (int)
    - `birthDate` → `dateOfBirth`
    - `introduction` → `bio`
    - `teachingExperience` → `teachingExp`
    - `teachingMode` → `teachingModes` (TeachingMode enum)
  - Build `subjects` với đúng structure:
    - Remove `subjectId` từ certificates (không có trong backend)
    - Convert `hourlyRate` từ string → number
    - Set `tutorId = 0` (backend sẽ set)
  - Build `certificates`:
    - Remove `subjectId` (không có trong backend)
    - Map `certificateUrl` từ uploaded files
    - Set `tutorId = 0`
  - Build `educations`:
    - Map `certificateEducationUrl` từ uploaded files
    - Set `tutorId = 0`
    - Validate: Backend requires at least 1 education
  - Build `availabilities`:
    - Remove `tutorId` (set = 0, backend sẽ set)
    - Format `startDate` đúng ISO format

#### **Handle Submit:**
- ✅ Upload files TRƯỚC (nếu có)
- ✅ Build request đúng structure
- ✅ Submit với `BecomeTutorRequest`
- ✅ Error handling đầy đủ
- ✅ Loading states: `isUploadingFiles` và `isSubmitting`

---

## 📋 REQUEST STRUCTURE MỚI

```typescript
{
  tutorProfile: {
    userEmail: string,          // Required
    userName: string,           // Required
    phone: string,              // Required
    bio: string,
    dateOfBirth: string,        // Required (ISO date)
    avatarUrl: string,          // URL from upload
    provinceId: number,         // Required
    subDistrictId: number,      // Required
    teachingExp: string,
    videoIntroUrl: string,      // URL from upload or YouTube link
    teachingModes: TeachingMode // Required (0/1/2)
  },
  educations: [                 // Required (min 1)
    {
      tutorId: 0,
      institutionId: number,
      issueDate: string,
      certificateEducationUrl: string
    }
  ],
  certificates: [               // Optional
    {
      tutorId: 0,
      certificateTypeId: number,
      issueDate: string,
      expiryDate: string,
      certificateUrl: string
    }
  ],
  subjects: [                   // Optional
    {
      tutorId: 0,
      subjectId: number,
      hourlyRate: number,       // Required
      levelId: number          // Required
    }
  ],
  availabilities: [             // Required (min 1)
    {
      tutorId: 0,
      slotId: number,          // Required
      startDate: string        // Required (ISO date-time)
    }
  ]
}
```

---

## ✅ VALIDATIONS

- ✅ Profile image upload (nếu có)
- ✅ Video file upload (nếu có)
- ✅ Certificate files upload (nếu có)
- ✅ Education files upload (nếu có)
- ✅ ProvinceId và SubDistrictId phải là valid integers
- ✅ Educations phải có ít nhất 1 item (backend required)
- ✅ Subjects hourlyRate phải > 0
- ✅ Availabilities phải có ít nhất 1 item (backend required)

---

## 🎨 UI UPDATES

- ✅ Button disabled khi `isUploadingFiles || isSubmitting`
- ✅ Hiển thị "Đang tải file lên..." khi upload
- ✅ Hiển thị "Đang gửi đơn đăng ký..." khi submit

---

## 🚀 FLOW MỚI

1. User điền form → Click "Gửi đơn đăng ký"
2. **Step 1**: Upload files (nếu có)
   - Profile image → `avatarUrl`
   - Video → `videoIntroUrl`
   - Certificates → `certificateUrls[]`
   - Educations → `educationUrls[]`
3. **Step 2**: Build request với structure đúng backend
4. **Step 3**: Submit request qua `BecomeTutorService.becomeTutor()`
5. **Step 4**: Redirect to success page

---

## ✨ DONE!

Tất cả đã được sửa xong. Frontend giờ sẽ:
- ✅ Upload files trước khi submit
- ✅ Build request đúng 100% với backend
- ✅ Map fields đúng tên backend
- ✅ Convert types đúng (string → int/decimal)
- ✅ Remove `tutorId` từ nested arrays (backend sẽ set)

**Sẵn sàng test!** 🎉

