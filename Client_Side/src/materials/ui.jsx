import React, { useState, useEffect, useMemo, useContext, useCallback, createContext } from 'react';
import { DB } from './db';
import { I } from './icons';
import {
  LS_THEME,
  LS_LANG,
  DEFAULT_THEME,
  DEFAULT_LANG,
  TOAST_AUTO_DISMISS_MS,
} from '../constants/storage.constants';

/* EduManage — Shared UI: context, primitives, charts */

// ---------------- App context (theme + language) ----------------
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(LS_THEME) || DEFAULT_THEME);
  const [lang, setLang] = useState(() => localStorage.getItem(LS_LANG)  || DEFAULT_LANG);
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem(LS_THEME, theme); }, [theme]);
  useEffect(() => { localStorage.setItem(LS_LANG, lang); }, [lang]);
  const t = useCallback((k) => (DB.I18N[lang][k] ?? k), [lang]);
  const tn = useCallback((o) => o ? (o['name_' + lang] ?? o.name ?? '') : '', [lang]);
  const val = { theme, setTheme, lang, setLang, t, tn,
    toggleTheme: () => setTheme(x => x === 'light' ? 'dark' : 'light'),
    toggleLang: () => setLang(x => x === 'vi' ? 'en' : 'vi') };
  return <AppCtx.Provider value={val}>{children}</AppCtx.Provider>;
}

// ---------------- Avatar ----------------
function Avatar({ name, hue = 210, size = 38, code }) {
  const initials = (name || '?').split(' ').slice(-2).map(s => s[0]).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      display: 'grid', placeItems: 'center', fontWeight: 700,
      fontSize: size * 0.36, letterSpacing: '-0.02em',
      color: `hsl(${hue} 62% 32%)`,
      background: `hsl(${hue} 70% 92%)`,
      boxShadow: `inset 0 0 0 1px hsl(${hue} 60% 84%)`,
    }}>{initials}</div>
  );
}

// ---------------- Badge for status ----------------
function StatusBadge({ active }) {
  const { t } = useApp();
  return active
    ? <span className="badge badge-success"><span className="dot"></span>{t('active')}</span>
    : <span className="badge badge-danger"><span className="dot"></span>{t('locked')}</span>;
}

// ---------------- Segmented control ----------------
function Segmented({ options, value, onChange, size }) {
  return (
    <div style={{ display: 'inline-flex', background: 'var(--surface-3)', borderRadius: 9, padding: 3, gap: 2 }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          height: size === 'sm' ? 28 : 34, padding: '0 14px', borderRadius: 7,
          fontSize: 13, fontWeight: 600, transition: 'all .15s',
          color: value === o.value ? 'var(--text)' : 'var(--muted)',
          background: value === o.value ? 'var(--surface)' : 'transparent',
          boxShadow: value === o.value ? 'var(--shadow-sm)' : 'none',
        }}>{o.label}</button>
      ))}
    </div>
  );
}

// ---------------- Stat card ----------------
function StatCard({ icon, label, value, delta, deltaUp, accent = 'var(--accent)', tint }) {
  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center',
          color: accent, background: tint || 'color-mix(in srgb, ' + accent + ' 13%, transparent)' }}>{icon}</div>
        {delta != null && (
          <span className="badge" style={{ background: deltaUp ? 'var(--success-soft)' : 'var(--danger-soft)', color: deltaUp ? 'var(--success)' : 'var(--danger)' }}>
            {deltaUp ? <I.arrowUp size={13}/> : <I.arrowDown size={13}/>}{delta}
          </span>
        )}
      </div>
      <div>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 7, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

// ---------------- Pagination ----------------
function Pagination({ page, pages, total, perPage, onPage }) {
  const { t } = useApp();
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(total, page * perPage);
  const nums = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== '…') nums.push('…');
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: '14px 18px' }}>
      <span style={{ fontSize: 13, color: 'var(--muted)' }}>
        {t('showing')} <b style={{ color: 'var(--text-2)' }}>{from}–{to}</b> {t('of')} <b style={{ color: 'var(--text-2)' }}>{total}</b> {t('results')}
      </span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button className="btn btn-icon btn-sm btn-outline" disabled={page === 1} onClick={() => onPage(page - 1)}><I.chevL size={15}/></button>
        {nums.map((n, i) => n === '…'
          ? <span key={i} style={{ padding: '0 6px', color: 'var(--muted)' }}>…</span>
          : <button key={i} onClick={() => onPage(n)} className="btn btn-sm" style={{
              minWidth: 32, height: 32, padding: 0, fontWeight: 600,
              background: n === page ? 'var(--accent)' : 'var(--surface)',
              color: n === page ? '#fff' : 'var(--text)',
              boxShadow: n === page ? 'var(--shadow-sm)' : 'inset 0 0 0 1px var(--border-strong)',
            }}>{n}</button>)}
        <button className="btn btn-icon btn-sm btn-outline" disabled={page === pages} onClick={() => onPage(page + 1)}><I.chevR size={15}/></button>
      </div>
    </div>
  );
}

// ---------------- Drawer (right side) ----------------
function Drawer({ open, onClose, title, subtitle, children, footer, width = 460 }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(13,20,31,.42)', backdropFilter: 'blur(2px)', animation: 'fadeIn .2s ease' }}/>
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 'min(' + width + 'px, 94vw)',
        background: 'var(--surface)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column',
        animation: 'slideInRight .28s cubic-bezier(.22,.61,.36,1)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</h3>
            {subtitle && <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--muted)' }}>{subtitle}</p>}
          </div>
          <button className="btn btn-icon btn-sm btn-ghost" onClick={onClose}><I.x size={18}/></button>
        </div>
        <div className="hide-scroll" style={{ flex: 1, overflowY: 'auto', padding: 24 }}>{children}</div>
        {footer && <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>{footer}</div>}
      </div>
    </div>
  );
}

// ---------------- Modal (centered) ----------------
function Modal({ open, onClose, title, children, footer, width = 440, icon, tone }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  const toneColor = tone === 'danger' ? 'var(--danger)' : 'var(--accent)';
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'grid', placeItems: 'center', padding: 20 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(13,20,31,.5)', backdropFilter: 'blur(2px)', animation: 'fadeIn .2s ease' }}/>
      <div className="card" style={{ position: 'relative', width: 'min(' + width + 'px, 94vw)', padding: 26, animation: 'scaleIn .24s cubic-bezier(.22,.61,.36,1)', boxShadow: 'var(--shadow-lg)' }}>
        {icon && <div style={{ width: 48, height: 48, borderRadius: 14, display: 'grid', placeItems: 'center', marginBottom: 16,
          color: toneColor, background: 'color-mix(in srgb, ' + toneColor + ' 12%, transparent)' }}>{icon}</div>}
        {title && <h3 style={{ margin: '0 0 8px', fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</h3>}
        <div style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.55 }}>{children}</div>
        {footer && <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>{footer}</div>}
      </div>
    </div>
  );
}

// ---------------- Toast ----------------
const ToastCtx = createContext(null);
const useToast = () => useContext(ToastCtx);
function ToastHost({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((msg, tone = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setItems(x => [...x, { id, msg, tone }]);
    setTimeout(() => setItems(x => x.filter(i => i.id !== id)), TOAST_AUTO_DISMISS_MS);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 90, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(it => {
          const c = it.tone === 'danger' ? 'var(--danger)' : it.tone === 'warn' ? 'var(--warn)' : 'var(--success)';
          return (
            <div key={it.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', minWidth: 260, boxShadow: 'var(--shadow-lg)', animation: 'slideUp .3s ease' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', color: c, background: 'color-mix(in srgb,' + c + ' 14%, transparent)', flexShrink: 0 }}>
                {it.tone === 'danger' ? <I.x size={16}/> : it.tone === 'warn' ? <I.bell size={16}/> : <I.check size={16}/>}
              </div>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{it.msg}</span>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

// ---------------- Empty state ----------------
function EmptyRow({ colSpan, label }) {
  return <tr><td colSpan={colSpan} style={{ padding: '48px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>{label}</td></tr>;
}

// ---------------- Form validation ----------------
// validators: { field: (value, form) => errorKeyOrMessage | null }
function useForm(initial, validators = {}) {
  const [form, setForm] = useState(initial);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const reset = useCallback((next) => { setForm(next ?? initial); setTouched({}); setSubmitted(false); }, [initial]);
  const set = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), []);
  const touch = useCallback((k) => setTouched(tc => ({ ...tc, [k]: true })), []);

  const errors = useMemo(() => {
    const e = {};
    for (const k in validators) { const msg = validators[k](form[k], form); if (msg) e[k] = msg; }
    return e;
  }, [form, validators]);

  const isValid = Object.keys(errors).length === 0;
  const showError = (k) => (touched[k] || submitted) ? errors[k] : null;
  const submit = (onValid) => { setSubmitted(true); if (isValid) onValid(form); return isValid; };

  return { form, set, setForm, touched, touch, errors, isValid, showError, submit, reset, submitted };
}

const validate = {
  required: (t) => (v) => (v == null || String(v).trim() === '') ? t('errRequired') : null,
  fullName: (t) => (v) => {
    if (!v || !v.trim()) return t('errRequired');
    if (!/^[\p{L}\s.'-]+$/u.test(v)) return t('errNameChars');
    if (v.trim().split(/\s+/).length < 2) return t('errName');
    return null;
  },
  studentCode: (t, existing, selfCode) => (v) => {
    if (!v || !v.trim()) return t('errRequired');
    if (!/^\d{6,10}$/.test(v.trim())) return t('errCode');
    if (v.trim() !== selfCode && existing.some(c => c === v.trim())) return t('errCodeTaken');
    return null;
  },
  email: (t, opt) => (v) => {
    if (!v || !v.trim()) return opt ? null : t('errRequired');
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : t('errEmail');
  },
  dob: (t) => (v) => {
    if (!v || !v.trim()) return t('errRequired');
    const m = v.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!m) return t('errDob');
    const d = +m[1], mo = +m[2], y = +m[3];
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return t('errDob');
    const age = 2025 - y;
    if (age < 15 || age > 60) return t('errDobAge');
    return null;
  },
};

// Field wrapper with inline error + hint
function FormField({ label, error, hint, optional, children, optionalLabel }) {
  return (
    <div className="field">
      {label && <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {label}{optional && <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)' }}>· {optionalLabel}</span>}
      </label>}
      {children}
      <div style={{ minHeight: error ? 'auto' : 0, transition: 'all .15s' }}>
        {error
          ? <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--danger)', fontWeight: 500 }}><I.alert size={13}/>{error}</span>
          : hint ? <span style={{ fontSize: 12, color: 'var(--muted)' }}>{hint}</span> : null}
      </div>
    </div>
  );
}

// input/select className helper for error state
function fieldCls(error) { return error ? 'input input-error' : 'input'; }

export { AppCtx, useApp, AppProvider, Avatar, StatusBadge, Segmented, StatCard, Pagination, Drawer, Modal, ToastHost, useToast, EmptyRow, useForm, validate, FormField, fieldCls };
