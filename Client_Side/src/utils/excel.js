/* EduManage — Tiện ích Excel: đọc file CSV/XLSX, sinh file mẫu import */

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

// ============== File Excel mẫu import sinh viên ==============
export async function generateStudentExcelTemplate(lang) {
  const { default: writeXlsxFile } = await import('write-excel-file/browser');
  const vi = lang === 'vi';

  const NAVY   = '#1E3A5F';
  const BLUE   = '#2F6FED';
  const COL_H  = '#003478';
  const WHITE  = '#FFFFFF';
  const ROW_A  = '#EBF2FF';
  const NOTE_B = '#FFFBEB';
  const NOTE_T = '#92400E';
  const INFO_T = '#1D4ED8';
  const MUTED  = '#64748B';
  const BORD   = '#B0C4DE';
  const FONT   = 'Times New Roman';

  const hdr = (v, extra = {}) => ({
    value: v, fontFamily: FONT, fontSize: 11, fontWeight: 'bold',
    color: WHITE, backgroundColor: COL_H, align: 'center', alignVertical: 'middle',
    height: 28, borderStyle: 'thin', borderColor: COL_H, ...extra,
  });
  const dat = (v, ri, center = false) => ({
    value: v,
    type: typeof v === 'number' ? Number : String,
    fontFamily: FONT, fontSize: 11,
    backgroundColor: ri % 2 === 0 ? ROW_A : WHITE,
    align: center ? 'center' : 'left', alignVertical: 'middle',
    height: 20, borderStyle: 'thin', borderColor: BORD,
  });
  const span6 = (v, extra = {}) => ({ value: v, span: 6, fontFamily: FONT, ...extra });

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
    // Dòng 1 — tên trường
    [span6(vi ? 'TRƯỜNG ĐẠI HỌC KHOA HỌC VÀ CÔNG NGHỆ VIỆT NAM' : 'VIETNAM UNIVERSITY OF SCIENCE AND TECHNOLOGY', {
      fontSize: 15, fontWeight: 'bold', color: WHITE, backgroundColor: NAVY,
      align: 'center', alignVertical: 'middle', height: 44,
    })],
    // Dòng 2 — phòng ban
    [span6(vi ? 'PHÒNG ĐÀO TẠO  ·  PHÒNG CÔNG TÁC SINH VIÊN' : 'ACADEMIC AFFAIRS OFFICE  ·  STUDENT SERVICES OFFICE', {
      fontSize: 11, fontStyle: 'italic', color: WHITE, backgroundColor: BLUE,
      align: 'center', alignVertical: 'middle', height: 24,
    })],
    // Dòng 3 — dòng trống ngăn cách
    [span6(null, { height: 12 })],
    // Dòng 4 — tiêu đề tài liệu
    [span6(vi ? 'DANH SÁCH SINH VIÊN NHẬP HỌC' : 'STUDENT ENROLLMENT LIST', {
      fontSize: 14, fontWeight: 'bold', textDecoration: 'underline', color: NAVY,
      align: 'center', alignVertical: 'middle', height: 38,
    })],
    // Dòng 5 — dòng điền năm học / học kỳ
    [span6(vi
      ? 'Năm học: ____________________      Học kỳ: _____________      Khoa/Bộ môn: __________________'
      : 'Academic Year: __________________      Semester: _____________      Faculty: __________________', {
      fontSize: 11, fontStyle: 'italic', color: MUTED,
      align: 'center', alignVertical: 'middle', height: 22,
    })],
    // Dòng 6 — dòng trống ngăn cách
    [span6(null, { height: 10 })],
    // Dòng 7 — tiêu đề các cột
    hdrs.map(h => hdr(h)),
    // Dòng 8-11 — dữ liệu mẫu
    ...samples.map((row, ri) => [
      dat(row[0], ri, true),
      dat(row[1], ri),
      dat(row[2], ri, true),
      dat(row[3], ri, true),
      dat(row[4], ri, true),
      dat(row[5], ri),
    ]),
    // Dòng 12 — dòng trống ngăn cách
    [span6(null, { height: 10 })],
    // Dòng 13 — ghi chú cột bắt buộc
    [span6(vi
      ? '(*) Cột bắt buộc điền. Mã lớp phải khớp chính xác với mã trong hệ thống. Xóa các dòng mẫu trước khi nhập dữ liệu thực tế.'
      : '(*) Required fields. Class code must exactly match system codes (case-sensitive). Remove sample rows before importing real data.', {
      fontSize: 10, fontStyle: 'italic', color: NOTE_T, backgroundColor: NOTE_B,
      align: 'left', alignVertical: 'middle', wrap: true, height: 34,
    })],
    // Dòng 14 — ghi chú về dữ liệu tự sinh
    [span6(vi
      ? 'ℹ  Mã sinh viên và email trường (.edu.vn) sẽ được hệ thống tự động sinh. Thông tin đăng nhập gửi về email cá nhân sau khi nhập thành công.'
      : 'ℹ  Student code and school email (.edu.vn) are auto-generated. Login credentials will be sent to personal email after successful import.', {
      fontSize: 10, fontStyle: 'italic', color: INFO_T,
      align: 'left', alignVertical: 'middle', wrap: true, height: 34,
    })],
  ];

  const columns = [
    { width: 6 }, { width: 30 }, { width: 14 }, { width: 14 }, { width: 16 }, { width: 28 },
  ];

  const fileName = vi ? 'mau-danh-sach-sinh-vien.xlsx' : 'student-import-template.xlsx';
  await writeXlsxFile(data, { columns, sheet: vi ? 'DS Sinh Viên' : 'Student List' }).toFile(fileName);
}

// ============== File Excel mẫu import giảng viên ==============
export async function generateTeacherExcelTemplate(lang) {
  const { default: writeXlsxFile } = await import('write-excel-file/browser');
  const vi = lang === 'vi';

  const NAVY   = '#1E3A5F';
  const TEAL   = '#0F6B61';
  const COL_H  = '#134E4A';
  const WHITE  = '#FFFFFF';
  const ROW_A  = '#ECFDF5';
  const NOTE_B = '#FFFBEB';
  const NOTE_T = '#92400E';
  const INFO_T = '#0369A1';
  const MUTED  = '#64748B';
  const BORD   = '#A7C4BC';
  const FONT   = 'Times New Roman';

  const hdr = (v) => ({
    value: v, fontFamily: FONT, fontSize: 11, fontWeight: 'bold',
    color: WHITE, backgroundColor: COL_H, align: 'center', alignVertical: 'middle',
    height: 28, borderStyle: 'thin', borderColor: COL_H,
  });
  const dat = (v, ri, center = false) => ({
    value: v,
    type: typeof v === 'number' ? Number : String,
    fontFamily: FONT, fontSize: 11,
    backgroundColor: ri % 2 === 0 ? ROW_A : WHITE,
    align: center ? 'center' : 'left', alignVertical: 'middle',
    height: 20, borderStyle: 'thin', borderColor: BORD,
  });
  const span6 = (v, extra = {}) => ({ value: v, span: 6, fontFamily: FONT, ...extra });

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
    // Dòng 1 — tên trường
    [span6(vi ? 'TRƯỜNG ĐẠI HỌC KHOA HỌC VÀ CÔNG NGHỆ VIỆT NAM' : 'VIETNAM UNIVERSITY OF SCIENCE AND TECHNOLOGY', {
      fontSize: 15, fontWeight: 'bold', color: WHITE, backgroundColor: NAVY,
      align: 'center', alignVertical: 'middle', height: 44,
    })],
    // Dòng 2 — phòng ban
    [span6(vi ? 'PHÒNG TỔ CHỨC NHÂN SỰ  ·  PHÒNG ĐÀO TẠO' : 'HUMAN RESOURCES OFFICE  ·  ACADEMIC AFFAIRS OFFICE', {
      fontSize: 11, fontStyle: 'italic', color: WHITE, backgroundColor: TEAL,
      align: 'center', alignVertical: 'middle', height: 24,
    })],
    // Dòng 3 — dòng trống ngăn cách
    [span6(null, { height: 12 })],
    // Dòng 4 — tiêu đề tài liệu
    [span6(vi ? 'DANH SÁCH GIẢNG VIÊN' : 'FACULTY & STAFF ROSTER', {
      fontSize: 14, fontWeight: 'bold', textDecoration: 'underline', color: NAVY,
      align: 'center', alignVertical: 'middle', height: 38,
    })],
    // Dòng 5 — dòng điền năm học / khoa
    [span6(vi
      ? 'Năm học: ____________________      Khoa/Bộ môn: __________________________      Bậc đào tạo: _______________'
      : 'Academic Year: __________________      Faculty/Department: __________________________      Level: _______________', {
      fontSize: 11, fontStyle: 'italic', color: MUTED,
      align: 'center', alignVertical: 'middle', height: 22,
    })],
    // Dòng 6 — dòng trống ngăn cách
    [span6(null, { height: 10 })],
    // Dòng 7 — tiêu đề các cột
    hdrs.map(h => hdr(h)),
    // Dòng 8-11 — dữ liệu mẫu
    ...samples.map((row, ri) => [
      dat(row[0], ri, true),
      dat(row[1], ri),
      dat(row[2], ri, true),
      dat(row[3], ri, true),
      dat(row[4], ri),
      dat(row[5], ri),
    ]),
    // Dòng 12 — dòng trống ngăn cách
    [span6(null, { height: 10 })],
    // Dòng 13 — ghi chú cột bắt buộc
    [span6(vi
      ? '(*) Cột bắt buộc điền. Học hàm/học vị hợp lệ: ThS, TS, PGS, GS, CN (để trống nếu không có). Xóa các dòng mẫu trước khi nhập.'
      : '(*) Required fields. Valid degrees: M.Sc., Ph.D., Assoc., Prof., B.Sc. (leave blank if none). Remove sample rows before importing.', {
      fontSize: 10, fontStyle: 'italic', color: NOTE_T, backgroundColor: NOTE_B,
      align: 'left', alignVertical: 'middle', wrap: true, height: 34,
    })],
    // Dòng 14 — ghi chú về dữ liệu tự sinh
    [span6(vi
      ? 'ℹ  Mã giảng viên và email trường (.edu.vn) sẽ được hệ thống tự động sinh. Thông tin đăng nhập gửi về email cá nhân sau khi nhập thành công.'
      : 'ℹ  Teacher code and school email (.edu.vn) are auto-generated. Login credentials will be sent to personal email after successful import.', {
      fontSize: 10, fontStyle: 'italic', color: INFO_T,
      align: 'left', alignVertical: 'middle', wrap: true, height: 34,
    })],
  ];

  const columns = [
    { width: 6 }, { width: 28 }, { width: 16 }, { width: 16 }, { width: 26 }, { width: 28 },
  ];

  const fileName = vi ? 'mau-danh-sach-giang-vien.xlsx' : 'teacher-import-template.xlsx';
  await writeXlsxFile(data, { columns, sheet: vi ? 'DS Giảng Viên' : 'Faculty List' }).toFile(fileName);
}
