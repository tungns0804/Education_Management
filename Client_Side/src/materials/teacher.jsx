import React, { useState, useEffect, useMemo } from 'react';
import { DB } from './db';
import { I } from './icons';
import { Avatar, Segmented, StatCard, useApp, useToast } from './ui';
import { BarChart } from './charts';
import { Page, SectionHead } from './shell';
import { AttendanceHistory } from './details';

/* EduManage — Teacher screens: Dashboard, My Sections, Attendance, Grade Entry */

// Build a deterministic roster for a section
function rosterFor(sectionId, n = 12) {
  const idx = parseInt(sectionId.replace(/\D/g, '')) || 0;
  return DB.STUDENTS.slice(idx % 20, idx % 20 + n).map(s => s);
}

const TEACHER_SECTIONS = DB.SECTIONS.slice(0, 4);

function TeacherDashboard() {
  const { t, lang, tn } = useApp();
  const totalStudents = TEACHER_SECTIONS.reduce((a, s) => a + s.enrolled, 0);
  const attendanceTrend = [
    { term: 'T1', value: 92 }, { term: 'T2', value: 88 }, { term: 'T3', value: 95 },
    { term: 'T4', value: 90 }, { term: 'T5', value: 94 }, { term: 'T6', value: 97 },
  ];
  return (
    <Page>
      <div className="grid-stats">
        <StatCard icon={<I.layers size={22}/>} label={t('mySections')} value={TEACHER_SECTIONS.length} accent="#2F6FED"/>
        <StatCard icon={<I.users size={22}/>} label={lang==='vi'?'Tổng sinh viên':'Total students'} value={totalStudents} accent="#1F8A5B"/>
        <StatCard icon={<I.checkCircle size={22}/>} label={lang==='vi'?'Tỉ lệ điểm danh':'Attendance rate'} value="93%" delta="+2%" deltaUp accent="#8B5CF6"/>
        <StatCard icon={<I.clipboard size={22}/>} label={lang==='vi'?'Chờ nhập điểm':'Pending grades'} value="2" accent="#C9821A"/>
      </div>
      <div className="grid-2-1">
        <div className="card" style={{ padding: 22 }}>
          <SectionHead title={lang==='vi'?'Tỉ lệ chuyên cần theo buổi':'Attendance by session'} desc={lang==='vi'?'Trung bình các lớp phụ trách':'Average across your sections'}/>
          <div style={{ marginTop: 18 }}><BarChart data={attendanceTrend.map(d => ({ label: d.term, value: d.value, color: '#2F6FED' }))} height={220}/></div>
        </div>
        <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
          <SectionHead title={lang==='vi'?'Lịch hôm nay':'Today\'s schedule'}/>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TEACHER_SECTIONS.slice(0, 3).map((s, i) => {
              const sub = DB.MAP.subject[s.subjectId];
              return (
                <div key={s.id} style={{ display: 'flex', gap: 13, padding: 13, borderRadius: 12, background: 'var(--surface-3)' }}>
                  <div style={{ width: 4, borderRadius: 4, background: ['#2F6FED','#1F8A5B','#8B5CF6'][i] }}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{tn(sub)}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>{s.schedule}</div>
                  </div>
                  <span className="badge badge-info" style={{ alignSelf: 'center' }}>{s.enrolled} SV</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Page>
  );
}

function MySectionsScreen({ onOpenAttendance, onOpenGrades }) {
  const { t, lang, tn } = useApp();
  return (
    <Page>
      <SectionHead title={t('mySections')} desc={lang==='vi'?'Các lớp học phần bạn được phân công · HK1 2024–2025':'Sections assigned to you · Semester 1'}/>
      <div className="grid-cards">
        {TEACHER_SECTIONS.map((s, i) => {
          const sub = DB.MAP.subject[s.subjectId];
          return (
            <div key={s.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center', color: '#fff',
                  background: ['linear-gradient(145deg,#2F6FED,#1E3A5F)','linear-gradient(145deg,#1F8A5B,#0F5C3A)','linear-gradient(145deg,#8B5CF6,#5B2FB8)','linear-gradient(145deg,#C9821A,#8A5410)'][i] }}>
                  <I.book size={21}/>
                </div>
                <span className="badge badge-muted" style={{ fontFamily: 'var(--mono)' }}>{s.code}</span>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>{tn(sub)}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}><I.clock size={14}/>{s.schedule}</div>
              </div>
              <div style={{ display: 'flex', gap: 18, fontSize: 13 }}>
                <div><div style={{ fontWeight: 800, fontSize: 18 }}>{s.enrolled}</div><div style={{ color: 'var(--muted)', fontSize: 12 }}>{lang==='vi'?'Sinh viên':'Students'}</div></div>
                <div><div style={{ fontWeight: 800, fontSize: 18 }}>{sub.credits}</div><div style={{ color: 'var(--muted)', fontSize: 12 }}>{t('credits')}</div></div>
              </div>
              <div style={{ display: 'flex', gap: 9, marginTop: 'auto' }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => onOpenAttendance(s.id)}><I.checkCircle size={16}/>{t('attendance')}</button>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onOpenGrades(s.id)}><I.pen size={15}/>{t('gradeEntry')}</button>
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
}

function AttendanceScreen({ sectionId }) {
  const { t, lang, tn } = useApp();
  const toast = useToast();
  const [sec, setSec] = useState(sectionId || TEACHER_SECTIONS[0].id);
  const section = DB.MAP.section[sec];
  const sub = DB.MAP.subject[section.subjectId];
  const roster = useMemo(() => rosterFor(sec, 14), [sec]);
  const [marks, setMarks] = useState({});
  const [tab, setTab] = useState('today');
  useEffect(() => {
    const init = {}; roster.forEach((s, i) => { init[s.id] = i % 7 === 3 ? 'ABSENT' : i % 9 === 5 ? 'LATE' : 'PRESENT'; });
    setMarks(init);
  }, [sec]);
  const today = new Date().toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const counts = { PRESENT: 0, ABSENT: 0, LATE: 0 };
  Object.values(marks).forEach(m => counts[m]++);
  const opts = [
    { v: 'PRESENT', label: t('present'), color: 'var(--success)', soft: 'var(--success-soft)', icon: <I.check size={15}/> },
    { v: 'LATE', label: t('late'), color: 'var(--warn)', soft: 'var(--warn-soft)', icon: <I.clock size={15}/> },
    { v: 'ABSENT', label: t('absent'), color: 'var(--danger)', soft: 'var(--danger-soft)', icon: <I.x size={15}/> },
  ];

  return (
    <Page>
      <SectionHead title={t('attendance')} desc={tab === 'today' ? today : (lang==='vi'?'Lịch sử điểm danh cả học kỳ':'Full-semester attendance log')}
        right={<div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Segmented value={tab} onChange={setTab} options={[{ value: 'today', label: t('today') }, { value: 'history', label: t('history') }]}/>
          {tab === 'today' && <button className="btn btn-primary btn-sm" style={{ height: 40 }} onClick={() => toast(lang==='vi'?'Đã lưu điểm danh buổi học':'Attendance saved')}><I.check size={16}/>{lang==='vi'?'Lưu':'Save'}</button>}
        </div>}/>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <select className="select" style={{ height: 44, width: 'auto', minWidth: 260, fontWeight: 600 }} value={sec} onChange={e => setSec(e.target.value)}>
          {TEACHER_SECTIONS.map(s => <option key={s.id} value={s.id}>{tn(DB.MAP.subject[s.subjectId])} · {s.code}</option>)}
        </select>
        {tab === 'today' && <div style={{ display: 'flex', gap: 10, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {opts.map(o => (
            <div key={o.v} className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center', color: o.color, background: o.soft }}>{o.icon}</span>
              <div><div style={{ fontSize: 19, fontWeight: 800, lineHeight: 1 }}>{counts[o.v]}</div><div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{o.label}</div></div>
            </div>
          ))}
        </div>}
      </div>

      {tab === 'history' ? <AttendanceHistory sectionId={sec}/> : (
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead><tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '13px 18px', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--muted)' }}>{t('students')}</th>
              <th style={{ textAlign: 'right', padding: '13px 18px', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--muted)', width: 320 }}>{t('status')}</th>
            </tr></thead>
            <tbody>
              {roster.map((s, ri) => (
                <tr key={s.id} style={{ borderBottom: ri < roster.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '11px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <span style={{ fontSize: 12.5, color: 'var(--muted)', fontFamily: 'var(--mono)', width: 22 }}>{ri + 1}</span>
                      <Avatar name={s.name} hue={s.avatarHue} size={36}/>
                      <div><div style={{ fontWeight: 600 }}>{s.name}</div><div style={{ fontSize: 12.5, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{s.code}</div></div>
                    </div>
                  </td>
                  <td style={{ padding: '11px 18px' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {opts.map(o => {
                        const on = marks[s.id] === o.v;
                        return (
                          <button key={o.v} onClick={() => setMarks(m => ({ ...m, [s.id]: o.v }))} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: '0 13px', borderRadius: 9,
                            fontSize: 13, fontWeight: 600, transition: 'all .14s',
                            color: on ? o.color : 'var(--muted)',
                            background: on ? o.soft : 'var(--surface-3)',
                            boxShadow: on ? `inset 0 0 0 1.5px ${o.color}` : 'none',
                          }}>{o.icon}{o.label}</button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </Page>
  );
}

function GradeEntryScreen({ sectionId }) {
  const { t, lang, tn } = useApp();
  const toast = useToast();
  const [sec, setSec] = useState(sectionId || TEACHER_SECTIONS[0].id);
  const section = DB.MAP.section[sec];
  const roster = useMemo(() => rosterFor(sec, 12), [sec]);
  const [grades, setGrades] = useState({});
  useEffect(() => {
    const init = {}; roster.forEach((s, i) => { init[s.id] = { mid: (6 + (i % 4)).toFixed(1), fin: (5.5 + (i % 5) * 0.8).toFixed(1) }; });
    setGrades(init);
  }, [sec]);
  const calc = (g) => {
    const m = parseFloat(g.mid), f = parseFloat(g.fin);
    if (isNaN(m) || isNaN(f)) return { total: null, letter: '—' };
    const total = +(m * 0.4 + f * 0.6).toFixed(1);
    return { total, letter: DB.letterOf(total) };
  };
  const set = (id, k, v) => { if (v !== '' && (isNaN(v) || v < 0 || v > 10)) return; setGrades(g => ({ ...g, [id]: { ...g[id], [k]: v } })); };
  const letterColor = (l) => l === 'F' ? 'var(--danger)' : l.startsWith('A') ? 'var(--success)' : l.startsWith('D') ? 'var(--warn)' : 'var(--accent)';
  const avg = (() => { const arr = roster.map(s => calc(grades[s.id] || {}).total).filter(x => x != null); return arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : '—'; })();

  return (
    <Page>
      <SectionHead title={t('gradeEntry')} desc={lang==='vi'?'Điểm tổng kết = 40% giữa kỳ + 60% cuối kỳ':'Total = 40% midterm + 60% final'}
        right={<button className="btn btn-primary btn-sm" style={{ height: 40 }} onClick={() => toast(lang==='vi'?'Đã lưu bảng điểm':'Grades saved')}><I.check size={16}/>{lang==='vi'?'Lưu điểm':'Save grades'}</button>}/>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <select className="select" style={{ height: 44, width: 'auto', minWidth: 260, fontWeight: 600 }} value={sec} onChange={e => setSec(e.target.value)}>
          {TEACHER_SECTIONS.map(s => <option key={s.id} value={s.id}>{tn(DB.MAP.subject[s.subjectId])} · {s.code}</option>)}
        </select>
        <div className="card" style={{ padding: '9px 18px', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <I.trendUp size={18} style={{ color: 'var(--accent)' }}/>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{lang==='vi'?'Điểm TB lớp':'Class average'}</span>
          <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--mono)' }}>{avg}</span>
        </div>
      </div>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
            <thead><tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              {[t('students'), t('midterm'), t('final'), t('total'), t('letter')].map((h, i) => (
                <th key={i} style={{ textAlign: i === 0 ? 'left' : 'center', padding: '13px 18px', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--muted)', width: i === 0 ? 'auto' : 130 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {roster.map((s, ri) => {
                const g = grades[s.id] || {};
                const { total, letter } = calc(g);
                return (
                  <tr key={s.id} style={{ borderBottom: ri < roster.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '10px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <Avatar name={s.name} hue={s.avatarHue} size={34}/>
                        <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.name}</div><div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{s.code}</div></div>
                      </div>
                    </td>
                    {['mid', 'fin'].map(k => (
                      <td key={k} style={{ padding: '10px 18px', textAlign: 'center' }}>
                        <input value={g[k] ?? ''} onChange={e => set(s.id, k, e.target.value)} inputMode="decimal"
                          style={{ width: 64, height: 38, textAlign: 'center', fontSize: 14, fontWeight: 600, fontFamily: 'var(--mono)', borderRadius: 9,
                            background: 'var(--surface)', color: 'var(--text)', outline: 'none', boxShadow: 'inset 0 0 0 1px var(--border-strong)' }}
                          onFocus={e => e.target.style.boxShadow = 'inset 0 0 0 1.5px var(--accent), var(--ring)'}
                          onBlur={e => e.target.style.boxShadow = 'inset 0 0 0 1px var(--border-strong)'}/>
                      </td>
                    ))}
                    <td style={{ padding: '10px 18px', textAlign: 'center', fontWeight: 800, fontFamily: 'var(--mono)', fontSize: 15 }}>{total ?? '—'}</td>
                    <td style={{ padding: '10px 18px', textAlign: 'center' }}>
                      <span className="badge" style={{ background: 'color-mix(in srgb,' + letterColor(letter) + ' 13%, transparent)', color: letterColor(letter), fontFamily: 'var(--mono)', fontWeight: 700, minWidth: 38, justifyContent: 'center' }}>{letter}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}

export { TeacherDashboard, MySectionsScreen, AttendanceScreen, GradeEntryScreen, TEACHER_SECTIONS };
