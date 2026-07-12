import React, { useState } from 'react';
import { I } from '../components/icons';
import { Modal } from '../components/ui';
import { Sidebar, Topbar } from '../components/shell';
import { useApp } from '../context/AppContext';
import { ROUTES, HOME_ROUTE } from '../routes';
import {
  ROLE_ADMIN,
  ROLE_TEACHER,
  ROLE_STUDENT,
  AVATAR_HUE,
  DEMO_USERS,
} from '../constants/auth.constants';

/* ============================================================
   EduManage — MainLayout: khung giao diện chung cho cả 3 vai trò
   (Sidebar + Topbar + vùng nội dung + modal xác nhận đăng xuất).
   Menu điều hướng từng vai trò khai báo tại đây (NAV).
   ============================================================ */

// Menu sidebar theo vai trò — { route, key(i18n), icon } hoặc { group } (tiêu đề nhóm)
const NAV = {
  [ROLE_ADMIN]: [
    { route: 'a-dash',      key: 'dashboard',  icon: <I.grid size={19}/> },
    { group: 'management' },
    { route: 'a-students',  key: 'students',   icon: <I.users size={19}/> },
    { route: 'a-teachers',  key: 'teachers',   icon: <I.teacher size={19}/> },
    { group: 'academic' },
    { route: 'a-faculty',   key: 'faculties',  icon: <I.faculty size={19}/> },
    { route: 'a-major',     key: 'majors',     icon: <I.major size={19}/> },
    { route: 'a-class',     key: 'classes',    icon: <I.class size={19}/> },
    { route: 'a-subject',   key: 'subjects',   icon: <I.book size={19}/> },
    { route: 'a-sections',  key: 'sections',   icon: <I.layers size={19}/> },
    { route: 'a-semesters', key: 'semesters',  icon: <I.calendar size={19}/> },
  ],
  [ROLE_TEACHER]: [
    { route: 't-dash',       key: 'dashboard',  icon: <I.grid size={19}/> },
    { group: 'teaching' },
    { route: 't-sections',   key: 'mySections', icon: <I.layers size={19}/> },
    { route: 't-attendance', key: 'attendance', icon: <I.checkCircle size={19}/> },
    { route: 't-grades',     key: 'gradeEntry', icon: <I.pen size={19}/> },
    { route: 't-schedule',   key: 'schedule',   icon: <I.calendar size={19}/> },
  ],
  [ROLE_STUDENT]: [
    { route: 's-dash',       key: 'dashboard',    icon: <I.grid size={19}/> },
    { group: 'learning' },
    { route: 's-reg',        key: 'registration', icon: <I.clipboard size={19}/> },
    { route: 's-schedule',   key: 'schedule',     icon: <I.calendar size={19}/> },
    { route: 's-transcript', key: 'transcript',   icon: <I.award size={19}/> },
  ],
};

// Khung giao diện chính sau đăng nhập: Sidebar + Topbar + nội dung theo route, dùng chung cho 3 vai trò
export default function MainLayout({ apiUser, onSignOut }) {
  const { t, lang } = useApp();
  const role   = apiUser?.roleKey || ROLE_ADMIN;
  const [route,      setRoute]      = useState(HOME_ROUTE[role]);
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutAsk,  setLogoutAsk]  = useState(false);
  const [params,     setParams]     = useState({});
  // Dựng thông tin người dùng cho sidebar từ dữ liệu API thật
  const user = {
    email: apiUser?.email                                 || DEMO_USERS[role]?.email,
    name:  apiUser?.fullName                              || DEMO_USERS[role]?.name,
    code:  apiUser?.idStudent || apiUser?.idTeacher || 'ADMIN',
    hue:   AVATAR_HUE[role],
  };

  const nav  = (r, p = {}) => { setRoute(r); setParams(p); };
  const goto = (_r, rt, p = {}) => { setRoute(rt); setParams(p); };

  const routeDef = ROUTES[route];
  const [titleKey, subtitleKey] = routeDef?.title ?? ['dashboard', null];
  const title    = t(titleKey);
  const subtitle = subtitleKey ? t(subtitleKey) : '';

  const screen = (routeDef ?? ROUTES['a-dash']).render({ nav, params });

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar nav={NAV[role]} route={route} setRoute={(r) => nav(r)} user={user} role={role}
        collapsed={collapsed} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar title={title} subtitle={subtitle} user={user} role={role}
          onToggleSidebar={() => setCollapsed((c) => !c)} onToggleMobile={() => setMobileOpen(true)}
          onLogout={() => setLogoutAsk(true)} onSwitchRole={() => {}} onGoto={goto}
          onProfile={() => nav('profile')} />
        <main className="hide-scroll" key={route} style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>{screen}</main>
      </div>
      <Modal open={logoutAsk} onClose={() => setLogoutAsk(false)} icon={<I.logout size={22} />}
        title={t('logout') + '?'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setLogoutAsk(false)}>{t('cancel')}</button>
            <button className="btn btn-primary" onClick={() => { setLogoutAsk(false); onSignOut?.(); }}>{t('logout')}</button>
          </>
        }>
        {lang === 'vi' ? 'Bạn có chắc muốn đăng xuất khỏi hệ thống?' : 'Are you sure you want to sign out?'}
      </Modal>
    </div>
  );
}
