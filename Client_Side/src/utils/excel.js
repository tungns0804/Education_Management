/* EduManage — Tiện ích Excel: đọc file CSV/XLSX, sinh file mẫu import, xuất danh sách */

// Hàm hỗ trợ: đọc một File và trả về nội dung dạng text (CSV hoặc Excel)
export async function readFileAsText(file) {
  const ext = (file.name || '').split('.').pop().toLowerCase();
  if (ext === 'xlsx' || ext === 'xls') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const { read, utils } = await import('xlsx');
          const wb = read(new Uint8Array(e.target.result), { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          resolve(utils.sheet_to_csv(ws));
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsText(file, 'utf-8');
  });
}

// ============== Kiểu dáng chung cho file Excel ==============

const FONT   = 'Times New Roman';
const WHITE  = '#FFFFFF';
const MUTED  = '#64748B';
const NOTE_B = '#FFFBEB';
const NOTE_T = '#92400E';

// Bảng màu SÁNG — nền nhạt, chữ đậm màu (tông xanh dương cho sinh viên)
const STUDENT_THEME = {
  title:      '#1E3A5F',
  bannerBg:   '#DBEAFE', bannerText: '#1E3A5F',
  subBg:      '#EFF6FF', subText:    '#1D4ED8',
  headBg:     '#BFDBFE', headText:   '#1E3A5F',
  rowAlt:     '#EFF6FF', border:     '#93C5FD',
  info:       '#1D4ED8',
};

// Tông xanh ngọc cho giảng viên
const TEACHER_THEME = {
  title:      '#134E4A',
  bannerBg:   '#CCFBF1', bannerText: '#134E4A',
  subBg:      '#F0FDFA', subText:    '#0F766E',
  headBg:     '#99F6E4', headText:   '#134E4A',
  rowAlt:     '#F0FDFA', border:     '#5EEAD4',
  info:       '#0369A1',
};

// Sinh bộ hàm tạo ô theo theme: hdr (tiêu đề cột), dat (ô dữ liệu), span (dòng gộp)
function makeCells(theme, nCols) {
  const hdr = (v) => ({
    value: v, fontFamily: FONT, fontSize: 11, fontWeight: 'bold',
    color: theme.headText, backgroundColor: theme.headBg,
    align: 'center', alignVertical: 'middle',
    height: 28, borderStyle: 'thin', borderColor: theme.border,
  });
  const dat = (v, ri, center = false) => ({
    value: v,
    type: typeof v === 'number' ? Number : String,
    fontFamily: FONT, fontSize: 11,
    backgroundColor: ri % 2 === 0 ? theme.rowAlt : WHITE,
    align: center ? 'center' : 'left', alignVertical: 'middle',
    height: 20, borderStyle: 'thin', borderColor: theme.border,
  });
  const span = (v, extra = {}) => ({ value: v, span: nCols, fontFamily: FONT, ...extra });
  return { hdr, dat, span };
}

// Khối đầu trang dùng chung: tên trường, phòng ban, tiêu đề tài liệu, dòng phụ
function buildHeadRows({ span, theme, vi, deptLine, title, subLine }) {
  return [
    [span(vi ? 'HỌC VIỆN NÔNG NGHIỆP VIỆT NAM' : 'VIETNAM NATIONAL UNIVERSITY OF AGRICULTURE', {
      fontSize: 15, fontWeight: 'bold', color: theme.bannerText, backgroundColor: theme.bannerBg,
      align: 'center', alignVertical: 'middle', height: 44,
    })],
    [span(deptLine, {
      fontSize: 11, fontStyle: 'italic', color: theme.subText, backgroundColor: theme.subBg,
      align: 'center', alignVertical: 'middle', height: 24,
    })],
    [span(null, { height: 12 })],
    [span(title, {
      fontSize: 14, fontWeight: 'bold', textDecoration: 'underline', color: theme.title,
      align: 'center', alignVertical: 'middle', height: 38,
    })],
    [span(subLine, {
      fontSize: 11, fontStyle: 'italic', color: MUTED,
      align: 'center', alignVertical: 'middle', height: 22,
    })],
    [span(null, { height: 10 })],
  ];
}

const noteRow = (span, text) => [span(text, {
  fontSize: 10, fontStyle: 'italic', color: NOTE_T, backgroundColor: NOTE_B,
  align: 'left', alignVertical: 'middle', wrap: true, height: 34,
})];

const infoRow = (span, text, color) => [span(text, {
  fontSize: 10, fontStyle: 'italic', color,
  align: 'left', alignVertical: 'middle', wrap: true, height: 34,
})];

const todayStr = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

// ============== File Excel mẫu import sinh viên ==============
// Hàm build tách riêng (pure) để test được bằng Node — không đụng tới browser API
export function buildStudentTemplate(lang) {
  const vi = lang === 'vi';
  const theme = STUDENT_THEME;
  const { hdr, dat, span } = makeCells(theme, 6);

  const hdrs = vi
    ? ['STT', 'Họ và tên (*)', 'Giới tính (*)', 'Ngày sinh', 'Mã lớp (*)', 'Email cá nhân (*)']
    : ['No.', 'Full name (*)', 'Gender (*)', 'Date of birth', 'Class code (*)', 'Personal email (*)'];

  const samples = vi ? [
    [1, 'Nguyễn Văn Khôi',   'Nam', '12/03/2004', 'KTPM2021A', 'khoi.nv@gmail.com'],
    [2, 'Trần Thị Bình An',  'Nữ',  '28/07/2004', 'KTPM2021A', 'binhan.tt@gmail.com'],
    [3, 'Lê Hoàng Phúc',     'Nam', '05/11/2004', 'KHMT2022A', 'phuc.lh@gmail.com'],
    [4, 'Phạm Gia Hân',      'Nữ',  '19/01/2005', 'HTTT2022A', 'han.pg@gmail.com'],
  ] : [
    [1, 'Nguyen Van Khoi',   'Male',   '12/03/2004', 'CS2021A', 'khoi.nv@gmail.com'],
    [2, 'Tran Thi Binh An',  'Female', '28/07/2004', 'CS2021A', 'binhan.tt@gmail.com'],
    [3, 'Le Hoang Phuc',     'Male',   '05/11/2004', 'IT2022A', 'phuc.lh@gmail.com'],
    [4, 'Pham Gia Han',      'Female', '19/01/2005', 'IS2022A', 'han.pg@gmail.com'],
  ];

  const data = [
    ...buildHeadRows({ span, theme, vi,
      deptLine: vi ? 'PHÒNG ĐÀO TẠO  ·  PHÒNG CÔNG TÁC SINH VIÊN' : 'ACADEMIC AFFAIRS OFFICE  ·  STUDENT SERVICES OFFICE',
      title: vi ? 'DANH SÁCH SINH VIÊN NHẬP HỌC' : 'STUDENT ENROLLMENT LIST',
      subLine: vi
        ? 'Năm học: ____________________      Học kỳ: _____________      Khoa/Bộ môn: __________________'
        : 'Academic Year: __________________      Semester: _____________      Faculty: __________________',
    }),
    hdrs.map(h => hdr(h)),
    ...samples.map((row, ri) => [
      dat(row[0], ri, true),
      dat(row[1], ri),
      dat(row[2], ri, true),
      dat(row[3], ri, true),
      dat(row[4], ri, true),
      dat(row[5], ri),
    ]),
    [span(null, { height: 10 })],
    noteRow(span, vi
      ? '(*) Cột bắt buộc điền. Mã lớp phải khớp chính xác với mã trong hệ thống. Xóa các dòng mẫu trước khi nhập dữ liệu thực tế.'
      : '(*) Required fields. Class code must exactly match system codes (case-sensitive). Remove sample rows before importing real data.'),
    infoRow(span, vi
      ? 'ℹ  Mã sinh viên và email trường (.edu.vn) sẽ được hệ thống tự động sinh. Thông tin đăng nhập gửi về email cá nhân sau khi nhập thành công.'
      : 'ℹ  Student code and school email (.edu.vn) are auto-generated. Login credentials will be sent to personal email after successful import.', theme.info),
  ];

  const columns = [
    { width: 6 }, { width: 30 }, { width: 14 }, { width: 14 }, { width: 16 }, { width: 28 },
  ];

  const fileName = vi ? 'mau-danh-sach-sinh-vien.xlsx' : 'student-import-template.xlsx';
  return { data, columns, sheet: vi ? 'DS Sinh Viên' : 'Student List', fileName };
}

export async function generateStudentExcelTemplate(lang) {
  const { default: writeXlsxFile } = await import('write-excel-file/browser');
  const { data, columns, sheet, fileName } = buildStudentTemplate(lang);
  await writeXlsxFile(data, { columns, sheet }).toFile(fileName);
}

// ============== File Excel mẫu import giảng viên ==============
export function buildTeacherTemplate(lang) {
  const vi = lang === 'vi';
  const theme = TEACHER_THEME;
  const { hdr, dat, span } = makeCells(theme, 6);

  const hdrs = vi
    ? ['STT', 'Họ và tên (*)', 'Học hàm/học vị', 'Số điện thoại', 'Khoa', 'Email cá nhân (*)']
    : ['No.', 'Full name (*)', 'Academic degree', 'Phone number', 'Faculty', 'Personal email (*)'];

  const samples = vi ? [
    [1, 'Nguyễn Văn An',  'ThS', '0912 345 678', 'Công nghệ Thông tin',   'an.nv@gmail.com'],
    [2, 'Trần Thị Bình',  'TS',  '0987 654 321', 'Kinh tế - Kế toán',     'binh.tt@gmail.com'],
    [3, 'Lê Minh Quân',   'ThS', '',             'Kỹ thuật - Xây dựng',   'quan.lm@gmail.com'],
    [4, 'Phạm Thu Hà',    'PGS', '0901 234 567', 'Công nghệ Thông tin',   'ha.pt@gmail.com'],
  ] : [
    [1, 'Nguyen Van An',  'M.Sc.',  '0912 345 678', 'Information Technology', 'an.nv@gmail.com'],
    [2, 'Tran Thi Binh',  'Ph.D.',  '0987 654 321', 'Economics & Accounting', 'binh.tt@gmail.com'],
    [3, 'Le Minh Quan',   'M.Sc.',  '',             'Engineering',            'quan.lm@gmail.com'],
    [4, 'Pham Thu Ha',    'Assoc.', '0901 234 567', 'Information Technology', 'ha.pt@gmail.com'],
  ];

  const data = [
    ...buildHeadRows({ span, theme, vi,
      deptLine: vi ? 'PHÒNG TỔ CHỨC NHÂN SỰ  ·  PHÒNG ĐÀO TẠO' : 'HUMAN RESOURCES OFFICE  ·  ACADEMIC AFFAIRS OFFICE',
      title: vi ? 'DANH SÁCH GIẢNG VIÊN' : 'FACULTY & STAFF ROSTER',
      subLine: vi
        ? 'Năm học: ____________________      Khoa/Bộ môn: __________________________      Bậc đào tạo: _______________'
        : 'Academic Year: __________________      Faculty/Department: __________________________      Level: _______________',
    }),
    hdrs.map(h => hdr(h)),
    ...samples.map((row, ri) => [
      dat(row[0], ri, true),
      dat(row[1], ri),
      dat(row[2], ri, true),
      dat(row[3], ri, true),
      dat(row[4], ri),
      dat(row[5], ri),
    ]),
    [span(null, { height: 10 })],
    noteRow(span, vi
      ? '(*) Cột bắt buộc điền. Học hàm/học vị hợp lệ: ThS, TS, PGS, GS, CN (để trống nếu không có). Xóa các dòng mẫu trước khi nhập.'
      : '(*) Required fields. Valid degrees: M.Sc., Ph.D., Assoc., Prof., B.Sc. (leave blank if none). Remove sample rows before importing.'),
    infoRow(span, vi
      ? 'ℹ  Mã giảng viên và email trường (.edu.vn) sẽ được hệ thống tự động sinh. Thông tin đăng nhập gửi về email cá nhân sau khi nhập thành công.'
      : 'ℹ  Teacher code and school email (.edu.vn) are auto-generated. Login credentials will be sent to personal email after successful import.', theme.info),
  ];

  const columns = [
    { width: 6 }, { width: 28 }, { width: 16 }, { width: 16 }, { width: 26 }, { width: 28 },
  ];

  const fileName = vi ? 'mau-danh-sach-giang-vien.xlsx' : 'teacher-import-template.xlsx';
  return { data, columns, sheet: vi ? 'DS Giảng Viên' : 'Faculty List', fileName };
}

export async function generateTeacherExcelTemplate(lang) {
  const { default: writeXlsxFile } = await import('write-excel-file/browser');
  const { data, columns, sheet, fileName } = buildTeacherTemplate(lang);
  await writeXlsxFile(data, { columns, sheet }).toFile(fileName);
}

// ============== Xuất danh sách sinh viên ra Excel (định dạng như file mẫu) ==============
export function buildStudentsExport(students, lang) {
  const vi = lang === 'vi';
  const theme = STUDENT_THEME;
  const { hdr, dat, span } = makeCells(theme, 8);

  const hdrs = vi
    ? ['STT', 'Họ và tên', 'Mã SV', 'Giới tính', 'Ngày sinh', 'Lớp', 'Email trường', 'Trạng thái']
    : ['No.', 'Full name', 'Student code', 'Gender', 'Date of birth', 'Class', 'School email', 'Status'];

  const data = [
    ...buildHeadRows({ span, theme, vi,
      deptLine: vi ? 'PHÒNG ĐÀO TẠO  ·  PHÒNG CÔNG TÁC SINH VIÊN' : 'ACADEMIC AFFAIRS OFFICE  ·  STUDENT SERVICES OFFICE',
      title: vi ? 'DANH SÁCH SINH VIÊN' : 'STUDENT LIST',
      subLine: vi
        ? `Ngày xuất: ${todayStr()}      Tổng số: ${students.length} sinh viên`
        : `Exported: ${todayStr()}      Total: ${students.length} students`,
    }),
    hdrs.map(h => hdr(h)),
    ...students.map((s, ri) => [
      dat(ri + 1, ri, true),
      dat(s.name || '', ri),
      dat(s.code || '', ri, true),
      dat(vi ? (s.gender === 'M' ? 'Nam' : 'Nữ') : (s.gender === 'M' ? 'Male' : 'Female'), ri, true),
      dat(s.dob || '', ri, true),
      dat(s.classId || '', ri, true),
      dat(s.email || '', ri),
      dat(s.active ? (vi ? 'Hoạt động' : 'Active') : (vi ? 'Đã khóa' : 'Locked'), ri, true),
    ]),
  ];

  const columns = [
    { width: 6 }, { width: 28 }, { width: 13 }, { width: 11 },
    { width: 13 }, { width: 14 }, { width: 32 }, { width: 12 },
  ];

  const fileName = vi ? 'danh-sach-sinh-vien.xlsx' : 'student-list.xlsx';
  return { data, columns, sheet: vi ? 'DS Sinh Viên' : 'Students', fileName };
}

export async function exportStudentsExcel(students, lang) {
  const { default: writeXlsxFile } = await import('write-excel-file/browser');
  const { data, columns, sheet, fileName } = buildStudentsExport(students, lang);
  await writeXlsxFile(data, { columns, sheet }).toFile(fileName);
}

// ============== Xuất danh sách giảng viên ra Excel (định dạng như file mẫu) ==============
export function buildTeachersExport(teachers, lang) {
  const vi = lang === 'vi';
  const theme = TEACHER_THEME;
  const { hdr, dat, span } = makeCells(theme, 8);

  const hdrs = vi
    ? ['STT', 'Họ và tên', 'Mã GV', 'Học hàm/học vị', 'Khoa', 'Email trường', 'Số lớp HP', 'Trạng thái']
    : ['No.', 'Full name', 'Teacher code', 'Academic degree', 'Faculty', 'School email', 'Sections', 'Status'];

  const data = [
    ...buildHeadRows({ span, theme, vi,
      deptLine: vi ? 'PHÒNG TỔ CHỨC NHÂN SỰ  ·  PHÒNG ĐÀO TẠO' : 'HUMAN RESOURCES OFFICE  ·  ACADEMIC AFFAIRS OFFICE',
      title: vi ? 'DANH SÁCH GIẢNG VIÊN' : 'FACULTY & STAFF ROSTER',
      subLine: vi
        ? `Ngày xuất: ${todayStr()}      Tổng số: ${teachers.length} giảng viên`
        : `Exported: ${todayStr()}      Total: ${teachers.length} teachers`,
    }),
    hdrs.map(h => hdr(h)),
    ...teachers.map((tc, ri) => [
      dat(ri + 1, ri, true),
      dat(tc.name || '', ri),
      dat(tc.code || '', ri, true),
      dat(tc.degree || '', ri, true),
      dat(tc.deptName || '', ri),
      dat(tc.email || '', ri),
      dat(typeof tc.sections === 'number' ? tc.sections : (tc.sections || ''), ri, true),
      dat(tc.active ? (vi ? 'Hoạt động' : 'Active') : (vi ? 'Đã khóa' : 'Locked'), ri, true),
    ]),
  ];

  const columns = [
    { width: 6 }, { width: 26 }, { width: 13 }, { width: 15 },
    { width: 24 }, { width: 32 }, { width: 10 }, { width: 12 },
  ];

  const fileName = vi ? 'danh-sach-giang-vien.xlsx' : 'teacher-list.xlsx';
  return { data, columns, sheet: vi ? 'DS Giảng Viên' : 'Faculty', fileName };
}

export async function exportTeachersExcel(teachers, lang) {
  const { default: writeXlsxFile } = await import('write-excel-file/browser');
  const { data, columns, sheet, fileName } = buildTeachersExport(teachers, lang);
  await writeXlsxFile(data, { columns, sheet }).toFile(fileName);
}
