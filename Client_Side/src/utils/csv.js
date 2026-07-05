/* EduManage — Tiện ích CSV: xuất file, phân tích dữ liệu import sinh viên / giảng viên */

// ============== CSV export ==============
export function downloadCSV(filename, headers, rows) {
  const esc = (v) => {
    const s = String(v == null ? '' : v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [headers.map(esc).join(',')].concat(rows.map(r => r.map(esc).join(',')));
  const csv = '\uFEFF' + lines.join('\r\n'); // BOM for Excel UTF-8
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

// ============== Import sinh viên ==============
// Cột Mã SV đã bỏ — mã được sinh tự động phía server
export const SAMPLE_CSV = `Họ tên,Giới tính,Ngày sinh,Lớp,Email cá nhân
Nguyễn Văn Khôi,Nam,12/03/2004,KTPM2021A,khoi.nv@gmail.com
Trần Thị Bình An,Nữ,28/07/2004,KTPM2021A,binhan.tt@gmail.com
Lê Hoàng Phúc,Nam,05/11/2004,KHMT2022A,phuc.lh@gmail.com
Phạm Gia Hân,Nữ,19/01/2005,HTTT2022A,han.pg@gmail.com`;

// Cột: Họ tên, Giới tính, Ngày sinh, Lớp, Email cá nhân (Mã SV tự sinh server)
export function parseCSV(text, classes = []) {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return { rows: [] };
  const header = splitLine(lines[0]);
  const looksHeader = /họ tên|full name|name/i.test(header[0]);
  const dataLines = looksHeader ? lines.slice(1) : lines;
  // Validate class codes against real classes from API (case-insensitive)
  const validClassCodes = new Set(classes.map(c => (c.code || '').toUpperCase()));
  const rows = dataLines.map((l, i) => {
    const [name, gender, dob, cls, pmail] = splitLine(l);
    const errors = [];
    if (!name || !name.trim()) errors.push('name');
    if (!pmail || !emailRe.test(pmail.trim())) errors.push('personalEmail');
    const clsCode = (cls || '').trim();
    if (validClassCodes.size > 0 && clsCode && !validClassCodes.has(clsCode.toUpperCase())) errors.push('class');
    const g = /nữ|female|f/i.test(gender || '') ? 'F' : 'M';
    return {
      i, name: (name || '').trim(), gender: g, dob: (dob || '').trim(),
      classCode: clsCode,
      personalEmail: (pmail || '').trim(), errors,
    };
  });
  return { rows };
}

// ============== Import giảng viên ==============
// Cột Mã GV đã bỏ — mã được sinh tự động phía server
export const TEACHER_SAMPLE_CSV = `Họ tên,Học hàm vị,Điện thoại,Khoa,Email cá nhân
Nguyễn Văn An,ThS,0912345678,Công nghệ Thông tin,an.nv@gmail.com
Trần Thị Bình,TS,0987654321,Kinh tế - Kế toán,binh.tt@gmail.com
Lê Minh Quân,ThS,,Kỹ thuật - Xây dựng,quan.lm@gmail.com`;

// Cột: Họ tên, Học hàm vị, Điện thoại, Khoa, Email cá nhân (Mã GV tự sinh server)
export function parseTeacherCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return { rows: [] };
  const header = splitLine(lines[0]);
  const looksHeader = /họ tên|full name|name/i.test(header[0]);
  const dataLines = looksHeader ? lines.slice(1) : lines;
  const rows = dataLines.map((l, i) => {
    const [name, degree, phone, dept, pmail] = splitLine(l);
    const errors = [];
    if (!name || !name.trim()) errors.push('name');
    if (!pmail || !emailRe.test(pmail.trim())) errors.push('personalEmail');
    return {
      i, name: name || '', degree: degree || '',
      phone: phone || '', department: dept || '', personalEmail: pmail || '',
      errors,
    };
  });
  return { rows };
}
