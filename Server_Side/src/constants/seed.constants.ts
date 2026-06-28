// ================================================================
// Demo / seed data — credentials used in prisma/seed.ts
// Must stay in sync with client_side/src/constants/auth.constants.js
// ================================================================

export const DEMO_ADMIN = {
  fullName:      'Phạm Quốc Admin',
  email:         'admin@school.edu.vn',
  password:      'Admin@123',
  role:          'admin'  as const,
  status:        'active' as const,
  isAdmin:       true,
  personalEmail: 'nguyensontung0804@gmail.com',
};

// ── Teachers ────────────────────────────────────────────────────

export const DEMO_TEACHER = {
  fullName:  'GV. Nguyễn Sơn Tùng',
  email:     'gv1001@school.edu.vn',
  password:  'Teacher@123',
  role:      'teacher'  as const,
  status:    'teaching' as const,
  idTeacher: 'GV1001',
  degree:    'Thạc sĩ',
  phone:     '0987654321',
  department:'CNTT',
  personalEmail: 'nguyensontung0804@gmail.com',
};

export const TEACHER_2 = {
  fullName:  'TS. Trần Thị Hương',
  email:     'gv1002@school.edu.vn',
  password:  'Teacher@123',
  role:      'teacher'  as const,
  status:    'teaching' as const,
  idTeacher: 'GV1002',
  degree:    'Tiến sĩ',
  phone:     '0912345678',
  department:'KTKT',
};

export const TEACHER_3 = {
  fullName:  'ThS. Lê Văn Hải',
  email:     'gv1003@school.edu.vn',
  password:  'Teacher@123',
  role:      'teacher'  as const,
  status:    'teaching' as const,
  idTeacher: 'GV1003',
  degree:    'Thạc sĩ',
  phone:     '0934567890',
  department:'KTXD',
};

export const TEACHER_4 = {
  fullName:  'ThS. Phạm Thị Lan',
  email:     'gv1004@school.edu.vn',
  password:  'Teacher@123',
  role:      'teacher'  as const,
  status:    'teaching' as const,
  idTeacher: 'GV1004',
  degree:    'Thạc sĩ',
  phone:     '0956789012',
  department:'NN',
};

// ── Students ────────────────────────────────────────────────────

export const DEMO_STUDENT = {
  fullName:      'Lê Anh Duy',
  email:         '20216001@student.school.edu.vn',
  password:      'Student@123',
  role:          'student'  as const,
  status:        'studying' as const,
  idStudent:     '20216001',
  class:         'KTPM2021A',
  department:    'CNTT',
  personalEmail: 'laduyyyy@gmail.com',
  gender:        'male' as const,
  birthDay:      new Date('2003-04-08'),
};

export const STUDENT_2 = {
  fullName:   'Nguyễn Văn Bảo',
  email:      '20216002@student.school.edu.vn',
  password:   'Student@123',
  role:       'student'  as const,
  status:     'studying' as const,
  idStudent:  '20216002',
  class:      'KTPM2021A',
  department: 'CNTT',
  gender:     'male' as const,
  birthDay:   new Date('2003-07-15'),
};

export const STUDENT_3 = {
  fullName:   'Trần Thị Thu',
  email:      '20216003@student.school.edu.vn',
  password:   'Student@123',
  role:       'student'  as const,
  status:     'studying' as const,
  idStudent:  '20216003',
  class:      'KTPM2021A',
  department: 'CNTT',
  gender:     'female' as const,
  birthDay:   new Date('2003-02-20'),
};

export const STUDENT_4 = {
  fullName:   'Hoàng Minh Khoa',
  email:      '20216004@student.school.edu.vn',
  password:   'Student@123',
  role:       'student'  as const,
  status:     'studying' as const,
  idStudent:  '20216004',
  class:      'HTTT2021A',
  department: 'CNTT',
  gender:     'male' as const,
  birthDay:   new Date('2003-09-11'),
};

export const STUDENT_5 = {
  fullName:   'Vũ Thị Hà',
  email:      '20216005@student.school.edu.vn',
  password:   'Student@123',
  role:       'student'  as const,
  status:     'studying' as const,
  idStudent:  '20216005',
  class:      'TA2021A',
  department: 'NN',
  gender:     'female' as const,
  birthDay:   new Date('2003-06-03'),
};

export const STUDENT_6 = {
  fullName:   'Đặng Văn Long',
  email:      '20216006@student.school.edu.vn',
  password:   'Student@123',
  role:       'student'  as const,
  status:     'studying' as const,
  idStudent:  '20216006',
  class:      'KT2021A',
  department: 'KTKT',
  gender:     'male' as const,
  birthDay:   new Date('2003-12-25'),
};
