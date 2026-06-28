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
    │   └── seed.constants.ts      # Thông tin đăng nhập người dùng demo
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
| `Role` | `student` (sinh viên), `teacher` (giảng viên), `admin` (quản trị) |
| `Gender` | `male` (nam), `female` (nữ), `other` (khác) |
| `UserStatus` | `studying` (đang học), `reserved` (bảo lưu), `graduate` (tốt nghiệp), `teaching` (đang dạy), `retired` (đã nghỉ), `resigned` (từ chức), `active` (hoạt động), `inactive` (khóa) |
| `TypeLogin` | `email`, `google` |
| `SubjectClassStatus` | `active` (đang mở), `completed` (đã kết thúc), `canceled` (đã hủy) |
| `EnrollmentStatus` | `registered` (đã đăng ký), `dropped` (đã hủy), `completed` (đã hoàn thành) |
| `AttendanceStatus` | `present` (có mặt), `absent` (vắng), `late` (muộn), `excused` (có phép) |
| `NotificationType` | `info`, `success`, `warning`, `error`, `grade` (điểm), `enrollment` (đăng ký) |
| `LetterGrade` | `A`, `B`, `C`, `D`, `F` |
| `ActivityAction` | `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT` |
| `ActivityEntityType` | `user`, `class`, `subject`, `subject_class`, `enrollment`, `grade`, `attendance`, `department`, `branch`, `notification` |

### Các Model

#### `Department` → bảng `departments` (Khoa)
```
id            String  @id uuid
code          String  @unique             -- Mã khoa
nameDepartment String                     -- Tên khoa
branches      Branch[]                   -- Các ngành thuộc khoa
classes       Class[]                    -- Các lớp thuộc khoa
subjects      Subject[]                  -- Các môn học thuộc khoa
```

#### `Branch` → bảng `branches` (Ngành)
```
id            String  @id uuid
code          String  @unique             -- Mã ngành
nameBranch    String                     -- Tên ngành
departmentId  String  → Department       -- Khoa chủ quản
```

#### `User` → bảng `users` (Người dùng)
```
id            String  @id uuid
fullName      String                     -- Họ và tên
email         String  @unique            -- Email trường (dùng đăng nhập)
password      String                     -- Mật khẩu đã mã hóa bcrypt
role          Role                       -- Vai trò: student | teacher | admin
typeLogin     TypeLogin                  -- Loại đăng nhập: email | google
avatar        String?                    -- URL ảnh đại diện
idStudent     String?                    -- Mã số sinh viên
class         String?                    -- Lớp của sinh viên
idTeacher     String?                    -- Mã giảng viên
degree        String?                    -- Học vị giảng viên
phone         String?                    -- Số điện thoại
department    String?                    -- Khoa công tác
address       String?                    -- Địa chỉ
gender        Gender?                    -- Giới tính
birthDay      DateTime?                  -- Ngày sinh
status        UserStatus                 -- Trạng thái tài khoản
isAdmin       Boolean                    -- Cờ quản trị viên
```

#### `Class` → bảng `classes` (Lớp học)
```
id            String  @id uuid
code          String  @unique             -- Mã lớp
nameClass     String                     -- Tên lớp
teacherId     String  → User             -- Giảng viên chủ nhiệm
departmentId  String  → Department       -- Khoa quản lý
```

#### `Subject` → bảng `subjects` (Môn học)
```
id            String  @id uuid
code          String  @unique             -- Mã môn
name          String                     -- Tên môn học
credits       Int                        -- Số tín chỉ
departmentId  String  → Department       -- Khoa phụ trách môn
```

#### `SubjectClass` → bảng `subject_classes` (Lớp học phần)
```
id            String  @id uuid
code          String  @unique             -- Mã lớp học phần
semester      String                     -- Học kỳ (vd: HK1 2024-2025)
maxStudents   Int     mặc định 50        -- Sĩ số tối đa
status        SubjectClassStatus         -- Trạng thái lớp học phần
subjectId     String  → Subject          -- Môn học
teacherId     String  → User             -- Giảng viên phụ trách
```

#### `Enrollment` → bảng `enrollments` (Đăng ký học phần + Điểm)
```
id              String  @id uuid
status          EnrollmentStatus         -- Trạng thái đăng ký
registeredAt    DateTime                 -- Thời điểm đăng ký
attendanceScore Float?                   -- Điểm chuyên cần (hệ số 10%)
midtermScore    Float?                   -- Điểm giữa kỳ (hệ số 30%)
finalScore      Float?                   -- Điểm cuối kỳ (hệ số 60%)
totalScore      Float?                   -- Điểm tổng kết
letterGrade     LetterGrade?             -- Điểm chữ (A/B/C/D/F)
gradeLocked     Boolean                  -- Khóa điểm (không cho sửa)
studentId       String  → User           -- Sinh viên
subjectClassId  String  → SubjectClass   -- Lớp học phần
@@unique([studentId, subjectClassId])   -- Mỗi sinh viên chỉ đăng ký 1 lần/lớp HP
```

#### `Attendance` → bảng `attendances` (Điểm danh)
```
id              String  @id uuid
date            DateTime                 -- Ngày điểm danh
status          AttendanceStatus         -- Trạng thái: có mặt / vắng / muộn / có phép
note            String?                  -- Ghi chú
studentId       String  → User           -- Sinh viên
subjectClassId  String  → SubjectClass   -- Lớp học phần
markedById      String? → User           -- Giảng viên điểm danh
@@unique([subjectClassId, studentId, date])  -- Mỗi buổi chỉ điểm danh 1 lần
```

#### `Notification` → bảng `notifications` (Thông báo)
```
id        String  @id uuid
title     String                         -- Tiêu đề thông báo
message   String                         -- Nội dung
type      NotificationType               -- Loại thông báo
isRead    Boolean                        -- Đã đọc chưa
link      String?                        -- Đường dẫn liên kết
userId    String  → User                 -- Người nhận
```

#### `ActivityLog` → bảng `activity_logs` (Nhật ký hoạt động)
```
id          String  @id uuid
action      ActivityAction               -- Hành động: CREATE/UPDATE/DELETE/LOGIN/LOGOUT
entityType  ActivityEntityType           -- Loại đối tượng bị tác động
entityId    String?                      -- ID đối tượng bị tác động
description String                       -- Mô tả hoạt động
metadata    Json                         -- Dữ liệu bổ sung dạng JSON
ipAddress   String?                      -- Địa chỉ IP thực hiện
userId      String  → User               -- Người thực hiện
```

#### `ApiKey` → bảng `api_keys` (Cặp khóa RSA cho JWT)
```
id          String  @id uuid
publicKey   String                       -- Khóa công khai RSA (PEM)
privateKey  String                       -- Khóa bí mật RSA (PEM)
expireAt    DateTime                     -- Thời hạn hết hiệu lực
userId      String  @unique → User       -- Xóa cùng khi xóa user
```

#### `Otp` → bảng `otps` (Mã OTP quên mật khẩu)
```
id        String  @id uuid
otp       String                         -- Mã OTP đã mã hóa bcrypt
expireAt  DateTime                       -- Thời hạn (5 phút)
userId    String  → User                 -- Xóa cùng khi xóa user
```

---

## Hằng Số Xác Thực (`constants/auth.constants.ts`)

```ts
RSA_MODULUS_LENGTH     = 2048             // Độ dài modulus RSA (bit)
JWT_ALGORITHM          = 'RS256'          // Thuật toán ký JWT
ACCESS_TOKEN_EXPIRES_IN  = '15m'          // Thời hạn access token
REFRESH_TOKEN_EXPIRES_IN = '7d'           // Thời hạn refresh token
ACCESS_TOKEN_MAX_AGE_MS  = 900_000        // 15 phút tính bằng ms
REFRESH_TOKEN_MAX_AGE_MS = 604_800_000    // 7 ngày tính bằng ms
API_KEY_TTL_MS           = 604_800_000    // Thời hạn lưu cặp khóa

COOKIE_TOKEN         = 'token'            // Tên cookie access token
COOKIE_REFRESH_TOKEN = 'refreshToken'     // Tên cookie refresh token
COOKIE_LOGGED        = 'logged'           // Cờ JavaScript-readable
COOKIE_LOGGED_VALUE  = '1'               // Giá trị khi đã đăng nhập
LOGIN_TYPE_GOOGLE    = 'google'           // Giá trị TypeLogin cho Google
BCRYPT_SALT_ROUNDS   = 10                 // Số vòng mã hóa bcrypt
```

---

## Kiến Trúc Module

### PrismaModule (`src/prisma/`)
Được đánh dấu `@Global()` — `PrismaService` tự động khả dụng trong mọi module mà không cần import lại.

### AuthModule (`src/auth/`)
Export `AuthService` và `JwtAuthGuard` để các module khác sử dụng.

### Common (`src/common/`)

**`RolesGuard`** — dùng sau `JwtAuthGuard`:
```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
```

**`@Roles(...roles)`** — đặt metadata cho `RolesGuard`.

---

## Tham Chiếu API

### Xác Thực: `POST/GET /api/users/...`

| Phương thức | Đường dẫn | Bảo vệ | Dữ liệu đầu vào | Mô tả |
|---|---|---|---|---|
| POST | `/api/users/login` | — | `{ email, password }` | Đăng nhập, đặt cookie |
| GET | `/api/users/auth` | JWT | — | Trả về thông tin người dùng hiện tại |
| POST | `/api/users/logout` | JWT | — | Xóa cookie, hủy cặp khóa API |
| GET | `/api/users/refresh-token` | — | cookie: refreshToken | Cấp access token mới |
| POST | `/api/users/forgot-password` | — | `{ email }` | Gửi mã OTP 6 chữ số tới email |
| POST | `/api/users/reset-password` | — | `{ email, otp, newPassword }` | Xác thực OTP và đặt lại mật khẩu |
| PUT | `/api/users/change-password` | JWT | `{ currentPassword, newPassword }` | Đổi mật khẩu khi đã đăng nhập |

---

### Dashboard: `GET /api/dashboard`

| Phương thức | Đường dẫn | Bảo vệ | Mô tả |
|---|---|---|---|
| GET | `/api/dashboard` | JWT, admin | Thống kê tổng hợp: số sinh viên/giảng viên/lớp HP/môn học, phân bố giới tính, phân bố điểm chữ |

---

### Người Dùng: `/api/users`

| Phương thức | Đường dẫn | Bảo vệ | Mô tả |
|---|---|---|---|
| GET | `/api/users/students` | JWT, admin | Danh sách sinh viên (hỗ trợ `?q`, `?class`, `?status`) |
| GET | `/api/users/teachers` | JWT, admin | Danh sách giảng viên (hỗ trợ `?q`, `?departmentId`) |
| GET | `/api/users/:id` | JWT | Lấy thông tin người dùng theo ID |
| POST | `/api/users/students` | JWT, admin | Tạo sinh viên (tự tạo email trường + mật khẩu tạm) |
| POST | `/api/users/teachers` | JWT, admin | Tạo giảng viên |
| POST | `/api/users/bulk-import` | JWT, admin | Nhập hàng loạt sinh viên từ dữ liệu CSV |
| PUT | `/api/users/:id` | JWT | Cập nhật hồ sơ người dùng |
| PATCH | `/api/users/:id/status` | JWT, admin | Khóa/mở khóa tài khoản (`{ status: 'active' \| 'inactive' }`) |
| DELETE | `/api/users/:id` | JWT, admin | Xóa người dùng |

---

### Khoa: `/api/departments`

| Phương thức | Đường dẫn | Bảo vệ | Mô tả |
|---|---|---|---|
| GET | `/api/departments` | JWT | Danh sách tất cả khoa |
| GET | `/api/departments/:id` | JWT | Chi tiết khoa (kèm số lượng ngành) |
| POST | `/api/departments` | JWT, admin | Tạo khoa mới |
| PUT | `/api/departments/:id` | JWT, admin | Cập nhật thông tin khoa |
| DELETE | `/api/departments/:id` | JWT, admin | Xóa khoa |

---

### Ngành: `/api/branches`

| Phương thức | Đường dẫn | Bảo vệ | Mô tả |
|---|---|---|---|
| GET | `/api/branches` | JWT | Danh sách ngành (tùy chọn `?departmentId`) |
| GET | `/api/branches/:id` | JWT | Chi tiết ngành |
| POST | `/api/branches` | JWT, admin | Tạo ngành mới |
| PUT | `/api/branches/:id` | JWT, admin | Cập nhật thông tin ngành |
| DELETE | `/api/branches/:id` | JWT, admin | Xóa ngành |

---

### Lớp Học: `/api/classes`

| Phương thức | Đường dẫn | Bảo vệ | Mô tả |
|---|---|---|---|
| GET | `/api/classes` | JWT | Danh sách lớp (tùy chọn `?departmentId`) |
| GET | `/api/classes/:id` | JWT | Chi tiết lớp (kèm số sinh viên) |
| POST | `/api/classes` | JWT, admin | Tạo lớp mới |
| PUT | `/api/classes/:id` | JWT, admin | Cập nhật thông tin lớp |
| DELETE | `/api/classes/:id` | JWT, admin | Xóa lớp |

---

### Môn Học: `/api/subjects`

| Phương thức | Đường dẫn | Bảo vệ | Mô tả |
|---|---|---|---|
| GET | `/api/subjects` | JWT | Danh sách môn học (tùy chọn `?departmentId`) |
| GET | `/api/subjects/:id` | JWT | Chi tiết môn học |
| POST | `/api/subjects` | JWT, admin | Tạo môn học mới |
| PUT | `/api/subjects/:id` | JWT, admin | Cập nhật thông tin môn học |
| DELETE | `/api/subjects/:id` | JWT, admin | Xóa môn học |

---

### Lớp Học Phần: `/api/subject-classes`

| Phương thức | Đường dẫn | Bảo vệ | Mô tả |
|---|---|---|---|
| GET | `/api/subject-classes` | JWT | Danh sách (admin: tất cả; giảng viên: của mình; sinh viên: đang mở) |
| GET | `/api/subject-classes/my-sections` | JWT, giảng viên | Lớp học phần được phân công cho giảng viên đăng nhập |
| GET | `/api/subject-classes/:id` | JWT | Chi tiết lớp học phần kèm số sinh viên đăng ký |
| GET | `/api/subject-classes/:id/roster` | JWT, giảng viên/admin | Danh sách sinh viên đăng ký |
| POST | `/api/subject-classes` | JWT, admin | Tạo lớp học phần mới |
| PUT | `/api/subject-classes/:id` | JWT, admin | Cập nhật lớp học phần |
| DELETE | `/api/subject-classes/:id` | JWT, admin | Xóa lớp học phần |

---

### Đăng Ký Học Phần: `/api/enrollments`

| Phương thức | Đường dẫn | Bảo vệ | Mô tả |
|---|---|---|---|
| GET | `/api/enrollments/my` | JWT, sinh viên | Danh sách đăng ký hiện tại của sinh viên |
| GET | `/api/enrollments/transcript` | JWT, sinh viên | Bảng điểm tích lũy toàn khóa |
| GET | `/api/enrollments/gpa-trend` | JWT, sinh viên | GPA theo từng học kỳ |
| GET | `/api/enrollments/:subjectClassId/grades` | JWT, giảng viên/admin | Bảng điểm của lớp học phần |
| POST | `/api/enrollments` | JWT, sinh viên | Đăng ký vào lớp học phần `{ subjectClassId }` |
| DELETE | `/api/enrollments/:id` | JWT, sinh viên | Hủy đăng ký học phần |
| PUT | `/api/enrollments/:id/grade` | JWT, giảng viên | Nhập/cập nhật điểm `{ attendanceScore, midtermScore, finalScore }` |
| PATCH | `/api/enrollments/:id/lock` | JWT, giảng viên/admin | Khóa/mở khóa điểm `{ locked: boolean }` |

**Công thức tính điểm:**
```
điểmTổng = điểmChuyênCần × 0.10 + điểmGiữaKỳ × 0.30 + điểmCuốiKỳ × 0.60
Điểm chữ: A (≥8.5) | B (≥7.0) | C (≥5.5) | D (≥4.0) | F (<4.0)
```

---

### Điểm Danh: `/api/attendance`

| Phương thức | Đường dẫn | Bảo vệ | Mô tả |
|---|---|---|---|
| GET | `/api/attendance/:subjectClassId` | JWT, giảng viên/admin | Toàn bộ bản ghi điểm danh của lớp học phần |
| GET | `/api/attendance/my/:subjectClassId` | JWT, sinh viên | Điểm danh cá nhân trong lớp học phần |
| POST | `/api/attendance/bulk` | JWT, giảng viên | Điểm danh hàng loạt một buổi học `{ subjectClassId, date, records: [{studentId, status, note?}] }` |
| PUT | `/api/attendance/:id` | JWT, giảng viên | Cập nhật một bản ghi điểm danh `{ status, note? }` |

---

### Thông Báo: `/api/notifications`

| Phương thức | Đường dẫn | Bảo vệ | Mô tả |
|---|---|---|---|
| GET | `/api/notifications/my` | JWT | Thông báo của người dùng hiện tại |
| PATCH | `/api/notifications/:id/read` | JWT | Đánh dấu một thông báo đã đọc |
| PATCH | `/api/notifications/read-all` | JWT | Đánh dấu tất cả thông báo đã đọc |
| POST | `/api/notifications` | JWT, admin | Tạo thông báo cho người dùng |
| DELETE | `/api/notifications/:id` | JWT, admin | Xóa thông báo |

---

## Định Dạng Response Chuẩn

Tất cả endpoint trả về:

```json
{
  "success": true,
  "message": "success",
  "metadata": { ... }
}
```

Lỗi được ném qua NestJS HTTP exceptions (`BadRequestException`, `NotFoundException`, `UnauthorizedException`, `ForbiddenException`) — NestJS tự động serialize.

---

## Luồng JWT / Phiên Đăng Nhập

1. Khi đăng nhập, xóa cặp khóa API cũ của người dùng và tạo cặp khóa RSA mới.
2. Cả access token và refresh token đều được ký bằng **khóa bí mật**.
3. Mỗi request đã xác thực, `JwtAuthGuard`:
   - Đọc cookie `token`
   - Giải mã JWT để lấy `userId`
   - Lấy bản ghi `ApiKey` của người dùng đó
   - Xác minh chữ ký token bằng **khóa công khai** đã lưu
   - Gắn `{ id, role }` vào `req.user`
4. Đăng xuất xóa bản ghi `ApiKey` → tất cả token đang tồn tại của người dùng đó lập tức vô hiệu.

---

## Luồng OTP (Quên / Đặt Lại Mật Khẩu)

1. `POST /api/users/forgot-password { email }` — tìm người dùng, tạo mã 6 chữ số, mã hóa bcrypt, lưu vào bảng `otps` với thời hạn 5 phút, gửi mã plaintext tới email của người dùng.
2. `POST /api/users/reset-password { email, otp, newPassword }` — tìm OTP chưa hết hạn của người dùng, xác thực bằng bcrypt, mã hóa mật khẩu mới, cập nhật `User.password`, xóa toàn bộ OTP của người dùng đó.

---

## Cách Dùng Role Guard

```ts
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard }   from '../common/guards/roles.guard';
import { Roles }        from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get()
findAll() { ... }
```

`req.user` sau khi qua `JwtAuthGuard`: `{ id: string, role: 'admin' | 'teacher' | 'student' }`

---

## Dữ Liệu Mẫu (`prisma/seed.ts`)

Người dùng demo được định nghĩa trong `constants/seed.constants.ts`:

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Quản trị | admin@school.edu.vn | (biến môi trường `SEED_ADMIN_PASSWORD`) |
| Giảng viên | gv1001@school.edu.vn | (biến môi trường `SEED_TEACHER_PASSWORD`) |
| Sinh viên | 20216001@student.school.edu.vn | (biến môi trường `SEED_STUDENT_PASSWORD`) |

---

## Biến Môi Trường

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/edu_management
NODE_ENV=development

SEED_ADMIN_PASSWORD=...
SEED_TEACHER_PASSWORD=...
SEED_STUDENT_PASSWORD=...

SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=no-reply@school.edu.vn
```

---

## Cấu Hình CORS (`main.ts`)

```ts
app.enableCors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
});
app.use(cookieParser());
```
