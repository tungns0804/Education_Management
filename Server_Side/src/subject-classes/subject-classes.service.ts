import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectClassStatus } from '@prisma/client';
import { validateSchedule, schedulesOverlap, formatSchedule, hasSchedule } from '../common/utils/schedule.util';

@Injectable()
export class SubjectClassesService {
  constructor(private readonly prisma: PrismaService) {}

  private sectionInclude = {
    subject: { select: { id: true, code: true, name: true, credits: true } },
    teacher: { select: { id: true, fullName: true, idTeacher: true, degree: true } },
    _count: { select: { enrollments: true } },
  };

  private async getActiveSemesterFilter(): Promise<{ semester?: { in: string[] } }> {
    const active = await this.prisma.semester.findMany({ where: { isActive: true }, select: { name: true } });
    if (active.length === 0) return {};
    return { semester: { in: active.map(s => s.name) } };
  }

  // Lấy danh sách lớp học phần, phạm vi dữ liệu tùy vai trò người gọi
  async findAll(role: string, userId: string) {
    const semFilter = (role === 'teacher' || role === 'student') ? await this.getActiveSemesterFilter() : {};

    const where =
      role === 'teacher'
        ? { teacherId: userId, ...semFilter }
        : role === 'student'
        ? { status: SubjectClassStatus.active, ...semFilter }
        : {};

    return this.prisma.subjectClass.findMany({
      where,
      include: this.sectionInclude,
      orderBy: { code: 'asc' },
    });
  }

  // Lấy các lớp học phần do một giảng viên phụ trách
  async findMySections(teacherId: string) {
    const semFilter = await this.getActiveSemesterFilter();
    return this.prisma.subjectClass.findMany({
      where: { teacherId, ...semFilter },
      include: this.sectionInclude,
      orderBy: { code: 'asc' },
    });
  }

  // Lấy chi tiết một lớp học phần theo id
  async findOne(id: string) {
    const sc = await this.prisma.subjectClass.findUnique({
      where: { id },
      include: this.sectionInclude,
    });
    if (!sc) throw new NotFoundException('Lớp học phần không tồn tại');
    return sc;
  }

  // Lấy danh sách sinh viên đã đăng ký của một lớp học phần
  async findRoster(id: string) {
    await this.findOne(id);
    return this.prisma.enrollment.findMany({
      where: { subjectClassId: id },
      include: {
        student: {
          select: { id: true, fullName: true, idStudent: true, email: true, gender: true, class: true },
        },
      },
      orderBy: { registeredAt: 'asc' },
    });
  }

  /**
   * Nghiệp vụ: một giáo viên không thể dạy 2 lớp học phần trùng lịch
   * (cùng học kỳ, trùng ngày trong tuần và giao nhau về khung giờ).
   * Ném ConflictException kèm thông tin lớp bị trùng để admin biết.
   */
  private async assertTeacherAvailable(
    teacherId: string,
    semester: string,
    schedule: { scheduleDays: number[]; startTime: string; endTime: string },
    excludeId?: string,
  ) {
    if (!hasSchedule(schedule)) return;
    const others = await this.prisma.subjectClass.findMany({
      where: {
        teacherId,
        semester,
        status: { not: SubjectClassStatus.canceled },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: {
        code: true, scheduleDays: true, startTime: true, endTime: true,
        subject: { select: { name: true } },
      },
    });
    const conflict = others.find(o => schedulesOverlap(schedule, o));
    if (conflict) {
      throw new ConflictException(
        `Giáo viên đã có lịch dạy lớp ${conflict.code} (${conflict.subject.name}) vào ${formatSchedule(conflict)} trong học kỳ ${semester}. ` +
        `Vui lòng chọn giáo viên khác hoặc thay đổi lịch học.`,
      );
    }
  }

  async create(data: {
    code: string;
    semester: string;
    maxStudents?: number;
    subjectId: string;
    teacherId: string;
    scheduleDays: number[];
    startTime: string;
    endTime: string;
  }) {
    const existing = await this.prisma.subjectClass.findUnique({ where: { code: data.code } });
    if (existing) throw new ConflictException(`Mã lớp học phần ${data.code} đã tồn tại`);

    validateSchedule(data);
    await this.assertTeacherAvailable(data.teacherId, data.semester, data);

    return this.prisma.subjectClass.create({
      data: { ...data, maxStudents: data.maxStudents ?? 50 },
      include: this.sectionInclude,
    });
  }

  async update(
    id: string,
    data: {
      code?: string; semester?: string; maxStudents?: number; status?: SubjectClassStatus; teacherId?: string;
      scheduleDays?: number[]; startTime?: string; endTime?: string;
    },
  ) {
    const current = await this.findOne(id);

    // Lịch/giáo viên/học kỳ sau khi update = giá trị mới nếu có, ngược lại giữ giá trị cũ
    const effective = {
      teacherId:    data.teacherId    ?? current.teacherId,
      semester:     data.semester     ?? current.semester,
      status:       data.status       ?? current.status,
      scheduleDays: data.scheduleDays ?? current.scheduleDays,
      startTime:    data.startTime    ?? current.startTime,
      endTime:      data.endTime      ?? current.endTime,
    };

    if (data.scheduleDays !== undefined || data.startTime !== undefined || data.endTime !== undefined) {
      validateSchedule(effective);
    }

    if (effective.status !== SubjectClassStatus.canceled && hasSchedule(effective)) {
      await this.assertTeacherAvailable(
        effective.teacherId,
        effective.semester,
        { scheduleDays: effective.scheduleDays, startTime: effective.startTime!, endTime: effective.endTime! },
        id,
      );
    }

    return this.prisma.subjectClass.update({ where: { id }, data, include: this.sectionInclude });
  }

  // Xóa lớp học phần
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.subjectClass.delete({ where: { id } });
    return { deleted: true };
  }
}
