import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, Topbar } from '../materials/shell';
import { useApp } from '../materials/ui';
import { I } from '../materials/icons';

export const NAV = [
  { route: 'a-dash',     key: 'dashboard', icon: <I.grid size={19}/> },
  { group: 'management' },
  { route: 'a-students', key: 'students',  icon: <I.users size={19}/> },
  { route: 'a-teachers', key: 'teachers',  icon: <I.teacher size={19}/> },
  { group: 'academic' },
  { route: 'a-faculty',  key: 'faculties', icon: <I.faculty size={19}/> },
  { route: 'a-major',    key: 'majors',    icon: <I.major size={19}/> },
  { route: 'a-class',    key: 'classes',   icon: <I.class size={19}/> },
  { route: 'a-subject',  key: 'subjects',  icon: <I.book size={19}/> },
  { route: 'a-sections', key: 'sections',  icon: <I.layers size={19}/> },
];

const TITLE_MAP = {
  'a-dash':     ['dashboard', 'management'],
  'a-students': ['students',  'management'],
  'a-teachers': ['teachers',  'management'],
  'a-faculty':  ['faculties', 'academic'],
  'a-major':    ['majors',    'academic'],
  'a-class':    ['classes',   'academic'],
  'a-subject':  ['subjects',  'academic'],
  'a-sections': ['sections',  'academic'],
};

export default function AdminLayout() {
  const { t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Admin","email":"admin@school.edu","hue":210}');
  const routeKey = NAV.find(item => item.route && location.pathname.endsWith(item.route.replace('a-', '/')))?.route ?? 'a-dash';
  const [titleKey, subtitleKey] = TITLE_MAP[routeKey] ?? ['dashboard', 'management'];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        nav={NAV}
        route={routeKey}
        setRoute={(r) => navigate(`/admin/${r.replace('a-', '')}`)}
        user={user}
        role="ADMIN"
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar
          title={t(titleKey)}
          subtitle={t(subtitleKey)}
          user={user}
          role="ADMIN"
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
