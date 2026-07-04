/* ============================================================
   EduManage — Mock data + i18n
   ES module — mock data + i18n dictionary.
   ============================================================ */
const DB = (function () {
  // ---------------- i18n ----------------
  const I18N = {
    vi: {
      appName: 'EduManage',
      appSub: 'Hệ thống Quản lý Sinh viên',
      // auth
      signIn: 'Đăng nhập', signInSub: 'Đăng nhập bằng mã tài khoản của bạn',
      email: 'Email trường', accountId: 'Mã tài khoản', password: 'Mật khẩu', rememberMe: 'Ghi nhớ đăng nhập',
      forgotPw: 'Quên mật khẩu?', loginBtn: 'Đăng nhập', loginAs: 'Đăng nhập nhanh với vai trò',
      pwHidden: 'Hiện', pwShown: 'Ẩn',
      firstLoginTitle: 'Đổi mật khẩu lần đầu',
      firstLoginSub: 'Vì lý do bảo mật, bạn cần đặt mật khẩu mới trước khi tiếp tục.',
      currentPw: 'Mật khẩu hiện tại', newPw: 'Mật khẩu mới', confirmPw: 'Xác nhận mật khẩu mới',
      updatePw: 'Cập nhật mật khẩu', pwPolicy: 'Yêu cầu mật khẩu',
      forgotTitle: 'Khôi phục mật khẩu', forgotSub: 'Nhập mã tài khoản, chúng tôi sẽ gửi mã OTP về email cá nhân đã đăng ký.',
      sendOtp: 'Gửi mã OTP', otpTitle: 'Nhập mã xác thực',
      otpSub: 'Mã gồm 6 số đã gửi tới email cá nhân của bạn. Mã hết hạn sau',
      resend: 'Gửi lại mã', verify: 'Xác nhận', setNewPw: 'Đặt mật khẩu mới',
      backToLogin: 'Quay lại đăng nhập',
      // nav
      dashboard: 'Tổng quan', students: 'Sinh viên', teachers: 'Giảng viên',
      faculties: 'Khoa', majors: 'Ngành', classes: 'Lớp', subjects: 'Môn học',
      sections: 'Lớp học phần', semesters: 'Học kỳ', grades: 'Điểm số', attendance: 'Điểm danh',
      mySections: 'Lớp phụ trách', gradeEntry: 'Nhập điểm', registration: 'Đăng ký môn',
      transcript: 'Bảng điểm', schedule: 'Thời khóa biểu', accounts: 'Tài khoản',
      settings: 'Cài đặt', academic: 'Đào tạo', management: 'Quản lý', teaching: 'Giảng dạy', learning: 'Học tập',
      // common
      search: 'Tìm kiếm…', filter: 'Bộ lọc', all: 'Tất cả', add: 'Thêm mới',
      edit: 'Sửa', del: 'Xóa', save: 'Lưu', cancel: 'Hủy', close: 'Đóng',
      actions: 'Thao tác', status: 'Trạng thái', active: 'Hoạt động', locked: 'Đã khóa',
      export: 'Xuất file', viewAll: 'Xem tất cả', showing: 'Hiển thị', of: 'trong', results: 'kết quả',
      page: 'Trang', logout: 'Đăng xuất', profile: 'Hồ sơ', confirm: 'Xác nhận',
      selectAll: 'Chọn tất cả', name: 'Họ tên', code: 'Mã', gender: 'Giới tính',
      dob: 'Ngày sinh', class: 'Lớp', major: 'Ngành', faculty: 'Khoa', credits: 'Tín chỉ',
      degree: 'Học vị', semester: 'Học kỳ', year: 'Năm học', present: 'Có mặt',
      absent: 'Vắng', late: 'Trễ', male: 'Nam', female: 'Nữ', gpa: 'GPA',
      midterm: 'Giữa kỳ', final: 'Cuối kỳ', bonus: 'Cộng', total: 'Tổng kết',
      letter: 'Điểm chữ', noData: 'Không có dữ liệu', lock: 'Khóa', unlock: 'Mở khóa',
      back: 'Quay lại', information: 'Thông tin chung', contact: 'Liên hệ', personalEmail: 'Email cá nhân',
      enrolledCourses: 'Môn đang học', attendanceHistory: 'Lịch sử điểm danh', today: 'Hôm nay', history: 'Lịch sử',
      session: 'Buổi', rate: 'Chuyên cần', period: 'Tiết', room: 'Phòng', editProfile: 'Sửa hồ sơ',
      standing: 'Xếp loại', excellent: 'Giỏi', good: 'Khá', average: 'Trung bình', warningAbsent: 'Cảnh báo vắng',
      sessions: 'buổi học', viewProfile: 'Xem hồ sơ', overview: 'Tổng quan', academicInfo: 'Thông tin học tập',
      mon: 'Thứ 2', tue: 'Thứ 3', wed: 'Thứ 4', thu: 'Thứ 5', fri: 'Thứ 6', sat: 'Thứ 7',
      noClass: 'Trống', weeklySchedule: 'Lịch học trong tuần',
      searchEverything: 'Tìm sinh viên, giảng viên, môn học…', noResults: 'Không tìm thấy kết quả', searchHint: 'Gõ để tìm kiếm toàn hệ thống',
      recent: 'Truy cập nhanh', jumpTo: 'Di chuyển tới', navigate: 'điểu hướng', select: 'chọn', toClose: 'đóng',
      import: 'Nhập dữ liệu', importStudents: 'Nhập danh sách sinh viên', bulkProvision: 'Cấp tài khoản hàng loạt',
      pasteCsv: 'Dán dữ liệu CSV', uploadFile: 'Tải lên tệp', orPaste: 'hoặc dán trực tiếp', preview: 'Xem trước',
      validRows: 'hợp lệ', errorRows: 'lỗi', downloadTemplate: 'Tải mẫu CSV', provisionNow: 'Cấp tài khoản',
      generatedEmail: 'Email tự sinh', tempPassword: 'Mật khẩu tạm', importDone: 'sinh viên đã được cấp tài khoản',
      dropHint: 'Kéo thả tệp CSV vào đây', csvColumns: 'Cột: Họ tên, Mã SV, Giới tính, Ngày sinh, Lớp, Email cá nhân',
      exporting: 'Đang xuất…', exported: 'Đã xuất tệp', rowsReady: 'dòng sẵn sàng nhập', fixErrors: 'Còn dòng lỗi cần sửa',
      errRequired: 'Trường này là bắt buộc', errName: 'Nhập đầy đủ họ và tên', errNameChars: 'Họ tên chỉ gồm chữ cái',
      errCode: 'Mã gồm 6–10 chữ số', errCodeTaken: 'Mã này đã tồn tại', errEmail: 'Email không hợp lệ',
      errDob: 'Ngày sinh dạng dd/mm/yyyy', errDobAge: 'Tuổi phải từ 15–60', errFixForm: 'Vui lòng sửa các lỗi được đánh dấu',
      optional: 'không bắt buộc', autoFilled: 'Tự tạo khi lưu',
      // profile
      myProfile: 'Hồ sơ của tôi', phone: 'Số điện thoại', address: 'Địa chỉ',
      changePassword: 'Đổi mật khẩu', profileSaved: 'Đã lưu hồ sơ',
      pwChanged: 'Đổi mật khẩu thành công! Hệ thống sẽ tự động đăng xuất, vui lòng đăng nhập lại.',
      currentPwWrong: 'Mật khẩu hiện tại không đúng', pwMismatch: 'Mật khẩu không khớp',
      studentId: 'Mã sinh viên', teacherId: 'Mã giảng viên', chooseAvatar: 'Chọn ảnh đại diện',
    },
    en: {
      appName: 'EduManage',
      appSub: 'Student Management System',
      signIn: 'Sign in', signInSub: 'Log in with your account ID',
      email: 'School email', accountId: 'Account ID', password: 'Password', rememberMe: 'Remember me',
      forgotPw: 'Forgot password?', loginBtn: 'Sign in', loginAs: 'Quick sign-in as',
      pwHidden: 'Show', pwShown: 'Hide',
      firstLoginTitle: 'Change password on first login',
      firstLoginSub: 'For security reasons, please set a new password before continuing.',
      currentPw: 'Current password', newPw: 'New password', confirmPw: 'Confirm new password',
      updatePw: 'Update password', pwPolicy: 'Password requirements',
      forgotTitle: 'Recover password', forgotSub: "Enter your account ID — we'll send an OTP to your registered personal email.",
      sendOtp: 'Send OTP', otpTitle: 'Enter verification code',
      otpSub: 'A 6-digit code was sent to your personal email. It expires in',
      resend: 'Resend code', verify: 'Verify', setNewPw: 'Set new password',
      backToLogin: 'Back to sign in',
      dashboard: 'Dashboard', students: 'Students', teachers: 'Teachers',
      faculties: 'Faculties', majors: 'Majors', classes: 'Classes', subjects: 'Subjects',
      sections: 'Course Sections', semesters: 'Semesters', grades: 'Grades', attendance: 'Attendance',
      mySections: 'My Sections', gradeEntry: 'Grade Entry', registration: 'Registration',
      transcript: 'Transcript', schedule: 'Schedule', accounts: 'Accounts',
      settings: 'Settings', academic: 'Academic', management: 'Management', teaching: 'Teaching', learning: 'Learning',
      search: 'Search…', filter: 'Filter', all: 'All', add: 'Add new',
      edit: 'Edit', del: 'Delete', save: 'Save', cancel: 'Cancel', close: 'Close',
      actions: 'Actions', status: 'Status', active: 'Active', locked: 'Locked',
      export: 'Export', viewAll: 'View all', showing: 'Showing', of: 'of', results: 'results',
      page: 'Page', logout: 'Log out', profile: 'Profile', confirm: 'Confirm',
      selectAll: 'Select all', name: 'Full name', code: 'Code', gender: 'Gender',
      dob: 'Date of birth', class: 'Class', major: 'Major', faculty: 'Faculty', credits: 'Credits',
      degree: 'Degree', semester: 'Semester', year: 'Year', present: 'Present',
      absent: 'Absent', late: 'Late', male: 'Male', female: 'Female', gpa: 'GPA',
      midterm: 'Midterm', final: 'Final', bonus: 'Bonus', total: 'Total',
      letter: 'Letter', noData: 'No data', lock: 'Lock', unlock: 'Unlock',
      back: 'Back', information: 'General info', contact: 'Contact', personalEmail: 'Personal email',
      enrolledCourses: 'Enrolled courses', attendanceHistory: 'Attendance history', today: 'Today', history: 'History',
      session: 'Session', rate: 'Attendance', period: 'Period', room: 'Room', editProfile: 'Edit profile',
      standing: 'Standing', excellent: 'Excellent', good: 'Good', average: 'Average', warningAbsent: 'Absence alert',
      sessions: 'sessions', viewProfile: 'View profile', overview: 'Overview', academicInfo: 'Academic info',
      mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat',
      noClass: 'Free', weeklySchedule: 'Weekly schedule',
      searchEverything: 'Search students, teachers, courses…', noResults: 'No results found', searchHint: 'Type to search across the system',
      recent: 'Quick access', jumpTo: 'Jump to', navigate: 'navigate', select: 'select', toClose: 'close',
      import: 'Import', importStudents: 'Import student list', bulkProvision: 'Bulk provision accounts',
      pasteCsv: 'Paste CSV data', uploadFile: 'Upload file', orPaste: 'or paste directly', preview: 'Preview',
      validRows: 'valid', errorRows: 'errors', downloadTemplate: 'Download CSV template', provisionNow: 'Provision accounts',
      generatedEmail: 'Generated email', tempPassword: 'Temp password', importDone: 'students provisioned',
      dropHint: 'Drag & drop a CSV file here', csvColumns: 'Columns: Full name, Code, Gender, DOB, Class, Personal email',
      exporting: 'Exporting…', exported: 'File exported', rowsReady: 'rows ready to import', fixErrors: 'Some rows need fixing',
      errRequired: 'This field is required', errName: 'Enter full first & last name', errNameChars: 'Name may contain letters only',
      errCode: 'Code must be 6–10 digits', errCodeTaken: 'This code already exists', errEmail: 'Invalid email address',
      errDob: 'Use date format dd/mm/yyyy', errDobAge: 'Age must be 15–60', errFixForm: 'Please fix the highlighted fields',
      optional: 'optional', autoFilled: 'Auto-generated on save',
      // profile
      myProfile: 'My Profile', phone: 'Phone number', address: 'Address',
      changePassword: 'Change password', profileSaved: 'Profile saved',
      pwChanged: 'Password changed successfully! You will be signed out automatically, please sign in again.',
      currentPwWrong: 'Current password is incorrect', pwMismatch: 'Passwords do not match',
      studentId: 'Student ID', teacherId: 'Teacher ID', chooseAvatar: 'Choose avatar',
    }
  };

  // ---------------- Reference data ----------------
  const FACULTIES = [
    { id: 'F1', code: 'CNTT', name_vi: 'Công nghệ Thông tin', name_en: 'Information Technology' },
    { id: 'F2', code: 'KT', name_vi: 'Kinh tế', name_en: 'Economics' },
    { id: 'F3', code: 'NN', name_vi: 'Ngoại ngữ', name_en: 'Foreign Languages' },
    { id: 'F4', code: 'CK', name_vi: 'Cơ khí', name_en: 'Mechanical Eng.' },
  ];
  const MAJORS = [
    { id: 'M1', code: 'KHMT', name_vi: 'Khoa học Máy tính', name_en: 'Computer Science', facultyId: 'F1' },
    { id: 'M2', code: 'KTPM', name_vi: 'Kỹ thuật Phần mềm', name_en: 'Software Engineering', facultyId: 'F1' },
    { id: 'M3', code: 'HTTT', name_vi: 'Hệ thống Thông tin', name_en: 'Information Systems', facultyId: 'F1' },
    { id: 'M4', code: 'QTKD', name_vi: 'Quản trị Kinh doanh', name_en: 'Business Admin.', facultyId: 'F2' },
    { id: 'M5', code: 'NNA', name_vi: 'Ngôn ngữ Anh', name_en: 'English Language', facultyId: 'F3' },
  ];
  const CLASSES = [
    { id: 'C1', code: 'KTPM2021A', name: 'KTPM 2021 A', majorId: 'M2', year: 2021 },
    { id: 'C2', code: 'KTPM2021B', name: 'KTPM 2021 B', majorId: 'M2', year: 2021 },
    { id: 'C3', code: 'KHMT2022A', name: 'KHMT 2022 A', majorId: 'M1', year: 2022 },
    { id: 'C4', code: 'HTTT2022A', name: 'HTTT 2022 A', majorId: 'M3', year: 2022 },
    { id: 'C5', code: 'QTKD2021A', name: 'QTKD 2021 A', majorId: 'M4', year: 2021 },
  ];
  const SUBJECTS = [
    { id: 'S1', code: 'IT3080', name_vi: 'Cơ sở dữ liệu', name_en: 'Databases', credits: 3, majorId: 'M2' },
    { id: 'S2', code: 'IT4409', name_vi: 'Công nghệ Web', name_en: 'Web Technologies', credits: 3, majorId: 'M2' },
    { id: 'S3', code: 'IT3100', name_vi: 'Lập trình hướng đối tượng', name_en: 'OOP', credits: 4, majorId: 'M2' },
    { id: 'S4', code: 'IT4060', name_vi: 'Cấu trúc dữ liệu & Giải thuật', name_en: 'Data Structures & Algorithms', credits: 4, majorId: 'M1' },
    { id: 'S5', code: 'IT4785', name_vi: 'Phát triển ứng dụng di động', name_en: 'Mobile App Dev.', credits: 3, majorId: 'M2' },
    { id: 'S6', code: 'MI1110', name_vi: 'Giải tích I', name_en: 'Calculus I', credits: 4, majorId: 'M1' },
  ];

  const firstNames = ['Nguyễn','Trần','Lê','Phạm','Hoàng','Vũ','Đặng','Bùi','Đỗ','Hồ','Ngô','Dương'];
  const midNames = ['Văn','Thị','Hữu','Đức','Minh','Thanh','Quang','Hồng','Gia','Khánh','Bảo','Thu'];
  const lastNames = ['An','Bình','Cường','Dung','Em','Phúc','Giang','Hà','Huy','Khoa','Linh','Mai','Nam','Oanh','Phong','Quân','Sơn','Trang','Uyên','Vy','Yến','Long','Hương','Tú'];
  function rng(seed){ let s = seed; return () => (s = (s*1103515245+12345)&0x7fffffff)/0x7fffffff; }
  function pick(arr, r){ return arr[Math.floor(r()*arr.length)]; }
  function fullName(r){ return pick(firstNames,r)+' '+pick(midNames,r)+' '+pick(lastNames,r); }

  // ---------------- Students ----------------
  const STUDENTS = [];
  const rs = rng(42);
  for (let i = 0; i < 64; i++) {
    const cls = pick(CLASSES, rs);
    const code = '20' + (cls.year - 2000) + String(6000 + i);
    const gender = rs() > 0.45 ? 'M' : 'F';
    const gpa = +(2.1 + rs() * 1.9).toFixed(2);
    STUDENTS.push({
      id: 'SV' + i,
      code,
      name: fullName(rs),
      gender,
      dob: `${1 + Math.floor(rs()*28)}/${1+Math.floor(rs()*12)}/${cls.year - 18}`.replace(/\b(\d)\b/g,'0$1'),
      classId: cls.id,
      email: code + '@student.school.edu.vn',
      personalEmail: 'sv' + i + '.private@gmail.com',
      gpa,
      credits: 40 + Math.floor(rs()*80),
      active: rs() > 0.12,
      avatarHue: Math.floor(rs()*360),
    });
  }

  // ---------------- Teachers ----------------
  const degrees = [['Thạc sĩ','MSc'],['Tiến sĩ','PhD'],['PGS.TS','Assoc.Prof'],['GS.TS','Prof']];
  const TEACHERS = [];
  const rt = rng(7);
  for (let i = 0; i < 24; i++) {
    const fac = pick(FACULTIES, rt);
    const code = 'GV' + String(1001 + i);
    const deg = pick(degrees, rt);
    TEACHERS.push({
      id: 'GV' + i,
      code,
      name: fullName(rt),
      degree_vi: deg[0], degree_en: deg[1],
      facultyId: fac.id,
      gender: rt() > 0.5 ? 'M' : 'F',
      email: code.toLowerCase() + '@school.edu.vn',
      personalEmail: 'gv' + i + '.private@gmail.com',
      sections: 1 + Math.floor(rt()*3),
      active: rt() > 0.08,
      avatarHue: Math.floor(rt()*360),
    });
  }

  // ---------------- Course Sections ----------------
  const SECTIONS = [];
  const rsec = rng(13);
  const schedules = ['T2 (1-3) — P.301','T3 (4-6) — P.205','T4 (7-9) — Lab A2','T5 (1-3) — P.408','T6 (4-6) — Hội trường B'];
  SUBJECTS.forEach((sub, idx) => {
    const n = 1 + Math.floor(rsec()*2);
    for (let k = 0; k < n; k++) {
      const teacher = pick(TEACHERS, rsec);
      const max = [40,45,50,60][Math.floor(rsec()*4)];
      const enrolled = Math.floor(max * (0.55 + rsec()*0.42));
      SECTIONS.push({
        id: 'SEC' + idx + k,
        code: sub.code + '.' + (k+1),
        subjectId: sub.id,
        teacherId: teacher.id,
        semester: '1', year: '2024-2025',
        max, enrolled,
        schedule: pick(schedules, rsec),
      });
    }
  });

  // ---------------- Helpers ----------------
  const byId = (arr) => Object.fromEntries(arr.map(x => [x.id, x]));
  const MAP = {
    faculty: byId(FACULTIES), major: byId(MAJORS), class: byId(CLASSES),
    subject: byId(SUBJECTS), teacher: byId(TEACHERS), section: byId(SECTIONS), student: byId(STUDENTS),
  };

  function letterOf(score) {
    if (score >= 9) return 'A+'; if (score >= 8.5) return 'A'; if (score >= 8) return 'B+';
    if (score >= 7) return 'B'; if (score >= 6.5) return 'C+'; if (score >= 5.5) return 'C';
    if (score >= 5) return 'D+'; if (score >= 4) return 'D'; return 'F';
  }

  // Transcript for the demo student (sv001 -> STUDENTS[1])
  const rg = rng(99);
  const DEMO_TRANSCRIPT = [
    { subject: 'S3', sem: 'HK1 2023-2024' }, { subject: 'S6', sem: 'HK1 2023-2024' },
    { subject: 'S4', sem: 'HK2 2023-2024' }, { subject: 'S1', sem: 'HK2 2023-2024' },
    { subject: 'S2', sem: 'HK1 2024-2025' }, { subject: 'S5', sem: 'HK1 2024-2025' },
  ].map((e, i) => {
    const mid = +(6 + rg()*3.5).toFixed(1);
    const fin = +(5.5 + rg()*4).toFixed(1);
    const total = +(mid*0.4 + fin*0.6).toFixed(1);
    return { ...e, midterm: mid, final: fin, total, letter: letterOf(total), credits: MAP.subject[e.subject].credits };
  });

  // GPA trend over semesters
  const GPA_TREND = [
    { term: 'HK1·22', gpa: 2.8 }, { term: 'HK2·22', gpa: 3.05 },
    { term: 'HK1·23', gpa: 3.2 }, { term: 'HK2·23', gpa: 3.42 },
    { term: 'HK1·24', gpa: 3.55 },
  ];

  return {
    I18N, FACULTIES, MAJORS, CLASSES, SUBJECTS, STUDENTS, TEACHERS, SECTIONS, MAP,
    DEMO_TRANSCRIPT, GPA_TREND, letterOf,
    // dashboards aggregate
    stats: {
      students: STUDENTS.length, teachers: TEACHERS.length,
      sections: SECTIONS.length, subjects: SUBJECTS.length,
      faculties: FACULTIES.length, majors: MAJORS.length, classes: CLASSES.length,
    },
  };
})();

export { DB };
