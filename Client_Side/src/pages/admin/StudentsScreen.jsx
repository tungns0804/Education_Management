import React, { useState, useEffect } from 'react';
import { I } from '../../components/icons';
import { Avatar, BtnSpinner, Modal, StatusBadge, useToast } from '../../components/ui';
import { DataTable, Page, SectionHead } from '../../components/shell';
import { TableToolbar, FilterSelect, RowAction } from '../../components/table';
import { BulkImportDrawer } from '../../components/BulkImportDrawer';
import { useApp } from '../../context/AppContext';
import { downloadCSV } from '../../utils/csv';
import StudentDrawer from './StudentDrawer';
import {
  requestStudents, requestCreateStudent, requestBulkImport,
  requestClasses,
  requestUpdateUser, requestToggleUserStatus, requestDeleteUser,
} from '../../config/userRequest';

/* EduManage — Admin: Quản lý sinh viên */

// ── Adapter: chuẩn hóa sinh viên từ API → cấu trúc dùng cho UI ─────────────
const toStudent = (s) => ({
  id:            s.id,
  name:          s.fullName,
  code:          s.idStudent,
  email:         s.email,
  classId:       s.class || '',           // mã lớp, dùng làm khóa lọc
  gender:        s.gender === 'male' ? 'M' : 'F',
  dob:           s.birthDay ? s.birthDay.split('T')[0] : '',
  active:        ['active', 'studying'].includes(s.status),
  avatarHue:     280,
  personalEmail: s.personalEmail || '',
  department:    s.department || '',
  status:        s.status,
});

// Màn hình quản lý sinh viên: danh sách, tìm kiếm, lọc, thêm/sửa/xóa, import/export
export default function StudentsScreen({ onOpenProfile }) {
  const { t, lang } = useApp();
  const toast = useToast();
  const [students,     setStudents]     = useState([]);
  const [classes,      setClasses]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [q,            setQ]            = useState('');
  const [classFilter,  setClassFilter]  = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [drawer,       setDrawer]       = useState(null);
  const [confirmDel,   setConfirmDel]   = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [importOpen,   setImportOpen]   = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([requestStudents(), requestClasses()])
      .then(([sRes, cRes]) => {
        setStudents((sRes.metadata ?? []).map(toStudent));
        setClasses(cRes.metadata ?? []);
      })
      .catch(() => toast(lang === 'vi' ? 'Lỗi tải dữ liệu' : 'Failed to load data', 'danger'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const filtered = students.filter(s => {
    if (q && !(s.name.toLowerCase().includes(q.toLowerCase()) || (s.code || '').includes(q) || s.email.includes(q.toLowerCase()))) return false;
    if (classFilter && s.classId !== classFilter) return false;
    if (statusFilter === 'active'  && !s.active) return false;
    if (statusFilter === 'locked'  &&  s.active) return false;
    return true;
  });

  const columns = [
    { header: t('students'), nowrap: true, cell: s => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <Avatar name={s.name} hue={s.avatarHue} size={38}/>
        <div>
          <div style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>{s.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{s.code}</div>
        </div>
      </div>
    ) },
    { header: t('email'),  nowrap: true, cell: s => <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{s.email}</span> },
    { header: t('class'),  cell: s => <span className="badge badge-muted">{s.classId || '—'}</span> },
    { header: t('gender'), cell: s => s.gender === 'M' ? t('male') : t('female') },
    { header: t('status'), cell: s => <StatusBadge active={s.active}/> },
  ];

  const toggleActive = (s) => {
    const newStatus = s.active ? 'inactive' : 'active';
    requestToggleUserStatus(s.id, newStatus)
      .then(() => {
        setStudents(xs => xs.map(x => x.id === s.id ? { ...x, active: !x.active } : x));
        toast(s.active ? (lang === 'vi' ? 'Đã khóa tài khoản' : 'Account locked') : (lang === 'vi' ? 'Đã mở khóa' : 'Account unlocked'), s.active ? 'warn' : 'success');
      })
      .catch(() => toast(lang === 'vi' ? 'Lỗi cập nhật trạng thái' : 'Status update failed', 'danger'));
  };

  const exportCSV = () => {
    downloadCSV('sinh-vien.csv',
      [t('name'), t('code'), t('gender'), t('dob'), t('class'), t('email'), t('status')],
      filtered.map(s => [s.name, s.code, s.gender === 'M' ? t('male') : t('female'), s.dob, s.classId, s.email, s.active ? t('active') : t('locked')]));
    toast(`${t('exported')} · ${filtered.length} ${lang === 'vi' ? 'dòng' : 'rows'}`);
  };

  return (
    <Page>
      <SectionHead title={t('students')}
        desc={lang === 'vi' ? `Quản lý ${students.length} hồ sơ sinh viên và tài khoản` : `Manage ${students.length} student profiles and accounts`}
        right={<div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-sm" style={{ height: 40 }} onClick={() => setImportOpen(true)}><I.upload size={16}/>{t('import')}</button>
          <button className="btn btn-outline btn-sm" style={{ height: 40 }} onClick={exportCSV}><I.download size={16}/>{t('export')}</button>
        </div>}/>

      <DataTable columns={columns} rows={filtered} perPage={8}
        renderActions={s => <RowAction onEdit={() => setDrawer({ mode: 'edit', row: s })} active={s.active} onToggle={() => toggleActive(s)} onDelete={() => setConfirmDel(s)}/>}
        onRowClick={s => onOpenProfile ? onOpenProfile(s.id) : setDrawer({ mode: 'edit', row: s })}
        toolbar={<TableToolbar q={q} setQ={setQ} onAdd={() => setDrawer({ mode: 'add', row: null })} addLabel={lang === 'vi' ? 'Thêm sinh viên' : 'Add student'}
          filters={<>
            <FilterSelect value={classFilter} onChange={setClassFilter} allLabel={lang === 'vi' ? 'Mọi lớp' : 'All classes'}
              options={classes.map(c => ({ value: c.code, label: c.nameClass }))}/>
            <FilterSelect value={statusFilter} onChange={setStatusFilter} allLabel={lang === 'vi' ? 'Mọi trạng thái' : 'All status'}
              options={[{ value: 'active', label: t('active') }, { value: 'locked', label: t('locked') }]}/>
          </>}/>}/>

      <BulkImportDrawer open={importOpen} onClose={() => setImportOpen(false)} classes={classes} onProvision={async (rows) => {
        try {
          const res = await requestBulkImport({ rows: rows.map(r => ({ fullName: r.name, gender: r.gender === 'M' ? 'male' : 'female', birthDay: r.dob || undefined, class: r.classCode, personalEmail: r.personalEmail })) });
          const meta = res.metadata;
          toast(lang === 'vi'
            ? `Đã cấp tài khoản ${meta?.created ?? rows.length} sinh viên`
            : `Provisioned ${meta?.created ?? rows.length} students`,
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
      }}/>

      <StudentDrawer
        state={drawer}
        classes={classes}
        onClose={() => setDrawer(null)}
        onSave={async (data) => {
          try {
            if (drawer.mode === 'add') {
              await requestCreateStudent({ fullName: data.name, gender: data.gender === 'M' ? 'male' : 'female', birthDay: data.dob || undefined, class: data.classId, personalEmail: data.personalEmail });
              toast(lang === 'vi' ? 'Đã tạo hồ sơ & gửi tài khoản về email cá nhân' : 'Profile created · credentials emailed');
            } else {
              await requestUpdateUser(drawer.row.id, { fullName: data.name, gender: data.gender === 'M' ? 'male' : 'female', birthDay: data.dob || undefined, class: data.classId, personalEmail: data.personalEmail });
              toast(lang === 'vi' ? 'Đã lưu thay đổi' : 'Changes saved');
            }
            loadData();
          } catch (err) {
            const msg = err?.response?.data?.message || (lang === 'vi' ? 'Lỗi lưu dữ liệu' : 'Save failed');
            toast(msg, 'danger');
          }
          setDrawer(null);
        }}/>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} tone="danger" icon={<I.trash size={22}/>}
        title={lang === 'vi' ? 'Xóa hồ sơ sinh viên?' : 'Delete student profile?'}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setConfirmDel(null)} disabled={deleting}>{t('cancel')}</button>
          <button className="btn btn-danger" disabled={deleting} onClick={async () => {
            setDeleting(true);
            try {
              await requestDeleteUser(confirmDel.id);
              setStudents(xs => xs.filter(x => x.id !== confirmDel.id));
              toast(lang === 'vi' ? 'Đã xóa hồ sơ' : 'Profile deleted', 'danger');
            } catch {
              toast(lang === 'vi' ? 'Xóa thất bại' : 'Delete failed', 'danger');
            }
            setDeleting(false);
            setConfirmDel(null);
          }}>{deleting ? <><BtnSpinner/>{lang === 'vi' ? 'Đang xóa…' : 'Deleting…'}</> : t('del')}</button>
        </>}>
        {lang === 'vi'
          ? <>Bạn sắp xóa hồ sơ của <b>{confirmDel?.name}</b> ({confirmDel?.code}). Hành động này không thể hoàn tác.</>
          : <>You are about to delete <b>{confirmDel?.name}</b> ({confirmDel?.code}). This cannot be undone.</>}
      </Modal>
    </Page>
  );
}
