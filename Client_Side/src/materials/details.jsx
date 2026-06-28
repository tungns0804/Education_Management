import React, { useState, useMemo } from 'react';
import { DB } from './db';
import { I } from './icons';
import { Avatar, StatCard, StatusBadge, useApp, useToast } from './ui';
import { LineChart, Ring } from './charts';
import { Page, SectionHead } from './shell';
import { StudentDrawer } from './admin';
import { TEACHER_SECTIONS } from './teacher';

/* EduManage — Detail screens: Student Profile, Attendance History, Weekly Timetable */

// ---- deterministic helpers ----
function seedOf(str) { return [...String(str)].reduce((a, c) => a + c.charCodeAt(0), 7); }
function srng(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = s * 16807 % 2147483647) / 2147483647; }
function letterColorOf(l) { return l === 'F' ? 'var(--danger)' : l.startsWith('A') ? 'var(--success)' : l.startsWith('D') ? 'var(--warn)' : 'var(--accent)'; }

// Build a per-student academic record
function studentRecord(student) {
  const r = srng(seedOf(student.code));
  const subs = [...DB.SUBJECTS];
  const chosen = subs.slice(0, 6);
  const sems = ['HK1 2023-2024', 'HK1 2023-2024', 'HK2 2023-2024', 'HK2 2023-2024', 'HK1 2024-2025', 'HK1 2024-2025'];
  const base = student.gpa; // ~2.1..4
  const transcript = chosen.map((sub, i) => {
    const target = Math.max(4, Math.min(9.5, base * 2.3 + (r() - 0.5) * 2.4));
    const mid = +Math.max(3, Math.min(10, target + (r() - 0.5) * 1.6)).toFixed(1);
    const fin = +Math.max(3, Math.min(10, target + (r() - 0.5) * 1.6)).toFixed(1);
    const total = +(mid * 0.4 + fin * 0.6).toFixed(1);
    return { subject: sub.id, sem: sems[i], midterm: mid, final: fin, total, letter: DB.letterOf(total), credits: sub.credits };
  });
  // current sections (this semester) — 4 distinct
  const offset = Math.floor(r() * (DB.SECTIONS.length - 4));
  const current = DB.SECTIONS.slice(offset, offset + 4);
  // attendance summary per current section
  const attendance = current.map(sec => {
    const total = 12;
    const absent = Math.floor(r() * 4);
    const late = Math.floor(r() * 3);
    const present = total - absent - late;
    return { sectionId: sec.id, total, present, late, absent, rate: Math.round(present / total * 100) };
  });
  return { transcript, current, attendance };
}

function InfoRow({ icon, label, value, mono }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ width: 34, height: 34, borderRadius: 9, display: 'grid', placeItems: 'center', color: 'var(--accent)', background: 'var(--info-soft)', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 13, color: 'var(--muted)', minWidth: 96 }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, marginLeft: 'auto', textAlign: 'right', fontFamily: mono ? 'var(--mono)' : 'inherit', wordBreak: 'break-word' }}>{value}</span>
    </div>
  );
}

function StudentProfile({ studentId, onBack }) {
  const { t, lang, tn } = useApp();
  const toast = useToast();
  const [tick, setTick] = useState(0);
  const force = () => setTick(x => x + 1);
  const [drawer, setDrawer] = useState(null);
  const student = DB.MAP.student[studentId];
  if (!student) return <Page><div>—</div></Page>;
  const onToggle = (s) => { s.active = !s.active; force(); toast(s.active ? (lang==='vi'?'Đã mở khóa tài khoản':'Account unlocked') : (lang==='vi'?'Đã khóa tài khoản':'Account locked'), s.active ? 'success' : 'warn'); };
  const onEdit = () => setDrawer({ mode: 'edit', row: student });
  const cls = DB.MAP.class[student.classId];
  const major = cls && DB.MAP.major[cls.majorId];
  const faculty = major && DB.MAP.faculty[major.facultyId];
  const rec = useMemo(() => studentRecord(student), [studentId]);
  const totalCred = rec.transcript.reduce((a, x) => a + x.credits, 0);
  const avg10 = (rec.transcript.reduce((a, x) => a + x.total * x.credits, 0) / totalCred).toFixed(1);
  const gpa = student.gpa.toFixed(2);
  const avgAtt = Math.round(rec.attendance.reduce((a, x) => a + x.rate, 0) / rec.attendance.length);
  const semesters = [...new Set(rec.transcript.map(x => x.sem))];
  const standing = student.gpa >= 3.6 ? t('excellent') : student.gpa >= 3.2 ? t('good') : t('average');

  return (
    <Page>
      <button className="link-btn" onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--muted)', fontWeight: 600, alignSelf: 'flex-start' }}>
        <I.chevL size={16}/>{t('students')}
      </button>

      {/* Header card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ height: 92, background: `linear-gradient(120deg, #14253B, #1E3A5F 55%, hsl(${student.avatarHue} 55% 38%))`, position: 'relative' }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .4 }}><defs><pattern id="pp" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0H0V26" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#pp)"/></svg>
        </div>
        <div style={{ padding: '0 26px 22px', display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: -38 }}>
          <div style={{ borderRadius: '50%', padding: 4, background: 'var(--surface)' }}>
            <Avatar name={student.name} hue={student.avatarHue} size={84}/>
          </div>
          <div style={{ flex: 1, minWidth: 200, paddingBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: 23, fontWeight: 800, letterSpacing: '-0.02em' }}>{student.name}</h2>
              <StatusBadge active={student.active}/>
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 5, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--mono)' }}>{student.code}</span>
              <span>· {cls.name}</span>
              <span>· {tn(major)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, paddingBottom: 4 }}>
            <button className="btn btn-outline btn-sm" style={{ height: 40 }} onClick={() => onToggle(student)}>
              {student.active ? <I.lock size={16}/> : <I.unlock size={16}/>}{student.active ? t('lock') : t('unlock')}
            </button>
            <button className="btn btn-primary btn-sm" style={{ height: 40 }} onClick={() => onEdit(student)}><I.edit size={15}/>{t('editProfile')}</button>
          </div>
        </div>
      </div>

      <StudentDrawer state={drawer} onClose={() => setDrawer(null)} onSave={(data) => { Object.assign(student, data); force(); toast(lang==='vi'?'Đã lưu thay đổi':'Changes saved'); setDrawer(null); }}/>

      {/* Stats */}
      <div className="grid-stats">
        <StatCard icon={<I.award size={22}/>} label={t('gpa')} value={gpa} accent="#1F8A5B"/>
        <StatCard icon={<I.layers size={22}/>} label={t('credits')} value={student.credits} accent="#2F6FED"/>
        <StatCard icon={<I.book size={22}/>} label={t('enrolledCourses')} value={rec.current.length} accent="#8B5CF6"/>
        <StatCard icon={<I.checkCircle size={22}/>} label={t('rate')} value={avgAtt + '%'} accent={avgAtt >= 80 ? '#1F8A5B' : '#C9821A'}/>
      </div>

      <div className="grid-2-1" style={{ alignItems: 'start' }}>
        {/* Left: transcript + attendance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{t('transcript')}</h3>
              <span className="badge badge-muted">GPA {gpa} · {lang==='vi'?'TB':'Avg'} {avg10} · {standing}</span>
            </div>
            {semesters.map(sem => (
              <div key={sem}>
                <div style={{ padding: '9px 20px', background: 'var(--surface-2)', fontSize: 12.5, fontWeight: 700, color: 'var(--text-2)', borderBottom: '1px solid var(--border)' }}>{sem}</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
                    <thead><tr>
                      {[t('subjects'), t('credits'), t('total'), t('letter')].map((h, i) => (
                        <th key={i} style={{ textAlign: i === 0 ? 'left' : 'center', padding: '8px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {rec.transcript.filter(x => x.sem === sem).map((x, i) => {
                        const sub = DB.MAP.subject[x.subject];
                        return (
                          <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                            <td style={{ padding: '10px 14px', fontWeight: 600, fontSize: 13.5 }}>{tn(sub)}<div style={{ fontSize: 11.5, color: 'var(--muted)', fontFamily: 'var(--mono)', fontWeight: 400 }}>{sub.code}</div></td>
                            <td style={{ padding: '10px 14px', textAlign: 'center', fontFamily: 'var(--mono)' }}>{x.credits}</td>
                            <td style={{ padding: '10px 14px', textAlign: 'center', fontFamily: 'var(--mono)', fontWeight: 800 }}>{x.total}</td>
                            <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                              <span className="badge" style={{ background: 'color-mix(in srgb,' + letterColorOf(x.letter) + ' 13%, transparent)', color: letterColorOf(x.letter), fontFamily: 'var(--mono)', fontWeight: 700, minWidth: 36, justifyContent: 'center' }}>{x.letter}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <SectionHead title={t('attendanceHistory')} desc={lang==='vi'?'Theo từng lớp học phần · HK1 2024–2025':'Per section · Semester 1'}/>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 13 }}>
              {rec.attendance.map(a => {
                const sec = DB.MAP.section[a.sectionId]; const sub = DB.MAP.subject[sec.subjectId];
                const warn = a.rate < 80;
                return (
                  <div key={a.sectionId} style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{tn(sub)}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{sec.code}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 12.5 }}>
                      <span style={{ color: 'var(--success)' }}>● {a.present} {t('present')}</span>
                      <span style={{ color: 'var(--warn)' }}>● {a.late} {t('late')}</span>
                      <span style={{ color: 'var(--danger)' }}>● {a.absent} {t('absent')}</span>
                    </div>
                    <div style={{ width: 120, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 7, borderRadius: 5, background: 'var(--surface-3)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: a.rate + '%', background: warn ? 'var(--danger)' : 'var(--success)' }}/>
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 700, fontFamily: 'var(--mono)', color: warn ? 'var(--danger)' : 'var(--text)', width: 34, textAlign: 'right' }}>{a.rate}%</span>
                    </div>
                    {warn && <span className="badge badge-danger" style={{ flexShrink: 0 }}><I.bell size={12}/>{t('warningAbsent')}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: info + GPA ring */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700 }}>{t('information')}</h3>
            <InfoRow icon={<I.idcard size={17}/>} label={t('code')} value={student.code} mono/>
            <InfoRow icon={<I.cake size={17}/>} label={t('dob')} value={student.dob} mono/>
            <InfoRow icon={<I.user size={17}/>} label={t('gender')} value={student.gender === 'M' ? t('male') : t('female')}/>
            <InfoRow icon={<I.faculty size={17}/>} label={t('faculty')} value={tn(faculty)}/>
            <InfoRow icon={<I.class size={17}/>} label={t('class')} value={cls.name}/>
            <div style={{ height: 8 }}/>
            <h3 style={{ margin: '8px 0 6px', fontSize: 15, fontWeight: 700 }}>{t('contact')}</h3>
            <InfoRow icon={<I.mail size={17}/>} label={t('email')} value={student.email}/>
            <InfoRow icon={<I.mail size={17}/>} label={t('personalEmail')} value={student.personalEmail}/>
          </div>
          <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <SectionHead title={lang==='vi'?'Tiến trình GPA':'GPA progression'}/>
            <Ring value={parseFloat(gpa)} max={4} size={130} thickness={13} color="#1F8A5B" label={gpa} sub={standing}/>
            <div style={{ width: '100%' }}><LineChart data={DB.GPA_TREND} height={140} yMax={4} fmt={v => v.toFixed(1)} accent="#1F8A5B"/></div>
          </div>
        </div>
      </div>
    </Page>
  );
}

// ---------- Attendance History grid (teacher) ----------
function histRoster(sectionId, n = 14) {
  const idx = parseInt(String(sectionId).replace(/\D/g, '')) || 0;
  return DB.STUDENTS.slice(idx % 20, idx % 20 + n);
}
function AttendanceHistory({ sectionId }) {
  const { t, lang } = useApp();
  const roster = useMemo(() => histRoster(sectionId, 14), [sectionId]);
  const sessions = useMemo(() => {
    const arr = []; const d = new Date(2024, 8, 9);
    for (let i = 0; i < 10; i++) { const dt = new Date(d); dt.setDate(d.getDate() + i * 7); arr.push(dt); }
    return arr;
  }, [sectionId]);
  const STAT = { P: { c: 'var(--success)', soft: 'var(--success-soft)', label: t('present') }, L: { c: 'var(--warn)', soft: 'var(--warn-soft)', label: t('late') }, A: { c: 'var(--danger)', soft: 'var(--danger-soft)', label: t('absent') } };
  const grid = useMemo(() => roster.map(s => {
    const r = srng(seedOf(s.code + sectionId));
    return sessions.map(() => { const v = r(); return v > 0.86 ? 'A' : v > 0.76 ? 'L' : 'P'; });
  }), [roster, sessions]);

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{roster.length} {lang==='vi'?'sinh viên':'students'} · {sessions.length} {t('sessions')}</div>
        <div style={{ display: 'flex', gap: 14, marginLeft: 'auto', fontSize: 12.5 }}>
          {Object.entries(STAT).map(([k, v]) => <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-2)' }}><span style={{ width: 11, height: 11, borderRadius: 3, background: v.c }}/>{v.label}</span>)}
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 720 }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              <th style={{ position: 'sticky', left: 0, background: 'var(--surface-2)', textAlign: 'left', padding: '11px 16px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--muted)', minWidth: 200, zIndex: 2, borderBottom: '1px solid var(--border)' }}>{t('students')}</th>
              {sessions.map((d, i) => (
                <th key={i} style={{ padding: '11px 4px', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textAlign: 'center', minWidth: 44, borderBottom: '1px solid var(--border)' }}>
                  {d.getDate()}/{d.getMonth() + 1}
                </th>
              ))}
              <th style={{ padding: '11px 14px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center', minWidth: 92, borderBottom: '1px solid var(--border)' }}>{t('rate')}</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((s, ri) => {
              const row = grid[ri];
              const present = row.filter(x => x === 'P').length;
              const rate = Math.round(present / row.length * 100);
              const warn = rate < 80;
              return (
                <tr key={s.id} style={{ borderBottom: ri < roster.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ position: 'sticky', left: 0, background: 'var(--surface)', padding: '9px 16px', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={s.name} hue={s.avatarHue} size={30}/>
                      <div><div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>{s.name}</div><div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{s.code}</div></div>
                    </div>
                  </td>
                  {row.map((st, ci) => (
                    <td key={ci} style={{ textAlign: 'center', padding: '9px 4px' }}>
                      <span title={STAT[st].label} style={{ display: 'inline-grid', placeItems: 'center', width: 24, height: 24, borderRadius: 7, margin: '0 auto', fontSize: 11, fontWeight: 800, fontFamily: 'var(--mono)', color: STAT[st].c, background: STAT[st].soft }}>{st}</span>
                    </td>
                  ))}
                  <td style={{ textAlign: 'center', padding: '9px 14px' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)', color: warn ? 'var(--danger)' : 'var(--success)' }}>{rate}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Weekly Timetable ----------
function parseSchedule(str) {
  const m = str.match(/T(\d)\s*\((\d+)-(\d+)\)\s*[—-]\s*(.+)/);
  if (!m) return null;
  return { day: +m[1], start: +m[2], end: +m[3], room: m[4].trim() };
}
const SUBJECT_COLORS = ['#2F6FED', '#1F8A5B', '#8B5CF6', '#C9821A', '#EC6A9C', '#0E9F9F'];

function Timetable({ items }) {
  const { t } = useApp();
  const days = [t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat')];
  const PERIODS = 10, ROW_H = 46;
  return (
    <div className="card" style={{ padding: 16, overflowX: 'auto' }}>
      <div style={{ minWidth: 720, display: 'grid', gridTemplateColumns: `56px repeat(6, 1fr)`, gridTemplateRows: `34px repeat(${PERIODS}, ${ROW_H}px)`, gap: 0 }}>
        {/* corner */}
        <div style={{ borderBottom: '1px solid var(--border)' }}/>
        {days.map((d, i) => (
          <div key={i} style={{ borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)', display: 'grid', placeItems: 'center', fontSize: 12.5, fontWeight: 700, color: 'var(--text-2)' }}>{d}</div>
        ))}
        {/* period labels + bg cells */}
        {Array.from({ length: PERIODS }).map((_, p) => (
          <React.Fragment key={p}>
            <div style={{ gridColumn: 1, gridRow: p + 2, display: 'grid', placeItems: 'center', fontSize: 11, color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <span>{t('period')} {p + 1}</span>
            </div>
            {days.map((_, d) => (
              <div key={d} style={{ gridColumn: d + 2, gridRow: p + 2, borderLeft: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}/>
            ))}
          </React.Fragment>
        ))}
        {/* session blocks */}
        {items.map((it, i) => (
          <div key={i} style={{
            gridColumn: it.day, gridRow: `${it.start + 1} / ${it.end + 2}`,
            margin: 4, padding: '8px 10px', borderRadius: 10, overflow: 'hidden',
            background: `color-mix(in srgb, ${it.color} 14%, var(--surface))`,
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${it.color} 35%, transparent)`,
            borderLeft: `3px solid ${it.color}`, display: 'flex', flexDirection: 'column', gap: 3,
          }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: it.color, lineHeight: 1.2, letterSpacing: '-0.01em' }}>{it.title}</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}><I.pin size={11}/>{it.room}</div>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 'auto' }}>{it.code}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScheduleScreen({ role }) {
  const { t, lang, tn } = useApp();
  // pick sections for this user; assign distinct slots so timetable is clean
  const baseSecs = role === 'TEACHER' ? (TEACHER_SECTIONS || DB.SECTIONS.slice(0, 4)) : DB.SECTIONS.slice(0, 5);
  const slots = [
    { day: 2, start: 1, end: 3 }, { day: 3, start: 4, end: 6 }, { day: 4, start: 7, end: 9 },
    { day: 5, start: 1, end: 3 }, { day: 6, start: 4, end: 6 }, { day: 2, start: 7, end: 9 },
  ];
  const rooms = ['P.301', 'P.205', 'Lab A2', 'P.408', 'Hội trường B', 'P.512'];
  const items = baseSecs.map((sec, i) => {
    const sub = DB.MAP.subject[sec.subjectId];
    const slot = slots[i % slots.length];
    return { ...slot, title: tn(sub), code: sec.code, room: rooms[i % rooms.length], color: SUBJECT_COLORS[i % SUBJECT_COLORS.length] };
  });
  return (
    <Page>
      <SectionHead title={t('weeklySchedule')} desc={lang==='vi'?'Học kỳ 1 · 2024–2025':'Semester 1 · 2024–2025'}/>
      <Timetable items={items}/>
      <div className="card" style={{ padding: 20 }}>
        <SectionHead title={t('enrolledCourses')}/>
        <div className="grid-cards" style={{ marginTop: 16 }}>
          {items.map((it, i) => (
            <div key={i} style={{ padding: 14, borderRadius: 12, background: 'var(--surface-3)', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 4, background: it.color }}/>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{it.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{['T2','T3','T4','T5','T6','T7'][it.day-2]} · {t('period')} {it.start}-{it.end} · {it.room}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

export { StudentProfile, AttendanceHistory, ScheduleScreen, Timetable };
