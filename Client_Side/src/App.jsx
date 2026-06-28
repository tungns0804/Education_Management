/* EduManage — Root app: routing, role switching, providers */
import React, { useState, useEffect } from 'react';
import { I } from './materials/icons';
import { useApp, AppProvider, ToastHost, Modal } from './materials/ui';
import { Sidebar, Topbar } from './materials/shell';
import { GlobalSearch } from './materials/tools';
import LoginUser from './pages/login/LoginUser';
import { AdminDashboard, StudentsScreen } from './materials/admin';
import { TeachersScreen, CatalogScreen, SectionsScreen } from './materials/admin2';
import { TeacherDashboard, MySectionsScreen, AttendanceScreen, GradeEntryScreen } from './materials/teacher';
import { StudentDashboard, RegistrationScreen, TranscriptScreen } from './materials/student';
import { StudentProfile, ScheduleScreen } from './materials/details';
import { NAV as ADMIN_NAV } from './layouts/AdminLayout';
import { NAV as TEACHER_NAV } from './layouts/TeacherLayout';
import { NAV as STUDENT_NAV } from './layouts/StudentLayout';
import { AuthProvider } from './context/AuthContext';
import {
  ROLE_ADMIN,
  ROLE_TEACHER,
  ROLE_STUDENT,
  AVATAR_HUE,
  DEMO_USERS,
} from './constants/auth.constants';

// Navigation items per role
const NAV = {
  [ROLE_ADMIN]:   ADMIN_NAV,
  [ROLE_TEACHER]: TEACHER_NAV,
  [ROLE_STUDENT]: STUDENT_NAV,
};

// Default route shown after login for each role
const HOME_ROUTE = {
  [ROLE_ADMIN]:   'a-dash',
  [ROLE_TEACHER]: 't-dash',
  [ROLE_STUDENT]: 's-dash',
};

function titleFor(route, t) {
  const map = {
    'a-dash':          [t('dashboard'), t('management')],
    'a-students':      [t('students'),  t('management')],
    'a-teachers':      [t('teachers'),  t('management')],
    'a-faculty':       [t('faculties'), t('academic')],
    'a-major':         [t('majors'),    t('academic')],
    'a-class':         [t('classes'),   t('academic')],
    'a-subject':       [t('subjects'),  t('academic')],
    'a-sections':      [t('sections'),  t('academic')],
    'a-student-detail':[t('students'),  t('management')],
    't-dash':          [t('dashboard'), t('teaching')],
    't-sections':      [t('mySections'),t('teaching')],
    't-attendance':    [t('attendance'),t('teaching')],
    't-grades':        [t('gradeEntry'),t('teaching')],
    't-schedule':      [t('schedule'),  t('teaching')],
    's-dash':          [t('dashboard'), t('learning')],
    's-reg':           [t('registration'),t('learning')],
    's-transcript':    [t('transcript'),t('learning')],
    's-schedule':      [t('schedule'),  t('learning')],
  };
  return map[route] || [t('dashboard'), ''];
}

function Shell({ apiUser, onSignOut }) {
  const { t } = useApp();
  const role   = apiUser?.roleKey || ROLE_ADMIN;
  const [route,      setRoute]      = useState(HOME_ROUTE[role]);
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutAsk,  setLogoutAsk]  = useState(false);
  const [params,     setParams]     = useState({});
  const [searchOpen, setSearchOpen] = useState(false);

  // Build sidebar user shape from real API user
  const user = {
    email: apiUser?.email                                 || DEMO_USERS[role]?.email,
    name:  apiUser?.fullName                              || DEMO_USERS[role]?.name,
    code:  apiUser?.idStudent || apiUser?.idTeacher || 'ADMIN',
    hue:   AVATAR_HUE[role],
  };

  const nav  = (r, p = {}) => { setRoute(r); setParams(p); };
  const goto = (_r, rt, p = {}) => { setRoute(rt); setParams(p); };

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const [title, subtitle] = titleFor(route, t);

  let screen = null;
  switch (route) {
    case 'a-dash':          screen = <AdminDashboard />;                                                                                   break;
    case 'a-students':      screen = <StudentsScreen onOpenProfile={(id) => nav('a-student-detail', { id })} />;                           break;
    case 'a-student-detail':screen = <StudentProfile studentId={params.id} onBack={() => nav('a-students')} />;                            break;
    case 'a-teachers':      screen = <TeachersScreen />;                                                                                   break;
    case 'a-faculty':       screen = <CatalogScreen kind="faculty" />;                                                                     break;
    case 'a-major':         screen = <CatalogScreen kind="major" />;                                                                       break;
    case 'a-class':         screen = <CatalogScreen kind="class" />;                                                                       break;
    case 'a-subject':       screen = <CatalogScreen kind="subject" />;                                                                     break;
    case 'a-sections':      screen = <SectionsScreen />;                                                                                   break;
    case 't-dash':          screen = <TeacherDashboard />;                                                                                 break;
    case 't-sections':      screen = <MySectionsScreen onOpenAttendance={(id) => nav('t-attendance', { sectionId: id })} onOpenGrades={(id) => nav('t-grades', { sectionId: id })} />; break;
    case 't-attendance':    screen = <AttendanceScreen sectionId={params.sectionId} />;                                                    break;
    case 't-grades':        screen = <GradeEntryScreen sectionId={params.sectionId} />;                                                    break;
    case 't-schedule':      screen = <ScheduleScreen role="TEACHER" />;                                                                    break;
    case 's-dash':          screen = <StudentDashboard onNav={nav} />;                                                                     break;
    case 's-reg':           screen = <RegistrationScreen />;                                                                               break;
    case 's-schedule':      screen = <ScheduleScreen role="STUDENT" />;                                                                    break;
    case 's-transcript':    screen = <TranscriptScreen />;                                                                                 break;
    default:                screen = <AdminDashboard />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar nav={NAV[role]} route={route} setRoute={(r) => nav(r)} user={user} role={role}
        collapsed={collapsed} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar title={title} subtitle={subtitle} user={user} role={role}
          onToggleSidebar={() => setCollapsed((c) => !c)} onToggleMobile={() => setMobileOpen(true)}
          onLogout={() => setLogoutAsk(true)} onSwitchRole={() => {}} onOpenSearch={() => setSearchOpen(true)} onGoto={goto} />
        <main className="hide-scroll" key={route} style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>{screen}</main>
      </div>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} onGoto={goto} />
      <Modal open={logoutAsk} onClose={() => setLogoutAsk(false)} icon={<I.logout size={22} />}
        title={t('logout') + '?'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setLogoutAsk(false)}>{t('cancel')}</button>
            <button className="btn btn-primary" onClick={() => { setLogoutAsk(false); onSignOut?.(); }}>{t('logout')}</button>
          </>
        }>
        {useApp().lang === 'vi' ? 'Bạn có chắc muốn đăng xuất khỏi hệ thống?' : 'Are you sure you want to sign out?'}
      </Modal>
    </div>
  );
}

function Root() {
  return (
    <LoginUser renderApp={(user, logout) => <Shell key={user.id} apiUser={user} onSignOut={logout} />} />
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastHost>
        <AuthProvider>
          <Root />
        </AuthProvider>
      </ToastHost>
    </AppProvider>
  );
}
