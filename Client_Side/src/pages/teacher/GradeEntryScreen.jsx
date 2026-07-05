import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { I } from '../../components/icons';
import { Avatar, BtnSpinner, useToast } from '../../components/ui';
import { Page, SectionHead } from '../../components/shell';
import { Spinner, Empty, SimplePagination } from '../../components/feedback';
import { useApp } from '../../context/AppContext';
import {
  requestMySections,
  requestGradeSheet,
  requestUpdateGrade,
  requestToggleGradeLock,
} from '../../config/userRequest';

/* EduManage — Teacher: Nhập điểm (10% chuyên cần + 30% giữa kỳ + 60% cuối kỳ) */

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

export default function GradeEntryScreen({ sectionId }) {
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
            {saving ? <><BtnSpinner size={14}/>{lang==='vi'?'Đang lưu…':'Saving…'}</> : <><I.check size={16}/>{lang==='vi'?'Lưu điểm':'Save grades'}</>}
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
        <Empty icon={I.layers} text={q ? (lang==='vi'?'Không tìm thấy sinh viên':'No student found') : (lang==='vi'?'Lớp này chưa có sinh viên':'No students in this section')}/>
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
                            {lockLoading[e.id] ? <BtnSpinner size={14}/> : locked ? <I.lock size={15}/> : <I.unlock size={15}/>}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <SimplePagination page={page} total={filtered.length} size={PAGE_SIZE} onChange={setPage}/>
        </>
      )}
    </Page>
  );
}
