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
// Must match the passwords set in Server_Side/src/constants/seed.constants.ts
export const DEMO_USERS = {
  [ROLE_ADMIN]: {
    email:         'admin@school.edu.vn',
    name:          'Phạm Quốc Admin',
    code:          'ADMIN',
    personalEmail: 'nguyensontung0804@gmail.com',
  },
  [ROLE_TEACHER]: {
    email: 'gv1001@school.edu.vn',
    name:  'TS. Nguyễn Văn Minh',
    code:  'GV1001',
  },
  [ROLE_STUDENT]: {
    email: '20216001@student.school.edu.vn',
    name:  'Lê Thị Mai Anh',
    code:  '20216001',
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
