# Hướng dẫn chạy Server_Side

## Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---------|---------------------|
| Node.js | >= 18.x |
| npm | >= 9.x |
| PostgreSQL | >= 14 |

---

## 1. Cài đặt dependencies

```bash
cd Server_Side
npm install
```

---

## 2. Cấu hình biến môi trường

Tạo file `.env` tại thư mục `Server_Side/` (hoặc chỉnh sửa file có sẵn):

```env
# PostgreSQL Connection
DATABASE_URL="postgresql://postgres:admin12345@localhost:5432/education_management_database?schema=public"

# App
PORT=3000
NODE_ENV=development

# JWT / Auth
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Client URL (CORS)
URL_CLIENT="http://localhost:5173"
```

> **Lưu ý:** Thay `postgres`, `admin12345` và tên database khớp với cài đặt PostgreSQL của bạn.

---

## 3. Khởi tạo database

### 3a. Chạy migration (tạo bảng)

```bash
npx prisma migrate dev
```

### 3b. Seed dữ liệu mẫu (tuỳ chọn)

```bash
npm run seed
```

---

## 4. Chạy server

### Chế độ Development (hot reload)

```bash
npm run start:dev
```

### Chế độ Production

```bash
npm run build
npm run start:prod
```

### Chế độ Debug

```bash
npm run start:debug
```

---

## 5. Kiểm tra server

Sau khi khởi động, server chạy tại:

```
http://localhost:3000
```

Kiểm tra nhanh:

```bash
curl http://localhost:3000/
```

---

## Scripts tham khảo

| Script | Lệnh | Mô tả |
|--------|------|-------|
| Development | `npm run start:dev` | Chạy với hot reload |
| Production build | `npm run build` | Biên dịch TypeScript |
| Production run | `npm run start:prod` | Chạy file đã build |
| Fresh start | `npm run start:fresh` | Kill port 3000 rồi chạy dev |
| Seed DB | `npm run seed` | Nạp dữ liệu mẫu |
| Lint | `npm run lint` | Kiểm tra code style |
| Test | `npm test` | Chạy unit tests |
