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
  BULK_IMPORT: `${USERS_BASE}/bulk-import`,
  USER:        (id) => `${USERS_BASE}/${id}`,
  USER_STATUS: (id) => `${USERS_BASE}/${id}/status`,

  // ---- Dashboard ----
  DASHBOARD: '/api/dashboard',

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
};
