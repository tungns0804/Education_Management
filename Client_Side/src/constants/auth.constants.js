// ================================================================
// Authentication & role constants (client-side)
// ================================================================

// ---- Role keys (uppercase) used throughout the frontend ----------
export const ROLE_ADMIN   = 'ADMIN';
export const ROLE_TEACHER = 'TEACHER';
export const ROLE_STUDENT = 'STUDENT';

// Maps DB role value (lowercase) → frontend role key (uppercase)
export const DB_ROLE_MAP = {
  admin:   ROLE_ADMIN,
  teacher: ROLE_TEACHER,
  student: ROLE_STUDENT,
};

// Fallback role when mapping is unknown
export const DEFAULT_ROLE = ROLE_ADMIN;

// ---- Account ID pattern per role ---------------------------------
// Used to make sure the account ID entered actually matches the role
// option currently selected on the login screen (admin / teacher / student),
// so switching the role tab after typing an ID for another role is rejected
// instead of silently logging in.
export const ROLE_ID_PATTERNS = {
  [ROLE_ADMIN]: {
    test:     (v) => v.trim().toLowerCase() === 'admin',
    label_vi: 'Mã tài khoản Quản trị phải là "admin"',
    label_en: 'Admin account ID must be "admin"',
  },
  [ROLE_TEACHER]: {
    test:     (v) => /^gv\d+$/i.test(v.trim()),
    label_vi: 'Mã Giảng viên phải có dạng GV kèm số (VD: GV1001)',
    label_en: 'Teacher ID must be "GV" followed by digits (e.g. GV1001)',
  },
  [ROLE_STUDENT]: {
    test:     (v) => /^(sv)?\d{4,}$/i.test(v.trim()),
    label_vi: 'Mã Sinh viên phải là dãy số (VD: 20216001)',
    label_en: 'Student ID must be numeric (e.g. 20216001)',
  },
};

// ---- Avatar hue (HSL) — gives each role a distinct color --------
export const AVATAR_HUE = {
  [ROLE_ADMIN]:   215, // blue
  [ROLE_TEACHER]: 160, // teal
  [ROLE_STUDENT]: 280, // purple
};

// ---- OTP (one-time password) settings ---------------------------
export const OTP_LENGTH           = 6;    // digits
export const OTP_EXPIRY_SECONDS   = 300;  // 5 minutes countdown shown in UI
export const OTP_TIMER_INTERVAL_MS = 1000; // how often the countdown ticks (1 s)

// ---- Demo / quick-login credentials (development only) ----------
// Must match the passwords set in server_side/src/constants/seed.constants.ts
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

// ---- Password strength rules ------------------------------------
// Each rule has a test function and bilingual labels.
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
