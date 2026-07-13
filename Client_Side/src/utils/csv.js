/* EduManage — Tiện ích CSV: xuất file, phân tích dữ liệu import sinh viên / giảng viên */

// ============== Xuất CSV ==============
export function downloadCSV(filename, headers, rows) {
  const esc = (v) => {
    const s = String(v == null ? '' : v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [headers.map(esc).join(',')].concat(rows.map(r => r.map(esc).join(',')));
  const csv = '\uFEFF' + lines.join('\r\n'); // BOM để Excel nhận đúng UTF-8
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// ============== CSV parse — dùng chung ==============
// Tách một dòng CSV, hỗ trợ giá trị bọc trong dấu nháy kép
const splitLine = (l) => {
  const out = []; let cur = '', inQ = false;
  for (let i = 0; i < l.length; i++) {
    const c = l[i];
    if (c === '"') inQ = !inQ;
    else if (c === ',' && !inQ) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out.map(s => s.trim());
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Chuẩn hóa ngày sinh dd/mm/yyyy → yyyy-mm-dd (new Date() phía server hiểu
// chuỗi dd/mm theo kiểu Mỹ mm/dd nên phải đổi sang ISO trước khi gửi)
const normalizeDob = (s) => {
  const v = (s || '').trim();
  const m = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/.exec(v);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return v;
};

// Nhận diện ô tiêu đề cột "Họ tên" — dùng để tìm dòng header trong file
const NAME_HDR = /họ\s*(và\s*)?tên|full\s*name|^name\b/i;

// Tách text thành bảng ô 2 chiều
const toTable = (text) => text.trim().split(/\r?\n/).map(splitLine);

// Tìm dòng tiêu đề cột và ánh xạ tên cột → chỉ số cột.
// File Excel mẫu có banner phía trên, cột STT ở đầu và ghi chú phía dưới,
// nên không thể dựa vào vị trí cố định — phải dò theo tên tiêu đề.
function findColumns(table, fields) {
  for (let i = 0; i < table.length; i++) {
    const cells = table[i];
    const nameIdx = cells.findIndex(c => NAME_HDR.test(c));
    if (nameIdx === -1) continue;
    const map = { name: nameIdx };
    for (const [key, re] of Object.entries(fields)) {
      const idx = cells.findIndex((c, j) => j !== nameIdx && re.test(c));
      if (idx !== -1) map[key] = idx;
    }
    return { headerIndex: i, map };
  }
  return null;
}

// ============== Import sinh viên ==============
// Cột Mã SV đã bỏ — mã được sinh tự động phía server
export const SAMPLE_CSV = `Họ tên,Giới tính,Ngày sinh,Lớp,Email cá nhân
Nguyễn Văn Khôi,Nam,12/03/2004,KTPM2021A,khoi.nv@gmail.com
Trần Thị Bình An,Nữ,28/07/2004,KTPM2021A,binhan.tt@gmail.com
Lê Hoàng Phúc,Nam,05/11/2004,KHMT2022A,phuc.lh@gmail.com
Phạm Gia Hân,Nữ,19/01/2005,HTTT2022A,han.pg@gmail.com`;

// Cột: Họ tên, Giới tính, Ngày sinh, Lớp, Email cá nhân (Mã SV tự sinh server)
// Hỗ trợ cả file Excel mẫu (có banner, cột STT, ghi chú) lẫn CSV dán tay.
export function parseCSV(text, classes = []) {
  const table = toTable(text);
  if (!table.length) return { rows: [] };
  const found = findColumns(table, {
    gender:        /giới\s*tính|gender/i,
    dob:           /ngày\s*sinh|birth|dob/i,
    class:         /lớp|class/i,
    personalEmail: /email/i,
  });
  // Có header → map theo tên cột; không có → thứ tự cột cũ (dán tay không header)
  const map = found ? found.map : { name: 0, gender: 1, dob: 2, class: 3, personalEmail: 4 };
  const dataRows = found ? table.slice(found.headerIndex + 1) : table;
  // Kiểm tra mã lớp so với danh sách lớp thật từ API (không phân biệt hoa thường)
  const validClassCodes = new Set(classes.map(c => (c.code || '').toUpperCase()));
  const rows = [];
  for (const cells of dataRows) {
    const get = (k) => (map[k] != null ? (cells[map[k]] || '') : '').trim();
    const name = get('name'), gender = get('gender'), cls = get('class'), pmail = get('personalEmail');
    const dob = normalizeDob(get('dob'));
    // Bỏ qua dòng trống / trang trí / ghi chú của file mẫu (mọi cột dữ liệu đều rỗng)
    if (!name && !gender && !dob && !cls && !pmail) continue;
    const errors = [];
    if (!name) errors.push('name');
    if (!pmail || !emailRe.test(pmail)) errors.push('personalEmail');
    if (validClassCodes.size > 0 && cls && !validClassCodes.has(cls.toUpperCase())) errors.push('class');
    if (dob && isNaN(new Date(dob).getTime())) errors.push('dob');
    rows.push({
      i: rows.length, name, gender: /nữ|female|f/i.test(gender) ? 'F' : 'M',
      dob, classCode: cls, personalEmail: pmail, errors,
    });
  }
  return { rows };
}

// ============== Import giảng viên ==============
// Cột Mã GV đã bỏ — mã được sinh tự động phía server
export const TEACHER_SAMPLE_CSV = `Họ tên,Học hàm vị,Điện thoại,Khoa,Email cá nhân
Nguyễn Văn An,ThS,0912345678,Công nghệ Thông tin,an.nv@gmail.com
Trần Thị Bình,TS,0987654321,Kinh tế - Kế toán,binh.tt@gmail.com
Lê Minh Quân,ThS,,Kỹ thuật - Xây dựng,quan.lm@gmail.com`;

// Cột: Họ tên, Học hàm vị, Điện thoại, Khoa, Email cá nhân (Mã GV tự sinh server)
// Hỗ trợ cả file Excel mẫu (có banner, cột STT, ghi chú) lẫn CSV dán tay.
export function parseTeacherCSV(text) {
  const table = toTable(text);
  if (!table.length) return { rows: [] };
  const found = findColumns(table, {
    degree:        /học\s*hàm|học\s*vị|degree/i,
    phone:         /điện\s*thoại|phone/i,
    department:    /khoa|faculty|department/i,
    personalEmail: /email/i,
  });
  const map = found ? found.map : { name: 0, degree: 1, phone: 2, department: 3, personalEmail: 4 };
  const dataRows = found ? table.slice(found.headerIndex + 1) : table;
  const rows = [];
  for (const cells of dataRows) {
    const get = (k) => (map[k] != null ? (cells[map[k]] || '') : '').trim();
    const name = get('name'), degree = get('degree'), phone = get('phone');
    const dept = get('department'), pmail = get('personalEmail');
    // Bỏ qua dòng trống / trang trí / ghi chú của file mẫu
    if (!name && !degree && !phone && !dept && !pmail) continue;
    const errors = [];
    if (!name) errors.push('name');
    if (!pmail || !emailRe.test(pmail)) errors.push('personalEmail');
    rows.push({
      i: rows.length, name, degree, phone, department: dept,
      personalEmail: pmail, errors,
    });
  }
  return { rows };
}
