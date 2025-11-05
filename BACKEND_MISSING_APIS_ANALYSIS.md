# PHÂN TÍCH API BACKEND - CÁC API MỚI MÀ FRONTEND CHƯA CÓ

## 📋 TỔNG QUAN

Báo cáo này liệt kê tất cả các API endpoints trong Backend mà Frontend chưa tích hợp hoặc chưa có service tương ứng.

---

## 1. CLASS REQUESTS API ❌ THIẾU HOÀN TOÀN

**Controller:** `ClassRequestsController`  
**Route:** `/api/ClassRequests`

### Endpoints cần thêm:

| Method | Endpoint | Mô tả | Role Required |
|--------|----------|-------|---------------|
| POST | `/api/ClassRequests/Create` | Tạo yêu cầu mở lớp mới | Learner |
| GET | `/api/ClassRequests/{id}` | Lấy chi tiết yêu cầu theo ID | Authorize |
| GET | `/api/ClassRequests/ListPending` | Lấy danh sách yêu cầu Pending (cho BA) | Business Admin |
| GET | `/api/ClassRequests/ListOpen` | Lấy danh sách yêu cầu đã duyệt (Open) | Public |
| GET | `/api/ClassRequests/ListPendingByLearnerEmail` | Lấy yêu cầu Pending của learner | Learner |
| GET | `/api/ClassRequests/ListOpenByLearnerEmail` | Lấy yêu cầu Open của learner | Learner |
| GET | `/api/ClassRequests/ListExpiredByLearnerEmail` | Lấy yêu cầu đã hết hạn của learner | Learner |
| GET | `/api/ClassRequests/ListRejectedByLearnerEmail` | Lấy yêu cầu bị từ chối của learner | Learner |
| GET | `/api/ClassRequests/ListCanceledByLearnerEmail` | Lấy yêu cầu đã hủy của learner | Learner |
| PUT | `/api/ClassRequests/Update/{id}` | Cập nhật yêu cầu | Learner |
| PUT | `/api/ClassRequests/Cancel/{id}` | Hủy yêu cầu | Learner |
| DELETE | `/api/ClassRequests/Delete/{id}` | Xóa yêu cầu (nếu chưa duyệt) | Learner |
| PUT | `/api/ClassRequests/ApproveOrReject/{id}` | Duyệt/Từ chối yêu cầu (BA) | Business Admin |

**Status:** Frontend có components nhưng chưa có service và endpoints trong constants.

---

## 2. TUTOR APPLICATIONS API ❌ THIẾU HOÀN TOÀN

**Controller:** `TutorApplicationsController`  
**Route:** `/api/TutorApplications`

### Endpoints cần thêm:

| Method | Endpoint | Mô tả | Role Required |
|--------|----------|-------|---------------|
| POST | `/api/TutorApplications/apply` | Gia sư ứng tuyển vào class request | Tutor |
| GET | `/api/TutorApplications/class-request/{classRequestId}` | Lấy danh sách gia sư ứng tuyển theo class request | Learner |
| GET | `/api/TutorApplications/tutor/applied` | Lấy danh sách class request mà tutor đã ứng tuyển | Tutor |
| GET | `/api/TutorApplications/tutor/canceled` | Lấy danh sách ứng tuyển đã hủy của tutor | Tutor |
| PUT | `/api/TutorApplications/edit` | Chỉnh sửa ứng tuyển | Tutor |
| PUT | `/api/TutorApplications/cancel/{id}` | Hủy ứng tuyển | Tutor |

**Status:** Frontend có component `ManageTutorApplications.tsx` nhưng chưa có service và endpoints trong constants.

---

## 3. MANAGE TUTOR PROFILES API ❌ THIẾU

**Controller:** `ManageTutorProfilesController`  
**Route:** `/api/ManageTutorProfiles`

### Endpoints cần thêm:

| Method | Endpoint | Mô tả | Role Required |
|--------|----------|-------|---------------|
| GET | `/api/ManageTutorProfiles/{id}` | Lấy tutor profile theo ID (full với relations) | Authorize |
| GET | `/api/ManageTutorProfiles/email/{email}` | **Lấy tutor profile theo email** ⭐ | Authorize |

**Status:** Đã phân tích trong `TUTOR_PROFILE_API_ANALYSIS.md`

---

## 4. CERTIFICATE API (Tutor Certificates) ❌ THIẾU HOÀN TOÀN

**Controller:** `CertificateController`  
**Route:** `/api/Certificate`

### Endpoints cần thêm:

| Method | Endpoint | Mô tả | Role Required |
|--------|----------|-------|---------------|
| GET | `/api/Certificate/get-{tutorId}-list-certificate` | Lấy danh sách chứng chỉ của gia sư | Authorize |
| POST | `/api/Certificate/create-{tutorId}-certificate` | Thêm chứng chỉ mới cho gia sư | Learner, Tutor |
| PUT | `/api/Certificate/update-{tutorId}-certificate` | Cập nhật chứng chỉ của gia sư | Business Admin, Tutor |
| DELETE | `/api/Certificate/delete-{tutorId}-certificate` | Xóa chứng chỉ của gia sư | Business Admin, Tutor |
| GET | `/api/Certificate/get-all-certificatetypes-with-subjects` | Lấy tất cả loại chứng chỉ kèm môn học | Public |

**Status:** Đã phân tích trong `TUTOR_PROFILE_API_ANALYSIS.md`

---

## 5. SUBJECT API - GET BY ID ❌ THIẾU

**Controller:** `SubjectController`  
**Route:** `/api/Subject`

### Endpoint cần thêm:

| Method | Endpoint | Mô tả | Status |
|--------|----------|-------|--------|
| GET | `/api/Subject/get-subject-by-id/{id}` | Lấy thông tin chi tiết môn học theo ID | ❌ Thiếu |

**Status:** Frontend chỉ có `GET_ALL`, thiếu `GET_BY_ID`.

---

## 6. ENDPOINT FORMAT CẦN CẬP NHẬT ⚠️

### Các endpoints cần cập nhật format từ lowercase sang PascalCase:

| Controller | Code hiện tại | Backend thực tế | Status |
|------------|---------------|-----------------|--------|
| CertificateType | `/api/certificatetype/...` | `/api/CertificateType/...` | ⚠️ Cần sửa |
| Education | `/api/education/...` | `/api/Education/...` | ⚠️ Cần sửa |
| Tutors | `/api/tutors/...` | `/api/Tutors/...` | ⚠️ Cần sửa |
| TutorAvailability | `/api/tutoravailability/...` | `/api/TutorAvailability/...` | ⚠️ Cần sửa |
| Subject | `/api/subject/...` | `/api/Subject/...` | ⚠️ Cần sửa |
| Level | `/api/level/...` | `/api/Level/...` | ⚠️ Cần sửa |
| TimeSlots | `/api/timeslots/...` | `/api/TimeSlots/...` | ⚠️ Cần sửa |

**Lưu ý:** Có thể backend hỗ trợ cả 2 format, nhưng nên dùng đúng format PascalCase như Swagger.

---

## 📊 TÓM TẮT

### ❌ THIẾU HOÀN TOÀN (Cần tạo service mới):

1. **ClassRequestsService** - 12 endpoints
2. **TutorApplicationsService** - 6 endpoints
3. **CertificateService** - Thêm 5 endpoints cho Tutor Certificates (đã có service nhưng thiếu methods)
4. **ManageTutorProfilesService** - 2 endpoints (có thể thêm vào TutorService)

### ⚠️ THIẾU MỘT SỐ ENDPOINTS:

1. **SubjectService** - Thiếu `getSubjectById`
2. **Format endpoints** - Cần cập nhật tất cả sang PascalCase

---

## 🎯 KẾ HOẠCH ƯU TIÊN

### Priority 1: Tutor Profile (Đang làm)
- ✅ ManageTutorProfiles API
- ✅ Certificate API cho Tutor Certificates
- ✅ Cập nhật TutorService và CertificateService

### Priority 2: Class Requests & Tutor Applications
- ❌ Tạo ClassRequestsService
- ❌ Tạo TutorApplicationsService
- ❌ Tích hợp vào components hiện có

### Priority 3: Cập nhật format endpoints
- ⚠️ Cập nhật tất cả endpoints sang PascalCase
- ⚠️ Test các endpoints sau khi cập nhật

### Priority 4: Bổ sung endpoints còn thiếu
- ⚠️ Thêm `getSubjectById` vào SubjectService

---

## 📝 CHI TIẾT CẦN THỰC HIỆN

### 1. ClassRequestsService (Mới)

**Constants cần thêm:**
```typescript
CLASS_REQUESTS: {
  CREATE: '/api/ClassRequests/Create',
  GET_BY_ID: '/api/ClassRequests/:id',
  LIST_PENDING: '/api/ClassRequests/ListPending',
  LIST_OPEN: '/api/ClassRequests/ListOpen',
  LIST_PENDING_BY_LEARNER: '/api/ClassRequests/ListPendingByLearnerEmail',
  LIST_OPEN_BY_LEARNER: '/api/ClassRequests/ListOpenByLearnerEmail',
  LIST_EXPIRED_BY_LEARNER: '/api/ClassRequests/ListExpiredByLearnerEmail',
  LIST_REJECTED_BY_LEARNER: '/api/ClassRequests/ListRejectedByLearnerEmail',
  LIST_CANCELED_BY_LEARNER: '/api/ClassRequests/ListCanceledByLearnerEmail',
  UPDATE: '/api/ClassRequests/Update/:id',
  CANCEL: '/api/ClassRequests/Cancel/:id',
  DELETE: '/api/ClassRequests/Delete/:id',
  APPROVE_OR_REJECT: '/api/ClassRequests/ApproveOrReject/:id',
}
```

### 2. TutorApplicationsService (Mới)

**Constants cần thêm:**
```typescript
TUTOR_APPLICATIONS: {
  APPLY: '/api/TutorApplications/apply',
  GET_BY_CLASS_REQUEST: '/api/TutorApplications/class-request/:classRequestId',
  GET_TUTOR_APPLIED: '/api/TutorApplications/tutor/applied',
  GET_TUTOR_CANCELED: '/api/TutorApplications/tutor/canceled',
  EDIT: '/api/TutorApplications/edit',
  CANCEL: '/api/TutorApplications/cancel/:id',
}
```

### 3. SubjectService - Thêm method

**Constants cần thêm:**
```typescript
SUBJECTS: {
  // ... existing ...
  GET_BY_ID: '/api/Subject/get-subject-by-id/:id', // THÊM MỚI
}
```

---

## ✅ CHECKLIST

### Phase 1: Tutor Profile (Đang làm)
- [ ] ManageTutorProfiles endpoints
- [ ] Certificate endpoints cho Tutor Certificates
- [ ] Service methods

### Phase 2: Class Requests & Applications
- [ ] ClassRequestsService với tất cả methods
- [ ] TutorApplicationsService với tất cả methods
- [ ] Tích hợp vào components

### Phase 3: Format & Cleanup
- [ ] Cập nhật tất cả endpoints sang PascalCase
- [ ] Test các endpoints
- [ ] Thêm `getSubjectById`

---

## 📌 LƯU Ý

1. **Format endpoints:** Backend dùng PascalCase (`/api/ClassRequests`), frontend đang dùng lowercase (`/api/tutors`). Cần cập nhật để nhất quán.

2. **Class Requests:** Frontend đã có components nhưng chưa tích hợp API. Cần tạo service và kết nối.

3. **Tutor Applications:** Tương tự Class Requests, có component nhưng chưa có service.

4. **Authentication:** Hầu hết các API đều yêu cầu authentication và role-based access. Cần đảm bảo xử lý đúng.

