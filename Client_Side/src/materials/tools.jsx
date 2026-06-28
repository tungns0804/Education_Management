import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DB } from './db';
import { I } from './icons';
import { Avatar, Drawer, Segmented, useApp, useToast } from './ui';

/* EduManage — Global search (command palette), CSV export, bulk import */

// ============== CSV export ==============
function downloadCSV(filename, headers, rows) {
  const esc = (v) => {
    const s = String(v == null ? '' : v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [headers.map(esc).join(',')].concat(rows.map(r => r.map(esc).join(',')));
  const csv = '\uFEFF' + lines.join('\r\n'); // BOM for Excel UTF-8
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// ============== Global Search (command palette) ==============
function buildSearchIndex(tn) {
  const idx = [];
  DB.STUDENTS.forEach(s => idx.push({ type: 'student', id: s.id, title: s.name, sub: s.code + ' · ' + DB.MAP.class[s.classId].name, hue: s.avatarHue, kw: (s.name + ' ' + s.code + ' ' + s.email).toLowerCase() }));
  DB.TEACHERS.forEach(tc => idx.push({ type: 'teacher', id: tc.id, title: tc.name, sub: tc.code + ' · ' + tn(DB.MAP.faculty[tc.facultyId]), hue: tc.avatarHue, kw: (tc.name + ' ' + tc.code).toLowerCase() }));
  DB.SUBJECTS.forEach(sub => idx.push({ type: 'subject', id: sub.id, title: tn(sub), sub: sub.code + ' · ' + sub.credits + ' TC', kw: (tn(sub) + ' ' + sub.code).toLowerCase() }));
  DB.SECTIONS.forEach(sec => { const sub = DB.MAP.subject[sec.subjectId]; idx.push({ type: 'section', id: sec.id, title: tn(sub) + ' · ' + sec.code, sub: DB.MAP.teacher[sec.teacherId].name + ' · ' + sec.schedule, kw: (tn(sub) + ' ' + sec.code).toLowerCase() }); });
  DB.FACULTIES.forEach(f => idx.push({ type: 'faculty', id: f.id, title: tn(f), sub: f.code, kw: (tn(f) + ' ' + f.code).toLowerCase() }));
  DB.MAJORS.forEach(m => idx.push({ type: 'major', id: m.id, title: tn(m), sub: m.code + ' · ' + tn(DB.MAP.faculty[m.facultyId]), kw: (tn(m) + ' ' + m.code).toLowerCase() }));
  DB.CLASSES.forEach(c => idx.push({ type: 'class', id: c.id, title: c.name, sub: c.code, kw: (c.name + ' ' + c.code).toLowerCase() }));
  return idx;
}

const TYPE_META = {
  student: { icon: I.user, color: '#2F6FED', label_vi: 'Sinh viên', label_en: 'Student', route: ['ADMIN', 'a-student-detail', 'id'] },
  teacher: { icon: I.teacher, color: '#1F8A5B', label_vi: 'Giảng viên', label_en: 'Teacher', route: ['ADMIN', 'a-teachers'] },
  subject: { icon: I.book, color: '#C9821A', label_vi: 'Môn học', label_en: 'Subject', route: ['ADMIN', 'a-subject'] },
  section: { icon: I.layers, color: '#8B5CF6', label_vi: 'Lớp học phần', label_en: 'Section', route: ['ADMIN', 'a-sections'] },
  faculty: { icon: I.faculty, color: '#0E9F9F', label_vi: 'Khoa', label_en: 'Faculty', route: ['ADMIN', 'a-faculty'] },
  major: { icon: I.major, color: '#EC6A9C', label_vi: 'Ngành', label_en: 'Major', route: ['ADMIN', 'a-major'] },
  class: { icon: I.class, color: '#5B8DEF', label_vi: 'Lớp', label_en: 'Class', route: ['ADMIN', 'a-class'] },
};

function GlobalSearch({ open, onClose, onGoto }) {
  const { t, lang, tn } = useApp();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const index = useMemo(() => buildSearchIndex(tn), [lang]);

  useEffect(() => { if (open) { setQ(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 30); } }, [open]);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const needle = q.toLowerCase().trim();
    const scored = [];
    for (const it of index) {
      const i = it.kw.indexOf(needle);
      if (i >= 0) scored.push({ ...it, score: (it.kw.startsWith(needle) ? 0 : 1) * 1000 + i });
    }
    return scored.sort((a, b) => a.score - b.score).slice(0, 24);
  }, [q, index]);

  useEffect(() => { setActive(0); }, [q]);

  const go = (r) => {
    const meta = TYPE_META[r.type];
    const [role, route, paramKey] = meta.route;
    onGoto(role, route, paramKey ? { [paramKey]: r.id } : {});
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (e.key === 'Escape') { onClose(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(results.length - 1, a + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
      else if (e.key === 'Enter' && results[active]) { e.preventDefault(); go(results[active]); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, results, active]);

  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]');
    el && el.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const quick = [
    { type: 'student', label: lang==='vi'?'Sinh viên':'Students', route: ['ADMIN','a-students'] },
    { type: 'teacher', label: lang==='vi'?'Giảng viên':'Teachers', route: ['ADMIN','a-teachers'] },
    { type: 'subject', label: lang==='vi'?'Môn học':'Subjects', route: ['ADMIN','a-subject'] },
    { type: 'section', label: lang==='vi'?'Lớp học phần':'Sections', route: ['ADMIN','a-sections'] },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 85, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '11vh' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(13,20,31,.5)', backdropFilter: 'blur(3px)', animation: 'fadeIn .18s ease' }}/>
      <div className="card" style={{ position: 'relative', width: 'min(620px, 94vw)', maxHeight: '74vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', animation: 'scaleIn .2s cubic-bezier(.22,.61,.36,1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <I.search size={20} style={{ color: 'var(--muted)', flexShrink: 0 }}/>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder={t('searchEverything')}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, color: 'var(--text)', fontWeight: 500 }}/>
          <button className="btn btn-sm btn-ghost" onClick={onClose} style={{ height: 26, padding: '0 8px', fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>ESC</button>
        </div>

        <div ref={listRef} className="hide-scroll" style={{ overflowY: 'auto', padding: 8 }}>
          {!q.trim() && (
            <div style={{ padding: '6px 8px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', padding: '6px 8px' }}>{t('jumpTo')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {quick.map(qk => {
                  const meta = TYPE_META[qk.type];
                  return (
                    <button key={qk.label} onClick={() => { onGoto(qk.route[0], qk.route[1], {}); onClose(); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 12px', borderRadius: 10, background: 'var(--surface-3)', textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-3)'}>
                      <span style={{ width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center', color: meta.color, background: 'color-mix(in srgb,' + meta.color + ' 14%, transparent)' }}><meta.icon size={16}/></span>
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{qk.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {q.trim() && results.length === 0 && (
            <div style={{ padding: '44px 0', textAlign: 'center', color: 'var(--muted)' }}>
              <I.search size={30} style={{ opacity: .4 }}/>
              <div style={{ marginTop: 12, fontSize: 14, fontWeight: 500 }}>{t('noResults')}</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>“{q}”</div>
            </div>
          )}

          {results.map((r, i) => {
            const meta = TYPE_META[r.type];
            const isActive = i === active;
            return (
              <button key={r.type + r.id} data-active={isActive} onClick={() => go(r)} onMouseMove={() => setActive(i)}
                style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', padding: '10px 12px', borderRadius: 10, textAlign: 'left',
                  background: isActive ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent', transition: 'background .1s' }}>
                {r.hue != null
                  ? <Avatar name={r.title} hue={r.hue} size={34}/>
                  : <span style={{ width: 34, height: 34, borderRadius: 9, display: 'grid', placeItems: 'center', flexShrink: 0, color: meta.color, background: 'color-mix(in srgb,' + meta.color + ' 14%, transparent)' }}><meta.icon size={17}/></span>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.sub}</div>
                </div>
                <span className="badge badge-muted" style={{ flexShrink: 0 }}>{meta['label_' + lang]}</span>
                {isActive && <I.corner size={15} style={{ color: 'var(--muted)', flexShrink: 0 }}/>}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 16, padding: '10px 16px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', flexShrink: 0 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><kbd className="kbd">↑</kbd><kbd className="kbd">↓</kbd>{t('navigate')}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><kbd className="kbd">↵</kbd>{t('select')}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><kbd className="kbd">esc</kbd>{t('toClose')}</span>
          {q.trim() && <span style={{ marginLeft: 'auto' }}>{results.length} {t('results')}</span>}
        </div>
      </div>
    </div>
  );
}

// ============== Bulk Import drawer ==============
const SAMPLE_CSV = `Họ tên,Mã SV,Giới tính,Ngày sinh,Lớp,Email cá nhân
Nguyễn Văn Khôi,20216101,Nam,12/03/2004,KTPM2021A,khoi.nv@gmail.com
Trần Thị Bình An,20216102,Nữ,28/07/2004,KTPM2021A,binhan.tt@gmail.com
Lê Hoàng Phúc,20226103,Nam,05/11/2004,KHMT2022A,phuc.lh@gmail.com
Phạm Gia Hân,20226104,Nữ,19/01/2005,HTTT2022A,
Đỗ Minh Quân,,Nam,30/09/2004,KTPM2021B,quan.dm@gmail.com`;

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return { rows: [] };
  // simple split (no quoted commas in sample); handle quotes minimally
  const splitLine = (l) => {
    const out = []; let cur = '', inQ = false;
    for (let i = 0; i < l.length; i++) {
      const c = l[i];
      if (c === '"') inQ = !inQ;
      else if (c === ',' && !inQ) { out.push(cur); cur = ''; }
      else cur += c;
    }
    out.push(cur);
    return out.map(s => s.trim());
  };
  const header = splitLine(lines[0]);
  const looksHeader = /họ tên|full name|name/i.test(header[0]);
  const dataLines = looksHeader ? lines.slice(1) : lines;
  const classCodes = Object.fromEntries(DB.CLASSES.map(c => [c.code.toUpperCase(), c]));
  const rows = dataLines.map((l, i) => {
    const [name, code, gender, dob, cls, pmail] = splitLine(l);
    const errors = [];
    if (!name) errors.push('name');
    if (!code || !/^\d{6,10}$/.test(code)) errors.push('code');
    const clsObj = classCodes[(cls || '').toUpperCase()];
    if (!clsObj) errors.push('class');
    const g = /nữ|female|f/i.test(gender || '') ? 'F' : 'M';
    return {
      i, name: name || '', code: code || '', gender: g, dob: dob || '',
      classCode: cls || '', classId: clsObj?.id,
      email: code ? code + '@student.school.edu.vn' : '',
      personalEmail: pmail || '', errors,
    };
  });
  return { rows };
}

function genTempPw() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ', nums = '23456789', spec = '!@#$%';
  const low = 'abcdefghijkmnpqrstuvwxyz';
  const pick = (s) => s[Math.floor(Math.random() * s.length)];
  let p = pick(chars) + pick(low) + pick(low) + pick(nums) + pick(nums) + pick(spec) + pick(low) + pick(nums);
  return p.split('').sort(() => Math.random() - 0.5).join('');
}

function BulkImportDrawer({ open, onClose, onProvision }) {
  const { t, lang, tn } = useApp();
  const toast = useToast();
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { if (open) { setText(''); setParsed(null); } }, [open]);
  useEffect(() => { setParsed(text.trim() ? parseCSV(text) : null); }, [text]);

  const readFile = (file) => {
    if (!file) return;
    const fr = new FileReader();
    fr.onload = () => setText(String(fr.result));
    fr.readAsText(file);
  };

  const validRows = parsed ? parsed.rows.filter(r => r.errors.length === 0) : [];
  const errorRows = parsed ? parsed.rows.filter(r => r.errors.length > 0) : [];

  const provision = () => {
    const provisioned = validRows.map(r => ({
      ...r, tempPw: genTempPw(),
      gpa: 0, credits: 0, active: true, avatarHue: Math.floor(Math.random() * 360),
      id: 'IMP' + Date.now() + r.i,
    }));
    onProvision(provisioned);
    toast(`${provisioned.length} ${t('importDone')}`, 'success');
    onClose();
  };

  return (
    <Drawer open={open} onClose={onClose} width={620}
      title={t('importStudents')} subtitle={t('bulkProvision')}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button>
        <button className="btn btn-primary" disabled={validRows.length === 0} onClick={provision}>
          <I.shield size={16}/>{t('provisionNow')} ({validRows.length})
        </button>
      </>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Drop / upload zone */}
        <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); readFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current?.click()}
          style={{ border: '2px dashed ' + (dragOver ? 'var(--accent)' : 'var(--border-strong)'), borderRadius: 14, padding: '24px 20px', textAlign: 'center', cursor: 'pointer',
            background: dragOver ? 'color-mix(in srgb, var(--accent) 7%, transparent)' : 'var(--surface-2)', transition: 'all .15s' }}>
          <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={e => readFile(e.target.files[0])}/>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--info-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}><I.upload size={22}/></div>
          <div style={{ fontSize: 14.5, fontWeight: 600 }}>{t('dropHint')}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>{t('csvColumns')}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{t('orPaste')}</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
        </div>

        <div className="field">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ margin: 0 }}>{t('pasteCsv')}</label>
            <button className="btn btn-sm btn-ghost" style={{ height: 28, fontSize: 12 }} onClick={() => setText(SAMPLE_CSV)}><I.fileText size={14}/>{lang==='vi'?'Dùng mẫu':'Use sample'}</button>
          </div>
          <textarea className="input" rows={5} style={{ fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 1.6 }} value={text} onChange={e => setText(e.target.value)} placeholder={"Họ tên,Mã SV,Giới tính,Ngày sinh,Lớp,Email cá nhân\n…"}/>
        </div>

        {parsed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <span className="badge badge-success"><I.check size={13}/>{validRows.length} {t('validRows')}</span>
              {errorRows.length > 0 && <span className="badge badge-danger"><I.alert size={13}/>{errorRows.length} {t('errorRows')}</span>}
            </div>

            <div className="card" style={{ overflow: 'hidden', boxShadow: 'none', border: '1px solid var(--border)' }}>
              <div style={{ overflowX: 'auto', maxHeight: 280, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 540 }}>
                  <thead><tr style={{ background: 'var(--surface-2)', position: 'sticky', top: 0, zIndex: 1 }}>
                    {[t('name'), t('code'), t('class'), t('generatedEmail')].map((h, i) => (
                      <th key={i} style={{ textAlign: 'left', padding: '9px 12px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--muted)', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {parsed.rows.map((r, ri) => {
                      const bad = r.errors.length > 0;
                      const has = (f) => r.errors.includes(f);
                      return (
                        <tr key={ri} style={{ borderBottom: '1px solid var(--border)', background: bad ? 'color-mix(in srgb, var(--danger) 5%, transparent)' : 'transparent' }}>
                          <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600, color: has('name') ? 'var(--danger)' : 'var(--text)' }}>{r.name || (lang==='vi'?'(thiếu)':'(missing)')}</td>
                          <td style={{ padding: '8px 12px', fontSize: 12.5, fontFamily: 'var(--mono)', color: has('code') ? 'var(--danger)' : 'var(--text-2)' }}>{r.code || '—'}</td>
                          <td style={{ padding: '8px 12px', fontSize: 12.5, color: has('class') ? 'var(--danger)' : 'var(--text-2)' }}>{has('class') ? (r.classCode || '—') + ' ?' : DB.MAP.class[r.classId].name}</td>
                          <td style={{ padding: '8px 12px', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{bad ? '—' : r.email}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 11, padding: 13, background: 'var(--info-soft)', borderRadius: 11, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5 }}>
              <I.spark size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}/>
              {lang==='vi' ? 'Mỗi dòng hợp lệ sẽ được tạo email trường + mật khẩu tạm 8 ký tự ngẫu nhiên, gửi tới email cá nhân. Sinh viên đổi mật khẩu khi đăng nhập lần đầu.'
                           : 'Each valid row gets a school email + random 8-char temporary password, emailed to the personal address. Students change it on first login.'}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

// ============== Notification Center ==============
function relTime(mins, t) {
  if (mins < 1) return t('justNow');
  if (mins < 60) return mins + ' ' + t('minsAgo');
  if (mins < 1440) return Math.floor(mins / 60) + ' ' + t('hoursAgo');
  return Math.floor(mins / 1440) + ' ' + t('daysAgo');
}
const NOTIF_TONE = {
  success: { c: 'var(--success)', soft: 'var(--success-soft)' },
  info: { c: 'var(--accent)', soft: 'var(--info-soft)' },
  warn: { c: 'var(--warn)', soft: 'var(--warn-soft)' },
  danger: { c: 'var(--danger)', soft: 'var(--danger-soft)' },
};

function NotificationBell({ role, onGoto }) {
  const { t, lang } = useApp();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const storeKey = 'em_notif_read_' + role;
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(storeKey) || '[]')); } catch { return new Set(); }
  });
  useEffect(() => {
    try { setReadIds(new Set(JSON.parse(localStorage.getItem(storeKey) || '[]'))); } catch { setReadIds(new Set()); }
    setFilter('all');
  }, [role]);
  const persist = (set) => { localStorage.setItem(storeKey, JSON.stringify([...set])); };

  const list = DB.NOTIFICATIONS[role] || [];
  const unread = list.filter(n => !readIds.has(n.id));
  const shown = filter === 'unread' ? unread : list;

  const markRead = (id) => { setReadIds(prev => { const n = new Set(prev); n.add(id); persist(n); return n; }); };
  const markAll = () => { const n = new Set(list.map(x => x.id)); setReadIds(n); persist(n); };
  const onClick = (n) => { markRead(n.id); if (n.goto) { onGoto(n.goto[0], n.goto[1], n.goto[2] || {}); setOpen(false); } };

  return (
    <div style={{ position: 'relative' }}>
      <button className="btn btn-icon btn-sm btn-ghost" style={{ position: 'relative' }} onClick={() => setOpen(o => !o)}>
        <I.bell size={18}/>
        {unread.length > 0 && <span style={{ position: 'absolute', top: 3, right: 3, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 999, background: 'var(--danger)', color: '#fff', fontSize: 10, fontWeight: 800, display: 'grid', placeItems: 'center', boxShadow: '0 0 0 2px var(--surface)' }}>{unread.length}</span>}
      </button>
      {open && <>
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }}/>
        <div className="card notif-panel" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 380, maxWidth: '92vw', padding: 0, zIndex: 50, boxShadow: 'var(--shadow-lg)', animation: 'scaleIn .16s ease', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 700, letterSpacing: '-0.01em' }}>{t('notifications')}</h3>
            {unread.length > 0 && <span className="badge badge-danger" style={{ height: 20 }}>{unread.length} {t('unread')}</span>}
            <button className="link-btn" onClick={markAll} disabled={unread.length === 0} style={{ marginLeft: 'auto', fontSize: 12.5, fontWeight: 600, color: unread.length ? 'var(--accent)' : 'var(--muted)' }}>{t('markAllRead')}</button>
          </div>
          <div style={{ padding: '8px 12px 0' }}>
            <Segmented size="sm" value={filter} onChange={setFilter} options={[{ value: 'all', label: t('filterAll') }, { value: 'unread', label: t('filterUnread') + (unread.length ? ` (${unread.length})` : '') }]}/>
          </div>
          <div className="hide-scroll" style={{ maxHeight: 380, overflowY: 'auto', padding: 8 }}>
            {shown.length === 0 && (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)' }}>
                <I.checkCircle size={30} style={{ opacity: .4 }}/>
                <div style={{ marginTop: 10, fontSize: 13.5, fontWeight: 500 }}>{t('noNotifications')}</div>
              </div>
            )}
            {shown.map(n => {
              const tone = NOTIF_TONE[n.tone]; const Ic = I[n.icon] || I.bell;
              const isRead = readIds.has(n.id);
              return (
                <button key={n.id} onClick={() => onClick(n)} style={{
                  display: 'flex', gap: 12, width: '100%', padding: '11px 10px', borderRadius: 11, textAlign: 'left', position: 'relative',
                  background: isRead ? 'transparent' : 'color-mix(in srgb, var(--accent) 6%, transparent)', transition: 'background .12s', marginBottom: 2 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
                  onMouseLeave={e => e.currentTarget.style.background = isRead ? 'transparent' : 'color-mix(in srgb, var(--accent) 6%, transparent)'}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', flexShrink: 0, color: tone.c, background: tone.soft }}><Ic size={18}/></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: isRead ? 500 : 700, lineHeight: 1.35, color: 'var(--text)' }}>{n['title_' + lang]}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>{n['body_' + lang]}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}><I.clock size={11}/>{relTime(n.mins, t)}</div>
                  </div>
                  {!isRead && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 6 }}/>}
                </button>
              );
            })}
          </div>
        </div>
      </>}
    </div>
  );
}

export { downloadCSV, GlobalSearch, BulkImportDrawer, parseCSV, genTempPw, NotificationBell };
