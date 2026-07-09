# Chức năng chuyển giao diện Sáng/Tối (Light/Dark Theme) — client_side

## 1. Tổng quan luồng xử lý

```
[Nút bấm trên UI]          →  [Xử lý logic: AppContext]        →  [Áp dụng giao diện]
Topbar.jsx / LoginUser.jsx     AppContext.jsx (state theme)        data-theme attribute
   onClick={toggleTheme}       toggleTheme() setTheme(...)         + CSS variables trong styles.css
                                useEffect ghi localStorage
```

Toàn bộ chức năng nằm gọn trong **3 điểm**: nơi nhận sự kiện (component UI), nơi xử lý logic (context), và nơi áp dụng giao diện (CSS biến `--*` theo `data-theme`).

## 2. Nơi nhận sự kiện (UI — bắt onClick)

Có **2 nơi** trong giao diện đặt nút bật/tắt theme, cả hai đều gọi cùng một hàm `toggleTheme` lấy từ `useApp()`:

- **Topbar (khi đã đăng nhập)** — [client_side/src/components/shell.jsx:69-96](client_side/src/components/shell.jsx#L69-L96)
  ```jsx
  const { t, lang, toggleLang, theme, toggleTheme } = useApp();
  ...
  <button className="btn btn-icon btn-sm btn-ghost" onClick={toggleTheme}>
    {theme === 'light' ? <I.moon size={18}/> : <I.sun size={18}/>}
  </button>
  ```
  Icon đổi theo trạng thái hiện tại: đang sáng thì hiện icon mặt trăng (bấm để chuyển sang tối), đang tối thì hiện icon mặt trời.

- **Màn hình đăng nhập (chưa đăng nhập)** — [client_side/src/pages/login/LoginUser.jsx:203-208](client_side/src/pages/login/LoginUser.jsx#L203-L208)
  ```jsx
  <button className="btn btn-icon btn-sm btn-ghost" onClick={toggleTheme}>
    {theme === 'light' ? <I.moon size={17} /> : <I.sun size={17} />}
  </button>
  ```
  Cùng logic, đặt ở góc trên-phải của card đăng nhập, cạnh nút đổi ngôn ngữ.

Cả hai nút này chỉ là **nơi phát sự kiện** — không chứa logic, chỉ gọi hàm `toggleTheme` được cung cấp bởi context.

## 3. Nơi xử lý logic (AppContext)

File: [client_side/src/context/AppContext.jsx](client_side/src/context/AppContext.jsx)

```jsx
function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(LS_THEME) || DEFAULT_THEME);
  ...
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(LS_THEME, theme);
  }, [theme]);
  ...
  const val = {
    theme, setTheme, ...
    toggleTheme: () => setTheme(x => x === 'light' ? 'dark' : 'light'),
  };
  return <AppCtx.Provider value={val}>{children}</AppCtx.Provider>;
}
```

Chi tiết logic:
1. **Khởi tạo state**: `theme` đọc từ `localStorage` (key `em_theme`), nếu chưa có thì dùng `DEFAULT_THEME = 'light'`.
2. **toggleTheme()**: đảo giá trị `'light' ↔ 'dark'` bằng `setTheme`.
3. **useEffect** (chạy mỗi khi `theme` đổi):
   - Set thuộc tính `data-theme="light"|"dark"` lên thẻ `<html>` (`document.documentElement`) — đây là "cầu nối" giữa React state và CSS.
   - Ghi lại giá trị vào `localStorage` để lưu lựa chọn của người dùng qua các lần tải trang.
4. Context `AppCtx` cung cấp `{ theme, setTheme, toggleTheme }` (cùng với `lang`, `t`, `tn` cho i18n) cho toàn bộ cây component thông qua hook `useApp()`.

**Provider được mount** ở gốc ứng dụng: [client_side/src/App.jsx:40-49](client_side/src/App.jsx#L40-L49) — `<AppProvider>` bọc ngoài cùng, nên `theme` là state toàn cục, không phụ thuộc route/role.

## 4. Nơi xử lý giao diện (CSS variables)

File: [client_side/src/styles.css](client_side/src/styles.css)

- **Bộ biến mặc định (giao diện sáng)** khai báo trong `:root` (dòng 6-53): `--bg`, `--surface`, `--surface-2/3`, `--sidebar`, `--border`, `--text`, `--muted`, `--shadow-*`, v.v.
- **Bộ biến ghi đè cho giao diện tối** khai báo trong selector `[data-theme="dark"]` (dòng 55-82) — override cùng tên biến với giá trị màu tối hơn.

```css
:root { --bg: #F5F7FA; --surface: #FFFFFF; --text: #16202E; ... }
[data-theme="dark"] { --bg: #0D141F; --surface: #141E2C; --text: #E7ECF3; ... }
```

Vì `AppContext` set `data-theme` lên `<html>`, và mọi component trong toàn app dùng `style={{ background: 'var(--surface)', color: 'var(--text)', ... }}` (inline style tham chiếu biến CSS) thay vì hard-code màu, nên **toàn bộ giao diện đổi màu tức thời** khi `data-theme` đổi — không cần re-render logic đặc biệt ở từng component.

Ví dụ dùng biến trong component: `shell.jsx` (Sidebar, Topbar) dùng `var(--sidebar)`, `var(--surface)`, `var(--border)`, `var(--accent)`...; `charts.jsx` (SVG charts) cũng đọc biến CSS để "theme-aware" khi vẽ biểu đồ.

## 5. Persist & khởi tạo (localStorage)

File: [client_side/src/constants/storage.constants.js](client_side/src/constants/storage.constants.js)

```js
export const LS_THEME = 'em_theme';      // key localStorage: 'light' | 'dark'
export const DEFAULT_THEME = 'light';    // giá trị mặc định khi chưa có lựa chọn
```

- Key `em_theme` là namespace riêng của EduManage trong `localStorage`.
- Lựa chọn theme được lưu **độc lập với đăng nhập** — không mất khi logout, không đồng bộ qua server (chỉ lưu ở trình duyệt).

## 6. Tóm tắt bảng ánh xạ

| Vai trò | File | Vị trí |
|---|---|---|
| Nhận sự kiện (nút bấm) | `components/shell.jsx` (Topbar) | dòng 69-96 |
| Nhận sự kiện (nút bấm) | `pages/login/LoginUser.jsx` | dòng 203-208 |
| Xử lý logic (state + persist) | `context/AppContext.jsx` | toàn file |
| Định nghĩa key/giá trị mặc định | `constants/storage.constants.js` | dòng 7, 11 |
| Áp dụng giao diện (CSS variables) | `styles.css` | `:root` (6-53), `[data-theme="dark"]` (55-82) |
| Mount provider toàn cục | `App.jsx` | dòng 40-49 |
| Icon hiển thị theo trạng thái | `components/icons.jsx` | `I.sun`, `I.moon` |

## 7. Ghi chú thêm

- **Không có URL/route riêng** cho theme — đây là state UI thuần túy trong React Context, không đi qua `routes/index.jsx`.
- **Không gọi API** — theme là preference phía client hoàn toàn, không lưu ở database/server.
- **Không có bảo vệ "flash of wrong theme"**: `data-theme` chỉ được set sau khi React mount và `useEffect` chạy, nên nếu người dùng chọn dark mode, có thể thấy nháy giao diện sáng trong tích tắc lúc tải trang (chưa có script inline trong `index.html` để set `data-theme` trước khi React hydrate).
- Cùng cơ chế Context này (`AppContext`) còn quản lý luôn **ngôn ngữ** (`lang`, `toggleLang`, `t()` i18n) — theme và ngôn ngữ dùng chung một provider, cùng pattern (state + localStorage + toggle function).
- Toàn bộ chức năng chỉ có ~15 dòng logic thật sự (trong `AppContext.jsx`), phần còn lại là CSS variables — thiết kế theo hướng "theme là dữ liệu CSS, không phải logic component".
