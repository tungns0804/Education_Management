# Hướng Dẫn Client Side — Hệ Thống Quản Lý Giáo Dục

## Công Nghệ Sử Dụng

| Tầng | Công nghệ |
|---|---|
| Framework | React 18 (Vite) |
| Định tuyến | react-router-dom |
| HTTP | axios |
| Cookie xác thực | js-cookie |
| Công cụ build | Vite (cổng 5173) |

---

## Cấu Trúc Thư Mục

```
Client_Side/src/
├── App.jsx                        # Gốc: điều hướng theo vai trò người dùng
├── main.jsx                       # Điểm khởi động ứng dụng
├── config/
│   ├── axiosClient.js             # Axios đã xác thực (tự làm mới token khi lỗi 401)
│   ├── request.js                 # Axios thuần (không có interceptor xác thực)
│   └── userRequest.js             # Tất cả hàm gọi API
├── constants/
│   ├── api.constants.js           # URL gốc và đường dẫn các endpoint
│   ├── auth.constants.js          # Vai trò, tài khoản demo, quy tắc mật khẩu
│   └── storage.constants.js       # Tên khóa localStorage / cookie
├── context/
│   └── AuthContext.jsx            # Trạng thái xác thực (user, login, logout)
├── layouts/
│   ├── AdminLayout.jsx            # Giao diện khung Admin (sidebar + thanh trên)
│   ├── TeacherLayout.jsx          # Giao diện khung Giảng viên
│   └── StudentLayout.jsx          # Giao diện khung Sinh viên
├── pages/
│   └── login/
│       └── LoginUser.jsx          # Đăng nhập + quên mật khẩu + OTP + đặt lại mật khẩu
└── materials/                     # Các tính năng UI (hiện dùng dữ liệu giả từ db.js)
    ├── admin.jsx                  # Admin: Dashboard, màn hình Sinh viên
    ├── admin2.jsx                 # Admin: Giảng viên, Danh mục, Lớp học phần
    ├── teacher.jsx                # Giảng viên: Dashboard, Lớp của tôi, Điểm danh, Nhập điểm
    ├── student.jsx                # Sinh viên: Dashboard, Đăng ký học phần, Bảng điểm
    ├── details.jsx                # Màn hình chi tiết dùng chung (lịch sử điểm danh, hồ sơ)
    ├── shell.jsx                  # Nguyên tố layout: Page, SectionHead, DataTable, MenuRow
    ├── ui.jsx                     # Components tái sử dụng: Avatar, Modal, Drawer, FormField, Toast...
    ├── icons.jsx                  # Thư viện icon (SVG wrappers)
    ├── charts.jsx                 # BarChart, DonutChart, LineChart, HBars, Ring
    ├── tools.jsx                  # BulkImportDrawer, tiện ích downloadCSV
    ├── auth.jsx                   # Tiện ích xác thực
    └── db.js                      # Dữ liệu giả + từ điển i18n (VI/EN)
```

---

## Luồng Xác Thực

```
1. Người dùng POST /api/users/login { email, password }
2. Server đặt 3 cookie httpOnly:
     token          → JWT access token  (15 phút)
     refreshToken   → JWT refresh token (7 ngày)
     logged         → cờ non-httpOnly (JavaScript đọc được để kiểm tra trạng thái đăng nhập)
3. AuthContext lưu đối tượng user trả về từ server
4. Mỗi request, apiClient tự động gửi cookie (withCredentials: true)
5. Khi nhận 401 → interceptor gọi GET /api/users/refresh-token → thử lại request gốc
6. Đăng xuất → POST /api/users/logout → server xóa toàn bộ cookie
```

---

## HTTP Clients

### `config/request.js` — Không xác thực
Dùng cho đăng nhập, làm mới token, quên mật khẩu (không có interceptor 401).

### `config/axiosClient.js` — Đã xác thực
- `baseURL`: biến môi trường `VITE_API_URL` hoặc mặc định `http://localhost:3000`
- `withCredentials: true`
- **Response interceptor**: khi nhận 401, gọi `/api/users/refresh-token`, sau đó thử lại request gốc một lần.

---

## Các Endpoint API (`constants/api.constants.js`)

```js
API_BASE_URL   = import.meta.env.VITE_API_URL || 'http://localhost:3000'
API_TIMEOUT_MS = 10_000

USERS_BASE = '/api/users'
```

| Hàm | Phương thức | Đường dẫn |
|---|---|---|
| `requestLogin` | POST | `/api/users/login` |
| `requestLogout` | POST | `/api/users/logout` |
| `requestAuth` | GET | `/api/users/auth` |
| `requestRefreshToken` | GET | `/api/users/refresh-token` |
| `requestForgotPassword` | POST | `/api/users/forgot-password` |
| `requestResetPassword` | POST | `/api/users/reset-password` |
| `requestChangePassword` | PUT | `/api/users/change-password` |

Các request đã xác thực dùng `apiClient`; chưa xác thực dùng `request` thuần.

---

## Định Tuyến Theo Vai Trò (`App.jsx`)

Ba vai trò người dùng, mỗi vai trò có layout và bộ màn hình riêng:

| Vai trò | Layout | Màn hình mặc định |
|---|---|---|
| `admin` | AdminLayout | Dashboard |
| `teacher` | TeacherLayout | Dashboard |
| `student` | StudentLayout | Dashboard |

### Màn hình Admin (khóa route)

| Khóa | Component | Mô tả |
|---|---|---|
| `a-dash` | AdminDashboard | Thẻ thống kê, biểu đồ |
| `a-students` | StudentsScreen | Danh sách sinh viên CRUD |
| `a-teachers` | TeachersScreen | Danh sách giảng viên CRUD |
| `a-faculty` | CatalogScreen(faculty) | Quản lý Khoa |
| `a-major` | CatalogScreen(major) | Quản lý Ngành |
| `a-class` | CatalogScreen(class) | Quản lý Lớp |
| `a-subject` | CatalogScreen(subject) | Quản lý Môn học |
| `a-sections` | SectionsScreen | Lưới lớp học phần |

### Màn hình Giảng viên (khóa route)

| Khóa | Component | Mô tả |
|---|---|---|
| `t-dash` | TeacherDashboard | Thống kê + lịch hôm nay |
| `t-sections` | MySectionsScreen | Lớp học phần được phân công |
| `t-attendance` | AttendanceScreen | Điểm danh |
| `t-grades` | GradeEntryScreen | Nhập điểm giữa kỳ / cuối kỳ |

### Màn hình Sinh viên (khóa route)

| Khóa | Component | Mô tả |
|---|---|---|
| `s-dash` | StudentDashboard | GPA, tín chỉ, môn đang học |
| `s-reg` | RegistrationScreen | Đăng ký học phần |
| `s-transcript` | TranscriptScreen | Bảng điểm tích lũy toàn khóa |

---

## AuthContext (`context/AuthContext.jsx`)

Cung cấp:
- `user` — đối tượng người dùng hiện tại (null khi chưa đăng nhập)
- `login(email, password)` — gọi `requestLogin`, lưu thông tin user
- `logout()` — gọi `requestLogout`, xóa thông tin user

---

## Thư Viện UI Component (`materials/ui.jsx`)

Tất cả component dùng CSS variables để hỗ trợ giao diện sáng/tối.

| Component | Mục đích |
|---|---|
| `Avatar` | Avatar chữ cái đầu với màu sắc xác định |
| `Modal` | Hộp thoại xác nhận / thông tin |
| `Drawer` | Bảng bên cho form thêm/sửa |
| `FormField` | Khung label + input với hiển thị lỗi |
| `StatCard` | Thẻ KPI với icon, giá trị, delta |
| `StatusBadge` | Badge trạng thái hoạt động / khóa |
| `Toast` | Thông báo tạm thời (qua `useToast()`) |
| `Segmented` | Nút chuyển đổi kiểu tab |
| `useApp()` | Hook: `{ t, lang, tn }` — hàm dịch thuật |
| `useForm()` | Hook: trạng thái form + validation + submit |
| `useToast()` | Hook: kích hoạt toast `toast(msg, type?)` |

---

## Đa Ngôn Ngữ (`materials/db.js`)

- Ngôn ngữ: `'vi'` (Tiếng Việt) hoặc `'en'` (Tiếng Anh)
- `t(key)` — trả về chuỗi đã dịch theo ngôn ngữ hiện tại
- `tn(obj)` — trả về `obj.name_vi` hoặc `obj.name_en` theo ngôn ngữ
- Từ điển bao gồm tất cả nhãn giao diện; dữ liệu song ngữ dùng mẫu `name_vi` / `name_en`

---

## Dữ Liệu Giả (`materials/db.js`)

Hiện tất cả màn hình đọc từ `DB` (dữ liệu giả). Khi nối API thật:

| Xuất từ DB | Endpoint API thay thế |
|---|---|
| `DB.STUDENTS` | `GET /api/users/students` |
| `DB.TEACHERS` | `GET /api/users/teachers` |
| `DB.FACULTIES` | `GET /api/departments` |
| `DB.MAJORS` | `GET /api/branches` |
| `DB.CLASSES` | `GET /api/classes` |
| `DB.SUBJECTS` | `GET /api/subjects` |
| `DB.SECTIONS` | `GET /api/subject-classes` |
| `DB.DEMO_TRANSCRIPT` | `GET /api/enrollments/transcript` |
| `DB.GPA_TREND` | `GET /api/enrollments/gpa-trend` |
| `DB.stats` | `GET /api/dashboard` |

---

## Công Thức Tính Điểm

```
điểmTổng = điểmChuyênCần × 0.10 + điểmGiữaKỳ × 0.30 + điểmCuốiKỳ × 0.60
```

Xếp loại điểm chữ:
- A: ≥ 8.5
- B: ≥ 7.0
- C: ≥ 5.5
- D: ≥ 4.0
- F: < 4.0

Màn hình nhập điểm của giảng viên chỉ hiển thị giữa kỳ (40%) + cuối kỳ (60%) — điểm chuyên cần được tính toán riêng.

---

## Quy Tắc Mật Khẩu (`constants/auth.constants.js`)

- Tối thiểu 8 ký tự
- Ít nhất 1 chữ hoa
- Ít nhất 1 chữ số
- Ít nhất 1 ký tự đặc biệt

---

## Biến Môi Trường

```env
VITE_API_URL=http://localhost:3000   # tùy chọn, mặc định localhost:3000
```

---

## Nhập Hàng Loạt (`materials/tools.jsx`)

`BulkImportDrawer`:
- Nhận CSV với các cột: họ tên, mã sinh viên, giới tính (M/F), ngày sinh (DD/MM/YYYY), mã lớp, email cá nhân
- Kiểm tra từng dòng phía client
- Khi xác nhận → gọi `POST /api/users/bulk-import`
- Server tự tạo email trường và mật khẩu tạm, gửi thông tin đăng nhập tới email cá nhân

---

## Xuất CSV (`materials/tools.jsx`)

`downloadCSV(tenFile, tieuDe, hangDulieu)`:
- Tạo blob CSV UTF-8 BOM và kích hoạt tải xuống trình duyệt
- Dùng trong màn hình Sinh viên và Giảng viên

---

## Giao Diện

CSS custom properties (`--surface`, `--text`, `--accent`, `--border`...) được chuyển đổi qua class trên `<body>`. Không dùng thư viện CSS bên ngoài. Các component tham chiếu trực tiếp biến qua inline styles.
