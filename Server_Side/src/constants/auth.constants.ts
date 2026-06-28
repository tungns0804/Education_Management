// ================================================================
// Authentication & security constants
// ================================================================

// RSA key pair used to sign JWT tokens (one pair per user)
export const RSA_MODULUS_LENGTH = 2048;
export const JWT_ALGORITHM = 'RS256' as const;

// JWT token lifetimes — two representations needed:
//   string  → passed to jsonwebtoken's `expiresIn` option
//   ms (number) → passed to cookie's `maxAge`
export const ACCESS_TOKEN_EXPIRES_IN   = '15m';
export const REFRESH_TOKEN_EXPIRES_IN  = '7d';
export const ACCESS_TOKEN_MAX_AGE_MS   = 15 * 60 * 1000;           // 15 minutes
export const REFRESH_TOKEN_MAX_AGE_MS  = 7 * 24 * 60 * 60 * 1000;  // 7 days
// ApiKey row is kept until refresh token expires
export const API_KEY_TTL_MS            = REFRESH_TOKEN_MAX_AGE_MS;

// HTTP-only cookie names set after successful login
export const COOKIE_TOKEN         = 'token';
export const COOKIE_REFRESH_TOKEN = 'refreshToken';
// Non-httpOnly cookie used by the client to detect login state (JS-readable)
export const COOKIE_LOGGED        = 'logged';
export const COOKIE_LOGGED_VALUE  = '1';         // value when logged in

// TypeLogin enum value stored in the User table
export const LOGIN_TYPE_GOOGLE = 'google';

// bcrypt work-factor for hashing passwords
export const BCRYPT_SALT_ROUNDS = 10;
