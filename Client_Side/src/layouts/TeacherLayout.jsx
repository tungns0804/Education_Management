import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, Topbar } from '../materials/shell';
import { useApp } from '../materials/ui';
import { I } from '../materials/icons';

export const NAV = [
  { route: 't-dash',       key: 'dashboard',  icon: <I.grid size={19}/> },
  { group: 'teaching' },
  { route: 't-sections',   key: 'mySections', icon: <I.layers size={19}/> },
  { route: 't-attendance', key: 'attendance', icon: <I.checkCircle size={19}/> },
  { route: 't-grades',     key: 'gradeEntry', icon: <I.pen size={19}/> },
  { route: 't-schedule',   key: 'schedule',   icon: <I.calendar size={19}/> },
];

const TITLE_MAP = {
  't-dash':       ['dashboard',  'teaching'],
  't-sections':   ['mySections', 'teaching'],
  't-attendance': ['attendance', 'teaching'],
  't-grades':     ['gradeEntry', 'teaching'],
  't-schedule':   ['schedule',   'teaching'],
};

export default function TeacherLayout() {
  const { t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Teacher","email":"teacher@school.edu","hue":160}');
  const routeKey = NAV.find(item => item.route && location.pathname.endsWith(item.route.replace('t-', '/')))?.route ?? 't-dash';
  const [titleKey, subtitleKey] = TITLE_MAP[routeKey] ?? ['dashboard', 'teaching'];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        nav={NAV}
        route={routeKey}
        setRoute={(r) => navigate(`/teacher/${r.replace('t-', '')}`)}
        user={user}
        role="TEACHER"
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar
          title={t(titleKey)}
          subtitle={t(subtitleKey)}
          user={user}
          role="TEACHER"
          onToggleSidebar={() => setCollapsed(c => !c)}
          onToggleMobile={() => setMobileOpen(true)}
          onLogout={() => { localStorage.clear(); navigate('/login'); }}
          onSwitchRole={(r) => navigate(`/${r.toLowerCase()}`)}
          onOpenSearch={() => {}}
          onGoto={(_, route) => navigate(route)}
        />
        <main className="hide-scroll" style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
