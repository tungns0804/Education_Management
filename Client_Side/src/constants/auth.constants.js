// ================================================================
// Hằng số xác thực & vai trò (phía client)
// ================================================================

// ---- Khóa vai trò (viết hoa) dùng xuyên suốt frontend ------------
export const ROLE_ADMIN   = 'ADMIN';
export const ROLE_TEACHER = 'TEACHER';
export const ROLE_STUDENT = 'STUDENT';

// Ánh xạ giá trị role trong DB (chữ thường) → khóa vai trò frontend (chữ hoa)
export const DB_ROLE_MAP = {
  admin:   ROLE_ADMIN,
  teacher: ROLE_TEACHER,
  student: ROLE_STUDENT,
};

// Vai trò mặc định khi không ánh xạ được
export const DEFAULT_ROLE = ROLE_ADMIN;

// ---- Placeholder cho ô nhập mã tài khoản -------------------------
// Hiển thị trong ô mã tài khoản ở màn hình đăng nhập / quên mật khẩu.
// Dùng chung một placeholder cho mọi vai trò — server tự xác định vai trò
// từ mã tài khoản, client không cần chọn vai trò.
export const ACCOUNT_ID_PLACEHOLDER = {
  vi: 'Nhập mã tài khoản',
  en: 'Enter your account ID',
};

// ---- Tông màu avatar (HSL) — mỗi vai trò một màu riêng -----------
export const AVATAR_HUE = {
  [ROLE_ADMIN]:   215, // xanh dương
  [ROLE_TEACHER]: 160, // xanh ngọc
  [ROLE_STUDENT]: 280, // tím
};

// ---- Cấu hình OTP (mật khẩu dùng một lần) ------------------------
export const OTP_LENGTH           = 6;    // số chữ số
export const OTP_EXPIRY_SECONDS   = 300;  // đếm ngược 5 phút hiển thị trên UI
export const OTP_TIMER_INTERVAL_MS = 1000; // chu kỳ cập nhật đồng hồ đếm ngược (1 giây)

// ---- Tài khoản demo / đăng nhập nhanh (chỉ dùng khi phát triển) --
// Phải khớp với mật khẩu trong server_side/src/constants/seed.constants.ts
export const DEMO_USERS = {
  [ROLE_ADMIN]: {
    identifier:    'admin',
    name:          'Phạm Quốc Admin',
    personalEmail: 'nguyensontung0804@gmail.com',
  },
  [ROLE_TEACHER]: {
    identifier: 'gv1001',
    name:       'GV. Nguyễn Sơn Tùng',
  },
  [ROLE_STUDENT]: {
    identifier: '20216001',
    name:       'Lê Anh Duy',
  },
};

export const DEMO_PASSWORDS = {
  [ROLE_ADMIN]:   'Admin@123',
  [ROLE_TEACHER]: 'Teacher@123',
  [ROLE_STUDENT]: 'Student@123',
};

// ---- Quy tắc độ mạnh mật khẩu ------------------------------------
// Mỗi quy tắc gồm hàm kiểm tra và nhãn song ngữ.
export const PW_RULES = [
  {
    key:      'len',
    label_vi: 'Tối thiểu 8 ký tự',
    label_en: 'At least 8 characters',
    test:     (v) => v.length >= 8,
  },
  {
    key:      'upper',
    label_vi: 'Có chữ hoa (A-Z)',
    label_en: 'One uppercase (A-Z)',
    test:     (v) => /[A-Z]/.test(v),
  },
  {
    key:      'num',
    label_vi: 'Có chữ số (0-9)',
    label_en: 'One number (0-9)',
    test:     (v) => /[0-9]/.test(v),
  },
  {
    key:      'special',
    label_vi: 'Có ký tự đặc biệt (!@#$%)',
    label_en: 'One special char (!@#$%)',
    test:     (v) => /[^A-Za-z0-9]/.test(v),
  },
];
