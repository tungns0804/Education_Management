import React, { useState, useEffect, useMemo } from 'react';
import { I } from '../../components/icons';
import { BtnSpinner, Drawer, FormField, Modal, fieldCls, useForm, useToast, validate } from '../../components/ui';
import { DataTable, Page, SectionHead } from '../../components/shell';
import { TableToolbar, RowAction } from '../../components/table';
import { useApp } from '../../context/AppContext';
import {
  requestTeachers,
  requestDepartments, requestCreateDepartment, requestUpdateDepartment, requestDeleteDepartment,
  requestBranches,   requestCreateBranch,   requestUpdateBranch,   requestDeleteBranch,
  requestClasses,    requestCreateClass,    requestUpdateClass,    requestDeleteClass,
  requestSubjects,   requestCreateSubject,  requestUpdateSubject,  requestDeleteSubject,
} from '../../config/userRequest';

/* EduManage — Admin: Danh mục đào tạo (Khoa / Ngành / Lớp / Môn học) */

// ── Catalog Form Drawer (Faculty / Major / Class / Subject) ───────────────────
function CatalogFormDrawer({ open, onClose, onSave, kind, row, depts, branches, teachers, lang, t }) {
  const isEdit = !!row;

  const getInitial = () => {
    if (kind === 'faculty') return { code: '', nameDepartment: '' };
    if (kind === 'major')   return { code: '', nameBranch: '', departmentId: '' };
    if (kind === 'class')   return { code: '', nameClass: '', branchId: '', teacherId: '' };
    if (kind === 'subject') return { code: '', name: '', credits: '3', branchId: '' };
    return {};
  };

  const validators = useMemo(() => {
    const req = validate.required(t);
    const base = { code: req };
    if (kind === 'faculty') return { ...base, nameDepartment: req };
    if (kind === 'major')   return { ...base, nameBranch: req, departmentId: req };
    if (kind === 'class')   return { ...base, nameClass: req, branchId: req, teacherId: req };
    if (kind === 'subject') return { ...base, name: req, branchId: req,
      credits: (v) => (!v || isNaN(+v) || +v < 1 || +v > 10) ? (lang === 'vi' ? 'Số TC từ 1–10' : 'Credits 1–10') : null };
    return base;
  }, [kind, t, lang]);

  const { form, set, setForm, touch, showError, submit, reset } = useForm(getInitial(), validators);
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSaving(false);
    if (row) {
      if (kind === 'faculty') setForm({ code: row.code || '', nameDepartment: row.nameDepartment || '' });
      if (kind === 'major')   setForm({ code: row.code || '', nameBranch: row.nameBranch || '', departmentId: row.departmentId || '' });
      if (kind === 'class')   setForm({ code: row.code || '', nameClass: row.nameClass || '', branchId: row.branchId || '', teacherId: row.teacherId || '' });
      if (kind === 'subject') setForm({ code: row.code || '', name: row.name || '', credits: String(row.credits ?? 3), branchId: row.branchId || '' });
    } else {
      reset(getInitial());
    }
  }, [open, row, kind]);

  const kindLabel = { faculty: lang === 'vi' ? 'Khoa' : 'Faculty', major: lang === 'vi' ? 'Ngành' : 'Major', class: lang === 'vi' ? 'Lớp' : 'Class', subject: lang === 'vi' ? 'Môn học' : 'Subject' }[kind];

  const handleSave = () => {
    const ok = submit(async (data) => {
      setSaving(true);
      try { await onSave(data); } finally { setSaving(false); }
    });
    if (!ok) toast(t('errFixForm'), 'danger');
  };

  return (
    <Drawer open={open} onClose={onClose} width={440}
      title={isEdit ? `${lang === 'vi' ? 'Sửa' : 'Edit'} ${kindLabel}` : `${lang === 'vi' ? 'Thêm' : 'Add'} ${kindLabel}`}
      subtitle={isEdit ? (row?.code || '') : ''}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose} disabled={saving}>{t('cancel')}</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving
            ? <><BtnSpinner/>{lang === 'vi' ? 'Đang lưu…' : 'Saving…'}</>
            : (isEdit ? t('save') : t('add'))}
        </button>
      </>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('code')} error={showError('code')}>
          <input className={fieldCls(showError('code'))} value={form.code || ''} onChange={e => set('code', e.target.value.toUpperCase())} onBlur={() => touch('code')} placeholder={kind === 'faculty' ? 'CNTT' : kind === 'major' ? 'KTPM' : kind === 'class' ? 'KTPM2024A' : 'CS101'} disabled={isEdit} style={isEdit ? { opacity: .6 } : {}}/>
        </FormField>

        {kind === 'faculty' && (
          <FormField label={lang === 'vi' ? 'Tên khoa' : 'Faculty name'} error={showError('nameDepartment')}>
            <input className={fieldCls(showError('nameDepartment'))} value={form.nameDepartment || ''} onChange={e => set('nameDepartment', e.target.value)} onBlur={() => touch('nameDepartment')} placeholder={lang === 'vi' ? 'Công nghệ Thông tin' : 'Information Technology'}/>
          </FormField>
        )}

        {kind === 'major' && (<>
          <FormField label={lang === 'vi' ? 'Tên ngành' : 'Major name'} error={showError('nameBranch')}>
            <input className={fieldCls(showError('nameBranch'))} value={form.nameBranch || ''} onChange={e => set('nameBranch', e.target.value)} onBlur={() => touch('nameBranch')} placeholder={lang === 'vi' ? 'Kỹ thuật phần mềm' : 'Software Engineering'}/>
          </FormField>
          <FormField label={t('faculty')} error={showError('departmentId')}>
            <select className={fieldCls(showError('departmentId'))} value={form.departmentId || ''} onChange={e => set('departmentId', e.target.value)} onBlur={() => touch('departmentId')}>
              <option value="">— {lang === 'vi' ? 'Chọn khoa' : 'Select faculty'}</option>
              {depts.map(d => <option key={d.id} value={d.id}>{d.nameDepartment}</option>)}
            </select>
          </FormField>
        </>)}

        {kind === 'class' && (<>
          <FormField label={lang === 'vi' ? 'Tên lớp' : 'Class name'} error={showError('nameClass')}>
            <input className={fieldCls(showError('nameClass'))} value={form.nameClass || ''} onChange={e => set('nameClass', e.target.value)} onBlur={() => touch('nameClass')} placeholder={lang === 'vi' ? 'Kỹ thuật phần mềm 2024A' : 'Software Engineering 2024A'}/>
          </FormField>
          <FormField label={t('major')} error={showError('branchId')}>
            <select className={fieldCls(showError('branchId'))} value={form.branchId || ''} onChange={e => set('branchId', e.target.value)} onBlur={() => touch('branchId')}>
              <option value="">— {lang === 'vi' ? 'Chọn ngành' : 'Select major'}</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.nameBranch}</option>)}
            </select>
          </FormField>
          <FormField label={lang === 'vi' ? 'CVHT (Cố vấn học tập)' : 'Academic advisor'} error={showError('teacherId')}>
            <select className={fieldCls(showError('teacherId'))} value={form.teacherId || ''} onChange={e => set('teacherId', e.target.value)} onBlur={() => touch('teacherId')}>
              <option value="">— {lang === 'vi' ? 'Chọn giảng viên' : 'Select teacher'}</option>
              {teachers.map(tc => <option key={tc.id} value={tc.id}>{tc.fullName} ({tc.idTeacher})</option>)}
            </select>
          </FormField>
        </>)}

        {kind === 'subject' && (<>
          <FormField label={lang === 'vi' ? 'Tên môn học' : 'Subject name'} error={showError('name')}>
            <input className={fieldCls(showError('name'))} value={form.name || ''} onChange={e => set('name', e.target.value)} onBlur={() => touch('name')} placeholder={lang === 'vi' ? 'Lập trình Cơ bản' : 'Introduction to Programming'}/>
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label={t('credits')} error={showError('credits')}>
              <input className={fieldCls(showError('credits'))} value={form.credits || ''} onChange={e => set('credits', e.target.value.replace(/\D/g, ''))} onBlur={() => touch('credits')} placeholder="3" inputMode="numeric"/>
            </FormField>
            <FormField label={t('major')} error={showError('branchId')}>
              <select className={fieldCls(showError('branchId'))} value={form.branchId || ''} onChange={e => set('branchId', e.target.value)} onBlur={() => touch('branchId')}>
                <option value="">— {lang === 'vi' ? 'Chọn ngành' : 'Select'}</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.nameBranch}</option>)}
              </select>
            </FormField>
          </div>
        </>)}
      </div>
    </Drawer>
  );
}

// ── Catalog screen — Faculty / Major / Class / Subject ────────────────────────
export default function CatalogScreen({ kind }) {
  const { t, lang } = useApp();
  const toast = useToast();
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [q,          setQ]          = useState('');
  const [depts,      setDepts]      = useState([]);
  const [branches,   setBranches]   = useState([]);
  const [teachers,   setTeachers]   = useState([]);
  const [drawer,     setDrawer]     = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [deleting,   setDeleting]   = useState(false);

  const needsDepts    = kind === 'major';
  const needsBranches = ['class', 'subject'].includes(kind);
  const needsTeachers = kind === 'class';

  const conf = {
    faculty: {
      title:  t('faculties'),
      fetch:  requestDepartments,
      create: (d) => requestCreateDepartment({ code: d.code, nameDepartment: d.nameDepartment }),
      update: (id, d) => requestUpdateDepartment(id, { nameDepartment: d.nameDepartment }),
      del:    (r) => requestDeleteDepartment(r.id),
      cols: [
        { header: t('code'), cell: r => <span className="badge badge-muted" style={{ fontFamily: 'var(--mono)' }}>{r.code}</span> },
        { header: lang === 'vi' ? 'Tên Khoa' : 'Faculty Name', cell: r => <b>{r.nameDepartment}</b> },
        { header: lang === 'vi' ? 'Ngành' : 'Majors',   align: 'center', cell: r => <span style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>{r._count?.branches ?? 0}</span> },
      ],
      search: (r) => (r.nameDepartment || '') + ' ' + (r.code || ''),
      add:    lang === 'vi' ? 'Thêm khoa' : 'Add faculty',
    },
    major: {
      title:  t('majors'),
      fetch:  requestBranches,
      create: (d) => requestCreateBranch({ code: d.code, nameBranch: d.nameBranch, departmentId: d.departmentId }),
      update: (id, d) => requestUpdateBranch(id, { nameBranch: d.nameBranch, departmentId: d.departmentId }),
      del:    (r) => requestDeleteBranch(r.id),
      cols: [
        { header: t('code'),    cell: r => <span className="badge badge-muted" style={{ fontFamily: 'var(--mono)' }}>{r.code}</span> },
        { header: lang === 'vi' ? 'Tên Ngành' : 'Major Name',    cell: r => <b>{r.nameBranch}</b> },
        { header: t('faculty'), cell: r => <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{r.department?.nameDepartment || '—'}</span> },
      ],
      search: (r) => (r.nameBranch || '') + ' ' + (r.code || ''),
      add:    lang === 'vi' ? 'Thêm ngành' : 'Add major',
    },
    class: {
      title:  t('classes'),
      fetch:  requestClasses,
      create: (d) => requestCreateClass({ code: d.code, nameClass: d.nameClass, branchId: d.branchId, teacherId: d.teacherId }),
      update: (id, d) => requestUpdateClass(id, { nameClass: d.nameClass, branchId: d.branchId, teacherId: d.teacherId }),
      del:    (r) => requestDeleteClass(r.id),
      cols: [
        { header: t('code'),    cell: r => <span className="badge badge-muted" style={{ fontFamily: 'var(--mono)' }}>{r.code}</span> },
        { header: lang === 'vi' ? 'Tên Lớp' : 'Class Name',    cell: r => <b>{r.nameClass}</b> },
        { header: t('major'), cell: r => <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{r.branch?.nameBranch || '—'}</span> },
        { header: lang === 'vi' ? 'CVHT' : 'Advisor', cell: r => <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{r.teacher?.fullName || '—'}</span> },
      ],
      search: (r) => (r.nameClass || '') + ' ' + (r.code || ''),
      add:    lang === 'vi' ? 'Thêm lớp' : 'Add class',
    },
    subject: {
      title:  t('subjects'),
      fetch:  requestSubjects,
      create: (d) => requestCreateSubject({ code: d.code, name: d.name, credits: +d.credits, branchId: d.branchId }),
      update: (id, d) => requestUpdateSubject(id, { name: d.name, credits: +d.credits, branchId: d.branchId }),
      del:    (r) => requestDeleteSubject(r.id),
      cols: [
        { header: t('code'),    cell: r => <span className="badge badge-muted" style={{ fontFamily: 'var(--mono)' }}>{r.code}</span> },
        { header: lang === 'vi' ? 'Tên Môn Học' : 'Subject Name',    cell: r => <b>{r.name}</b> },
        { header: t('major'), cell: r => <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{r.branch?.nameBranch || '—'}</span> },
        { header: t('credits'), align: 'center', cell: r => <span style={{ fontWeight: 700, fontFamily: 'var(--mono)' }}>{r.credits}</span> },
      ],
      search: (r) => (r.name || '') + ' ' + (r.code || ''),
      add:    lang === 'vi' ? 'Thêm môn học' : 'Add subject',
    },
  }[kind];

  const loadData = () => {
    setLoading(true);
    const promises = [conf.fetch().then(res => setRows(res.metadata ?? []))];
    if (needsDepts)    promises.push(requestDepartments().then(r => setDepts(r.metadata ?? [])));
    if (needsBranches) promises.push(requestBranches().then(r => setBranches(r.metadata ?? [])));
    if (needsTeachers) promises.push(requestTeachers().then(r => setTeachers(r.metadata ?? [])));
    Promise.all(promises)
      .catch(() => toast(lang === 'vi' ? 'Lỗi tải dữ liệu' : 'Failed to load data', 'danger'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setRows([]); setQ(''); setDrawer(null); loadData(); }, [kind]);

  const filtered = rows.filter(r => !q || conf.search(r).toLowerCase().includes(q.toLowerCase()));

  return (
    <Page>
      <SectionHead title={conf.title}
        desc={lang === 'vi' ? `${rows.length} bản ghi` : `${rows.length} records`}/>

      <DataTable columns={conf.cols} rows={filtered} perPage={10}
        renderActions={r => <RowAction
          onEdit={() => setDrawer({ row: r })}
          onDelete={() => setConfirmDel(r)}/>}
        toolbar={<TableToolbar q={q} setQ={setQ}
          onAdd={() => setDrawer({ row: null })}
          addLabel={conf.add}/>}/>

      <CatalogFormDrawer
        open={!!drawer}
        onClose={() => setDrawer(null)}
        kind={kind}
        row={drawer?.row ?? null}
        depts={depts}
        branches={branches}
        teachers={teachers}
        lang={lang}
        t={t}
        onSave={async (data) => {
          try {
            if (drawer.row) {
              await conf.update(drawer.row.id, data);
              toast(lang === 'vi' ? 'Đã cập nhật' : 'Updated');
            } else {
              await conf.create(data);
              toast(lang === 'vi' ? 'Đã tạo mới' : 'Created');
            }
            loadData();
          } catch (err) {
            toast(err?.response?.data?.message || (lang === 'vi' ? 'Lỗi lưu dữ liệu' : 'Save failed'), 'danger');
          }
          setDrawer(null);
        }}/>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} tone="danger" icon={<I.trash size={22}/>}
        title={lang === 'vi' ? 'Xác nhận xóa?' : 'Confirm delete?'}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setConfirmDel(null)} disabled={deleting}>{t('cancel')}</button>
          <button className="btn btn-danger" disabled={deleting} onClick={async () => {
            setDeleting(true);
            try {
              await conf.del(confirmDel);
              setRows(xs => xs.filter(x => x.id !== confirmDel.id));
              toast(lang === 'vi' ? 'Đã xóa' : 'Deleted', 'danger');
            } catch (err) {
              toast(err?.response?.data?.message || (lang === 'vi' ? 'Xóa thất bại' : 'Delete failed'), 'danger');
            }
            setDeleting(false);
            setConfirmDel(null);
          }}>{deleting ? <><BtnSpinner/>{lang === 'vi' ? 'Đang xóa…' : 'Deleting…'}</> : t('del')}</button>
        </>}>
        {lang === 'vi' ? 'Hành động này không thể hoàn tác.' : 'This action cannot be undone.'}
      </Modal>
    </Page>
  );
}
