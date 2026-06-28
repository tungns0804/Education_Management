# Hướng Dẫn Server Side — Hệ Thống Quản Lý Giáo Dục

## Công Nghệ Sử Dụng

| Tầng | Công nghệ |
|---|---|
| Framework | NestJS (TypeScript) |
| ORM | Prisma |
| Cơ sở dữ liệu | PostgreSQL |
| Xác thực | JWT (RS256) với cặp khóa RSA riêng cho mỗi người dùng |
| Mã hóa mật khẩu | bcrypt (10 vòng) |
| Cổng HTTP | 3000 |

---

## Cấu Trúc Thư Mục

```
Server_Side/
├── prisma/
│   ├── schema.prisma              # Lược đồ cơ sở dữ liệu (13 model)
│   └── seed.ts                    # Dữ liệu mẫu ban đầu
└── src/
    ├── main.ts                    # Khởi động: CORS, cookie-parser, cổng 3000
    ├── app.module.ts              # Module gốc
    ├── constants/
    │   ├── auth.constants.ts      # Cấu hình JWT, tên cookie, vòng bcrypt
    │   └── seed.constants.ts      # Thông tin đăng nhập người dùng demo (hardcoded)
    ├── prisma/
    │   ├── prisma.module.ts       # Module toàn cục — PrismaService khả dụng mọi nơi
    │   └── prisma.service.ts      # Kế thừa PrismaClient
    ├── common/
    │   ├── guards/
    │   │   └── roles.guard.ts     # RolesGuard — kiểm tra req.user.role
    │   └── decorators/
    │       └── roles.decorator.ts # Decorator @Roles(...)
    ├── auth/                      # Module xác thực
    ├── users/                     # Quản lý người dùng (admin CRUD, hồ sơ)
    ├── departments/               # CRUD Khoa
    ├── branches/                  # CRUD Ngành
    ├── classes/                   # CRUD Lớp học
    ├── subjects/                  # CRUD Môn học
    ├── subject-classes/           # CRUD Lớp học phần
    ├── enrollments/               # Đăng ký, quản lý điểm, bảng điểm
    ├── attendance/                # Theo dõi điểm danh
    ├── notifications/             # Thông báo người dùng
    └── dashboard/                 # Thống kê tổng hợp
```

---

## Lược Đồ Cơ Sở Dữ Liệu (Prisma)

### Các Kiểu Liệt Kê (Enum)

| Enum | Giá trị |
|---|---|
| `Role` | `student`, `teacher`, `admin` |
| `Gender` | `male`, `female`, `other` |
| `UserStatus` | `studying`, `reserved`, `graduate`, `teaching`, `retired`, `resigned`, `active`, `inactive` |
| `TypeLogin` | `email`, `google` |
| `SubjectClassStatus` | `active`, `completed`, `canceled` |
| `EnrollmentStatus` | `registered`, `dropped`, `completed` |
| `AttendanceStatus` | `present`, `absent`, `late`, `excused` |
| `NotificationType` | `info`, `success`, `warning`, `error`, `grade`, `enrollment` |
| `LetterGrade` | `A`, `B`, `C`, `D`, `F` |
| `ActivityAction` | `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT` |
| `ActivityEntityType` | `user`, `class`, `subject`, `subject_class`, `enrollment`, `grade`, `attendance`, `department`, `branch`, `notification` |

### Các Model

#### `Department` → bảng `departments` (Khoa)
```
id             String  @id uuid
code           String  @unique
nameDepartment String
branches       Branch[]
classes        Class[]
subjects       Subject[]
```

#### `Branch` → bảng `branches` (Ngành)
```
id           String  @id uuid
code         String  @unique
nameBranch   String
departmentId String  → Department
```

#### `User` → bảng `users` (Người dùng)
```
id        String    @id uuid
fullName  String
email     String    @unique
password  String                  -- bcrypt hashed
role      Role
typeLogin TypeLogin @default(email)
avatar    String?
idStudent String?                 -- Mã sinh viên
class     String?                 -- Lớp (chuỗi, không phải FK)
idTeacher String?                 -- Mã giảng viên
degree    String?
phone     String?
department String?                -- Khoa (chuỗi, không phải FK)
address   String?   @default("")
gender    Gender?
birthDay  DateTime?
status    UserStatus @default(active)
isAdmin   Boolean    @default(false)
```

> **Lưu ý**: `class` và `department` trên User là trường **chuỗi tự do**, không phải foreign key tới model `Class`/`Department`.

#### `Class` → bảng `classes` (Lớp học - cohort)
```
id           String  @id uuid
code         String  @unique
nameClass    String
teacherId    String  → User (TeacherClasses)
departmentId String  → Department
```

> Model `Class` **không có** quan hệ array tới sinh viên — không dùng được `_count` trên model này.

#### `Subject` → bảng `subjects` (Môn học)
```
id           String  @id uuid
code         String  @unique
name         String
credits      Int     @default(0)
departmentId String  → Department
```

#### `SubjectClass` → bảng `subject_classes` (Lớp học phần)
```
id          String             @id uuid
code        String             @unique
semester    String
maxStudents Int                @default(50)
status      SubjectClassStatus @default(active)
subjectId   String  → Subject
teacherId   String  → User (TeacherSubjectClasses)
enrollments Enrollment[]
attendances Attendance[]
```

#### `Enrollment` → bảng `enrollments` (Đăng ký + Điểm)
```
id              String           @id uuid
status          EnrollmentStatus @default(registered)
registeredAt    DateTime         @default(now())
attendanceScore Float?           -- hệ số 10%
midtermScore    Float?           -- hệ số 30%
finalScore      Float?           -- hệ số 60%
totalScore      Float?           -- tự tính khi nhập điểm
letterGrade     LetterGrade?
gradeLocked     Boolean          @default(false)
studentId       String  → User
subjectClassId  String  → SubjectClass
@@unique([studentId, subjectClassId])
```

#### `Attendance` → bảng `attendances` (Điểm danh)
```
id             String           @id uuid
date           DateTime
status         AttendanceStatus @default(present)
note           String?          @default("")
studentId      String  → User (StudentAttendances)
subjectClassId String  → SubjectClass
markedById     String? → User (MarkedByTeacher)
@@unique([subjectClassId, studentId, date])
```

#### `Notification` → bảng `notifications`
```
id      String           @id uuid
title   String
message String
type    NotificationType @default(info)
isRead  Boolean          @default(false)
link    String?
userId  String  → User
```

#### `ApiKey` → bảng `api_keys` (Cặp khóa RSA cho JWT)
```
id         String   @id uuid
publicKey  String   @db.Text
privateKey String   @db.Text
expireAt   DateTime
userId     String   @unique → User (onDelete: Cascade)
```

#### `Otp` → bảng `otps`
```
id       String   @id uuid
otp      String                 -- bcrypt hashed
expireAt DateTime               -- hết hạn sau 5 phút
userId   String  → User (onDelete: Cascade)
```

#### `ActivityLog` → bảng `activity_logs`
```
id         String             @id uuid
action     ActivityAction
entityType ActivityEntityType
entityId   String?
description String
metadata   Json?   @default("{}")
ipAddress  String?
userId     String  → User
```

---

## Hằng Số Xác Thực (`constants/auth.constants.ts`)

```ts
RSA_MODULUS_LENGTH     = 2048
JWT_ALGORITHM          = 'RS256'
ACCESS_TOKEN_EXPIRES_IN  = '15m'
REFRESH_TOKEN_EXPIRES_IN = '7d'
ACCESS_TOKEN_MAX_AGE_MS  = 900_000       // 15 phút (ms) — dùng cho cookie maxAge
REFRESH_TOKEN_MAX_AGE_MS = 604_800_000   // 7 ngày (ms)
API_KEY_TTL_MS           = 604_800_000   // bằng refresh token TTL

COOKIE_TOKEN         = 'token'           // httpOnly
COOKIE_REFRESH_TOKEN = 'refreshToken'    // httpOnly
COOKIE_LOGGED        = 'logged'          // NON-httpOnly — JS client đọc được để kiểm tra trạng thái đăng nhập
COOKIE_LOGGED_VALUE  = '1'
LOGIN_TYPE_GOOGLE    = 'google'
BCRYPT_SALT_ROUNDS   = 10
```

---

## Dữ Liệu Demo (`constants/seed.constants.ts`)

Mật khẩu **hardcoded** trong code (không dùng biến môi trường):

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@school.edu.vn` | `Admin@123` |
| Giảng viên | `gv1001@school.edu.vn` | `Teacher@123` |
| Sinh viên | `20216001@student.school.edu.vn` | `Student@123` |

---

## Kiến Trúc Module

### PrismaModule (`src/prisma/`)
`@Global()` — `PrismaService` tự động khả dụng mọi nơi, không cần import lại.

### AuthModule (`src/auth/`)
Export `AuthService` và `JwtAuthGuard` để các module khác dùng.

### Common (`src/common/`)

**`JwtAuthGuard`** — đọc cookie `token`, giải mã `userId`, lấy `ApiKey` của user, xác minh bằng public key, gắn `{ id, role }` vào `req.user`.

**`RolesGuard`** — dùng sau `JwtAuthGuard`, kiểm tra `req.user.role`:
```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
```

---

## Cookie Sau Đăng Nhập

| Cookie | httpOnly | Mục đích |
|---|---|---|
| `token` | ✅ | Access token JWT (15 phút) |
| `refreshToken` | ✅ | Refresh token JWT (7 ngày) |
| `logged` | ❌ | JS client đọc để biết user đã đăng nhập, giá trị = `"1"` |

Môi trường `development`: `secure=false`, `sameSite=lax`.
Môi trường `production`: `secure=true`, `sameSite=strict`.

---

## Luồng JWT / Phiên Đăng Nhập

1. Đăng nhập: xóa `ApiKey` cũ → tạo cặp RSA mới → ký cả access & refresh token bằng private key → set 3 cookies.
2. Mỗi request: `JwtAuthGuard` đọc cookie `token` → decode `userId` → lấy `ApiKey` → verify bằng public key → gắn `req.user`.
3. Đăng xuất: xóa `ApiKey` → xóa 3 cookies → toàn bộ token của user lập tức vô hiệu.
4. Đổi/reset mật khẩu: cũng xóa `ApiKey` → toàn bộ session bị kick.

---

## Luồng OTP (Quên Mật Khẩu)

1. `POST /api/users/forgot-password { email }` — tạo OTP 6 chữ số, bcrypt hash, lưu `otps` (5 phút), **hiện tại in ra console** (SMTP chưa tích hợp).
2. `POST /api/users/reset-password { email, otp, newPassword }` — xác thực OTP, đổi mật khẩu, xóa OTP, xóa `ApiKey` (kick toàn bộ session).

---

## Tham Chiếu API

### Xác Thực: `POST/GET /api/users/...`

| Method | Đường dẫn | Guard | Body / Query | Mô tả |
|---|---|---|---|---|
| POST | `/api/users/login` | — | `{ email, password }` | Đăng nhập, set 3 cookies |
| GET | `/api/users/auth` | JWT | — | Thông tin user hiện tại (không trả password) |
| POST | `/api/users/logout` | JWT | — | Xóa ApiKey, clear cookies |
| GET | `/api/users/refresh-token` | — | cookie `refreshToken` | Cấp access token mới, set lại cookie `token` |
| POST | `/api/users/forgot-password` | — | `{ email }` | Tạo OTP 6 số (in console), lưu hash 5 phút |
| POST | `/api/users/reset-password` | — | `{ email, otp, newPassword }` | Xác thực OTP, đặt lại mật khẩu, kick session |
| PUT | `/api/users/change-password` | JWT | `{ currentPassword, newPassword }` | Đổi mật khẩu khi đã đăng nhập |

---

### Dashboard: `GET /api/dashboard`

| Method | Đường dẫn | Guard | Mô tả |
|---|---|---|---|
| GET | `/api/dashboard` | JWT, admin | Thống kê tổng hợp |

**Response metadata:**
```json
{
  "students": 0,
  "teachers": 0,
  "sections": 0,
  "subjects": 0,
  "departments": 0,
  "activeSections": 0,
  "recentEnrollments": 0,
  "gender": { "male": 0, "female": 0, "other": 0 },
  "gradeDist": { "A": 0, "B": 0, "C": 0, "D": 0, "F": 0 }
}
```

---

### Người Dùng: `/api/users`

| Method | Đường dẫn | Guard | Mô tả |
|---|---|---|---|
| GET | `/api/users/students` | JWT, admin | Danh sách sinh viên (`?q`, `?class`, `?status=active\|inactive`) |
| GET | `/api/users/teachers` | JWT, admin | Danh sách giảng viên (`?q`, `?departmentId`) |
| GET | `/api/users/:id` | JWT | Thông tin user theo ID |
| POST | `/api/users/students` | JWT, admin | Tạo sinh viên (email trường tự tạo, mật khẩu tạm in console) |
| POST | `/api/users/teachers` | JWT, admin | Tạo giảng viên (mật khẩu tạm in console) |
| POST | `/api/users/bulk-import` | JWT, admin | Nhập hàng loạt: `{ rows: [...] }` |
| PUT | `/api/users/:id` | JWT | Admin: cập nhật bất kỳ; user thường: chỉ cập nhật chính mình. **Không thể thay password/email/role qua endpoint này.** |
| PATCH | `/api/users/:id/status` | JWT, admin | `{ status: 'active' \| 'inactive' }` |
| DELETE | `/api/users/:id` | JWT, admin | Xóa user |

**Sinh viên tạo mới:**
- Email trường: `{idStudent}@student.school.edu.vn`
- Mật khẩu tạm: 10 ký tự ngẫu nhiên, in ra console
- Status mặc định: `studying`

**Giảng viên tạo mới:**
- Status mặc định: `teaching`

---

### Khoa: `/api/departments`

| Method | Đường dẫn | Guard | Mô tả |
|---|---|---|---|
| GET | `/api/departments` | JWT | Tất cả khoa (kèm `_count: { branches, classes, subjects }`) |
| GET | `/api/departments/:id` | JWT | Chi tiết khoa (kèm `branches[]`, `_count: { classes, subjects }`) |
| POST | `/api/departments` | JWT, admin | `{ code, nameDepartment }` |
| PUT | `/api/departments/:id` | JWT, admin | `{ code?, nameDepartment? }` |
| DELETE | `/api/departments/:id` | JWT, admin | Xóa khoa |

---

### Ngành: `/api/branches`

| Method | Đường dẫn | Guard | Mô tả |
|---|---|---|---|
| GET | `/api/branches` | JWT | `?departmentId` tùy chọn |
| GET | `/api/branches/:id` | JWT | Chi tiết ngành |
| POST | `/api/branches` | JWT, admin | `{ code, nameBranch, departmentId }` |
| PUT | `/api/branches/:id` | JWT, admin | Cập nhật |
| DELETE | `/api/branches/:id` | JWT, admin | Xóa |

---

### Lớp Học: `/api/classes`

| Method | Đường dẫn | Guard | Mô tả |
|---|---|---|---|
| GET | `/api/classes` | JWT | `?departmentId` tùy chọn. Trả về `teacher` + `department` |
| GET | `/api/classes/:id` | JWT | Chi tiết lớp (kèm `teacher`, `department`) |
| POST | `/api/classes` | JWT, admin | `{ code, nameClass, teacherId, departmentId }` |
| PUT | `/api/classes/:id` | JWT, admin | Cập nhật |
| DELETE | `/api/classes/:id` | JWT, admin | Xóa |

---

### Môn Học: `/api/subjects`

| Method | Đường dẫn | Guard | Mô tả |
|---|---|---|---|
| GET | `/api/subjects` | JWT | `?departmentId` tùy chọn |
| GET | `/api/subjects/:id` | JWT | Chi tiết môn học |
| POST | `/api/subjects` | JWT, admin | `{ code, name, credits, departmentId }` |
| PUT | `/api/subjects/:id` | JWT, admin | Cập nhật |
| DELETE | `/api/subjects/:id` | JWT, admin | Xóa |

---

### Lớp Học Phần: `/api/subject-classes`

| Method | Đường dẫn | Guard | Mô tả |
|---|---|---|---|
| GET | `/api/subject-classes` | JWT | admin: tất cả; teacher: của mình; student: chỉ `active` |
| GET | `/api/subject-classes/my-sections` | JWT, teacher | Lớp HP của giảng viên đang đăng nhập |
| GET | `/api/subject-classes/:id` | JWT | Chi tiết + `_count.enrollments` |
| GET | `/api/subject-classes/:id/roster` | JWT, teacher/admin | Danh sách sinh viên đăng ký |
| POST | `/api/subject-classes` | JWT, admin | `{ code, semester, maxStudents?, subjectId, teacherId }` |
| PUT | `/api/subject-classes/:id` | JWT, admin | Cập nhật (có thể đổi `status`) |
| DELETE | `/api/subject-classes/:id` | JWT, admin | Xóa |

**Include mặc định (mọi endpoint):** `subject { id, code, name, credits }`, `teacher { id, fullName, idTeacher, degree }`, `_count { enrollments }`.

---

### Đăng Ký Học Phần: `/api/enrollments`

| Method | Đường dẫn | Guard | Mô tả |
|---|---|---|---|
| GET | `/api/enrollments/my` | JWT, student | Danh sách đăng ký đang `registered` |
| GET | `/api/enrollments/transcript` | JWT, student | Bảng điểm tích lũy (chỉ `completed`) + GPA + totalCredits |
| GET | `/api/enrollments/gpa-trend` | JWT, student | `[{ term, gpa }]` theo từng học kỳ |
| GET | `/api/enrollments/:subjectClassId/grades` | JWT, teacher/admin | Bảng điểm lớp học phần |
| POST | `/api/enrollments` | JWT, student | `{ subjectClassId }` — kiểm tra lớp còn mở, chưa đầy, chưa đăng ký |
| DELETE | `/api/enrollments/:id` | JWT, student | Hủy đăng ký (không hủy được nếu `gradeLocked`) |
| PUT | `/api/enrollments/:id/grade` | JWT, teacher | `{ attendanceScore?, midtermScore?, finalScore? }` — chỉ teacher phụ trách được nhập |
| PATCH | `/api/enrollments/:id/lock` | JWT, teacher/admin | `{ locked: boolean }` |

**Công thức điểm:**
```
totalScore = attendanceScore×0.10 + midtermScore×0.30 + finalScore×0.60   (làm tròn 1 chữ số thập phân)
letterGrade: A(≥8.5) | B(≥7.0) | C(≥5.5) | D(≥4.0) | F(<4.0)
```

**Bảo vệ điểm:** `gradeLocked=true` → không thể cập nhật điểm, không thể hủy đăng ký.

---

### Điểm Danh: `/api/attendance`

| Method | Đường dẫn | Guard | Mô tả |
|---|---|---|---|
| GET | `/api/attendance/:subjectClassId` | JWT, teacher/admin | Toàn bộ điểm danh của lớp HP |
| GET | `/api/attendance/my/:subjectClassId` | JWT, student | Điểm danh cá nhân trong lớp HP |
| POST | `/api/attendance/bulk` | JWT, teacher | `{ subjectClassId, date, records: [{studentId, status, note?}] }` — dùng upsert (tạo hoặc cập nhật) |
| PUT | `/api/attendance/:id` | JWT, teacher | `{ status, note? }` — chỉ teacher phụ trách được sửa |

---

### Thông Báo: `/api/notifications`

| Method | Đường dẫn | Guard | Mô tả |
|---|---|---|---|
| GET | `/api/notifications/my` | JWT | Thông báo của user hiện tại (mới nhất trước) |
| PATCH | `/api/notifications/:id/read` | JWT | Đánh dấu đã đọc (chỉ chủ sở hữu) |
| PATCH | `/api/notifications/read-all` | JWT | Đánh dấu tất cả đã đọc |
| POST | `/api/notifications` | JWT, admin | `{ userId, title, message, type?, link? }` |
| DELETE | `/api/notifications/:id` | JWT, admin | Xóa thông báo |

---

## Định Dạng Response Chuẩn

```json
{
  "success": true,
  "message": "success",
  "metadata": { ... }
}
```

Lỗi được ném qua NestJS HTTP exceptions (`BadRequestException`, `NotFoundException`, `UnauthorizedException`, `ForbiddenException`, `ConflictException`) — NestJS tự serialize thành JSON.

---

## Biến Môi Trường (`.env`)

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/education_management?schema=public"
PORT=3000
NODE_ENV=development
URL_CLIENT="http://localhost:5173"

# JWT_SECRET không dùng — xác thực bằng RSA key pair per-user lưu trong bảng api_keys
```

---

## Scripts (`package.json`)

| Script | Lệnh |
|---|---|
| `npm run build` | Compile TypeScript |
| `npm run start` | Chạy từ source (không watch) |
| `npm run start:dev` | Chạy với hot-reload |
| `npm run start:fresh` | Kill port 3000 rồi chạy `start:dev` (tránh EADDRINUSE) |
| `npm run start:prod` | Chạy từ `dist/` đã build |
| `npm run seed` | Seed dữ liệu demo vào DB |

---

## Cấu Hình CORS (`main.ts`)

```ts
app.enableCors({
  origin: process.env.URL_CLIENT || 'http://localhost:5173',
  credentials: true,   // bắt buộc để gửi/nhận cookie cross-origin
});
app.use(cookieParser());
```

---

## Lưu Ý Triển Khai

- **SMTP chưa tích hợp**: `forgotPassword` và tạo user mới đều `console.log` mật khẩu/OTP thay vì gửi email.
- **Model `Class` không có sinh viên trực tiếp**: sinh viên thuộc lớp qua trường chuỗi `User.class`, không phải FK.
- **`User.department`** là chuỗi tự do, không liên kết model `Department`.
- **`findTeachers(?departmentId)`**: filter theo `User.department` (chuỗi) chứ không phải `Department.id`.
