// ================================================================
// Khóa lưu trữ trình duyệt — tên localStorage và cookie
// Mọi khóa đều có tiền tố "em_" để tránh trùng lặp.
// ================================================================

// ---- Khóa localStorage ------------------------------------------
export const LS_THEME = 'em_theme';   // 'light' | 'dark'
export const LS_LANG  = 'em_lang';    // 'vi' | 'en'

// ---- Giá trị tùy chọn mặc định ----------------------------------
export const DEFAULT_THEME = 'light';
export const DEFAULT_LANG  = 'vi';

// ---- Tên cookie (server set khi đăng nhập) ----------------------
// Phải khớp với server_side/src/constants/auth.constants.ts
export const COOKIE_LOGGED       = 'logged'; // JS đọc được, giá trị '1' khi đã đăng nhập
export const COOKIE_LOGGED_VALUE = '1';

// ---- Thông báo toast --------------------------------------------
export const TOAST_AUTO_DISMISS_MS = 3200; // thời gian toast hiển thị trước khi tự ẩn
