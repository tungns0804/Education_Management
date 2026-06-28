// ================================================================
// API / HTTP configuration constants
// ================================================================

export const API_BASE_URL   = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const API_TIMEOUT_MS = 10_000; // 10 seconds before a request is aborted

// Base path for all user-related endpoints
const USERS_BASE = '/api/users';

// Individual endpoint paths (consumed by userRequest.js)
export const API_ENDPOINTS = {
  LOGIN:            `${USERS_BASE}/login`,
  LOGOUT:           `${USERS_BASE}/logout`,
  AUTH:             `${USERS_BASE}/auth`,           // verify session & get current user
  REFRESH_TOKEN:    `${USERS_BASE}/refresh-token`,
  FORGOT_PASSWORD:  `${USERS_BASE}/forgot-password`,
  RESET_PASSWORD:   `${USERS_BASE}/reset-password`,
  CHANGE_PASSWORD:  `${USERS_BASE}/change-password`,
};
