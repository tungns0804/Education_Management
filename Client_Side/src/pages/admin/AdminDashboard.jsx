import React, { useState, useEffect } from 'react';
import { I } from '../../components/icons';
import { StatCard } from '../../components/ui';
import { BarChart, DonutChart } from '../../components/charts';
import { Page, SectionHead } from '../../components/shell';
import { useApp } from '../../context/AppContext';
import { requestDashboard, requestStudentsByDepartment } from '../../config/userRequest';

/* EduManage — Admin: Dashboard tổng quan */

export default function AdminDashboard() {
  const { t, lang } = useApp();
  const [stats, setStats] = useState(null);
  const [deptDist, setDeptDist] = useState({ semesters: [], total: 0, data: [] });
  const [semester, setSemester] = useState('');

  useEffect(() => {
    requestDashboard().then(r => setStats(r.metadata)).catch(() => {});
  }, []);

  useEffect(() => {
    requestStudentsByDepartment(semester)
      .then(r => setDeptDist(r.metadata ?? { semesters: [], total: 0, data: [] }))
      .catch(() => {});
  }, [semester]);

  const s = stats ?? { students: 0, teachers: 0, sections: 0, subjects: 0, gender: { male: 0, female: 0 } };

  const DEPT_PALETTE = ['#2F6FED', '#1F8A5B', '#C9821A', '#8B5CF6', '#EC6A9C', '#0EA5E9', '#14B8A6', '#F97316'];
  const deptChart = (deptDist.data ?? []).map((d, i) => ({
    label: d.code,
    value: d.value,
    color: DEPT_PALETTE[i % DEPT_PALETTE.length],
  }));
  const deptDesc = lang === 'vi'
    ? (semester ? `Phân bổ sinh viên học kỳ ${semester} · ${deptDist.total ?? 0} SV` : `Phân bổ toàn trường · ${deptDist.total ?? 0} sinh viên`)
    : (semester ? `Distribution · semester ${semester} · ${deptDist.total ?? 0} students` : `Distribution across faculties · ${deptDist.total ?? 0} students`);

  return (
    <Page>
      <div className="grid-stats">
        <StatCard icon={<I.users size={22}/>}   label={t('students')} value={s.students} accent="#2F6FED"/>
        <StatCard icon={<I.teacher size={22}/>}  label={t('teachers')} value={s.teachers} accent="#1F8A5B"/>
        <StatCard icon={<I.layers size={22}/>}   label={t('sections')} value={s.sections} accent="#8B5CF6"/>
        <StatCard icon={<I.book size={22}/>}     label={t('subjects')} value={s.subjects} accent="#C9821A"/>
      </div>

      <div className="grid-2-1">
        <div className="card" style={{ padding: 22 }}>
          <SectionHead title={lang==='vi'?'Sinh viên theo khoa':'Students by faculty'} desc={deptDesc}
            right={
              <select className="select" style={{ height: 38, width: 'auto', minWidth: 140, paddingRight: 30 }} value={semester} onChange={e => setSemester(e.target.value)}>
                <option value="">{lang === 'vi' ? 'Mọi học kỳ' : 'All semesters'}</option>
                {(deptDist.semesters ?? []).map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            }/>
          <div style={{ marginTop: 18 }}><BarChart data={deptChart} height={230}/></div>
        </div>
        <div className="card" style={{ padding: 22 }}>
          <SectionHead title={lang==='vi'?'Tỉ lệ giới tính':'Gender ratio'}/>
          <div style={{ marginTop: 20 }}>
            <DonutChart centerTop={s.students} centerSub={lang==='vi'?'sinh viên':'students'} data={[
              { label: t('male'),   value: s.gender?.male   ?? 0, color: '#2F6FED' },
              { label: t('female'), value: s.gender?.female ?? 0, color: '#EC6A9C' },
            ]}/>
          </div>
        </div>
      </div>

    </Page>
  );
}
