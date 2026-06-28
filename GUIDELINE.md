# Education Management System — Guideline

Hệ thống quản lý giáo dục gồm hai phần độc lập: **Client_Side** (React + Vite) và **Server_Side** (NestJS + Prisma + PostgreSQL).

---

## Mục lục

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Cài đặt & Khởi chạy](#cài-đặt--khởi-chạy)
  - [Server\_Side](#1-server_side-nestjs)
  - [Client\_Side](#2-client_side-react--vite)
- [Biến môi trường](#biến-môi-trường)
- [Database](#database)
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
├── Client_Side/                  # Frontend — React + Vite
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
├── Server_Side/                  # Backend — NestJS + Prisma
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
└── GUIDELINE.md
```

---

## Cài đặt & Khởi chạy

> Cần chạy **Server_Side trước**, sau đó mới chạy **Client_Side**.

### 1. Server_Side (NestJS)

```powershell
cd Server_Side
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

**Bước 5 — Seed dữ liệu mẫu (tuỳ chọn):**
```powershell
npm run seed
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

### 2. Client_Side (React + Vite)

Mở terminal mới:

```powershell
cd Client_Side
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

### Server_Side — `.env`

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

### Client_Side — `.env`

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

> Dữ liệu demo được seed qua `npm run seed` trong `Server_Side`.

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@school.edu.vn` | _(xem file seed.ts)_ |
| Teacher | `gv1001@school.edu.vn` | _(xem file seed.ts)_ |
| Student | `20216001@student.school.edu.vn` | _(xem file seed.ts)_ |

---

## Scripts tham khảo

### Server_Side

| Lệnh | Mô tả |
|---|---|
| `npm run start:dev` | Chạy development với hot reload |
| `npm run start:prod` | Chạy production |
| `npm run build` | Build TypeScript sang JavaScript |
| `npm run seed` | Seed dữ liệu mẫu vào database |
| `npm run lint` | Kiểm tra lỗi ESLint |
| `npm run test` | Chạy unit tests |
| `npm run test:e2e` | Chạy end-to-end tests |
| `npx prisma studio` | Mở Prisma Studio (GUI database) |
| `npx prisma migrate dev` | Tạo và apply migration mới |

### Client_Side

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy dev server (port 5173, tự mở browser) |
| `npm run build` | Build production |
| `npm run preview` | Preview bản build production |

---

## Lưu ý

- Luôn khởi động **Server_Side trước** khi chạy Client_Side.
- Đảm bảo **PostgreSQL đang chạy** và `DATABASE_URL` trong `.env` đúng.
- Sau khi thay đổi `schema.prisma`, phải chạy `npx prisma migrate dev` và `npx prisma generate`.
- CORS được cấu hình để chấp nhận request từ `URL_CLIENT` trong `.env` của Server_Side. Nếu đổi port Client, cần cập nhật biến này.
