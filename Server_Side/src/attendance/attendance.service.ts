import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findBySection(subjectClassId: string) {
    return this.prisma.attendance.findMany({
      where: { subjectClassId },
      include: {
        student: { select: { id: true, fullName: true, idStudent: true, class: true } },
        markedBy: { select: { id: true, fullName: true } },
      },
      orderBy: [{ date: 'desc' }, { student: { idStudent: 'asc' } }],
    });
  }

  async findMyAttendance(studentId: string, subjectClassId: string) {
    return this.prisma.attendance.findMany({
      where: { studentId, subjectClassId },
      orderBy: { date: 'desc' },
    });
  }

  async bulkMark(data: {
    subjectClassId: string;
    date: string;
    records: Array<{ studentId: string; status: AttendanceStatus; note?: string }>;
    markedById: string;
  }) {
    const sc = await this.prisma.subjectClass.findUnique({ where: { id: data.subjectClassId } });
    if (!sc) throw new NotFoundException('Lớp học phần không tồn tại');
    if (sc.teacherId !== data.markedById)
      throw new ForbiddenException('Bạn không phụ trách lớp học phần này');

    const date = new Date(data.date);
    if (isNaN(date.getTime())) throw new BadRequestException('Ngày không hợp lệ');

    const results = await Promise.allSettled(
      data.records.map(r =>
        this.prisma.attendance.upsert({
          where: {
            subjectClassId_studentId_date: {
              subjectClassId: data.subjectClassId,
              studentId: r.studentId,
              date,
            },
          },
          update: { status: r.status, note: r.note ?? '', markedById: data.markedById },
          create: {
            subjectClassId: data.subjectClassId,
            studentId: r.studentId,
            date,
            status: r.status,
            note: r.note ?? '',
            markedById: data.markedById,
          },
        }),
      ),
    );

    const saved   = results.filter(r => r.status === 'fulfilled').length;
    const failed  = results.filter(r => r.status === 'rejected').length;
    return { saved, failed };
  }

  async updateOne(id: string, teacherId: string, data: { status: AttendanceStatus; note?: string }) {
    const record = await this.prisma.attendance.findUnique({
      where: { id },
      include: { subjectClass: { select: { teacherId: true } } },
    });
    if (!record) throw new NotFoundException('Không tìm thấy bản ghi điểm danh');
    if (record.subjectClass.teacherId !== teacherId)
      throw new ForbiddenException('Bạn không phụ trách lớp học phần này');
    return this.prisma.attendance.update({ where: { id }, data: { status: data.status, note: data.note } });
  }
}
