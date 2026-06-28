# Cơ chế Login - Education Management System

## Tổng quan kiến trúc

| Thành phần | Công nghệ |
|-----------|-----------|
| Frontend | React + Vite |
| Backend | Express.js + Node.js |
| Database | MongoDB |
| Auth method | JWT (RS256) + HttpOnly Cookies |

---

## Cấu trúc thư mục

```
Sample/
├── client/                                  # Frontend
│   └── src/
│       ├── pages/LoginUser.jsx              # Form đăng nhập
│       ├── config/
│       │   ├── axiosClient.jsx              # HTTP client + interceptors
│       │   └── UserRequest.jsx              # API wrappers
│       ├── layouts/
│       │   ├── AdminLayout.jsx
│       │   ├── StudentLayout.jsx
│       │   └── TeacherLayout.jsx
│       └── routes/index.jsx                 # Định nghĩa routes
└── server/                                  # Backend
    └── src/
        ├── auth/checkAuth.js                # Auth middleware
        ├── utils/jwt.js                     # Tạo/xác thực JWT
        ├── controller/user.controller.js    # Request handlers
        ├── services/users.service.js        # Business logic
        ├── models/
        │   ├── users.model.js               # Schema user
        │   └── apiKey.model.js              # Lưu RSA key pairs
        └── routes/users.routes.js           # Định nghĩa endpoints
```

---

## API Endpoints

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/api/users/login` | Public | Đăng nhập email/password |
| POST | `/api/users/register` | Public | Đăng ký tài khoản |
| GET | `/api/users/refresh-token` | Public | Lấy access token mới |
| POST | `/api/users/login-google` | Public | Đăng nhập Google OAuth |
| GET | `/api/users/auth` | `authUser` | Lấy thông tin user hiện tại |
| POST | `/api/users/logout` | `authUser` | Đăng xuất |
| PUT | `/api/users/update` | `authUser` | Cập nhật thông tin |
| PUT | `/api/users/change-password` | `authUser` | Đổi mật khẩu |

---

## Luồng Login đầy đủ (End-to-End)

```
[1] Frontend (LoginUser.jsx)
    └─ User nhập email + password → submit form
    └─ Gọi requestLogin() → POST /api/users/login

[2] Backend (user.controller.js → users.service.js)
    ├─ Validate: email và password không được rỗng
    ├─ Tìm user theo email trong MongoDB
    ├─ Kiểm tra typeLogin !== 'google'
    ├─ Verify password: bcrypt.compareSync(password, hash)
    ├─ Tạo/lấy RSA key pair (2048-bit) từ DB
    ├─ Sign access token  (RS256, TTL: 15 phút)
    ├─ Sign refresh token (RS256, TTL: 7 ngày)
    └─ Set 3 cookies + trả về response

[3] Frontend (LoginUser.jsx)
    ├─ Lưu user object vào localStorage
    ├─ Redirect theo role:
    │   ├─ admin   → /admin
    │   ├─ student → /student
    │   └─ teacher → /teacher
    └─ window.location.reload() để reconnect WebSocket
```

---

## Cookie Storage

Sau khi login thành công, server set 3 cookies:

| Cookie | HttpOnly | Thời hạn | Mục đích |
|--------|----------|----------|---------|
| `token` | ✅ Yes | 15 phút | Access token — JS không đọc được |
| `refreshToken` | ✅ Yes | 7 ngày | Dùng để lấy access token mới |
| `logged` | ❌ No | 7 ngày | Flag cho JS biết user đang đăng nhập |

Tất cả cookies đều có: `Secure: true` + `SameSite: Strict` (chống CSRF).

```javascript
// server/src/controller/user.controller.js
function setCookie(res, token, refreshToken) {
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 15 * 60 * 1000,           // 15 phút
    });
    res.cookie('logged', 1, {
        httpOnly: false,
        secure: true,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 ngày
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 ngày
    });
}
```

---

## RSA Key Management

Điểm đặc biệt của hệ thống: mỗi user có **1 cặp RSA key riêng** thay vì dùng chung 1 secret.

```javascript
// server/src/utils/jwt.js
const createApiKey = async (userId) => {
    const existing = await modelApiKey.findOne({ userId });
    if (existing) return existing;

    // Tạo cặp key RSA 2048-bit
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
    });

    return await modelApiKey.create({
        userId,
        publicKey:  publicKey.export({ type: 'spki',  format: 'pem' }),
        privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }),
    });
};
```

**Lợi ích:**
- Sign token bằng **private key**, verify bằng **public key**
- Khi logout → **xóa key pair khỏi DB** → token cũ vô hiệu hóa ngay lập tức
- Không thể giả mạo token của user khác

---

## Auth Middleware

```javascript
// server/src/auth/checkAuth.js

// Bảo vệ route thông thường
const authUser = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) throw new AuthFailureError('Vui lòng đăng nhập');

    const decoded = await verifyToken(token); // Verify bằng RSA public key
    req.user = decoded;
    next();
};

// Bảo vệ route admin
const authAdmin = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) throw new AuthFailureError('Bạn không có quyền truy cập');

    const decoded = await verifyToken(token);
    const user = await modelUser.findById(decoded.id);
    if (!user || !user.isAdmin) throw new AuthFailureError('Bạn không có quyền truy cập');

    req.user = decoded;
    next();
};
```

---

## Tự động Refresh Token (Axios Interceptor)

Khi access token hết hạn, frontend tự động lấy token mới — **trong suốt với user**.

```
API call → 401 Unauthorized
    │
    ├─ Check cookie "logged" còn tồn tại?
    │
    ├─ Có → Gọi GET /api/users/refresh-token
    │        ├─ Server verify refresh token
    │        ├─ Set cookie "token" mới (15 phút)
    │        └─ Retry request gốc tự động ✅
    │
    └─ Không → Xóa session → Redirect /login
```

Cơ chế **queue** ngăn nhiều request cùng lúc gọi refresh:

```javascript
// client/src/config/axiosClient.jsx
if (this.isRefreshing) {
    // Xếp hàng chờ, không gọi refresh thêm lần nữa
    return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
    }).then(() => this.axiosInstance(originalRequest));
}
```

---

## Luồng Logout

```
Frontend (layout components)
    ├─ localStorage.removeItem('user')
    ├─ Gọi POST /api/users/logout

Backend (user.controller.js)
    ├─ Xóa RSA key pair khỏi DB → token cũ không verify được nữa
    └─ Clear 3 cookies: token, refreshToken, logged

Frontend
    └─ Redirect /login
```

---

## User Model & Phân quyền

```javascript
// server/src/models/users.model.js
{
    fullName: String,
    email:    String,   // unique
    password: String,   // bcrypt hash
    role:     { type: String, enum: ['student', 'teacher', 'admin'] },
    typeLogin: String,  // 'email' | 'google'

    // Student fields
    idStudent: String,
    class:     String,

    // Teacher fields
    idTeacher: String,
    degree:    String,
    phone:     String,

    // Common
    status: { type: String, enum: ['studying', 'graduate', 'teaching', 'active', 'inactive', ...] },
}
```

**Role-based routing:**

| Role | Frontend Route | Layout |
|------|---------------|--------|
| `admin` | `/admin` | `AdminLayout` |
| `student` | `/student` | `StudentLayout` |
| `teacher` | `/teacher` | `TeacherLayout` |

---

## Google OAuth

```javascript
// server/src/services/users.service.js
async loginGoogle(credential) {
    const dataToken = jwtDecode(credential);           // Decode Google JWT
    let user = await modelUser.findOne({ email: dataToken.email });

    if (!user) {
        // Tạo tài khoản mới nếu chưa có
        user = await modelUser.create({
            email:     dataToken.email,
            fullName:  dataToken.name,
            typeLogin: 'google',
        });
    }

    // Tạo token giống flow thông thường
    await createApiKey(user._id);
    const token        = await createToken({ id: user._id });
    const refreshToken = await createRefreshToken({ id: user._id });
    return { token, refreshToken, user };
}
```

---

## Tổng kết bảo mật

| Điểm bảo mật | Giải pháp |
|-------------|-----------|
| Password storage | `bcrypt` với salt rounds 10 |
| JWT algorithm | RS256 (asymmetric — không dùng HS256) |
| Token storage | HttpOnly cookie (không bị XSS đọc) |
| CSRF protection | `SameSite: Strict` trên tất cả cookies |
| Token invalidation | Xóa RSA key trên DB khi logout |
| Token lifetime | Access 15 phút / Refresh 7 ngày |
| Google vs Email | Phân biệt qua field `typeLogin` |
| WebSocket auth | User ID từ localStorage dùng để join room |

---

## Environment Config

**Frontend** (`client/.env`):
```
VITE_API_URL="http://localhost:3000"
```

**Backend** (`server/.env`):
```
CONNECT_DB="mongodb://localhost:27017/student_management"
URL_CLIENT="http://localhost:5173"
SECRET_CRYPTO="123456"
```
