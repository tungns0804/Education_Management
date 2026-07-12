import React, { useState, useEffect } from 'react';
import { I } from '../../components/icons';
import { Avatar, StatCard } from '../../components/ui';
import { LineChart, Ring } from '../../components/charts';
import { Page, SectionHead } from '../../components/shell';
import { Spinner, Empty } from '../../components/feedback';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatSchedule } from '../../utils/schedule';
import { requestStudentDashboard } from '../../config/userRequest';

/* EduManage — Student: Dashboard học tập */

const COURSE_COLORS = ['#2F6FED', '#1F8A5B', '#8B5CF6', '#C9821A', '#EC6A9C', '#0E9F9F'];

// Dashboard sinh viên: GPA, tín chỉ, chuyên cần, môn đang học và biểu đồ điểm
export default function StudentDashboard({ onNav }) {
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
  const standing = stats?.gpa >= 8.5 ? (lang==='vi'?'Xuất sắc':'Excellent')
    : stats?.gpa >= 7.0 ? (lang==='vi'?'Giỏi':'Good')
    : stats?.gpa >= 5.5 ? (lang==='vi'?'Khá':'Fair')
    : (lang==='vi'?'Trung bình':'Average');

  // Quy đổi GPA thang 4.0 sang thang 10 cho vòng tiến độ (ước lượng)
  const TOTAL_CREDITS = 145; // tổng tín chỉ điển hình của một chương trình đào tạo

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
                  ? <LineChart data={gpaTrend.map(x => ({ term: x.term, value: x.gpa }))} height={210} yMax={10} fmt={v => v.toFixed(1)}/>
                  : <Empty icon={I.book} text={lang==='vi'?'Chưa có dữ liệu GPA':'No GPA data yet'}/>
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
              ? <Empty icon={I.book} text={lang==='vi'?'Chưa đăng ký môn nào học kỳ này':'No courses registered this semester'}/>
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
                      <div style={{ fontSize: 12.5, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                        <I.clock size={13}/>{formatSchedule(e.subjectClass, lang)}
                      </div>
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
