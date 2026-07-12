import React from 'react';
import { ROLE_ADMIN, ROLE_TEACHER, ROLE_STUDENT } from '../constants/auth.constants';
// Các trang của admin
import AdminDashboard from '../pages/admin/AdminDashboard';
import StudentsScreen from '../pages/admin/StudentsScreen';
import StudentProfile from '../pages/admin/StudentProfile';
import TeachersScreen from '../pages/admin/TeachersScreen';
import CatalogScreen from '../pages/admin/CatalogScreen';
import SubjectsScreen from '../pages/admin/SubjectsScreen';
import SectionsScreen from '../pages/admin/SectionsScreen';
import SemestersScreen from '../pages/admin/SemestersScreen';
// Các trang của giảng viên
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import MySectionsScreen from '../pages/teacher/MySectionsScreen';
import AttendanceScreen from '../pages/teacher/AttendanceScreen';
import GradeEntryScreen from '../pages/teacher/GradeEntryScreen';
// Các trang của sinh viên
import StudentDashboard from '../pages/student/StudentDashboard';
import RegistrationScreen from '../pages/student/RegistrationScreen';
import TranscriptScreen from '../pages/student/TranscriptScreen';
// Các trang dùng chung
import ScheduleScreen from '../pages/shared/ScheduleScreen';
import ProfilePage from '../pages/profile/ProfilePage';

/* ============================================================
   EduManage — Bảng định tuyến trung tâm (route table)
   Ứng dụng điều hướng bằng route key nội bộ (state) thay vì URL.
   Mỗi route: {
     title:  [titleKey, subtitleKey]  — key i18n cho Topbar (null nếu không có subtitle)
     render: (ctx) => JSX             — ctx = { nav(route, params), params }
   }
   ============================================================ */

// Route mặc định sau đăng nhập của từng vai trò
export const HOME_ROUTE = {
  [ROLE_ADMIN]:   'a-dash',
  [ROLE_TEACHER]: 't-dash',
  [ROLE_STUDENT]: 's-dash',
};

export const ROUTES = {
  // ── Admin ──────────────────────────────────────────────────
  'a-dash':           { title: ['dashboard', 'management'], render: () => <AdminDashboard/> },
  'a-students':       { title: ['students',  'management'], render: ({ nav }) => <StudentsScreen onOpenProfile={(id) => nav('a-student-detail', { id })}/> },
  'a-student-detail': { title: ['students',  'management'], render: ({ nav, params }) => <StudentProfile studentId={params.id} onBack={() => nav('a-students')}/> },
  'a-teachers':       { title: ['teachers',  'management'], render: () => <TeachersScreen/> },
  'a-faculty':        { title: ['faculties', 'academic'],   render: () => <CatalogScreen kind="faculty"/> },
  'a-major':          { title: ['majors',    'academic'],   render: () => <CatalogScreen kind="major"/> },
  'a-class':          { title: ['classes',   'academic'],   render: () => <CatalogScreen kind="class"/> },
  'a-subject':        { title: ['subjects',  'academic'],   render: () => <SubjectsScreen/> },
  'a-sections':       { title: ['sections',  'academic'],   render: () => <SectionsScreen/> },
  'a-semesters':      { title: ['semesters', 'academic'],   render: () => <SemestersScreen/> },
  // ── Teacher ────────────────────────────────────────────────
  't-dash':           { title: ['dashboard',  'teaching'],  render: () => <TeacherDashboard/> },
  't-sections':       { title: ['mySections', 'teaching'],  render: ({ nav }) => <MySectionsScreen onOpenAttendance={(id) => nav('t-attendance', { sectionId: id })} onOpenGrades={(id) => nav('t-grades', { sectionId: id })}/> },
  't-attendance':     { title: ['attendance', 'teaching'],  render: ({ params }) => <AttendanceScreen sectionId={params.sectionId}/> },
  't-grades':         { title: ['gradeEntry', 'teaching'],  render: ({ params }) => <GradeEntryScreen sectionId={params.sectionId}/> },
  't-schedule':       { title: ['schedule',   'teaching'],  render: () => <ScheduleScreen role="TEACHER"/> },
  // ── Student ────────────────────────────────────────────────
  's-dash':           { title: ['dashboard',    'learning'], render: ({ nav }) => <StudentDashboard onNav={nav}/> },
  's-reg':            { title: ['registration', 'learning'], render: () => <RegistrationScreen/> },
  's-schedule':       { title: ['schedule',     'learning'], render: () => <ScheduleScreen role="STUDENT"/> },
  's-transcript':     { title: ['transcript',   'learning'], render: () => <TranscriptScreen/> },
  // ── Dùng chung ─────────────────────────────────────────────
  'profile':          { title: ['myProfile', null],          render: () => <ProfilePage/> },
};
