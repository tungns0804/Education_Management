// ================================================================
// API / HTTP configuration constants
// ================================================================

export const API_BASE_URL   = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const API_TIMEOUT_MS = 10_000; // 10 seconds before a request is aborted

// Base path for all user-related endpoints
const USERS_BASE = '/api/users';

// Individual endpoint paths (consumed by userRequest.js)
export const API_ENDPOINTS = {
  // ---- Auth (unauthenticated) ----
  LOGIN:           `${USERS_BASE}/login`,
  LOGOUT:          `${USERS_BASE}/logout`,
  AUTH:            `${USERS_BASE}/auth`,
  REFRESH_TOKEN:   `${USERS_BASE}/refresh-token`,
  FORGOT_PASSWORD: `${USERS_BASE}/forgot-password`,
  VERIFY_OTP:      `${USERS_BASE}/verify-otp`,
  RESET_PASSWORD:  `${USERS_BASE}/reset-password`,
  CHANGE_PASSWORD: `${USERS_BASE}/change-password`,

  // ---- User management ----
  STUDENTS:    `${USERS_BASE}/students`,
  TEACHERS:    `${USERS_BASE}/teachers`,
  BULK_IMPORT:          `${USERS_BASE}/bulk-import`,
  BULK_IMPORT_TEACHERS: `${USERS_BASE}/bulk-import-teachers`,
  USER:        (id) => `${USERS_BASE}/${id}`,
  USER_STATUS: (id) => `${USERS_BASE}/${id}/status`,

  // ---- Dashboard ----
  DASHBOARD:         '/api/dashboard',
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
};
