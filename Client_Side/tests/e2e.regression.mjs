/* ============================================================
   EduManage — E2E regression test (Playwright, không cần framework)
   Mục đích: verify các tính năng client không bị degrade sau khi
   thay đổi source (refactor cấu trúc thư mục 07/2026).

   Điều kiện chạy:
     1. PostgreSQL đang chạy, DB đã seed (npm run seed ở server_side)
     2. server_side: npm run start:dev  (port 3000)
     3. client_side: npm run dev        (port 5173)
   Cách chạy:  node tests/e2e.regression.mjs
   Kết quả:   in PASS/FAIL từng testcase; exit code 1 nếu có FAIL.
   Ảnh chụp:  tests/screenshots/
   ============================================================ */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE  = process.env.E2E_BASE_URL || 'http://localhost:5173';
const shots = new URL('./screenshots', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
mkdirSync(shots, { recursive: true });

const results = [];
const errors  = [];

const browser = await chromium.launch();
const ctx  = await browser.newContext({ viewport: { width: 1366, height: 850 } });
const page = await ctx.newPage();
page.on('console',  (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

function check(name, cond) { results.push(`${cond ? 'PASS' : 'FAIL'} — ${name}`); }

async function login(roleTab, id, pw) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.getByText(roleTab, { exact: true }).click();
  await page.getByPlaceholder(/20216001/).fill(id);
  await page.locator('input[type="password"]').fill(pw);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await page.waitForTimeout(2500);
}

async function logout() {
  await page.locator('header >> div[style*="position: relative"] button').first().click();
  await page.getByText('Đăng xuất', { exact: true }).first().click();
  await page.waitForTimeout(400);
  await page.locator('.card button', { hasText: 'Đăng xuất' }).last().click();
  await page.waitForTimeout(1500);
}

async function clickNav(label) {
  await page.locator('nav button', { hasText: label }).first().click();
  await page.waitForTimeout(1600);
}

/* ═══ TC-00x — Trang đăng nhập (chưa xác thực) ═══ */
await page.goto(BASE, { waitUntil: 'networkidle' });
check('TC-001 Trang login hiển thị heading "Đăng nhập"', await page.getByRole('heading', { name: 'Đăng nhập' }).isVisible().catch(() => false));
check('TC-002 Có 3 tab vai trò Quản lý / Giảng dạy / Học tập',
  await page.getByText('Quản lý',  { exact: true }).isVisible().catch(() => false) &&
  await page.getByText('Giảng dạy', { exact: true }).isVisible().catch(() => false) &&
  await page.getByText('Học tập',  { exact: true }).isVisible().catch(() => false));
await page.getByTitle('Language').click();
await page.waitForTimeout(300);
check('TC-003 Đổi ngôn ngữ VI→EN (heading "Sign in")', await page.getByRole('heading', { name: 'Sign in' }).isVisible().catch(() => false));
await page.getByTitle('Language').click();
const themeBefore = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
await page.getByTitle('Language').locator('xpath=following-sibling::button[1]').click();
await page.waitForTimeout(200);
const themeAfter = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
check(`TC-004 Đổi theme sáng/tối (${themeBefore}→${themeAfter})`, themeBefore !== themeAfter);
await page.getByTitle('Language').locator('xpath=following-sibling::button[1]').click();
await page.getByText('Quên mật khẩu?').click();
await page.waitForTimeout(300);
check('TC-005 Luồng quên mật khẩu mở (màn Khôi phục mật khẩu + nút Gửi mã OTP)',
  await page.getByRole('heading', { name: 'Khôi phục mật khẩu' }).isVisible().catch(() => false) &&
  await page.getByRole('button', { name: 'Gửi mã OTP' }).isVisible().catch(() => false));
await page.getByText('Quay lại đăng nhập').click();
await page.getByText('Giảng dạy', { exact: true }).click();
await page.getByPlaceholder(/20216001/).fill('abc123');
await page.getByPlaceholder(/20216001/).blur();
await page.waitForTimeout(200);
check('TC-006 Validate định dạng mã tài khoản theo vai trò (GV)', (await page.getByText(/Mã Giảng viên phải có dạng GV/).count()) > 0);
await page.screenshot({ path: shots + '/01-login.png' });

/* ═══ TC-1xx — Phân hệ ADMIN ═══ */
await login('Quản lý', 'admin', 'Admin@123');
check('TC-101 Đăng nhập Admin thành công (sidebar hiện)', await page.locator('nav').first().isVisible().catch(() => false));
check('TC-102 Dashboard: 4 thẻ thống kê', (await page.locator('.grid-stats .card').count()) === 4);
check('TC-103 Dashboard: biểu đồ SV theo khoa + tỉ lệ giới tính',
  (await page.getByText('Sinh viên theo khoa').count()) > 0 && (await page.getByText('Tỉ lệ giới tính').count()) > 0);
await page.screenshot({ path: shots + '/10-admin-dashboard.png' });
await clickNav('Sinh viên');
check('TC-104 Màn Sinh viên: bảng dữ liệu + nút Nhập/Xuất',
  (await page.locator('table').count()) > 0 &&
  (await page.getByText('Nhập dữ liệu').count()) > 0 && (await page.getByText('Xuất file').count()) > 0);
const firstRow = page.locator('tbody tr').first();
if (await firstRow.isVisible().catch(() => false)) {
  await firstRow.click();
  await page.waitForTimeout(1600);
  check('TC-105 Mở hồ sơ SV chi tiết (nút Sửa hồ sơ)', (await page.getByText('Sửa hồ sơ').count()) > 0);
}
await clickNav('Giảng viên');
check('TC-106 Màn Giảng viên render', (await page.locator('table').count()) > 0);
await clickNav('Khoa');
check('TC-107 Màn Khoa render', (await page.getByText(/bản ghi/).count()) > 0);
await clickNav('Ngành');
check('TC-108 Màn Ngành render', (await page.getByText(/bản ghi/).count()) > 0);
await clickNav('Lớp');
check('TC-109 Màn Lớp render', (await page.getByText(/bản ghi/).count()) > 0);
await clickNav('Môn học');
check('TC-110 Màn Môn học render', (await page.getByText(/Quản lý .* môn học/).count()) > 0);
await clickNav('Lớp học phần');
check('TC-111 Màn Lớp học phần render', (await page.getByText(/lớp học phần/).count()) > 0);
await clickNav('Học kỳ');
check('TC-112 Màn Học kỳ render', (await page.getByText('Quản lý học kỳ').count()) > 0);
await logout();
check('TC-113 Đăng xuất Admin về trang login', await page.getByRole('heading', { name: 'Đăng nhập' }).isVisible().catch(() => false));

/* ═══ TC-2xx — Phân hệ GIẢNG VIÊN ═══ */
await login('Giảng dạy', 'gv1001', 'Teacher@123');
check('TC-201 Đăng nhập GV thành công', await page.locator('nav').first().isVisible().catch(() => false));
await page.screenshot({ path: shots + '/20-teacher-dashboard.png' });
await clickNav('Lớp phụ trách');
check('TC-202 Màn Lớp phụ trách render', (await page.getByText(/lớp học phần|Chưa có lớp/).count()) > 0);
await clickNav('Điểm danh');
check('TC-203 Màn Điểm danh render (tab Buổi học / Lịch sử)',
  (await page.getByText('Buổi học').count()) > 0 && (await page.getByText('Lịch sử').count()) > 0);
await clickNav('Nhập điểm');
check('TC-204 Màn Nhập điểm render (công thức 10/30/60)', (await page.getByText(/10% chuyên cần/).count()) > 0);
await clickNav('Thời khóa biểu');
check('TC-205 Màn TKB giảng viên render', (await page.getByText('Lịch học trong tuần').count()) > 0);
await logout();

/* ═══ TC-3xx — Phân hệ SINH VIÊN ═══ */
await login('Học tập', '20216001', 'Student@123');
check('TC-301 Đăng nhập SV thành công', await page.locator('nav').first().isVisible().catch(() => false));
check('TC-302 Dashboard SV: hero banner + GPA', (await page.getByText('Chào mừng trở lại,').count()) > 0);
await page.screenshot({ path: shots + '/30-student-dashboard.png' });
await clickNav('Đăng ký môn');
check('TC-303 Màn Đăng ký môn render (Giỏ đăng ký)', (await page.getByText('Giỏ đăng ký').count()) > 0);
await clickNav('Thời khóa biểu');
check('TC-304 Màn TKB sinh viên render', (await page.getByText('Lịch học trong tuần').count()) > 0);
await clickNav('Bảng điểm');
check('TC-305 Màn Bảng điểm render (GPA tích lũy)', (await page.getByText('GPA tích lũy').count()) > 0);
await page.locator('header >> div[style*="position: relative"] button').first().click();
await page.getByText('Hồ sơ', { exact: true }).first().click();
await page.waitForTimeout(1200);
check('TC-306 Trang Hồ sơ cá nhân render (Đổi mật khẩu)', (await page.getByText('Đổi mật khẩu').count()) > 0);
await logout();

/* ═══ TC-900 — Lỗi console ═══ */
const realErrors = errors.filter(e => !/ERR_CONNECTION|Failed to load resource|net::|401|403|500|NetworkError/i.test(e));
check('TC-900 Không có lỗi JS console trong toàn bộ phiên', realErrors.length === 0);
if (realErrors.length) results.push('  Lỗi: ' + [...new Set(realErrors)].slice(0, 5).join(' | '));

console.log(results.join('\n'));
const failed = results.filter(r => r.startsWith('FAIL')).length;
console.log(`\n${results.length - (failed ? 1 : 0)} checks — ${failed === 0 ? 'ALL PASS ✔' : failed + ' FAILED ✘'}`);
await browser.close();
process.exit(failed ? 1 : 0);
