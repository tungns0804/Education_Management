import React, { useState, useEffect } from 'react';
import { I } from './icons';
import { Avatar, Modal, StatusBadge, useApp, useToast } from './ui';
import { downloadCSV } from './tools';
import { DataTable, Page, SectionHead } from './shell';
import { FilterSelect, RowAction, TableToolbar } from './admin';
import {
  requestTeachers, requestToggleUserStatus, requestDeleteUser,
  requestDepartments, requestDeleteDepartment,
  requestBranches,   requestDeleteBranch,
  requestClasses,    requestDeleteClass,
  requestSubjects,   requestDeleteSubject,
  requestSubjectClasses, requestDeleteSubjectClass,
} from '../config/userRequest';

/* EduManage — Admin: Teachers, Catalog (Faculty/Major/Class/Subject), Sections */

// ── Adapter: normalise API teacher → UI shape ──────────────────────────────
const toTeacher = (tc) => ({
  id:        tc.id,
  name:      tc.fullName,
  code:      tc.idTeacher,
  email:     tc.email,
  degree:    tc.degree || '',
  deptName:  tc.department || '',   // department name string → used as filter key
  sections:  tc._count?.taughtSections ?? 0,
  active:    ['active', 'teaching'].includes(tc.status),
  avatarHue: 160,
  phone:     tc.phone || '',
  status:    tc.status,
});

// ── Teachers screen ────────────────────────────────────────────────────────
function TeachersScreen() {
  const { t, lang } = useApp();
  const toast = useToast();
  const [teachers,   setTeachers]   = useState([]);
  const [depts,      setDepts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [q,          setQ]          = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [confirmDel, setConfirmDel] = useState(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([requestTeachers(), requestDepartments()])
      .then(([tcRes, dRes]) => {
        setTeachers((tcRes.metadata ?? []).map(toTeacher));
        setDepts(dRes.metadata ?? []);
      })
      .catch(() => toast(lang === 'vi' ? 'Lỗi tải dữ liệu' : 'Failed to load data', 'danger'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const filtered = teachers.filter(tc => {
    if (q && !(tc.name.toLowerCase().includes(q.toLowerCase()) || (tc.code || '').toLowerCase().includes(q.toLowerCase()))) return false;
    if (deptFilter && tc.deptName !== deptFilter) return false;
    return true;
  });

  const columns = [
    { header: t('teachers'), nowrap: true, cell: tc => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <Avatar name={tc.name} hue={tc.avatarHue} size={38}/>
        <div><div style={{ fontWeight: 600 }}>{tc.name}</div><div style={{ fontSize: 12.5, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{tc.code}</div></div>
      </div>
    ) },
    { header: t('degree'),   cell: tc => tc.degree ? <span className="badge badge-info">{tc.degree}</span> : '—' },
    { header: t('faculty'),  cell: tc => <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{tc.deptName || '—'}</span> },
    { header: t('email'),    nowrap: true, cell: tc => <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{tc.email}</span> },
    { header: t('sections'), align: 'center', cell: tc => <span style={{ fontWeight: 700, fontFamily: 'var(--mono)' }}>{tc.sections}</span> },
    { header: t('status'),   cell: tc => <StatusBadge active={tc.active}/> },
  ];

  const toggleActive = (tc) => {
    const newStatus = tc.active ? 'inactive' : 'active';
    requestToggleUserStatus(tc.id, newStatus)
      .then(() => {
        setTeachers(xs => xs.map(x => x.id === tc.id ? { ...x, active: !x.active } : x));
        toast(tc.active ? (lang === 'vi' ? 'Đã khóa' : 'Locked') : (lang === 'vi' ? 'Đã mở khóa' : 'Unlocked'), tc.active ? 'warn' : 'success');
      })
      .catch(() => toast(lang === 'vi' ? 'Lỗi cập nhật' : 'Update failed', 'danger'));
  };

  return (
    <Page>
      <SectionHead title={t('teachers')}
        desc={lang === 'vi' ? `Quản lý ${teachers.length} giảng viên và phân công giảng dạy` : `Manage ${teachers.length} teachers and assignments`}
        right={<button className="btn btn-outline btn-sm" style={{ height: 40 }} onClick={() => {
          downloadCSV('giang-vien.csv',
            [t('name'), t('code'), t('degree'), t('faculty'), t('email'), t('sections'), t('status')],
            filtered.map(tc => [tc.name, tc.code, tc.degree, tc.deptName, tc.email, tc.sections, tc.active ? t('active') : t('locked')]));
          toast(`${t('exported')} · ${filtered.length} ${lang === 'vi' ? 'dòng' : 'rows'}`);
        }}><I.download size={16}/>{t('export')}</button>}/>

      <DataTable columns={columns} rows={filtered} perPage={8}
        renderActions={tc => <RowAction
          onEdit={() => toast(lang === 'vi' ? 'Mở form sửa giảng viên' : 'Open edit form')}
          active={tc.active}
          onToggle={() => toggleActive(tc)}
          onDelete={() => setConfirmDel(tc)}/>}
        toolbar={<TableToolbar q={q} setQ={setQ}
          onAdd={() => toast(lang === 'vi' ? 'Mở form thêm giảng viên' : 'Open add teacher')}
          addLabel={lang === 'vi' ? 'Thêm giảng viên' : 'Add teacher'}
          filters={<FilterSelect value={deptFilter} onChange={setDeptFilter}
            allLabel={lang === 'vi' ? 'Mọi khoa' : 'All faculties'}
            options={depts.map(d => ({ value: d.nameDepartment, label: d.nameDepartment }))}/>}/>}/>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} tone="danger" icon={<I.trash size={22}/>}
        title={lang === 'vi' ? 'Xóa giảng viên?' : 'Delete teacher?'}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>{t('cancel')}</button>
          <button className="btn btn-danger" onClick={async () => {
            try {
              await requestDeleteUser(confirmDel.id);
              setTeachers(xs => xs.filter(x => x.id !== confirmDel.id));
              toast(lang === 'vi' ? 'Đã xóa' : 'Deleted', 'danger');
            } catch {
              toast(lang === 'vi' ? 'Xóa thất bại' : 'Delete failed', 'danger');
            }
            setConfirmDel(null);
          }}>{t('del')}</button>
        </>}>
        {lang === 'vi' ? <>Xóa giảng viên <b>{confirmDel?.name}</b>?</> : <>Delete teacher <b>{confirmDel?.name}</b>?</>}
      </Modal>
    </Page>
  );
}

// ── Generic catalog screen — Department / Branch / Class / Subject ─────────
function CatalogScreen({ kind }) {
  const { t, lang } = useApp();
  const toast = useToast();
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [q,          setQ]          = useState('');
  const [confirmDel, setConfirmDel] = useState(null);

  // Fetch + columns config per kind
  const conf = {
    faculty: {
      fetch:    () => requestDepartments(),
      title:    t('faculties'),
      add:      lang === 'vi' ? 'Thêm khoa' : 'Add faculty',
      delReq:   (r) => requestDeleteDepartment(r.id),
      cols: [
        { header: t('code'), cell: r => <span className="badge badge-muted" style={{ fontFamily: 'var(--mono)' }}>{r.code}</span> },
        { header: t('name'), cell: r => <span style={{ fontWeight: 600 }}>{r.nameDepartment}</span> },
      ],
      search: (r) => (r.nameDepartment || '') + ' ' + (r.code || ''),
    },
    major: {
      fetch:    () => requestBranches(),
      title:    t('majors'),
      add:      lang === 'vi' ? 'Thêm ngành' : 'Add major',
      delReq:   (r) => requestDeleteBranch(r.id),
      cols: [
        { header: t('code'),    cell: r => <span className="badge badge-muted" style={{ fontFamily: 'var(--mono)' }}>{r.code}</span> },
        { header: t('name'),    cell: r => <span style={{ fontWeight: 600 }}>{r.nameBranch}</span> },
        { header: t('faculty'), cell: r => <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{r.department?.nameDepartment || '—'}</span> },
      ],
      search: (r) => (r.nameBranch || '') + ' ' + (r.code || ''),
    },
    class: {
      fetch:    () => requestClasses(),
      title:    t('classes'),
      add:      lang === 'vi' ? 'Thêm lớp' : 'Add class',
      delReq:   (r) => requestDeleteClass(r.id),
      cols: [
        { header: t('code'),    cell: r => <span className="badge badge-muted" style={{ fontFamily: 'var(--mono)' }}>{r.code}</span> },
        { header: t('name'),    cell: r => <span style={{ fontWeight: 600 }}>{r.nameClass}</span> },
        { header: t('faculty'), cell: r => <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{r.department?.nameDepartment || '—'}</span> },
        { header: lang === 'vi' ? 'CVHT' : 'Advisor', cell: r => <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{r.teacher?.fullName || '—'}</span> },
      ],
      search: (r) => (r.nameClass || '') + ' ' + (r.code || ''),
    },
    subject: {
      fetch:    () => requestSubjects(),
      title:    t('subjects'),
      add:      lang === 'vi' ? 'Thêm môn học' : 'Add subject',
      delReq:   (r) => requestDeleteSubject(r.id),
      cols: [
        { header: t('code'),    cell: r => <span className="badge badge-muted" style={{ fontFamily: 'var(--mono)' }}>{r.code}</span> },
        { header: t('name'),    cell: r => <span style={{ fontWeight: 600 }}>{r.name}</span> },
        { header: t('faculty'), cell: r => <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{r.department?.nameDepartment || '—'}</span> },
        { header: t('credits'), align: 'center', cell: r => <span style={{ fontWeight: 700, fontFamily: 'var(--mono)' }}>{r.credits}</span> },
      ],
      search: (r) => (r.name || '') + ' ' + (r.code || ''),
    },
  }[kind];

  const loadData = () => {
    setLoading(true);
    conf.fetch()
      .then(res => setRows(res.metadata ?? []))
      .catch(() => toast(lang === 'vi' ? 'Lỗi tải dữ liệu' : 'Failed to load data', 'danger'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setRows([]); setQ(''); loadData(); }, [kind]);

  const filtered = rows.filter(r => !q || conf.search(r).toLowerCase().includes(q.toLowerCase()));

  return (
    <Page>
      <SectionHead title={conf.title} desc={lang === 'vi' ? `${rows.length} bản ghi` : `${rows.length} records`}/>
      <DataTable columns={conf.cols} rows={filtered} perPage={8}
        renderActions={r => <RowAction
          onEdit={() => toast(lang === 'vi' ? 'Mở form sửa' : 'Open edit')}
          onDelete={() => setConfirmDel(r)}/>}
        toolbar={<TableToolbar q={q} setQ={setQ}
          onAdd={() => toast(lang === 'vi' ? 'Mở form thêm' : 'Open add form')}
          addLabel={conf.add}/>}/>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} tone="danger" icon={<I.trash size={22}/>}
        title={lang === 'vi' ? 'Xác nhận xóa?' : 'Confirm delete?'}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>{t('cancel')}</button>
          <button className="btn btn-danger" onClick={async () => {
            try {
              await conf.delReq(confirmDel);
              setRows(xs => xs.filter(x => x.id !== confirmDel.id));
              toast(lang === 'vi' ? 'Đã xóa' : 'Deleted', 'danger');
            } catch (err) {
              const msg = err?.response?.data?.message || (lang === 'vi' ? 'Xóa thất bại' : 'Delete failed');
              toast(msg, 'danger');
            }
            setConfirmDel(null);
          }}>{t('del')}</button>
        </>}>
        {lang === 'vi' ? 'Hành động này không thể hoàn tác.' : 'This action cannot be undone.'}
      </Modal>
    </Page>
  );
}

// ── Sections screen — card grid ────────────────────────────────────────────
function SectionsScreen() {
  const { t, lang } = useApp();
  const toast = useToast();
  const [sections,   setSections]   = useState([]);
  const [q,          setQ]          = useState('');
  const [confirmDel, setConfirmDel] = useState(null);

  useEffect(() => {
    requestSubjectClasses()
      .then(res => setSections(res.metadata ?? []))
      .catch(() => toast(lang === 'vi' ? 'Lỗi tải lớp học phần' : 'Failed to load sections', 'danger'));
  }, []);

  const filtered = sections.filter(s => {
    const name = s.subject?.name || '';
    return !q || s.code.toLowerCase().includes(q.toLowerCase()) || name.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <Page>
      <SectionHead title={t('sections')}
        desc={lang === 'vi' ? `${sections.length} lớp học phần` : `${sections.length} sections`}
        right={<button className="btn btn-primary btn-sm" style={{ height: 40 }}
          onClick={() => toast(lang === 'vi' ? 'Mở form tạo lớp HP' : 'Open create section')}>
          <I.plus size={16}/>{lang === 'vi' ? 'Tạo lớp HP' : 'New section'}
        </button>}/>

      <div className="input-group" style={{ maxWidth: 340 }}>
        <I.search size={16}/>
        <input className="input" style={{ height: 42 }} value={q} onChange={e => setQ(e.target.value)} placeholder={t('search')}/>
      </div>

      <div className="grid-cards">
        {filtered.map(s => {
          const enrolled = s._count?.enrollments ?? 0;
          const max      = s.maxStudents ?? 50;
          const pct      = max > 0 ? Math.round(enrolled / max * 100) : 0;
          const full     = pct >= 95;
          return (
            <div key={s.id} className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>{s.subject?.name ?? '—'}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 2 }}>{s.code}</div>
                </div>
                <span className="badge badge-muted">{s.subject?.credits ?? 0} {t('credits')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Avatar name={s.teacher?.fullName ?? '?'} hue={160} size={28}/>
                <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>{s.teacher?.fullName ?? '—'}</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                {lang === 'vi' ? 'HK:' : 'Semester:'} {s.semester}
                {s.status !== 'active' && <span className="badge badge-muted" style={{ marginLeft: 8 }}>{s.status}</span>}
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                  <span style={{ color: 'var(--muted)' }}>{lang === 'vi' ? 'Sĩ số' : 'Enrolled'}</span>
                  <span style={{ fontWeight: 700 }}>{enrolled}/{max}</span>
                </div>
                <div style={{ height: 7, borderRadius: 5, background: 'var(--surface-3)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: pct + '%', borderRadius: 5, background: full ? 'var(--danger)' : pct > 80 ? 'var(--warn)' : 'var(--success)', transition: 'width .6s' }}/>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                <button className="btn btn-icon btn-sm btn-ghost" onClick={() => toast(lang === 'vi' ? 'Mở form sửa' : 'Open edit')}><I.edit size={15}/></button>
                <button className="btn btn-icon btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDel(s)}><I.trash size={15}/></button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} tone="danger" icon={<I.trash size={22}/>}
        title={lang === 'vi' ? 'Xóa lớp học phần?' : 'Delete section?'}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>{t('cancel')}</button>
          <button className="btn btn-danger" onClick={async () => {
            try {
              await requestDeleteSubjectClass(confirmDel.id);
              setSections(xs => xs.filter(x => x.id !== confirmDel.id));
              toast(lang === 'vi' ? 'Đã xóa lớp học phần' : 'Section deleted', 'danger');
            } catch (err) {
              const msg = err?.response?.data?.message || (lang === 'vi' ? 'Xóa thất bại' : 'Delete failed');
              toast(msg, 'danger');
            }
            setConfirmDel(null);
          }}>{t('del')}</button>
        </>}>
        {lang === 'vi'
          ? <>Xóa lớp học phần <b>{confirmDel?.code}</b> ({confirmDel?.subject?.name})?</>
          : <>Delete section <b>{confirmDel?.code}</b> ({confirmDel?.subject?.name})?</>}
      </Modal>
    </Page>
  );
}

export { TeachersScreen, CatalogScreen, SectionsScreen };
