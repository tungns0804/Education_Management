// ================================================================
// Demo / seed data — only used in prisma/seed.ts
// These mirror the quick-login credentials shown in the client UI.
// ================================================================

export const DEMO_ADMIN = {
  fullName:  'Phạm Quốc Admin',
  email:     'admin@school.edu.vn',
  password:  'Admin@123',   // hashed before INSERT
  role:      'admin'  as const,
  status:    'active' as const,
  isAdmin:   true,
};

export const DEMO_TEACHER = {
  fullName:  'TS. Nguyễn Văn Minh',
  email:     'gv1001@school.edu.vn',
  password:  'Teacher@123',
  role:      'teacher'  as const,
  status:    'teaching' as const,
  idTeacher: 'GV1001',
  degree:    'Tiến sĩ',
  phone:     '0987654321',
};

export const DEMO_STUDENT = {
  fullName:  'Lê Thị Mai Anh',
  email:     '20216001@student.school.edu.vn',
  password:  'Student@123',
  role:      'student'  as const,
  status:    'studying' as const,
  idStudent: '20216001',
};
