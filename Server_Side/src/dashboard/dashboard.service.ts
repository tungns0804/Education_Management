import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, SubjectClassStatus, AttendanceStatus, EnrollmentStatus } from '@prisma/client';

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

  // Derive the enrolment year (khóa) from a student's idStudent, falling back
  // to a 4-digit year embedded in the class code (e.g. "KTPM2021A" → "2021").
  private studentYear(s: { idStudent: string | null; class: string | null }): string | null {
    const fromId = s.idStudent?.match(/^(?:19|20)\d{2}/)?.[0];
    if (fromId) return fromId;
    return s.class?.match(/(?:19|20)\d{2}/)?.[0] ?? null;
  }

  // Students grouped by department (khoa), optionally filtered by enrolment year.
  async getStudentsByDepartment(year?: string) {
    const [departments, students] = await Promise.all([
      this.prisma.department.findMany({
        select: { code: true, nameDepartment: true },
        orderBy: { code: 'asc' },
      }),
      this.prisma.user.findMany({
        where: { role: Role.student },
        select: { department: true, idStudent: true, class: true },
      }),
    ]);

    const years = Array.from(
      new Set(students.map(s => this.studentYear(s)).filter((y): y is string => !!y)),
    ).sort((a, b) => b.localeCompare(a));

    const filtered = year ? students.filter(s => this.studentYear(s) === year) : students;

    const counts: Record<string, number> = {};
    for (const s of filtered) {
      if (!s.department) continue;
      counts[s.department] = (counts[s.department] ?? 0) + 1;
    }

    const data = departments.map(d => ({
      code: d.code,
      name: d.nameDepartment,
      value: counts[d.code] ?? 0,
    }));

    const total = data.reduce((sum, d) => sum + d.value, 0);

    return { year: year ?? null, years, total, data };
  }

  private async getActiveSemesterFilter(): Promise<{ semester?: { in: string[] } }> {
    const active = await this.prisma.semester.findMany({ where: { isActive: true }, select: { name: true } });
    if (active.length === 0) return {};
    return { semester: { in: active.map(s => s.name) } };
  }

  async getTeacherStats(teacherId: string) {
    const semFilter = await this.getActiveSemesterFilter();
    const sections = await this.prisma.subjectClass.findMany({
      where: { teacherId, ...semFilter },
      include: {
        subject: { select: { id: true, name: true, credits: true, code: true } },
        _count: { select: { enrollments: true } },
      },
    });

    const sectionIds = sections.map(s => s.id);
    const totalSections = sections.length;
    const totalStudents = sections.reduce((s, sc) => s + sc._count.enrollments, 0);

    if (sectionIds.length === 0) {
      return { totalSections: 0, totalStudents: 0, attendanceRate: 0, pendingGrades: 0, sections: [], attendanceTrend: [] };
    }

    const [totalAtt, presentAtt, pendingGrades] = await Promise.all([
      this.prisma.attendance.count({ where: { subjectClassId: { in: sectionIds } } }),
      this.prisma.attendance.count({ where: { subjectClassId: { in: sectionIds }, status: AttendanceStatus.present } }),
      this.prisma.enrollment.count({ where: { subjectClassId: { in: sectionIds }, totalScore: null } }),
    ]);

    const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;

    const attByDate = await this.prisma.attendance.groupBy({
      by: ['date'],
      where: { subjectClassId: { in: sectionIds } },
      _count: { id: true },
      orderBy: { date: 'asc' },
    });

    const presentByDate = await this.prisma.attendance.groupBy({
      by: ['date'],
      where: { subjectClassId: { in: sectionIds }, status: AttendanceStatus.present },
      _count: { id: true },
    });

    const pMap: Record<string, number> = {};
    for (const x of presentByDate) pMap[x.date.toISOString()] = x._count.id;

    const trend = attByDate.slice(-8).map((x, i) => ({
      term: `B${i + 1}`,
      value: x._count.id > 0 ? Math.round(((pMap[x.date.toISOString()] ?? 0) / x._count.id) * 100) : 0,
    }));

    return {
      totalSections,
      totalStudents,
      attendanceRate,
      pendingGrades,
      sections: sections.map(s => ({
        id: s.id, code: s.code, semester: s.semester,
        subjectName: s.subject.name, enrolled: s._count.enrollments, status: s.status,
      })),
      attendanceTrend: trend,
    };
  }

  async getStudentStats(studentId: string) {
    const semFilter = await this.getActiveSemesterFilter();
    const [currentEnrollments, completedEnrollments] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: {
          studentId,
          status: EnrollmentStatus.registered,
          ...(semFilter.semester ? { subjectClass: { semester: { in: semFilter.semester.in } } } : {}),
        },
        include: {
          subjectClass: {
            include: {
              subject: { select: { id: true, name: true, credits: true, code: true } },
              teacher: { select: { id: true, fullName: true } },
            },
          },
        },
        orderBy: { registeredAt: 'desc' },
      }),
      this.prisma.enrollment.findMany({
        where: { studentId, status: EnrollmentStatus.completed },
        include: {
          subjectClass: {
            include: { subject: { select: { credits: true } } },
          },
        },
      }),
    ]);

    const currentCredits = currentEnrollments.reduce((s, e) => s + e.subjectClass.subject.credits, 0);
    const totalCreditsEarned = completedEnrollments.reduce((s, e) => s + e.subjectClass.subject.credits, 0);
    const weightedSum = completedEnrollments.reduce((s, e) => s + (e.totalScore ?? 0) * e.subjectClass.subject.credits, 0);
    const gpa = totalCreditsEarned > 0 ? Math.round((weightedSum / totalCreditsEarned) * 100) / 100 : 0;

    const sectionIds = currentEnrollments.map(e => e.subjectClassId);
    let attendanceRate = 100;
    if (sectionIds.length > 0) {
      const [totalAtt, presentAtt] = await Promise.all([
        this.prisma.attendance.count({ where: { studentId, subjectClassId: { in: sectionIds } } }),
        this.prisma.attendance.count({ where: { studentId, subjectClassId: { in: sectionIds }, status: AttendanceStatus.present } }),
      ]);
      attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 100;
    }

    const semMap: Record<string, { credits: number; weighted: number }> = {};
    for (const e of completedEnrollments) {
      const sem = e.subjectClass.semester ?? 'N/A';
      const cr  = e.subjectClass.subject.credits;
      if (!semMap[sem]) semMap[sem] = { credits: 0, weighted: 0 };
      semMap[sem].credits  += cr;
      semMap[sem].weighted += (e.totalScore ?? 0) * cr;
    }
    const gpaTrend = Object.entries(semMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([term, v]) => ({ term, gpa: v.credits > 0 ? Math.round((v.weighted / v.credits) * 100) / 100 : 0 }));

    return {
      currentCourses: currentEnrollments.length,
      currentCredits,
      totalCreditsEarned,
      gpa,
      attendanceRate,
      currentEnrollments,
      gpaTrend,
    };
  }
}
