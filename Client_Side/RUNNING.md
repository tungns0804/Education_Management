# Hướng dẫn chạy Client_Side

## Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---------|---------------------|
| Node.js | >= 18.x |
| npm | >= 9.x |

---

## 1. Cài đặt dependencies

```bash
cd Client_Side
npm install
```

---

## 2. Cấu hình (tuỳ chọn)

Mặc định client kết nối tới server tại `http://localhost:3000`.  
Nếu cần thay đổi, chỉnh URL trong file cấu hình axios của dự án.

Server_Side phải được cấu hình CORS với:

```env
URL_CLIENT="http://localhost:5173"
```

---

## 3. Chạy ứng dụng

### Chế độ Development

```bash
npm run dev
```

Ứng dụng mở tự động tại:

```
http://localhost:5173
```

> Nếu port 5173 đã bị chiếm, Vite tự động chuyển sang port tiếp theo (5174, 5175, ...).

### Build Production

```bash
npm run build
```

File build xuất ra thư mục `dist/`.

### Preview bản build

```bash
npm run preview
```

---

## 4. Thứ tự khởi động đúng

Để ứng dụng hoạt động đầy đủ, khởi động theo thứ tự sau:

1. **PostgreSQL** — đảm bảo database đang chạy
2. **Server_Side** — chạy `npm run start:dev` trong thư mục `Server_Side/`
3. **Client_Side** — chạy `npm run dev` trong thư mục `Client_Side/`

---

## Scripts tham khảo

| Script | Lệnh | Mô tả |
|--------|------|-------|
| Development | `npm run dev` | Chạy dev server với HMR |
| Build | `npm run build` | Tạo bản build production |
| Preview | `npm run preview` | Xem trước bản build |
