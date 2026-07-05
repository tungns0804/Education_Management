import request from './request';
import { apiClient } from './axiosClient';
import { API_ENDPOINTS } from '../constants/api.constants';

// ── Unauthenticated calls ────────────────────────────────────────────────────
export const requestLogin          = (data) => request.post(API_ENDPOINTS.LOGIN,           data).then((r) => r.data);
export const requestRefreshToken   = ()     => request.get(API_ENDPOINTS.REFRESH_TOKEN)        .then((r) => r.data);
export const requestForgotPassword = (data) => request.post(API_ENDPOINTS.FORGOT_PASSWORD, data).then((r) => r.data);
export const requestVerifyOtp      = (data) => request.post(API_ENDPOINTS.VERIFY_OTP,      data).then((r) => r.data);
export const requestResetPassword  = (data) => request.post(API_ENDPOINTS.RESET_PASSWORD,  data).then((r) => r.data);

// ── Authenticated calls ──────────────────────────────────────────────────────
export const requestMe             = ()     => apiClient.get(API_ENDPOINTS.ME)                          .then((r) => r.data);
export const requestAuth           = ()     => request.get(API_ENDPOINTS.AUTH)                        .then((r) => r.data);
export const requestLogout         = ()     => apiClient.post(API_ENDPOINTS.LOGOUT)                   .then((r) => r.data);
export const requestChangePassword = (data) => apiClient.put(API_ENDPOINTS.CHANGE_PASSWORD, data)     .then((r) => r.data);

// ── Dashboard ────────────────────────────────────────────────────────────────
export const requestDashboard        = ()  => apiClient.get(API_ENDPOINTS.DASHBOARD).then((r) => r.data);
export const requestStudentsByDepartment = (year) => apiClient.get(API_ENDPOINTS.STUDENTS_BY_DEPARTMENT, { params: year ? { year } : {} }).then((r) => r.data);
export const requestTeacherDashboard = ()  => apiClient.get(API_ENDPOINTS.TEACHER_DASHBOARD).then((r) => r.data);
export const requestStudentDashboard = ()  => apiClient.get(API_ENDPOINTS.STUDENT_DASHBOARD).then((r) => r.data);

// ── Students ─────────────────────────────────────────────────────────────────
export const requestStudents        = (params) => apiClient.get(API_ENDPOINTS.STUDENTS, { params }).then((r) => r.data);
export const requestCreateStudent   = (data)   => apiClient.post(API_ENDPOINTS.STUDENTS, data)    .then((r) => r.data);
export const requestNextStudentId   = ()       => apiClient.get(API_ENDPOINTS.NEXT_STUDENT_ID)    .then((r) => r.data);
export const requestBulkImport         = (data) => apiClient.post(API_ENDPOINTS.BULK_IMPORT,          data).then((r) => r.data);
export const requestBulkImportTeachers = (data) => apiClient.post(API_ENDPOINTS.BULK_IMPORT_TEACHERS, data).then((r) => r.data);

// ── Teachers ─────────────────────────────────────────────────────────────────
export const requestTeachers        = (params) => apiClient.get(API_ENDPOINTS.TEACHERS, { params }).then((r) => r.data);
export const requestCreateTeacher   = (data)   => apiClient.post(API_ENDPOINTS.TEACHERS, data)    .then((r) => r.data);
export const requestNextTeacherId   = ()       => apiClient.get(API_ENDPOINTS.NEXT_TEACHER_ID)    .then((r) => r.data);

// ── User CRUD (shared for students & teachers) ───────────────────────────────
export const requestUser             = (id)         => apiClient.get(API_ENDPOINTS.USER(id))                 .then((r) => r.data);
export const requestUpdateUser       = (id, data)   => apiClient.put(API_ENDPOINTS.USER(id), data)           .then((r) => r.data);
export const requestToggleUserStatus = (id, status) => apiClient.patch(API_ENDPOINTS.USER_STATUS(id), { status }).then((r) => r.data);
export const requestDeleteUser       = (id)         => apiClient.delete(API_ENDPOINTS.USER(id))              .then((r) => r.data);

// ── Departments ───────────────────────────────────────────────────────────────
export const requestDepartments      = ()         => apiClient.get(API_ENDPOINTS.DEPARTMENTS)               .then((r) => r.data);
export const requestCreateDepartment = (data)     => apiClient.post(API_ENDPOINTS.DEPARTMENTS, data)        .then((r) => r.data);
export const requestUpdateDepartment = (id, data) => apiClient.put(API_ENDPOINTS.DEPARTMENT(id), data)      .then((r) => r.data);
export const requestDeleteDepartment = (id)       => apiClient.delete(API_ENDPOINTS.DEPARTMENT(id))         .then((r) => r.data);

// ── Branches ──────────────────────────────────────────────────────────────────
export const requestBranches      = (params)  => apiClient.get(API_ENDPOINTS.BRANCHES, { params }).then((r) => r.data);
export const requestCreateBranch  = (data)    => apiClient.post(API_ENDPOINTS.BRANCHES, data)    .then((r) => r.data);
export const requestUpdateBranch  = (id, data)=> apiClient.put(API_ENDPOINTS.BRANCH(id), data)   .then((r) => r.data);
export const requestDeleteBranch  = (id)      => apiClient.delete(API_ENDPOINTS.BRANCH(id))      .then((r) => r.data);

// ── Classes ───────────────────────────────────────────────────────────────────
export const requestClasses      = (params)  => apiClient.get(API_ENDPOINTS.CLASSES, { params }).then((r) => r.data);
export const requestCreateClass  = (data)    => apiClient.post(API_ENDPOINTS.CLASSES, data)     .then((r) => r.data);
export const requestUpdateClass  = (id, data)=> apiClient.put(API_ENDPOINTS.CLASS(id), data)    .then((r) => r.data);
export const requestDeleteClass  = (id)      => apiClient.delete(API_ENDPOINTS.CLASS(id))       .then((r) => r.data);

// ── Subjects ──────────────────────────────────────────────────────────────────
export const requestSubjects      = (params)  => apiClient.get(API_ENDPOINTS.SUBJECTS, { params }).then((r) => r.data);
export const requestCreateSubject = (data)    => apiClient.post(API_ENDPOINTS.SUBJECTS, data)    .then((r) => r.data);
export const requestUpdateSubject = (id, data)=> apiClient.put(API_ENDPOINTS.SUBJECT(id), data)  .then((r) => r.data);
export const requestDeleteSubject = (id)      => apiClient.delete(API_ENDPOINTS.SUBJECT(id))     .then((r) => r.data);

// ── Subject Classes (Lớp học phần) ────────────────────────────────────────────
export const requestSubjectClasses      = ()         => apiClient.get(API_ENDPOINTS.SUBJECT_CLASSES)               .then((r) => r.data);
export const requestCreateSubjectClass  = (data)     => apiClient.post(API_ENDPOINTS.SUBJECT_CLASSES, data)        .then((r) => r.data);
export const requestUpdateSubjectClass  = (id, data) => apiClient.put(API_ENDPOINTS.SUBJECT_CLASS(id), data)       .then((r) => r.data);
export const requestDeleteSubjectClass  = (id)       => apiClient.delete(API_ENDPOINTS.SUBJECT_CLASS(id))          .then((r) => r.data);

// ── My Sections (teacher) ─────────────────────────────────────────────────────
export const requestMySections    = ()   => apiClient.get(API_ENDPOINTS.MY_SECTIONS)               .then((r) => r.data);
export const requestSectionRoster = (id) => apiClient.get(API_ENDPOINTS.SECTION_ROSTER(id))        .then((r) => r.data);

// ── Attendance ────────────────────────────────────────────────────────────────
export const requestAttendance       = (subjectClassId) => apiClient.get(API_ENDPOINTS.ATTENDANCE(subjectClassId))  .then((r) => r.data);
export const requestMyAttendance     = (subjectClassId) => apiClient.get(API_ENDPOINTS.MY_ATTENDANCE(subjectClassId)).then((r) => r.data);
export const requestBulkAttendance   = (data)           => apiClient.post(API_ENDPOINTS.ATTENDANCE_BULK, data)       .then((r) => r.data);
export const requestUpdateAttendance = (id, data)       => apiClient.put(API_ENDPOINTS.ATTENDANCE_ONE(id), data)     .then((r) => r.data);

// ── Grades ────────────────────────────────────────────────────────────────────
export const requestGradeSheet      = (subjectClassId) => apiClient.get(API_ENDPOINTS.GRADE_SHEET(subjectClassId))    .then((r) => r.data);
export const requestUpdateGrade     = (enrollmentId, data) => apiClient.put(API_ENDPOINTS.GRADE_UPDATE(enrollmentId), data).then((r) => r.data);
export const requestToggleGradeLock = (enrollmentId, locked) => apiClient.patch(API_ENDPOINTS.GRADE_LOCK(enrollmentId), { locked }).then((r) => r.data);

// ── Student Enrollments ───────────────────────────────────────────────────────
export const requestMyEnrollments  = ()                 => apiClient.get(API_ENDPOINTS.MY_ENROLLMENTS)                    .then((r) => r.data);
export const requestTranscript     = ()                 => apiClient.get(API_ENDPOINTS.TRANSCRIPT)                         .then((r) => r.data);
export const requestGpaTrend       = ()                 => apiClient.get(API_ENDPOINTS.GPA_TREND)                          .then((r) => r.data);
export const requestRegister       = (subjectClassId)   => apiClient.post(API_ENDPOINTS.ENROLLMENT, { subjectClassId })    .then((r) => r.data);
export const requestDropEnrollment = (id)               => apiClient.delete(API_ENDPOINTS.DROP_ENROLLMENT(id))             .then((r) => r.data);

// ── Semesters (Học kỳ) ───────────────────────────────────────────────────────
export const requestSemesters            = ()         => apiClient.get(API_ENDPOINTS.SEMESTERS)                            .then((r) => r.data);
export const requestActiveSemesters      = ()         => apiClient.get(API_ENDPOINTS.SEMESTERS_ACTIVE)                     .then((r) => r.data);
export const requestCreateSemester       = (name)     => apiClient.post(API_ENDPOINTS.SEMESTERS, { name })                 .then((r) => r.data);
export const requestUpdateSemester       = (id, data) => apiClient.put(API_ENDPOINTS.SEMESTER(id), data)                   .then((r) => r.data);
export const requestToggleSemesterActive = (id)       => apiClient.patch(API_ENDPOINTS.SEMESTER_TOGGLE_ACTIVE(id))         .then((r) => r.data);
export const requestDeleteSemester       = (id)       => apiClient.delete(API_ENDPOINTS.SEMESTER(id))                      .then((r) => r.data);
