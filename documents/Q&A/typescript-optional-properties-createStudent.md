# Dấu `?` trong tham số `data` của `createStudent()` — server_side

## 1. Câu hỏi

Trong [users.service.ts:180-187](server_side/src/users/users.service.ts#L180-L187), hàm tạo mới sinh viên có kiểu tham số:

```ts
async createStudent(data: {
  fullName: string;
  gender?: string;
  birthDay?: string;
  class?: string;
  personalEmail?: string;
  department?: string;
}) {
```

`fullName` không có dấu `?`, còn `gender`, `birthDay`, `class`, `personalEmail`, `department` đều có. Dấu `?` này có ý nghĩa gì?

## 2. Trả lời ngắn gọn

Đây là **optional property marker** — cú pháp chuẩn của TypeScript để đánh dấu một thuộc tính trong object type là **không bắt buộc**.

- `key: Type` → bắt buộc phải truyền, thiếu là lỗi biên dịch (compile-time error).
- `key?: Type` → tương đương `key: Type | undefined`, được phép bỏ qua khi tạo object mà TypeScript không báo lỗi.

Vì vậy:

| Thuộc tính | Bắt buộc theo type? | Ý nghĩa |
|---|---|---|
| `fullName` | **Có** | Bắt buộc — thiếu thì code không biên dịch được |
| `gender`, `birthDay`, `class`, `personalEmail`, `department` | Không | Tùy chọn — có thể bỏ qua ở compile-time |

## 3. Vì sao `fullName` không có `?` mà các trường khác có?

`fullName` là dữ liệu tối thiểu để tạo một tài khoản sinh viên — không có họ tên thì không có gì để lưu, nên được ép buộc ngay ở tầng kiểu dữ liệu (type-level).

Các trường còn lại được coi là có thể bổ sung sau (qua chức năng cập nhật hồ sơ), nên hàm cho phép tạo tài khoản mà chưa cần đầy đủ:
- `gender`, `birthDay` — thông tin cá nhân, có thể cập nhật sau.
- `class` — sinh viên có thể chưa được xếp lớp tại thời điểm tạo tài khoản.
- `department` — không bắt buộc truyền trực tiếp vì có thể **suy ra tự động** từ `class` (xem mục 4).
- `personalEmail` — optional ở type, nhưng bị ép buộc bắt buộc bằng kiểm tra runtime riêng (xem mục 5).

## 4. `class` → `department`: optional nhưng có logic tự suy luận

[users.service.ts:134-141](server_side/src/users/users.service.ts#L134-L141):

```ts
private async resolveDepartmentByClass(classCode?: string | null): Promise<string | undefined> {
  if (!classCode) return undefined;
  const cls = await this.prisma.class.findUnique({
    where: { code: classCode },
    select: { branch: { select: { department: { select: { code: true } } } } },
  });
  return cls?.branch?.department?.code;
}
```

Trong `createStudent()`, dòng 201:

```ts
const department = (await this.resolveDepartmentByClass(data.class)) ?? data.department;
```

Thứ tự ưu tiên:
1. Nếu có `data.class` và lớp đó tra được khoa (qua chuỗi quan hệ `Class → Branch → Department`) → dùng khoa suy ra từ lớp.
2. Nếu không (chưa có `class`, hoặc lớp không map ra được khoa) → fallback dùng `data.department` được truyền trực tiếp.
3. Nếu cả hai đều không có → `department` là `undefined`.

Đây là lý do cả `class` và `department` đều để optional: hệ thống ưu tiên suy luận tự động, chỉ cần truyền tay khi cần override hoặc chưa xếp lớp.

## 5. Vì sao `personalEmail` optional ở type nhưng vẫn "bắt buộc" trên thực tế?

[users.service.ts:188-189](server_side/src/users/users.service.ts#L188-L189):

```ts
if (!data.personalEmail)
  throw new BadRequestException('Vui lòng cung cấp email cá nhân của sinh viên');
```

**Điểm mấu chốt**: dấu `?` của TypeScript chỉ hoạt động ở **compile-time** (kiểm tra lúc viết/biên dịch code) — nó không thể diễn đạt các ràng buộc nghiệp vụ (business rule) như "trường này bắt buộc phải có giá trị khi gọi API".

Vì `personalEmail` là nơi hệ thống gửi mật khẩu tạm ([users.service.ts:219-225](server_side/src/users/users.service.ts#L219-L225) gọi `emailService.sendAccountCredentials`), nó thực sự bắt buộc về mặt nghiệp vụ. Nhưng do type được viết optional (`personalEmail?: string`), TypeScript không tự chặn được trường hợp thiếu — nên dev phải tự thêm một câu lệnh `if` để kiểm tra ở **runtime** (lúc chương trình thực sự chạy) và ném lỗi `BadRequestException` (HTTP 400) nếu thiếu.

→ Đây là ví dụ điển hình cho việc **type system không thay thế được validation runtime**: type chỉ đảm bảo đúng "hình dạng" dữ liệu (có trường gì, kiểu gì), còn logic nghiệp vụ (trường nào thực sự bắt buộc, giá trị có hợp lệ không...) vẫn phải tự code kiểm tra.

## 6. Tóm tắt bảng ánh xạ

| Trường | Optional theo type? | Bắt buộc trên thực tế? | Cơ chế enforce |
|---|---|---|---|
| `fullName` | Không | Có | TypeScript compile-time |
| `personalEmail` | Có | Có | `if (!data.personalEmail) throw ...` — runtime, dòng 188-189 |
| `class` | Có | Không | Không bắt buộc — dùng để suy `department` |
| `department` | Có | Không | Fallback khi không suy được từ `class`, dòng 201 |
| `gender`, `birthDay` | Có | Không | Có thể cập nhật sau qua chức năng hồ sơ |

## 7. Ghi chú thêm

- Cùng pattern này lặp lại ở `createTeacher()` ([users.service.ts:229-237](server_side/src/users/users.service.ts#L229-L237)): `fullName` bắt buộc theo type, `personalEmail` optional theo type nhưng có check runtime tương tự ở dòng 238-239.
- Quy tắc chung khi đọc code TypeScript trong dự án: **đừng chỉ nhìn dấu `?` để kết luận trường đó "không quan trọng"** — luôn kiểm tra thêm phần thân hàm (function body) xem có validation runtime bổ sung hay không, vì type chỉ là một lớp bảo vệ, không phải toàn bộ business logic.
