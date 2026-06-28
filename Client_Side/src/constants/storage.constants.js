// ================================================================
// Browser storage keys — localStorage and cookie names
// All keys use the "em_" namespace prefix to avoid collisions.
// ================================================================

// ---- localStorage keys -----------------------------------------
export const LS_THEME = 'em_theme';   // 'light' | 'dark'
export const LS_LANG  = 'em_lang';    // 'vi' | 'en'

// ---- Default preference values ---------------------------------
export const DEFAULT_THEME = 'light';
export const DEFAULT_LANG  = 'vi';

// ---- Cookie names (set by the server on login) -----------------
// Must match server_side/src/constants/auth.constants.ts
export const COOKIE_LOGGED       = 'logged'; // JS-readable, value '1' when logged in
export const COOKIE_LOGGED_VALUE = '1';

// ---- Toast notification -----------------------------------------
export const TOAST_AUTO_DISMISS_MS = 3200; // how long a toast stays visible
