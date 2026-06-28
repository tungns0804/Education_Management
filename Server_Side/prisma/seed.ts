// ============================================================
// Master data seed — chạy khi database chưa có dữ liệu
// Lệnh: npm run seed  (hoặc npx prisma db seed)
// Idempotent: dùng upsert — chạy nhiều lần không bị lỗi
// ============================================================

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../src/constants/auth.constants';
import {
  DEMO_ADMIN,
  DEMO_TEACHER, TEACHER_2, TEACHER_3, TEACHER_4,
  DEMO_STUDENT, STUDENT_2, STUDENT_3, STUDENT_4, STUDENT_5, STUDENT_6,
} from '../src/constants/seed.constants';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

// ──────────────────────────────────────────────────────────────
// 1. RAW MASTER DATA
// ──────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  { code: 'CNTT', nameDepartment: 'Công nghệ Thông tin'  },
  { code: 'KTKT', nameDepartment: 'Kinh tế - Kế toán'    },
  { code: 'KTXD', nameDepartment: 'Kỹ thuật - Xây dựng'  },
  { code: 'NN',   nameDepartment: 'Ngoại ngữ'             },
];

const BRANCHES = [
  { code: 'KTPM', nameBranch: 'Kỹ thuật Phần mềm',           departmentCode: 'CNTT' },
  { code: 'HTTT', nameBranch: 'Hệ thống Thông tin',           departmentCode: 'CNTT' },
  { code: 'KT',   nameBranch: 'Kế toán',                      departmentCode: 'KTKT' },
  { code: 'QTKD', nameBranch: 'Quản trị Kinh doanh',          departmentCode: 'KTKT' },
  { code: 'KTCD', nameBranch: 'Kỹ thuật Công trình Dân dụng', departmentCode: 'KTXD' },
  { code: 'XDGT', nameBranch: 'Xây dựng Giao thông',          departmentCode: 'KTXD' },
  { code: 'TA',   nameBranch: 'Tiếng Anh',                    departmentCode: 'NN'   },
  { code: 'TN',   nameBranch: 'Tiếng Nhật',                   departmentCode: 'NN'   },
];

// Classes (lớp sinh viên — cohort): cần teacherEmail & departmentCode → resolve lúc runtime
const CLASSES_RAW = [
  { code: 'KTPM2021A', nameClass: 'Kỹ thuật Phần mềm K2021 A',  teacherEmail: 'gv1001@school.edu.vn', departmentCode: 'CNTT' },
  { code: 'HTTT2021A', nameClass: 'Hệ thống Thông tin K2021 A', teacherEmail: 'gv1001@school.edu.vn', departmentCode: 'CNTT' },
  { code: 'KT2021A',   nameClass: 'Kế toán K2021 A',            teacherEmail: 'gv1002@school.edu.vn', departmentCode: 'KTKT' },
  { code: 'TA2021A',   nameClass: 'Tiếng Anh K2021 A',          teacherEmail: 'gv1004@school.edu.vn', departmentCode: 'NN'   },
];

const SUBJECTS_RAW = [
  { code: 'LTCB',   name: 'Lập trình Cơ bản',               credits: 3, departmentCode: 'CNTT' },
  { code: 'CTDLGT', name: 'Cấu trúc Dữ liệu & Giải thuật',  credits: 3, departmentCode: 'CNTT' },
  { code: 'CSDL',   name: 'Cơ sở Dữ liệu',                  credits: 3, departmentCode: 'CNTT' },
  { code: 'LTWEB',  name: 'Lập trình Web',                   credits: 3, departmentCode: 'CNTT' },
  { code: 'TOARR',  name: 'Toán Rời rạc',                    credits: 2, departmentCode: 'CNTT' },
  { code: 'NLKT',   name: 'Nguyên lý Kế toán',               credits: 3, departmentCode: 'KTKT' },
  { code: 'KTVM',   name: 'Kinh tế Vi mô',                   credits: 2, departmentCode: 'KTKT' },
  { code: 'TA1',    name: 'Tiếng Anh 1',                     credits: 3, departmentCode: 'NN'   },
  { code: 'TA2',    name: 'Tiếng Anh 2',                     credits: 3, departmentCode: 'NN'   },
  { code: 'VLXD',   name: 'Vật liệu Xây dựng',               credits: 3, departmentCode: 'KTXD' },
];

// SubjectClasses (lớp học phần): cần subjectCode & teacherEmail → resolve lúc runtime
const SUBJECT_CLASSES_RAW = [
  { code: 'LTCB-HK1-2425',   semester: 'HK1 2024-2025', maxStudents: 45, status: 'active'    as const, subjectCode: 'LTCB',   teacherEmail: 'gv1001@school.edu.vn' },
  { code: 'CTDLGT-HK1-2425', semester: 'HK1 2024-2025', maxStudents: 40, status: 'active'    as const, subjectCode: 'CTDLGT', teacherEmail: 'gv1001@school.edu.vn' },
  { code: 'CSDL-HK2-2425',   semester: 'HK2 2024-2025', maxStudents: 40, status: 'active'    as const, subjectCode: 'CSDL',   teacherEmail: 'gv1001@school.edu.vn' },
  { code: 'LTWEB-HK2-2425',  semester: 'HK2 2024-2025', maxStudents: 40, status: 'active'    as const, subjectCode: 'LTWEB',  teacherEmail: 'gv1001@school.edu.vn' },
  { code: 'TA1-HK1-2425',    semester: 'HK1 2024-2025', maxStudents: 30, status: 'active'    as const, subjectCode: 'TA1',    teacherEmail: 'gv1004@school.edu.vn' },
  { code: 'NLKT-HK1-2425',   semester: 'HK1 2024-2025', maxStudents: 35, status: 'active'    as const, subjectCode: 'NLKT',   teacherEmail: 'gv1002@school.edu.vn' },
  { code: 'TOARR-HK1-2324',  semester: 'HK1 2023-2024', maxStudents: 40, status: 'completed' as const, subjectCode: 'TOARR',  teacherEmail: 'gv1001@school.edu.vn' },
];

// Enrollments: [studentEmail, subjectClassCode]
const ENROLLMENTS_RAW: [string, string][] = [
  // Lê Anh Duy (20216001)
  ['20216001@student.school.edu.vn', 'LTCB-HK1-2425'],
  ['20216001@student.school.edu.vn', 'CTDLGT-HK1-2425'],
  ['20216001@student.school.edu.vn', 'TA1-HK1-2425'],
  ['20216001@student.school.edu.vn', 'TOARR-HK1-2324'],
  // Nguyễn Văn Bảo (20216002)
  ['20216002@student.school.edu.vn', 'LTCB-HK1-2425'],
  ['20216002@student.school.edu.vn', 'CTDLGT-HK1-2425'],
  ['20216002@student.school.edu.vn', 'CSDL-HK2-2425'],
  ['20216002@student.school.edu.vn', 'TOARR-HK1-2324'],
  // Trần Thị Thu (20216003)
  ['20216003@student.school.edu.vn', 'LTCB-HK1-2425'],
  ['20216003@student.school.edu.vn', 'TA1-HK1-2425'],
  ['20216003@student.school.edu.vn', 'TOARR-HK1-2324'],
  // Hoàng Minh Khoa (20216004)
  ['20216004@student.school.edu.vn', 'LTCB-HK1-2425'],
  ['20216004@student.school.edu.vn', 'CTDLGT-HK1-2425'],
  // Vũ Thị Hà (20216005)
  ['20216005@student.school.edu.vn', 'TA1-HK1-2425'],
  // Đặng Văn Long (20216006)
  ['20216006@student.school.edu.vn', 'NLKT-HK1-2425'],
];

// ──────────────────────────────────────────────────────────────
// 2. HELPERS
// ──────────────────────────────────────────────────────────────

function ok(label: string) {
  console.log(`  ✔  ${label}`);
}

// ──────────────────────────────────────────────────────────────
// 3. MAIN
// ──────────────────────────────────────────────────────────────

async function main() {
  console.log('\n═══════════════════════════════════════');
  console.log('  EduManage — Master Data Seed');
  console.log('═══════════════════════════════════════\n');

  // ── 3.1 Users ─────────────────────────────────────────────
  console.log('▶ Users...');
  const usersRaw = [
    DEMO_ADMIN,
    DEMO_TEACHER, TEACHER_2, TEACHER_3, TEACHER_4,
    DEMO_STUDENT, STUDENT_2, STUDENT_3, STUDENT_4, STUDENT_5, STUDENT_6,
  ];

  const userMap = new Map<string, string>(); // email → id

  for (const u of usersRaw) {
    const hashed = await bcrypt.hash(u.password, BCRYPT_SALT_ROUNDS);
    const record = await prisma.user.upsert({
      where:  { email: u.email },
      update: {
        fullName:      u.fullName,
        personalEmail: (u as any).personalEmail ?? undefined,
        department:    (u as any).department    ?? undefined,
        class:         (u as any).class         ?? undefined,
        gender:        (u as any).gender        ?? undefined,
        birthDay:      (u as any).birthDay      ?? undefined,
      },
      create: { ...u, password: hashed },
    });
    userMap.set(u.email, record.id);
    ok(u.email);
  }

  // ── 3.2 Departments ────────────────────────────────────────
  console.log('\n▶ Departments...');
  const deptMap = new Map<string, string>(); // code → id

  for (const d of DEPARTMENTS) {
    const record = await prisma.department.upsert({
      where:  { code: d.code },
      update: { nameDepartment: d.nameDepartment },
      create: d,
    });
    deptMap.set(d.code, record.id);
    ok(`${d.code} — ${d.nameDepartment}`);
  }

  // ── 3.3 Branches ───────────────────────────────────────────
  console.log('\n▶ Branches...');
  for (const b of BRANCHES) {
    const departmentId = deptMap.get(b.departmentCode)!;
    await prisma.branch.upsert({
      where:  { code: b.code },
      update: { nameBranch: b.nameBranch, departmentId },
      create: { code: b.code, nameBranch: b.nameBranch, departmentId },
    });
    ok(`${b.code} — ${b.nameBranch}`);
  }

  // ── 3.4 Classes (lớp sinh viên) ────────────────────────────
  console.log('\n▶ Classes...');
  for (const c of CLASSES_RAW) {
    const teacherId    = userMap.get(c.teacherEmail)!;
    const departmentId = deptMap.get(c.departmentCode)!;
    await prisma.class.upsert({
      where:  { code: c.code },
      update: { nameClass: c.nameClass, teacherId, departmentId },
      create: { code: c.code, nameClass: c.nameClass, teacherId, departmentId },
    });
    ok(`${c.code} — ${c.nameClass}`);
  }

  // ── 3.5 Subjects ───────────────────────────────────────────
  console.log('\n▶ Subjects...');
  const subjectMap = new Map<string, string>(); // code → id

  for (const s of SUBJECTS_RAW) {
    const departmentId = deptMap.get(s.departmentCode)!;
    const record = await prisma.subject.upsert({
      where:  { code: s.code },
      update: { name: s.name, credits: s.credits, departmentId },
      create: { code: s.code, name: s.name, credits: s.credits, departmentId },
    });
    subjectMap.set(s.code, record.id);
    ok(`${s.code} — ${s.name} (${s.credits} TC)`);
  }

  // ── 3.6 SubjectClasses (lớp học phần) ─────────────────────
  console.log('\n▶ SubjectClasses...');
  const scMap = new Map<string, string>(); // code → id

  for (const sc of SUBJECT_CLASSES_RAW) {
    const subjectId = subjectMap.get(sc.subjectCode)!;
    const teacherId = userMap.get(sc.teacherEmail)!;
    const record = await prisma.subjectClass.upsert({
      where:  { code: sc.code },
      update: { semester: sc.semester, maxStudents: sc.maxStudents, status: sc.status, subjectId, teacherId },
      create: { code: sc.code, semester: sc.semester, maxStudents: sc.maxStudents, status: sc.status, subjectId, teacherId },
    });
    scMap.set(sc.code, record.id);
    ok(`${sc.code} (${sc.semester})`);
  }

  // ── 3.7 Enrollments ────────────────────────────────────────
  console.log('\n▶ Enrollments...');
  for (const [studentEmail, scCode] of ENROLLMENTS_RAW) {
    const studentId      = userMap.get(studentEmail)!;
    const subjectClassId = scMap.get(scCode)!;
    await prisma.enrollment.upsert({
      where:  { studentId_subjectClassId: { studentId, subjectClassId } },
      update: {},
      create: { studentId, subjectClassId, status: 'registered' },
    });
    ok(`${studentEmail.split('@')[0]} → ${scCode}`);
  }

  // ── Summary ────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════');
  console.log('  Seed hoàn tất!');
  console.log('═══════════════════════════════════════');
  console.log('\nDemo credentials:');
  console.log(`  Admin:      admin@school.edu.vn            / Admin@123`);
  console.log(`  Teacher:    gv1001@school.edu.vn           / Teacher@123`);
  console.log(`  Student:    20216001@student.school.edu.vn / Student@123`);
  console.log('');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
