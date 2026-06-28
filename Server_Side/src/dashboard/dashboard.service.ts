import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, UserStatus, SubjectClassStatus, LetterGrade } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      totalStudents,
      totalTeachers,
      totalSections,
      totalSubjects,
      totalDepartments,
      maleCount,
      femaleCount,
      activeSections,
      letterGradeCounts,
      recentEnrollments,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: Role.student } }),
      this.prisma.user.count({ where: { role: Role.teacher } }),
      this.prisma.subjectClass.count(),
      this.prisma.subject.count(),
      this.prisma.department.count(),
      this.prisma.user.count({ where: { role: Role.student, gender: 'male' } }),
      this.prisma.user.count({ where: { role: Role.student, gender: 'female' } }),
      this.prisma.subjectClass.count({ where: { status: SubjectClassStatus.active } }),
      this.prisma.enrollment.groupBy({
        by: ['letterGrade'],
        where: { letterGrade: { not: null } },
        _count: { letterGrade: true },
      }),
      this.prisma.enrollment.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    ]);

    const gradeDist: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    for (const g of letterGradeCounts) {
      if (g.letterGrade) gradeDist[g.letterGrade] = g._count.letterGrade;
    }

    return {
      students:       totalStudents,
      teachers:       totalTeachers,
      sections:       totalSections,
      subjects:       totalSubjects,
      departments:    totalDepartments,
      activeSections,
      recentEnrollments,
      gender: { male: maleCount, female: femaleCount, other: totalStudents - maleCount - femaleCount },
      gradeDist,
    };
  }
}
