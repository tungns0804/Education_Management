import request from './request';
import { apiClient } from './axiosClient';
import { API_ENDPOINTS } from '../constants/api.constants';

// ── Các lời gọi không cần xác thực ───────────────────────────────────────────
export const requestLogin          = (data) => request.post(API_ENDPOINTS.LOGIN,           data).then((r) => r.data);
// Làm mới access token bằng refresh token trong cookie
export const requestRefreshToken   = ()     => request.get(API_ENDPOINTS.REFRESH_TOKEN)        .then((r) => r.data);
// Gửi yêu cầu quên mật khẩu (server gửi OTP về email cá nhân)
export const requestForgotPassword = (data) => request.post(API_ENDPOINTS.FORGOT_PASSWORD, data).then((r) => r.data);
// Xác thực mã OTP đã nhập
export const requestVerifyOtp      = (data) => request.post(API_ENDPOINTS.VERIFY_OTP,      data).then((r) => r.data);
// Đặt lại mật khẩu mới bằng OTP
export const requestResetPassword  = (data) => request.post(API_ENDPOINTS.RESET_PASSWORD,  data).then((r) => r.data);

// ── Các lời gọi cần xác thực ─────────────────────────────────────────────────
export const requestMe             = ()     => apiClient.get(API_ENDPOINTS.ME)                          .then((r) => r.data);
// Lấy thông tin phiên đăng nhập hiện tại (khôi phục session khi tải trang)
export const requestAuth           = ()     => request.get(API_ENDPOINTS.AUTH)                        .then((r) => r.data);
// Đăng xuất: server thu hồi token và xóa cookie
export const requestLogout         = ()     => apiClient.post(API_ENDPOINTS.LOGOUT)                   .then((r) => r.data);
// Đổi mật khẩu của người dùng đang đăng nhập
export const requestChangePassword = (data) => apiClient.put(API_ENDPOINTS.CHANGE_PASSWORD, data)     .then((r) => r.data);

// ── Dashboard ────────────────────────────────────────────────────────────────
export const requestDashboard        = ()  => apiClient.get(API_ENDPOINTS.DASHBOARD).then((r) => r.data);
// Lấy số liệu sinh viên theo khoa cho biểu đồ
export const requestStudentsByDepartment = () => apiClient.get(API_ENDPOINTS.STUDENTS_BY_DEPARTMENT).then((r) => r.data);
// Lấy số liệu dashboard của giảng viên
export const requestTeacherDashboard = ()  => apiClient.get(API_ENDPOINTS.TEACHER_DASHBOARD).then((r) => r.data);
// Lấy số liệu dashboard của sinh viên
export const requestStudentDashboard = ()  => apiClient.get(API_ENDPOINTS.STUDENT_DASHBOARD).then((r) => r.data);

// ── Students ─────────────────────────────────────────────────────────────────
export const requestStudents        = (params) => apiClient.get(API_ENDPOINTS.STUDENTS, { params }).then((r) => r.data);
// Tạo sinh viên mới
export const requestCreateStudent   = (data)   => apiClient.post(API_ENDPOINTS.STUDENTS, data)    .then((r) => r.data);
// Xem trước mã sinh viên sẽ được cấp tiếp theo
export const requestNextStudentId   = ()       => apiClient.get(API_ENDPOINTS.NEXT_STUDENT_ID)    .then((r) => r.data);
// Nhập danh sách sinh viên hàng loạt
export const requestBulkImport         = (data) => apiClient.post(API_ENDPOINTS.BULK_IMPORT,          data).then((r) => r.data);
// Nhập danh sách giảng viên hàng loạt
export const requestBulkImportTeachers = (data) => apiClient.post(API_ENDPOINTS.BULK_IMPORT_TEACHERS, data).then((r) => r.data);

// ── Teachers ─────────────────────────────────────────────────────────────────
export const requestTeachers        = (params) => apiClient.get(API_ENDPOINTS.TEACHERS, { params }).then((r) => r.data);
// Tạo giảng viên mới
export const requestCreateTeacher   = (data)   => apiClient.post(API_ENDPOINTS.TEACHERS, data)    .then((r) => r.data);
// Xem trước mã giảng viên sẽ được cấp tiếp theo
export const requestNextTeacherId   = ()       => apiClient.get(API_ENDPOINTS.NEXT_TEACHER_ID)    .then((r) => r.data);

// ── CRUD người dùng (dùng chung cho sinh viên & giảng viên) ──────────────────
export const requestUser             = (id)         => apiClient.get(API_ENDPOINTS.USER(id))                 .then((r) => r.data);
// Cập nhật thông tin người dùng theo id
export const requestUpdateUser       = (id, data)   => apiClient.put(API_ENDPOINTS.USER(id), data)           .then((r) => r.data);
// Khóa / mở khóa tài khoản người dùng
export const requestToggleUserStatus = (id, status) => apiClient.patch(API_ENDPOINTS.USER_STATUS(id), { status }).then((r) => r.data);
// Xóa người dùng theo id
export const requestDeleteUser       = (id)         => apiClient.delete(API_ENDPOINTS.USER(id))              .then((r) => r.data);

// ── Departments ───────────────────────────────────────────────────────────────
export const requestDepartments      = ()         => apiClient.get(API_ENDPOINTS.DEPARTMENTS)               .then((r) => r.data);
// Tạo khoa mới
export const requestCreateDepartment = (data)     => apiClient.post(API_ENDPOINTS.DEPARTMENTS, data)        .then((r) => r.data);
// Cập nhật thông tin khoa
export const requestUpdateDepartment = (id, data) => apiClient.put(API_ENDPOINTS.DEPARTMENT(id), data)      .then((r) => r.data);
// Xóa khoa
export const requestDeleteDepartment = (id)       => apiClient.delete(API_ENDPOINTS.DEPARTMENT(id))         .then((r) => r.data);

// ── Branches ──────────────────────────────────────────────────────────────────
export const requestBranches      = (params)  => apiClient.get(API_ENDPOINTS.BRANCHES, { params }).then((r) => r.data);
// Tạo ngành mới
export const requestCreateBranch  = (data)    => apiClient.post(API_ENDPOINTS.BRANCHES, data)    .then((r) => r.data);
// Cập nhật thông tin ngành
export const requestUpdateBranch  = (id, data)=> apiClient.put(API_ENDPOINTS.BRANCH(id), data)   .then((r) => r.data);
// Xóa ngành
export const requestDeleteBranch  = (id)      => apiClient.delete(API_ENDPOINTS.BRANCH(id))      .then((r) => r.data);

// ── Classes ───────────────────────────────────────────────────────────────────
export const requestClasses      = (params)  => apiClient.get(API_ENDPOINTS.CLASSES, { params }).then((r) => r.data);
// Tạo lớp mới
export const requestCreateClass  = (data)    => apiClient.post(API_ENDPOINTS.CLASSES, data)     .then((r) => r.data);
// Cập nhật thông tin lớp
export const requestUpdateClass  = (id, data)=> apiClient.put(API_ENDPOINTS.CLASS(id), data)    .then((r) => r.data);
// Xóa lớp
export const requestDeleteClass  = (id)      => apiClient.delete(API_ENDPOINTS.CLASS(id))       .then((r) => r.data);

// ── Subjects ──────────────────────────────────────────────────────────────────
export const requestSubjects      = (params)  => apiClient.get(API_ENDPOINTS.SUBJECTS, { params }).then((r) => r.data);
// Tạo môn học mới
export const requestCreateSubject = (data)    => apiClient.post(API_ENDPOINTS.SUBJECTS, data)    .then((r) => r.data);
// Cập nhật thông tin môn học
export const requestUpdateSubject = (id, data)=> apiClient.put(API_ENDPOINTS.SUBJECT(id), data)  .then((r) => r.data);
// Xóa môn học
export const requestDeleteSubject = (id)      => apiClient.delete(API_ENDPOINTS.SUBJECT(id))     .then((r) => r.data);

// ── Subject Classes (Lớp học phần) ────────────────────────────────────────────
export const requestSubjectClasses      = ()         => apiClient.get(API_ENDPOINTS.SUBJECT_CLASSES)               .then((r) => r.data);
// Tạo lớp học phần mới
export const requestCreateSubjectClass  = (data)     => apiClient.post(API_ENDPOINTS.SUBJECT_CLASSES, data)        .then((r) => r.data);
// Cập nhật lớp học phần
export const requestUpdateSubjectClass  = (id, data) => apiClient.put(API_ENDPOINTS.SUBJECT_CLASS(id), data)       .then((r) => r.data);
// Xóa lớp học phần
export const requestDeleteSubjectClass  = (id)       => apiClient.delete(API_ENDPOINTS.SUBJECT_CLASS(id))          .then((r) => r.data);

// ── Lớp học phần của tôi (giảng viên) ────────────────────────────────────────
export const requestMySections    = ()   => apiClient.get(API_ENDPOINTS.MY_SECTIONS)               .then((r) => r.data);
// Lấy danh sách sinh viên của một lớp học phần
export const requestSectionRoster = (id) => apiClient.get(API_ENDPOINTS.SECTION_ROSTER(id))        .then((r) => r.data);

// ── Attendance ────────────────────────────────────────────────────────────────
export const requestAttendance       = (subjectClassId) => apiClient.get(API_ENDPOINTS.ATTENDANCE(subjectClassId))  .then((r) => r.data);
// Sinh viên xem điểm danh của chính mình trong một lớp học phần
export const requestMyAttendance     = (subjectClassId) => apiClient.get(API_ENDPOINTS.MY_ATTENDANCE(subjectClassId)).then((r) => r.data);
// Lưu điểm danh cả lớp trong một ngày
export const requestBulkAttendance   = (data)           => apiClient.post(API_ENDPOINTS.ATTENDANCE_BULK, data)       .then((r) => r.data);
// Sửa một bản ghi điểm danh
export const requestUpdateAttendance = (id, data)       => apiClient.put(API_ENDPOINTS.ATTENDANCE_ONE(id), data)     .then((r) => r.data);

// ── Grades ────────────────────────────────────────────────────────────────────
export const requestGradeSheet      = (subjectClassId) => apiClient.get(API_ENDPOINTS.GRADE_SHEET(subjectClassId))    .then((r) => r.data);
// Cập nhật điểm của một sinh viên trong lớp học phần
export const requestUpdateGrade     = (enrollmentId, data) => apiClient.put(API_ENDPOINTS.GRADE_UPDATE(enrollmentId), data).then((r) => r.data);
// Khóa / mở khóa điểm của một đăng ký học phần
export const requestToggleGradeLock = (enrollmentId, locked) => apiClient.patch(API_ENDPOINTS.GRADE_LOCK(enrollmentId), { locked }).then((r) => r.data);

// ── Đăng ký học phần của sinh viên ───────────────────────────────────────────
export const requestMyEnrollments  = ()                 => apiClient.get(API_ENDPOINTS.MY_ENROLLMENTS)                    .then((r) => r.data);
// Lấy bảng điểm toàn khóa của sinh viên
export const requestTranscript     = ()                 => apiClient.get(API_ENDPOINTS.TRANSCRIPT)                         .then((r) => r.data);
// Lấy diễn biến GPA theo học kỳ
export const requestGpaTrend       = ()                 => apiClient.get(API_ENDPOINTS.GPA_TREND)                          .then((r) => r.data);
// Đăng ký một lớp học phần
export const requestRegister       = (subjectClassId)   => apiClient.post(API_ENDPOINTS.ENROLLMENT, { subjectClassId })    .then((r) => r.data);
// Hủy đăng ký học phần
export const requestDropEnrollment = (id)               => apiClient.delete(API_ENDPOINTS.DROP_ENROLLMENT(id))             .then((r) => r.data);

// ── Semesters (Học kỳ) ───────────────────────────────────────────────────────
export const requestSemesters            = ()         => apiClient.get(API_ENDPOINTS.SEMESTERS)                            .then((r) => r.data);
// Lấy các học kỳ đang kích hoạt
export const requestActiveSemesters      = ()         => apiClient.get(API_ENDPOINTS.SEMESTERS_ACTIVE)                     .then((r) => r.data);
// Tạo học kỳ mới
export const requestCreateSemester       = (name)     => apiClient.post(API_ENDPOINTS.SEMESTERS, { name })                 .then((r) => r.data);
// Cập nhật học kỳ
export const requestUpdateSemester       = (id, data) => apiClient.put(API_ENDPOINTS.SEMESTER(id), data)                   .then((r) => r.data);
// Bật / tắt trạng thái kích hoạt của học kỳ
export const requestToggleSemesterActive = (id)       => apiClient.patch(API_ENDPOINTS.SEMESTER_TOGGLE_ACTIVE(id))         .then((r) => r.data);
// Xóa học kỳ
export const requestDeleteSemester       = (id)       => apiClient.delete(API_ENDPOINTS.SEMESTER(id))                      .then((r) => r.data);
