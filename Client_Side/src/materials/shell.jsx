import React, { useState, useEffect } from 'react';
import { I } from './icons';
import { Avatar, EmptyRow, Pagination, useApp } from './ui';
import { NotificationBell } from './tools';

/* EduManage — App shell: Sidebar, Topbar, DataTable */

function NavItem({ icon, label, active, onClick, collapsed }) {
  return (
    <button onClick={onClick} title={collapsed ? label : undefined} style={{
      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
      padding: collapsed ? '11px 0' : '11px 13px', justifyContent: collapsed ? 'center' : 'flex-start',
      borderRadius: 10, fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em',
      color: active ? '#fff' : 'rgba(255,255,255,.62)',
      background: active ? 'linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 80%, #fff))' : 'transparent',
      boxShadow: active ? '0 6px 16px -4px color-mix(in srgb, var(--accent) 60%, transparent)' : 'none',
      transition: 'all .15s', position: 'relative',
    }} onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.07)'; }}
       onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
      <span style={{ display: 'grid', placeItems: 'center', flexShrink: 0 }}>{icon}</span>
      {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{label}</span>}
    </button>
  );
}

function Sidebar({ nav, route, setRoute, user, role, collapsed, mobileOpen, onCloseMobile }) {
  const { t } = useApp();
  const inner = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--sidebar)', width: collapsed ? 76 : 254, transition: 'width .2s' }}>
      <div style={{ padding: collapsed ? '20px 0' : '22px 20px', display: 'flex', alignItems: 'center', gap: 11, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(145deg, var(--accent), #1E3A5F)', display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0, boxShadow: '0 4px 12px -2px color-mix(in srgb, var(--accent) 70%, transparent)' }}>
          <I.faculty size={21}/>
        </div>
        {!collapsed && <div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 16.5, letterSpacing: '-0.02em' }}>EduManage</div>
          <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 11, fontWeight: 500 }}>University Suite</div>
        </div>}
      </div>
      <nav className="hide-scroll" style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '8px 14px' : '8px 14px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {nav.map((item, i) => item.group
          ? (!collapsed && <div key={i} style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.32)', padding: '16px 13px 6px' }}>{t(item.group)}</div>)
          : <NavItem key={i} icon={item.icon} label={t(item.key)} active={route === item.route} collapsed={collapsed}
              onClick={() => { setRoute(item.route); onCloseMobile && onCloseMobile(); }}/>)}
      </nav>
      <div style={{ padding: 14, borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: collapsed ? 0 : '4px 6px', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <Avatar name={user.name} hue={user.hue} size={36}/>
          {!collapsed && <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#fff', fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
          </div>}
        </div>
      </div>
    </div>
  );
  return (
    <>
      <aside className="sidebar-desktop" style={{ flexShrink: 0 }}>{inner}</aside>
      {mobileOpen && (
        <div className="sidebar-mobile" style={{ position: 'fixed', inset: 0, zIndex: 80 }}>
          <div onClick={onCloseMobile} style={{ position: 'absolute', inset: 0, background: 'rgba(13,20,31,.5)', animation: 'fadeIn .2s' }}/>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, animation: 'slideInRight .25s' }}>{inner}</div>
        </div>
      )}
    </>
  );
}

function Topbar({ title, subtitle, onToggleSidebar, onToggleMobile, onLogout, onSwitchRole, onOpenSearch, onGoto, user, role }) {
  const { t, lang, toggleLang, theme, toggleTheme } = useApp();
  const [menu, setMenu] = useState(false);
  const [roleMenu, setRoleMenu] = useState(false);
  const roles = [['ADMIN', t('management')], ['TEACHER', t('teaching')], ['STUDENT', t('learning')]];
  return (
    <header style={{ height: 68, flexShrink: 0, background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px', position: 'sticky', top: 0, zIndex: 40 }}>
      <button className="btn btn-icon btn-sm btn-ghost menu-desktop" onClick={onToggleSidebar}><I.menu size={19}/></button>
      <button className="btn btn-icon btn-sm btn-ghost menu-mobile" onClick={onToggleMobile}><I.menu size={19}/></button>
      <div style={{ minWidth: 0, flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, letterSpacing: '-0.025em', whiteSpace: 'nowrap' }}>{title}</h1>
        {subtitle && <p style={{ margin: 0, fontSize: 12.5, color: 'var(--muted)' }} className="topbar-sub">{subtitle}</p>}
      </div>
      <div style={{ flex: 1 }}/>
      <div className="topbar-search" style={{ position: 'relative', width: 280 }}>
        <button onClick={onOpenSearch} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', height: 40, padding: '0 12px', borderRadius: 'var(--r-sm)', background: 'var(--surface-3)', boxShadow: 'inset 0 0 0 1px var(--border)', color: 'var(--muted)', transition: 'background .14s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-3)'}>
          <I.search size={16}/>
          <span style={{ fontSize: 13.5, fontWeight: 500 }}>{t('search')}</span>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}><kbd className="kbd">⌘</kbd><kbd className="kbd">K</kbd></span>
        </button>
      </div>
      <button className="btn btn-icon btn-sm btn-ghost menu-mobile" onClick={onOpenSearch} title={t('search')}><I.search size={18}/></button>
      <button className="btn btn-icon btn-sm btn-ghost" onClick={toggleLang} title="Language"><span style={{ fontSize: 12, fontWeight: 800 }}>{lang.toUpperCase()}</span></button>
      <button className="btn btn-icon btn-sm btn-ghost" onClick={toggleTheme}>{theme === 'light' ? <I.moon size={18}/> : <I.sun size={18}/>}</button>
      <NotificationBell role={role} onGoto={onGoto}/>
      <div style={{ width: 1, height: 26, background: 'var(--border)' }}/>
      <div style={{ position: 'relative' }}>
        <button onClick={() => setMenu(m => !m)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '4px 6px 4px 4px', borderRadius: 999 }}>
          <Avatar name={user.name} hue={user.hue} size={34}/>
          <div className="topbar-user" style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{user.name.split(' ').slice(-2).join(' ')}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{roles.find(r => r[0] === role)[1]}</div>
          </div>
          <I.chevD size={15} className="topbar-user"/>
        </button>
        {menu && (
          <>
            <div onClick={() => setMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }}/>
            <div className="card" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 244, padding: 8, zIndex: 50, boxShadow: 'var(--shadow-lg)', animation: 'scaleIn .16s ease' }}>
              <div style={{ padding: '10px 12px', display: 'flex', gap: 11, alignItems: 'center', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                <Avatar name={user.name} hue={user.hue} size={40}/>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                </div>
              </div>
              <MenuRow icon={<I.user size={16}/>} label={t('profile')}/>
              <MenuRow icon={<I.settings size={16}/>} label={t('settings')}/>
              <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }}/>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', padding: '6px 12px 4px' }}>
                {lang === 'vi' ? 'Đổi vai trò (demo)' : 'Switch role (demo)'}
              </div>
              {roles.map(([r, lbl]) => (
                <button key={r} onClick={() => { onSwitchRole(r); setMenu(false); }} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 12px', borderRadius: 8,
                  fontSize: 13.5, fontWeight: 600, color: role === r ? 'var(--accent)' : 'var(--text-2)',
                  background: role === r ? 'color-mix(in srgb, var(--accent) 9%, transparent)' : 'transparent' }}
                  onMouseEnter={e => { if (role !== r) e.currentTarget.style.background = 'var(--surface-3)'; }}
                  onMouseLeave={e => { if (role !== r) e.currentTarget.style.background = 'transparent'; }}>
                  {lbl}{role === r && <I.check size={15}/>}
                </button>
              ))}
              <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }}/>
              <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13.5, fontWeight: 600, color: 'var(--danger)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-soft)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <I.logout size={16}/>{t('logout')}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

function MenuRow({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13.5, fontWeight: 600, color: 'var(--text-2)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      {icon}{label}
    </button>
  );
}

// ---------------- Generic DataTable ----------------
function DataTable({ columns, rows, perPage = 8, renderActions, onRowClick, toolbar, emptyLabel }) {
  const { t } = useApp();
  const [page, setPage] = useState(1);
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  useEffect(() => { if (page > pages) setPage(1); }, [pages, page]);
  const slice = rows.slice((page - 1) * perPage, page * perPage);
  return (
    <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {toolbar}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              {columns.map((c, i) => (
                <th key={i} style={{ textAlign: c.align || 'left', padding: '13px 16px', fontSize: 11.5, fontWeight: 700,
                  letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--muted)', whiteSpace: 'nowrap', width: c.width }}>{c.header}</th>
              ))}
              {renderActions && <th style={{ width: 60, padding: '13px 16px' }}></th>}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && <EmptyRow colSpan={columns.length + (renderActions ? 1 : 0)} label={emptyLabel || t('noData')}/>}
            {slice.map((row, ri) => (
              <tr key={row.id || ri} onClick={() => onRowClick && onRowClick(row)} style={{ borderBottom: ri < slice.length - 1 ? '1px solid var(--border)' : 'none', cursor: onRowClick ? 'pointer' : 'default', transition: 'background .12s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {columns.map((c, ci) => (
                  <td key={ci} style={{ padding: '13px 16px', fontSize: 14, textAlign: c.align || 'left', color: 'var(--text)', whiteSpace: c.nowrap ? 'nowrap' : 'normal' }}>
                    {c.cell ? c.cell(row) : row[c.key]}
                  </td>
                ))}
                {renderActions && <td style={{ padding: '8px 16px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>{renderActions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <Pagination page={page} pages={pages} total={total} perPage={perPage} onPage={setPage}/>
      </div>
    </div>
  );
}

// Page container
function Page({ children }) {
  return <div className="anim-fade" style={{ padding: 'clamp(18px, 3vw, 30px)', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>{children}</div>;
}

// Section header
function SectionHead({ title, desc, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</h2>
        {desc && <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--muted)' }}>{desc}</p>}
      </div>
      {right}
    </div>
  );
}

export { Sidebar, Topbar, DataTable, Page, SectionHead, MenuRow };
