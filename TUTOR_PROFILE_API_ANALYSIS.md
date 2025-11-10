# PHÂN TÍCH API TUTOR PROFILE - SO SÁNH SWAGGER VỚI CODE HIỆN TẠI

## 📋 TỔNG QUAN

**Format endpoint Backend:** Backend dùng `[Route("api/[controller]")]` → Route = `/api/{ControllerName}` (PascalCase)
- Ví dụ: `CertificateController` → `/api/Certificate`
- Ví dụ: `ManageTutorProfilesController` → `/api/ManageTutorProfiles`

**Code hiện tại:** Đang dùng lowercase (ví dụ: `/api/tutors`) - Có thể vẫn hoạt động nhưng nên dùng đúng format PascalCase như Swagger.

### ✅ API ĐÃ CÓ TRONG CODE
### ❌ API THIẾU
### ⚠️ API CẦN SỬA (Format endpoint khác - PascalCase vs lowercase)

---

## 1. CERTIFICATE API (Tutor Certificates - Chứng chỉ của gia sư)

### ❌ THIẾU HOÀN TOÀN - CẦN THÊM:

| Method | Swagger Endpoint | Mô tả | Status |
|--------|------------------|-------|--------|
| GET | `/api/Certificate/get-{tutorId}-list-certificate` | Lấy danh sách chứng chỉ của gia sư | ❌ Thiếu |
| POST | `/api/Certificate/create-{tutorId}-certificate` | Thêm chứng chỉ mới cho gia sư | ❌ Thiếu |
| PUT | `/api/Certificate/update-{tutorId}-certificate` | Cập nhật chứng chỉ của gia sư | ❌ Thiếu |
| DELETE | `/api/Certificate/delete-{tutorId}-certificate` | Xóa chứng chỉ của gia sư | ❌ Thiếu |
| GET | `/api/Certificate/get-all-certificatetypes-with-subjects` | Lấy tất cả loại chứng chỉ kèm môn học | ❌ Thiếu |

**Hành động:** Tạo service mới hoặc thêm vào CertificateService

---

## 2. CERTIFICATETYPE API (Loại chứng chỉ)

### ⚠️ CẦN SỬA FORMAT ENDPOINT:

| Method | Swagger | Code hiện tại | Status |
|--------|---------|---------------|--------|
| GET | `/api/CertificateType/get-all-certificate-types` | `/api/certificatetype/get-all-certificate-types` | ⚠️ Format khác |
| GET | `/api/CertificateType/get-certificate-types-by-verify-status/{verifyStatus}` | `/api/certificatetype/get-certificate-types-by-verify-status/:verifyStatus` | ⚠️ Format khác |
| POST | `/api/CertificateType/create-certificate-type` | `/api/certificatetype/create-certificate-type` | ⚠️ Format khác |
| POST | `/api/CertificateType/add-subjects-to-certificate-type/{certificateTypeId}` | `/api/certificatetype/add-subjects-to-certificate-type/:certificateTypeId` | ⚠️ Format khác |
| PUT | `/api/CertificateType/verify-certificate-type/{certificateTypeId}` | `/api/certificatetype/verify-certificate-type/:certificateTypeId` | ⚠️ Format khác |
| DELETE | `/api/CertificateType/delete-certificate-type/{certificateTypeId}` | `/api/certificatetype/delete-certificate-type/:certificateTypeId` | ⚠️ Format khác |

**Hành động:** Cập nhật endpoints trong constants (có thể backend hỗ trợ cả 2 format, cần test)

---

## 3. EDUCATION API (Học vấn)

### ✅ ĐÃ CÓ (cần kiểm tra format):

| Method | Swagger | Code hiện tại | Status |
|--------|---------|---------------|--------|
| GET | `/api/Education/get-all-education-institution` | `/api/education/get-all-education-institution` | ✅ Có (format khác) |
| POST | `/api/Education/create-education-institution` | `/api/education/create-education-institution` | ✅ Có (format khác) |
| GET | `/api/Education/get-{tutorId}-list-education` | `/api/education/get-:tutorId-list-education` | ✅ Có |
| POST | `/api/Education/create-{tutorId}-education` | `/api/education/create-:tutorId-education` | ✅ Có |
| PUT | `/api/Education/update-{tutorId}-education` | `/api/education/update-:tutorId-education` | ✅ Có |
| DELETE | `/api/Education/delete-{tutorId}-education` | `/api/education/delete-:tutorId-education` | ✅ Có |
| GET | `/api/Education/get-education-institutions-by-verify-status/{verifyStatus}` | `/api/education/get-education-institutions-by-verify-status/:verifyStatus` | ✅ Có |
| PUT | `/api/Education/verify-education-institution/{educationInstitutionId}` | `/api/education/verify-education-institution/:educationInstitutionId` | ✅ Có |

**Hành động:** Kiểm tra xem backend có hỗ trợ cả 2 format không (có thể cần sửa)

---

## 4. ManageTutorProfiles API (Quan trọng!)

### ❌ THIẾU HOÀN TOÀN - CẦN THÊM NGAY:

| Method | Swagger Endpoint | Mô tả | Status |
|--------|------------------|-------|--------|
| GET | `/api/ManageTutorProfiles/{id}` | Lấy tutor profile theo ID | ❌ Thiếu |
| GET | `/api/ManageTutorProfiles/email/{email}` | **Lấy tutor profile theo email** | ❌ Thiếu (QUAN TRỌNG!) |

**Hành động:** 
- Thêm endpoints vào constants
- Tạo service method trong TutorService hoặc tạo service mới
- Đây là cách để lấy tutorId từ user email!

---

## 5. TutorAvailability API

### ⚠️ CẦN SỬA FORMAT ENDPOINT:

| Method | Swagger | Code hiện tại | Status |
|--------|---------|---------------|--------|
| POST | `/api/TutorAvailability/tutor-availability-create-list` | `/api/tutoravailability/tutor-availability-create-list` | ⚠️ Format khác |
| PUT | `/api/TutorAvailability/tutor-availability-update-list` | `/api/tutoravailability/tutor-availability-update-list` | ⚠️ Format khác |
| DELETE | `/api/TutorAvailability/tutor-availability-delete-list` | `/api/tutoravailability/tutor-availability-delete-list` | ⚠️ Format khác |
| GET | `/api/TutorAvailability/tutor-availability-get-all/{tutorId}` | `/api/tutoravailability/tutor-availability-get-all/:tutorId` | ⚠️ Format khác |
| GET | `/api/TutorAvailability/tutor-availability-get-list-by-status/{tutorId}/{status}` | `/api/tutoravailability/tutor-availability-get-list-by-status/:tutorId/:status` | ⚠️ Format khác |

**Hành động:** Kiểm tra và cập nhật nếu cần

---

## 6. Tutors API

### ⚠️ CẦN SỬA FORMAT ENDPOINT:

| Method | Swagger | Code hiện tại | Status |
|--------|---------|---------------|--------|
| POST | `/api/Tutors/become-tutor` | `/api/tutors/become-tutor` | ⚠️ Format khác |
| PUT | `/api/Tutors/verify-list-education/{tutorId}` | `/api/tutors/verify-list-education/:tutorId` | ⚠️ Format khác |
| PUT | `/api/Tutors/verify-list-certificate/{tutorId}` | `/api/tutors/verify-list-certificate/:tutorId` | ⚠️ Format khác |
| GET | `/api/Tutors/get-all-tutor-by-status` | `/api/tutors/get-all-tutor-by-status` | ⚠️ Format khác |
| GET | `/api/Tutors/get-all-tutor` | `/api/tutors/get-all-tutor` | ⚠️ Format khác |
| GET | `/api/Tutors/get-all-tutor-certificate-education/{tutorId}` | `/api/tutors/get-all-tutor-certificate-education/:tutorId` | ⚠️ Format khác |
| GET | `/api/Tutors/get-tutor-by-id/{tutorId}` | `/api/tutors/get-tutor-by-id/:tutorId` | ⚠️ Format khác |
| PUT | `/api/Tutors/update-tutor-profile` | `/api/tutors/update-tutor-profile` | ⚠️ Format khác |
| PUT | `/api/Tutors/approve-and-verify-all/{tutorId}` | `/api/tutors/approve-and-verify-all/:tutorId` | ⚠️ Format khác |
| PUT | `/api/Tutors/update-tutor-status/{tutorId}` | `/api/tutors/update-tutor-status/:tutorId` | ⚠️ Format khác |

**Hành động:** Kiểm tra xem backend có hỗ trợ cả 2 format không

---

## 7. SUBJECT API (Môn học)

### ✅ ĐÃ CÓ (cần kiểm tra format):

Code hiện tại dùng `/api/subject/...` nhưng Swagger không có Subject controller riêng.
Cần kiểm tra xem endpoint thực tế là gì.

---

## 📊 TÓM TẮT

### ❌ THIẾU HOÀN TOÀN (Cần thêm ngay):

1. **Certificate Service cho Tutor Certificates:**
   - GET `/api/Certificate/get-{tutorId}-list-certificate` → Trả về `List<TutorCertificateDto>`
   - POST `/api/Certificate/create-{tutorId}-certificate` → Nhận `TutorCertificateCreateRequest`
   - PUT `/api/Certificate/update-{tutorId}-certificate` → Nhận `TutorCertificateUpdateRequest`
   - DELETE `/api/Certificate/delete-{tutorId}-certificate?certificateId=xxx` → Query param optional
   - GET `/api/Certificate/get-all-certificatetypes-with-subjects` → Trả về `List<CertificateTypeDto>` với subjects

2. **ManageTutorProfiles Service:**
   - GET `/api/ManageTutorProfiles/{id}` → Trả về `TutorProfileDto` (full với relations)
   - GET `/api/ManageTutorProfiles/email/{email}` → Trả về `TutorProfileDto` ⭐ **QUAN TRỌNG NHẤT**

### ⚠️ CẦN SỬA FORMAT ENDPOINT:

**Backend dùng PascalCase:** `/api/Certificate`, `/api/Education`, `/api/Tutors`, `/api/ManageTutorProfiles`, etc.
**Code hiện tại dùng lowercase:** `/api/certificatetype`, `/api/tutors`, etc.

**Giải pháp:** Cập nhật tất cả endpoints sang format PascalCase như Swagger để đảm bảo consistency.

### 📝 REQUEST TYPES CẦN KIỂM TRA:

**TutorCertificateCreateRequest:**
```typescript
{
  tutorId: number; // Backend sẽ set từ route, truyền 0
  certificateTypeId: number; // Required
  issueDate?: string; // ISO date string
  expiryDate?: string; // ISO date string
  certificateUrl?: string; // URL
}
```

**TutorCertificateUpdateRequest:**
```typescript
{
  id: number; // Required
  tutorId: number; // Required
  certificateTypeId: number;
  issueDate?: string;
  expiryDate?: string;
  certificateUrl?: string;
  verified?: VerifyStatus; // Optional
  rejectReason?: string; // Optional
}
```

---

## 🎯 KẾ HOẠCH HÀNH ĐỘNG ĐỀ XUẤT

### Phase 1: Thêm API thiếu (Ưu tiên cao)
1. ✅ Thêm ManageTutorProfiles endpoints vào constants → Service method trong TutorService
2. ✅ Thêm Certificate endpoints cho Tutor Certificates vào constants → Service methods trong CertificateService
3. ✅ Thêm GET certificatetypes-with-subjects vào constants → Service method

### Phase 2: Cập nhật format endpoints (Nếu cần)
1. Test các endpoints hiện tại xem có hoạt động không
2. Nếu không, cập nhật sang format PascalCase như Swagger:
   - `/api/certificatetype` → `/api/CertificateType`
   - `/api/tutors` → `/api/Tutors`
   - `/api/tutoravailability` → `/api/TutorAvailability`
   - `/api/education` → `/api/Education`
   - `/api/subject` → `/api/Subject`

### Phase 3: Tích hợp vào TutorProfileTab
1. Load tutor profile từ email (dùng ManageTutorProfiles/email/{email})
2. Load và hiển thị educations, certificates, subjects
3. Implement CRUD operations cho:
   - Education (Create, Update, Delete)
   - Certificate (Create, Update, Delete) 
   - Subject (Create, Update, Delete)
   - Tutor Profile cơ bản (Update)

---

## 📋 CHI TIẾT CẦN THỰC HIỆN

### 1. Constants (src/constants/index.ts)

**THÊM:**
```typescript
MANAGE_TUTOR_PROFILES: {
  GET_BY_ID: '/api/ManageTutorProfiles/:id',
  GET_BY_EMAIL: '/api/ManageTutorProfiles/email/:email',
},
```

**CẬP NHẬT CERTIFICATES:**
```typescript
CERTIFICATES: {
  // Giữ nguyên CertificateType endpoints
  GET_ALL: '/api/CertificateType/get-all-certificate-types',
  // ... existing ...
  
  // THÊM MỚI: Tutor Certificates
  GET_TUTOR_CERTIFICATES: '/api/Certificate/get-:tutorId-list-certificate',
  CREATE_TUTOR_CERTIFICATE: '/api/Certificate/create-:tutorId-certificate',
  UPDATE_TUTOR_CERTIFICATE: '/api/Certificate/update-:tutorId-certificate',
  DELETE_TUTOR_CERTIFICATE: '/api/Certificate/delete-:tutorId-certificate',
  GET_ALL_WITH_SUBJECTS: '/api/Certificate/get-all-certificatetypes-with-subjects',
}
```

### 2. Services

**TutorService - THÊM:**
```typescript
// Lấy tutor profile theo email (QUAN TRỌNG!)
static async getTutorByEmail(email: string): Promise<ApiResponse<TutorProfileDto>> {
  const url = replaceUrlParams(API_ENDPOINTS.MANAGE_TUTOR_PROFILES.GET_BY_EMAIL, { email });
  return apiClient.get<TutorProfileDto>(url);
}

// Lấy tutor profile theo ID (full với relations)
static async getTutorByIdFull(id: number): Promise<ApiResponse<TutorProfileDto>> {
  const url = replaceUrlParams(API_ENDPOINTS.MANAGE_TUTOR_PROFILES.GET_BY_ID, { id: id.toString() });
  return apiClient.get<TutorProfileDto>(url);
}
```

**CertificateService - THÊM:**
```typescript
// Lấy danh sách chứng chỉ của gia sư
static async getTutorCertificates(tutorId: number): Promise<ApiResponse<TutorCertificateDto[]>> {
  const url = API_ENDPOINTS.CERTIFICATES.GET_TUTOR_CERTIFICATES.replace(':tutorId', tutorId.toString());
  return apiClient.get<TutorCertificateDto[]>(url);
}

// Thêm chứng chỉ cho gia sư
static async createTutorCertificate(tutorId: number, request: Omit<TutorCertificateCreateRequest, 'tutorId'>): Promise<ApiResponse<TutorCertificateDto>> {
  const url = API_ENDPOINTS.CERTIFICATES.CREATE_TUTOR_CERTIFICATE.replace(':tutorId', tutorId.toString());
  return apiClient.post<TutorCertificateDto>(url, { ...request, tutorId: 0 }); // Backend sẽ set từ route
}

// Cập nhật chứng chỉ của gia sư
static async updateTutorCertificate(tutorId: number, request: TutorCertificateUpdateRequest): Promise<ApiResponse<TutorCertificateDto>> {
  const url = API_ENDPOINTS.CERTIFICATES.UPDATE_TUTOR_CERTIFICATE.replace(':tutorId', tutorId.toString());
  return apiClient.put<TutorCertificateDto>(url, { ...request, tutorId });
}

// Xóa chứng chỉ của gia sư
static async deleteTutorCertificate(tutorId: number, certificateId?: number): Promise<ApiResponse<void>> {
  const url = API_ENDPOINTS.CERTIFICATES.DELETE_TUTOR_CERTIFICATE.replace(':tutorId', tutorId.toString());
  const finalUrl = certificateId ? `${url}?certificateId=${certificateId}` : url;
  return apiClient.delete<void>(finalUrl);
}

// Lấy tất cả loại chứng chỉ kèm môn học
static async getAllCertificateTypesWithSubjects(): Promise<ApiResponse<CertificateTypeDto[]>> {
  return apiClient.get<CertificateTypeDto[]>(API_ENDPOINTS.CERTIFICATES.GET_ALL_WITH_SUBJECTS);
}
```

### 3. Types

**Đã có sẵn:**
- ✅ `TutorCertificateCreateRequest` - Đã có trong types/requests.ts
- ✅ `TutorCertificateUpdateRequest` - Đã có trong types/requests.ts
- ✅ `TutorProfileDto` - Đã có trong types/backend.ts
- ✅ `TutorCertificateDto` - Đã có trong types/backend.ts
- ✅ `TutorEducationDto` - Đã có trong types/backend.ts
- ✅ `TutorSubjectDto` - Đã có trong types/backend.ts

**Cần kiểm tra:**
- `TutorCertificateCreateRequest` có đúng field names không (tutorId vs TutorId - backend dùng PascalCase)

---

## ✅ CHECKLIST TRƯỚC KHI IMPLEMENT

- [ ] Thêm ManageTutorProfiles endpoints vào constants
- [ ] Thêm Certificate endpoints cho Tutor Certificates vào constants
- [ ] Thêm service methods vào TutorService (getTutorByEmail, getTutorByIdFull)
- [ ] Thêm service methods vào CertificateService (CRUD tutor certificates + getAllWithSubjects)
- [ ] Kiểm tra và cập nhật format endpoints (PascalCase) nếu cần
- [ ] Test các API endpoints mới
- [ ] Tích hợp vào TutorProfileTab component

