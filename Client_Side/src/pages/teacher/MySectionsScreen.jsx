import React, { useState, useEffect, useMemo } from 'react';
import { I } from '../../components/icons';
import { Page, SectionHead } from '../../components/shell';
import { Spinner, Empty, SimplePagination } from '../../components/feedback';
import { useApp } from '../../context/AppContext';
import { formatSchedule } from '../../utils/schedule';
import { requestMySections } from '../../config/userRequest';

/* EduManage — Teacher: Các lớp học phần phụ trách */

const SECTION_COLORS = ['#2F6FED', '#1F8A5B', '#8B5CF6', '#C9821A', '#EC6A9C', '#0E9F9F'];

// Màn hình các lớp học phần giảng viên phụ trách, có lối tắt sang điểm danh / nhập điểm
export default function MySectionsScreen({ onOpenAttendance, onOpenGrades }) {
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
        <Empty icon={I.layers} text={q ? (lang==='vi'?'Không tìm thấy kết quả':'No results found') : (lang==='vi'?'Chưa có lớp học phần nào':'No sections assigned')}/>
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
                    <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                      <I.clock size={13}/>{formatSchedule(s, lang)}
                    </div>
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
          <SimplePagination page={page} total={filtered.length} size={PAGE_SIZE} onChange={setPage}/>
          <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--muted)', marginTop: 8 }}>
            {lang==='vi'?`${filtered.length} lớp học phần`:`${filtered.length} sections`}
          </div>
        </>
      )}
    </Page>
  );
}
