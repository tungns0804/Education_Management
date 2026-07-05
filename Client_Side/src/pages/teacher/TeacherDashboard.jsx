import React, { useState, useEffect } from 'react';
import { I } from '../../components/icons';
import { StatCard } from '../../components/ui';
import { BarChart } from '../../components/charts';
import { Page, SectionHead } from '../../components/shell';
import { Spinner, Empty } from '../../components/feedback';
import { useApp } from '../../context/AppContext';
import { formatSchedule } from '../../utils/schedule';
import { requestTeacherDashboard } from '../../config/userRequest';

/* EduManage — Teacher: Dashboard giảng dạy */

const SECTION_COLORS = ['#2F6FED', '#1F8A5B', '#8B5CF6', '#C9821A', '#EC6A9C', '#0E9F9F'];

export default function TeacherDashboard() {
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
                  : <Empty icon={I.layers} text={lang==='vi'?'Chưa có dữ liệu điểm danh':'No attendance data yet'}/>
                }
              </div>
            </div>

            <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
              <SectionHead title={lang==='vi'?'Các lớp phụ trách':'My sections'}/>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sections.length === 0
                  ? <Empty icon={I.layers} text={lang==='vi'?'Chưa có lớp phụ trách':'No sections assigned'}/>
                  : sections.slice(0, 4).map((s, i) => (
                    <div key={s.id} style={{ display: 'flex', gap: 13, padding: 13, borderRadius: 12, background: 'var(--surface-3)' }}>
                      <div style={{ width: 4, borderRadius: 4, background: SECTION_COLORS[i % SECTION_COLORS.length] }}/>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{s.subjectName}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3, fontFamily: 'var(--mono)' }}>{s.code} · {s.semester}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <I.clock size={12}/>{formatSchedule(s, lang)}
                        </div>
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
