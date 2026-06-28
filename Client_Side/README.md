# EduManage — Hệ thống Quản lý Sinh viên

Ứng dụng **ReactJS** (Vite) cho hệ thống quản lý sinh viên đa vai trò: **Admin · Giảng viên · Sinh viên**. Song ngữ Việt/Anh, sáng/tối, dữ liệu mẫu sẵn có.

## Yêu cầu
- Node.js ≥ 18

## Chạy dự án
```bash
npm install      # cài dependencies
npm run dev      # chạy ở chế độ phát triển (http://localhost:5173)
npm run build    # build production ra thư mục dist/
npm run preview  # xem thử bản build
```

## Đăng nhập demo
Ở màn hình đăng nhập, bấm **Đăng nhập nhanh với vai trò** (Quản lý / Giảng dạy / Học tập) rồi bấm **Đăng nhập**. Có thể đổi vai trò bất cứ lúc nào qua menu avatar góc trên bên phải.

| Vai trò | Email demo |
|---|---|
| Admin | `admin@school.edu.vn` |
| Giảng viên | `gv1001@school.edu.vn` |
| Sinh viên | `20216001@student.school.edu.vn` |

> Đăng nhập vai trò **Sinh viên** lần đầu sẽ kích hoạt luồng đổi mật khẩu bắt buộc (demo).

## Tính năng chính
- **Xác thực**: đăng nhập, đổi mật khẩu lần đầu, quên mật khẩu → OTP → đặt lại
- **Admin**: dashboard + biểu đồ, quản lý sinh viên/giảng viên (tìm kiếm, lọc, phân trang, CRUD), khoa/ngành/lớp/môn, lớp học phần, **import CSV + cấp tài khoản hàng loạt**, **export CSV**
- **Giảng viên**: dashboard, lớp phụ trách, điểm danh (theo buổi + lịch sử cả kỳ), nhập điểm, thời khóa biểu
- **Sinh viên**: dashboard, đăng ký môn học, bảng điểm/GPA, thời khóa biểu
- **Toàn cục**: tìm kiếm toàn hệ thống (⌘/Ctrl + K), trung tâm thông báo, chuyển sáng/tối & Việt/Anh, responsive
- **Validation form** đầy đủ với thông báo lỗi inline

## Cấu trúc thư mục
```
edumanage-react/
├─ index.html              # HTML gốc + nạp Google Fonts
├─ package.json
├─ vite.config.js
└─ src/
   ├─ main.jsx             # điểm khởi động React
   ├─ App.jsx              # routing, chuyển vai trò, providers
   ├─ styles.css           # design tokens (sáng/tối) + components
   ├─ db.js                # dữ liệu mẫu + từ điển i18n (VI/EN)
   ├─ icons.jsx            # bộ icon SVG
   ├─ ui.jsx               # primitives: Card, Modal, Drawer, Toast, Form…
   ├─ charts.jsx           # biểu đồ thuần SVG
   ├─ tools.jsx            # tìm kiếm toàn cục, import/export, thông báo
   ├─ auth.jsx             # các màn hình xác thực
   ├─ shell.jsx            # Sidebar, Topbar, DataTable
   ├─ admin.jsx / admin2.jsx   # màn hình Admin
   ├─ teacher.jsx          # màn hình Giảng viên
   ├─ student.jsx          # màn hình Sinh viên
   └─ details.jsx          # hồ sơ chi tiết, lịch sử điểm danh, TKB
```

## Ghi chú
- Dữ liệu là **mock in-memory** trong `src/db.js` — không cần backend để chạy thử. Khi tích hợp API thật, thay các lời gọi đọc `DB.*` bằng request tới server và giữ nguyên tầng giao diện.
- Trạng thái đã đọc của thông báo lưu ở `localStorage` (theo từng vai trò).

---
© 2025 EduManage · ReactJS + Vite
