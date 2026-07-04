# Sơ Đồ Tuần Tự (Sequence Diagram) — Các Luồng Nghiệp Vụ Chính

> Vẽ bằng Mermaid `sequenceDiagram` (render trực tiếp trong Markdown/VS Code/GitHub) thay cho hình ảnh UML chèn tay như trong tài liệu mẫu (`00-phan-tich-tai-lieu-mau.md`, mục 3.4). Mỗi sơ đồ tương ứng với một Use Case trong `03-usecase-nghiep-vu.md`. Chi tiết kỹ thuật (tên hàm, bảng, guard) được lấy trực tiếp từ mã nguồn hiện tại của `server_side/` và `client_side/`.

## 1. Đăng nhập (UC#01)

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant C as React App (LoginUser.jsx)
    participant Http as request.js (không xác thực)
    participant Ctrl as AuthController
    participant Svc as AuthService
    participant DB as PostgreSQL

    U->>C: Nhập identifier + password
    C->>Http: requestLogin({identifier, password})
    Http->>Ctrl: POST /api/users/login
    Ctrl->>Svc: login(identifier, password)
    Svc->>DB: findUserByIdentifier (email LIKE identifier@%)
    DB-->>Svc: User
    Svc->>Svc: bcrypt.compare(password, user.password)
    alt sai mật khẩu hoặc user không tồn tại
        Svc-->>Ctrl: throw UnauthorizedException
        Ctrl-->>C: 401 Unauthorized
        C-->>U: "Tài khoản hoặc mật khẩu không chính xác"
    else user.status không active
        Svc-->>Ctrl: throw 403 ACCOUNT_LOCKED
        Ctrl-->>C: 403 ACCOUNT_LOCKED
        C-->>U: Modal "Tài khoản đã bị khóa"
    else hợp lệ
        Svc->>DB: DELETE FROM api_keys WHERE userId=...
        Svc->>Svc: generateKeyPairSync('rsa', 2048) — cặp khóa mới
        Svc->>DB: INSERT api_keys (publicKey, privateKey, expireAt)
        Svc->>Svc: sign(accessToken, privateKey, 15m)
        Svc->>Svc: sign(refreshToken, privateKey, 7d)
        Svc-->>Ctrl: {token, refreshToken, user}
        Ctrl-->>C: Set-Cookie token/refreshToken/logged + user JSON
        C->>C: AuthContext.login(user) — lưu vào state (roleKey enrich)
        C-->>U: Điều hướng vào Shell theo role (admin/teacher/student)
    end
```

## 2. Làm mới Access Token (401 Interceptor)

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant C as React App
    participant Api as apiClient (axiosClient.js)
    participant Ctrl as AuthController
    participant Svc as AuthService

    C->>Api: Gọi bất kỳ API cần xác thực
    Api->>Ctrl: Request kèm cookie "token" (đã hết hạn)
    Ctrl-->>Api: 401 Unauthorized
    Api->>Api: Kiểm tra cookie "logged"
    alt không có cookie "logged"
        Api->>Api: _handleAuthFailure() — xóa cookie, redirect "/"
    else có cookie "logged"
        Api->>Ctrl: GET /api/users/refresh-token (cookie refreshToken)
        Ctrl->>Svc: refreshAccessToken(refreshToken)
        Svc->>Svc: verifyToken(refreshToken) bằng publicKey đã lưu
        alt refresh token hợp lệ
            Svc->>Svc: sign(accessToken mới, cùng privateKey, 15m)
            Svc-->>Ctrl: token mới
            Ctrl-->>Api: Set-Cookie "token" mới
            Api->>Api: Thử lại các request đang xếp hàng (queue)
            Api-->>C: Kết quả request gốc
        else refresh thất bại / hết hạn
            Ctrl-->>Api: 401 / 403 ACCOUNT_LOCKED
            Api->>Api: _handleAuthFailure() hoặc phát "auth:account-locked"
            Api-->>C: Redirect "/" hoặc hiển thị modal khóa
        end
    end
```

## 3. Quên mật khẩu → Xác thực OTP → Đặt lại mật khẩu (UC#02)

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant C as LoginUser.jsx
    participant Ctrl as AuthController
    participant Svc as AuthService
    participant DB as PostgreSQL (otps, users)
    participant Mail as EmailService (SMTP)

    U->>C: Nhập identifier, chọn "Quên mật khẩu"
    C->>Ctrl: POST /api/users/forgot-password {identifier}
    Ctrl->>Svc: forgotPassword(identifier)
    Svc->>DB: Tìm user theo identifier
    alt user.personalEmail rỗng
        Svc-->>Ctrl: 400 Bad Request
        Ctrl-->>C: "Tài khoản chưa có email cá nhân"
    else có personalEmail
        Svc->>Svc: Sinh OTP 6 số + bcrypt hash
        Svc->>DB: DELETE Otp cũ, INSERT Otp mới (hết hạn 5 phút)
        Svc->>Mail: sendOtp({personalEmail, otp, fullName})
        Mail-->>Svc: OK (hoặc throw nếu SMTP lỗi → 500)
        Svc-->>Ctrl: 200 OK
        Ctrl-->>C: "Đã gửi OTP tới email cá nhân"
    end

    U->>C: Nhập mã OTP nhận được qua email
    C->>Ctrl: POST /api/users/verify-otp {identifier, otp}
    Ctrl->>Svc: verifyOtp(identifier, otp)
    Svc->>DB: Lấy Otp mới nhất chưa hết hạn của user
    Svc->>Svc: bcrypt.compare(otp, hashedOtp)
    alt sai/hết hạn
        Svc-->>C: 400 — "Mã OTP không đúng hoặc đã hết hạn"
    else đúng
        Svc-->>C: 200 OK — cho phép nhập mật khẩu mới
        U->>C: Nhập mật khẩu mới (theo PW_RULES)
        C->>Ctrl: POST /api/users/reset-password {identifier, otp, newPassword}
        Ctrl->>Svc: resetPassword(...)
        Svc->>Svc: Xác thực lại OTP + độ mạnh mật khẩu mới
        Svc->>DB: UPDATE users.password (bcrypt hash mới)
        Svc->>DB: DELETE Otp, DELETE ApiKey (kick toàn bộ phiên)
        Svc-->>C: 200 OK
        C-->>U: "Đặt lại mật khẩu thành công" → chuyển tới màn hình đăng nhập
    end
```

## 4. Admin tạo tài khoản Sinh viên (UC#05)

```mermaid
sequenceDiagram
    actor A as Admin
    participant C as admin.jsx (StudentsScreen)
    participant Ctrl as UsersController
    participant Svc as UsersService
    participant DB as PostgreSQL (users)
    participant Mail as EmailService (SMTP)

    A->>C: Điền form (họ tên, giới tính, lớp, personalEmail...)
    C->>Ctrl: POST /api/users/students {...}
    Ctrl->>Ctrl: JwtAuthGuard + RolesGuard(admin)
    Ctrl->>Svc: createStudent(data)
    alt thiếu personalEmail
        Svc-->>Ctrl: 400 Bad Request
        Ctrl-->>C: "Cần nhập email cá nhân"
    else hợp lệ
        Svc->>DB: Quét idStudent lớn nhất theo năm hiện tại
        Svc->>Svc: Sinh idStudent = "SV{năm}{seq+1}"
        Svc->>DB: Kiểm tra lại trùng id (race-condition guard)
        alt trùng id
            Svc-->>Ctrl: 409 Conflict
            Ctrl-->>C: Yêu cầu thử lại
        else không trùng
            Svc->>Svc: email trường = "{idStudent}@student.school.edu.vn"
            Svc->>Svc: Sinh mật khẩu tạm 10 ký tự ngẫu nhiên + bcrypt hash
            Svc->>DB: INSERT users (status='studying', ...)
            Svc->>Mail: sendAccountCredentials({personalEmail, schoolEmail, password, fullName})
            Mail-->>Svc: OK (lỗi thì chỉ log cảnh báo, không rollback)
            Svc-->>Ctrl: user (không kèm password)
            Ctrl-->>C: 201 Created
            C-->>A: Hiển thị tài khoản mới trong danh sách
        end
    end
```

## 5. Nhập danh sách hàng loạt — Bulk Import (UC#06)

```mermaid
sequenceDiagram
    actor A as Admin
    participant C as BulkImportDrawer (tools.jsx)
    participant Ctrl as UsersController
    participant Svc as UsersService
    participant DB as PostgreSQL (transaction)
    participant Mail as EmailService (SMTP)

    A->>C: Tải lên file CSV/XLSX
    C->>C: parseCSV() — validate sơ bộ từng dòng phía client
    C-->>A: Preview dòng hợp lệ / lỗi
    A->>C: Xác nhận "Nhập dữ liệu"
    C->>Ctrl: POST /api/users/bulk-import {rows: [...]}
    Ctrl->>Svc: bulkImportStudents(rows)
    Svc->>Svc: Validate lại toàn bộ rows (fullName, personalEmail regex)
    alt có dòng không hợp lệ
        Svc-->>Ctrl: 400 + danh sách lỗi theo từng dòng
        Ctrl-->>C: Hiển thị lỗi — KHÔNG dòng nào được tạo
    else toàn bộ hợp lệ
        Svc->>Svc: Sinh N mã idStudent tuần tự
        Svc->>Svc: Tính trước email trường + mật khẩu tạm cho từng dòng
        Svc->>DB: prisma.$transaction([...insert từng user])
        DB-->>Svc: Tất cả thành công (atomic)
        Svc-->>Ctrl: 201 Created {count: N}
        Ctrl-->>C: "Đã tạo N tài khoản"
        par Gửi email không đồng bộ (fire-and-forget)
            Svc->>Mail: sendAccountCredentials(user 1..N) — Promise.allSettled
            Mail-->>Svc: OK / lỗi từng email (không ảnh hưởng response đã trả)
        end
    end
```

## 6. Sinh viên đăng ký học phần (UC#08)

```mermaid
sequenceDiagram
    actor S as Sinh viên
    participant C as student.jsx (RegistrationScreen)
    participant Ctrl as EnrollmentsController
    participant Svc as EnrollmentsService
    participant DB as PostgreSQL (subject_classes, enrollments)

    S->>C: Xem danh sách lớp học phần khả dụng
    C->>Ctrl: GET /api/subject-classes
    Ctrl-->>C: Danh sách lớp (status=active, học kỳ hiện hành)
    S->>C: Chọn "Đăng ký" 1 lớp học phần
    C->>Ctrl: POST /api/enrollments {subjectClassId}
    Ctrl->>Ctrl: JwtAuthGuard + RolesGuard(student)
    Ctrl->>Svc: register(studentId, subjectClassId)
    Svc->>DB: Tìm SubjectClass theo id
    alt không tồn tại hoặc status != active
        Svc-->>Ctrl: 400 — "Lớp học phần không mở đăng ký"
    else
        Svc->>DB: COUNT Enrollment theo subjectClassId
        alt enrolledCount >= maxStudents
            Svc-->>Ctrl: 400 — "Lớp học phần đã đầy"
        else
            Svc->>DB: Kiểm tra Enrollment (studentId, subjectClassId) đã tồn tại?
            alt đã tồn tại
                Svc-->>Ctrl: 409 — "Đã đăng ký lớp này"
            else
                Svc->>DB: INSERT Enrollment (status='registered')
                Svc-->>Ctrl: enrollment mới
                Ctrl-->>C: 201 Created
                C-->>S: "Đăng ký thành công"
            end
        end
    end
```

## 7. Giảng viên nhập điểm & khóa điểm (UC#10)

```mermaid
sequenceDiagram
    actor T as Giảng viên
    participant C as teacher.jsx (GradeEntryScreen)
    participant Ctrl as EnrollmentsController
    participant Svc as EnrollmentsService
    participant DB as PostgreSQL (enrollments)

    T->>C: Chọn lớp học phần phụ trách
    C->>Ctrl: GET /api/enrollments/:subjectClassId/grades
    Ctrl-->>C: Danh sách sinh viên + điểm hiện có
    T->>C: Nhập điểm chuyên cần/giữa kỳ/cuối kỳ cho 1 sinh viên
    C->>Ctrl: PUT /api/enrollments/:id/grade {attendanceScore?, midtermScore?, finalScore?}
    Ctrl->>Svc: updateGrade(enrollmentId, teacherId, scores)
    Svc->>DB: Lấy Enrollment kèm subjectClass.teacherId
    alt subjectClass.teacherId != teacherId
        Svc-->>Ctrl: 403 Forbidden
    else gradeLocked == true
        Svc-->>Ctrl: 400 — "Điểm đã bị khóa"
    else hợp lệ
        Svc->>Svc: Gộp điểm mới + điểm cũ (giữ giá trị cũ nếu không gửi)
        Svc->>Svc: totalScore = round((CC*0.1+GK*0.3+CK*0.6)*10)/10
        Svc->>Svc: letterGrade theo ngưỡng A/B/C/D/F
        Svc->>DB: UPDATE enrollment (scores, totalScore, letterGrade, status='completed')
        Svc-->>Ctrl: enrollment đã cập nhật
        Ctrl-->>C: 200 OK
        C-->>T: Bảng điểm cập nhật real-time trên UI
    end

    Note over T,DB: Sau khi nhập xong toàn bộ lớp
    T->>C: Chọn "Khóa điểm"
    C->>Ctrl: PATCH /api/enrollments/:id/lock {locked: true}
    Ctrl->>Ctrl: RolesGuard('teacher','admin') — KHÔNG kiểm tra sở hữu lớp
    Ctrl->>Svc: toggleGradeLock(id, true)
    Svc->>DB: UPDATE enrollment SET gradeLocked = true
    Svc-->>Ctrl: OK
    Ctrl-->>C: 200 OK — điểm bị khóa, không thể sửa/hủy đăng ký
```

## 8. Giảng viên điểm danh hàng loạt (UC#11)

```mermaid
sequenceDiagram
    actor T as Giảng viên
    participant C as teacher.jsx (AttendanceScreen)
    participant Ctrl as AttendanceController
    participant Svc as AttendanceService
    participant DB as PostgreSQL (attendances)

    T->>C: Chọn lớp học phần + ngày điểm danh
    C->>Ctrl: POST /api/attendance/bulk {subjectClassId, date, records:[{studentId,status,note}]}
    Ctrl->>Svc: bulkMark({subjectClassId, date, records, markedById})
    Svc->>DB: Lấy SubjectClass, kiểm tra teacherId == markedById
    alt không phải giáo viên phụ trách
        Svc-->>Ctrl: 403 Forbidden — không điểm danh dòng nào
    else hợp lệ
        loop Với mỗi sinh viên trong records (song song, allSettled)
            Svc->>DB: UPSERT attendance theo khóa (subjectClassId, studentId, date)
            DB-->>Svc: created hoặc updated
        end
        Svc-->>Ctrl: {saved: n, failed: m}
        Ctrl-->>C: 200 OK
        C-->>T: "Đã lưu điểm danh (n thành công / m lỗi)"
    end
```

## 9. Xem Dashboard theo vai trò (UC#12)

```mermaid
sequenceDiagram
    actor U as Người dùng (Admin/Giảng viên/Sinh viên)
    participant C as React App (Dashboard)
    participant Ctrl as DashboardController
    participant Svc as DashboardService
    participant DB as PostgreSQL

    U->>C: Mở màn hình Dashboard
    alt role = admin
        C->>Ctrl: GET /api/dashboard
        Ctrl->>Svc: getStats()
        Svc->>DB: Đếm song song: users, subject_classes, subjects, departments,<br/>groupBy letterGrade, enrollments 7 ngày gần nhất
        Svc-->>Ctrl: {students, teachers, sections, gradeDist, ...}
    else role = teacher
        C->>Ctrl: GET /api/dashboard/teacher
        Ctrl->>Svc: getTeacherStats(teacherId)
        Svc->>DB: Lọc lớp phụ trách theo học kỳ hiện hành (Semester.isActive)
        Svc->>DB: Tính tỷ lệ điểm danh, số bài chưa chấm, xu hướng 8 buổi gần nhất
        Svc-->>Ctrl: {totalSections, attendanceRate, pendingGrades, attendanceTrend}
    else role = student
        C->>Ctrl: GET /api/dashboard/student
        Ctrl->>Svc: getStudentStats(studentId)
        Svc->>DB: Lấy enrollment hiện tại + completed, tính GPA, tỷ lệ điểm danh
        Svc-->>Ctrl: {currentCredits, gpa, attendanceRate, gpaTrend}
    end
    Ctrl-->>C: JSON metadata
    C-->>U: Render StatCard + biểu đồ (recharts/chart.js)
```

## 10. Ghi chú tổng hợp áp dụng cho mọi sơ đồ trên

- Mọi request "đã xác thực" đều đi qua `apiClient` (`axiosClient.js`) → tự động gắn cookie (`withCredentials: true`) và tự làm mới token khi gặp 401 (xem sơ đồ mục 2) trước khi tới được sơ đồ nghiệp vụ tương ứng — các sơ đồ 4–9 lược bỏ bước này để tập trung vào nghiệp vụ chính.
- Guard áp dụng theo thứ tự: `JwtAuthGuard` (xác thực) → `RolesGuard` + `@Roles(...)` (phân quyền) — nếu request không qua guard, controller/service không được gọi tới.
- Định dạng response thành công chuẩn của server: `{ success, message, metadata }`; lỗi được NestJS tự serialize từ các `HttpException` (`BadRequestException`, `ForbiddenException`, `ConflictException`, `UnauthorizedException`...).
