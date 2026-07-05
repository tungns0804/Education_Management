import React, { useState, useEffect, useMemo } from 'react';
import { I } from './icons';
import { Avatar, StatCard, StatusBadge, useApp, useToast } from './ui';
import { LineChart, Ring } from './charts';
import { Page, SectionHead } from './shell';
import { StudentDrawer } from './admin';
import { requestUser, requestMySections, requestMyEnrollments, requestUpdateUser, requestToggleUserStatus } from '../config/userRequest';
import { formatSchedule } from '../constants/schedule.constants';

/* EduManage — Detail screens: Student Profile, Weekly Timetable, Schedule */

// ─── Helpers ──────────────────────────────────────────────────────────────────

function letterColorOf(l) {
  return l === 'F' ? 'var(--danger)' : l?.startsWith('A') ? 'var(--success)' : l?.startsWith('D') ? 'var(--warn)' : 'var(--accent)';
}

function InfoRow({ icon, label, value, mono }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ width: 34, height: 34, borderRadius: 9, display: 'grid', placeItems: 'center', color: 'var(--accent)', background: 'var(--info-soft)', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 13, color: 'var(--muted)', minWidth: 96 }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, marginLeft: 'auto', textAlign: 'right', fontFamily: mono ? 'var(--mono)' : 'inherit', wordBreak: 'break-word' }}>{value || '—'}</span>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
    </div>
  );
}

function Empty({ text }) {
  return <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)', fontSize: 14 }}>{text}</div>;
}

// ─── StudentProfile (used by admin, still loaded from passed props via admin screen) ──

function StudentProfile({ studentId, onBack }) {
  const { t, lang } = useApp();
  const toast = useToast();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    requestUser(studentId)
      .then(res => setStudent(res.metadata || null))
      .catch(() => setStudent(null))
      .finally(() => setLoading(false));
  }, [studentId, tick]);

  if (loading) return <Page><Spinner/></Page>;
  if (!student) return <Page><div style={{ color: 'var(--muted)', padding: 32 }}>Không tìm thấy sinh viên</div></Page>;

  const onToggle = async () => {
    try {
      const newStatus = (student.status === 'studying' || student.status === 'active') ? 'inactive' : 'studying';
      await requestToggleUserStatus(student.id, newStatus);
      setStudent(s => ({ ...s, status: newStatus }));
      toast(newStatus === 'inactive' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản', newStatus === 'inactive' ? 'warn' : 'success');
    } catch (err) {
      toast(err?.response?.data?.message || 'Lỗi', 'danger');
    }
  };

  const isActive = student.status === 'studying' || student.status === 'active';

  return (
    <Page>
      <button className="link-btn" onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--muted)', fontWeight: 600, alignSelf: 'flex-start' }}>
        <I.chevL size={16}/>{t('students')}
      </button>

      {/* Header card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ height: 92, background: 'linear-gradient(120deg, #14253B, #1E3A5F 55%, #2F6FED)', position: 'relative' }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .4 }}>
            <defs><pattern id="pp" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0H0V26" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#pp)"/>
          </svg>
        </div>
        <div style={{ padding: '0 26px 22px', display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: -38 }}>
          <div style={{ borderRadius: '50%', padding: 4, background: 'var(--surface)' }}>
            <Avatar name={student.fullName} size={84}/>
          </div>
          <div style={{ flex: 1, minWidth: 200, paddingBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: 23, fontWeight: 800, letterSpacing: '-0.02em' }}>{student.fullName}</h2>
              <StatusBadge active={isActive}/>
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 5, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--mono)' }}>{student.idStudent}</span>
              {student.class && <span>· {student.class}</span>}
              {student.department && <span>· {student.department}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, paddingBottom: 4 }}>
            <button className="btn btn-outline btn-sm" style={{ height: 40 }} onClick={onToggle}>
              {isActive ? <I.lock size={16}/> : <I.unlock size={16}/>}{isActive ? t('lock') : t('unlock')}
            </button>
            <button className="btn btn-primary btn-sm" style={{ height: 40 }} onClick={() => setDrawer({ mode: 'edit', row: student })}>
              <I.edit size={15}/>{t('editProfile')}
            </button>
          </div>
        </div>
      </div>

      <StudentDrawer
        state={drawer}
        onClose={() => setDrawer(null)}
        onSave={async (data) => {
          try {
            await requestUpdateUser(student.id, data);
            setTick(x => x + 1);
            toast(lang==='vi'?'Đã lưu thay đổi':'Changes saved');
            setDrawer(null);
          } catch (err) {
            toast(err?.response?.data?.message || 'Lỗi khi lưu', 'danger');
          }
        }}/>

      <div className="grid-2-1" style={{ alignItems: 'start' }}>
        {/* Left: info */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700 }}>{t('information')}</h3>
          <InfoRow icon={<I.idcard size={17}/>} label={t('code')} value={student.idStudent} mono/>
          <InfoRow icon={<I.cake size={17}/>} label={t('dob')} value={student.birthDay ? new Date(student.birthDay).toLocaleDateString('vi-VN') : null} mono/>
          <InfoRow icon={<I.user size={17}/>} label={t('gender')} value={student.gender === 'male' ? t('male') : student.gender === 'female' ? t('female') : student.gender}/>
          <InfoRow icon={<I.faculty size={17}/>} label={lang==='vi'?'Khoa':'Faculty'} value={student.department}/>
          <InfoRow icon={<I.class size={17}/>} label={t('class')} value={student.class}/>
          <div style={{ height: 8 }}/>
          <h3 style={{ margin: '8px 0 6px', fontSize: 15, fontWeight: 700 }}>{t('contact')}</h3>
          <InfoRow icon={<I.mail size={17}/>} label={t('email')} value={student.email}/>
          <InfoRow icon={<I.mail size={17}/>} label={t('personalEmail')} value={student.personalEmail}/>
          {student.address && <InfoRow icon={<I.pin size={17}/>} label={lang==='vi'?'Địa chỉ':'Address'} value={student.address}/>}
        </div>

        {/* Right: status */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>{lang==='vi'?'Trạng thái':'Status'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--surface-3)' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{lang==='vi'?'Trạng thái học':'Study status'}</div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>{student.status}</div>
            </div>
            {student.createdAt && (
              <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--surface-3)' }}>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{lang==='vi'?'Ngày tạo':'Created'}</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{new Date(student.createdAt).toLocaleDateString('vi-VN')}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}

// ─── ScheduleScreen ───────────────────────────────────────────────────────────
// Shows teacher's sections or student's enrollments as a visual schedule

const SECTION_COLORS = ['#2F6FED', '#1F8A5B', '#8B5CF6', '#C9821A', '#EC6A9C', '#0E9F9F'];

function ScheduleScreen({ role }) {
  const { t, lang } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = role === 'TEACHER' ? requestMySections() : requestMyEnrollments();
    fetch
      .then(res => {
        const data = res.metadata || [];
        if (role === 'TEACHER') {
          setItems(data);
        } else {
          // Student: flatten from enrollments
          setItems(data.map(e => e.subjectClass).filter(Boolean));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [role]);

  // Group by semester
  const bySemester = useMemo(() => {
    const m = {};
    items.forEach(s => {
      const sem = s.semester || (lang==='vi'?'Không rõ':'Unknown');
      if (!m[sem]) m[sem] = [];
      m[sem].push(s);
    });
    return Object.entries(m).sort(([a], [b]) => a.localeCompare(b));
  }, [items, lang]);

  return (
    <Page>
      <SectionHead
        title={t('weeklySchedule')}
        desc={role === 'TEACHER'
          ? (lang==='vi'?'Các lớp học phần được phân công':'Your assigned sections')
          : (lang==='vi'?'Các môn học đã đăng ký':'Your registered courses')}/>

      {loading ? <Spinner/> : items.length === 0 ? (
        <Empty text={role === 'TEACHER'
          ? (lang==='vi'?'Chưa có lớp học phần nào được phân công':'No sections assigned yet')
          : (lang==='vi'?'Chưa đăng ký môn học nào':'No courses registered yet')}/>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid-cards">
            {items.map((s, i) => {
              const color = SECTION_COLORS[i % SECTION_COLORS.length];
              const subj = role === 'TEACHER' ? s.subject : s.subject;
              const enrolled = role === 'TEACHER' ? (s._count?.enrollments ?? 0) : null;
              return (
                <div key={s.id} style={{ padding: 18, borderRadius: 14, background: 'var(--surface-3)', display: 'flex', gap: 14, alignItems: 'flex-start',
                  boxShadow: `inset 0 0 0 1px color-mix(in srgb,${color} 20%, var(--border))` }}>
                  <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 4, background: color, flexShrink: 0 }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>{subj?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--mono)' }}>{s.code}</span>
                      <span>· {s.semester}</span>
                      {subj?.credits && <span>· {subj.credits} TC</span>}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 12.5, color: 'var(--text-2)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <I.clock size={12}/>{formatSchedule(s, lang)}
                    </div>
                    {role === 'TEACHER' && enrolled !== null && (
                      <div style={{ marginTop: 6, fontSize: 12, color: 'var(--muted)' }}>
                        <I.users size={12} style={{ verticalAlign: 'middle', marginRight: 4 }}/>{enrolled} {lang==='vi'?'sinh viên':'students'}
                      </div>
                    )}
                    {role === 'TEACHER' && s.teacher && (
                      <div style={{ marginTop: 4, fontSize: 12, color: 'var(--muted)' }}>
                        <I.user size={12} style={{ verticalAlign: 'middle', marginRight: 4 }}/>{s.teacher.fullName}
                        {s.teacher.degree && ` (${s.teacher.degree})`}
                      </div>
                    )}
                    {role === 'TEACHER' && (
                      <div style={{ marginTop: 6 }}>
                        <span className={`badge ${s.status === 'active' ? 'badge-success' : s.status === 'completed' ? 'badge-muted' : 'badge-danger'}`}>
                          {s.status === 'active' ? (lang==='vi'?'Đang mở':'Active') : s.status === 'completed' ? (lang==='vi'?'Hoàn thành':'Completed') : (lang==='vi'?'Đã hủy':'Canceled')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Semester-grouped list */}
          {bySemester.map(([sem, secs]) => (
            <div key={sem}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', margin: '8px 0 12px', padding: '8px 16px', background: 'var(--surface-2)', borderRadius: 10 }}>
                {lang==='vi'?'Học kỳ':'Semester'}: {sem} · {secs.length} {lang==='vi'?'lớp':'sections'}
              </div>
              <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-2)' }}>
                      {[lang==='vi'?'Môn học':'Subject', lang==='vi'?'Mã HP':'Code', lang==='vi'?'Lịch học':'Schedule', lang==='vi'?'Tín chỉ':'Credits',
                        ...(role === 'TEACHER' ? [lang==='vi'?'SV đăng ký':'Students', lang==='vi'?'Trạng thái':'Status'] : [])
                      ].map((h, i) => (
                        <th key={i} style={{ textAlign: i === 0 ? 'left' : 'center', padding: '11px 16px', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {secs.map((s, ri) => {
                      const subj = s.subject;
                      const color = SECTION_COLORS[(items.indexOf(s)) % SECTION_COLORS.length];
                      return (
                        <tr key={s.id} style={{ borderBottom: ri < secs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 4, height: 32, borderRadius: 4, background: color, flexShrink: 0 }}/>
                              <div>
                                <div style={{ fontWeight: 600 }}>{subj?.name}</div>
                                {role === 'TEACHER' && s.teacher && (
                                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.teacher.fullName}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 13 }}>{s.code}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12.5 }}>{formatSchedule(s, lang)}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'var(--mono)' }}>{subj?.credits}</td>
                          {role === 'TEACHER' && <>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>{s._count?.enrollments ?? 0}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-muted'}`}>
                                {s.status === 'active' ? (lang==='vi'?'Mở':'Active') : s.status}
                              </span>
                            </td>
                          </>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}
    </Page>
  );
}

export { StudentProfile, ScheduleScreen };
