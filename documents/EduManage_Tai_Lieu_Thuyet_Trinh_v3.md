# TRANG BÌA

**HỆ THỐNG QUẢN LÝ ĐÀO TẠO ĐẠI HỌC EDUMANAGE**

**TÀI LIỆU THUYẾT TRÌNH HỆ THỐNG**

Phiên bản: 3.0

Ngày phát hành: 05/07/2026

Đối tượng người đọc: Người hướng dẫn, hội đồng đánh giá (bao gồm cả người có và không có nền tảng kỹ thuật)

# DANH SÁCH CÁC THUẬT NGỮ

| Từ viết tắt | Từ đầy đủ | Giải thích |
| --- | --- | --- |
| API | Application Programming Interface | Giao diện lập trình cho phép các hệ thống giao tiếp với nhau |
| REST | Representational State Transfer | Kiến trúc xây dựng API dựa trên giao thức HTTP |
| SPA | Single Page Application | Ứng dụng web chỉ tải một trang duy nhất, các thao tác sau đó không cần tải lại trang |
| UI / UX | User Interface / User Experience | Giao diện người dùng / Trải nghiệm người dùng |
| CSDL | Cơ sở dữ liệu (Database) | Nơi lưu trữ toàn bộ dữ liệu của hệ thống |
| CRUD | Create, Read, Update, Delete | Bốn thao tác cơ bản với dữ liệu: thêm, xem, sửa, xóa |
| ORM | Object-Relational Mapping | Kỹ thuật ánh xạ bảng CSDL thành đối tượng trong mã nguồn, giúp truy vấn an toàn |
| JWT | JSON Web Token | Chuẩn token dùng để xác thực người dùng giữa client và server |
| RSA | Rivest–Shamir–Adleman | Thuật toán mã hóa bất đối xứng dùng cặp khóa công khai / bí mật |
| RS256 | RSA Signature with SHA-256 | Thuật toán ký JWT bằng khóa RSA, xác minh bằng khóa công khai |
| bcrypt | — | Thuật toán băm mật khẩu một chiều, chống dò ngược |
| OTP | One-Time Password | Mật khẩu dùng một lần, gửi qua email khi quên mật khẩu |
| RBAC | Role-Based Access Control | Phân quyền theo vai trò: mỗi vai trò chỉ dùng được chức năng cho phép |
| Cookie httpOnly | — | Cookie mà mã JavaScript trên trình duyệt không đọc được, chống đánh cắp token |
| SMTP | Simple Mail Transfer Protocol | Giao thức gửi email, dùng để gửi thông tin tài khoản và mã OTP |
| GPA | Grade Point Average | Điểm trung bình tích lũy của sinh viên |
| ERD | Entity Relationship Diagram | Sơ đồ quan hệ thực thể của cơ sở dữ liệu |
| UC | Use Case | Ca sử dụng — một chức năng nghiệp vụ nhìn từ góc độ người dùng |
| CSV / Excel | Comma-Separated Values / Microsoft Excel | Các định dạng tệp dùng để nhập và xuất danh sách hàng loạt |
| FK / PK | Foreign Key / Primary Key | Khóa ngoại / Khóa chính trong cơ sở dữ liệu quan hệ |
| Guard | — | Lớp chắn kiểm tra xác thực và phân quyền trước khi request đi vào xử lý nghiệp vụ |
| Transaction | — | Giao dịch CSDL: một nhóm thao tác hoặc thành công toàn bộ, hoặc không thực hiện gì |

# MỞ ĐẦU

## Giới thiệu chung

EduManage là hệ thống quản lý đào tạo đại học dạng website, được xây dựng nhằm số hóa các nghiệp vụ cốt lõi của một trường đại học: quản lý tài khoản sinh viên và giảng viên, quản lý danh mục đào tạo (Khoa, Ngành, Lớp, Môn học, Lớp học phần, Học kỳ), đăng ký học phần, điểm danh, nhập điểm, tính điểm trung bình tích lũy (GPA) và thống kê tổng quan theo từng vai trò.

Hệ thống EduManage phục vụ ba nhóm người dùng chính:

- **Quản trị viên (Admin)**: quản lý toàn bộ tài khoản, danh mục đào tạo và xem thống kê toàn hệ thống.

- **Giảng viên**: quản lý các lớp học phần mình phụ trách, điểm danh, nhập điểm và khóa điểm.

- **Sinh viên**: đăng ký học phần, theo dõi lịch học, xem bảng điểm và GPA của bản thân.

Tài liệu này trình bày tổng quan kiến trúc, các công nghệ sử dụng, phân tích thiết kế nghiệp vụ, thiết kế cơ sở dữ liệu và kết quả triển khai của hệ thống EduManage. Nội dung được biên soạn để cả người đọc có nền tảng kỹ thuật lẫn người đọc thiên về nghiệp vụ đều theo dõi được: phần đầu mỗi mục là mô tả bằng ngôn ngữ nghiệp vụ, các chi tiết kỹ thuật (tên bảng, đường dẫn API) được đặt trong bảng hoặc ghi chú kèm theo.

## Mục tiêu của hệ thống

- Tập trung hóa dữ liệu đào tạo: toàn bộ thông tin sinh viên, giảng viên, môn học, điểm số được lưu thống nhất trong một cơ sở dữ liệu duy nhất, thay cho các file rời rạc.

- Tự động hóa nghiệp vụ: tự sinh mã sinh viên / mã giảng viên, tự tạo email trường và mật khẩu tạm rồi gửi qua email cá nhân, tự tính điểm tổng kết và xếp loại chữ, tự tính GPA.

- Phân quyền chặt chẽ theo vai trò: mỗi vai trò chỉ nhìn thấy và thao tác được đúng phần việc của mình.

- Bảo mật ở mức cao hơn mặt bằng chung của các đồ án cùng loại: mỗi người dùng có một cặp khóa RSA riêng để ký token, mật khẩu và mã OTP đều được băm bcrypt, token lưu trong cookie httpOnly.

- Giao diện hiện đại, hỗ trợ hai ngôn ngữ (Tiếng Việt / Tiếng Anh) và hai chế độ giao diện (sáng / tối).

## Phạm vi của hệ thống

Hệ thống EduManage bao phủ các nghiệp vụ: quản lý tài khoản (tạo đơn lẻ, nhập hàng loạt từ CSV/Excel, khóa/mở khóa, xóa), quản lý danh mục đào tạo theo phân cấp Khoa → Ngành → Lớp / Môn học, quản lý lớp học phần và học kỳ, đăng ký / hủy đăng ký học phần, điểm danh theo buổi, nhập điểm và khóa điểm, bảng điểm và GPA, thống kê tổng quan theo vai trò, xuất danh sách ra CSV/Excel.

Hệ thống không có chức năng tự đăng ký tài khoản: mọi tài khoản đều do Quản trị viên tạo, nhằm đảm bảo dữ liệu người học khớp với hồ sơ tuyển sinh thực tế của nhà trường.

## Bố cục tài liệu

- **Chương 1 — Tổng quan kiến trúc hệ thống**: mô hình client – server, các thành phần chính và luồng dữ liệu.

- **Chương 2 — Công nghệ sử dụng**: các công nghệ phía giao diện, phía máy chủ, cơ sở dữ liệu và cơ chế bảo mật.

- **Chương 3 — Phân tích và thiết kế hệ thống**: yêu cầu chức năng / phi chức năng, tác nhân, đặc tả 21 ca sử dụng, sơ đồ tuần tự và thiết kế cơ sở dữ liệu.

- **Chương 4 — Triển khai hệ thống**: các màn hình đã hoàn thiện theo từng phân hệ và môi trường vận hành.

- **Kết luận và hướng phát triển**.

# CHƯƠNG 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG

## 1.1. Mô hình Client – Server

Hệ thống EduManage được xây dựng theo mô hình Client – Server: trình duyệt của người dùng chạy ứng dụng giao diện (client), mọi thao tác nghiệp vụ được gửi về máy chủ (server) qua các API REST, và chỉ máy chủ mới được phép truy cập cơ sở dữ liệu. Cách phân tách này đảm bảo dữ liệu luôn đi qua một cổng kiểm soát duy nhất (xác thực, phân quyền, kiểm tra dữ liệu) trước khi được đọc hay ghi.

| Tiêu chí | Client (Giao diện) | Server (Máy chủ) |
| --- | --- | --- |
| Vai trò | Hiển thị giao diện, thu nhận thao tác người dùng, gọi API | Xử lý nghiệp vụ, xác thực, phân quyền, truy vấn CSDL |
| Công nghệ | ReactJS (JavaScript) | NestJS (TypeScript) + Prisma ORM |
| Giao tiếp | Gửi HTTP request kèm cookie xác thực (axios) | Cung cấp REST API với tiền tố `/api/...` |
| Cổng chạy (môi trường phát triển) | 5173 | 3000 |
| Lưu phiên đăng nhập | Cookie httpOnly (không lưu token trong mã JavaScript) | JWT RS256 ký bằng cặp khóa RSA riêng của từng người dùng |
| Cơ sở dữ liệu | Không truy cập trực tiếp | PostgreSQL, truy cập qua Prisma |

![Hình 1.1. Sơ đồ kiến trúc tổng thể hệ thống EduManage](assets/diag_01_kientruc.png)

## 1.2. Thành phần phía Client

Ứng dụng giao diện của hệ thống EduManage là một SPA viết bằng ReactJS. Các điểm chính:

- **Cổng xác thực duy nhất**: khi chưa đăng nhập, toàn bộ ứng dụng chỉ hiển thị màn hình đăng nhập (kèm luồng quên mật khẩu bằng OTP). Sau khi đăng nhập thành công, ứng dụng đọc vai trò của người dùng và mở đúng bộ giao diện tương ứng (Admin / Giảng viên / Sinh viên).

- **AuthContext**: nơi lưu trạng thái đăng nhập toàn cục. Khi tải lại trang, ứng dụng tự gọi API kiểm tra phiên để khôi phục trạng thái, người dùng không phải đăng nhập lại trong thời hạn của token.

- **Hai kênh gọi API**: một kênh không xác thực dùng cho đăng nhập / quên mật khẩu, và một kênh có xác thực (tự gắn cookie) dùng cho mọi chức năng còn lại. Kênh có xác thực được trang bị cơ chế tự làm mới token: khi token hết hạn (lỗi 401), ứng dụng tự gọi API cấp lại token rồi thực hiện lại thao tác, người dùng không nhận thấy gián đoạn.

- **Giao diện theo vai trò**: các màn hình được tổ chức thành ba phân hệ Admin / Giảng viên / Sinh viên, dùng chung một bộ thành phần giao diện (bảng dữ liệu, biểu đồ, hộp thoại, thông báo) để đảm bảo thống nhất.

- **Đa ngôn ngữ và giao diện sáng / tối**: người dùng chuyển đổi Tiếng Việt / Tiếng Anh và chế độ sáng / tối ngay trên giao diện; lựa chọn được ghi nhớ trên trình duyệt.

## 1.3. Thành phần phía Server

Máy chủ của hệ thống EduManage được xây dựng bằng NestJS theo kiến trúc phân lớp: **Controller → Service → Prisma → PostgreSQL**. Controller chỉ khai báo đường dẫn API và các lớp chắn bảo vệ; toàn bộ logic nghiệp vụ (kiểm tra dữ liệu, tính điểm, kiểm tra quyền sở hữu…) nằm trong Service.

Các module nghiệp vụ của server:

| Module | Chức năng chính |
| --- | --- |
| Xác thực (auth) | Đăng nhập, đăng xuất, làm mới token, quên / đặt lại mật khẩu bằng OTP, đổi mật khẩu |
| Người dùng (users) | Tạo và quản lý tài khoản sinh viên / giảng viên, nhập hàng loạt, cập nhật hồ sơ, khóa / mở khóa, xóa |
| Khoa (departments) | Quản lý danh mục Khoa |
| Ngành (branches) | Quản lý danh mục Ngành (thuộc Khoa) |
| Lớp (classes) | Quản lý Lớp hành chính (thuộc Ngành) |
| Môn học (subjects) | Quản lý Môn học (thuộc Ngành) |
| Lớp học phần (subject-classes) | Mở lớp học phần theo Môn học + Giảng viên + Học kỳ; danh sách lớp theo vai trò |
| Đăng ký học phần (enrollments) | Đăng ký / hủy đăng ký, nhập điểm, khóa điểm, bảng điểm, GPA |
| Điểm danh (attendance) | Điểm danh từng buổi học (đơn lẻ và cả lớp) |
| Thống kê (dashboard) | Số liệu tổng quan riêng cho từng vai trò |
| Học kỳ (semesters) | Quản lý danh sách học kỳ, đánh dấu học kỳ đang hoạt động |
| Email (email) | Gửi email thật qua SMTP: thông tin tài khoản mới và mã OTP |
| Prisma (prisma) | Kết nối cơ sở dữ liệu dùng chung cho toàn bộ ứng dụng |

## 1.4. Luồng dữ liệu tổng quát

Một thao tác của người dùng đi qua hệ thống theo trình tự sau:

1. Người dùng thao tác trên giao diện (ví dụ bấm "Đăng ký" một lớp học phần).

2. Client gọi API tương ứng, trình duyệt tự động gửi kèm cookie chứa token xác thực.

3. Tại server, request lần lượt đi qua lớp chắn xác thực (kiểm tra token, kiểm tra tài khoản còn hoạt động) rồi lớp chắn phân quyền (kiểm tra vai trò có được phép dùng chức năng này không).

4. Controller nhận request hợp lệ và chuyển cho Service xử lý nghiệp vụ; Service truy vấn / cập nhật cơ sở dữ liệu qua Prisma.

5. Kết quả trả về client theo định dạng thống nhất `{ success, message, metadata }`; giao diện cập nhật ngay và hiển thị thông báo cho người dùng.

# CHƯƠNG 2. CÔNG NGHỆ SỬ DỤNG

## 2.1. Công nghệ phía giao diện — ReactJS

**Khái niệm.** ReactJS là thư viện JavaScript mã nguồn mở do Meta phát triển, chuyên dùng để xây dựng giao diện người dùng. Điểm mạnh của React là cơ chế Virtual DOM: khi dữ liệu thay đổi, React chỉ vẽ lại đúng phần giao diện bị ảnh hưởng thay vì cả trang, giúp ứng dụng phản hồi nhanh và mượt.

**Đặc điểm nổi bật.**

- Giao diện được lắp ghép từ các thành phần (component) độc lập, tái sử dụng được, giúp mã nguồn gọn gàng, dễ bảo trì.

- Cú pháp JSX cho phép mô tả giao diện ngay trong mã JavaScript một cách trực quan.

- Hệ sinh thái lớn, dễ kết hợp với các thư viện khác (axios gọi API, thư viện xuất Excel…).

**Ứng dụng trong hệ thống EduManage.** Toàn bộ giao diện của hệ thống EduManage được xây dựng bằng React 18: các màn hình quản trị (danh sách sinh viên, giảng viên, danh mục đào tạo), màn hình của giảng viên (lớp phụ trách, điểm danh, nhập điểm), màn hình của sinh viên (đăng ký học phần, bảng điểm) và các thành phần dùng chung (bảng dữ liệu, biểu đồ thống kê, hộp thoại xác nhận, khay nhập liệu hàng loạt). Trạng thái đăng nhập được quản lý bằng Context API, giúp mọi màn hình đều biết người dùng hiện tại là ai mà không phải truyền dữ liệu qua nhiều tầng.

## 2.2. Công nghệ phía máy chủ — NestJS

**Khái niệm.** NestJS là framework xây dựng ứng dụng phía máy chủ trên nền Node.js, viết bằng TypeScript. NestJS tổ chức mã nguồn theo module với ba lớp rõ ràng (Controller – Service – tầng truy cập dữ liệu) và cung cấp sẵn các cơ chế Guard (lớp chắn), Decorator, Dependency Injection.

**Đặc điểm nổi bật.**

- Kiến trúc module hóa: mỗi nghiệp vụ (người dùng, điểm danh, đăng ký học phần…) là một module độc lập, dễ mở rộng.

- TypeScript giúp phát hiện lỗi ngay khi viết mã, tăng độ tin cậy của hệ thống.

- Guard cho phép tách hoàn toàn phần kiểm tra xác thực / phân quyền ra khỏi logic nghiệp vụ.

**Ứng dụng trong hệ thống EduManage.** Server của hệ thống EduManage gồm 12 module nghiệp vụ (mục 1.3). Hai lớp chắn được áp dụng thống nhất: `JwtAuthGuard` xác thực token trên từng request, `RolesGuard` đối chiếu vai trò của người gọi với vai trò được khai báo trên từng chức năng. Nhờ đó, ví dụ, chỉ Admin mới tạo được tài khoản; chỉ giảng viên phụ trách đúng lớp mới nhập được điểm của lớp đó.

## 2.3. Cơ sở dữ liệu — PostgreSQL và Prisma ORM

**Khái niệm.** PostgreSQL là hệ quản trị cơ sở dữ liệu quan hệ mã nguồn mở, nổi tiếng về độ ổn định và khả năng đảm bảo toàn vẹn dữ liệu bằng ràng buộc khóa chính / khóa ngoại / duy nhất. Prisma là ORM hiện đại cho Node.js: lược đồ CSDL được khai báo tập trung trong một file schema, từ đó Prisma tự sinh mã truy vấn an toàn kiểu (type-safe) và quản lý các phiên bản thay đổi lược đồ (migration).

**Ứng dụng trong hệ thống EduManage.**

- Toàn bộ 12 bảng dữ liệu (người dùng, khoa, ngành, lớp, môn học, lớp học phần, đăng ký học phần, điểm danh, học kỳ, khóa RSA, OTP, nhật ký hoạt động) được định nghĩa trong một file schema duy nhất — chi tiết tại mục 3.5.

- Các ràng buộc nghiệp vụ quan trọng được đặt ngay ở tầng CSDL: mỗi sinh viên chỉ đăng ký một lớp học phần một lần (ràng buộc duy nhất trên cặp sinh viên – lớp học phần); mỗi sinh viên chỉ có một bản ghi điểm danh cho một buổi học (ràng buộc duy nhất trên bộ lớp học phần – sinh viên – ngày).

- Nghiệp vụ nhập danh sách hàng loạt sử dụng transaction: hoặc tạo thành công toàn bộ tài khoản, hoặc không tạo tài khoản nào — không bao giờ xảy ra tình trạng nhập được một nửa.

## 2.4. Cơ chế xác thực — JWT ký bằng cặp khóa RSA riêng từng người dùng

Đây là điểm khác biệt lớn nhất của hệ thống EduManage so với cách làm phổ biến (dùng một chuỗi bí mật chung để ký token cho mọi người dùng):

1. **Khi đăng nhập**, hệ thống xóa cặp khóa cũ (nếu có), sinh mới một cặp khóa RSA-2048 riêng cho người dùng đó, lưu vào bảng `api_keys`, rồi dùng khóa bí mật để ký hai token: access token (hạn 15 phút) và refresh token (hạn 7 ngày).

2. **Trên mỗi request**, server lấy khóa công khai tương ứng của người dùng từ CSDL để xác minh token, đồng thời kiểm tra tài khoản còn hoạt động hay đã bị khóa.

3. **Khi đăng xuất, đổi mật khẩu hoặc đặt lại mật khẩu**, hệ thống xóa cặp khóa của người dùng — mọi token đã phát hành lập tức vô hiệu trên mọi thiết bị, không cần danh sách đen (blacklist).

4. **Khi access token hết hạn**, client tự gọi API làm mới: server xác minh refresh token rồi cấp access token mới, người dùng không phải đăng nhập lại trong vòng 7 ngày.

Ba cookie được thiết lập sau đăng nhập:

| Cookie | httpOnly | Mục đích |
| --- | --- | --- |
| `token` | Có | Access token JWT RS256, hạn 15 phút |
| `refreshToken` | Có | Refresh token JWT RS256, hạn 7 ngày |
| `logged` | Không | Cờ giá trị `'1'` cho phép giao diện biết trạng thái đã đăng nhập mà không cần đọc token |

Ngoài ra: mật khẩu người dùng được băm bcrypt (10 vòng) trước khi lưu; mã OTP quên mật khẩu cũng được băm bcrypt và chỉ có hiệu lực 5 phút; danh sách nguồn được phép gọi API (CORS) khai báo qua biến môi trường.

## 2.5. Gửi email tự động — Nodemailer / SMTP

Hệ thống EduManage gửi email thật (qua máy chủ SMTP) trong hai tình huống:

- **Cấp tài khoản**: khi Admin tạo tài khoản (đơn lẻ hoặc nhập hàng loạt), hệ thống gửi email trường + mật khẩu tạm về **email cá nhân** của sinh viên / giảng viên.

- **Quên mật khẩu**: hệ thống gửi mã OTP 6 chữ số về email cá nhân để người dùng xác minh trước khi đặt mật khẩu mới.

Vì vậy, email cá nhân là thông tin bắt buộc khi tạo tài khoản — nếu thiếu, hệ thống từ chối tạo và báo lỗi rõ ràng.

# CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

## 3.1. Đặc tả yêu cầu phần mềm

### 3.1.1. Yêu cầu chức năng — phân hệ Quản trị viên (Admin)

- **Quản lý tài khoản sinh viên / giảng viên**: tạo mới từng tài khoản (hệ thống tự sinh mã, email trường, mật khẩu tạm và gửi về email cá nhân); nhập hàng loạt từ file CSV/Excel; xem chi tiết và cập nhật thông tin; khóa / mở khóa; xóa tài khoản.

- **Quản lý danh mục đào tạo**: thêm, sửa, xóa Khoa; Ngành (thuộc Khoa); Lớp hành chính và Môn học (thuộc Ngành).

- **Quản lý lớp học phần**: mở lớp học phần gắn với Môn học, Giảng viên phụ trách, tên học kỳ, sĩ số tối đa và trạng thái.

- **Quản lý học kỳ**: tạo danh sách học kỳ và đánh dấu học kỳ đang hoạt động — căn cứ để hệ thống lọc dữ liệu "hiện hành" ở các màn hình đăng ký, thống kê.

- **Xuất danh sách**: xuất danh sách sinh viên, giảng viên, môn học ra file CSV hoặc Excel.

- **Thống kê toàn hệ thống**: tổng số sinh viên, giảng viên, lớp học phần, môn học, khoa; phân bố giới tính; phân bố xếp loại điểm; số đăng ký mới 7 ngày gần nhất.

- **Khóa / mở khóa điểm**: Admin có quyền can thiệp khóa hoặc mở khóa điểm của các lớp học phần.

### 3.1.2. Yêu cầu chức năng — phân hệ Giảng viên

- **Xem lớp phụ trách**: danh sách các lớp học phần được phân công trong học kỳ hiện hành, kèm danh sách sinh viên đã đăng ký từng lớp.

- **Điểm danh**: điểm danh cả lớp theo từng buổi học với bốn trạng thái (có mặt / vắng / muộn / có phép) kèm ghi chú; điểm danh lại trong cùng ngày sẽ cập nhật chứ không tạo bản ghi trùng.

- **Nhập điểm**: nhập điểm chuyên cần, giữa kỳ, cuối kỳ cho từng sinh viên; hệ thống tự tính điểm tổng kết và xếp loại chữ; khóa điểm sau khi hoàn tất để chống chỉnh sửa.

- **Xem lịch dạy** và **thống kê riêng**: số lớp phụ trách, tổng sinh viên, tỷ lệ điểm danh, số bài chưa chấm, xu hướng điểm danh các buổi gần nhất.

### 3.1.3. Yêu cầu chức năng — phân hệ Sinh viên

- **Đăng ký học phần**: xem các lớp học phần đang mở trong học kỳ hoạt động và đăng ký; hệ thống kiểm tra sĩ số và chặn đăng ký trùng.

- **Hủy đăng ký**: hủy các môn đã đăng ký khi điểm chưa bị khóa.

- **Xem lịch học**: danh sách môn đã đăng ký, nhóm theo học kỳ.

- **Xem bảng điểm và GPA**: bảng điểm toàn khóa với điểm thành phần, điểm tổng kết, xếp loại chữ; GPA tích lũy và biểu đồ xu hướng GPA theo học kỳ.

- **Thống kê cá nhân**: tín chỉ đang học, GPA hiện tại, tỷ lệ điểm danh.

### 3.1.4. Yêu cầu chức năng — dùng chung cho mọi vai trò

- Đăng nhập theo vai trò (ba tab Admin / Giảng viên / Sinh viên, kiểm tra định dạng mã tài khoản theo vai trò ngay tại giao diện), đăng xuất.

- Quên mật khẩu bằng mã OTP gửi về email cá nhân; đổi mật khẩu khi đã đăng nhập.

- Cập nhật hồ sơ cá nhân (họ tên, số điện thoại, địa chỉ, ngày sinh…). Ba trường nhạy cảm — mật khẩu, email trường, vai trò — không thể thay đổi qua chức năng này.

- Xem thống kê tổng quan (Dashboard) ngay khi đăng nhập, nội dung tùy theo vai trò.

### 3.1.5. Yêu cầu phi chức năng

1. **Hiệu năng**: các thao tác thông thường (xem danh sách, tìm kiếm, cập nhật) phản hồi nhanh; thống kê Dashboard được truy vấn song song để giảm thời gian chờ.

2. **Bảo mật**: mật khẩu và OTP băm bcrypt; token ký RS256 bằng cặp khóa RSA riêng từng người dùng; token lưu trong cookie httpOnly; phân quyền RBAC ba vai trò; ORM chống SQL Injection; thu hồi phiên tức thời khi khóa tài khoản / đổi mật khẩu.

3. **Tính khả dụng**: phiên đăng nhập tự làm mới token nên không bị gián đoạn giữa chừng; lỗi được thông báo rõ ràng bằng tiếng Việt trên giao diện.

4. **Khả năng mở rộng**: server chia module theo nghiệp vụ, client chia màn hình theo phân hệ; thêm nghiệp vụ mới không ảnh hưởng phần hiện có.

5. **Khả năng sử dụng**: giao diện đơn giản, nhất quán; hỗ trợ hai ngôn ngữ Việt / Anh; chế độ sáng / tối; có trạng thái trống thân thiện khi chưa có dữ liệu.

6. **Tính tương thích**: chạy trên các trình duyệt phổ biến (Chrome, Edge, Firefox); giao diện đáp ứng (responsive) trên máy tính và thiết bị di động.

7. **Khả năng bảo trì**: mã nguồn tách bạch ba lớp Controller – Service – dữ liệu; hằng số bảo mật tập trung một file duy nhất; quy tắc mật khẩu định nghĩa một nơi và dùng chung cho mọi form.

## 3.2. Danh sách tác nhân

| STT | Tác nhân | Mô tả |
| --- | --- | --- |
| 1 | Khách (chưa đăng nhập) | Người truy cập ứng dụng nhưng chưa xác thực. Chỉ có thể đăng nhập hoặc thực hiện quên / đặt lại mật khẩu. Hệ thống không có chức năng tự đăng ký tài khoản. |
| 2 | Quản trị viên (Admin) | Toàn quyền quản trị: tài khoản (tạo, sửa, khóa / mở khóa, xóa), danh mục (Khoa, Ngành, Lớp, Môn học, Lớp học phần, Học kỳ), xuất danh sách, thống kê toàn hệ thống, khóa / mở khóa điểm. |
| 3 | Giảng viên | Xem các lớp học phần mình phụ trách và danh sách sinh viên; điểm danh; nhập / sửa điểm khi chưa khóa; khóa / mở khóa điểm; xem lịch dạy và thống kê lớp mình dạy. |
| 4 | Sinh viên | Đăng ký / hủy đăng ký học phần; xem môn đã đăng ký và lịch học; xem bảng điểm và GPA; xem thống kê cá nhân. |

Cả ba vai trò đã đăng nhập đều dùng chung các chức năng: đăng xuất, đổi mật khẩu, cập nhật hồ sơ cá nhân.

## 3.3. Biểu đồ Use Case

Danh mục 21 ca sử dụng của hệ thống:

| Mã | Tên Use Case | Tác nhân | Nhóm |
| --- | --- | --- | --- |
| UC#01 | Đăng nhập (theo vai trò) | Khách | Xác thực |
| UC#02 | Quên mật khẩu (OTP qua email) | Khách | Xác thực |
| UC#03 | Đổi mật khẩu | Mọi vai trò | Xác thực |
| UC#04 | Đăng xuất | Mọi vai trò | Xác thực |
| UC#05 | Cập nhật hồ sơ cá nhân | Mọi vai trò | Tài khoản |
| UC#06 | Tạo tài khoản Sinh viên / Giảng viên | Admin | Tài khoản |
| UC#07 | Nhập danh sách hàng loạt (Bulk Import) | Admin | Tài khoản |
| UC#08 | Xem chi tiết và cập nhật thông tin người dùng | Admin | Tài khoản |
| UC#09 | Khóa / mở khóa tài khoản | Admin | Tài khoản |
| UC#10 | Xóa tài khoản | Admin | Tài khoản |
| UC#11 | Quản lý danh mục (Khoa / Ngành / Lớp / Môn học) | Admin | Danh mục |
| UC#12 | Quản lý Lớp học phần và Học kỳ | Admin | Danh mục |
| UC#13 | Xuất danh sách (CSV / Excel) | Admin | Danh mục |
| UC#14 | Xem lớp phụ trách và danh sách sinh viên | Giảng viên | Học vụ |
| UC#15 | Điểm danh sinh viên | Giảng viên | Học vụ |
| UC#16 | Nhập điểm và Khóa điểm | Giảng viên (Admin được khóa / mở khóa) | Học vụ |
| UC#17 | Đăng ký học phần | Sinh viên | Học vụ |
| UC#18 | Hủy đăng ký học phần | Sinh viên | Học vụ |
| UC#19 | Xem môn đã đăng ký và lịch học / lịch dạy | Sinh viên, Giảng viên | Học vụ |
| UC#20 | Xem bảng điểm và GPA | Sinh viên | Học vụ |
| UC#21 | Xem thống kê Dashboard | Mọi vai trò | Thống kê |

### 3.3.1. Biểu đồ Use Case tổng quát

![Hình 3.1. Biểu đồ Use Case tổng quát của hệ thống EduManage](assets/uml_usecase_overview.png)

### 3.3.2. Biểu đồ phân rã Use Case — Xác thực và tài khoản cá nhân

![Hình 3.2. Biểu đồ phân rã Use Case nhóm Xác thực và tài khoản cá nhân](assets/uml_usecase_auth.png)

### 3.3.3. Biểu đồ phân rã Use Case — Quản lý tài khoản

![Hình 3.3. Biểu đồ phân rã Use Case nhóm Quản lý tài khoản (Admin)](assets/uml_usecase_account.png)

### 3.3.4. Biểu đồ phân rã Use Case — Quản lý danh mục đào tạo

![Hình 3.4. Biểu đồ phân rã Use Case nhóm Quản lý danh mục đào tạo (Admin)](assets/uml_usecase_catalog.png)

### 3.3.5. Biểu đồ phân rã Use Case — Nghiệp vụ Giảng viên

![Hình 3.5. Biểu đồ phân rã Use Case nhóm nghiệp vụ Giảng viên](assets/uml_usecase_teacher.png)

### 3.3.6. Biểu đồ phân rã Use Case — Nghiệp vụ Sinh viên

![Hình 3.6. Biểu đồ phân rã Use Case nhóm nghiệp vụ Sinh viên](assets/uml_usecase_student.png)

## 3.4. Đặc tả chi tiết các Use Case

### UC#01: Đăng nhập (theo vai trò)

| UC#01 | Đăng nhập (theo vai trò) | Độ phức tạp: Cao |
| --- | --- | --- |
| Mô tả | Người dùng chọn tab vai trò (Admin / Giảng viên / Sinh viên) và đăng nhập bằng mã định danh + mật khẩu. | |
| Tác nhân | Khách | |
| Tiền điều kiện | Tài khoản đã được Admin tạo trước đó. | |
| Hậu điều kiện — Thành công | Ba cookie được thiết lập; người dùng vào giao diện đúng theo vai trò. | |
| Hậu điều kiện — Lỗi | Không đăng nhập được; không cookie nào được thiết lập. | |

**ĐẶC TẢ CHỨC NĂNG**

**Luồng nghiệp vụ tiêu chuẩn**

1. Người dùng chọn tab vai trò trên màn hình đăng nhập, nhập mã định danh và mật khẩu. Giao diện kiểm tra định dạng mã theo vai trò đang chọn: Admin phải là `admin`, Giảng viên dạng `GV` kèm số (ví dụ GV1001), Sinh viên là dãy số (ví dụ 20216001) — sai định dạng thì thực hiện Luồng A.

2. Hệ thống tìm tài khoản theo mã định danh và so khớp mật khẩu (bcrypt). Tài khoản bị khóa → Luồng B; sai thông tin → Luồng C.

3. Hợp lệ: hệ thống xóa cặp khóa RSA cũ, sinh cặp khóa RSA-2048 mới, ký access token (15 phút) + refresh token (7 ngày), thiết lập 3 cookie và trả thông tin người dùng.

4. Giao diện lưu người dùng vào phiên làm việc và mở phân hệ tương ứng với vai trò.

**Luồng sự kiện phát sinh / Kịch bản phát sinh**

- Luồng A — Mã không khớp định dạng vai trò: hiển thị lỗi ngay tại ô nhập, không gửi yêu cầu lên server.

- Luồng B — Tài khoản bị khóa: hiển thị hộp thoại "Tài khoản đã bị khóa".

- Luồng C — Sai định danh / mật khẩu: hiển thị "Tài khoản hoặc mật khẩu không chính xác".

### UC#02: Quên mật khẩu (OTP qua email)

| UC#02 | Quên mật khẩu (OTP qua email) | Độ phức tạp: Cao |
| --- | --- | --- |
| Mô tả | Đặt lại mật khẩu khi quên, thông qua mã OTP 6 chữ số gửi tới email cá nhân. | |
| Tác nhân | Khách | |
| Tiền điều kiện | Tài khoản đã có email cá nhân được thiết lập. | |
| Hậu điều kiện — Thành công | Mật khẩu mới được lưu (băm bcrypt); mọi phiên đăng nhập cũ bị vô hiệu. | |
| Hậu điều kiện — Lỗi | Mật khẩu không thay đổi. | |

**ĐẶC TẢ CHỨC NĂNG**

**Luồng nghiệp vụ tiêu chuẩn**

1. Người dùng nhập mã định danh, chọn "Quên mật khẩu". Nếu tài khoản chưa có email cá nhân → Luồng A.

2. Hệ thống sinh mã OTP 6 chữ số, băm bcrypt rồi lưu (hiệu lực 5 phút, xóa OTP cũ nếu có) và gửi mã về email cá nhân.

3. Người dùng nhập OTP; hệ thống xác minh trước khi cho nhập mật khẩu mới. Sai hoặc hết hạn → Luồng B.

4. Người dùng nhập mật khẩu mới thỏa bộ quy tắc mật khẩu (tối thiểu 8 ký tự, có chữ hoa, chữ số, ký tự đặc biệt) — chưa thỏa → Luồng C.

5. Hệ thống xác thực lại OTP, cập nhật mật khẩu, xóa OTP và toàn bộ khóa phiên → người dùng đăng nhập lại bằng mật khẩu mới.

**Luồng sự kiện phát sinh / Kịch bản phát sinh**

- Luồng A — Chưa có email cá nhân: báo lỗi, người dùng cần liên hệ Admin.

- Luồng B — OTP sai / hết hạn: hiển thị lỗi, cho phép gửi lại mã.

- Luồng C — Mật khẩu mới chưa đạt: hiển thị danh sách điều kiện chưa thỏa để người dùng sửa.

- Luồng D — Gửi email thất bại: báo lỗi hệ thống, luồng dừng lại (không tạo OTP "ảo").

### UC#03: Đổi mật khẩu

| UC#03 | Đổi mật khẩu | Độ phức tạp: Trung bình |
| --- | --- | --- |
| Mô tả | Người dùng đã đăng nhập tự đổi mật khẩu của mình. | |
| Tác nhân | Admin, Giảng viên, Sinh viên | |
| Tiền điều kiện | Đã đăng nhập. | |
| Hậu điều kiện — Thành công | Mật khẩu được cập nhật; mọi thiết bị đang đăng nhập đều bị đăng xuất. | |

**ĐẶC TẢ CHỨC NĂNG**

**Luồng nghiệp vụ tiêu chuẩn**

1. Tại trang Hồ sơ cá nhân, người dùng nhập mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu.

2. Hệ thống đối chiếu mật khẩu hiện tại và kiểm tra mật khẩu mới theo bộ quy tắc. Sai mật khẩu hiện tại → Luồng A; mật khẩu mới chưa đạt → Luồng B.

3. Hệ thống lưu mật khẩu mới (băm bcrypt) và xóa toàn bộ khóa phiên; giao diện thông báo "Đổi mật khẩu thành công! Hệ thống sẽ tự động đăng xuất..." rồi đưa về màn hình đăng nhập.

**Luồng sự kiện phát sinh / Kịch bản phát sinh**

- Luồng A — Mật khẩu hiện tại sai: hiển thị lỗi.

- Luồng B — Mật khẩu mới chưa đạt yêu cầu: hiển thị danh sách điều kiện chưa thỏa.

### UC#04: Đăng xuất

| UC#04 | Đăng xuất | Độ phức tạp: Thấp |
| --- | --- | --- |
| Mô tả | Kết thúc phiên làm việc hiện tại. | |
| Tác nhân | Admin, Giảng viên, Sinh viên | |
| Hậu điều kiện — Thành công | Khóa phiên bị xóa khỏi CSDL; ba cookie bị xóa; quay về màn hình đăng nhập. | |

**ĐẶC TẢ CHỨC NĂNG**

**Luồng nghiệp vụ tiêu chuẩn**

1. Người dùng chọn "Đăng xuất"; giao diện lập tức quay về màn hình đăng nhập, đồng thời gọi API đăng xuất.

2. Server xóa toàn bộ khóa phiên của người dùng và xóa ba cookie. Nếu API gặp lỗi (token đã bị thu hồi từ trước), giao diện vẫn giữ trạng thái đã đăng xuất — không chặn người dùng.

### UC#05: Cập nhật hồ sơ cá nhân

| UC#05 | Cập nhật hồ sơ cá nhân | Độ phức tạp: Trung bình |
| --- | --- | --- |
| Mô tả | Người dùng tự cập nhật thông tin cá nhân (họ tên, số điện thoại, địa chỉ, ngày sinh…). | |
| Tác nhân | Admin, Giảng viên, Sinh viên | |
| Tiền điều kiện | Đã đăng nhập. | |
| Hậu điều kiện — Thành công | Hồ sơ được cập nhật; các trường nhạy cảm không bị thay đổi. | |

**ĐẶC TẢ CHỨC NĂNG**

**Luồng nghiệp vụ tiêu chuẩn**

1. Người dùng vào trang Hồ sơ cá nhân, chỉnh sửa các trường được phép và lưu.

2. Hệ thống kiểm tra người gọi chỉ được sửa chính hồ sơ của mình (riêng Admin được sửa hồ sơ của bất kỳ ai — xem UC#08).

3. Hệ thống tự loại bỏ ba trường mật khẩu / email trường / vai trò khỏi dữ liệu gửi lên — các trường này không thể thay đổi qua chức năng cập nhật hồ sơ.

**Luồng sự kiện phát sinh / Kịch bản phát sinh**

- Luồng A — Cố sửa hồ sơ người khác khi không phải Admin: hệ thống từ chối (403).

### UC#06: Tạo tài khoản Sinh viên / Giảng viên

| UC#06 | Tạo tài khoản Sinh viên / Giảng viên | Độ phức tạp: Cao |
| --- | --- | --- |
| Mô tả | Admin tạo tài khoản mới; hệ thống tự sinh mã định danh, email trường, mật khẩu tạm và gửi qua email cá nhân. | |
| Tác nhân | Admin | |
| Hậu điều kiện — Thành công | Tài khoản mới ở trạng thái mặc định (đang học / đang giảng dạy); email thông tin đăng nhập được gửi tới email cá nhân. | |

**ĐẶC TẢ CHỨC NĂNG**

**Luồng nghiệp vụ tiêu chuẩn**

1. Admin mở màn hình "Sinh viên" hoặc "Giảng viên", chọn "Thêm mới" và nhập thông tin — email cá nhân là bắt buộc (thiếu → Luồng A).

2. Hệ thống tự sinh mã kế tiếp theo năm (sinh viên dạng `SV{năm}{4 số}`, giảng viên dạng `GV{năm}{3 số}`), có kiểm tra chống trùng khi hai Admin tạo đồng thời (trùng → Luồng B).

3. Hệ thống sinh email trường từ mã (ví dụ `{mã}@student.school.edu.vn`), tạo mật khẩu tạm 10 ký tự ngẫu nhiên (băm bcrypt) và lưu tài khoản.

4. Hệ thống gửi email trường + mật khẩu tạm về email cá nhân (gửi thất bại → Luồng C).

**Luồng sự kiện phát sinh / Kịch bản phát sinh**

- Luồng A — Thiếu email cá nhân: từ chối tạo, báo lỗi.

- Luồng B — Trùng mã do tạo đồng thời: báo lỗi, Admin thao tác lại.

- Luồng C — Gửi email thất bại: tài khoản vẫn được tạo, hệ thống ghi log cảnh báo để xử lý sau.

### UC#07: Nhập danh sách hàng loạt (Bulk Import)

| UC#07 | Nhập danh sách hàng loạt (Bulk Import) | Độ phức tạp: Cao |
| --- | --- | --- |
| Mô tả | Admin nhập nhiều sinh viên / giảng viên cùng lúc từ file CSV hoặc Excel. | |
| Tác nhân | Admin | |
| Hậu điều kiện — Thành công | Toàn bộ tài khoản hợp lệ được tạo trong một transaction (tất cả hoặc không gì cả); email được gửi lần lượt sau đó. | |

**ĐẶC TẢ CHỨC NĂNG**

**Luồng nghiệp vụ tiêu chuẩn**

1. Admin tải lên file `.csv` / `.xlsx` / `.xls` hoặc dán trực tiếp nội dung; có thể tải file mẫu Excel có sẵn.

2. Giao diện đọc và kiểm tra sơ bộ từng dòng, hiển thị bản xem trước phân biệt dòng hợp lệ / dòng lỗi.

3. Admin xác nhận; server kiểm tra lại toàn bộ dữ liệu — chỉ cần một dòng lỗi là từ chối cả danh sách (Luồng A).

4. Hợp lệ: hệ thống sinh dãy mã tuần tự, tạo toàn bộ tài khoản trong một transaction, sau đó gửi email thông tin đăng nhập cho từng người (không chặn kết quả trả về).

**Luồng sự kiện phát sinh / Kịch bản phát sinh**

- Luồng A — Có dòng không hợp lệ: trả danh sách lỗi theo từng dòng, không tạo tài khoản nào.

- Luồng B — Một số email gửi thất bại sau khi tạo: tài khoản vẫn tồn tại; hiện chưa có cơ chế báo lại cho Admin (hạn chế đã ghi nhận).

### UC#08: Xem chi tiết và cập nhật thông tin người dùng

| UC#08 | Xem chi tiết và cập nhật thông tin người dùng | Độ phức tạp: Trung bình |
| --- | --- | --- |
| Mô tả | Admin xem trang hồ sơ chi tiết của một người dùng và chỉnh sửa thông tin của bất kỳ ai. | |
| Tác nhân | Admin | |
| Hậu điều kiện — Thành công | Thông tin được cập nhật (trừ mật khẩu / email trường / vai trò). | |

**ĐẶC TẢ CHỨC NĂNG**

**Luồng nghiệp vụ tiêu chuẩn**

1. Từ danh sách, Admin bấm vào một người dùng → hệ thống mở trang hồ sơ chi tiết (thông tin cá nhân, trạng thái, thống kê học tập).

2. Admin bấm "Sửa", cập nhật thông tin trong biểu mẫu và lưu.

3. Server cho phép Admin cập nhật bất kỳ người dùng nào nhưng vẫn tự loại bỏ ba trường nhạy cảm như UC#05.

### UC#09: Khóa / mở khóa tài khoản

| UC#09 | Khóa / mở khóa tài khoản | Độ phức tạp: Trung bình |
| --- | --- | --- |
| Mô tả | Admin tạm ngưng (khóa) hoặc kích hoạt lại một tài khoản mà không xóa dữ liệu. | |
| Tác nhân | Admin | |
| Hậu điều kiện — Thành công | Trạng thái tài khoản chuyển hoạt động ⇄ bị khóa; tài khoản bị khóa không thể đăng nhập, phiên đang mở bị chặn ngay ở thao tác kế tiếp. | |

**ĐẶC TẢ CHỨC NĂNG**

**Luồng nghiệp vụ tiêu chuẩn**

1. Admin bấm nút khóa / mở khóa trên dòng người dùng; hệ thống cập nhật trạng thái.

2. Hệ quả với người bị khóa: đăng nhập mới bị từ chối ngay; với phiên đang mở, vì mỗi request đều kiểm tra trạng thái tài khoản, thao tác kế tiếp sẽ bị chặn — giao diện hiển thị hộp thoại "Tài khoản đã bị khóa" và đưa về màn hình đăng nhập.

### UC#10: Xóa tài khoản

| UC#10 | Xóa tài khoản | Độ phức tạp: Thấp |
| --- | --- | --- |
| Mô tả | Admin xóa vĩnh viễn một tài khoản khỏi hệ thống. | |
| Tác nhân | Admin | |
| Hậu điều kiện — Thành công | Bản ghi người dùng bị xóa; khóa phiên và OTP của người đó tự xóa theo (cascade). | |

**ĐẶC TẢ CHỨC NĂNG**

**Luồng nghiệp vụ tiêu chuẩn**

1. Admin chọn "Xóa" trên dòng người dùng và xác nhận qua hộp thoại.

2. Hệ thống xóa bản ghi. Nếu người dùng còn dữ liệu ràng buộc (đang chủ nhiệm lớp, phụ trách lớp học phần, có bản ghi đăng ký / điểm danh) → Luồng A.

**Luồng sự kiện phát sinh / Kịch bản phát sinh**

- Luồng A — Còn ràng buộc dữ liệu: CSDL từ chối xóa để bảo toàn dữ liệu; hệ thống báo cần xử lý dữ liệu liên quan trước.

### UC#11: Quản lý danh mục (Khoa / Ngành / Lớp / Môn học)

| UC#11 | Quản lý danh mục (Khoa / Ngành / Lớp / Môn học) | Độ phức tạp: Trung bình |
| --- | --- | --- |
| Mô tả | Thêm, sửa, xóa danh mục nền tảng theo phân cấp Khoa → Ngành → Lớp / Môn học. | |
| Tác nhân | Admin | |
| Hậu điều kiện — Thành công | Danh mục được cập nhật; các màn hình khác dùng dữ liệu mới ngay. | |

**ĐẶC TẢ CHỨC NĂNG**

**Luồng nghiệp vụ tiêu chuẩn**

1. Admin vào màn hình danh mục tương ứng, xem danh sách hiện có.

2. Thêm / sửa: nhập mã + tên; với Ngành phải chọn Khoa cha; với Lớp hành chính và Môn học phải chọn Ngành cha.

3. Xóa: nếu còn dữ liệu con tham chiếu → Luồng A; trùng mã → Luồng B.

**Luồng sự kiện phát sinh / Kịch bản phát sinh**

- Luồng A — Xóa khi còn ràng buộc (Khoa còn Ngành; Ngành còn Lớp / Môn học): CSDL từ chối, hệ thống báo lỗi rõ ràng.

- Luồng B — Trùng mã: vi phạm ràng buộc duy nhất, hệ thống báo "Mã đã tồn tại".

### UC#12: Quản lý Lớp học phần và Học kỳ

| UC#12 | Quản lý Lớp học phần và Học kỳ | Độ phức tạp: Cao |
| --- | --- | --- |
| Mô tả | Admin mở lớp học phần (gắn Môn học + Giảng viên + tên học kỳ) và quản lý danh sách Học kỳ, đánh dấu học kỳ đang hoạt động. | |
| Tác nhân | Admin | |
| Hậu điều kiện — Thành công | Lớp học phần sẵn sàng cho sinh viên đăng ký khi ở trạng thái hoạt động và thuộc học kỳ đang hoạt động. | |

**ĐẶC TẢ CHỨC NĂNG**

**Luồng nghiệp vụ tiêu chuẩn**

1. Màn hình "Học kỳ": Admin tạo học kỳ mới, bật / tắt trạng thái hoạt động, sửa hoặc xóa.

2. Màn hình "Lớp học phần": Admin tạo lớp mới — chọn Môn học, Giảng viên phụ trách, nhập tên học kỳ, sĩ số tối đa và trạng thái.

3. Các chức năng khác (đăng ký học phần, thống kê) tự lọc theo các lớp học phần có tên học kỳ khớp với học kỳ đang hoạt động.

**Luồng sự kiện phát sinh / Kịch bản phát sinh**

- Luồng A — Tên học kỳ trên lớp học phần gõ sai / khác chính tả so với danh sách Học kỳ: lớp đó không xuất hiện trong bộ lọc "học kỳ hiện hành" (hai bảng liên kết bằng so khớp tên — xem mục 3.5.4).

### UC#13: Xuất danh sách (CSV / Excel)

| UC#13 | Xuất danh sách (CSV / Excel) | Độ phức tạp: Thấp |
| --- | --- | --- |
| Mô tả | Admin xuất danh sách hiện có ra file để dùng ngoài hệ thống (báo cáo, in ấn). | |
| Tác nhân | Admin | |
| Hậu điều kiện — Thành công | File được tải xuống trình duyệt. | |

**ĐẶC TẢ CHỨC NĂNG**

**Luồng nghiệp vụ tiêu chuẩn**

1. Trên màn hình danh sách (Sinh viên / Giảng viên / Môn học), Admin bấm nút "Xuất".

2. Giao diện tự tạo file từ dữ liệu đang hiển thị: CSV (mã hóa UTF-8, mở tốt bằng Excel tiếng Việt) hoặc file Excel có định dạng cột.

3. Trình duyệt tải file xuống — thao tác hoàn toàn phía client, không cần gọi thêm API.

### UC#14: Xem lớp phụ trách và danh sách sinh viên

| UC#14 | Xem lớp phụ trách và danh sách sinh viên | Độ phức tạp: Trung bình |
| --- | --- | --- |
| Mô tả | Giảng viên xem các lớp học phần mình được phân công và danh sách sinh viên đã đăng ký từng lớp. | |
| Tác nhân | Giảng viên | |
| Tiền điều kiện | Đã được Admin phân công ít nhất một lớp học phần. | |

**ĐẶC TẢ CHỨC NĂNG**

**Luồng nghiệp vụ tiêu chuẩn**

1. Giảng viên vào "Lớp của tôi": hệ thống chỉ trả về các lớp học phần do chính giảng viên đó phụ trách, trong học kỳ hiện hành.

2. Chọn một lớp để xem danh sách sinh viên đã đăng ký kèm thông tin cơ bản.

3. Từ đây giảng viên chuyển tiếp sang Điểm danh (UC#15) hoặc Nhập điểm (UC#16) cho lớp đó.

### UC#15: Điểm danh sinh viên

| UC#15 | Điểm danh sinh viên | Độ phức tạp: Cao |
| --- | --- | --- |
| Mô tả | Giảng viên điểm danh cả lớp theo từng buổi học; điểm danh lại trong cùng ngày sẽ cập nhật, không tạo bản ghi trùng. | |
| Tác nhân | Giảng viên | |
| Tiền điều kiện | Lớp học phần thuộc quyền phụ trách của giảng viên. | |
| Hậu điều kiện — Thành công | Mỗi sinh viên có đúng một bản ghi điểm danh cho ngày đó. | |

**ĐẶC TẢ CHỨC NĂNG**

**Luồng nghiệp vụ tiêu chuẩn**

1. Giảng viên chọn lớp và ngày điểm danh, đánh dấu trạng thái từng sinh viên (có mặt / vắng / muộn / có phép) kèm ghi chú nếu cần.

2. Hệ thống kiểm tra người gửi có đúng là giảng viên phụ trách lớp không (sai → Luồng A).

3. Hệ thống ghi nhận từng sinh viên theo khóa duy nhất (lớp học phần, sinh viên, ngày): đã có bản ghi thì cập nhật, chưa có thì tạo mới; trả về số dòng thành công / thất bại — một dòng lỗi không làm hỏng cả buổi điểm danh.

**Luồng sự kiện phát sinh / Kịch bản phát sinh**

- Luồng A — Không phải giảng viên phụ trách: hệ thống từ chối toàn bộ (403).

- Ghi chú thiết kế: hệ thống hiện chưa kiểm tra sinh viên có đăng ký lớp học phần đó hay không trước khi ghi nhận điểm danh (hạn chế đã ghi nhận, xem Kết luận).

### UC#16: Nhập điểm và Khóa điểm

| UC#16 | Nhập điểm và Khóa điểm | Độ phức tạp: Cao |
| --- | --- | --- |
| Mô tả | Giảng viên nhập điểm chuyên cần / giữa kỳ / cuối kỳ; hệ thống tự tính điểm tổng kết và xếp loại; sau đó khóa điểm để chống chỉnh sửa. | |
| Tác nhân | Giảng viên (nhập điểm); Giảng viên hoặc Admin (khóa / mở khóa) | |
| Hậu điều kiện — Thành công | Điểm tổng kết và xếp loại chữ được tính tự động; môn học chuyển trạng thái hoàn thành; điểm có thể bị khóa. | |

**ĐẶC TẢ CHỨC NĂNG**

**Luồng nghiệp vụ tiêu chuẩn**

1. Giảng viên chọn lớp phụ trách, hệ thống hiển thị danh sách sinh viên kèm điểm hiện có.

2. Nhập điểm từng sinh viên; hệ thống kiểm tra đúng giảng viên phụ trách (sai → Luồng A) và điểm chưa bị khóa (đã khóa → Luồng B).

3. Hệ thống gộp điểm mới với điểm cũ và tự tính: điểm tổng kết = chuyên cần × 10% + giữa kỳ × 30% + cuối kỳ × 60% (làm tròn 1 chữ số thập phân); xếp loại chữ theo ngưỡng A ≥ 8.5, B ≥ 7.0, C ≥ 5.5, D ≥ 4.0, còn lại F; trạng thái đăng ký chuyển thành "hoàn thành".

4. Sau khi nhập xong toàn bộ, giảng viên bấm "Khóa điểm" — điểm đã khóa không thể sửa và sinh viên không thể hủy đăng ký môn đó.

**Luồng sự kiện phát sinh / Kịch bản phát sinh**

- Luồng A — Không phụ trách lớp: từ chối nhập điểm (403).

- Luồng B — Điểm đã khóa: từ chối cập nhật.

- Ghi chú thiết kế: thao tác khóa / mở khóa hiện không kiểm tra quyền sở hữu lớp — mọi giảng viên hoặc Admin đều khóa / mở khóa được (hạn chế đã ghi nhận, xem Kết luận).

### UC#17: Đăng ký học phần

| UC#17 | Đăng ký học phần | Độ phức tạp: Cao |
| --- | --- | --- |
| Mô tả | Sinh viên xem danh sách lớp học phần đang mở (thuộc học kỳ hoạt động) và đăng ký. | |
| Tác nhân | Sinh viên | |
| Hậu điều kiện — Thành công | Bản ghi đăng ký mới ở trạng thái "đã đăng ký". | |

**ĐẶC TẢ CHỨC NĂNG**

**Luồng nghiệp vụ tiêu chuẩn**

1. Sinh viên vào "Đăng ký học phần": hệ thống chỉ hiển thị các lớp đang mở thuộc học kỳ hoạt động.

2. Sinh viên bấm "Đăng ký" một lớp.

3. Hệ thống kiểm tra lần lượt: lớp tồn tại và đang mở (không → Luồng A); số người đã đăng ký còn dưới sĩ số tối đa (đầy → Luồng B); sinh viên chưa đăng ký lớp này trước đó (trùng → Luồng C — được chặn thêm bằng ràng buộc duy nhất ở CSDL).

4. Hợp lệ: tạo bản ghi đăng ký và thông báo "Đăng ký thành công".

**Luồng sự kiện phát sinh / Kịch bản phát sinh**

- Luồng A — Lớp không mở: từ chối đăng ký.

- Luồng B — Lớp đầy: báo "Lớp học phần đã đầy".

- Luồng C — Đã đăng ký: báo lỗi trùng.

### UC#18: Hủy đăng ký học phần

| UC#18 | Hủy đăng ký học phần | Độ phức tạp: Trung bình |
| --- | --- | --- |
| Mô tả | Sinh viên hủy một môn đã đăng ký khi điểm chưa bị khóa. | |
| Tác nhân | Sinh viên | |
| Hậu điều kiện — Thành công | Bản ghi đăng ký bị xóa. | |

**ĐẶC TẢ CHỨC NĂNG**

**Luồng nghiệp vụ tiêu chuẩn**

1. Sinh viên chọn "Hủy đăng ký" trên môn đã đăng ký.

2. Hệ thống kiểm tra đúng chủ sở hữu bản ghi (sai → Luồng A) và điểm chưa bị khóa (đã khóa → Luồng B), sau đó xóa bản ghi và cập nhật lại danh sách.

**Luồng sự kiện phát sinh / Kịch bản phát sinh**

- Luồng A — Không phải chủ sở hữu: từ chối (403).

- Luồng B — Điểm đã khóa: từ chối hủy.

### UC#19: Xem môn đã đăng ký và lịch học / lịch dạy

| UC#19 | Xem môn đã đăng ký và lịch học / lịch dạy | Độ phức tạp: Thấp |
| --- | --- | --- |
| Mô tả | Xem danh sách môn học nhóm theo học kỳ: sinh viên xem môn đã đăng ký (lịch học); giảng viên xem lớp được phân công (lịch dạy). | |
| Tác nhân | Sinh viên, Giảng viên | |

**ĐẶC TẢ CHỨC NĂNG**

**Luồng nghiệp vụ tiêu chuẩn**

1. Người dùng vào màn hình "Lịch học" (sinh viên) hoặc "Lịch dạy" (giảng viên) — hai màn hình dùng chung một giao diện.

2. Sinh viên nhận danh sách các môn đang đăng ký trong học kỳ hiện hành; giảng viên nhận danh sách lớp được phân công.

3. Dữ liệu được nhóm theo học kỳ; chưa có dữ liệu thì hiển thị trạng thái trống thân thiện.

### UC#20: Xem bảng điểm và GPA

| UC#20 | Xem bảng điểm và GPA | Độ phức tạp: Trung bình |
| --- | --- | --- |
| Mô tả | Sinh viên xem bảng điểm tích lũy toàn khóa, GPA và xu hướng GPA theo học kỳ. | |
| Tác nhân | Sinh viên | |
| Tiền điều kiện | Có ít nhất một môn đã hoàn thành (đã có điểm). | |

**ĐẶC TẢ CHỨC NĂNG**

**Luồng nghiệp vụ tiêu chuẩn**

1. Sinh viên vào "Bảng điểm": hệ thống liệt kê toàn bộ môn đã hoàn thành kèm điểm thành phần, điểm tổng kết, xếp loại chữ.

2. GPA tích lũy = tổng (điểm tổng kết × số tín chỉ) / tổng số tín chỉ, làm tròn 2 chữ số thập phân; kèm tổng số tín chỉ đã hoàn thành.

3. Biểu đồ xu hướng hiển thị GPA riêng của từng học kỳ.

### UC#21: Xem thống kê Dashboard

| UC#21 | Xem thống kê Dashboard | Độ phức tạp: Trung bình |
| --- | --- | --- |
| Mô tả | Mỗi vai trò thấy một bộ thống kê riêng ngay khi đăng nhập. | |
| Tác nhân | Admin, Giảng viên, Sinh viên | |

**ĐẶC TẢ CHỨC NĂNG**

**Luồng nghiệp vụ tiêu chuẩn**

1. **Admin**: tổng số sinh viên / giảng viên / lớp học phần / môn học / khoa; số lớp đang hoạt động; phân bố giới tính; phân bố xếp loại điểm toàn hệ thống; số đăng ký mới 7 ngày gần nhất.

2. **Giảng viên**: số lớp phụ trách trong học kỳ hiện hành, tổng sinh viên, tỷ lệ điểm danh, số bài chưa chấm, xu hướng điểm danh 8 buổi gần nhất.

3. **Sinh viên**: số tín chỉ đang học, GPA hiện tại, tỷ lệ điểm danh cá nhân, xu hướng GPA theo học kỳ.

4. Số liệu hiển thị bằng thẻ thống kê và biểu đồ (cột / tròn / đường) ngay trên trang chủ của từng vai trò.

## 3.5. Thiết kế cơ sở dữ liệu

### 3.5.1. Mô hình quan hệ (ERD)

Cơ sở dữ liệu PostgreSQL của hệ thống EduManage gồm 12 bảng. Danh mục đào tạo phân cấp theo chiều **Khoa → Ngành → Lớp hành chính / Môn học**; chuỗi nghiệp vụ học tập đi theo chiều **Người dùng → Đăng ký học phần → Lớp học phần → Môn học**.

![Hình 3.7. Mô hình quan hệ (ERD) của hệ thống EduManage](assets/diag_02_erd.png)

### 3.5.2. Mô tả cấu trúc các bảng

*Bảng users (Người dùng)*

| STT | Tên trường dữ liệu | Kiểu dữ liệu | Ghi chú |
| --- | --- | --- | --- |
| 1 | id | UUID (PK) | Khóa chính |
| 2 | fullName | String | Họ và tên |
| 3 | email | String, duy nhất | Email trường — dùng làm định danh đăng nhập |
| 4 | password | String | Mật khẩu đã băm bcrypt (10 vòng) |
| 5 | role | Enum | Vai trò: student / teacher / admin |
| 6 | avatar | String, tùy chọn | Ảnh đại diện |
| 7 | idStudent | String, tùy chọn | Mã sinh viên, tự sinh dạng SV{năm}{4 số} |
| 8 | class | String, tùy chọn | Tên lớp hành chính của sinh viên |
| 9 | idTeacher | String, tùy chọn | Mã giảng viên, tự sinh dạng GV{năm}{3 số} |
| 10 | degree | String, tùy chọn | Học vị (dành cho giảng viên) |
| 11 | phone | String, tùy chọn | Số điện thoại |
| 12 | personalEmail | String, tùy chọn | Email cá nhân — nơi nhận OTP và thông tin tài khoản; bắt buộc khi tạo tài khoản |
| 13 | department | String, tùy chọn | Tên khoa |
| 14 | address | String | Địa chỉ |
| 15 | gender | Enum, tùy chọn | Giới tính: male / female / other |
| 16 | birthDay | DateTime, tùy chọn | Ngày sinh |
| 17 | status | Enum | Trạng thái: đang học / bảo lưu / tốt nghiệp (SV); đang dạy / nghỉ hưu / thôi việc (GV); hoạt động / bị khóa (chung) |

*Bảng departments (Khoa)*

| STT | Tên trường dữ liệu | Kiểu dữ liệu | Ghi chú |
| --- | --- | --- | --- |
| 1 | id | UUID (PK) | Khóa chính |
| 2 | code | String, duy nhất | Mã khoa, ví dụ CNTT |
| 3 | nameDepartment | String | Tên khoa |

*Bảng branches (Ngành)*

| STT | Tên trường dữ liệu | Kiểu dữ liệu | Ghi chú |
| --- | --- | --- | --- |
| 1 | id | UUID (PK) | Khóa chính |
| 2 | code | String, duy nhất | Mã ngành |
| 3 | nameBranch | String | Tên ngành |
| 4 | departmentId | UUID (FK → departments) | Ngành thuộc Khoa nào |

*Bảng classes (Lớp hành chính)*

| STT | Tên trường dữ liệu | Kiểu dữ liệu | Ghi chú |
| --- | --- | --- | --- |
| 1 | id | UUID (PK) | Khóa chính |
| 2 | code | String, duy nhất | Mã lớp, ví dụ CNTT2021A |
| 3 | nameClass | String | Tên lớp |
| 4 | teacherId | UUID (FK → users) | Giáo viên chủ nhiệm |
| 5 | branchId | UUID (FK → branches) | Lớp thuộc Ngành nào |

*Bảng subjects (Môn học)*

| STT | Tên trường dữ liệu | Kiểu dữ liệu | Ghi chú |
| --- | --- | --- | --- |
| 1 | id | UUID (PK) | Khóa chính |
| 2 | code | String, duy nhất | Mã môn học, ví dụ INT1001 |
| 3 | name | String | Tên môn học |
| 4 | credits | Int | Số tín chỉ |
| 5 | branchId | UUID (FK → branches) | Môn học thuộc Ngành nào |

*Bảng subject_classes (Lớp học phần)*

| STT | Tên trường dữ liệu | Kiểu dữ liệu | Ghi chú |
| --- | --- | --- | --- |
| 1 | id | UUID (PK) | Khóa chính |
| 2 | code | String, duy nhất | Mã lớp học phần, ví dụ INT1001_1 |
| 3 | semester | String | Tên học kỳ (chuỗi) — xem mục 3.5.4 |
| 4 | maxStudents | Int, mặc định 50 | Sĩ số tối đa |
| 5 | status | Enum, mặc định active | Trạng thái: đang mở / đã kết thúc / đã hủy |
| 6 | subjectId | UUID (FK → subjects) | Môn học được mở lớp |
| 7 | teacherId | UUID (FK → users) | Giảng viên phụ trách |

*Bảng enrollments (Đăng ký học phần và Điểm)*

| STT | Tên trường dữ liệu | Kiểu dữ liệu | Ghi chú |
| --- | --- | --- | --- |
| 1 | id | UUID (PK) | Khóa chính |
| 2 | status | Enum, mặc định registered | Đã đăng ký / đã hủy / đã hoàn thành |
| 3 | registeredAt | DateTime | Thời điểm đăng ký |
| 4 | attendanceScore | Float, tùy chọn | Điểm chuyên cần (trọng số 10%) |
| 5 | midtermScore | Float, tùy chọn | Điểm giữa kỳ (trọng số 30%) |
| 6 | finalScore | Float, tùy chọn | Điểm cuối kỳ (trọng số 60%) |
| 7 | totalScore | Float, tùy chọn | Điểm tổng kết — hệ thống tự tính |
| 8 | letterGrade | Enum, tùy chọn | Xếp loại chữ A / B / C / D / F |
| 9 | gradeLocked | Boolean, mặc định false | Khóa điểm — chặn sửa điểm và chặn hủy đăng ký |
| 10 | studentId | UUID (FK → users) | Sinh viên đăng ký |
| 11 | subjectClassId | UUID (FK → subject_classes) | Lớp học phần |
| 12 | Ràng buộc duy nhất | (studentId, subjectClassId) | Chống đăng ký trùng một lớp |

*Bảng attendances (Điểm danh)*

| STT | Tên trường dữ liệu | Kiểu dữ liệu | Ghi chú |
| --- | --- | --- | --- |
| 1 | id | UUID (PK) | Khóa chính |
| 2 | date | DateTime | Ngày điểm danh |
| 3 | status | Enum, mặc định present | Có mặt / vắng / muộn / có phép |
| 4 | note | String | Ghi chú |
| 5 | studentId | UUID (FK → users) | Sinh viên được điểm danh |
| 6 | subjectClassId | UUID (FK → subject_classes) | Lớp học phần |
| 7 | markedById | UUID (FK → users), tùy chọn | Giảng viên thực hiện điểm danh |
| 8 | Ràng buộc duy nhất | (subjectClassId, studentId, date) | Mỗi sinh viên một bản ghi mỗi buổi — điểm danh lại sẽ cập nhật |

*Bảng semesters (Học kỳ)*

| STT | Tên trường dữ liệu | Kiểu dữ liệu | Ghi chú |
| --- | --- | --- | --- |
| 1 | id | Int, tự tăng (PK) | Khóa chính |
| 2 | name | String, duy nhất | Tên học kỳ, ví dụ HK1 2024-2025 |
| 3 | isActive | Boolean, mặc định false | Học kỳ đang hoạt động — căn cứ lọc dữ liệu hiện hành |

*Bảng api_keys (Cặp khóa RSA cho JWT)*

| STT | Tên trường dữ liệu | Kiểu dữ liệu | Ghi chú |
| --- | --- | --- | --- |
| 1 | id | UUID (PK) | Khóa chính |
| 2 | publicKey | Text | Khóa công khai RSA-2048 — dùng xác minh token |
| 3 | privateKey | Text | Khóa bí mật RSA-2048 — dùng ký token |
| 4 | expireAt | DateTime | Hết hạn cùng refresh token (7 ngày) |
| 5 | userId | UUID, duy nhất (FK → users, xóa theo) | Quan hệ 1-1: mỗi người dùng chỉ có một cặp khóa hiệu lực |

*Bảng otps (Mã xác thực quên mật khẩu)*

| STT | Tên trường dữ liệu | Kiểu dữ liệu | Ghi chú |
| --- | --- | --- | --- |
| 1 | id | UUID (PK) | Khóa chính |
| 2 | otp | String | Mã 6 chữ số, đã băm bcrypt |
| 3 | expireAt | DateTime | Hiệu lực 5 phút |
| 4 | userId | UUID (FK → users, xóa theo) | Người yêu cầu đặt lại mật khẩu |

*Bảng activity_logs (Nhật ký hoạt động)*

| STT | Tên trường dữ liệu | Kiểu dữ liệu | Ghi chú |
| --- | --- | --- | --- |
| 1 | id | UUID (PK) | Khóa chính |
| 2 | action | Enum | Hành động: tạo / cập nhật / xóa / đăng nhập / đăng xuất |
| 3 | entityType | Enum | Loại đối tượng tác động |
| 4 | entityId | String, tùy chọn | ID đối tượng |
| 5 | description | String | Mô tả |
| 6 | metadata | Json, tùy chọn | Dữ liệu bổ sung |
| 7 | ipAddress | String, tùy chọn | Địa chỉ IP |
| 8 | userId | UUID (FK → users) | Người thực hiện |

Ghi chú: bảng `activity_logs` đã được thiết kế sẵn trong lược đồ nhưng nghiệp vụ ghi nhật ký chưa được kích hoạt ở phiên bản hiện tại (xem phần Hạn chế).

### 3.5.3. Công thức tính điểm và GPA

- **Điểm tổng kết một môn** = Điểm chuyên cần × 10% + Điểm giữa kỳ × 30% + Điểm cuối kỳ × 60%, làm tròn 1 chữ số thập phân. Hệ thống tự tính ngay khi giảng viên nhập điểm.

- **Xếp loại chữ**: A khi điểm tổng kết ≥ 8.5; B khi ≥ 7.0; C khi ≥ 5.5; D khi ≥ 4.0; còn lại là F.

- **GPA tích lũy** = Tổng (Điểm tổng kết × Số tín chỉ) / Tổng số tín chỉ của các môn đã hoàn thành, làm tròn 2 chữ số thập phân. GPA theo từng học kỳ được tính riêng để vẽ biểu đồ xu hướng.

### 3.5.4. Liên kết Học kỳ – Lớp học phần

Trường `semester` trên bảng lớp học phần là chuỗi tên học kỳ, không phải khóa ngoại tới bảng `semesters`. Hai bảng liên kết với nhau ở tầng ứng dụng theo quy trình:

1. Admin đánh dấu một hoặc nhiều Học kỳ ở trạng thái đang hoạt động.

2. Khi cần lọc dữ liệu "học kỳ hiện hành", hệ thống lấy danh sách tên các học kỳ đang hoạt động.

3. Các lớp học phần (và dữ liệu đăng ký, thống kê kèm theo) có tên học kỳ nằm trong danh sách đó được xem là dữ liệu hiện hành.

Do liên kết bằng so khớp tên, việc đổi tên một Học kỳ sẽ không tự cập nhật các lớp học phần đã lưu tên cũ — đây là điểm cần lưu ý khi vận hành (xem phần Hạn chế).

## 3.6. Sơ đồ tuần tự các nghiệp vụ

Mỗi ca sử dụng ở mục 3.4 có một sơ đồ tuần tự tương ứng, vẽ theo chuẩn UML với bốn thành phần: Người dùng (tác nhân) → Front-End → Back-End → Database. Mũi tên nét liền là yêu cầu gửi đi, mũi tên nét đứt là phản hồi trả về; khung Alt thể hiện hai nhánh kết quả [Thành công] / [Thất bại].

### 3.6.1. Nhóm Xác thực và Tài khoản cá nhân

![Hình 3.8. Sơ đồ tuần tự UC#01 — Đăng nhập theo vai trò](assets/uml_seq_uc01.png)

![Hình 3.9. Sơ đồ tuần tự UC#02 — Quên mật khẩu bằng OTP qua email](assets/uml_seq_uc02.png)

![Hình 3.10. Sơ đồ tuần tự UC#03 — Đổi mật khẩu](assets/uml_seq_uc03.png)

![Hình 3.11. Sơ đồ tuần tự UC#04 — Đăng xuất](assets/uml_seq_uc04.png)

![Hình 3.12. Sơ đồ tuần tự UC#05 — Cập nhật hồ sơ cá nhân](assets/uml_seq_uc05.png)

### 3.6.2. Nhóm Quản trị tài khoản (Admin)

![Hình 3.13. Sơ đồ tuần tự UC#06 — Tạo tài khoản Sinh viên / Giảng viên](assets/uml_seq_uc06.png)

![Hình 3.14. Sơ đồ tuần tự UC#07 — Nhập danh sách hàng loạt](assets/uml_seq_uc07.png)

![Hình 3.15. Sơ đồ tuần tự UC#08 — Xem chi tiết và cập nhật người dùng](assets/uml_seq_uc08.png)

![Hình 3.16. Sơ đồ tuần tự UC#09 — Khóa / mở khóa tài khoản](assets/uml_seq_uc09.png)

![Hình 3.17. Sơ đồ tuần tự UC#10 — Xóa tài khoản](assets/uml_seq_uc10.png)

### 3.6.3. Nhóm Danh mục đào tạo (Admin)

![Hình 3.18. Sơ đồ tuần tự UC#11 — Quản lý danh mục Khoa / Ngành / Lớp / Môn học](assets/uml_seq_uc11.png)

![Hình 3.19. Sơ đồ tuần tự UC#12 — Quản lý Lớp học phần và Học kỳ](assets/uml_seq_uc12.png)

![Hình 3.20. Sơ đồ tuần tự UC#13 — Xuất danh sách CSV / Excel](assets/uml_seq_uc13.png)

### 3.6.4. Nhóm Học vụ (Giảng viên / Sinh viên)

![Hình 3.21. Sơ đồ tuần tự UC#14 — Xem lớp phụ trách và danh sách sinh viên](assets/uml_seq_uc14.png)

![Hình 3.22. Sơ đồ tuần tự UC#15 — Điểm danh sinh viên](assets/uml_seq_uc15.png)

![Hình 3.23. Sơ đồ tuần tự UC#16 — Nhập điểm và Khóa điểm](assets/uml_seq_uc16.png)

![Hình 3.24. Sơ đồ tuần tự UC#17 — Đăng ký học phần](assets/uml_seq_uc17.png)

![Hình 3.25. Sơ đồ tuần tự UC#18 — Hủy đăng ký học phần](assets/uml_seq_uc18.png)

![Hình 3.26. Sơ đồ tuần tự UC#19 — Xem môn đã đăng ký và lịch học / lịch dạy](assets/uml_seq_uc19.png)

![Hình 3.27. Sơ đồ tuần tự UC#20 — Xem bảng điểm và GPA](assets/uml_seq_uc20.png)

### 3.6.5. Nhóm Thống kê

![Hình 3.28. Sơ đồ tuần tự UC#21 — Xem thống kê Dashboard theo vai trò](assets/uml_seq_uc21.png)

# CHƯƠNG 4. TRIỂN KHAI HỆ THỐNG

## 4.1. Phân hệ dùng chung

### 4.1.1. Màn hình đăng nhập

Màn hình đăng nhập có ba tab vai trò (Admin / Giảng viên / Sinh viên). Người dùng nhập mã tài khoản đúng định dạng của vai trò đang chọn và mật khẩu; nhập sai định dạng sẽ bị nhắc ngay tại chỗ, không gửi yêu cầu lên server. Cùng màn hình này tích hợp trọn luồng quên mật khẩu: nhập mã tài khoản → nhận OTP qua email cá nhân → xác minh OTP → đặt mật khẩu mới với danh sách điều kiện hiển thị trực quan (đủ 8 ký tự, có chữ hoa, chữ số, ký tự đặc biệt).

### 4.1.2. Trang hồ sơ cá nhân

Mọi vai trò đều có trang hồ sơ cá nhân để xem và cập nhật thông tin (họ tên, số điện thoại, địa chỉ, ngày sinh…) và đổi mật khẩu. Sau khi đổi mật khẩu thành công, hệ thống tự đăng xuất trên mọi thiết bị để đảm bảo an toàn.

### 4.1.3. Tiện ích giao diện

Toàn hệ thống hỗ trợ hai ngôn ngữ (Tiếng Việt / Tiếng Anh) và hai chế độ giao diện (sáng / tối), chuyển đổi tức thì và được ghi nhớ cho lần truy cập sau. Các thao tác đều có thông báo kết quả (toast) và hộp thoại xác nhận trước những hành động không thể hoàn tác.

## 4.2. Phân hệ Quản trị viên

- **Dashboard**: thẻ thống kê tổng số sinh viên, giảng viên, lớp học phần, môn học, khoa; biểu đồ phân bố giới tính, phân bố xếp loại điểm; số đăng ký mới 7 ngày gần nhất.

- **Quản lý Sinh viên / Giảng viên**: bảng danh sách có tìm kiếm, lọc; thêm mới từng người (hệ thống tự sinh mã và gợi ý mã kế tiếp); nhập hàng loạt từ CSV/Excel với bản xem trước phân biệt dòng hợp lệ / lỗi; xem hồ sơ chi tiết; khóa / mở khóa; xóa; xuất danh sách ra CSV/Excel.

- **Quản lý danh mục**: các màn hình Khoa, Ngành, Lớp hành chính, Môn học theo phân cấp Khoa → Ngành → Lớp / Môn học; chọn phần tử cha ngay trong biểu mẫu.

- **Quản lý Lớp học phần**: mở lớp gắn Môn học + Giảng viên + Học kỳ, đặt sĩ số tối đa và trạng thái.

- **Quản lý Học kỳ**: tạo học kỳ và bật / tắt trạng thái hoạt động — công tắc điều khiển phạm vi dữ liệu "hiện hành" của toàn hệ thống.

## 4.3. Phân hệ Giảng viên

- **Dashboard**: số lớp phụ trách trong học kỳ hiện hành, tổng sinh viên, tỷ lệ điểm danh, số bài chưa chấm, biểu đồ xu hướng điểm danh 8 buổi gần nhất.

- **Lớp của tôi**: danh sách lớp học phần được phân công kèm sĩ số; xem danh sách sinh viên từng lớp.

- **Điểm danh**: chọn lớp và ngày, đánh dấu trạng thái từng sinh viên (có mặt / vắng / muộn / có phép) kèm ghi chú; lưu cả lớp một lần; điểm danh lại trong ngày sẽ cập nhật bản ghi cũ.

- **Nhập điểm**: bảng điểm cả lớp với ba cột điểm thành phần; điểm tổng kết và xếp loại chữ tự tính ngay khi nhập; nút khóa điểm sau khi hoàn tất.

- **Lịch dạy**: các lớp phụ trách nhóm theo học kỳ.

## 4.4. Phân hệ Sinh viên

- **Dashboard**: tín chỉ đang học, GPA hiện tại, tỷ lệ điểm danh cá nhân, biểu đồ xu hướng GPA theo học kỳ.

- **Đăng ký học phần**: danh sách lớp đang mở của học kỳ hoạt động kèm số chỗ còn lại; đăng ký một chạm; báo lỗi rõ ràng khi lớp đầy hoặc đã đăng ký.

- **Môn của tôi / Lịch học**: các môn đã đăng ký nhóm theo học kỳ; hủy đăng ký khi điểm chưa khóa.

- **Bảng điểm**: bảng điểm toàn khóa với điểm thành phần, điểm tổng kết, xếp loại chữ; GPA tích lũy, tổng tín chỉ; biểu đồ xu hướng GPA.

## 4.5. Môi trường vận hành

| Thành phần | Yêu cầu |
| --- | --- |
| Máy chủ CSDL | PostgreSQL đang chạy, khai báo chuỗi kết nối qua biến môi trường |
| Server | Node.js, chạy tại cổng 3000; lệnh phát triển `npm run start:dev` |
| Client | Chạy tại cổng 5173; lệnh phát triển `npm run dev` |
| Gửi email | Tài khoản SMTP (ví dụ Gmail với App Password), khai báo qua biến môi trường |
| Dữ liệu mẫu | Lệnh `npm run seed` tạo sẵn tài khoản demo cho cả ba vai trò và dữ liệu minh họa |
| Trình tự khởi động | PostgreSQL → Server → Client |

Toàn bộ tham số nhạy cảm (chuỗi kết nối CSDL, tài khoản SMTP, danh sách nguồn được phép gọi API) đều tách khỏi mã nguồn và khai báo bằng biến môi trường.

## 4.6. Kiểm thử

- Server có bộ kiểm thử đơn vị (Jest) cho tầng service, chạy bằng lệnh `npm test`.

- Các nghiệp vụ chính (đăng nhập, quên mật khẩu, tạo tài khoản, nhập hàng loạt, đăng ký học phần, điểm danh, nhập điểm, khóa điểm) đã được kiểm thử thủ công theo kịch bản trên cả ba vai trò, bao gồm các nhánh lỗi (sai mật khẩu, tài khoản bị khóa, lớp đầy, điểm đã khóa, dữ liệu nhập hàng loạt có dòng lỗi…).

- Ràng buộc dữ liệu được kiểm chứng ở tầng CSDL: đăng ký trùng và điểm danh trùng đều bị chặn bởi ràng buộc duy nhất ngay cả khi thao tác đồng thời.

# KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

## Kết quả đạt được

- Hoàn thiện hệ thống EduManage với đầy đủ 21 ca sử dụng cho ba vai trò: quản trị tài khoản và danh mục đào tạo (Admin), điểm danh và nhập điểm (Giảng viên), đăng ký học phần và theo dõi kết quả học tập (Sinh viên).

- Xây dựng cơ chế xác thực ở mức cao hơn thông lệ đồ án: JWT RS256 với cặp khóa RSA-2048 riêng cho từng người dùng, token trong cookie httpOnly, tự làm mới token, thu hồi phiên tức thời khi khóa tài khoản / đổi mật khẩu.

- Tự động hóa trọn vòng đời tài khoản: tự sinh mã, tự tạo email trường và mật khẩu tạm, gửi thông tin qua email cá nhân, quên mật khẩu bằng OTP có thời hạn.

- Số hóa trọn chuỗi nghiệp vụ học vụ: mở lớp theo học kỳ → đăng ký có kiểm soát sĩ số → điểm danh chống trùng → nhập điểm tự tính xếp loại → khóa điểm → bảng điểm và GPA.

- Giao diện hiện đại, thống nhất, hai ngôn ngữ, hai chế độ sáng / tối, có biểu đồ thống kê trực quan cho từng vai trò.

## Hạn chế hiện tại

- Bảng nhật ký hoạt động (activity_logs) đã thiết kế trong CSDL nhưng chưa có nghiệp vụ ghi dữ liệu — chưa có vết kiểm toán (audit trail) cho các thao tác quản trị.

- Học kỳ liên kết với lớp học phần bằng so khớp tên (không phải khóa ngoại): đổi tên học kỳ sẽ không tự cập nhật các lớp đã lưu tên cũ.

- Thao tác khóa / mở khóa điểm chưa kiểm tra quyền sở hữu lớp học phần (mọi giảng viên / Admin đều thao tác được); điểm danh chưa kiểm tra sinh viên có thuộc lớp hay không.

- Khi nhập hàng loạt, nếu một số email thông tin tài khoản gửi thất bại thì chưa có cơ chế báo lại cho Admin.

- Sinh viên mới xem được tỷ lệ điểm danh tổng trên Dashboard, chưa có màn hình xem chi tiết điểm danh từng buổi (API phía server đã sẵn sàng).

## Hướng phát triển

- Kích hoạt nhật ký hoạt động cho các thao tác quản trị quan trọng (tạo / xóa tài khoản, khóa điểm, đổi trạng thái học kỳ) và bổ sung màn hình tra cứu nhật ký.

- Chuyển liên kết Học kỳ – Lớp học phần sang khóa ngoại thực sự để đảm bảo toàn vẹn dữ liệu khi đổi tên học kỳ.

- Siết quyền khóa / mở khóa điểm theo đúng giảng viên phụ trách; kiểm tra danh sách đăng ký trước khi ghi nhận điểm danh.

- Bổ sung màn hình chi tiết điểm danh cho sinh viên, thông báo trong ứng dụng, và báo cáo thống kê nâng cao (xuất bảng điểm có chữ ký số, cảnh báo học vụ tự động).

- Mở rộng thời khóa biểu theo tiết học / phòng học và tích hợp lịch (iCal) cho sinh viên, giảng viên.
