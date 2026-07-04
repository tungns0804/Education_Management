import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { I } from './icons';
import { Avatar, Segmented, StatCard, useApp, useToast } from './ui';
import { BarChart } from './charts';
import { Page, SectionHead } from './shell';
import {
  requestTeacherDashboard,
  requestMySections,
  requestSectionRoster,
  requestAttendance,
  requestBulkAttendance,
  requestGradeSheet,
  requestUpdateGrade,
  requestToggleGradeLock,
} from '../config/userRequest';

/* EduManage — Teacher screens: Dashboard, My Sections, Attendance, Grade Entry */

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTION_COLORS = ['#2F6FED', '#1F8A5B', '#8B5CF6', '#C9821A', '#EC6A9C', '#0E9F9F'];

const ATT_OPTS = [
  { v: 'present',  label_vi: 'Có mặt', label_en: 'Present',  color: 'var(--success)', soft: 'var(--success-soft)' },
  { v: 'late',     label_vi: 'Trễ',    label_en: 'Late',     color: 'var(--warn)',    soft: 'var(--warn-soft)'    },
  { v: 'absent',   label_vi: 'Vắng',   label_en: 'Absent',   color: 'var(--danger)',  soft: 'var(--danger-soft)'  },
  { v: 'excused',  label_vi: 'Phép',   label_en: 'Excused',  color: 'var(--accent)',  soft: 'var(--info-soft)'    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcTotal(att, mid, fin) {
  const a = parseFloat(att), m = parseFloat(mid), f = parseFloat(fin);
  if (isNaN(a) || isNaN(m) || isNaN(f)) return null;
  return Math.round((a * 0.1 + m * 0.3 + f * 0.6) * 10) / 10;
}

function calcLetter(total) {
  if (total === null || total === undefined) return '—';
  if (total >= 8.5) return 'A';
  if (total >= 7.0) return 'B';
  if (total >= 5.5) return 'C';
  if (total >= 4.0) return 'D';
  return 'F';
}

function letterColor(l) {
  if (!l || l === '—') return 'var(--muted)';
  if (l === 'F') return 'var(--danger)';
  if (l.startsWith('A')) return 'var(--success)';
  if (l.startsWith('D')) return 'var(--warn)';
  return 'var(--accent)';
}

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('vi-VN');
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 48 }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)', fontSize: 14 }}>
      <I.layers size={32} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }}/>
      {text}
    </div>
  );
}

function Pagination({ page, total, size, onChange }) {
  const pages = Math.ceil(total / size);
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 20 }}>
      <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => onChange(page - 1)}>
        <I.chevL size={15}/>
      </button>
      {Array.from({ length: pages }).map((_, i) => (
        <button key={i} className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => onChange(i + 1)}>{i + 1}</button>
      ))}
      <button className="btn btn-ghost btn-sm" disabled={page === pages} onClick={() => onChange(page + 1)}>
        <I.chevR size={15}/>
      </button>
    </div>
  );
}

// ─── TeacherDashboard ────────────────────────────────────────────────────────

function TeacherDashboard() {
  const { t, lang } = useApp();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestTeacherDashboard()
      .then(res => setStats(res.metadata))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const trend = stats?.attendanceTrend ?? [];
  const sections = stats?.sections ?? [];

  return (
    <Page>
      {loading ? <Spinner /> : (
        <>
          <div className="grid-stats">
            <StatCard icon={<I.layers size={22}/>} label={t('mySections')} value={stats?.totalSections ?? 0} accent="#2F6FED"/>
            <StatCard icon={<I.users size={22}/>} label={lang==='vi'?'Tổng sinh viên':'Total students'} value={stats?.totalStudents ?? 0} accent="#1F8A5B"/>
            <StatCard icon={<I.checkCircle size={22}/>} label={lang==='vi'?'Tỉ lệ điểm danh':'Attendance rate'} value={`${stats?.attendanceRate ?? 0}%`} accent="#8B5CF6"/>
            <StatCard icon={<I.pen size={22}/>} label={lang==='vi'?'Chờ nhập điểm':'Pending grades'} value={stats?.pendingGrades ?? 0} accent="#C9821A"/>
          </div>

          <div className="grid-2-1">
            <div className="card" style={{ padding: 22 }}>
              <SectionHead
                title={lang==='vi'?'Tỉ lệ chuyên cần theo buổi':'Attendance by session'}
                desc={lang==='vi'?'Dữ liệu điểm danh thực tế các lớp phụ trách':'Real attendance data across your sections'}/>
              <div style={{ marginTop: 18 }}>
                {trend.length > 0
                  ? <BarChart data={trend.map(d => ({ label: d.term, value: d.value, color: '#2F6FED' }))} height={220}/>
                  : <Empty text={lang==='vi'?'Chưa có dữ liệu điểm danh':'No attendance data yet'}/>
                }
              </div>
            </div>

            <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
              <SectionHead title={lang==='vi'?'Các lớp phụ trách':'My sections'}/>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sections.length === 0
                  ? <Empty text={lang==='vi'?'Chưa có lớp phụ trách':'No sections assigned'}/>
                  : sections.slice(0, 4).map((s, i) => (
                    <div key={s.id} style={{ display: 'flex', gap: 13, padding: 13, borderRadius: 12, background: 'var(--surface-3)' }}>
                      <div style={{ width: 4, borderRadius: 4, background: SECTION_COLORS[i % SECTION_COLORS.length] }}/>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{s.subjectName}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3, fontFamily: 'var(--mono)' }}>{s.code} · {s.semester}</div>
                      </div>
                      <span className="badge badge-info" style={{ alignSelf: 'center' }}>{s.enrolled} SV</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </>
      )}
    </Page>
  );
}

// ─── MySectionsScreen ─────────────────────────────────────────────────────────

function MySectionsScreen({ onOpenAttendance, onOpenGrades }) {
  const { t, lang } = useApp();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    requestMySections()
      .then(res => setSections(res.metadata || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    sections.filter(s =>
      !q ||
      s.subject?.name?.toLowerCase().includes(q.toLowerCase()) ||
      s.code?.toLowerCase().includes(q.toLowerCase()) ||
      s.semester?.toLowerCase().includes(q.toLowerCase())
    ), [sections, q]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusColor = (st) => st === 'active' ? 'var(--success)' : st === 'completed' ? 'var(--accent)' : 'var(--danger)';
  const statusLabel = (st) => st === 'active' ? (lang==='vi'?'Đang mở':'Active') : st === 'completed' ? (lang==='vi'?'Hoàn thành':'Completed') : (lang==='vi'?'Đã hủy':'Canceled');

  return (
    <Page>
      <SectionHead
        title={t('mySections')}
        desc={lang==='vi'?'Các lớp học phần được phân công':'Sections assigned to you'}
        right={
          <div className="input-group" style={{ maxWidth: 300 }}>
            <I.search size={15}/>
            <input className="input" style={{ height: 40 }} value={q}
              onChange={e => { setQ(e.target.value); setPage(1); }}
              placeholder={lang==='vi'?'Tìm lớp học phần…':'Search sections…'}/>
          </div>
        }/>

      {loading ? <Spinner/> : filtered.length === 0 ? (
        <Empty text={q ? (lang==='vi'?'Không tìm thấy kết quả':'No results found') : (lang==='vi'?'Chưa có lớp học phần nào':'No sections assigned')}/>
      ) : (
        <>
          <div className="grid-cards">
            {paginated.map((s, i) => {
              const globalIdx = (page - 1) * PAGE_SIZE + i;
              const color = SECTION_COLORS[globalIdx % SECTION_COLORS.length];
              return (
                <div key={s.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 15 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center',
                      color: '#fff', background: color }}>
                      <I.book size={21}/>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span className="badge badge-muted" style={{ fontFamily: 'var(--mono)' }}>{s.code}</span>
                      <span className="badge" style={{ background: `color-mix(in srgb,${statusColor(s.status)} 14%, transparent)`, color: statusColor(s.status) }}>
                        {statusLabel(s.status)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>{s.subject?.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>{s.semester}</div>
                  </div>

                  <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>{s._count?.enrollments ?? 0}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 12 }}>{lang==='vi'?'Sinh viên':'Students'}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>{s.subject?.credits}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 12 }}>{t('credits')}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>{s.maxStudents}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 12 }}>{lang==='vi'?'Tối đa':'Max'}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: 12.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <I.user size={13}/>{s.teacher?.fullName}
                    {s.teacher?.degree && <span style={{ fontStyle: 'italic' }}>({s.teacher.degree})</span>}
                  </div>

                  <div style={{ display: 'flex', gap: 9, marginTop: 'auto' }}>
                    <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => onOpenAttendance?.(s.id)}>
                      <I.checkCircle size={15}/>{t('attendance')}
                    </button>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onOpenGrades?.(s.id)}>
                      <I.pen size={14}/>{t('gradeEntry')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination page={page} total={filtered.length} size={PAGE_SIZE} onChange={setPage}/>
          <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--muted)', marginTop: 8 }}>
            {lang==='vi'?`${filtered.length} lớp học phần`:`${filtered.length} sections`}
          </div>
        </>
      )}
    </Page>
  );
}

// ─── AttendanceHistory ───────────────────────────────────────────────────────
// Accepts real roster + records, builds the grid

export function AttendanceHistory({ roster, records }) {
  const { t, lang } = useApp();

  const dates = useMemo(() => {
    const set = new Set(records.map(r => new Date(r.date).toISOString().split('T')[0]));
    return [...set].sort();
  }, [records]);

  const lookup = useMemo(() => {
    const m = {};
    records.forEach(r => {
      const d = new Date(r.date).toISOString().split('T')[0];
      m[`${r.studentId}_${d}`] = r.status;
    });
    return m;
  }, [records]);

  const STAT = {
    present: { c: 'var(--success)', soft: 'var(--success-soft)', abbr: 'P' },
    late:    { c: 'var(--warn)',    soft: 'var(--warn-soft)',    abbr: 'L' },
    absent:  { c: 'var(--danger)',  soft: 'var(--danger-soft)',  abbr: 'A' },
    excused: { c: 'var(--accent)',  soft: 'var(--info-soft)',    abbr: 'E' },
  };

  if (dates.length === 0) {
    return <Empty text={lang==='vi'?'Chưa có lịch sử điểm danh':'No attendance history'}/>;
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>
          {roster.length} {lang==='vi'?'sinh viên':'students'} · {dates.length} {t('sessions')}
        </div>
        <div style={{ display: 'flex', gap: 12, marginLeft: 'auto', fontSize: 12.5 }}>
          {Object.entries(STAT).map(([k, v]) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 11, height: 11, borderRadius: 3, background: v.c }}/>{k}
            </span>
          ))}
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 680 }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              <th style={{ position: 'sticky', left: 0, background: 'var(--surface-2)', textAlign: 'left', padding: '11px 16px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--muted)', minWidth: 200, zIndex: 2, borderBottom: '1px solid var(--border)' }}>
                {t('students')}
              </th>
              {dates.map((d, i) => (
                <th key={i} style={{ padding: '11px 4px', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textAlign: 'center', minWidth: 44, borderBottom: '1px solid var(--border)' }}>
                  {new Date(d + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                </th>
              ))}
              <th style={{ padding: '11px 14px', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center', minWidth: 72, borderBottom: '1px solid var(--border)' }}>
                {t('rate')}
              </th>
            </tr>
          </thead>
          <tbody>
            {roster.map((enroll, ri) => {
              const stu = enroll.student || enroll;
              const studentId = enroll.studentId || enroll.id;
              const rowStats = dates.map(d => lookup[`${studentId}_${d}`] || null);
              const present = rowStats.filter(s => s === 'present').length;
              const rate = dates.length > 0 ? Math.round((present / dates.length) * 100) : 100;
              const warn = rate < 80;
              return (
                <tr key={studentId} style={{ borderBottom: ri < roster.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ position: 'sticky', left: 0, background: 'var(--surface)', padding: '9px 16px', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={stu.fullName} size={30}/>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>{stu.fullName}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{stu.idStudent}</div>
                      </div>
                    </div>
                  </td>
                  {rowStats.map((st, ci) => {
                    const cfg = st ? STAT[st] : null;
                    return (
                      <td key={ci} style={{ textAlign: 'center', padding: '9px 4px' }}>
                        {cfg
                          ? <span title={st} style={{ display: 'inline-grid', placeItems: 'center', width: 24, height: 24, borderRadius: 7, fontSize: 10, fontWeight: 800, fontFamily: 'var(--mono)', color: cfg.c, background: cfg.soft }}>
                              {cfg.abbr}
                            </span>
                          : <span style={{ color: 'var(--border)', fontSize: 18 }}>·</span>
                        }
                      </td>
                    );
                  })}
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

// ─── AttendanceScreen ─────────────────────────────────────────────────────────

function AttendanceScreen({ sectionId }) {
  const { t, lang } = useApp();
  const toast = useToast();

  const [sections,    setSections]    = useState([]);
  const [sec,         setSec]         = useState(sectionId || '');
  const [tab,         setTab]         = useState('today');
  const [date,        setDate]        = useState(todayISO());
  const [roster,      setRoster]      = useState([]);
  const [records,     setRecords]     = useState([]);   // all attendance for section
  const [marks,       setMarks]       = useState({});   // { studentId: 'present'|'late'|... }
  const [loadingData, setLoadingData] = useState(false);
  const [saving,      setSaving]      = useState(false);

  // Load teacher's sections list
  useEffect(() => {
    requestMySections().then(res => {
      const secs = res.metadata || [];
      setSections(secs);
      if (!sec && secs.length > 0) setSec(secs[0].id);
    }).catch(() => {});
  }, []);

  // Reload roster + attendance when section changes
  useEffect(() => {
    if (!sec) return;
    setLoadingData(true);
    Promise.all([requestSectionRoster(sec), requestAttendance(sec)])
      .then(([rRes, aRes]) => {
        const r = rRes.metadata || [];
        const a = aRes.metadata || [];
        setRoster(r);
        setRecords(a);
        rebuildMarks(r, a, date);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [sec]);

  // Rebuild marks when date changes (without re-fetching)
  useEffect(() => {
    rebuildMarks(roster, records, date);
  }, [date]);

  const rebuildMarks = useCallback((r, a, d) => {
    const init = {};
    const dayRecords = a.filter(rec => new Date(rec.date).toISOString().split('T')[0] === d);
    r.forEach(enroll => {
      const found = dayRecords.find(rec => rec.studentId === enroll.studentId);
      init[enroll.studentId] = found ? found.status : 'present';
    });
    setMarks(init);
  }, []);

  const counts = useMemo(() => {
    const c = { present: 0, late: 0, absent: 0, excused: 0 };
    Object.values(marks).forEach(v => { if (c[v] !== undefined) c[v]++; });
    return c;
  }, [marks]);

  const currentSection = sections.find(s => s.id === sec);

  const save = async () => {
    if (!sec || roster.length === 0) return;
    setSaving(true);
    try {
      await requestBulkAttendance({
        subjectClassId: sec,
        date,
        records: roster.map(e => ({ studentId: e.studentId, status: marks[e.studentId] || 'present' })),
      });
      // Refresh records
      const aRes = await requestAttendance(sec);
      setRecords(aRes.metadata || []);
      toast(lang==='vi'?'Đã lưu điểm danh':'Attendance saved');
    } catch (err) {
      toast(err?.response?.data?.message || 'Lỗi khi lưu điểm danh', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toLocaleDateString(lang==='vi'?'vi-VN':'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Page>
      <SectionHead
        title={t('attendance')}
        desc={tab === 'today' ? today : (lang==='vi'?'Lịch sử điểm danh cả học kỳ':'Full-semester attendance log')}
        right={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Segmented value={tab} onChange={setTab} options={[
              { value: 'today',   label: lang==='vi'?'Buổi học':'Session' },
              { value: 'history', label: t('history') },
            ]}/>
            {tab === 'today' && (
              <button className="btn btn-primary btn-sm" style={{ height: 40 }} onClick={save} disabled={saving || roster.length === 0}>
                {saving ? '…' : <><I.check size={16}/>{lang==='vi'?'Lưu':'Save'}</>}
              </button>
            )}
          </div>
        }/>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <select className="select" style={{ height: 44, width: 'auto', minWidth: 260, fontWeight: 600 }}
          value={sec} onChange={e => setSec(e.target.value)}>
          {sections.length === 0 && <option value="">— Chưa có lớp —</option>}
          {sections.map(s => (
            <option key={s.id} value={s.id}>{s.subject?.name} · {s.code}</option>
          ))}
        </select>

        {tab === 'today' && (
          <>
            <input type="date" className="input" style={{ height: 44, width: 'auto' }} value={date} onChange={e => setDate(e.target.value)}/>
            <div style={{ display: 'flex', gap: 10, marginLeft: 'auto', flexWrap: 'wrap' }}>
              {ATT_OPTS.map(o => (
                <div key={o.v} className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, display: 'grid', placeItems: 'center', color: o.color, background: o.soft, fontSize: 13, fontWeight: 800, fontFamily: 'var(--mono)' }}>
                    {counts[o.v]}
                  </span>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{lang==='vi'?o.label_vi:o.label_en}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {loadingData ? <Spinner/> : tab === 'history' ? (
        <AttendanceHistory roster={roster} records={records}/>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {roster.length === 0
            ? <Empty text={lang==='vi'?'Lớp này chưa có sinh viên đăng ký':'No students enrolled in this section'}/>
            : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '13px 18px', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                      {t('students')}
                    </th>
                    <th style={{ textAlign: 'right', padding: '13px 18px', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                      {t('status')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((enroll, ri) => {
                    const stu = enroll.student || {};
                    const studentId = enroll.studentId;
                    const current = marks[studentId] || 'present';
                    return (
                      <tr key={studentId} style={{ borderBottom: ri < roster.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <td style={{ padding: '11px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                            <span style={{ fontSize: 12.5, color: 'var(--muted)', fontFamily: 'var(--mono)', width: 22 }}>{ri + 1}</span>
                            <Avatar name={stu.fullName} size={36}/>
                            <div>
                              <div style={{ fontWeight: 600 }}>{stu.fullName}</div>
                              <div style={{ fontSize: 12.5, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{stu.idStudent}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '11px 18px' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            {ATT_OPTS.map(o => {
                              const on = current === o.v;
                              return (
                                <button key={o.v}
                                  onClick={() => setMarks(m => ({ ...m, [studentId]: o.v }))}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 5, height: 34, padding: '0 13px', borderRadius: 9,
                                    fontSize: 13, fontWeight: 600, transition: 'all .14s',
                                    color: on ? o.color : 'var(--muted)',
                                    background: on ? o.soft : 'var(--surface-3)',
                                    boxShadow: on ? `inset 0 0 0 1.5px ${o.color}` : 'none',
                                  }}>
                                  {lang==='vi'?o.label_vi:o.label_en}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Page>
  );
}

// ─── GradeEntryScreen ─────────────────────────────────────────────────────────

function GradeEntryScreen({ sectionId }) {
  const { t, lang } = useApp();
  const toast = useToast();

  const [sections,    setSections]    = useState([]);
  const [sec,         setSec]         = useState(sectionId || '');
  const [gradeSheet,  setGradeSheet]  = useState([]);
  const [grades,      setGrades]      = useState({});   // { enrollmentId: { att, mid, fin } }
  const [loading,     setLoading]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [lockLoading, setLockLoading] = useState({});
  const [q,           setQ]           = useState('');
  const [page,        setPage]        = useState(1);
  const PAGE_SIZE = 15;

  // Load teacher's sections
  useEffect(() => {
    requestMySections().then(res => {
      const secs = res.metadata || [];
      setSections(secs);
      if (!sec && secs.length > 0) setSec(secs[0].id);
    }).catch(() => {});
  }, []);

  // Load grade sheet when section changes
  const loadGradeSheet = useCallback((secId) => {
    if (!secId) return;
    setLoading(true);
    requestGradeSheet(secId)
      .then(res => {
        const sheet = res.metadata || [];
        setGradeSheet(sheet);
        const init = {};
        sheet.forEach(e => {
          init[e.id] = {
            att: e.attendanceScore != null ? String(e.attendanceScore) : '',
            mid: e.midtermScore    != null ? String(e.midtermScore)    : '',
            fin: e.finalScore      != null ? String(e.finalScore)      : '',
          };
        });
        setGrades(init);
        setPage(1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadGradeSheet(sec); }, [sec]);

  const filtered = useMemo(() =>
    gradeSheet.filter(e =>
      !q ||
      e.student?.fullName?.toLowerCase().includes(q.toLowerCase()) ||
      e.student?.idStudent?.toLowerCase().includes(q.toLowerCase())
    ), [gradeSheet, q]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const setGradeField = (id, field, val) => {
    if (val !== '' && (isNaN(val) || parseFloat(val) < 0 || parseFloat(val) > 10)) return;
    setGrades(g => ({ ...g, [id]: { ...g[id], [field]: val } }));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const updates = gradeSheet
        .filter(e => !e.gradeLocked)
        .map(e => {
          const g = grades[e.id] || {};
          const att = parseFloat(g.att), mid = parseFloat(g.mid), fin = parseFloat(g.fin);
          const body = {};
          if (!isNaN(att)) body.attendanceScore = att;
          if (!isNaN(mid)) body.midtermScore = mid;
          if (!isNaN(fin)) body.finalScore = fin;
          if (Object.keys(body).length === 0) return null;
          return requestUpdateGrade(e.id, body);
        })
        .filter(Boolean);

      await Promise.all(updates);
      await loadGradeSheet(sec);
      toast(lang==='vi'?'Đã lưu bảng điểm':'Grades saved');
    } catch (err) {
      toast(err?.response?.data?.message || 'Lỗi khi lưu điểm', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const toggleLock = async (enrollmentId, currentLocked) => {
    setLockLoading(prev => ({ ...prev, [enrollmentId]: true }));
    try {
      await requestToggleGradeLock(enrollmentId, !currentLocked);
      setGradeSheet(prev => prev.map(e => e.id === enrollmentId ? { ...e, gradeLocked: !currentLocked } : e));
      toast(!currentLocked ? (lang==='vi'?'Đã khóa điểm':'Grade locked') : (lang==='vi'?'Đã mở khóa điểm':'Grade unlocked'));
    } catch (err) {
      toast(err?.response?.data?.message || 'Lỗi', 'danger');
    } finally {
      setLockLoading(prev => ({ ...prev, [enrollmentId]: false }));
    }
  };

  // Stats
  const stats = useMemo(() => {
    const totals = gradeSheet.map(e => {
      const g = grades[e.id] || {};
      return calcTotal(g.att, g.mid, g.fin);
    }).filter(v => v !== null);
    const avg = totals.length ? (totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(2) : '—';
    const locked = gradeSheet.filter(e => e.gradeLocked).length;
    return { avg, locked, total: gradeSheet.length };
  }, [gradeSheet, grades]);

  return (
    <Page>
      <SectionHead
        title={t('gradeEntry')}
        desc={lang==='vi'?'Điểm tổng = 10% chuyên cần + 30% giữa kỳ + 60% cuối kỳ':'Total = 10% attendance + 30% midterm + 60% final'}
        right={
          <button className="btn btn-primary btn-sm" style={{ height: 40 }} onClick={saveAll} disabled={saving}>
            {saving ? '…' : <><I.check size={16}/>{lang==='vi'?'Lưu điểm':'Save grades'}</>}
          </button>
        }/>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <select className="select" style={{ height: 44, width: 'auto', minWidth: 260, fontWeight: 600 }}
          value={sec} onChange={e => setSec(e.target.value)}>
          {sections.length === 0 && <option value="">— Chưa có lớp —</option>}
          {sections.map(s => (
            <option key={s.id} value={s.id}>{s.subject?.name} · {s.code}</option>
          ))}
        </select>

        <div className="input-group" style={{ maxWidth: 240 }}>
          <I.search size={14}/>
          <input className="input" style={{ height: 44 }} value={q}
            onChange={e => { setQ(e.target.value); setPage(1); }}
            placeholder={lang==='vi'?'Tìm sinh viên…':'Search student…'}/>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, fontSize: 13 }}>
          <div className="card" style={{ padding: '9px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <I.trendUp size={18} style={{ color: 'var(--accent)' }}/>
            <span style={{ color: 'var(--muted)' }}>{lang==='vi'?'TB lớp':'Class avg'}</span>
            <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--mono)' }}>{stats.avg}</span>
          </div>
          <div className="card" style={{ padding: '9px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <I.lock size={16} style={{ color: 'var(--muted)' }}/>
            <span style={{ color: 'var(--muted)' }}>{lang==='vi'?'Đã khóa':'Locked'}</span>
            <span style={{ fontSize: 16, fontWeight: 800 }}>{stats.locked}/{stats.total}</span>
          </div>
        </div>
      </div>

      {loading ? <Spinner/> : filtered.length === 0 ? (
        <Empty text={q ? (lang==='vi'?'Không tìm thấy sinh viên':'No student found') : (lang==='vi'?'Lớp này chưa có sinh viên':'No students in this section')}/>
      ) : (
        <>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                    {[t('students'), lang==='vi'?'Chuyên cần':'Attendance', t('midterm'), t('final'), t('total'), t('letter'), ''].map((h, i) => (
                      <th key={i} style={{ textAlign: i === 0 ? 'left' : 'center', padding: '13px 14px', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--muted)', width: i === 0 ? 'auto' : i === 6 ? 60 : 110 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((e, ri) => {
                    const stu = e.student || {};
                    const g   = grades[e.id] || {};
                    const total  = calcTotal(g.att, g.mid, g.fin);
                    const letter = calcLetter(total);
                    const locked = e.gradeLocked;
                    return (
                      <tr key={e.id} style={{ borderBottom: ri < paginated.length - 1 ? '1px solid var(--border)' : 'none', opacity: locked ? 0.75 : 1 }}>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                            <Avatar name={stu.fullName} size={34}/>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{stu.fullName}</div>
                              <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{stu.idStudent}</div>
                            </div>
                          </div>
                        </td>
                        {['att', 'mid', 'fin'].map(k => (
                          <td key={k} style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <input
                              value={g[k] ?? ''}
                              onChange={ev => setGradeField(e.id, k, ev.target.value)}
                              disabled={locked}
                              inputMode="decimal"
                              placeholder="0–10"
                              style={{
                                width: 68, height: 38, textAlign: 'center', fontSize: 14, fontWeight: 600,
                                fontFamily: 'var(--mono)', borderRadius: 9,
                                background: locked ? 'var(--surface-2)' : 'var(--surface)',
                                color: 'var(--text)', outline: 'none',
                                boxShadow: 'inset 0 0 0 1px var(--border-strong)',
                                cursor: locked ? 'not-allowed' : 'text',
                              }}
                              onFocus={ev => { if (!locked) ev.target.style.boxShadow = 'inset 0 0 0 1.5px var(--accent), var(--ring)'; }}
                              onBlur={ev => { ev.target.style.boxShadow = 'inset 0 0 0 1px var(--border-strong)'; }}
                            />
                          </td>
                        ))}
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, fontFamily: 'var(--mono)', fontSize: 15 }}>
                          {total ?? '—'}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span className="badge" style={{ background: `color-mix(in srgb,${letterColor(letter)} 13%, transparent)`, color: letterColor(letter), fontFamily: 'var(--mono)', fontWeight: 700, minWidth: 36, justifyContent: 'center' }}>
                            {letter}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <button
                            className="btn btn-icon btn-sm btn-ghost"
                            title={locked ? (lang==='vi'?'Mở khóa điểm':'Unlock grade') : (lang==='vi'?'Khóa điểm':'Lock grade')}
                            disabled={lockLoading[e.id]}
                            onClick={() => toggleLock(e.id, locked)}
                            style={{ color: locked ? 'var(--danger)' : 'var(--muted)' }}>
                            {locked ? <I.lock size={15}/> : <I.unlock size={15}/>}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} total={filtered.length} size={PAGE_SIZE} onChange={setPage}/>
        </>
      )}
    </Page>
  );
}

export { TeacherDashboard, MySectionsScreen, AttendanceScreen, GradeEntryScreen };
