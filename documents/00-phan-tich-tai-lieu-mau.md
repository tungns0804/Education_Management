# Phân Tích Tài Liệu Mẫu — `Sample/BC-Sinh viene.docx`

> Tài liệu này tổng hợp lại những gì đã nghiên cứu được từ file mẫu do người dùng cung cấp, làm cơ sở để xây dựng bộ tài liệu kiến trúc cho dự án **Education Management System** (`client_side` + `server_side`). Các tài liệu `01-*` đến `04-*` trong cùng thư mục `documents/` được viết theo đúng cấu trúc/phong cách rút ra từ file mẫu này.

## 1. Định danh tài liệu mẫu

Tài liệu mẫu là một **Đồ án tốt nghiệp Đại học** — không phải tài liệu kỹ thuật nội bộ đơn thuần:

| Thông tin | Giá trị |
|---|---|
| Tên đề tài | Xây dựng hệ thống quản lý sinh viên |
| Trường | Đại học Sư phạm Kỹ thuật Hưng Yên |
| Ngành / Chuyên ngành | Kỹ thuật phần mềm / Công nghệ Web |
| Năm | 2026 |
| Hệ quản trị CSDL của đề tài mẫu | MongoDB (Mongoose) — khác với dự án hiện tại (PostgreSQL/Prisma) |

Vì đây là đồ án tốt nghiệp nên văn phong mang tính học thuật (có chương "Cơ sở lý thuyết", "Kết luận và hướng phát triển", "Tài liệu tham khảo"...). Bộ tài liệu kiến trúc cho dự án thực tế không cần lặp lại các phần học thuật thuần túy (lý do chọn đề tài, mục tiêu đồ án...), mà chỉ kế thừa **cấu trúc phân tích – thiết kế kỹ thuật** (Chương 2–4), vì đây mới là phần có giá trị tái sử dụng cho việc mô tả kiến trúc & nghiệp vụ hệ thống thật.

## 2. Cấu trúc mục lục gốc (rút gọn)

```
Chương 1: Mở đầu (lý do chọn đề tài, mục tiêu, phạm vi, phương pháp)
Chương 2: Cơ sở lý thuyết
  2.1–2.4  Mô hình Client–Server
  2.5–2.7  Công nghệ Front-end (ReactJS, Vite, React Router, SCSS Modules, Context API)
  2.8–2.10 Công nghệ Back-end (Node.js, MVC, Middleware)
  2.11     Kết nối Frontend–Backend
  2.12     Cơ sở dữ liệu (MongoDB)
Chương 3: Phân tích và thiết kế hệ thống
  3.1  Đặc tả yêu cầu phần mềm (chức năng + phi chức năng) + biểu đồ lớp thực thể
  3.2  Thiết kế hệ thống — danh sách tác nhân (Use Case Actor)
  3.3  Biểu đồ Use Case tổng quát + biểu đồ phân rã theo từng nghiệp vụ
  3.4  Đặc tả chi tiết từng Use Case (UC#01, UC#02, ...)
  3.13 Biểu đồ tuần tự (Sequence Diagram) cho từng nghiệp vụ
       + Thiết kế cơ sở dữ liệu (mô hình quan hệ + mô tả từng bảng theo field)
Chương 4: Triển khai website (giao diện, kiểm thử, kết quả thực nghiệm)
Kết luận và hướng phát triển
Tài liệu tham khảo / Phụ lục
```

## 3. Khuôn mẫu (template) rút ra để tái sử dụng

### 3.1 Mô tả yêu cầu (functional / non-functional)
Chia rõ **chức năng theo phân hệ** (phân hệ quản trị vs. phân hệ người dùng), mỗi chức năng có 1 đoạn mô tả ngắn nêu: ai dùng, dữ liệu liên quan, thao tác CRUD nào được phép. Yêu cầu phi chức năng liệt kê theo nhóm chuẩn: Hiệu năng, Bảo mật, Khả dụng, Khả năng mở rộng, Tính dễ dùng, Tính tương thích, Khả năng bảo trì.

### 3.2 Danh sách tác nhân (Actor) + Use Case Diagram
Bảng tác nhân gồm: **STT | Tác nhân | Mô tả**. Sau đó là một biểu đồ Use Case tổng quát, rồi các biểu đồ **phân rã** (decomposition) riêng cho từng nhóm nghiệp vụ lớn (đăng nhập, đăng ký học phần, quản lý điểm, quản lý tài khoản, quản lý lớp, quản lý môn học, điểm danh).

### 3.3 Đặc tả chi tiết Use Case (khuôn mẫu quan trọng nhất)
Mỗi use case được đặc tả theo đúng khuôn:

| Trường | Nội dung |
|---|---|
| Mã & Tên | `UC#xx: <Tên chức năng>` |
| Độ phức tạp | Cao / Trung bình / Thấp |
| Mô tả | 1–2 câu tóm tắt mục đích |
| Tác nhân | Vai trò thực hiện |
| Tiền điều kiện | Trạng thái bắt buộc phải có trước khi use case chạy |
| Hậu điều kiện — Thành công | Kết quả khi hoàn tất đúng |
| Hậu điều kiện — Lỗi | Kết quả khi thất bại |
| Luồng sự kiện chính | Các bước đánh số, mô tả tương tác người dùng ⇄ hệ thống |
| Luồng sự kiện phát sinh | `Luồng A`, `Luồng B`... — các nhánh rẽ khi có lỗi/validate ở luồng chính |

Ví dụ áp dụng trong file mẫu: `UC#01 Đăng nhập`, `UC#02 Đăng ký`, `UC#03 Đăng xuất`, `UC#05 Đăng ký môn`, `UC#08 Thống kê`, `UC#09 Quản lý sinh viên`...

### 3.4 Biểu đồ tuần tự (Sequence Diagram)
Trong file mẫu, đây **thuần là hình ảnh chèn vào Word** (không có đặc tả text kèm theo message flow) — có tiêu đề dạng "Sơ đồ tuần tự chức năng đăng nhập", "Sơ đồ tuần tự chức năng đăng ký môn học", "Sơ đồ tuần tự quản lý điểm số", "Sơ đồ tuần tự quản lý lớp học", "Sơ đồ tuần tự điểm danh sinh viên"... Vì tài liệu markdown không nhúng được sơ đồ UML dạng ảnh tiện lợi, các sequence diagram trong bộ tài liệu này được vẽ lại bằng **Mermaid `sequenceDiagram`** — giữ đúng tinh thần (actor → client → server → DB) nhưng render trực tiếp được trong Markdown/GitHub/VS Code.

### 3.5 Thiết kế cơ sở dữ liệu
Gồm 2 phần: (1) **mô hình quan hệ** dạng sơ đồ (ERD), và (2) **bảng mô tả field** cho từng collection/bảng theo khuôn:

| STT | Tên trường dữ liệu | Kiểu dữ liệu | Ghi chú |
|---|---|---|---|

Áp dụng cho toàn bộ: `user`, `department`, `branch`, `class`, `subject`, `subject_class`, `enrollment`, `attendance`, `notification`, `activity_log`, `apikey`. Tương tự cách trình bày này được tái sử dụng cho ERD của `server_side` (PostgreSQL/Prisma) trong `documents/02-co-so-du-lieu.md`, thay ERD ảnh bằng Mermaid `erDiagram`.

## 4. Điểm khác biệt cần lưu ý khi áp dụng cho dự án thật

Đề tài mẫu dùng ngăn xếp **MongoDB/Mongoose + Express**, còn dự án `Education_Management` hiện tại dùng **PostgreSQL/Prisma + NestJS** ở `server_side/` và **React + Vite (JS thuần, không TypeScript)** ở `client_side/` — khác cơ chế xác thực (đề tài mẫu ký JWT bằng secret chung, dự án thật ký bằng **cặp khóa RSA-2048 riêng cho từng user**, xem `CLAUDE.md`), khác cấu trúc entity (dự án thật không có bảng `Notification` — đã bị loại bỏ khỏi schema — nhưng có thêm bảng `Semester` và trường `User.personalEmail` mà đề tài mẫu không có). Do đó bộ tài liệu `01`–`04` mô tả đúng **hệ thống thật hiện tại**, chỉ mượn *cấu trúc trình bày* từ tài liệu mẫu chứ không sao chép nội dung nghiệp vụ của đề tài mẫu.

## 5. Danh sách tài liệu được tạo ra từ việc phân tích này

| File | Nội dung | Tương ứng chương trong tài liệu mẫu |
|---|---|---|
| `01-kien-truc-he-thong.md` | Kiến trúc tổng thể client/server, tech stack, luồng dữ liệu | Chương 2 |
| `02-co-so-du-lieu.md` | ERD (Mermaid) + mô tả field từng bảng | Mục 3.13.9 |
| `03-usecase-nghiep-vu.md` | Tác nhân, Use Case Diagram (Mermaid), đặc tả UC#xx | Mục 3.1–3.4 |
| `04-sequence-nghiep-vu.md` | Sequence Diagram (Mermaid) cho các luồng nghiệp vụ chính | Mục 3.13.2–3.13.8 |
