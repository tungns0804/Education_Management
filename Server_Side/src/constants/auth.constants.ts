// ================================================================
// Hằng số xác thực & bảo mật
// ================================================================

// Cặp khóa RSA dùng để ký JWT token (mỗi người dùng một cặp riêng)
export const RSA_MODULUS_LENGTH = 2048;
export const JWT_ALGORITHM = 'RS256' as const;

// Thời hạn JWT token — cần hai dạng biểu diễn:
//   chuỗi   → truyền vào tùy chọn `expiresIn` của jsonwebtoken
//   ms (số) → truyền vào `maxAge` của cookie
export const ACCESS_TOKEN_EXPIRES_IN   = '15m';
export const REFRESH_TOKEN_EXPIRES_IN  = '7d';
export const ACCESS_TOKEN_MAX_AGE_MS   = 15 * 60 * 1000;           // 15 phút
export const REFRESH_TOKEN_MAX_AGE_MS  = 7 * 24 * 60 * 60 * 1000;  // 7 ngày
// Bản ghi ApiKey được giữ đến khi refresh token hết hạn
export const API_KEY_TTL_MS            = REFRESH_TOKEN_MAX_AGE_MS;

// Tên các cookie httpOnly được set sau khi đăng nhập thành công
export const COOKIE_TOKEN         = 'token';
export const COOKIE_REFRESH_TOKEN = 'refreshToken';
// Cookie không httpOnly để client nhận biết trạng thái đăng nhập (JS đọc được)
export const COOKIE_LOGGED        = 'logged';
export const COOKIE_LOGGED_VALUE  = '1';         // giá trị khi đã đăng nhập

// Giá trị enum TypeLogin lưu trong bảng User
export const LOGIN_TYPE_GOOGLE = 'google';

// Hệ số bcrypt dùng để băm mật khẩu
export const BCRYPT_SALT_ROUNDS = 10;
