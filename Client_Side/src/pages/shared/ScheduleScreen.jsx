import React, { useState, useEffect, useMemo } from 'react';
import { I } from '../../components/icons';
import { Page, SectionHead } from '../../components/shell';
import { Spinner, Empty } from '../../components/feedback';
import { useApp } from '../../context/AppContext';
import { formatSchedule } from '../../utils/schedule';
import { requestMySections, requestMyEnrollments } from '../../config/userRequest';

/* EduManage — Trang dùng chung: Thời khóa biểu (lịch dạy GV / lịch học SV) */

const SECTION_COLORS = ['#2F6FED', '#1F8A5B', '#8B5CF6', '#C9821A', '#EC6A9C', '#0E9F9F'];

export default function ScheduleScreen({ role }) {
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

      {loading ? <Spinner size={28} padding={40}/> : items.length === 0 ? (
        <Empty padding={40} text={role === 'TEACHER'
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
