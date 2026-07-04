# Cơ Sở Dữ Liệu — Education Management System

> Nguồn: `server_side/prisma/schema.prisma` (PostgreSQL, quản lý qua Prisma ORM). Đã xác minh trực tiếp trên schema hiện tại — không dựa vào tài liệu cũ (schema cũ còn model `Notification` đã bị gỡ bỏ, và chưa có `Semester`/`User.personalEmail`).

## 1. Mô hình quan hệ (ERD)

```mermaid
erDiagram
    DEPARTMENT ||--o{ BRANCH : "có nhiều"
    DEPARTMENT ||--o{ CLASS : "có nhiều"
    DEPARTMENT ||--o{ SUBJECT : "có nhiều"

    USER ||--o{ CLASS : "chủ nhiệm (teacherId)"
    USER ||--o{ SUBJECT_CLASS : "phụ trách (teacherId)"
    USER ||--o{ ENROLLMENT : "đăng ký (studentId)"
    USER ||--o{ ATTENDANCE : "được điểm danh (studentId)"
    USER ||--o{ ATTENDANCE : "điểm danh (markedById, optional)"
    USER ||--o{ ACTIVITY_LOG : "thực hiện hành động"
    USER ||--o| API_KEY : "cặp khóa RSA (1-1)"
    USER ||--o{ OTP : "mã OTP"

    SUBJECT ||--o{ SUBJECT_CLASS : "được mở lớp"
    SUBJECT_CLASS ||--o{ ENROLLMENT : "có sinh viên đăng ký"
    SUBJECT_CLASS ||--o{ ATTENDANCE : "có buổi điểm danh"

    SEMESTER {
        int id PK
        string name
        boolean isActive
    }

    DEPARTMENT {
        string id PK
        string code
        string nameDepartment
    }
    BRANCH {
        string id PK
        string code
        string nameBranch
        string departmentId FK
    }
    USER {
        string id PK
        string fullName
        string email
        string password
        Role role
        TypeLogin typeLogin
        string idStudent
        string class
        string idTeacher
        string degree
        string personalEmail
        string department
        Gender gender
        UserStatus status
        boolean isAdmin
    }
    CLASS {
        string id PK
        string code
        string nameClass
        string teacherId FK
        string departmentId FK
    }
    SUBJECT {
        string id PK
        string code
        string name
        int credits
        string departmentId FK
    }
    SUBJECT_CLASS {
        string id PK
        string code
        string semester "chuỗi tự do — KHÔNG FK tới Semester"
        int maxStudents
        SubjectClassStatus status
        string subjectId FK
        string teacherId FK
    }
    ENROLLMENT {
        string id PK
        EnrollmentStatus status
        float attendanceScore
        float midtermScore
        float finalScore
        float totalScore
        LetterGrade letterGrade
        boolean gradeLocked
        string studentId FK
        string subjectClassId FK
    }
    ATTENDANCE {
        string id PK
        date date
        AttendanceStatus status
        string note
        string studentId FK
        string subjectClassId FK
        string markedById FK
    }
    ACTIVITY_LOG {
        string id PK
        ActivityAction action
        ActivityEntityType entityType
        string entityId
        string description
        json metadata
        string userId FK
    }
    API_KEY {
        string id PK
        string publicKey
        string privateKey
        datetime expireAt
        string userId FK
    }
    OTP {
        string id PK
        string otp
        datetime expireAt
        string userId FK
    }
```

> **Lưu ý quan trọng**: `SEMESTER` được vẽ tách biệt, **không có đường quan hệ nào** tới `SUBJECT_CLASS` — đây là chủ đích của schema hiện tại, không phải thiếu sót khi vẽ ERD. Xem mục 4 để biết cách hai bảng này thực sự liên kết với nhau ở tầng ứng dụng.

## 2. Danh sách Enum

| Enum | Giá trị |
|---|---|
| `Role` | `student`, `teacher`, `admin` |
| `Gender` | `male`, `female`, `other` |
| `UserStatus` | `studying`, `reserved`, `graduate` (sinh viên) · `teaching`, `retired`, `resigned` (giảng viên) · `active`, `inactive` (chung) |
| `TypeLogin` | `email`, `google` |
| `SubjectClassStatus` | `active`, `completed`, `canceled` |
| `EnrollmentStatus` | `registered`, `dropped`, `completed` |
| `AttendanceStatus` | `present`, `absent`, `late`, `excused` |
| `LetterGrade` | `A`, `B`, `C`, `D`, `F` |
| `ActivityAction` | `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT` |
| `ActivityEntityType` | `user`, `class`, `subject`, `subject_class`, `enrollment`, `grade`, `attendance`, `department`, `branch`, `notification` |

> `ActivityEntityType` vẫn còn giá trị `notification` sót lại từ trước khi model `Notification` bị gỡ bỏ — vô hại vì bảng `activity_logs` hiện **chưa được service nào ghi dữ liệu** (xem mục 4).

## 3. Mô tả chi tiết từng bảng

### 3.1 `departments` (Khoa) — model `Department`

| STT | Tên trường | Kiểu dữ liệu | Ghi chú |
|---|---|---|---|
| 1 | `id` | UUID (PK) | |
| 2 | `code` | String, unique | Mã khoa, VD: `CNTT` |
| 3 | `nameDepartment` | String | Tên khoa |
| 4 | `createdAt` / `updatedAt` | DateTime | Tự động |

### 3.2 `branches` (Ngành) — model `Branch`

| STT | Tên trường | Kiểu dữ liệu | Ghi chú |
|---|---|---|---|
| 1 | `id` | UUID (PK) | |
| 2 | `code` | String, unique | Mã ngành |
| 3 | `nameBranch` | String | Tên ngành |
| 4 | `departmentId` | String (FK → `Department`) | Ngành thuộc khoa nào |

### 3.3 `users` (Người dùng) — model `User`

| STT | Tên trường | Kiểu dữ liệu | Ghi chú |
|---|---|---|---|
| 1 | `id` | UUID (PK) | |
| 2 | `fullName` | String | |
| 3 | `email` | String, unique | Email trường — dùng làm định danh đăng nhập (`identifier` = phần trước `@`) |
| 4 | `password` | String | bcrypt hash (10 vòng) |
| 5 | `role` | `Role` | `student` / `teacher` / `admin` |
| 6 | `typeLogin` | `TypeLogin`, mặc định `email` | Phân biệt tài khoản Google |
| 7 | `avatar` | String? | |
| 8 | `idStudent` | String? | Mã sinh viên, tự sinh `SV{năm}{4 số}` |
| 9 | `class` | String? | Lớp hành chính — **chuỗi tự do**, không phải FK tới `Class` |
| 10 | `idTeacher` | String? | Mã giảng viên, tự sinh `GV{năm}{3 số}` |
| 11 | `degree` | String? | Học vị (chỉ giảng viên) |
| 12 | `phone` | String? | |
| 13 | `personalEmail` | String? | **Email cá nhân** — bắt buộc để tạo tài khoản/quên mật khẩu; nơi nhận email OTP & thông tin đăng nhập |
| 14 | `department` | String? | Khoa — **chuỗi tự do**, không phải FK tới `Department` |
| 15 | `address` | String?, mặc định `''` | |
| 16 | `gender` | `Gender`? | |
| 17 | `birthDay` | DateTime? | |
| 18 | `status` | `UserStatus`, mặc định `active` | |
| 19 | `isAdmin` | Boolean, mặc định `false` | |

> **Lưu ý**: `class` và `department` trên `User` là trường **chuỗi tự do**, không liên kết khóa ngoại thật sự tới model `Class`/`Department` — cần so khớp theo tên/mã khi truy vấn liên bảng, không `include`/`populate` được.

### 3.4 `classes` (Lớp hành chính) — model `Class`

| STT | Tên trường | Kiểu dữ liệu | Ghi chú |
|---|---|---|---|
| 1 | `id` | UUID (PK) | |
| 2 | `code` | String, unique | VD: `CNTT2021A` |
| 3 | `nameClass` | String | |
| 4 | `teacherId` | String (FK → `User`) | Giáo viên chủ nhiệm |
| 5 | `departmentId` | String (FK → `Department`) | |

> Model `Class` **không có** danh sách sinh viên dạng quan hệ mảng — sinh viên "thuộc lớp" chỉ qua trường chuỗi `User.class`.

### 3.5 `subjects` (Môn học) — model `Subject`

| STT | Tên trường | Kiểu dữ liệu | Ghi chú |
|---|---|---|---|
| 1 | `id` | UUID (PK) | |
| 2 | `code` | String, unique | VD: `INT1001` |
| 3 | `name` | String | |
| 4 | `credits` | Int, mặc định 0 | Số tín chỉ |
| 5 | `departmentId` | String (FK → `Department`) | |

### 3.6 `subject_classes` (Lớp học phần) — model `SubjectClass`

| STT | Tên trường | Kiểu dữ liệu | Ghi chú |
|---|---|---|---|
| 1 | `id` | UUID (PK) | |
| 2 | `code` | String, unique | VD: `INT1001_1` |
| 3 | `semester` | String | **Tên học kỳ dạng chuỗi tự do** — không FK tới `Semester` |
| 4 | `maxStudents` | Int, mặc định 50 | Sĩ số tối đa |
| 5 | `status` | `SubjectClassStatus`, mặc định `active` | |
| 6 | `subjectId` | String (FK → `Subject`) | |
| 7 | `teacherId` | String (FK → `User`) | Giảng viên phụ trách |

### 3.7 `enrollments` (Đăng ký học phần + Điểm) — model `Enrollment`

Công thức: `totalScore = round((attendanceScore×0.1 + midtermScore×0.3 + finalScore×0.6) × 10) / 10`.

| STT | Tên trường | Kiểu dữ liệu | Ghi chú |
|---|---|---|---|
| 1 | `id` | UUID (PK) | |
| 2 | `status` | `EnrollmentStatus`, mặc định `registered` | `registered` → (nhập điểm) → `completed`, hoặc `dropped` |
| 3 | `registeredAt` | DateTime, mặc định `now()` | |
| 4 | `attendanceScore` | Float? | Trọng số 10% |
| 5 | `midtermScore` | Float? | Trọng số 30% |
| 6 | `finalScore` | Float? | Trọng số 60% |
| 7 | `totalScore` | Float? | Tự tính khi giáo viên nhập điểm |
| 8 | `letterGrade` | `LetterGrade`? | `A≥8.5`, `B≥7.0`, `C≥5.5`, `D≥4.0`, còn lại `F` |
| 9 | `gradeLocked` | Boolean, mặc định `false` | Khóa điểm — chặn sửa điểm và chặn hủy đăng ký |
| 10 | `studentId` | String (FK → `User`) | |
| 11 | `subjectClassId` | String (FK → `SubjectClass`) | |
| — | **Unique** | `(studentId, subjectClassId)` | Chống đăng ký trùng |

### 3.8 `attendances` (Điểm danh) — model `Attendance`

| STT | Tên trường | Kiểu dữ liệu | Ghi chú |
|---|---|---|---|
| 1 | `id` | UUID (PK) | |
| 2 | `date` | DateTime | |
| 3 | `status` | `AttendanceStatus`, mặc định `present` | |
| 4 | `note` | String?, mặc định `''` | |
| 5 | `studentId` | String (FK → `User`) | |
| 6 | `subjectClassId` | String (FK → `SubjectClass`) | |
| 7 | `markedById` | String? (FK → `User`) | Giáo viên thực hiện điểm danh |
| — | **Unique** | `(subjectClassId, studentId, date)` | Chống trùng — dùng làm khóa cho thao tác `upsert` khi điểm danh hàng loạt |

### 3.9 `activity_logs` (Nhật ký hoạt động) — model `ActivityLog`

| STT | Tên trường | Kiểu dữ liệu | Ghi chú |
|---|---|---|---|
| 1 | `id` | UUID (PK) | |
| 2 | `action` | `ActivityAction` | |
| 3 | `entityType` | `ActivityEntityType` | |
| 4 | `entityId` | String? | |
| 5 | `description` | String | |
| 6 | `metadata` | Json?, mặc định `{}` | |
| 7 | `ipAddress` | String? | |
| 8 | `userId` | String (FK → `User`) | |

> ⚠️ **Model tồn tại nhưng chưa được sử dụng**: không có service nào trong `server_side/src` hiện đang ghi bản ghi vào bảng này. Đây là hạng mục thiết kế sẵn cho tương lai (audit trail), chưa triển khai nghiệp vụ.

### 3.10 `api_keys` (Cặp khóa RSA cho JWT) — model `ApiKey`

| STT | Tên trường | Kiểu dữ liệu | Ghi chú |
|---|---|---|---|
| 1 | `id` | UUID (PK) | |
| 2 | `publicKey` | Text | RSA-2048 Public Key (PEM) — dùng verify token |
| 3 | `privateKey` | Text | RSA-2048 Private Key (PEM) — dùng ký token |
| 4 | `expireAt` | DateTime | Bằng thời hạn refresh token (7 ngày) |
| 5 | `userId` | String, unique (FK → `User`, `onDelete: Cascade`) | Quan hệ 1-1 — mỗi user chỉ có 1 cặp khóa hiệu lực tại một thời điểm |

### 3.11 `otps` (Mã xác thực quên mật khẩu) — model `Otp`

| STT | Tên trường | Kiểu dữ liệu | Ghi chú |
|---|---|---|---|
| 1 | `id` | UUID (PK) | |
| 2 | `otp` | String | Mã 6 số, đã bcrypt hash |
| 3 | `expireAt` | DateTime | TTL 5 phút |
| 4 | `userId` | String (FK → `User`, `onDelete: Cascade`) | |

### 3.12 `semesters` (Học kỳ) — model `Semester`

| STT | Tên trường | Kiểu dữ liệu | Ghi chú |
|---|---|---|---|
| 1 | `id` | Int, autoincrement (PK) | |
| 2 | `name` | String, unique | VD: `HK1 2024-2025` |
| 3 | `isActive` | Boolean, mặc định `false` | Học kỳ đang mở — dùng để lọc dữ liệu "hiện hành" |

## 4. Cách `Semester` liên kết với `SubjectClass` (không dùng khóa ngoại)

Vì `SubjectClass.semester` là chuỗi tự do, hệ thống liên kết hai khái niệm này **hoàn toàn ở tầng ứng dụng** (không có ràng buộc CSDL):

```
1. Admin đánh dấu 1+ Semester có isActive = true (qua PATCH /api/semesters/:id/toggle-active)
2. Khi cần lọc "dữ liệu học kỳ hiện hành", service (subject-classes / dashboard / enrollments)
   tự truy vấn: SELECT name FROM semesters WHERE isActive = true
3. Sau đó lọc: SELECT * FROM subject_classes WHERE semester IN (<danh sách name ở bước 2>)
```

Vì không có FK, việc đổi tên một `Semester` (`name`) sẽ **không** tự động cập nhật các `SubjectClass.semester` đã lưu chuỗi cũ — hai giá trị sẽ lệch nhau nếu không cập nhật thủ công. Đây là điểm cần lưu ý khi mở rộng nghiệp vụ trong tương lai.
