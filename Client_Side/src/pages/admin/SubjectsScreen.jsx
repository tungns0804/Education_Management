import React, { useState, useEffect, useMemo } from 'react';
import { I } from '../../components/icons';
import { BtnSpinner, Drawer, FormField, Modal, fieldCls, useForm, useToast, validate } from '../../components/ui';
import { DataTable, Page, SectionHead } from '../../components/shell';
import { TableToolbar, FilterSelect, RowAction } from '../../components/table';
import { useApp } from '../../context/AppContext';
import { downloadCSV } from '../../utils/csv';
import {
  requestBranches,
  requestSubjects, requestCreateSubject, requestUpdateSubject, requestDeleteSubject,
} from '../../config/userRequest';

/* EduManage — Admin: Quản lý môn học */

// ── Subject Drawer (add / edit môn học) ───────────────────────────────────────
function SubjectDrawer({ open, row, branches, onClose, onSave }) {
  const { t, lang } = useApp();
  const isEdit = !!row;
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const validators = useMemo(() => ({
    code:         validate.required(t),
    name:         validate.required(t),
    credits:      (v) => (!v || isNaN(+v) || +v < 1 || +v > 10) ? (lang === 'vi' ? 'Số TC từ 1–10' : 'Credits 1–10') : null,
    branchId: validate.required(t),
  }), [t, lang]);

  const { form, set, touch, showError, submit, reset, setForm } = useForm(
    { code: '', name: '', credits: '3', branchId: '' },
    validators,
  );

  useEffect(() => {
    if (!open) return;
    setSaving(false);
    if (row) {
      setForm({ code: row.code || '', name: row.name || '', credits: String(row.credits ?? 3), branchId: row.branchId || '' });
    } else {
      reset({ code: '', name: '', credits: '3', branchId: '' });
    }
  }, [open, row]);

  return (
    <Drawer open={open} onClose={onClose} width={440}
      title={isEdit ? (lang === 'vi' ? 'Sửa môn học' : 'Edit subject') : (lang === 'vi' ? 'Thêm môn học' : 'Add subject')}
      subtitle={isEdit ? row?.code : ''}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose} disabled={saving}>{t('cancel')}</button>
        <button className="btn btn-primary" disabled={saving} onClick={() => {
          const ok = submit(async (data) => {
            setSaving(true);
            try { await onSave(data); } finally { setSaving(false); }
          });
          if (!ok) toast(t('errFixForm'), 'danger');
        }}>
          {saving
            ? <><BtnSpinner/>{lang === 'vi' ? 'Đang lưu…' : 'Saving…'}</>
            : (isEdit ? t('save') : t('add'))}
        </button>
      </>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={t('code')} error={showError('code')}>
          <input className={fieldCls(showError('code'))} value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} onBlur={() => touch('code')} placeholder="CS101" disabled={isEdit} style={isEdit ? { opacity: .6 } : {}}/>
        </FormField>
        <FormField label={lang === 'vi' ? 'Tên môn học' : 'Subject name'} error={showError('name')}>
          <input className={fieldCls(showError('name'))} value={form.name} onChange={e => set('name', e.target.value)} onBlur={() => touch('name')} placeholder={lang === 'vi' ? 'Lập trình Cơ bản' : 'Introduction to Programming'}/>
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label={t('credits')} error={showError('credits')}>
            <input className={fieldCls(showError('credits'))} value={form.credits} onChange={e => set('credits', e.target.value.replace(/\D/g, ''))} onBlur={() => touch('credits')} placeholder="3" inputMode="numeric"/>
          </FormField>
          <FormField label={t('major')} error={showError('branchId')}>
            <select className={fieldCls(showError('branchId'))} value={form.branchId} onChange={e => set('branchId', e.target.value)} onBlur={() => touch('branchId')}>
              <option value="">— {lang === 'vi' ? 'Chọn ngành' : 'Select'}</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.nameBranch}</option>)}
            </select>
          </FormField>
        </div>
      </div>
    </Drawer>
  );
}

// ── Subjects screen ────────────────────────────────────────────────────────────
export default function SubjectsScreen() {
  const { t, lang } = useApp();
  const toast = useToast();
  const [subjects,   setSubjects]   = useState([]);
  const [branches,   setBranches]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [q,          setQ]          = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [drawer,     setDrawer]     = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [deleting,   setDeleting]   = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([requestSubjects(), requestBranches()])
      .then(([sRes, bRes]) => {
        setSubjects(sRes.metadata ?? []);
        setBranches(bRes.metadata ?? []);
      })
      .catch(() => toast(lang === 'vi' ? 'Lỗi tải dữ liệu' : 'Failed to load data', 'danger'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const filtered = subjects.filter(s => {
    if (q && !(s.name?.toLowerCase().includes(q.toLowerCase()) || s.code?.toLowerCase().includes(q.toLowerCase()))) return false;
    if (branchFilter && s.branchId !== branchFilter) return false;
    return true;
  });

  const columns = [
    { header: t('code'), cell: s => <span className="badge badge-muted" style={{ fontFamily: 'var(--mono)' }}>{s.code}</span> },
    { header: lang === 'vi' ? 'Tên Môn Học' : 'Subject Name', cell: s => <b>{s.name}</b> },
    { header: t('major'), cell: s => <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{s.branch?.nameBranch || '—'}</span> },
    { header: t('credits'), align: 'center', cell: s => <span style={{ fontWeight: 700, fontFamily: 'var(--mono)' }}>{s.credits}</span> },
    { header: lang === 'vi' ? 'Lớp HP' : 'Sections', align: 'center', cell: s => <span style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>{s._count?.subjectClasses ?? 0}</span> },
  ];

  return (
    <Page>
      <SectionHead title={t('subjects')}
        desc={lang === 'vi' ? `Quản lý ${subjects.length} môn học` : `Manage ${subjects.length} subjects`}
        right={<button className="btn btn-outline btn-sm" style={{ height: 40 }} onClick={() => {
          downloadCSV('mon-hoc.csv',
            [t('code'), lang === 'vi' ? 'Tên Môn Học' : 'Subject Name', t('major'), t('credits'), lang === 'vi' ? 'Lớp HP' : 'Sections'],
            filtered.map(s => [s.code, s.name, s.branch?.nameBranch || '', s.credits, s._count?.subjectClasses ?? 0]));
          toast(`${t('exported')} · ${filtered.length} ${lang === 'vi' ? 'dòng' : 'rows'}`);
        }}><I.download size={16}/>{t('export')}</button>}/>

      <DataTable columns={columns} rows={filtered} perPage={10}
        renderActions={s => <RowAction
          onEdit={() => setDrawer({ row: s })}
          onDelete={() => setConfirmDel(s)}/>}
        toolbar={<TableToolbar q={q} setQ={setQ}
          onAdd={() => setDrawer({ row: null })}
          addLabel={lang === 'vi' ? 'Thêm môn học' : 'Add subject'}
          filters={<FilterSelect value={branchFilter} onChange={setBranchFilter}
            allLabel={lang === 'vi' ? 'Mọi ngành' : 'All majors'}
            options={branches.map(b => ({ value: b.id, label: b.nameBranch }))}/>}/>}/>

      <SubjectDrawer
        open={!!drawer}
        row={drawer?.row ?? null}
        branches={branches}
        onClose={() => setDrawer(null)}
        onSave={async (data) => {
          try {
            if (drawer.row) {
              await requestUpdateSubject(drawer.row.id, { name: data.name, credits: +data.credits, branchId: data.branchId });
              toast(lang === 'vi' ? 'Đã cập nhật' : 'Updated');
            } else {
              await requestCreateSubject({ code: data.code, name: data.name, credits: +data.credits, branchId: data.branchId });
              toast(lang === 'vi' ? 'Đã tạo môn học' : 'Subject created');
            }
            loadData();
          } catch (err) {
            toast(err?.response?.data?.message || (lang === 'vi' ? 'Lỗi lưu dữ liệu' : 'Save failed'), 'danger');
          }
          setDrawer(null);
        }}/>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} tone="danger" icon={<I.trash size={22}/>}
        title={lang === 'vi' ? 'Xóa môn học?' : 'Delete subject?'}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setConfirmDel(null)} disabled={deleting}>{t('cancel')}</button>
          <button className="btn btn-danger" disabled={deleting} onClick={async () => {
            setDeleting(true);
            try {
              await requestDeleteSubject(confirmDel.id);
              setSubjects(xs => xs.filter(x => x.id !== confirmDel.id));
              toast(lang === 'vi' ? 'Đã xóa' : 'Deleted', 'danger');
            } catch (err) {
              toast(err?.response?.data?.message || (lang === 'vi' ? 'Xóa thất bại' : 'Delete failed'), 'danger');
            }
            setDeleting(false);
            setConfirmDel(null);
          }}>{deleting ? <><BtnSpinner/>{lang === 'vi' ? 'Đang xóa…' : 'Deleting…'}</> : t('del')}</button>
        </>}>
        {lang === 'vi'
          ? <>Xóa môn học <b>{confirmDel?.name}</b> ({confirmDel?.code})? Hành động không thể hoàn tác.</>
          : <>Delete subject <b>{confirmDel?.name}</b> ({confirmDel?.code})? This cannot be undone.</>}
      </Modal>
    </Page>
  );
}
