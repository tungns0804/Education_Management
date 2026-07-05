# Testcase kiểm tra hồi quy Client (client_side) — sau chuẩn hóa cấu trúc thư mục

> Mục đích: xác nhận **không tính năng nào bị degrade và không giao diện nào thay đổi** sau khi refactor
> `client_side/src` sang cấu trúc chuẩn (components / assets / config / context / layouts / pages / routes / utils) — 07/2026.

## 1. Môi trường & cách chạy

| Thành phần | Yêu cầu |
|---|---|
| PostgreSQL | Đang chạy, DB đã seed (`server_side`: `npm run seed`) |
| Backend | `server_side`: `npm run start:dev` → http://localhost:3000 |
| Frontend | `client_side`: `npm run dev` → http://localhost:5173 |
| Tài khoản demo | admin / Admin@123 · gv1001 / Teacher@123 · 20216001 / Student@123 |

**Test tự động (Playwright):**

```bash
cd client_side
npm run test:e2e        # chạy tests/e2e.regression.mjs — in PASS/FAIL từng TC
```

Ảnh chụp màn hình lưu tại `client_side/tests/screenshots/` — dùng để so sánh giao diện trước/sau.

**Verify tĩnh:** `npm run build` phải thành công (mọi import/export đều resolve).

## 2. Danh sách testcase tự động (tests/e2e.regression.mjs)

### Nhóm TC-00x — Trang đăng nhập (chưa xác thực)

| Mã | Nội dung kiểm tra | Kết quả mong đợi |
|---|---|---|
| TC-001 | Mở http://localhost:5173 | Hiển thị heading "Đăng nhập" + brand panel EduManage |
| TC-002 | Form đăng nhập tối giản | Chỉ gồm 2 trường: mã tài khoản + mật khẩu; không còn tab chọn vai trò |
| TC-003 | Nút đổi ngôn ngữ | VI → EN: heading đổi thành "Sign in" |
| TC-004 | Nút đổi theme | `data-theme` trên `<html>` đổi light ↔ dark |
| TC-005 | Link "Quên mật khẩu?" | Mở màn "Khôi phục mật khẩu" có nút "Gửi mã OTP" |
| TC-006 | Bỏ trống mã tài khoản rồi rời khỏi ô nhập | Báo lỗi "Vui lòng nhập mã tài khoản" |

### Nhóm TC-1xx — Phân hệ Admin (admin / Admin@123)

| Mã | Nội dung kiểm tra | Kết quả mong đợi |
|---|---|---|
| TC-101 | Đăng nhập Admin | Vào layout chính, sidebar hiển thị |
| TC-102 | Dashboard | Đúng 4 thẻ thống kê (SV, GV, Lớp HP, Môn học) |
| TC-103 | Dashboard | Biểu đồ "Sinh viên theo khoa" + "Tỉ lệ giới tính" render |
| TC-104 | Menu Sinh viên | Bảng danh sách + nút "Nhập dữ liệu" / "Xuất file" |
| TC-105 | Click 1 dòng sinh viên | Mở trang hồ sơ chi tiết, có nút "Sửa hồ sơ" |
| TC-106 | Menu Giảng viên | Bảng danh sách render |
| TC-107–109 | Menu Khoa / Ngành / Lớp | Màn danh mục render, hiển thị "… bản ghi" |
| TC-110 | Menu Môn học | Màn render "Quản lý … môn học" |
| TC-111 | Menu Lớp học phần | Danh sách card lớp học phần render |
| TC-112 | Menu Học kỳ | Màn "Quản lý học kỳ" render |
| TC-113 | Đăng xuất (menu avatar → xác nhận modal) | Quay về trang đăng nhập |

### Nhóm TC-2xx — Phân hệ Giảng viên (gv1001 / Teacher@123)

| Mã | Nội dung kiểm tra | Kết quả mong đợi |
|---|---|---|
| TC-201 | Đăng nhập GV | Vào layout, sidebar 5 mục giảng dạy |
| TC-202 | Lớp phụ trách | Danh sách lớp học phần được phân công render |
| TC-203 | Điểm danh | Có 2 tab "Buổi học" / "Lịch sử" |
| TC-204 | Nhập điểm | Hiển thị công thức "10% chuyên cần + 30% giữa kỳ + 60% cuối kỳ" |
| TC-205 | Thời khóa biểu | Màn "Lịch học trong tuần" render |

### Nhóm TC-3xx — Phân hệ Sinh viên (20216001 / Student@123)

| Mã | Nội dung kiểm tra | Kết quả mong đợi |
|---|---|---|
| TC-301 | Đăng nhập SV | Vào layout, sidebar 4 mục học tập |
| TC-302 | Dashboard | Hero banner "Chào mừng trở lại," + GPA + tín chỉ |
| TC-303 | Đăng ký môn | Danh sách lớp mở + panel "Giỏ đăng ký" |
| TC-304 | Thời khóa biểu | Màn "Lịch học trong tuần" render |
| TC-305 | Bảng điểm | Thẻ "GPA tích lũy" + bảng điểm theo học kỳ |
| TC-306 | Menu avatar → Hồ sơ | Trang hồ sơ cá nhân, có mục "Đổi mật khẩu" |

### Nhóm TC-9xx — Chất lượng chung

| Mã | Nội dung kiểm tra | Kết quả mong đợi |
|---|---|---|
| TC-900 | Console trình duyệt trong toàn bộ phiên (3 vai trò) | Không có lỗi JavaScript (loại trừ lỗi mạng backend) |

## 3. Checklist kiểm tra thủ công bổ sung (các luồng ghi dữ liệu)

Các luồng dưới đây thay đổi dữ liệu thật nên để kiểm thủ công khi cần nghiệm thu đầy đủ:

| Mã | Luồng | Bước chính | Kết quả mong đợi |
|---|---|---|---|
| MT-01 | Thêm sinh viên | Admin → Sinh viên → Thêm sinh viên → điền form → "Tạo & cấp tài khoản" | Toast thành công; mã SV + email trường tự sinh; email tài khoản gửi về email cá nhân |
| MT-02 | Import SV hàng loạt | Nhập dữ liệu → tải file mẫu .xlsx → dán/upload CSV | Preview phân biệt dòng hợp lệ/lỗi; chỉ cho import khi 100% hợp lệ |
| MT-03 | Khóa / mở khóa tài khoản | Menu ⋯ trên dòng SV/GV → Khóa | Badge trạng thái đổi; user bị khóa đăng nhập bị chặn, phiên đang mở hiện modal "Tài khoản đã bị khóa" |
| MT-04 | CRUD danh mục | Thêm/sửa/xóa Khoa, Ngành, Lớp, Môn học, Lớp HP, Học kỳ | Toast kết quả; bảng tự tải lại; xóa có modal xác nhận |
| MT-05 | Điểm danh | GV → Điểm danh → chọn lớp, ngày → đánh dấu → Lưu | Toast "Đã lưu điểm danh"; tab Lịch sử hiển thị đúng ký hiệu P/L/A/E và % chuyên cần |
| MT-06 | Nhập điểm + khóa điểm | GV → Nhập điểm → nhập 3 cột (0–10) → Lưu điểm; bấm khóa 1 dòng | Điểm tổng & điểm chữ tính tự động; dòng khóa không sửa được |
| MT-07 | Đăng ký / hủy môn | SV → Đăng ký môn → Đăng ký; lớp trùng lịch hiện nhãn "Trùng lịch" | Giỏ đăng ký cập nhật tổng tín chỉ (≤24); server chặn lớp full / trùng lịch |
| MT-08 | Quên mật khẩu OTP | Login → Quên mật khẩu → nhập mã → OTP 6 số từ email cá nhân → đặt mật khẩu mới | Đếm ngược 5 phút; sai/hết hạn báo lỗi; đổi xong đăng nhập lại bằng mật khẩu mới |
| MT-09 | Đổi mật khẩu trong hồ sơ | Hồ sơ → Đổi mật khẩu → nhập mật khẩu hiện tại + mới (đủ 4 rule) | Toast thành công, tự đăng xuất sau ~2.5s |
| MT-10 | Sửa hồ sơ + avatar | Hồ sơ → Sửa hồ sơ → đổi thông tin, chọn ảnh | Ảnh được nén client-side; thông tin lưu và hiển thị lại đúng |
| MT-11 | Xuất file | Các màn danh sách → Xuất file / Xuất PDF (bảng điểm) | CSV mở đúng tiếng Việt trên Excel (BOM UTF-8); bảng điểm in qua window.print |
| MT-12 | Ghi nhớ tùy chọn | Đổi theme + ngôn ngữ rồi F5 | Giữ nguyên lựa chọn (localStorage em_theme / em_lang) |

## 4. Kết quả lần chạy sau refactor (05/07/2026)

- `npm run build`: ✅ thành công (211 modules, không lỗi).
- `npm run test:e2e`: ✅ **31/31 PASS** trên cả 3 vai trò, không lỗi JS console.
- So sánh screenshot trước/sau: giao diện login, dashboard Admin/GV/SV, các màn danh sách **không thay đổi**.

## 5. Truy vết refactor (file cũ → file mới)

| File cũ (src/materials/…) | Chuyển tới |
|---|---|
| `icons.jsx` | `components/icons.jsx` |
| `ui.jsx` (UI primitives) | `components/ui.jsx` |
| `ui.jsx` (AppProvider/useApp) | `context/AppContext.jsx` |
| `shell.jsx` | `components/shell.jsx` |
| `charts.jsx` | `components/charts.jsx` |
| `tools.jsx` (BulkImportDrawer) | `components/BulkImportDrawer.jsx` |
| `tools.jsx` (downloadCSV, parseCSV) | `utils/csv.js` |
| `tools.jsx` (đọc file, template Excel) | `utils/excel.js` |
| `db.js` (I18N) | `constants/i18n.constants.js` (mock data không dùng — đã bỏ) |
| `admin.jsx` | `pages/admin/AdminDashboard.jsx`, `StudentsScreen.jsx`, `StudentDrawer.jsx` + `components/table.jsx` |
| `admin2.jsx` | `pages/admin/TeachersScreen.jsx`, `CatalogScreen.jsx`, `SubjectsScreen.jsx`, `SectionsScreen.jsx`, `SemestersScreen.jsx` + `components/TeacherBulkImportDrawer.jsx` |
| `teacher.jsx` | `pages/teacher/TeacherDashboard.jsx`, `MySectionsScreen.jsx`, `AttendanceScreen.jsx`, `GradeEntryScreen.jsx` + `components/feedback.jsx` |
| `student.jsx` | `pages/student/StudentDashboard.jsx`, `RegistrationScreen.jsx`, `TranscriptScreen.jsx` |
| `details.jsx` | `pages/admin/StudentProfile.jsx`, `pages/shared/ScheduleScreen.jsx` |
| `auth.jsx` | Bỏ (re-export chết, không nơi nào import) |
| `layouts/AdminLayout.jsx`, `TeacherLayout.jsx`, `StudentLayout.jsx` (bản react-router không dùng) | Gộp thành `layouts/MainLayout.jsx` (Shell từ App.jsx cũ); NAV theo vai trò khai báo trong MainLayout |
| Switch route trong `App.jsx` | `routes/index.jsx` (bảng ROUTES + HOME_ROUTE trung tâm) |
| `constants/schedule.constants.js` (hàm format/conflict) | `utils/schedule.js` (WEEKDAYS vẫn ở constants) |
