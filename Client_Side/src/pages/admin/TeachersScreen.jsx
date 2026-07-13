import React, { useState, useEffect, useMemo } from 'react';
import { I } from '../../components/icons';
import { Avatar, BtnSpinner, Drawer, FormField, Modal, StatusBadge, fieldCls, useForm, useToast, validate } from '../../components/ui';
import { DataTable, Page, SectionHead } from '../../components/shell';
import { TableToolbar, FilterSelect, RowAction } from '../../components/table';
import { TeacherBulkImportDrawer } from '../../components/TeacherBulkImportDrawer';
import { useApp } from '../../context/AppContext';
import { exportTeachersExcel } from '../../utils/excel';
import {
  requestTeachers, requestCreateTeacher, requestNextTeacherId, requestUpdateUser,
  requestToggleUserStatus, requestDeleteUser, requestBulkImportTeachers,
  requestDepartments,
} from '../../config/userRequest';

/* EduManage — Admin: Quản lý giảng viên */

// ── Adapter ───────────────────────────────────────────────────────────────────
const toTeacher = (tc) => ({
  id:        tc.id,
  name:      tc.fullName,
  code:      tc.idTeacher,
  email:     tc.email,
  degree:    tc.degree || '',
  deptName:  tc.department || '',
  sections:  tc._count?.taughtSections ?? 0,
  active:    ['active', 'teaching'].includes(tc.status),
  avatarHue: 160,
  phone:     tc.phone || '',
  gender:    tc.gender || 'male',
  birthDay:  tc.birthDay ? tc.birthDay.split('T')[0] : '',
  personalEmail: tc.personalEmail || '',
  status:    tc.status,
});

// ── Drawer giảng viên (thêm / sửa) ────────────────────────────────────────────
const DEGREES = ['ThS', 'TS', 'PGS', 'GS', 'CN'];

// Drawer thêm / sửa giảng viên
function TeacherDrawer({ state, depts, onClose, onSave }) {
  const { t, lang } = useApp();
  const open   = !!state;
  const row    = state?.row;
  const isEdit = state?.mode === 'edit';

  const [previewId, setPreviewId] = useState('...');
  const [saving,    setSaving]    = useState(false);

  const validators = useMemo(() => ({
    name:          validate.fullName(t),
    personalEmail: validate.email(t, false),
  }), [t]);

  const { form, set, touch, showError, submit, reset } = useForm(
    { name: '', personalEmail: '', degree: 'ThS', phone: '', gender: 'male', birthDay: '', department: '' },
    validators,
  );
  const toast = useToast();

  useEffect(() => {
    if (!state) return;
    setSaving(false);
    if (!row) {
      setPreviewId('...');
      requestNextTeacherId()
        .then(r => setPreviewId(r.metadata?.nextId || '—'))
        .catch(() => setPreviewId('—'));
      reset({ name: '', personalEmail: '', degree: 'ThS', phone: '', gender: 'male', birthDay: '', department: '' });
    } else {
      setPreviewId(row.code || '—');
      reset({
        name: row.name, personalEmail: row.personalEmail, degree: row.degree || 'ThS',
        phone: row.phone, gender: row.gender || 'male',
        birthDay: row.birthDay || '', department: row.deptName || '',
      });
    }
  }, [state]);

  const handleSave = () => {
    const ok = submit(async (data) => {
      setSaving(true);
      try { await onSave(data); } finally { setSaving(false); }
    });
    if (!ok) toast(t('errFixForm'), 'danger');
  };

  return (
    <Drawer open={open} onClose={onClose}
      title={isEdit ? (lang === 'vi' ? 'Sửa giảng viên' : 'Edit teacher') : (lang === 'vi' ? 'Thêm giảng viên' : 'Add teacher')}
      subtitle={isEdit ? row?.code : (lang === 'vi' ? 'Mã giảng viên & email trường tự động sinh' : 'Teacher code & school email auto-generated')}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose} disabled={saving}>{t('cancel')}</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving
            ? <><BtnSpinner/>{isEdit ? (lang === 'vi' ? 'Đang lưu…' : 'Saving…') : (lang === 'vi' ? 'Đang tạo tài khoản…' : 'Provisioning…')}</>
            : (isEdit ? t('save') : (lang === 'vi' ? 'Tạo & cấp tài khoản' : 'Create & provision'))}
        </button>
      </>}>
      {isEdit && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 14, background: 'var(--surface-3)', borderRadius: 12, marginBottom: 20 }}>
          <Avatar name={form.name} hue={160} size={48}/>
          <div><div style={{ fontWeight: 700 }}>{form.name}</div><div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{row?.email}</div></div>
          <div style={{ marginLeft: 'auto' }}><StatusBadge active={row?.active !== false}/></div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FormField label={t('name')} error={showError('name')}>
          <input className={fieldCls(showError('name'))} value={form.name} onChange={e => set('name', e.target.value)} onBlur={() => touch('name')} placeholder="Nguyễn Văn A"/>
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label={lang === 'vi' ? 'Mã giảng viên' : 'Teacher code'} hint={lang === 'vi' ? 'Tự động sinh' : 'Auto-generated'}>
            <input className="input" value={previewId} disabled style={{ opacity: .7, fontFamily: 'var(--mono)', cursor: 'not-allowed' }}/>
          </FormField>
          <FormField label={t('degree')} optional optionalLabel={t('optional') || 'tùy chọn'}>
            <select className="select" value={form.degree} onChange={e => set('degree', e.target.value)}>
              <option value="">—</option>
              {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label={t('gender')}>
            <select className="select" value={form.gender} onChange={e => set('gender', e.target.value)}>
              <option value="male">{t('male')}</option>
              <option value="female">{t('female')}</option>
            </select>
          </FormField>
          <FormField label={t('phone') || 'Điện thoại'} optional optionalLabel={t('optional') || 'tùy chọn'}>
            <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0912345678" inputMode="tel"/>
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label={t('faculty') || 'Khoa'} optional optionalLabel={t('optional') || 'tùy chọn'}>
            <select className="select" value={form.department} onChange={e => set('department', e.target.value)}>
              <option value="">— {lang === 'vi' ? 'Chọn khoa' : 'Select faculty'}</option>
              {depts.map(d => <option key={d.id} value={d.nameDepartment}>{d.nameDepartment}</option>)}
            </select>
          </FormField>
          <FormField label={t('dob') || 'Ngày sinh'} optional optionalLabel={t('optional') || 'tùy chọn'}>
            <input className="input" type="date" value={form.birthDay} onChange={e => set('birthDay', e.target.value)}/>
          </FormField>
        </div>

        {isEdit && (
          <FormField label={t('email')} hint={lang === 'vi' ? 'Email trường (không đổi)' : 'School email (read-only)'}>
            <input className="input" value={row?.email || ''} disabled style={{ opacity: .7 }}/>
          </FormField>
        )}
        <FormField label={lang === 'vi' ? 'Email cá nhân (nhận OTP)' : 'Personal email (receives OTP)'} error={showError('personalEmail')}>
          <input className={fieldCls(showError('personalEmail'))} value={form.personalEmail} onChange={e => set('personalEmail', e.target.value)} onBlur={() => touch('personalEmail')} placeholder="teacher@gmail.com" inputMode="email"/>
        </FormField>

        {!isEdit && (
          <div style={{ display: 'flex', gap: 11, padding: 13, background: 'var(--info-soft)', borderRadius: 11, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
            <I.spark size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}/>
            {lang === 'vi'
              ? `Mã GV, email trường và mật khẩu tạm sẽ được tạo tự động và gửi tới email cá nhân.`
              : `Teacher code, school email and temporary password are auto-generated and emailed.`}
          </div>
        )}
      </div>
    </Drawer>
  );
}

// ── Màn hình giảng viên ────────────────────────────────────────────────────────
export default function TeachersScreen() {
  const { t, lang } = useApp();
  const toast = useToast();
  const [teachers,    setTeachers]    = useState([]);
  const [depts,       setDepts]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [q,           setQ]           = useState('');
  const [deptFilter,  setDeptFilter]  = useState('');
  const [drawer,      setDrawer]      = useState(null);
  const [importOpen,  setImportOpen]  = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(null);
  const [deleting,    setDeleting]    = useState(false);

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
    if (q && !(tc.name.toLowerCase().includes(q.toLowerCase()) || (tc.code || '').toLowerCase().includes(q.toLowerCase()) || tc.email.toLowerCase().includes(q.toLowerCase()))) return false;
    if (deptFilter && tc.deptName !== deptFilter) return false;
    return true;
  });

  const columns = [
    { header: t('teachers'), nowrap: true, cell: tc => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <Avatar name={tc.name} hue={tc.avatarHue} size={38}/>
        <div>
          <div style={{ fontWeight: 600 }}>{tc.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{tc.code}</div>
        </div>
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
        desc={lang === 'vi' ? `Quản lý ${teachers.length} giảng viên` : `Manage ${teachers.length} teachers`}
        right={<div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-sm" style={{ height: 40 }} onClick={() => setImportOpen(true)}><I.upload size={16}/>{t('import')}</button>
          <button className="btn btn-outline btn-sm" style={{ height: 40 }} onClick={async () => {
            try {
              await exportTeachersExcel(filtered, lang);
              toast(`${t('exported')} · ${filtered.length} ${lang === 'vi' ? 'dòng' : 'rows'}`);
            } catch {
              toast(lang === 'vi' ? 'Xuất file thất bại' : 'Export failed', 'danger');
            }
          }}><I.download size={16}/>{t('export')}</button>
        </div>}/>

      <DataTable columns={columns} rows={filtered} perPage={8}
        renderActions={tc => <RowAction
          onEdit={() => setDrawer({ mode: 'edit', row: tc })}
          active={tc.active}
          onToggle={() => toggleActive(tc)}
          onDelete={() => setConfirmDel(tc)}/>}
        toolbar={<TableToolbar q={q} setQ={setQ}
          onAdd={() => setDrawer({ mode: 'add', row: null })}
          addLabel={lang === 'vi' ? 'Thêm giảng viên' : 'Add teacher'}
          filters={<FilterSelect value={deptFilter} onChange={setDeptFilter}
            allLabel={lang === 'vi' ? 'Mọi khoa' : 'All faculties'}
            options={depts.map(d => ({ value: d.nameDepartment, label: d.nameDepartment }))}/>}/>}/>

      <TeacherDrawer
        state={drawer}
        depts={depts}
        onClose={() => setDrawer(null)}
        onSave={async (data) => {
          try {
            if (drawer.mode === 'add') {
              await requestCreateTeacher({
                fullName: data.name,
                personalEmail: data.personalEmail, degree: data.degree || undefined,
                phone: data.phone || undefined, gender: data.gender,
                birthDay: data.birthDay || undefined, department: data.department || undefined,
              });
              toast(lang === 'vi' ? 'Đã tạo GV & gửi tài khoản về email cá nhân' : 'Teacher created · credentials emailed');
            } else {
              await requestUpdateUser(drawer.row.id, {
                fullName: data.name, degree: data.degree || undefined,
                phone: data.phone || undefined, gender: data.gender,
                birthDay: data.birthDay || undefined, department: data.department || undefined,
                personalEmail: data.personalEmail,
              });
              toast(lang === 'vi' ? 'Đã lưu thay đổi' : 'Changes saved');
            }
            loadData();
          } catch (err) {
            toast(err?.response?.data?.message || (lang === 'vi' ? 'Lỗi lưu dữ liệu' : 'Save failed'), 'danger');
          }
          setDrawer(null);
        }}/>

      <TeacherBulkImportDrawer
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onProvision={async (rows) => {
          try {
            const res = await requestBulkImportTeachers({
              rows: rows.map(r => ({
                fullName: r.name,
                personalEmail: r.personalEmail, degree: r.degree || undefined,
                phone: r.phone || undefined, department: r.department || undefined,
              })),
            });
            const meta = res.metadata;
            toast(lang === 'vi'
              ? `Đã tạo ${meta.created} giảng viên`
              : `Created ${meta.created} teachers`,
              'success');
            loadData();
          } catch (err) {
            const data = err?.response?.data;
            const errs = data?.errors;
            if (errs?.length) {
              const detail = errs.slice(0, 3).map(e => `Dòng ${e.row}: ${e.reason}`).join(' · ');
              toast(`${data.message} · ${detail}`, 'danger');
            } else {
              toast(data?.message || (lang === 'vi' ? 'Nhập hàng loạt thất bại' : 'Bulk import failed'), 'danger');
            }
          }
          setImportOpen(false);
        }}/>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} tone="danger" icon={<I.trash size={22}/>}
        title={lang === 'vi' ? 'Xóa giảng viên?' : 'Delete teacher?'}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setConfirmDel(null)} disabled={deleting}>{t('cancel')}</button>
          <button className="btn btn-danger" disabled={deleting} onClick={async () => {
            setDeleting(true);
            try {
              await requestDeleteUser(confirmDel.id);
              setTeachers(xs => xs.filter(x => x.id !== confirmDel.id));
              toast(lang === 'vi' ? 'Đã xóa' : 'Deleted', 'danger');
            } catch (err) {
              toast(err?.response?.data?.message || (lang === 'vi' ? 'Xóa thất bại' : 'Delete failed'), 'danger');
            }
            setDeleting(false);
            setConfirmDel(null);
          }}>{deleting ? <><BtnSpinner/>{lang === 'vi' ? 'Đang xóa…' : 'Deleting…'}</> : t('del')}</button>
        </>}>
        {lang === 'vi'
          ? <>Xóa giảng viên <b>{confirmDel?.name}</b> ({confirmDel?.code})? Hành động không thể hoàn tác.</>
          : <>Delete teacher <b>{confirmDel?.name}</b> ({confirmDel?.code})? This cannot be undone.</>}
      </Modal>
    </Page>
  );
}
