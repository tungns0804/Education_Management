import React, { useState, useEffect } from 'react';
import { I } from '../../components/icons';
import { BtnSpinner, Drawer, FormField, Modal, fieldCls, useToast } from '../../components/ui';
import { DataTable, Page, SectionHead } from '../../components/shell';
import { RowAction } from '../../components/table';
import { useApp } from '../../context/AppContext';
import {
  requestSemesters, requestCreateSemester, requestUpdateSemester,
  requestToggleSemesterActive, requestDeleteSemester,
} from '../../config/userRequest';

/* EduManage — Admin: Quản lý học kỳ */

function SemesterDrawer({ open, row, onClose, onSave }) {
  const { t, lang } = useApp();
  const isEdit = !!row;
  const toast = useToast();
  const [name, setName] = useState('');
  const [nameErr, setNameErr] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(row?.name ?? '');
    setNameErr('');
    setSaving(false);
  }, [open, row]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setNameErr(lang === 'vi' ? 'Bắt buộc nhập tên học kỳ' : 'Semester name is required'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await requestUpdateSemester(row.id, { name: trimmed });
      } else {
        await requestCreateSemester(trimmed);
      }
      onSave();
      onClose();
    } catch (err) {
      toast(err?.response?.data?.message || (lang === 'vi' ? 'Lưu thất bại' : 'Save failed'), 'danger');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} onClose={onClose} width={420}
      title={isEdit ? (lang === 'vi' ? 'Sửa học kỳ' : 'Edit semester') : (lang === 'vi' ? 'Thêm học kỳ' : 'New semester')}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose} disabled={saving}>{t('cancel')}</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving
            ? <><BtnSpinner/>{lang === 'vi' ? 'Đang lưu…' : 'Saving…'}</>
            : (isEdit ? t('save') : (lang === 'vi' ? 'Thêm học kỳ' : 'Add semester'))}
        </button>
      </>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={lang === 'vi' ? 'Tên học kỳ' : 'Semester name'} error={nameErr}>
          <input
            className={fieldCls(nameErr)}
            value={name}
            onChange={e => { setName(e.target.value); setNameErr(''); }}
            placeholder={lang === 'vi' ? 'VD: HK1 2024-2025' : 'e.g. 2024-Fall'}
            autoFocus
          />
        </FormField>
        <div style={{ fontSize: 13, color: 'var(--muted)', background: 'var(--surface-3)', borderRadius: 10, padding: '10px 14px' }}>
          {lang === 'vi'
            ? 'Tên học kỳ phải khớp với trường "Học kỳ" của lớp học phần để lọc đúng dữ liệu.'
            : 'The name must match the "Semester" field on subject classes to filter correctly.'}
        </div>
      </div>
    </Drawer>
  );
}

export default function SemestersScreen() {
  const { t, lang } = useApp();
  const toast = useToast();
  const [semesters,  setSemesters]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [drawer,     setDrawer]     = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [deleting,   setDeleting]   = useState(false);
  const [toggling,   setToggling]   = useState({});

  const load = () => {
    setLoading(true);
    requestSemesters()
      .then(data => setSemesters(Array.isArray(data) ? data : []))
      .catch(() => toast(lang === 'vi' ? 'Lỗi tải danh sách học kỳ' : 'Failed to load semesters', 'danger'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (sem) => {
    setToggling(p => ({ ...p, [sem.id]: true }));
    try {
      await requestToggleSemesterActive(sem.id);
      load();
    } catch (err) {
      toast(err?.response?.data?.message || (lang === 'vi' ? 'Cập nhật thất bại' : 'Update failed'), 'danger');
    } finally {
      setToggling(p => ({ ...p, [sem.id]: false }));
    }
  };

  const activeCount = semesters.filter(s => s.isActive).length;

  const columns = [
    {
      header: lang === 'vi' ? 'Tên học kỳ' : 'Semester',
      cell: (s) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center',
            background: s.isActive ? 'rgba(31,138,91,.15)' : 'var(--surface-3)',
            color: s.isActive ? 'var(--success)' : 'var(--muted)',
          }}>
            <I.calendar size={17}/>
          </div>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
        </div>
      ),
    },
    {
      header: lang === 'vi' ? 'Trạng thái' : 'Status', width: 140,
      cell: (s) => (
        <span className={`badge badge-${s.isActive ? 'success' : 'muted'}`}>
          {s.isActive ? (lang === 'vi' ? 'Đang hiển thị' : 'Active') : (lang === 'vi' ? 'Ẩn' : 'Inactive')}
        </span>
      ),
    },
    {
      header: '', width: 170,
      cell: (s) => (
        <button
          className={`btn btn-sm ${s.isActive ? 'btn-ghost' : 'btn-primary'}`}
          style={{ minWidth: 140, fontSize: 12.5 }}
          disabled={!!toggling[s.id]}
          onClick={(e) => { e.stopPropagation(); handleToggle(s); }}
        >
          {toggling[s.id]
            ? <BtnSpinner size={14}/>
            : s.isActive
              ? (lang === 'vi' ? 'Tắt hiển thị' : 'Deactivate')
              : (lang === 'vi' ? 'Bật hiển thị' : 'Activate')}
        </button>
      ),
    },
  ];

  return (
    <Page>
      <SectionHead
        title={lang === 'vi' ? 'Quản lý học kỳ' : 'Semester Management'}
        desc={lang === 'vi'
          ? `${semesters.length} học kỳ · ${activeCount} đang hiển thị`
          : `${semesters.length} semesters · ${activeCount} active`}
        right={
          <button className="btn btn-primary btn-sm" style={{ height: 40 }}
            onClick={() => setDrawer({ row: null })}>
            <I.plus size={16}/>{lang === 'vi' ? 'Thêm học kỳ' : 'New semester'}
          </button>
        }/>

      <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <I.alert size={16} style={{ color: 'var(--accent)', flexShrink: 0 }}/>
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
          {lang === 'vi'
            ? 'Chỉ các học kỳ đang "Bật hiển thị" mới được hiện trên giao diện giảng viên và sinh viên.'
            : 'Only "Active" semesters are visible on teacher and student interfaces.'}
        </span>
      </div>

      {loading
        ? <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
            {lang === 'vi' ? 'Đang tải…' : 'Loading…'}
          </div>
        : <DataTable columns={columns} rows={semesters} perPage={10}
            emptyLabel={lang === 'vi' ? 'Chưa có học kỳ nào. Nhấn "Thêm học kỳ" để bắt đầu.' : 'No semesters yet. Click "New semester" to get started.'}
            renderActions={s => <RowAction onEdit={() => setDrawer({ row: s })} onDelete={() => setConfirmDel(s)}/>}/>}

      <SemesterDrawer
        open={!!drawer}
        row={drawer?.row ?? null}
        onClose={() => setDrawer(null)}
        onSave={load}/>

      <Modal
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        icon={<I.trash size={22}/>}
        title={lang === 'vi' ? 'Xóa học kỳ?' : 'Delete semester?'}
        tone="danger"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setConfirmDel(null)} disabled={deleting}>{t('cancel')}</button>
          <button className="btn btn-danger" disabled={deleting} onClick={async () => {
            setDeleting(true);
            try {
              await requestDeleteSemester(confirmDel.id);
              load();
              toast(lang === 'vi' ? 'Đã xóa học kỳ' : 'Semester deleted', 'success');
            } catch (err) {
              toast(err?.response?.data?.message || (lang === 'vi' ? 'Xóa thất bại' : 'Delete failed'), 'danger');
            }
            setDeleting(false);
            setConfirmDel(null);
          }}>{deleting ? <><BtnSpinner/>{lang === 'vi' ? 'Đang xóa…' : 'Deleting…'}</> : t('del')}</button>
        </>}>
        {lang === 'vi'
          ? <>Xóa học kỳ <b>{confirmDel?.name}</b>? Hành động không thể hoàn tác.</>
          : <>Delete semester <b>{confirmDel?.name}</b>? This cannot be undone.</>}
      </Modal>
    </Page>
  );
}
