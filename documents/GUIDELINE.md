# Education Management System — Guideline

Hệ thống quản lý giáo dục gồm hai phần độc lập: **client_side** (React + Vite) và **server_side** (NestJS + Prisma + PostgreSQL).

---

## Mục lục

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Cài đặt & Khởi chạy](#cài-đặt--khởi-chạy)
  - [server_side](#1-server_side-nestjs)
  - [client_side](#2-client_side-react--vite)
- [Biến môi trường](#biến-môi-trường)
- [Database](#database)
- [Master Data — Khởi tạo dữ liệu nền](#master-data--khởi-tạo-dữ-liệu-nền)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Phân quyền & Vai trò](#phân-quyền--vai-trò)
- [Tính năng chính](#tính-năng-chính)
- [Tài khoản demo](#tài-khoản-demo)
- [Scripts tham khảo](#scripts-tham-khảo)

---

## Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---|---|
| Node.js | >= 18 |
| npm | >= 9 |
| PostgreSQL | >= 14 |

---

## Cấu trúc thư mục

```
Education_Management/
├── client_side/                  # Frontend — React + Vite
│   ├── src/
│   │   ├── assets/               # Hình ảnh, static files
│   │   ├── components/           # Shared UI components
│   │   ├── config/               # Cấu hình Axios, HTTP requests
│   │   │   ├── axiosClient.js
│   │   │   ├── request.js
│   │   │   └── userRequest.js
│   │   ├── constants/            # Hằng số toàn cục
│   │   │   ├── api.constants.js
│   │   │   ├── auth.constants.js
│   │   │   └── storage.constants.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state
│   │   ├── layouts/              # Layout theo vai trò
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── TeacherLayout.jsx
│   │   │   └── StudentLayout.jsx
│   │   ├── materials/            # UI components tổng hợp (mock data + UI)
│   │   │   ├── admin.jsx / admin2.jsx
│   │   │   ├── teacher.jsx
│   │   │   ├── student.jsx
│   │   │   ├── auth.jsx
│   │   │   ├── charts.jsx
│   │   │   ├── db.js             # Dữ liệu mock in-memory
│   │   │   ├── icons.jsx
│   │   │   ├── ui.jsx
│   │   │   └── tools.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── teacher/
│   │   │   ├── student/
│   │   │   └── login/
│   │   │       └── LoginUser.jsx
│   │   ├── routes/               # Định nghĩa routing
│   │   ├── utils/                # Helper functions
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env
│   ├── vite.config.js
│   └── package.json
│
├── server_side/                  # Backend — NestJS + Prisma
│   ├── src/
│   │   ├── auth/                 # Module xác thực
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   └── jwt-auth.guard.ts
│   │   ├── prisma/               # Prisma service wrapper
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── constants/
│   │   │   ├── auth.constants.ts
│   │   │   └── seed.constants.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma         # Định nghĩa schema database
│   │   └── seed.ts               # Script seed dữ liệu mẫu
│   ├── .env
│   └── package.json
│
├── scripts/                      # SQL & helper scripts khởi tạo dữ liệu
│   ├── init_master_data.sql      # SQL thuần: import master data (idempotent)
│   └── run_seed.ps1              # PowerShell helper: tự tìm psql và chạy SQL
│
└── documents/
    └── GUIDELINE.md
```

---

## Cài đặt & Khởi chạy

> Cần chạy **server_side trước**, sau đó mới chạy **client_side**.

### 1. server_side (NestJS)

```powershell
cd server_side
```

**Bước 1 — Cài dependencies:**
```powershell
npm install
```

**Bước 2 — Tạo file `.env`** (xem mục [Biến môi trường](#biến-môi-trường)):
```powershell
copy .env.example .env   # hoặc tạo thủ công
```

**Bước 3 — Migrate database:**
```powershell
npx prisma migrate dev --name init
```

**Bước 4 — Generate Prisma client:**
```powershell
npx prisma generate
```

**Bước 5 — Khởi tạo master data:**

> Chọn một trong hai cách bên dưới — cả hai đều idempotent (an toàn khi chạy nhiều lần).

```powershell
# Cách 1 — Prisma seed (TypeScript, khuyến nghị khi dev)
npm run seed

# Cách 2 — SQL script (nhanh hơn, dùng khi setup môi trường mới)
..\scripts\run_seed.ps1
# hoặc psql trực tiếp:
# psql -U postgres -d education_management_database -f ..\scripts\init_master_data.sql
```

**Bước 6 — Chạy server:**
```powershell
# Development (hot reload)
npm run start:dev

# Production
npm run build
npm run start:prod
```

Server khởi chạy tại: `http://localhost:3000`

---

### 2. client_side (React + Vite)

Mở terminal mới:

```powershell
cd client_side
```

**Bước 1 — Cài dependencies:**
```powershell
npm install
```

**Bước 2 — Tạo file `.env`:**
```powershell
copy .env.example .env   # hoặc tạo thủ công
```

**Bước 3 — Chạy dev server:**
```powershell
npm run dev
```

Client khởi chạy tại: `http://localhost:5173` (tự động mở trình duyệt)

**Build production:**
```powershell
npm run build
npm run preview   # preview bản build
```

---

## Biến môi trường

### server_side — `.env`

```env
# PostgreSQL
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://postgres:password@localhost:5432/education_management?schema=public"

# App
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS — URL của Client
URL_CLIENT="http://localhost:5173"
```

### client_side — `.env`

```env
VITE_API_URL=http://localhost:3000
```

---

## Database

Project sử dụng **PostgreSQL** thông qua **Prisma ORM**.

### Các model chính

| Model | Mô tả |
|---|---|
| `User` | Người dùng (Admin / Teacher / Student) |
| `Department` | Khoa / Bộ môn |
| `Branch` | Chuyên ngành |
| `Class` | Lớp học (gắn với giáo viên chủ nhiệm) |
| `Subject` | Môn học |
| `SubjectClass` | Lớp học phần (môn + học kỳ + giáo viên) |
| `Enrollment` | Đăng ký học phần của sinh viên |
| `Attendance` | Điểm danh |
| `Notification` | Thông báo |
| `ActivityLog` | Nhật ký hoạt động |
| `ApiKey` | Quản lý API key (RSA encryption) |
| `Otp` | Mã OTP cho quên mật khẩu |

### Các Enum quan trọng

| Enum | Giá trị |
|---|---|
| `Role` | `ADMIN`, `TEACHER`, `STUDENT` |
| `Gender` | `MALE`, `FEMALE`, `OTHER` |
| `UserStatus` | `ACTIVE`, `INACTIVE`, `SUSPENDED` |
| `EnrollmentStatus` | `ENROLLED`, `DROPPED`, `COMPLETED` |
| `AttendanceStatus` | `PRESENT`, `ABSENT`, `LATE` |
| `LetterGrade` | `A`, `B`, `C`, `D`, `F` |

### Các lệnh Prisma thường dùng

```powershell
# Xem database trực quan (Prisma Studio)
npx prisma studio

# Tạo migration mới sau khi sửa schema
npx prisma migrate dev --name <tên_migration>

# Reset database (xoá toàn bộ, migrate lại)
npx prisma migrate reset

# Sync schema không tạo migration (chỉ dùng development)
npx prisma db push
```

---

## Master Data — Khởi tạo dữ liệu nền

Thư mục `scripts/` chứa các file dùng để import dữ liệu mẫu mỗi khi set up source code mới.

### Nội dung dữ liệu master

| Bảng | Số lượng | Chi tiết |
|---|---|---|
| `departments` | 4 | CNTT, KTKT, KTXD, NN |
| `branches` | 8 | 2 ngành / khoa |
| `users` | 11 | 1 Admin + 4 Giảng viên + 6 Sinh viên |
| `classes` | 4 | KTPM2021A, HTTT2021A, KT2021A, TA2021A |
| `subjects` | 10 | Trải đều 4 khoa |
| `subject_classes` | 7 | HK1 & HK2 2024–2025 + HK1 2023–2024 |
| `enrollments` | 15 | Sinh viên đăng ký học phần |

### Các file trong `scripts/`

| File | Mô tả |
|---|---|
| `init_master_data.sql` | Script SQL thuần, chạy được với bất kỳ PostgreSQL client nào |
| `run_seed.ps1` | PowerShell helper: tự tìm `psql.exe`, chạy file SQL, in kết quả |

### Cách chạy

**Cách 1 — PowerShell helper (khuyến nghị trên Windows):**
```powershell
.\scripts\run_seed.ps1

# Tuỳ chỉnh tham số nếu cấu hình DB khác mặc định:
.\scripts\run_seed.ps1 -DbUser postgres -DbPass mypassword -DbName my_db
```

**Cách 2 — psql trực tiếp:**
```powershell
psql -U postgres -d education_management_database -f scripts/init_master_data.sql
```

**Cách 3 — Prisma seed (TypeScript):**
```powershell
cd server_side
npm run seed
```

### Quy trình setup hoàn chỉnh từ đầu

```powershell
# 1. Tạo database (nếu chưa có)
psql -U postgres -c "CREATE DATABASE education_management_database;"

# 2. Chạy migration — tạo toàn bộ bảng
cd server_side
npx prisma migrate deploy

# 3. Import master data
cd ..
.\scripts\run_seed.ps1
```

### Đặc điểm kỹ thuật

- **Idempotent**: `ON CONFLICT DO UPDATE` — chạy nhiều lần không bị lỗi hoặc tạo bản sao
- **Password hash thực tế**: bcrypt (cost 10), lấy trực tiếp từ DB — không cần re-hash khi chạy lại
- **Foreign key bằng subquery**: ví dụ `(SELECT id FROM departments WHERE code = 'CNTT')` — đúng ngay cả khi UUID thay đổi sau `migrate reset`
- **Bảo toàn điểm số**: bảng `enrollments` dùng `ON CONFLICT DO NOTHING` — không ghi đè điểm nếu đã nhập

---

## Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│         React + Vite  (port 5173)                │
│  ┌──────────────┐  ┌───────────────────────────┐ │
│  │  AuthContext  │  │   Layouts (Admin/Teacher/ │ │
│  │  (JWT token) │  │   Student)                │ │
│  └──────────────┘  └───────────────────────────┘ │
│         │ axios (credentials: true)              │
└─────────┼───────────────────────────────────────┘
          │ HTTP + Cookie (JWT)
┌─────────▼───────────────────────────────────────┐
│              NestJS  (port 3000)                 │
│  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  AuthModule  │  │      AppModule           │  │
│  │  (JWT Guard) │  │  (PrismaModule, ...)     │  │
│  └──────────────┘  └──────────────────────────┘  │
│         │ Prisma Client                          │
└─────────┼───────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────┐
│           PostgreSQL Database                    │
└─────────────────────────────────────────────────┘
```

**Luồng xác thực:**
1. Client gửi `POST /auth/login` với credentials
2. Server trả về **Access Token** (15 phút) + **Refresh Token** (7 ngày) qua cookie `HttpOnly`
3. Client tự động gửi cookie theo mỗi request (CORS `credentials: true`)
4. `JwtAuthGuard` xác thực token trên các route được bảo vệ

---

## Phân quyền & Vai trò

| Vai trò | Mô tả | Quyền truy cập |
|---|---|---|
| **ADMIN** | Quản trị viên hệ thống | Toàn quyền: quản lý user, lớp, môn học, khoa, xem báo cáo |
| **TEACHER** | Giáo viên | Quản lý lớp học phần, điểm danh, nhập điểm, xem lịch dạy |
| **STUDENT** | Sinh viên | Đăng ký học phần, xem điểm, xem lịch học, tính GPA |

Mỗi vai trò sử dụng **Layout riêng** (`AdminLayout`, `TeacherLayout`, `StudentLayout`) và được điều hướng đến route tương ứng sau khi đăng nhập.

---

## Tính năng chính

### Xác thực
- Đăng nhập bằng email + mật khẩu
- Đổi mật khẩu
- Quên mật khẩu qua OTP email

### Admin
- Dashboard tổng quan với biểu đồ thống kê
- Quản lý người dùng (thêm/sửa/xoá, đổi trạng thái)
- Import/Export dữ liệu qua file CSV
- Quản lý lớp học, môn học, khoa/bộ môn
- Nhật ký hoạt động hệ thống

### Teacher (Giáo viên)
- Xem danh sách lớp học phần phụ trách
- Điểm danh sinh viên theo buổi học
- Nhập và cập nhật điểm
- Xem lịch giảng dạy

### Student (Sinh viên)
- Đăng ký / hủy học phần
- Xem bảng điểm và tính GPA
- Xem lịch học
- Nhận thông báo từ hệ thống

### Tính năng chung
- Tìm kiếm toàn cục (`Ctrl/Cmd + K`)
- Trung tâm thông báo
- Giao diện sáng / tối (Light / Dark theme)
- Hỗ trợ đa ngôn ngữ (Tiếng Việt / Tiếng Anh)

---

## Tài khoản demo

> Dữ liệu được khởi tạo qua `npm run seed` hoặc `.\scripts\run_seed.ps1`.

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@school.edu.vn` | `Admin@123` |
| Teacher | `gv1001@school.edu.vn` | `Teacher@123` |
| Teacher | `gv1002@school.edu.vn` | `Teacher@123` |
| Teacher | `gv1003@school.edu.vn` | `Teacher@123` |
| Teacher | `gv1004@school.edu.vn` | `Teacher@123` |
| Student | `20216001@student.school.edu.vn` | `Student@123` |
| Student | `20216002@student.school.edu.vn` | `Student@123` |
| Student | `20216003@student.school.edu.vn` | `Student@123` |
| Student | `20216004@student.school.edu.vn` | `Student@123` |
| Student | `20216005@student.school.edu.vn` | `Student@123` |
| Student | `20216006@student.school.edu.vn` | `Student@123` |

---

## Scripts tham khảo

### server_side

| Lệnh | Mô tả |
|---|---|
| `npm run start:dev` | Chạy development với hot reload |
| `npm run start:prod` | Chạy production |
| `npm run build` | Build TypeScript sang JavaScript |
| `npm run seed` | Seed master data qua Prisma (TypeScript) |
| `npm run lint` | Kiểm tra lỗi ESLint |
| `npm run test` | Chạy unit tests |
| `npm run test:e2e` | Chạy end-to-end tests |
| `npx prisma studio` | Mở Prisma Studio (GUI database) |
| `npx prisma migrate dev` | Tạo và apply migration mới |
| `npx prisma migrate deploy` | Apply migration trên môi trường production |
| `npx prisma migrate reset` | Reset database và chạy lại toàn bộ migration |

### client_side

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy dev server (port 5173, tự mở browser) |
| `npm run build` | Build production |
| `npm run preview` | Preview bản build production |

### scripts/

| Lệnh | Mô tả |
|---|---|
| `.\scripts\run_seed.ps1` | Chạy PowerShell helper — tự tìm psql và import master data |
| `.\scripts\run_seed.ps1 -DbPass <pass>` | Chạy với password tùy chỉnh |
| `psql ... -f scripts/init_master_data.sql` | Chạy SQL trực tiếp qua psql / DBeaver / pgAdmin |

---

## Lưu ý

- Luôn khởi động **server_side trước** khi chạy client_side.
- Đảm bảo **PostgreSQL đang chạy** và `DATABASE_URL` trong `.env` đúng.
- Sau khi thay đổi `schema.prisma`, phải chạy `npx prisma migrate dev` và `npx prisma generate`.
- CORS được cấu hình để chấp nhận request từ `URL_CLIENT` trong `.env` của server_side. Nếu đổi port Client, cần cập nhật biến này.
