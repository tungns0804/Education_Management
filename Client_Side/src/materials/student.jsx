import React, { useState, useEffect, useMemo } from 'react';
import { I } from './icons';
import { Avatar, StatCard, useApp, useToast } from './ui';
import { HBars, LineChart, Ring } from './charts';
import { Page, SectionHead } from './shell';
import { useAuth } from '../context/AuthContext';
import {
  requestStudentDashboard,
  requestSubjectClasses,
  requestMyEnrollments,
  requestTranscript,
  requestGpaTrend,
  requestRegister,
  requestDropEnrollment,
} from '../config/userRequest';

/* EduManage — Student screens: Dashboard, Registration, Transcript */

// ─── Helpers ──────────────────────────────────────────────────────────────────

function letterColor(l) {
  if (!l) return 'var(--muted)';
  if (l === 'F') return 'var(--danger)';
  if (l === 'A') return 'var(--success)';
  if (l === 'D') return 'var(--warn)';
  return 'var(--accent)';
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)', fontSize: 14 }}>
      <I.book size={32} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }}/>
      {text}
    </div>
  );
}

const COURSE_COLORS = ['#2F6FED', '#1F8A5B', '#8B5CF6', '#C9821A', '#EC6A9C', '#0E9F9F'];

// ─── StudentDashboard ─────────────────────────────────────────────────────────

function StudentDashboard({ onNav }) {
  const { user } = useAuth();
  const { t, lang } = useApp();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestStudentDashboard()
      .then(res => setStats(res.metadata))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const gpaTrend = stats?.gpaTrend ?? [];
  const enrollments = stats?.currentEnrollments ?? [];

  const gpaDisplay = stats?.gpa != null ? stats.gpa.toFixed(2) : '—';
  const standing = stats?.gpa >= 3.6 ? (lang==='vi'?'Xuất sắc':'Excellent')
    : stats?.gpa >= 3.2 ? (lang==='vi'?'Giỏi':'Good')
    : stats?.gpa >= 2.5 ? (lang==='vi'?'Khá':'Fair')
    : (lang==='vi'?'Trung bình':'Average');

  // Map GPA 4.0 scale to 10-point for ring (rough)
  const TOTAL_CREDITS = 145; // typical degree requirement

  return (
    <Page>
      {loading ? <Spinner/> : (
        <>
          {/* Hero banner */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg, #14253B, #1E3A5F 60%, #2F6FED)' }}>
            <div style={{ position: 'absolute', top: -60, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,216,234,.25), transparent 70%)' }}/>
            <div style={{ position: 'relative', padding: 'clamp(22px, 4vw, 34px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <Avatar name={user?.fullName} size={64}/>
                <div>
                  <div style={{ fontSize: 13, opacity: .7, fontWeight: 500 }}>{lang==='vi'?'Chào mừng trở lại,':'Welcome back,'}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 2 }}>{user?.fullName}</div>
                  <div style={{ fontSize: 13.5, opacity: .78, marginTop: 4 }}>
                    {user?.idStudent} · {user?.class || '—'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 28 }}>
                <div>
                  <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>{gpaDisplay}</div>
                  <div style={{ fontSize: 12.5, opacity: .7 }}>GPA</div>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,.2)' }}/>
                <div>
                  <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>{stats?.totalCreditsEarned ?? 0}</div>
                  <div style={{ fontSize: 12.5, opacity: .7 }}>{lang==='vi'?'Tín chỉ tích lũy':'Credits earned'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid-stats">
            <StatCard icon={<I.book size={22}/>} label={lang==='vi'?'Môn đang học':'Current courses'} value={stats?.currentCourses ?? 0} accent="#2F6FED"/>
            <StatCard icon={<I.award size={22}/>} label="GPA" value={gpaDisplay} accent="#1F8A5B"/>
            <StatCard icon={<I.layers size={22}/>} label={lang==='vi'?'Tín chỉ HK này':'Credits this term'} value={stats?.currentCredits ?? 0} accent="#8B5CF6"/>
            <StatCard icon={<I.checkCircle size={22}/>} label={lang==='vi'?'Chuyên cần':'Attendance'} value={`${stats?.attendanceRate ?? 100}%`} accent="#C9821A"/>
          </div>

          <div className="grid-2-1">
            {/* GPA chart */}
            <div className="card" style={{ padding: 22 }}>
              <SectionHead title={lang==='vi'?'Tiến trình GPA':'GPA progression'} desc={lang==='vi'?'Theo từng học kỳ':'By semester'}/>
              <div style={{ marginTop: 16 }}>
                {gpaTrend.length > 0
                  ? <LineChart data={gpaTrend.map(x => ({ term: x.term, value: x.gpa }))} height={210} yMax={4} fmt={v => v.toFixed(1)}/>
                  : <Empty text={lang==='vi'?'Chưa có dữ liệu GPA':'No GPA data yet'}/>
                }
              </div>
            </div>

            {/* Degree progress */}
            <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <SectionHead title={lang==='vi'?'Tiến độ tốt nghiệp':'Degree progress'}/>
              <Ring
                value={stats?.totalCreditsEarned ?? 0}
                max={TOTAL_CREDITS}
                size={150} thickness={14}
                label={`${Math.round(((stats?.totalCreditsEarned ?? 0) / TOTAL_CREDITS) * 100)}%`}
                sub={lang==='vi'?'hoàn thành':'complete'}/>
              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
                {stats?.totalCreditsEarned ?? 0} / {TOTAL_CREDITS} {t('credits')}
              </div>
            </div>
          </div>

          {/* Current semester courses */}
          <div className="card" style={{ padding: 22 }}>
            <SectionHead
              title={lang==='vi'?'Môn học kỳ này':'This semester'}
              right={<button className="btn btn-sm btn-ghost" onClick={() => onNav?.('s-reg')}>{t('registration')}<I.chevR size={15}/></button>}/>
            {enrollments.length === 0
              ? <Empty text={lang==='vi'?'Chưa đăng ký môn nào học kỳ này':'No courses registered this semester'}/>
              : (
              <div className="grid-cards" style={{ marginTop: 16 }}>
                {enrollments.map((e, i) => {
                  const sub = e.subjectClass?.subject;
                  const tc  = e.subjectClass?.teacher;
                  return (
                    <div key={e.id} style={{ padding: 16, borderRadius: 13, background: 'var(--surface-3)', display: 'flex', flexDirection: 'column', gap: 11 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', color: '#fff', background: COURSE_COLORS[i % COURSE_COLORS.length] }}>
                          <I.book size={18}/>
                        </span>
                        <span className="badge badge-muted">{sub?.credits} TC</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>{sub?.name}</div>
                      {tc && <div style={{ fontSize: 12.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}><I.user size={13}/>{tc.fullName}</div>}
                      <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{e.subjectClass?.code}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </Page>
  );
}

// ─── RegistrationScreen ───────────────────────────────────────────────────────

function RegistrationScreen() {
  const { t, lang } = useApp();
  const toast = useToast();

  const [available,    setAvailable]    = useState([]);  // all active subject classes
  const [myEnrollments, setMyEnrollments] = useState([]); // student's current enrollments
  const [loading,      setLoading]      = useState(true);
  const [actionBusy,   setActionBusy]   = useState({});  // { sectionId: true/false }
  const [q,            setQ]            = useState('');
  const [page,         setPage]         = useState(1);
  const PAGE_SIZE = 8;

  const load = async () => {
    setLoading(true);
    try {
      const [secRes, enrRes] = await Promise.all([requestSubjectClasses(), requestMyEnrollments()]);
      setAvailable(secRes.metadata || []);
      setMyEnrollments(enrRes.metadata || []);
    } catch {
      toast(lang==='vi'?'Không thể tải dữ liệu':'Failed to load data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const registeredMap = useMemo(() => {
    const m = {};
    myEnrollments.forEach(e => { m[e.subjectClassId] = e.id; });
    return m;
  }, [myEnrollments]);

  const regSections = useMemo(() =>
    available.filter(s => registeredMap[s.id]),
    [available, registeredMap]);

  const regCredits = useMemo(() =>
    regSections.reduce((a, s) => a + (s.subject?.credits ?? 0), 0),
    [regSections]);

  const filtered = useMemo(() =>
    available.filter(s => {
      if (!q) return true;
      return (
        s.subject?.name?.toLowerCase().includes(q.toLowerCase()) ||
        s.code?.toLowerCase().includes(q.toLowerCase()) ||
        s.teacher?.fullName?.toLowerCase().includes(q.toLowerCase())
      );
    }), [available, q]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const MAX_CREDITS = 24;

  const register = async (section) => {
    setActionBusy(p => ({ ...p, [section.id]: true }));
    try {
      const res = await requestRegister(section.id);
      setMyEnrollments(prev => [...prev, res.metadata]);
      toast(lang==='vi'?`Đã đăng ký ${section.subject?.name}`:`Registered ${section.subject?.name}`);
    } catch (err) {
      toast(err?.response?.data?.message || (lang==='vi'?'Không thể đăng ký':'Registration failed'), 'danger');
    } finally {
      setActionBusy(p => ({ ...p, [section.id]: false }));
    }
  };

  const drop = async (section) => {
    const enrollId = registeredMap[section.id];
    if (!enrollId) return;
    setActionBusy(p => ({ ...p, [section.id]: true }));
    try {
      await requestDropEnrollment(enrollId);
      setMyEnrollments(prev => prev.filter(e => e.id !== enrollId));
      toast(lang==='vi'?`Đã hủy ${section.subject?.name}`:`Dropped ${section.subject?.name}`, 'warn');
    } catch (err) {
      toast(err?.response?.data?.message || (lang==='vi'?'Không thể hủy':'Drop failed'), 'danger');
    } finally {
      setActionBusy(p => ({ ...p, [section.id]: false }));
    }
  };

  const pages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <Page>
      <SectionHead title={t('registration')} desc={lang==='vi'?'Đăng ký môn học · Học kỳ hiện tại':'Course registration · Current semester'}/>

      {loading ? <Spinner/> : (
        <div className="grid-2-1" style={{ alignItems: 'start' }}>
          {/* Left: available sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="input-group" style={{ flex: '1 1 260px', maxWidth: 420 }}>
                <I.search size={16}/>
                <input className="input" style={{ height: 44 }} value={q}
                  onChange={e => { setQ(e.target.value); setPage(1); }}
                  placeholder={lang==='vi'?'Tìm môn học, mã lớp HP, giảng viên…':'Search subject, section code, teacher…'}/>
              </div>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                {filtered.length} {lang==='vi'?'lớp học phần':'sections'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {paginated.length === 0
                ? <Empty text={q ? (lang==='vi'?'Không tìm thấy kết quả':'No results') : (lang==='vi'?'Không có lớp học phần nào':'No sections available')}/>
                : paginated.map(s => {
                  const isReg  = !!registeredMap[s.id];
                  const busy   = !!actionBusy[s.id];
                  const count  = s._count?.enrollments ?? 0;
                  const full   = count >= (s.maxStudents ?? 50);
                  return (
                    <div key={s.id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                      boxShadow: isReg ? 'inset 0 0 0 1.5px var(--accent), var(--shadow-sm)' : 'var(--shadow-sm)' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center', flexShrink: 0,
                        color: isReg ? '#fff' : 'var(--accent)', background: isReg ? 'var(--accent)' : 'var(--info-soft)' }}>
                        <I.book size={21}/>
                      </div>
                      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>{s.subject?.name}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'var(--mono)' }}>{s.code}</span>
                          {s.teacher?.fullName && <span>· {s.teacher.fullName}</span>}
                          {s.semester && <span>· {s.semester}</span>}
                        </div>
                      </div>
                      <span className="badge badge-muted">{s.subject?.credits} {t('credits')}</span>
                      <span className="badge" style={{ background: full ? 'var(--danger-soft)' : 'var(--success-soft)', color: full ? 'var(--danger)' : 'var(--success)' }}>
                        {count}/{s.maxStudents ?? 50}
                      </span>
                      <button
                        className={isReg ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'}
                        style={{ minWidth: 110 }}
                        disabled={(full && !isReg) || busy}
                        onClick={() => isReg ? drop(s) : register(s)}>
                        {busy ? '…' : isReg
                          ? <><I.check size={15}/>{lang==='vi'?'Đã ĐK':'Added'}</>
                          : <><I.plus size={15}/>{lang==='vi'?'Đăng ký':'Register'}</>
                        }
                      </button>
                    </div>
                  );
                })
              }
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 4 }}>
                <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><I.chevL size={15}/></button>
                {Array.from({ length: pages }).map((_, i) => (
                  <button key={i} className={`btn btn-sm ${page === i+1 ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPage(i+1)}>{i+1}</button>
                ))}
                <button className="btn btn-ghost btn-sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}><I.chevR size={15}/></button>
              </div>
            )}
          </div>

          {/* Right: cart */}
          <div className="card" style={{ padding: 20, position: 'sticky', top: 88 }}>
            <SectionHead title={lang==='vi'?'Giỏ đăng ký':'Your selection'}/>
            <div style={{ margin: '16px 0', padding: 16, borderRadius: 13, background: 'var(--surface-3)', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{lang==='vi'?'Tổng tín chỉ':'Total credits'}</div>
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', color: regCredits > MAX_CREDITS ? 'var(--danger)' : 'var(--text)' }}>
                {regCredits}<span style={{ fontSize: 18, color: 'var(--muted)', fontWeight: 600 }}> / {MAX_CREDITS}</span>
              </div>
              <div style={{ height: 7, borderRadius: 5, background: 'var(--border)', overflow: 'hidden', marginTop: 12 }}>
                <div style={{ height: '100%', width: `${Math.min(100, regCredits / MAX_CREDITS * 100)}%`, background: regCredits > MAX_CREDITS ? 'var(--danger)' : 'var(--accent)', transition: 'width .4s' }}/>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {regSections.length === 0
                ? <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13.5, padding: '18px 0' }}>
                    {lang==='vi'?'Chưa chọn môn nào':'No courses selected'}
                  </div>
                : regSections.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.subject?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{s.code} · {s.subject?.credits} TC</div>
                    </div>
                    <button className="btn btn-icon btn-sm btn-ghost" style={{ color: 'var(--danger)' }}
                      disabled={!!actionBusy[s.id]}
                      onClick={() => drop(s)}>
                      <I.x size={15}/>
                    </button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

// ─── TranscriptScreen ─────────────────────────────────────────────────────────

function TranscriptScreen() {
  const { t, lang } = useApp();
  const [data,     setData]     = useState({ enrollments: [], gpa: 0, totalCredits: 0 });
  const [gpaTrend, setGpaTrend] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([requestTranscript(), requestGpaTrend()])
      .then(([tRes, gRes]) => {
        setData(tRes.metadata || { enrollments: [], gpa: 0, totalCredits: 0 });
        setGpaTrend(gRes.metadata || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const rows = data.enrollments || [];
  const gpa  = typeof data.gpa === 'number' ? data.gpa.toFixed(2) : '—';
  const semesters = useMemo(() => [...new Set(rows.map(r => r.subjectClass?.semester))].filter(Boolean).sort(), [rows]);

  const standing = data.gpa >= 3.6 ? (lang==='vi'?'Xuất sắc':'Excellent')
    : data.gpa >= 3.2 ? (lang==='vi'?'Giỏi':'Good')
    : data.gpa >= 2.5 ? (lang==='vi'?'Khá':'Fair')
    : (lang==='vi'?'Trung bình':'Average');

  const letterCounts = useMemo(() => {
    const m = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    rows.forEach(r => { if (r.letterGrade && m[r.letterGrade] !== undefined) m[r.letterGrade]++; });
    return m;
  }, [rows]);

  return (
    <Page>
      <SectionHead
        title={t('transcript')}
        desc={lang==='vi'?'Bảng điểm tích lũy toàn khóa':'Cumulative academic record'}
        right={<button className="btn btn-outline btn-sm" style={{ height: 40 }} onClick={() => window.print()}><I.download size={16}/>{lang==='vi'?'Xuất PDF':'Export PDF'}</button>}/>

      {loading ? <Spinner/> : (
        <>
          <div className="grid-stats">
            <StatCard icon={<I.award size={22}/>} label={lang==='vi'?'GPA tích lũy':'Cumulative GPA'} value={gpa} accent="#1F8A5B"/>
            <StatCard icon={<I.layers size={22}/>} label={lang==='vi'?'Tín chỉ đạt':'Credits passed'} value={data.totalCredits ?? 0} accent="#2F6FED"/>
            <StatCard icon={<I.book size={22}/>} label={lang==='vi'?'Số môn':'Courses'} value={rows.length} accent="#8B5CF6"/>
            <StatCard icon={<I.trendUp size={22}/>} label={lang==='vi'?'Xếp loại':'Standing'} value={standing} accent="#C9821A"/>
          </div>

          <div className="grid-2-1" style={{ alignItems: 'start' }}>
            {/* Transcript table */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{lang==='vi'?'Chi tiết điểm':'Grade details'}</h3>
              </div>
              {rows.length === 0
                ? <Empty text={lang==='vi'?'Chưa có môn học nào hoàn thành':'No completed courses yet'}/>
                : semesters.map(sem => (
                  <div key={sem}>
                    <div style={{ padding: '10px 20px', background: 'var(--surface-2)', fontSize: 12.5, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '-0.01em', borderBottom: '1px solid var(--border)' }}>
                      {sem}
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 440 }}>
                        <thead>
                          <tr>
                            {[t('subjects'), t('credits'), t('midterm'), t('final'), t('total'), t('letter')].map((h, i) => (
                              <th key={i} style={{ textAlign: i === 0 ? 'left' : 'center', padding: '9px 13px', fontSize: 11, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.filter(r => r.subjectClass?.semester === sem).map((r, i) => {
                            const sub = r.subjectClass?.subject;
                            return (
                              <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                                <td style={{ padding: '11px 13px', fontWeight: 600, fontSize: 13.5 }}>
                                  {sub?.name}
                                  <div style={{ fontSize: 11.5, color: 'var(--muted)', fontFamily: 'var(--mono)', fontWeight: 400 }}>{sub?.code}</div>
                                </td>
                                <td style={{ padding: '11px 13px', textAlign: 'center', fontFamily: 'var(--mono)' }}>{sub?.credits}</td>
                                <td style={{ padding: '11px 13px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{r.midtermScore ?? '—'}</td>
                                <td style={{ padding: '11px 13px', textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{r.finalScore ?? '—'}</td>
                                <td style={{ padding: '11px 13px', textAlign: 'center', fontFamily: 'var(--mono)', fontWeight: 800 }}>{r.totalScore ?? '—'}</td>
                                <td style={{ padding: '11px 13px', textAlign: 'center' }}>
                                  <span className="badge" style={{ background: `color-mix(in srgb,${letterColor(r.letterGrade)} 13%, transparent)`, color: letterColor(r.letterGrade), fontFamily: 'var(--mono)', fontWeight: 700, minWidth: 38, justifyContent: 'center' }}>
                                    {r.letterGrade ?? '—'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* GPA trend + distribution */}
            <div className="card" style={{ padding: 22 }}>
              <SectionHead title={lang==='vi'?'Biểu đồ GPA':'GPA trend'}/>
              <div style={{ marginTop: 16 }}>
                {gpaTrend.length > 0
                  ? <LineChart data={gpaTrend.map(x => ({ term: x.term, value: x.gpa }))} height={200} yMax={4} fmt={v => v.toFixed(1)}/>
                  : <Empty text={lang==='vi'?'Chưa có dữ liệu':'No data yet'}/>
                }
              </div>
              {Object.values(letterCounts).some(v => v > 0) && (
                <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{lang==='vi'?'Phân bố điểm chữ':'Grade distribution'}</div>
                  <HBars data={[
                    { label: 'A', value: letterCounts.A, color: '#1F8A5B' },
                    { label: 'B', value: letterCounts.B, color: '#2F6FED' },
                    { label: 'C', value: letterCounts.C, color: '#C9821A' },
                    { label: 'D', value: letterCounts.D, color: '#8B5CF6' },
                    { label: 'F', value: letterCounts.F, color: '#E5534B' },
                  ].filter(x => x.value > 0)}/>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Page>
  );
}

export { StudentDashboard, RegistrationScreen, TranscriptScreen };
