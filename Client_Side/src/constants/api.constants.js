// ================================================================
// Các hằng số cấu hình API / HTTP
// ================================================================

export const API_BASE_URL   = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const API_TIMEOUT_MS = 10_000; // request bị hủy sau 10 giây

// Đường dẫn gốc cho mọi endpoint liên quan đến người dùng
const USERS_BASE = '/api/users';

// Danh sách endpoint (được userRequest.js sử dụng)
export const API_ENDPOINTS = {
  // ---- Xác thực (không cần đăng nhập) ----
  LOGIN:           `${USERS_BASE}/login`,
  LOGOUT:          `${USERS_BASE}/logout`,
  AUTH:            `${USERS_BASE}/auth`,
  REFRESH_TOKEN:   `${USERS_BASE}/refresh-token`,
  FORGOT_PASSWORD: `${USERS_BASE}/forgot-password`,
  VERIFY_OTP:      `${USERS_BASE}/verify-otp`,
  RESET_PASSWORD:  `${USERS_BASE}/reset-password`,
  CHANGE_PASSWORD: `${USERS_BASE}/change-password`,

  // ---- Quản lý người dùng ----
  ME:          `${USERS_BASE}/me`,
  STUDENTS:    `${USERS_BASE}/students`,
  TEACHERS:    `${USERS_BASE}/teachers`,
  NEXT_STUDENT_ID: `${USERS_BASE}/next-student-id`,
  NEXT_TEACHER_ID: `${USERS_BASE}/next-teacher-id`,
  BULK_IMPORT:          `${USERS_BASE}/bulk-import`,
  BULK_IMPORT_TEACHERS: `${USERS_BASE}/bulk-import-teachers`,
  USER:        (id) => `${USERS_BASE}/${id}`,
  USER_STATUS: (id) => `${USERS_BASE}/${id}/status`,

  // ---- Dashboard ----
  DASHBOARD:         '/api/dashboard',
  STUDENTS_BY_DEPARTMENT: '/api/dashboard/students-by-department',
  TEACHER_DASHBOARD: '/api/dashboard/teacher',
  STUDENT_DASHBOARD: '/api/dashboard/student',

  // ---- Departments ----
  DEPARTMENTS: '/api/departments',
  DEPARTMENT:  (id) => `/api/departments/${id}`,

  // ---- Branches (Ngành) ----
  BRANCHES: '/api/branches',
  BRANCH:   (id) => `/api/branches/${id}`,

  // ---- Classes (Lớp) ----
  CLASSES: '/api/classes',
  CLASS:   (id) => `/api/classes/${id}`,

  // ---- Subjects (Môn học) ----
  SUBJECTS: '/api/subjects',
  SUBJECT:  (id) => `/api/subjects/${id}`,

  // ---- Subject Classes (Lớp học phần) ----
  SUBJECT_CLASSES: '/api/subject-classes',
  SUBJECT_CLASS:   (id) => `/api/subject-classes/${id}`,
  MY_SECTIONS:     '/api/subject-classes/my-sections',
  SECTION_ROSTER:  (id) => `/api/subject-classes/${id}/roster`,

  // ---- Attendance ----
  ATTENDANCE:        (subjectClassId) => `/api/attendance/${subjectClassId}`,
  MY_ATTENDANCE:     (subjectClassId) => `/api/attendance/my/${subjectClassId}`,
  ATTENDANCE_BULK:   '/api/attendance/bulk',
  ATTENDANCE_ONE:    (id) => `/api/attendance/${id}`,

  // ---- Enrollments ----
  MY_ENROLLMENTS:    '/api/enrollments/my',
  TRANSCRIPT:        '/api/enrollments/transcript',
  GPA_TREND:         '/api/enrollments/gpa-trend',
  GRADE_SHEET:       (subjectClassId) => `/api/enrollments/${subjectClassId}/grades`,
  GRADE_UPDATE:      (enrollmentId)   => `/api/enrollments/${enrollmentId}/grade`,
  GRADE_LOCK:        (enrollmentId)   => `/api/enrollments/${enrollmentId}/lock`,
  ENROLLMENT:        '/api/enrollments',
  DROP_ENROLLMENT:   (id) => `/api/enrollments/${id}`,

  // ---- Semesters (Học kỳ) ----
  SEMESTERS:              '/api/semesters',
  SEMESTERS_ACTIVE:       '/api/semesters/active',
  SEMESTER:               (id) => `/api/semesters/${id}`,
  SEMESTER_TOGGLE_ACTIVE: (id) => `/api/semesters/${id}/toggle-active`,
};
