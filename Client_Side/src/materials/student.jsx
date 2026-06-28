import React, { useState } from 'react';
import { DB } from './db';
import { I } from './icons';
import { Avatar, StatCard, useApp, useToast } from './ui';
import { HBars, LineChart, Ring } from './charts';
import { Page, SectionHead } from './shell';

/* EduManage — Student screens: Dashboard, Registration, Transcript */

const STUDENT = { name: 'Lê Thị Mai Anh', code: '20216001', class: 'KTPM 2021 A', hue: 280, gpa: 3.55, credits: 98, totalCredits: 145 };

function StudentDashboard({ onNav }) {
  const { t, lang, tn } = useApp();
  const enrolled = DB.SECTIONS.slice(0, 4);
  return (
    <Page>
      <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg, #14253B, #1E3A5F 60%, #2F6FED)' }}>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,216,234,.25), transparent 70%)' }}/>
        <div style={{ position: 'relative', padding: 'clamp(22px, 4vw, 34px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Avatar name={STUDENT.name} hue={STUDENT.hue} size={64}/>
            <div>
              <div style={{ fontSize: 13, opacity: .7, fontWeight: 500 }}>{lang==='vi'?'Chào mừng trở lại,':'Welcome back,'}</div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 2 }}>{STUDENT.name}</div>
              <div style={{ fontSize: 13.5, opacity: .78, marginTop: 4 }}>{STUDENT.code} · {STUDENT.class}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            <div><div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>{STUDENT.gpa}</div><div style={{ fontSize: 12.5, opacity: .7 }}>GPA</div></div>
            <div style={{ width: 1, background: 'rgba(255,255,255,.2)' }}/>
            <div><div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>{STUDENT.credits}</div><div style={{ fontSize: 12.5, opacity: .7 }}>{lang==='vi'?'Tín chỉ tích lũy':'Credits earned'}</div></div>
          </div>
        </div>
      </div>

      <div className="grid-stats">
        <StatCard icon={<I.book size={22}/>} label={lang==='vi'?'Môn đang học':'Current courses'} value="6" accent="#2F6FED"/>
        <StatCard icon={<I.award size={22}/>} label="GPA" value={STUDENT.gpa} delta="+0.13" deltaUp accent="#1F8A5B"/>
        <StatCard icon={<I.layers size={22}/>} label={lang==='vi'?'Tín chỉ HK này':'Credits this term'} value="18" accent="#8B5CF6"/>
        <StatCard icon={<I.checkCircle size={22}/>} label={lang==='vi'?'Chuyên cần':'Attendance'} value="96%" accent="#C9821A"/>
      </div>

      <div className="grid-2-1">
        <div className="card" style={{ padding: 22 }}>
          <SectionHead title={lang==='vi'?'Tiến trình GPA':'GPA progression'} desc={lang==='vi'?'5 học kỳ gần nhất':'Last 5 semesters'}/>
          <div style={{ marginTop: 16 }}><LineChart data={DB.GPA_TREND} height={210} yMax={4} fmt={v => v.toFixed(1)}/></div>
        </div>
        <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <SectionHead title={lang==='vi'?'Tiến độ tốt nghiệp':'Degree progress'}/>
          <Ring value={STUDENT.credits} max={STUDENT.totalCredits} size={150} thickness={14} label={Math.round(STUDENT.credits/STUDENT.totalCredits*100) + '%'} sub={lang==='vi'?'hoàn thành':'complete'}/>
          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>{STUDENT.credits} / {STUDENT.totalCredits} {t('credits')}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 22 }}>
        <SectionHead title={lang==='vi'?'Môn học kỳ này':'This semester'} right={<button className="btn btn-sm btn-ghost" onClick={() => onNav('s-reg')}>{t('registration')}<I.chevR size={15}/></button>}/>
        <div className="grid-cards" style={{ marginTop: 16 }}>
          {enrolled.map((s, i) => {
            const sub = DB.MAP.subject[s.subjectId]; const tc = DB.MAP.teacher[s.teacherId];
            return (
              <div key={s.id} style={{ padding: 16, borderRadius: 13, background: 'var(--surface-3)', display: 'flex', flexDirection: 'column', gap: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', color: '#fff', background: ['#2F6FED','#1F8A5B','#8B5CF6','#C9821A'][i % 4] }}><I.book size={18}/></span>
                  <span className="badge badge-muted">{sub.credits} TC</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>{tn(sub)}</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}><I.clock size={13}/>{s.schedule}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );
}

function RegistrationScreen() {
  const { t, lang, tn } = useApp();
  const toast = useToast();
  const [registered, setRegistered] = useState(() => new Set(['SEC00', 'SEC10', 'SEC20']));
  const [q, setQ] = useState('');
  const available = DB.SECTIONS.filter(s => {
    const sub = DB.MAP.subject[s.subjectId];
    return !q || tn(sub).toLowerCase().includes(q.toLowerCase()) || s.code.toLowerCase().includes(q.toLowerCase());
  });
  const regSections = DB.SECTIONS.filter(s => registered.has(s.id));
  const regCredits = regSections.reduce((a, s) => a + DB.MAP.subject[s.subjectId].credits, 0);
  const MAX_CREDITS = 24;
  const toggle = (s) => {
    const sub = DB.MAP.subject[s.subjectId];
    setRegistered(prev => {
      const next = new Set(prev);
      if (next.has(s.id)) { next.delete(s.id); toast(lang==='vi'?`Đã hủy đăng ký ${tn(sub)}`:`Dropped ${tn(sub)}`, 'warn'); }
      else {
        if (regCredits + sub.credits > MAX_CREDITS) { toast(lang==='vi'?`Vượt giới hạn ${MAX_CREDITS} tín chỉ`:`Exceeds ${MAX_CREDITS} credit limit`, 'danger'); return prev; }
        if (s.enrolled >= s.max) { toast(lang==='vi'?'Lớp đã đầy':'Section is full', 'danger'); return prev; }
        next.add(s.id); toast(lang==='vi'?`Đã đăng ký ${tn(sub)}`:`Registered ${tn(sub)}`);
      }
      return next;
    });
  };

  return (
    <Page>
      <SectionHead title={t('registration')} desc={lang==='vi'?'Đăng ký môn học · HK1 2024–2025':'Course registration · Semester 1'}/>
      <div className="grid-2-1" style={{ alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group" style={{ maxWidth: 400 }}><I.search size={16}/><input className="input" style={{ height: 44 }} value={q} onChange={e => setQ(e.target.value)} placeholder={lang==='vi'?'Tìm môn học, mã lớp HP…':'Search subject, section code…'}/></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {available.map(s => {
              const sub = DB.MAP.subject[s.subjectId]; const tc = DB.MAP.teacher[s.teacherId];
              const isReg = registered.has(s.id); const full = s.enrolled >= s.max;
              return (
                <div key={s.id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                  boxShadow: isReg ? 'inset 0 0 0 1.5px var(--accent), var(--shadow-sm)' : 'var(--shadow-sm)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center', flexShrink: 0,
                    color: isReg ? '#fff' : 'var(--accent)', background: isReg ? 'var(--accent)' : 'var(--info-soft)' }}><I.book size={21}/></div>
                  <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>{tn(sub)}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>
                      <span style={{ fontFamily: 'var(--mono)' }}>{s.code}</span> · {tc.name} · {s.schedule}
                    </div>
                  </div>
                  <span className="badge badge-muted">{sub.credits} {t('credits')}</span>
                  <span className="badge" style={{ background: full ? 'var(--danger-soft)' : 'var(--success-soft)', color: full ? 'var(--danger)' : 'var(--success)' }}>{s.enrolled}/{s.max}</span>
                  <button className={isReg ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'} disabled={full && !isReg} onClick={() => toggle(s)} style={{ minWidth: 104 }}>
                    {isReg ? <><I.check size={15}/>{lang==='vi'?'Đã ĐK':'Added'}</> : <><I.plus size={15}/>{lang==='vi'?'Đăng ký':'Register'}</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding: 20, position: 'sticky', top: 88 }}>
          <SectionHead title={lang==='vi'?'Giỏ đăng ký':'Your selection'}/>
          <div style={{ margin: '16px 0', padding: 16, borderRadius: 13, background: 'var(--surface-3)', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>{lang==='vi'?'Tổng tín chỉ':'Total credits'}</div>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', color: regCredits > MAX_CREDITS ? 'var(--danger)' : 'var(--text)' }}>{regCredits}<span style={{ fontSize: 18, color: 'var(--muted)', fontWeight: 600 }}> / {MAX_CREDITS}</span></div>
            <div style={{ height: 7, borderRadius: 5, background: 'var(--border)', overflow: 'hidden', marginTop: 12 }}>
              <div style={{ height: '100%', width: Math.min(100, regCredits/MAX_CREDITS*100) + '%', background: 'var(--accent)', transition: 'width .4s' }}/>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {regSections.length === 0 && <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13.5, padding: '18px 0' }}>{lang==='vi'?'Chưa chọn môn nào':'No courses selected'}</div>}
            {regSections.map(s => {
              const sub = DB.MAP.subject[s.subjectId];
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tn(sub)}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{s.code} · {sub.credits} TC</div>
                  </div>
                  <button className="btn btn-icon btn-sm btn-ghost" onClick={() => toggle(s)} style={{ color: 'var(--danger)' }}><I.x size={15}/></button>
                </div>
              );
            })}
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 16, height: 44 }} disabled={regSections.length === 0} onClick={() => toast(lang==='vi'?'Đã xác nhận đăng ký học phần':'Registration confirmed')}>
            {lang==='vi'?'Xác nhận đăng ký':'Confirm registration'}
          </button>
        </div>
      </div>
    </Page>
  );
}

function TranscriptScreen() {
  const { t, lang, tn } = useApp();
  const rows = DB.DEMO_TRANSCRIPT;
  const totalCred = rows.reduce((a, r) => a + r.credits, 0);
  const gpa = (rows.reduce((a, r) => a + r.total * r.credits, 0) / totalCred).toFixed(2);
  const letterColor = (l) => l === 'F' ? 'var(--danger)' : l.startsWith('A') ? 'var(--success)' : l.startsWith('D') ? 'var(--warn)' : 'var(--accent)';
  const semesters = [...new Set(rows.map(r => r.sem))];
  return (
    <Page>
      <SectionHead title={t('transcript')} desc={lang==='vi'?'Bảng điểm tích lũy toàn khóa':'Cumulative academic record'}
        right={<button className="btn btn-outline btn-sm" style={{ height: 40 }} onClick={() => window.print()}><I.download size={16}/>{lang==='vi'?'Xuất PDF':'Export PDF'}</button>}/>

      <div className="grid-stats">
        <StatCard icon={<I.award size={22}/>} label={lang==='vi'?'GPA tích lũy':'Cumulative GPA'} value={gpa} accent="#1F8A5B"/>
        <StatCard icon={<I.layers size={22}/>} label={lang==='vi'?'Tín chỉ đạt':'Credits passed'} value={totalCred} accent="#2F6FED"/>
        <StatCard icon={<I.book size={22}/>} label={lang==='vi'?'Số môn':'Courses'} value={rows.length} accent="#8B5CF6"/>
        <StatCard icon={<I.trendUp size={22}/>} label={lang==='vi'?'Xếp loại':'Standing'} value={gpa >= 3.6 ? 'Giỏi' : gpa >= 3.2 ? (lang==='vi'?'Khá':'Good') : 'TB'} accent="#C9821A"/>
      </div>

      <div className="grid-2-1" style={{ alignItems: 'start' }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{lang==='vi'?'Chi tiết điểm':'Grade details'}</h3>
          </div>
          {semesters.map(sem => (
            <div key={sem}>
              <div style={{ padding: '10px 20px', background: 'var(--surface-2)', fontSize: 12.5, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '-0.01em', borderBottom: '1px solid var(--border)' }}>{sem}</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 440 }}>
                  <thead><tr>
                    {[t('subjects'), t('credits'), t('midterm'), t('final'), t('total'), t('letter')].map((h, i) => (
                      <th key={i} style={{ textAlign: i === 0 ? 'left' : 'center', padding: '9px 13px', fontSize: 11, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {rows.filter(r => r.sem === sem).map((r, i) => {
                      const sub = DB.MAP.subject[r.subject];
                      return (
                        <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '11px 13px', fontWeight: 600, fontSize: 13.5 }}>{tn(sub)}<div style={{ fontSize: 11.5, color: 'var(--muted)', fontFamily: 'var(--mono)', fontWeight: 400 }}>{sub.code}</div></td>
                          <td style={{ padding: '11px 13px', textAlign: 'center', fontFamily: 'var(--mono)' }}>{r.credits}</td>
                          <td style={{ padding: '11px 13px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{r.midterm}</td>
                          <td style={{ padding: '11px 13px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{r.final}</td>
                          <td style={{ padding: '11px 13px', textAlign: 'center', fontFamily: 'var(--mono)', fontWeight: 800 }}>{r.total}</td>
                          <td style={{ padding: '11px 13px', textAlign: 'center' }}>
                            <span className="badge" style={{ background: 'color-mix(in srgb,' + letterColor(r.letter) + ' 13%, transparent)', color: letterColor(r.letter), fontFamily: 'var(--mono)', fontWeight: 700, minWidth: 38, justifyContent: 'center' }}>{r.letter}</span>
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
        <div className="card" style={{ padding: 22 }}>
          <SectionHead title={lang==='vi'?'Biểu đồ GPA':'GPA trend'}/>
          <div style={{ marginTop: 16 }}><LineChart data={DB.GPA_TREND} height={200} yMax={4} fmt={v => v.toFixed(1)}/></div>
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
            <HBars data={[
              { label: 'A / A+', value: rows.filter(r => r.letter.startsWith('A')).length, color: '#1F8A5B' },
              { label: 'B / B+', value: rows.filter(r => r.letter.startsWith('B')).length, color: '#2F6FED' },
              { label: 'C / C+', value: rows.filter(r => r.letter.startsWith('C')).length, color: '#C9821A' },
            ]}/>
          </div>
        </div>
      </div>
    </Page>
  );
}

export { StudentDashboard, RegistrationScreen, TranscriptScreen };
