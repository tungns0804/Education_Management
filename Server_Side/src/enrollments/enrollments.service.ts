import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentStatus, LetterGrade, SubjectClassStatus } from '@prisma/client';
import { schedulesOverlap, formatSchedule, hasSchedule } from '../common/utils/schedule.util';

// Quy đổi điểm tổng kết (thang 10) sang điểm chữ A/B/C/D/F
function calcLetter(total: number): LetterGrade {
  if (total >= 8.5) return LetterGrade.A;
  if (total >= 7.0) return LetterGrade.B;
  if (total >= 5.5) return LetterGrade.C;
  if (total >= 4.0) return LetterGrade.D;
  return LetterGrade.F;
}

// Tính điểm tổng kết: 10% chuyên cần + 30% giữa kỳ + 60% cuối kỳ
function calcTotal(att: number, mid: number, fin: number): number {
  return Math.round((att * 0.1 + mid * 0.3 + fin * 0.6) * 10) / 10;
}

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  // ----------------------------------------------------------------
  // Sinh viên: các đăng ký học phần hiện tại
  // ----------------------------------------------------------------

  async findMy(studentId: string) {
    const active = await this.prisma.semester.findMany({ where: { isActive: true }, select: { name: true } });
    const semWhere = active.length > 0
      ? { subjectClass: { semester: { in: active.map(s => s.name) } } }
      : {};

    return this.prisma.enrollment.findMany({
      where: { studentId, status: EnrollmentStatus.registered, ...semWhere },
      include: {
        subjectClass: {
          include: {
            subject: { select: { id: true, code: true, name: true, credits: true } },
            teacher: { select: { id: true, fullName: true } },
          },
        },
      },
      orderBy: { registeredAt: 'desc' },
    });
  }

  // ----------------------------------------------------------------
  // Sinh viên: bảng điểm toàn khóa
  // ----------------------------------------------------------------

  async getTranscript(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId, status: EnrollmentStatus.completed },
      include: {
        subjectClass: {
          include: {
            subject: { select: { id: true, code: true, name: true, credits: true } },
          },
        },
      },
      orderBy: { subjectClass: { semester: 'asc' } },
    });

    const totalCredits = enrollments.reduce((s, e) => s + (e.subjectClass.subject.credits || 0), 0);
    const weightedSum = enrollments.reduce((s, e) => s + (e.totalScore ?? 0) * (e.subjectClass.subject.credits || 0), 0);
    const gpa = totalCredits > 0 ? Math.round((weightedSum / totalCredits) * 100) / 100 : 0;

    return { enrollments, gpa, totalCredits };
  }

  // ----------------------------------------------------------------
  // Sinh viên: diễn biến GPA theo học kỳ
  // ----------------------------------------------------------------

  async getGpaTrend(studentId: string) {
    const completed = await this.prisma.enrollment.findMany({
      where: { studentId, status: EnrollmentStatus.completed },
      include: {
        subjectClass: {
          select: { semester: true, subject: { select: { credits: true } } },
        },
      },
    });

    const semMap: Record<string, { credits: number; weighted: number }> = {};
    for (const e of completed) {
      const sem = e.subjectClass.semester;
      const cr  = e.subjectClass.subject.credits;
      if (!semMap[sem]) semMap[sem] = { credits: 0, weighted: 0 };
      semMap[sem].credits  += cr;
      semMap[sem].weighted += (e.totalScore ?? 0) * cr;
    }

    return Object.entries(semMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([term, v]) => ({ term, gpa: v.credits > 0 ? Math.round((v.weighted / v.credits) * 100) / 100 : 0 }));
  }

  // ----------------------------------------------------------------
  // Giảng viên/Admin: bảng điểm của một lớp học phần
  // ----------------------------------------------------------------

  async getGradeSheet(subjectClassId: string) {
    return this.prisma.enrollment.findMany({
      where: { subjectClassId },
      include: {
        student: {
          select: { id: true, fullName: true, idStudent: true, email: true, class: true },
        },
      },
      orderBy: { student: { idStudent: 'asc' } },
    });
  }

  // ----------------------------------------------------------------
  // Sinh viên: đăng ký / hủy đăng ký học phần
  // ----------------------------------------------------------------

  async register(studentId: string, subjectClassId: string) {
    const sc = await this.prisma.subjectClass.findUnique({ where: { id: subjectClassId } });
    if (!sc) throw new NotFoundException('Lớp học phần không tồn tại');
    if (sc.status !== SubjectClassStatus.active)
      throw new BadRequestException('Lớp học phần không còn mở đăng ký');

    const enrolled = await this.prisma.enrollment.count({ where: { subjectClassId } });
    if (enrolled >= sc.maxStudents) throw new BadRequestException('Lớp học phần đã đầy');

    const existing = await this.prisma.enrollment.findUnique({
      where: { studentId_subjectClassId: { studentId, subjectClassId } },
    });
    if (existing) throw new ConflictException('Bạn đã đăng ký lớp học phần này');

    // Nghiệp vụ: không cho đăng ký lớp trùng lịch (cùng học kỳ, trùng ngày
    // trong tuần và giao nhau về khung giờ) với lớp đã đăng ký trước đó
    if (hasSchedule(sc)) {
      const myEnrollments = await this.prisma.enrollment.findMany({
        where: {
          studentId,
          status: EnrollmentStatus.registered,
          subjectClass: { semester: sc.semester, status: { not: SubjectClassStatus.canceled } },
        },
        include: {
          subjectClass: {
            select: {
              code: true, scheduleDays: true, startTime: true, endTime: true,
              subject: { select: { name: true } },
            },
          },
        },
      });
      const conflict = myEnrollments.find(e => schedulesOverlap(sc, e.subjectClass));
      if (conflict) {
        throw new ConflictException(
          `Trùng lịch học: bạn đã đăng ký lớp ${conflict.subjectClass.code} (${conflict.subjectClass.subject.name}) ` +
          `vào ${formatSchedule(conflict.subjectClass)}. Vui lòng chọn lớp học phần khác.`,
        );
      }
    }

    return this.prisma.enrollment.create({
      data: { studentId, subjectClassId, status: EnrollmentStatus.registered },
    });
  }

  // Hủy đăng ký học phần: chỉ chủ nhân đăng ký và khi điểm chưa bị khóa
  async drop(enrollmentId: string, studentId: string) {
    const e = await this.prisma.enrollment.findUnique({ where: { id: enrollmentId } });
    if (!e) throw new NotFoundException('Không tìm thấy đăng ký');
    if (e.studentId !== studentId) throw new ForbiddenException('Không có quyền hủy đăng ký này');
    if (e.gradeLocked) throw new BadRequestException('Điểm đã khóa, không thể hủy đăng ký');
    await this.prisma.enrollment.delete({ where: { id: enrollmentId } });
    return { dropped: true };
  }

  // ----------------------------------------------------------------
  // Giảng viên: nhập điểm
  // ----------------------------------------------------------------

  async updateGrade(
    enrollmentId: string,
    teacherId: string,
    data: { attendanceScore?: number; midtermScore?: number; finalScore?: number },
  ) {
    const e = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { subjectClass: { select: { teacherId: true } } },
    });
    if (!e) throw new NotFoundException('Không tìm thấy đăng ký');
    if (e.subjectClass.teacherId !== teacherId)
      throw new ForbiddenException('Bạn không phụ trách lớp học phần này');
    if (e.gradeLocked) throw new BadRequestException('Điểm đã khóa');

    const att = data.attendanceScore ?? e.attendanceScore ?? 0;
    const mid = data.midtermScore   ?? e.midtermScore   ?? 0;
    const fin = data.finalScore     ?? e.finalScore     ?? 0;
    const total  = calcTotal(att, mid, fin);
    const letter = calcLetter(total);

    return this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        attendanceScore: att,
        midtermScore:    mid,
        finalScore:      fin,
        totalScore:      total,
        letterGrade:     letter,
        status:          EnrollmentStatus.completed,
      },
    });
  }

  // Khóa / mở khóa điểm của một đăng ký học phần
  async toggleGradeLock(enrollmentId: string, locked: boolean) {
    const e = await this.prisma.enrollment.findUnique({ where: { id: enrollmentId } });
    if (!e) throw new NotFoundException('Không tìm thấy đăng ký');
    return this.prisma.enrollment.update({ where: { id: enrollmentId }, data: { gradeLocked: locked } });
  }
}
