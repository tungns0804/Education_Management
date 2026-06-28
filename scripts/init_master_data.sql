-- ============================================================
-- EduManage — Master Data Initialization Script
-- ============================================================
-- Mục đích : Khởi tạo toàn bộ dữ liệu nền khi set up source mới
-- Chạy lệnh: psql -U postgres -d education_management_database -f scripts/init_master_data.sql
--            hoặc dùng helper:  .\scripts\run_seed.ps1
--
-- Idempotent — an toàn khi chạy nhiều lần:
--   INSERT ... ON CONFLICT (business_key) DO UPDATE  →  tạo mới hoặc cập nhật
--   INSERT ... ON CONFLICT (...) DO NOTHING          →  bỏ qua nếu đã có
--
-- Thứ tự : departments → branches → users → classes
--          → subjects → subject_classes → enrollments
--
-- Tài khoản demo (plain-text):
--   admin@school.edu.vn            /  Admin@123
--   gv1001@school.edu.vn           /  Teacher@123
--   20216001@student.school.edu.vn /  Student@123
-- ============================================================

BEGIN;

-- ────────────────────────────────────────────────────────────
-- 1. DEPARTMENTS — Khoa / Phòng ban
-- ────────────────────────────────────────────────────────────
INSERT INTO departments (id, code, "nameDepartment", "createdAt", "updatedAt") VALUES
  ('789f0cd2-8fac-444e-9fe8-8068ed5cb036', 'CNTT', 'Công nghệ Thông tin',  NOW(), NOW()),
  ('74f97ec9-88db-44c7-a59d-32fe36f2c0ad', 'KTKT', 'Kinh tế - Kế toán',    NOW(), NOW()),
  ('19023af3-101d-417a-ba2f-1bc2efedad33', 'KTXD', 'Kỹ thuật - Xây dựng',  NOW(), NOW()),
  ('0287fd4e-b662-453e-b453-a9b8faee1ed6', 'NN',   'Ngoại ngữ',             NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
  "nameDepartment" = EXCLUDED."nameDepartment",
  "updatedAt"      = NOW();

-- ────────────────────────────────────────────────────────────
-- 2. BRANCHES — Ngành học (thuộc Khoa)
-- ────────────────────────────────────────────────────────────
INSERT INTO branches (id, code, "nameBranch", "departmentId", "createdAt", "updatedAt") VALUES
  ('722de66e-51ee-4c92-8487-9ece7f76209b', 'HTTT', 'Hệ thống Thông tin',           (SELECT id FROM departments WHERE code = 'CNTT'), NOW(), NOW()),
  ('a50f3d46-5e25-452a-b66f-28c1e9130375', 'KTPM', 'Kỹ thuật Phần mềm',            (SELECT id FROM departments WHERE code = 'CNTT'), NOW(), NOW()),
  ('2a4386e2-c53a-4674-86e3-c227d54a7616', 'KT',   'Kế toán',                      (SELECT id FROM departments WHERE code = 'KTKT'), NOW(), NOW()),
  ('29678183-8116-46e5-8d6f-7bbef3da274c', 'QTKD', 'Quản trị Kinh doanh',          (SELECT id FROM departments WHERE code = 'KTKT'), NOW(), NOW()),
  ('a2cfe520-08fc-498e-83de-b13d5a1443a4', 'KTCD', 'Kỹ thuật Công trình Dân dụng', (SELECT id FROM departments WHERE code = 'KTXD'), NOW(), NOW()),
  ('719c7985-dca4-4d35-926c-2e41e30849ae', 'XDGT', 'Xây dựng Giao thông',          (SELECT id FROM departments WHERE code = 'KTXD'), NOW(), NOW()),
  ('1186e53b-cd08-4818-99c5-9da9201af800', 'TA',   'Tiếng Anh',                    (SELECT id FROM departments WHERE code = 'NN'),   NOW(), NOW()),
  ('2d774380-6a1e-47fa-92e3-e3916efa64d6', 'TN',   'Tiếng Nhật',                   (SELECT id FROM departments WHERE code = 'NN'),   NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
  "nameBranch"   = EXCLUDED."nameBranch",
  "departmentId" = EXCLUDED."departmentId",
  "updatedAt"    = NOW();

-- ────────────────────────────────────────────────────────────
-- 3. USERS — Admin, Giảng viên, Sinh viên
-- ────────────────────────────────────────────────────────────
-- Passwords are bcrypt-hashed (cost 10):
--   Admin@123   → hash của admin
--   Teacher@123 → hash của các giảng viên
--   Student@123 → hash của các sinh viên
-- Khi conflict (email đã có): chỉ cập nhật thông tin hiển thị,
-- KHÔNG ghi đè password / role / status của tài khoản thật.
INSERT INTO users (
  id, "fullName", email, password,
  role, "typeLogin", status, "isAdmin", address,
  "idTeacher", degree, phone, department,
  "idStudent", class, "personalEmail", gender, "birthDay",
  "createdAt", "updatedAt"
) VALUES
  -- ── Admin ──────────────────────────────────────────────────
  (
    '405d80bd-0a15-4472-9586-6f8e29d685e2',
    'Phạm Quốc Admin', 'admin@school.edu.vn',
    '$2b$10$Z33ulrq7tj82yuB28Efc/ehFH90lVb5fDGOZQi4D66cTq4N/0nZ8a',
    'admin'::"Role", 'email'::"TypeLogin", 'active'::"UserStatus", TRUE, '',
    NULL, NULL, NULL, NULL,
    NULL, NULL, 'nguyensontung0804@gmail.com', NULL, NULL,
    NOW(), NOW()
  ),
  -- ── Giảng viên ─────────────────────────────────────────────
  (
    'a634a4e1-90e3-4568-8d74-50ec3225732c',
    'GV. Nguyễn Sơn Tùng', 'gv1001@school.edu.vn',
    '$2b$10$qr5.No3aFXwdJ5E.vvpJyuioZHkG5l.PnVHZDAHHK8.fbjM399uQq',
    'teacher'::"Role", 'email'::"TypeLogin", 'teaching'::"UserStatus", FALSE, '',
    'GV1001', 'Tiến sĩ', '0987654321', 'CNTT',
    NULL, NULL, 'nguyensontung0804@gmail.com', NULL, NULL,
    NOW(), NOW()
  ),
  (
    '686ca2cf-7d13-4a28-bbe3-d3c650be9ab5',
    'TS. Trần Thị Hương', 'gv1002@school.edu.vn',
    '$2b$10$UD8e3eMhS8GLh21kcV.KwOCBRxEoD9oNg8/rNtT8iOGmM9lZMwxUW',
    'teacher'::"Role", 'email'::"TypeLogin", 'teaching'::"UserStatus", FALSE, '',
    'GV1002', 'Tiến sĩ', '0912345678', 'KTKT',
    NULL, NULL, NULL, NULL, NULL,
    NOW(), NOW()
  ),
  (
    'e1cdb705-3af5-4f53-8144-bac06d0c6861',
    'ThS. Lê Văn Hải', 'gv1003@school.edu.vn',
    '$2b$10$vdzjIZE49IIhi6etjvFS6ecOp.tf2XMdq1heGyYhsDL9Um3HfagAW',
    'teacher'::"Role", 'email'::"TypeLogin", 'teaching'::"UserStatus", FALSE, '',
    'GV1003', 'Thạc sĩ', '0934567890', 'KTXD',
    NULL, NULL, NULL, NULL, NULL,
    NOW(), NOW()
  ),
  (
    '240901b8-a093-4f61-9cb9-110dc8369e98',
    'ThS. Phạm Thị Lan', 'gv1004@school.edu.vn',
    '$2b$10$cSNNs/7lSlc8cqnqAwi4j.ZWVo/6leez/yaZSowtHInTTaKOmrWpW',
    'teacher'::"Role", 'email'::"TypeLogin", 'teaching'::"UserStatus", FALSE, '',
    'GV1004', 'Thạc sĩ', '0956789012', 'NN',
    NULL, NULL, NULL, NULL, NULL,
    NOW(), NOW()
  ),
  -- ── Sinh viên ──────────────────────────────────────────────
  (
    'a00532ec-caad-43bc-a205-a1198ad5eaf5',
    'Lê Anh Duy', '20216001@student.school.edu.vn',
    '$2b$10$9xZx4P6E0xHG4GaIcHsi..IvicAHRyoTGXeFz7rd9QTNQ0dnXCDDS',
    'student'::"Role", 'email'::"TypeLogin", 'studying'::"UserStatus", FALSE, '',
    NULL, NULL, NULL, 'CNTT',
    '20216001', 'KTPM2021A', 'laduyyyy@gmail.com', 'male'::"Gender", '2003-04-08',
    NOW(), NOW()
  ),
  (
    '378553ac-8511-47ff-acb9-bc1ba975972b',
    'Nguyễn Văn Bảo', '20216002@student.school.edu.vn',
    '$2b$10$N.vYm8azHAoT4VFdtSbJXeaUk9dUSfv0Zo9mGwOFdfkuhTDnHEG3C',
    'student'::"Role", 'email'::"TypeLogin", 'studying'::"UserStatus", FALSE, '',
    NULL, NULL, NULL, 'CNTT',
    '20216002', 'KTPM2021A', NULL, 'male'::"Gender", '2003-07-15',
    NOW(), NOW()
  ),
  (
    '27691268-d41f-4df9-a8df-a7ee2c6f1922',
    'Trần Thị Thu', '20216003@student.school.edu.vn',
    '$2b$10$o8hmb7Zne6eHWSgmGfoFpOWfbsZD97mxd3sMSPOZ9TqE0owh4n/ni',
    'student'::"Role", 'email'::"TypeLogin", 'studying'::"UserStatus", FALSE, '',
    NULL, NULL, NULL, 'CNTT',
    '20216003', 'KTPM2021A', NULL, 'female'::"Gender", '2003-02-20',
    NOW(), NOW()
  ),
  (
    'e30ba0ca-52e8-49e2-8da6-2c7fda5016ae',
    'Hoàng Minh Khoa', '20216004@student.school.edu.vn',
    '$2b$10$xcd6aAF65lSbLnUcTBmUReeifjFR0LRq.V15SkUNBqQL3tSL0rQZ2',
    'student'::"Role", 'email'::"TypeLogin", 'studying'::"UserStatus", FALSE, '',
    NULL, NULL, NULL, 'CNTT',
    '20216004', 'HTTT2021A', NULL, 'male'::"Gender", '2003-09-11',
    NOW(), NOW()
  ),
  (
    '163a7a02-233d-4c2e-85e0-ad2cc125aadb',
    'Vũ Thị Hà', '20216005@student.school.edu.vn',
    '$2b$10$sUwUFw1V/CE0YXUKIZZdb.Oi1qrLwYnYn11e3lX5oRH/HoPThv8zm',
    'student'::"Role", 'email'::"TypeLogin", 'studying'::"UserStatus", FALSE, '',
    NULL, NULL, NULL, 'NN',
    '20216005', 'TA2021A', NULL, 'female'::"Gender", '2003-06-03',
    NOW(), NOW()
  ),
  (
    '55f7f24d-19b6-4739-8580-effa53014ed7',
    'Đặng Văn Long', '20216006@student.school.edu.vn',
    '$2b$10$MSwRG6ShWk.IDGeINkd1ret.HafrGemD8YHx/cNolNNgRddaxTDn6',
    'student'::"Role", 'email'::"TypeLogin", 'studying'::"UserStatus", FALSE, '',
    NULL, NULL, NULL, 'KTKT',
    '20216006', 'KT2021A', NULL, 'male'::"Gender", '2003-12-25',
    NOW(), NOW()
  )
ON CONFLICT (email) DO UPDATE SET
  "fullName"      = EXCLUDED."fullName",
  "personalEmail" = COALESCE(EXCLUDED."personalEmail", users."personalEmail"),
  department      = EXCLUDED.department,
  class           = EXCLUDED.class,
  gender          = EXCLUDED.gender,
  "birthDay"      = EXCLUDED."birthDay",
  "updatedAt"     = NOW();

-- ────────────────────────────────────────────────────────────
-- 4. CLASSES — Lớp sinh viên (cohort / niên khóa)
-- ────────────────────────────────────────────────────────────
INSERT INTO classes (id, code, "nameClass", "teacherId", "departmentId", "createdAt", "updatedAt") VALUES
  (
    '8cc2eadf-0bd3-473a-bce1-493c5a6b8796', 'KTPM2021A', 'Kỹ thuật Phần mềm K2021 A',
    (SELECT id FROM users       WHERE email = 'gv1001@school.edu.vn'),
    (SELECT id FROM departments WHERE code  = 'CNTT'),
    NOW(), NOW()
  ),
  (
    '4434f65c-184a-44dc-a530-d29e70a6e89e', 'HTTT2021A', 'Hệ thống Thông tin K2021 A',
    (SELECT id FROM users       WHERE email = 'gv1001@school.edu.vn'),
    (SELECT id FROM departments WHERE code  = 'CNTT'),
    NOW(), NOW()
  ),
  (
    '1adb23e6-03f8-4d99-aafa-8159adac9f25', 'KT2021A', 'Kế toán K2021 A',
    (SELECT id FROM users       WHERE email = 'gv1002@school.edu.vn'),
    (SELECT id FROM departments WHERE code  = 'KTKT'),
    NOW(), NOW()
  ),
  (
    '258d5370-fed6-4505-b0d3-3020c1ac4106', 'TA2021A', 'Tiếng Anh K2021 A',
    (SELECT id FROM users       WHERE email = 'gv1004@school.edu.vn'),
    (SELECT id FROM departments WHERE code  = 'NN'),
    NOW(), NOW()
  )
ON CONFLICT (code) DO UPDATE SET
  "nameClass"    = EXCLUDED."nameClass",
  "teacherId"    = EXCLUDED."teacherId",
  "departmentId" = EXCLUDED."departmentId",
  "updatedAt"    = NOW();

-- ────────────────────────────────────────────────────────────
-- 5. SUBJECTS — Môn học
-- ────────────────────────────────────────────────────────────
INSERT INTO subjects (id, code, name, credits, "departmentId", "createdAt", "updatedAt") VALUES
  ('dc7175ab-d138-4420-a8c4-93197536e151', 'LTCB',   'Lập trình Cơ bản',               3, (SELECT id FROM departments WHERE code = 'CNTT'), NOW(), NOW()),
  ('98b63e63-1205-4dfa-b589-ee83d4d04e0d', 'CTDLGT', 'Cấu trúc Dữ liệu & Giải thuật',  3, (SELECT id FROM departments WHERE code = 'CNTT'), NOW(), NOW()),
  ('9e553d58-80e0-43df-8d07-39634687595c', 'CSDL',   'Cơ sở Dữ liệu',                  3, (SELECT id FROM departments WHERE code = 'CNTT'), NOW(), NOW()),
  ('46cced0b-261b-4dc9-b64d-8b11bbfb5a6c', 'LTWEB',  'Lập trình Web',                   3, (SELECT id FROM departments WHERE code = 'CNTT'), NOW(), NOW()),
  ('aabbb316-2682-4658-a85b-1bb014382524', 'TOARR',  'Toán Rời rạc',                    2, (SELECT id FROM departments WHERE code = 'CNTT'), NOW(), NOW()),
  ('355a26c8-4e6a-4c33-b123-51e7355707b1', 'NLKT',   'Nguyên lý Kế toán',               3, (SELECT id FROM departments WHERE code = 'KTKT'), NOW(), NOW()),
  ('9cacb4e6-f7fa-452e-ad3a-5cdb359306a4', 'KTVM',   'Kinh tế Vi mô',                   2, (SELECT id FROM departments WHERE code = 'KTKT'), NOW(), NOW()),
  ('7402da7c-d2fd-4298-bb59-c3227c3eb664', 'TA1',    'Tiếng Anh 1',                     3, (SELECT id FROM departments WHERE code = 'NN'),   NOW(), NOW()),
  ('062e183e-1c79-4a39-99e7-5e6849e2723b', 'TA2',    'Tiếng Anh 2',                     3, (SELECT id FROM departments WHERE code = 'NN'),   NOW(), NOW()),
  ('a120d476-9247-4241-9b96-4867702ac74f', 'VLXD',   'Vật liệu Xây dựng',               3, (SELECT id FROM departments WHERE code = 'KTXD'), NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
  name           = EXCLUDED.name,
  credits        = EXCLUDED.credits,
  "departmentId" = EXCLUDED."departmentId",
  "updatedAt"    = NOW();

-- ────────────────────────────────────────────────────────────
-- 6. SUBJECT_CLASSES — Lớp học phần (môn học theo học kỳ)
-- ────────────────────────────────────────────────────────────
INSERT INTO subject_classes (id, code, semester, "maxStudents", status, "subjectId", "teacherId", "createdAt", "updatedAt") VALUES
  (
    '5bac56aa-eafd-4eeb-ab40-c2ac7b490ef6', 'LTCB-HK1-2425', 'HK1 2024-2025', 45,
    'active'::"SubjectClassStatus",
    (SELECT id FROM subjects WHERE code = 'LTCB'),
    (SELECT id FROM users    WHERE email = 'gv1001@school.edu.vn'),
    NOW(), NOW()
  ),
  (
    '40aee216-127e-453d-affa-ebf3f42f61b2', 'CTDLGT-HK1-2425', 'HK1 2024-2025', 40,
    'active'::"SubjectClassStatus",
    (SELECT id FROM subjects WHERE code = 'CTDLGT'),
    (SELECT id FROM users    WHERE email = 'gv1001@school.edu.vn'),
    NOW(), NOW()
  ),
  (
    '95bea702-7297-46ee-96bf-d4339e7183fb', 'CSDL-HK2-2425', 'HK2 2024-2025', 40,
    'active'::"SubjectClassStatus",
    (SELECT id FROM subjects WHERE code = 'CSDL'),
    (SELECT id FROM users    WHERE email = 'gv1001@school.edu.vn'),
    NOW(), NOW()
  ),
  (
    'fa382324-bac4-46e3-866e-a2ca72a8a890', 'LTWEB-HK2-2425', 'HK2 2024-2025', 40,
    'active'::"SubjectClassStatus",
    (SELECT id FROM subjects WHERE code = 'LTWEB'),
    (SELECT id FROM users    WHERE email = 'gv1001@school.edu.vn'),
    NOW(), NOW()
  ),
  (
    '6de8c14b-a608-4dc5-a15b-f351d26f477a', 'TA1-HK1-2425', 'HK1 2024-2025', 30,
    'active'::"SubjectClassStatus",
    (SELECT id FROM subjects WHERE code = 'TA1'),
    (SELECT id FROM users    WHERE email = 'gv1004@school.edu.vn'),
    NOW(), NOW()
  ),
  (
    '5cc2ada5-cc23-4d31-acb9-00f1a16015bd', 'NLKT-HK1-2425', 'HK1 2024-2025', 35,
    'active'::"SubjectClassStatus",
    (SELECT id FROM subjects WHERE code = 'NLKT'),
    (SELECT id FROM users    WHERE email = 'gv1002@school.edu.vn'),
    NOW(), NOW()
  ),
  (
    '4b345856-7fae-4356-997c-17778f56ab08', 'TOARR-HK1-2324', 'HK1 2023-2024', 40,
    'completed'::"SubjectClassStatus",
    (SELECT id FROM subjects WHERE code = 'TOARR'),
    (SELECT id FROM users    WHERE email = 'gv1001@school.edu.vn'),
    NOW(), NOW()
  )
ON CONFLICT (code) DO UPDATE SET
  semester      = EXCLUDED.semester,
  "maxStudents" = EXCLUDED."maxStudents",
  status        = EXCLUDED.status,
  "subjectId"   = EXCLUDED."subjectId",
  "teacherId"   = EXCLUDED."teacherId",
  "updatedAt"   = NOW();

-- ────────────────────────────────────────────────────────────
-- 7. ENROLLMENTS — Đăng ký học phần
-- ────────────────────────────────────────────────────────────
-- DO NOTHING khi đã tồn tại để không ghi đè điểm số
INSERT INTO enrollments (
  id, "studentId", "subjectClassId",
  status, "registeredAt", "gradeLocked",
  "createdAt", "updatedAt"
) VALUES
  -- Lê Anh Duy (20216001) ──────────────────────────────────
  ('4c9075ac-a03b-4201-aacf-0f37315558a6',
   (SELECT id FROM users WHERE email = '20216001@student.school.edu.vn'),
   (SELECT id FROM subject_classes WHERE code = 'CTDLGT-HK1-2425'),
   'registered'::"EnrollmentStatus", NOW(), FALSE, NOW(), NOW()),

  ('f1502494-5dc4-4dc7-bc5a-24b09805d0c4',
   (SELECT id FROM users WHERE email = '20216001@student.school.edu.vn'),
   (SELECT id FROM subject_classes WHERE code = 'LTCB-HK1-2425'),
   'registered'::"EnrollmentStatus", NOW(), FALSE, NOW(), NOW()),

  ('d6efd59b-5efa-425d-a5c4-7fb0d1a4f38f',
   (SELECT id FROM users WHERE email = '20216001@student.school.edu.vn'),
   (SELECT id FROM subject_classes WHERE code = 'TA1-HK1-2425'),
   'registered'::"EnrollmentStatus", NOW(), FALSE, NOW(), NOW()),

  ('871f3ee5-bf64-44aa-8b5d-f60d28b735bf',
   (SELECT id FROM users WHERE email = '20216001@student.school.edu.vn'),
   (SELECT id FROM subject_classes WHERE code = 'TOARR-HK1-2324'),
   'registered'::"EnrollmentStatus", NOW(), FALSE, NOW(), NOW()),

  -- Nguyễn Văn Bảo (20216002) ──────────────────────────────
  ('f1e6fe99-a240-4c9a-817d-3b71196eafe2',
   (SELECT id FROM users WHERE email = '20216002@student.school.edu.vn'),
   (SELECT id FROM subject_classes WHERE code = 'CSDL-HK2-2425'),
   'registered'::"EnrollmentStatus", NOW(), FALSE, NOW(), NOW()),

  ('148707e4-aa05-42bc-9c15-f45efdb99b6b',
   (SELECT id FROM users WHERE email = '20216002@student.school.edu.vn'),
   (SELECT id FROM subject_classes WHERE code = 'CTDLGT-HK1-2425'),
   'registered'::"EnrollmentStatus", NOW(), FALSE, NOW(), NOW()),

  ('515b0ea4-61ee-4d88-a2d1-8ca9f87dcb62',
   (SELECT id FROM users WHERE email = '20216002@student.school.edu.vn'),
   (SELECT id FROM subject_classes WHERE code = 'LTCB-HK1-2425'),
   'registered'::"EnrollmentStatus", NOW(), FALSE, NOW(), NOW()),

  ('9a93bc6a-9cf1-4937-b1d4-b0bd385e9c4e',
   (SELECT id FROM users WHERE email = '20216002@student.school.edu.vn'),
   (SELECT id FROM subject_classes WHERE code = 'TOARR-HK1-2324'),
   'registered'::"EnrollmentStatus", NOW(), FALSE, NOW(), NOW()),

  -- Trần Thị Thu (20216003) ────────────────────────────────
  ('e636d2af-626a-431c-b37d-38134a7361d3',
   (SELECT id FROM users WHERE email = '20216003@student.school.edu.vn'),
   (SELECT id FROM subject_classes WHERE code = 'LTCB-HK1-2425'),
   'registered'::"EnrollmentStatus", NOW(), FALSE, NOW(), NOW()),

  ('c5950f06-6cb8-42fb-95a8-25172a521275',
   (SELECT id FROM users WHERE email = '20216003@student.school.edu.vn'),
   (SELECT id FROM subject_classes WHERE code = 'TA1-HK1-2425'),
   'registered'::"EnrollmentStatus", NOW(), FALSE, NOW(), NOW()),

  ('f140f05d-fd25-4fd2-9257-b79f07e77e31',
   (SELECT id FROM users WHERE email = '20216003@student.school.edu.vn'),
   (SELECT id FROM subject_classes WHERE code = 'TOARR-HK1-2324'),
   'registered'::"EnrollmentStatus", NOW(), FALSE, NOW(), NOW()),

  -- Hoàng Minh Khoa (20216004) ─────────────────────────────
  ('298e2a8a-9bcf-445d-9562-413da77964b9',
   (SELECT id FROM users WHERE email = '20216004@student.school.edu.vn'),
   (SELECT id FROM subject_classes WHERE code = 'CTDLGT-HK1-2425'),
   'registered'::"EnrollmentStatus", NOW(), FALSE, NOW(), NOW()),

  ('ddf27695-417d-4dde-8db5-17be274f3796',
   (SELECT id FROM users WHERE email = '20216004@student.school.edu.vn'),
   (SELECT id FROM subject_classes WHERE code = 'LTCB-HK1-2425'),
   'registered'::"EnrollmentStatus", NOW(), FALSE, NOW(), NOW()),

  -- Vũ Thị Hà (20216005) ──────────────────────────────────
  ('68fda09b-0dc6-474d-87b6-93581ca03b88',
   (SELECT id FROM users WHERE email = '20216005@student.school.edu.vn'),
   (SELECT id FROM subject_classes WHERE code = 'TA1-HK1-2425'),
   'registered'::"EnrollmentStatus", NOW(), FALSE, NOW(), NOW()),

  -- Đặng Văn Long (20216006) ───────────────────────────────
  ('62d2e3cf-27a7-4356-94d4-977d31e62faa',
   (SELECT id FROM users WHERE email = '20216006@student.school.edu.vn'),
   (SELECT id FROM subject_classes WHERE code = 'NLKT-HK1-2425'),
   'registered'::"EnrollmentStatus", NOW(), FALSE, NOW(), NOW())

ON CONFLICT ("studentId", "subjectClassId") DO NOTHING;

COMMIT;

-- ============================================================
-- Xác nhận kết quả
-- ============================================================
SELECT
  (SELECT COUNT(*) FROM departments)    AS departments,
  (SELECT COUNT(*) FROM branches)       AS branches,
  (SELECT COUNT(*) FROM users)          AS users,
  (SELECT COUNT(*) FROM classes)        AS classes,
  (SELECT COUNT(*) FROM subjects)       AS subjects,
  (SELECT COUNT(*) FROM subject_classes) AS subject_classes,
  (SELECT COUNT(*) FROM enrollments)    AS enrollments;
