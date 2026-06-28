import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, Topbar } from '../materials/shell';
import { useApp } from '../materials/ui';
import { I } from '../materials/icons';

export const NAV = [
  { route: 's-dash',       key: 'dashboard',    icon: <I.grid size={19}/> },
  { group: 'learning' },
  { route: 's-reg',        key: 'registration', icon: <I.clipboard size={19}/> },
  { route: 's-schedule',   key: 'schedule',     icon: <I.calendar size={19}/> },
  { route: 's-transcript', key: 'transcript',   icon: <I.award size={19}/> },
];

const TITLE_MAP = {
  's-dash':       ['dashboard',    'learning'],
  's-reg':        ['registration', 'learning'],
  's-schedule':   ['schedule',     'learning'],
  's-transcript': ['transcript',   'learning'],
};

export default function StudentLayout() {
  const { t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Student","email":"student@school.edu","hue":40}');
  const routeKey = NAV.find(item => item.route && location.pathname.endsWith(item.route.replace('s-', '/')))?.route ?? 's-dash';
  const [titleKey, subtitleKey] = TITLE_MAP[routeKey] ?? ['dashboard', 'learning'];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        nav={NAV}
        route={routeKey}
        setRoute={(r) => navigate(`/student/${r.replace('s-', '')}`)}
        user={user}
        role="STUDENT"
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar
          title={t(titleKey)}
          subtitle={t(subtitleKey)}
          user={user}
          role="STUDENT"
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
