import React, { useState, useEffect, useMemo } from 'react';
import { I } from '../../components/icons';
import { useToast } from '../../components/ui';
import { Page, SectionHead } from '../../components/shell';
import { Spinner, Empty } from '../../components/feedback';
import { useApp } from '../../context/AppContext';
import { formatSchedule, hasSchedule, schedulesConflict } from '../../utils/schedule';
import {
  requestSubjectClasses,
  requestMyEnrollments,
  requestRegister,
  requestDropEnrollment,
} from '../../config/userRequest';

/* EduManage — Student: Đăng ký môn học */

export default function RegistrationScreen() {
  const { t, lang } = useApp();
  const toast = useToast();

  const [available,      setAvailable]      = useState([]);
  const [myEnrollments,  setMyEnrollments]  = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [actionBusy,     setActionBusy]     = useState({});
  const [filterSubject,  setFilterSubject]  = useState('');
  const [filterCode,     setFilterCode]     = useState('');
  const [filterTeacher,  setFilterTeacher]  = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [page,           setPage]           = useState(1);
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

  const semesters = useMemo(() =>
    [...new Set(available.map(s => s.semester).filter(Boolean))].sort(),
    [available]);

  const hasFilter = !!(filterSubject || filterCode || filterTeacher || filterSemester);

  const clearFilters = () => {
    setFilterSubject('');
    setFilterCode('');
    setFilterTeacher('');
    setFilterSemester('');
    setPage(1);
  };

  const filtered = useMemo(() => {
    const subj    = filterSubject.toLowerCase();
    const code    = filterCode.toLowerCase();
    const teacher = filterTeacher.toLowerCase();
    return available.filter(s => {
      if (subj    && !s.subject?.name?.toLowerCase().includes(subj))       return false;
      if (code    && !s.code?.toLowerCase().includes(code))                 return false;
      if (teacher && !s.teacher?.fullName?.toLowerCase().includes(teacher)) return false;
      if (filterSemester && s.semester !== filterSemester)                  return false;
      return true;
    });
  }, [available, filterSubject, filterCode, filterTeacher, filterSemester]);

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <div className="input-group" style={{ flex: '1 1 190px' }}>
                  <I.book size={15}/>
                  <input className="input" style={{ height: 40 }} value={filterSubject}
                    onChange={e => { setFilterSubject(e.target.value); setPage(1); }}
                    placeholder={lang==='vi'?'Tên môn học…':'Subject name…'}/>
                </div>
                <div className="input-group" style={{ flex: '1 1 140px' }}>
                  <I.layers size={15}/>
                  <input className="input" style={{ height: 40 }} value={filterCode}
                    onChange={e => { setFilterCode(e.target.value); setPage(1); }}
                    placeholder={lang==='vi'?'Mã lớp HP…':'Section code…'}/>
                </div>
                <div className="input-group" style={{ flex: '1 1 170px' }}>
                  <I.user size={15}/>
                  <input className="input" style={{ height: 40 }} value={filterTeacher}
                    onChange={e => { setFilterTeacher(e.target.value); setPage(1); }}
                    placeholder={lang==='vi'?'Giảng viên…':'Teacher…'}/>
                </div>
                <select className="input" style={{ height: 40, flex: '1 1 150px', paddingLeft: 12, cursor: 'pointer' }}
                  value={filterSemester} onChange={e => { setFilterSemester(e.target.value); setPage(1); }}>
                  <option value="">{lang==='vi'?'— Tất cả học kỳ —':'— All semesters —'}</option>
                  {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {hasFilter && (
                  <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ whiteSpace: 'nowrap' }}>
                    <I.x size={14}/>{lang==='vi'?'Xóa bộ lọc':'Clear filters'}
                  </button>
                )}
                <span style={{ fontSize: 13, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  {filtered.length} {lang==='vi'?'lớp học phần':'sections'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {paginated.length === 0
                ? <Empty icon={I.book} text={hasFilter ? (lang==='vi'?'Không tìm thấy kết quả':'No results') : (lang==='vi'?'Không có lớp học phần nào':'No sections available')}/>
                : paginated.map(s => {
                  const isReg  = !!registeredMap[s.id];
                  const busy   = !!actionBusy[s.id];
                  const count  = s._count?.enrollments ?? 0;
                  const full   = count >= (s.maxStudents ?? 50);
                  // Cảnh báo sớm: lớp này trùng lịch với một lớp đã đăng ký
                  const clash  = !isReg && regSections.find(r => schedulesConflict(s, r));
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
                        <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                          <I.clock size={13}/>{formatSchedule(s, lang)}
                        </div>
                      </div>
                      <span className="badge badge-muted">{s.subject?.credits} {t('credits')}</span>
                      <span className="badge" style={{ background: full ? 'var(--danger-soft)' : 'var(--success-soft)', color: full ? 'var(--danger)' : 'var(--success)' }}>
                        {count}/{s.maxStudents ?? 50}
                      </span>
                      {clash && (
                        <span className="badge" style={{ background: 'var(--warn-soft)', color: 'var(--warn)' }}
                          title={lang==='vi'
                            ? `Trùng lịch với ${clash.code} (${formatSchedule(clash, lang)})`
                            : `Conflicts with ${clash.code} (${formatSchedule(clash, lang)})`}>
                          {lang==='vi'?'Trùng lịch':'Time clash'}
                        </span>
                      )}
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
                      {hasSchedule(s) && (
                        <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 2 }}>{formatSchedule(s, lang)}</div>
                      )}
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
