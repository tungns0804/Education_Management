import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { I } from '../../components/icons';
import { Avatar, BtnSpinner, Segmented, useToast } from '../../components/ui';
import { Page, SectionHead } from '../../components/shell';
import { Spinner, Empty } from '../../components/feedback';
import { useApp } from '../../context/AppContext';
import {
  requestMySections,
  requestSectionRoster,
  requestAttendance,
  requestBulkAttendance,
} from '../../config/userRequest';

/* EduManage — Teacher: Điểm danh buổi học + lịch sử điểm danh */

const ATT_OPTS = [
  { v: 'present',  label_vi: 'Có mặt', label_en: 'Present',  color: 'var(--success)', soft: 'var(--success-soft)' },
  { v: 'late',     label_vi: 'Trễ',    label_en: 'Late',     color: 'var(--warn)',    soft: 'var(--warn-soft)'    },
  { v: 'absent',   label_vi: 'Vắng',   label_en: 'Absent',   color: 'var(--danger)',  soft: 'var(--danger-soft)'  },
  { v: 'excused',  label_vi: 'Phép',   label_en: 'Excused',  color: 'var(--accent)',  soft: 'var(--info-soft)'    },
];

function todayISO() {
  return new Date().toISOString().split('T')[0];
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
    return <Empty icon={I.layers} text={lang==='vi'?'Chưa có lịch sử điểm danh':'No attendance history'}/>;
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

export default function AttendanceScreen({ sectionId }) {
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
                {saving ? <><BtnSpinner size={14}/>{lang==='vi'?'Đang lưu…':'Saving…'}</> : <><I.check size={16}/>{lang==='vi'?'Lưu':'Save'}</>}
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
            ? <Empty icon={I.layers} text={lang==='vi'?'Lớp này chưa có sinh viên đăng ký':'No students enrolled in this section'}/>
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
