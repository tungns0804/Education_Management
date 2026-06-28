import React, { useState, useEffect } from 'react';
import { DB } from './db';
import { I } from './icons';
import { Avatar, Modal, StatusBadge, useApp, useToast } from './ui';
import { downloadCSV } from './tools';
import { DataTable, Page, SectionHead } from './shell';
import { FilterSelect, RowAction, TableToolbar } from './admin';

/* EduManage — Admin: Teachers, Catalog (Faculty/Major/Class/Subject), Sections */

function TeachersScreen() {
  const { t, lang, tn } = useApp();
  const toast = useToast();
  const [teachers, setTeachers] = useState(DB.TEACHERS);
  const [q, setQ] = useState('');
  const [facFilter, setFacFilter] = useState('');
  const [confirmDel, setConfirmDel] = useState(null);

  const filtered = teachers.filter(tc => {
    if (q && !(tc.name.toLowerCase().includes(q.toLowerCase()) || tc.code.toLowerCase().includes(q.toLowerCase()))) return false;
    if (facFilter && tc.facultyId !== facFilter) return false;
    return true;
  });
  const columns = [
    { header: t('teachers'), nowrap: true, cell: tc => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <Avatar name={tc.name} hue={tc.avatarHue} size={38}/>
        <div><div style={{ fontWeight: 600 }}>{tc.name}</div><div style={{ fontSize: 12.5, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{tc.code}</div></div>
      </div>
    ) },
    { header: t('degree'), cell: tc => <span className="badge badge-info">{tc['degree_' + lang]}</span> },
    { header: t('faculty'), cell: tc => tn(DB.MAP.faculty[tc.facultyId]) },
    { header: t('email'), nowrap: true, cell: tc => <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{tc.email}</span> },
    { header: t('sections'), align: 'center', cell: tc => <span style={{ fontWeight: 700, fontFamily: 'var(--mono)' }}>{tc.sections}</span> },
    { header: t('status'), cell: tc => <StatusBadge active={tc.active}/> },
  ];
  const toggleActive = (tc) => { setTeachers(xs => xs.map(x => x.id === tc.id ? { ...x, active: !x.active } : x)); toast(tc.active ? (lang==='vi'?'Đã khóa':'Locked') : (lang==='vi'?'Đã mở khóa':'Unlocked'), tc.active ? 'warn' : 'success'); };

  return (
    <Page>
      <SectionHead title={t('teachers')} desc={lang==='vi'?`Quản lý ${teachers.length} giảng viên và phân công giảng dạy`:`Manage ${teachers.length} teachers and assignments`}
        right={<button className="btn btn-outline btn-sm" style={{ height: 40 }} onClick={() => { downloadCSV('giang-vien.csv', [t('name'), t('code'), t('degree'), t('faculty'), t('email'), t('sections'), t('status')], filtered.map(tc => [tc.name, tc.code, tc['degree_' + lang], tn(DB.MAP.faculty[tc.facultyId]), tc.email, tc.sections, tc.active ? t('active') : t('locked')])); toast(`${t('exported')} · ${filtered.length} ${lang==='vi'?'dòng':'rows'}`); }}><I.download size={16}/>{t('export')}</button>}/>
      <DataTable columns={columns} rows={filtered} perPage={8}
        renderActions={tc => <RowAction onEdit={() => toast(lang==='vi'?'Mở form sửa giảng viên':'Open edit form')} active={tc.active} onToggle={() => toggleActive(tc)} onDelete={() => setConfirmDel(tc)}/>}
        toolbar={<TableToolbar q={q} setQ={setQ} onAdd={() => toast(lang==='vi'?'Mở form thêm giảng viên':'Open add teacher')} addLabel={lang==='vi'?'Thêm giảng viên':'Add teacher'}
          filters={<FilterSelect value={facFilter} onChange={setFacFilter} allLabel={lang==='vi'?'Mọi khoa':'All faculties'} options={DB.FACULTIES.map(f => ({ value: f.id, label: tn(f) }))}/>}/>}/>
      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} tone="danger" icon={<I.trash size={22}/>}
        title={lang==='vi'?'Xóa giảng viên?':'Delete teacher?'}
        footer={<><button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>{t('cancel')}</button>
          <button className="btn btn-danger" onClick={() => { setTeachers(xs => xs.filter(x => x.id !== confirmDel.id)); toast(lang==='vi'?'Đã xóa':'Deleted', 'danger'); setConfirmDel(null); }}>{t('del')}</button></>}>
        {lang==='vi' ? <>Xóa giảng viên <b>{confirmDel?.name}</b>?</> : <>Delete teacher <b>{confirmDel?.name}</b>?</>}
      </Modal>
    </Page>
  );
}

// Generic catalog screen for Faculty / Major / Class / Subject
function CatalogScreen({ kind }) {
  const { t, lang, tn } = useApp();
  const toast = useToast();
  const conf = {
    faculty: { data: DB.FACULTIES, title: t('faculties'), add: lang==='vi'?'Thêm khoa':'Add faculty',
      cols: [
        { header: t('code'), cell: r => <span className="badge badge-muted" style={{ fontFamily: 'var(--mono)' }}>{r.code}</span> },
        { header: t('name'), cell: r => <span style={{ fontWeight: 600 }}>{tn(r)}</span> },
        { header: t('majors'), align: 'center', cell: r => DB.MAJORS.filter(m => m.facultyId === r.id).length },
        { header: t('teachers'), align: 'center', cell: r => DB.TEACHERS.filter(tc => tc.facultyId === r.id).length },
      ] },
    major: { data: DB.MAJORS, title: t('majors'), add: lang==='vi'?'Thêm ngành':'Add major',
      cols: [
        { header: t('code'), cell: r => <span className="badge badge-muted" style={{ fontFamily: 'var(--mono)' }}>{r.code}</span> },
        { header: t('name'), cell: r => <span style={{ fontWeight: 600 }}>{tn(r)}</span> },
        { header: t('faculty'), cell: r => tn(DB.MAP.faculty[r.facultyId]) },
        { header: t('classes'), align: 'center', cell: r => DB.CLASSES.filter(c => c.majorId === r.id).length },
      ] },
    class: { data: DB.CLASSES, title: t('classes'), add: lang==='vi'?'Thêm lớp':'Add class',
      cols: [
        { header: t('code'), cell: r => <span className="badge badge-muted" style={{ fontFamily: 'var(--mono)' }}>{r.code}</span> },
        { header: t('name'), cell: r => <span style={{ fontWeight: 600 }}>{r.name}</span> },
        { header: t('major'), cell: r => tn(DB.MAP.major[r.majorId]) },
        { header: t('year'), align: 'center', cell: r => r.year },
        { header: t('students'), align: 'center', cell: r => DB.STUDENTS.filter(s => s.classId === r.id).length },
      ] },
    subject: { data: DB.SUBJECTS, title: t('subjects'), add: lang==='vi'?'Thêm môn học':'Add subject',
      cols: [
        { header: t('code'), cell: r => <span className="badge badge-muted" style={{ fontFamily: 'var(--mono)' }}>{r.code}</span> },
        { header: t('name'), cell: r => <span style={{ fontWeight: 600 }}>{tn(r)}</span> },
        { header: t('major'), cell: r => tn(DB.MAP.major[r.majorId]) },
        { header: t('credits'), align: 'center', cell: r => <span style={{ fontWeight: 700, fontFamily: 'var(--mono)' }}>{r.credits}</span> },
      ] },
  }[kind];

  const [rows, setRows] = useState(conf.data);
  const [q, setQ] = useState('');
  useEffect(() => { setRows(conf.data); setQ(''); }, [kind]);
  const filtered = rows.filter(r => {
    const name = (r.name_vi || r.name || '') + ' ' + (r.name_en || '');
    return !q || name.toLowerCase().includes(q.toLowerCase()) || (r.code || '').toLowerCase().includes(q.toLowerCase());
  });

  return (
    <Page>
      <SectionHead title={conf.title} desc={lang==='vi'?`${rows.length} bản ghi`:`${rows.length} records`}/>
      <DataTable columns={conf.cols} rows={filtered} perPage={8}
        renderActions={r => <RowAction onEdit={() => toast(lang==='vi'?'Mở form sửa':'Open edit')} onDelete={() => { setRows(xs => xs.filter(x => x.id !== r.id)); toast(lang==='vi'?'Đã xóa':'Deleted', 'danger'); }}/>}
        toolbar={<TableToolbar q={q} setQ={setQ} onAdd={() => toast(lang==='vi'?'Mở form thêm':'Open add form')} addLabel={conf.add}/>}/>
    </Page>
  );
}

// Course sections — card grid
function SectionsScreen() {
  const { t, lang, tn } = useApp();
  const toast = useToast();
  const [q, setQ] = useState('');
  const filtered = DB.SECTIONS.filter(s => {
    const sub = DB.MAP.subject[s.subjectId];
    return !q || s.code.toLowerCase().includes(q.toLowerCase()) || tn(sub).toLowerCase().includes(q.toLowerCase());
  });
  return (
    <Page>
      <SectionHead title={t('sections')} desc={lang==='vi'?`${DB.SECTIONS.length} lớp học phần · HK1 2024–2025`:`${DB.SECTIONS.length} sections · Semester 1 2024–2025`}
        right={<button className="btn btn-primary btn-sm" style={{ height: 40 }} onClick={() => toast(lang==='vi'?'Mở form tạo lớp HP':'Open create section')}><I.plus size={16}/>{lang==='vi'?'Tạo lớp HP':'New section'}</button>}/>
      <div className="input-group" style={{ maxWidth: 340 }}><I.search size={16}/><input className="input" style={{ height: 42 }} value={q} onChange={e => setQ(e.target.value)} placeholder={t('search')}/></div>
      <div className="grid-cards">
        {filtered.map(s => {
          const sub = DB.MAP.subject[s.subjectId];
          const tc = DB.MAP.teacher[s.teacherId];
          const pct = Math.round(s.enrolled / s.max * 100);
          const full = pct >= 95;
          return (
            <div key={s.id} className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>{tn(sub)}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 2 }}>{s.code}</div>
                </div>
                <span className="badge badge-muted">{sub.credits} {t('credits')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Avatar name={tc.name} hue={tc.avatarHue} size={28}/>
                <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>{tc.name}</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 7 }}><I.clock size={14}/>{s.schedule}</div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                  <span style={{ color: 'var(--muted)' }}>{lang==='vi'?'Sĩ số':'Enrolled'}</span>
                  <span style={{ fontWeight: 700 }}>{s.enrolled}/{s.max}</span>
                </div>
                <div style={{ height: 7, borderRadius: 5, background: 'var(--surface-3)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: pct + '%', borderRadius: 5, background: full ? 'var(--danger)' : pct > 80 ? 'var(--warn)' : 'var(--success)', transition: 'width .6s' }}/>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
}

export { TeachersScreen, CatalogScreen, SectionsScreen };
