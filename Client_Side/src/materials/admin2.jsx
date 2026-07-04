import React, { useState, useEffect, useMemo, useRef } from 'react';
import { I } from './icons';
import { Avatar, Drawer, FormField, Modal, StatusBadge, fieldCls, useApp, useForm, useToast, validate } from './ui';
import { downloadCSV } from './tools';
import { DataTable, Page, SectionHead } from './shell';
import { FilterSelect, RowAction, TableToolbar } from './admin';
import {
  requestTeachers, requestCreateTeacher, requestUpdateUser,
  requestToggleUserStatus, requestDeleteUser, requestBulkImportTeachers,
  requestDepartments, requestCreateDepartment, requestUpdateDepartment, requestDeleteDepartment,
  requestBranches,   requestCreateBranch,   requestUpdateBranch,   requestDeleteBranch,
  requestClasses,    requestCreateClass,    requestUpdateClass,    requestDeleteClass,
  requestSubjects,   requestCreateSubject,  requestUpdateSubject,  requestDeleteSubject,
  requestSubjectClasses, requestCreateSubjectClass, requestUpdateSubjectClass, requestDeleteSubjectClass,
  requestSemesters, requestCreateSemester, requestUpdateSemester, requestToggleSemesterActive, requestDeleteSemester,
} from '../config/userRequest';

/* EduManage — Admin: Teachers, Catalog (Faculty/Major/Class/Subject), Sections */

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

// ── Teacher Drawer (add / edit) ───────────────────────────────────────────────
const DEGREES = ['ThS', 'TS', 'PGS', 'GS', 'CN'];

function TeacherDrawer({ state, depts, existingCodes, onClose, onSave }) {
  const { t, lang } = useApp();
  const open   = !!state;
  const row    = state?.row;
  const isEdit = state?.mode === 'edit';

  const validators = useMemo(() => ({
    name:          validate.fullName(t),
    code:          (v) => {
      if (!v || !v.trim()) return t('errRequired');
      if (!/^[A-Za-z0-9]{3,15}$/.test(v.trim())) return lang === 'vi' ? 'Mã 3–15 ký tự chữ/số' : 'Code: 3–15 alphanumeric chars';
      if (!isEdit && existingCodes.includes(v.trim().toUpperCase())) return lang === 'vi' ? 'Mã đã tồn tại' : 'Code already exists';
      return null;
    },
    email:         isEdit ? () => null : validate.email(t, false),
    personalEmail: validate.email(t, false),
  }), [t, lang, existingCodes, isEdit]);

  const { form, set, touch, showError, submit, reset } = useForm(
    { name: '', code: '', email: '', personalEmail: '', degree: 'ThS', phone: '', gender: 'male', birthDay: '', department: '' },
    validators,
  );
  const toast = useToast();

  useEffect(() => {
    if (!state) return;
    reset(row ? {
      name: row.name, code: row.code, email: row.email,
      personalEmail: row.personalEmail, degree: row.degree || 'ThS',
      phone: row.phone, gender: row.gender || 'male',
      birthDay: row.birthDay || '', department: row.deptName || '',
    } : { name: '', code: '', email: '', personalEmail: '', degree: 'ThS', phone: '', gender: 'male', birthDay: '', department: '' });
  }, [state]);

  const handleSave = () => {
    if (!submit((data) => onSave(data))) toast(t('errFixForm'), 'danger');
  };

  return (
    <Drawer open={open} onClose={onClose}
      title={isEdit ? (lang === 'vi' ? 'Sửa giảng viên' : 'Edit teacher') : (lang === 'vi' ? 'Thêm giảng viên' : 'Add teacher')}
      subtitle={isEdit ? row?.code : (lang === 'vi' ? 'Email trường tự sinh từ mã GV' : 'School email auto-generated from teacher code')}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button>
        <button className="btn btn-primary" onClick={handleSave}>
          {isEdit ? t('save') : (lang === 'vi' ? 'Tạo & cấp tài khoản' : 'Create & provision')}
        </button>
      </>}>
      {isEdit && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 14, background: 'var(--surface-3)', borderRadius: 12, marginBottom: 20 }}>
          <Avatar name={form.name} hue={160} size={48}/>
          <div><div style={{ fontWeight: 700 }}>{form.name}</div><div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{form.email}</div></div>
          <div style={{ marginLeft: 'auto' }}><StatusBadge active={row?.active !== false}/></div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FormField label={t('name')} error={showError('name')}>
          <input className={fieldCls(showError('name'))} value={form.name} onChange={e => set('name', e.target.value)} onBlur={() => touch('name')} placeholder="Nguyễn Văn A"/>
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label={lang === 'vi' ? 'Mã giảng viên' : 'Teacher code'} error={showError('code')}>
            <input className={fieldCls(showError('code'))} value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} onBlur={() => touch('code')} placeholder="GV2025001" disabled={isEdit} style={isEdit ? { opacity: .6 } : {}}/>
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
            <input className="input" value={form.email} disabled style={{ opacity: .7 }}/>
          </FormField>
        )}
        <FormField label={lang === 'vi' ? 'Email cá nhân (nhận OTP)' : 'Personal email (receives OTP)'} error={showError('personalEmail')}>
          <input className={fieldCls(showError('personalEmail'))} value={form.personalEmail} onChange={e => set('personalEmail', e.target.value)} onBlur={() => touch('personalEmail')} placeholder="teacher@gmail.com" inputMode="email"/>
        </FormField>

        {!isEdit && (
          <div style={{ display: 'flex', gap: 11, padding: 13, background: 'var(--info-soft)', borderRadius: 11, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
            <I.spark size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}/>
            {lang === 'vi'
              ? `Email trường sẽ là: ${form.code ? form.code.toLowerCase() + '@teacher.school.edu.vn' : '<mã GV>@teacher.school.edu.vn'}. Mật khẩu tạm sẽ gửi về email cá nhân.`
              : `School email: ${form.code ? form.code.toLowerCase() + '@teacher.school.edu.vn' : '<code>@teacher.school.edu.vn'}. Temp password sent to personal email.`}
          </div>
        )}
      </div>
    </Drawer>
  );
}

// ── Teacher Bulk Import Drawer ────────────────────────────────────────────────
const TEACHER_SAMPLE_CSV = `Họ tên,Mã GV,Học hàm vị,Điện thoại,Khoa,Email cá nhân
Nguyễn Văn An,GV2025001,ThS,0912345678,Công nghệ Thông tin,an.nv@gmail.com
Trần Thị Bình,GV2025002,TS,0987654321,Kinh tế - Kế toán,binh.tt@gmail.com
Lê Minh Quân,GV2025003,ThS,,Kỹ thuật - Xây dựng,quan.lm@gmail.com`;

function parseTeacherCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return { rows: [] };
  const splitLine = (l) => {
    const out = []; let cur = '', inQ = false;
    for (let i = 0; i < l.length; i++) {
      const c = l[i];
      if (c === '"') inQ = !inQ;
      else if (c === ',' && !inQ) { out.push(cur); cur = ''; }
      else cur += c;
    }
    out.push(cur);
    return out.map(s => s.trim());
  };
  const header = splitLine(lines[0]);
  const looksHeader = /họ tên|full name|name/i.test(header[0]);
  const dataLines = looksHeader ? lines.slice(1) : lines;
  const rows = dataLines.map((l, i) => {
    const [name, code, degree, phone, dept, pmail] = splitLine(l);
    const errors = [];
    if (!name || !name.trim()) errors.push('name');
    if (!code || !code.trim() || !/^[A-Za-z0-9]{3,15}$/.test(code.trim())) errors.push('code');
    if (!pmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(pmail.trim())) errors.push('personalEmail');
    return {
      i, name: name || '', code: (code || '').toUpperCase(), degree: degree || '',
      phone: phone || '', department: dept || '', personalEmail: pmail || '',
      schoolEmail: code ? code.toLowerCase() + '@teacher.school.edu.vn' : '',
      errors,
    };
  });
  return { rows };
}

function TeacherBulkImportDrawer({ open, onClose, onProvision }) {
  const { t, lang } = useApp();
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { if (open) { setText(''); setParsed(null); } }, [open]);
  useEffect(() => { setParsed(text.trim() ? parseTeacherCSV(text) : null); }, [text]);

  const readFile = (file) => {
    if (!file) return;
    const ext = (file.name || '').split('.').pop().toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const { read, utils } = await import('xlsx');
        const wb = read(new Uint8Array(e.target.result), { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        setText(utils.sheet_to_csv(ws));
      };
      reader.readAsArrayBuffer(file);
    } else {
      const fr = new FileReader();
      fr.onload = () => setText(String(fr.result));
      fr.readAsText(file, 'utf-8');
    }
  };

  const validRows  = parsed ? parsed.rows.filter(r => r.errors.length === 0) : [];
  const errorRows  = parsed ? parsed.rows.filter(r => r.errors.length > 0) : [];

  return (
    <Drawer open={open} onClose={onClose} width={640}
      title={lang === 'vi' ? 'Nhập giảng viên hàng loạt' : 'Bulk import teachers'}
      subtitle={lang === 'vi' ? 'Tải file CSV — mỗi dòng 1 giảng viên' : 'Upload CSV — one teacher per row'}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button>
        <button className="btn btn-primary" disabled={validRows.length === 0} onClick={() => onProvision(validRows)}>
          <I.shield size={16}/>{lang === 'vi' ? `Cấp tài khoản (${validRows.length})` : `Provision (${validRows.length})`}
        </button>
      </>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Drop zone */}
        <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); readFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current?.click()}
          style={{ border: '2px dashed ' + (dragOver ? 'var(--accent)' : 'var(--border-strong)'), borderRadius: 14, padding: '24px 20px', textAlign: 'center', cursor: 'pointer',
            background: dragOver ? 'color-mix(in srgb, var(--accent) 7%, transparent)' : 'var(--surface-2)', transition: 'all .15s' }}>
          <input ref={fileRef} type="file" accept=".csv,text/csv,.xlsx,.xls" style={{ display: 'none' }} onChange={e => readFile(e.target.files[0])}/>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--info-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}><I.upload size={22}/></div>
          <div style={{ fontSize: 14.5, fontWeight: 600 }}>{lang === 'vi' ? 'Kéo & thả file CSV hoặc Excel (.xlsx) vào đây' : 'Drag & drop CSV or Excel (.xlsx) file here'}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>
            {lang === 'vi' ? 'Cột: Họ tên · Mã GV · Học hàm vị · Điện thoại · Khoa · Email cá nhân' : 'Columns: Name · Code · Degree · Phone · Faculty · Personal email'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{lang === 'vi' ? 'hoặc dán dữ liệu' : 'or paste data'}</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
        </div>

        <div className="field">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ margin: 0 }}>{lang === 'vi' ? 'Dán nội dung CSV' : 'Paste CSV content'}</label>
            <button className="btn btn-sm btn-ghost" style={{ height: 28, fontSize: 12 }} onClick={() => setText(TEACHER_SAMPLE_CSV)}>
              <I.fileText size={14}/>{lang === 'vi' ? 'Dùng mẫu' : 'Use sample'}
            </button>
          </div>
          <textarea className="input" rows={5} style={{ fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 1.6 }} value={text} onChange={e => setText(e.target.value)}
            placeholder={lang === 'vi' ? "Họ tên,Mã GV,Học hàm vị,Điện thoại,Khoa,Email cá nhân\n(hoặc tải lên file Excel .xlsx)" : "Full name,Code,Degree,Phone,Faculty,Personal email\n(or upload Excel .xlsx file)"}/>
        </div>

        {parsed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <span className="badge badge-success"><I.check size={13}/>{validRows.length} {lang === 'vi' ? 'hợp lệ' : 'valid'}</span>
              {errorRows.length > 0 && <span className="badge badge-danger"><I.alert size={13}/>{errorRows.length} {lang === 'vi' ? 'lỗi' : 'errors'}</span>}
            </div>
            <div className="card" style={{ overflow: 'hidden', boxShadow: 'none', border: '1px solid var(--border)' }}>
              <div style={{ overflowX: 'auto', maxHeight: 280, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-2)', position: 'sticky', top: 0, zIndex: 1 }}>
                      {[t('name'), lang === 'vi' ? 'Mã GV' : 'Code', t('degree'), lang === 'vi' ? 'Email trường (sinh)' : 'School email (generated)', lang === 'vi' ? 'Email cá nhân' : 'Personal email'].map((h, i) => (
                        <th key={i} style={{ textAlign: 'left', padding: '9px 12px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--muted)', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.rows.map((r, ri) => {
                      const bad = r.errors.length > 0;
                      const has = (f) => r.errors.includes(f);
                      return (
                        <tr key={ri} style={{ borderBottom: '1px solid var(--border)', background: bad ? 'color-mix(in srgb, var(--danger) 5%, transparent)' : 'transparent' }}>
                          <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600, color: has('name') ? 'var(--danger)' : 'var(--text)' }}>{r.name || (lang === 'vi' ? '(thiếu)' : '(missing)')}</td>
                          <td style={{ padding: '8px 12px', fontSize: 12.5, fontFamily: 'var(--mono)', color: has('code') ? 'var(--danger)' : 'var(--text-2)' }}>{r.code || '—'}</td>
                          <td style={{ padding: '8px 12px', fontSize: 12.5, color: 'var(--text-2)' }}>{r.degree || '—'}</td>
                          <td style={{ padding: '8px 12px', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{bad ? '—' : r.schoolEmail}</td>
                          <td style={{ padding: '8px 12px', fontSize: 12, color: has('personalEmail') ? 'var(--danger)' : 'var(--muted)' }}>{r.personalEmail || (lang === 'vi' ? '(thiếu)' : '(missing)')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 11, padding: 13, background: 'var(--info-soft)', borderRadius: 11, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5 }}>
              <I.spark size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}/>
              {lang === 'vi'
                ? 'Mỗi dòng hợp lệ sẽ tạo email trường từ Mã GV + mật khẩu tạm, gửi tới email cá nhân.'
                : 'Each valid row gets a school email from the teacher code + a temp password, emailed to the personal address.'}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

// ── Teachers screen ────────────────────────────────────────────────────────────
function TeachersScreen() {
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

  const existingCodes = useMemo(() => teachers.map(tc => tc.code?.toUpperCase()), [teachers]);

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
          <button className="btn btn-outline btn-sm" style={{ height: 40 }} onClick={() => {
            downloadCSV('giang-vien.csv',
              [t('name'), t('code'), t('degree'), t('faculty'), t('email'), t('sections'), t('status')],
              filtered.map(tc => [tc.name, tc.code, tc.degree, tc.deptName, tc.email, tc.sections, tc.active ? t('active') : t('locked')]));
            toast(`${t('exported')} · ${filtered.length} ${lang === 'vi' ? 'dòng' : 'rows'}`);
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
        existingCodes={existingCodes}
        onClose={() => setDrawer(null)}
        onSave={async (data) => {
          try {
            if (drawer.mode === 'add') {
              await requestCreateTeacher({
                fullName: data.name, idTeacher: data.code,
                email: data.email || `${data.code.toLowerCase()}@teacher.school.edu.vn`,
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
                fullName: r.name, idTeacher: r.code,
                personalEmail: r.personalEmail, degree: r.degree || undefined,
                phone: r.phone || undefined, department: r.department || undefined,
              })),
            });
            const meta = res.metadata;
            toast(lang === 'vi'
              ? `Đã tạo ${meta.created} GV${meta.failed ? ` · ${meta.failed} lỗi` : ''}`
              : `Created ${meta.created} teachers${meta.failed ? ` · ${meta.failed} failed` : ''}`,
              meta.failed ? 'warn' : 'success');
            loadData();
          } catch (err) {
            toast(err?.response?.data?.message || (lang === 'vi' ? 'Nhập hàng loạt thất bại' : 'Bulk import failed'), 'danger');
          }
          setImportOpen(false);
        }}/>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} tone="danger" icon={<I.trash size={22}/>}
        title={lang === 'vi' ? 'Xóa giảng viên?' : 'Delete teacher?'}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>{t('cancel')}</button>
          <button className="btn btn-danger" onClick={async () => {
            try {
              await requestDeleteUser(confirmDel.id);
              setTeachers(xs => xs.filter(x => x.id !== confirmDel.id));
              toast(lang === 'vi' ? 'Đã xóa' : 'Deleted', 'danger');
            } catch (err) {
              toast(err?.response?.data?.message || (lang === 'vi' ? 'Xóa thất bại' : 'Delete failed'), 'danger');
            }
            setConfirmDel(null);
          }}>{t('del')}</button>
        </>}>
        {lang === 'vi'
          ? <>Xóa giảng viên <b>{confirmDel?.name}</b> ({confirmDel?.code})? Hành động không thể hoàn tác.</>
          : <>Delete teacher <b>{confirmDel?.name}</b> ({confirmDel?.code})? This cannot be undone.</>}
      </Modal>
    </Page>
  );
}

// ── Catalog Form Drawer (Faculty / Major / Class / Subject) ───────────────────
function CatalogFormDrawer({ open, onClose, onSave, kind, row, depts, teachers, lang, t }) {
  const isEdit = !!row;

  const getInitial = () => {
    if (kind === 'faculty') return { code: '', nameDepartment: '' };
    if (kind === 'major')   return { code: '', nameBranch: '', departmentId: '' };
    if (kind === 'class')   return { code: '', nameClass: '', departmentId: '', teacherId: '' };
    if (kind === 'subject') return { code: '', name: '', credits: '3', departmentId: '' };
    return {};
  };

  const validators = useMemo(() => {
    const req = validate.required(t);
    const base = { code: req };
    if (kind === 'faculty') return { ...base, nameDepartment: req };
    if (kind === 'major')   return { ...base, nameBranch: req, departmentId: req };
    if (kind === 'class')   return { ...base, nameClass: req, departmentId: req, teacherId: req };
    if (kind === 'subject') return { ...base, name: req, departmentId: req,
      credits: (v) => (!v || isNaN(+v) || +v < 1 || +v > 10) ? (lang === 'vi' ? 'Số TC từ 1–10' : 'Credits 1–10') : null };
    return base;
  }, [kind, t, lang]);

  const { form, set, setForm, touch, showError, submit, reset } = useForm(getInitial(), validators);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    if (row) {
      if (kind === 'faculty') setForm({ code: row.code || '', nameDepartment: row.nameDepartment || '' });
      if (kind === 'major')   setForm({ code: row.code || '', nameBranch: row.nameBranch || '', departmentId: row.departmentId || '' });
      if (kind === 'class')   setForm({ code: row.code || '', nameClass: row.nameClass || '', departmentId: row.departmentId || '', teacherId: row.teacherId || '' });
      if (kind === 'subject') setForm({ code: row.code || '', name: row.name || '', credits: String(row.credits ?? 3), departmentId: row.departmentId || '' });
    } else {
      reset(getInitial());
    }
  }, [open, row, kind]);

  const kindLabel = { faculty: lang === 'vi' ? 'Khoa' : 'Faculty', major: lang === 'vi' ? 'Ngành' : 'Major', class: lang === 'vi' ? 'Lớp' : 'Class', subject: lang === 'vi' ? 'Môn học' : 'Subject' }[kind];

  const handleSave = () => {
    if (!submit((data) => onSave(data))) toast(t('errFixForm'), 'danger');
  };

  return (
    <Drawer open={open} onClose={onClose} width={440}
      title={isEdit ? `${lang === 'vi' ? 'Sửa' : 'Edit'} ${kindLabel}` : `${lang === 'vi' ? 'Thêm' : 'Add'} ${kindLabel}`}
      subtitle={isEdit ? (row?.code || '') : ''}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button>
        <button className="btn btn-primary" onClick={handleSave}>{isEdit ? t('save') : t('add')}</button>
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
          <FormField label={t('faculty')} error={showError('departmentId')}>
            <select className={fieldCls(showError('departmentId'))} value={form.departmentId || ''} onChange={e => set('departmentId', e.target.value)} onBlur={() => touch('departmentId')}>
              <option value="">— {lang === 'vi' ? 'Chọn khoa' : 'Select faculty'}</option>
              {depts.map(d => <option key={d.id} value={d.id}>{d.nameDepartment}</option>)}
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
            <FormField label={t('faculty')} error={showError('departmentId')}>
              <select className={fieldCls(showError('departmentId'))} value={form.departmentId || ''} onChange={e => set('departmentId', e.target.value)} onBlur={() => touch('departmentId')}>
                <option value="">— {lang === 'vi' ? 'Chọn khoa' : 'Select'}</option>
                {depts.map(d => <option key={d.id} value={d.id}>{d.nameDepartment}</option>)}
              </select>
            </FormField>
          </div>
        </>)}
      </div>
    </Drawer>
  );
}

// ── Catalog screen — Faculty / Major / Class / Subject ────────────────────────
function CatalogScreen({ kind }) {
  const { t, lang } = useApp();
  const toast = useToast();
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [q,          setQ]          = useState('');
  const [depts,      setDepts]      = useState([]);
  const [teachers,   setTeachers]   = useState([]);
  const [drawer,     setDrawer]     = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const needsDepts    = ['major', 'class', 'subject'].includes(kind);
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
        { header: lang === 'vi' ? 'Môn học' : 'Subjects', align: 'center', cell: r => <span style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>{r._count?.subjects ?? 0}</span> },
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
      create: (d) => requestCreateClass({ code: d.code, nameClass: d.nameClass, departmentId: d.departmentId, teacherId: d.teacherId }),
      update: (id, d) => requestUpdateClass(id, { nameClass: d.nameClass, departmentId: d.departmentId, teacherId: d.teacherId }),
      del:    (r) => requestDeleteClass(r.id),
      cols: [
        { header: t('code'),    cell: r => <span className="badge badge-muted" style={{ fontFamily: 'var(--mono)' }}>{r.code}</span> },
        { header: lang === 'vi' ? 'Tên Lớp' : 'Class Name',    cell: r => <b>{r.nameClass}</b> },
        { header: t('faculty'), cell: r => <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{r.department?.nameDepartment || '—'}</span> },
        { header: lang === 'vi' ? 'CVHT' : 'Advisor', cell: r => <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{r.teacher?.fullName || '—'}</span> },
      ],
      search: (r) => (r.nameClass || '') + ' ' + (r.code || ''),
      add:    lang === 'vi' ? 'Thêm lớp' : 'Add class',
    },
    subject: {
      title:  t('subjects'),
      fetch:  requestSubjects,
      create: (d) => requestCreateSubject({ code: d.code, name: d.name, credits: +d.credits, departmentId: d.departmentId }),
      update: (id, d) => requestUpdateSubject(id, { name: d.name, credits: +d.credits, departmentId: d.departmentId }),
      del:    (r) => requestDeleteSubject(r.id),
      cols: [
        { header: t('code'),    cell: r => <span className="badge badge-muted" style={{ fontFamily: 'var(--mono)' }}>{r.code}</span> },
        { header: lang === 'vi' ? 'Tên Môn Học' : 'Subject Name',    cell: r => <b>{r.name}</b> },
        { header: t('faculty'), cell: r => <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{r.department?.nameDepartment || '—'}</span> },
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
          <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>{t('cancel')}</button>
          <button className="btn btn-danger" onClick={async () => {
            try {
              await conf.del(confirmDel);
              setRows(xs => xs.filter(x => x.id !== confirmDel.id));
              toast(lang === 'vi' ? 'Đã xóa' : 'Deleted', 'danger');
            } catch (err) {
              toast(err?.response?.data?.message || (lang === 'vi' ? 'Xóa thất bại' : 'Delete failed'), 'danger');
            }
            setConfirmDel(null);
          }}>{t('del')}</button>
        </>}>
        {lang === 'vi' ? 'Hành động này không thể hoàn tác.' : 'This action cannot be undone.'}
      </Modal>
    </Page>
  );
}

// ── Subject Drawer (add / edit môn học) ───────────────────────────────────────
function SubjectDrawer({ open, row, depts, onClose, onSave }) {
  const { t, lang } = useApp();
  const isEdit = !!row;
  const toast = useToast();

  const validators = useMemo(() => ({
    code:         validate.required(t),
    name:         validate.required(t),
    credits:      (v) => (!v || isNaN(+v) || +v < 1 || +v > 10) ? (lang === 'vi' ? 'Số TC từ 1–10' : 'Credits 1–10') : null,
    departmentId: validate.required(t),
  }), [t, lang]);

  const { form, set, touch, showError, submit, reset, setForm } = useForm(
    { code: '', name: '', credits: '3', departmentId: '' },
    validators,
  );

  useEffect(() => {
    if (!open) return;
    if (row) {
      setForm({ code: row.code || '', name: row.name || '', credits: String(row.credits ?? 3), departmentId: row.departmentId || '' });
    } else {
      reset({ code: '', name: '', credits: '3', departmentId: '' });
    }
  }, [open, row]);

  return (
    <Drawer open={open} onClose={onClose} width={440}
      title={isEdit ? (lang === 'vi' ? 'Sửa môn học' : 'Edit subject') : (lang === 'vi' ? 'Thêm môn học' : 'Add subject')}
      subtitle={isEdit ? row?.code : ''}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button>
        <button className="btn btn-primary" onClick={() => { if (!submit((data) => onSave(data))) toast(t('errFixForm'), 'danger'); }}>
          {isEdit ? t('save') : t('add')}
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
          <FormField label={t('faculty')} error={showError('departmentId')}>
            <select className={fieldCls(showError('departmentId'))} value={form.departmentId} onChange={e => set('departmentId', e.target.value)} onBlur={() => touch('departmentId')}>
              <option value="">— {lang === 'vi' ? 'Chọn khoa' : 'Select'}</option>
              {depts.map(d => <option key={d.id} value={d.id}>{d.nameDepartment}</option>)}
            </select>
          </FormField>
        </div>
      </div>
    </Drawer>
  );
}

// ── Subjects screen ────────────────────────────────────────────────────────────
function SubjectsScreen() {
  const { t, lang } = useApp();
  const toast = useToast();
  const [subjects,   setSubjects]   = useState([]);
  const [depts,      setDepts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [q,          setQ]          = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [drawer,     setDrawer]     = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([requestSubjects(), requestDepartments()])
      .then(([sRes, dRes]) => {
        setSubjects(sRes.metadata ?? []);
        setDepts(dRes.metadata ?? []);
      })
      .catch(() => toast(lang === 'vi' ? 'Lỗi tải dữ liệu' : 'Failed to load data', 'danger'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const filtered = subjects.filter(s => {
    if (q && !(s.name?.toLowerCase().includes(q.toLowerCase()) || s.code?.toLowerCase().includes(q.toLowerCase()))) return false;
    if (deptFilter && s.departmentId !== deptFilter) return false;
    return true;
  });

  const columns = [
    { header: t('code'), cell: s => <span className="badge badge-muted" style={{ fontFamily: 'var(--mono)' }}>{s.code}</span> },
    { header: lang === 'vi' ? 'Tên Môn Học' : 'Subject Name', cell: s => <b>{s.name}</b> },
    { header: t('faculty'), cell: s => <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{s.department?.nameDepartment || '—'}</span> },
    { header: t('credits'), align: 'center', cell: s => <span style={{ fontWeight: 700, fontFamily: 'var(--mono)' }}>{s.credits}</span> },
    { header: lang === 'vi' ? 'Lớp HP' : 'Sections', align: 'center', cell: s => <span style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>{s._count?.subjectClasses ?? 0}</span> },
  ];

  return (
    <Page>
      <SectionHead title={t('subjects')}
        desc={lang === 'vi' ? `Quản lý ${subjects.length} môn học` : `Manage ${subjects.length} subjects`}
        right={<button className="btn btn-outline btn-sm" style={{ height: 40 }} onClick={() => {
          downloadCSV('mon-hoc.csv',
            [t('code'), lang === 'vi' ? 'Tên Môn Học' : 'Subject Name', t('faculty'), t('credits'), lang === 'vi' ? 'Lớp HP' : 'Sections'],
            filtered.map(s => [s.code, s.name, s.department?.nameDepartment || '', s.credits, s._count?.subjectClasses ?? 0]));
          toast(`${t('exported')} · ${filtered.length} ${lang === 'vi' ? 'dòng' : 'rows'}`);
        }}><I.download size={16}/>{t('export')}</button>}/>

      <DataTable columns={columns} rows={filtered} perPage={10}
        renderActions={s => <RowAction
          onEdit={() => setDrawer({ row: s })}
          onDelete={() => setConfirmDel(s)}/>}
        toolbar={<TableToolbar q={q} setQ={setQ}
          onAdd={() => setDrawer({ row: null })}
          addLabel={lang === 'vi' ? 'Thêm môn học' : 'Add subject'}
          filters={<FilterSelect value={deptFilter} onChange={setDeptFilter}
            allLabel={lang === 'vi' ? 'Mọi khoa' : 'All faculties'}
            options={depts.map(d => ({ value: d.id, label: d.nameDepartment }))}/>}/>}/>

      <SubjectDrawer
        open={!!drawer}
        row={drawer?.row ?? null}
        depts={depts}
        onClose={() => setDrawer(null)}
        onSave={async (data) => {
          try {
            if (drawer.row) {
              await requestUpdateSubject(drawer.row.id, { name: data.name, credits: +data.credits, departmentId: data.departmentId });
              toast(lang === 'vi' ? 'Đã cập nhật' : 'Updated');
            } else {
              await requestCreateSubject({ code: data.code, name: data.name, credits: +data.credits, departmentId: data.departmentId });
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
          <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>{t('cancel')}</button>
          <button className="btn btn-danger" onClick={async () => {
            try {
              await requestDeleteSubject(confirmDel.id);
              setSubjects(xs => xs.filter(x => x.id !== confirmDel.id));
              toast(lang === 'vi' ? 'Đã xóa' : 'Deleted', 'danger');
            } catch (err) {
              toast(err?.response?.data?.message || (lang === 'vi' ? 'Xóa thất bại' : 'Delete failed'), 'danger');
            }
            setConfirmDel(null);
          }}>{t('del')}</button>
        </>}>
        {lang === 'vi'
          ? <>Xóa môn học <b>{confirmDel?.name}</b> ({confirmDel?.code})? Hành động không thể hoàn tác.</>
          : <>Delete subject <b>{confirmDel?.name}</b> ({confirmDel?.code})? This cannot be undone.</>}
      </Modal>
    </Page>
  );
}

// ── Section Drawer (add / edit lớp học phần) ──────────────────────────────────
const SECTION_STATUSES = ['active', 'completed', 'canceled'];

function SectionDrawer({ open, row, subjects, teachers, onClose, onSave }) {
  const { t, lang } = useApp();
  const isEdit = !!row;
  const toast = useToast();

  const validators = useMemo(() => ({
    code:        validate.required(t),
    subjectId:   validate.required(t),
    teacherId:   validate.required(t),
    semester:    validate.required(t),
    maxStudents: (v) => v && (isNaN(+v) || +v < 1 || +v > 500) ? (lang === 'vi' ? 'Sĩ số 1–500' : 'Max 1–500') : null,
  }), [t, lang]);

  const { form, set, touch, showError, submit, reset, setForm } = useForm(
    { code: '', subjectId: '', teacherId: '', semester: '', maxStudents: '50', status: 'active' },
    validators,
  );

  useEffect(() => {
    if (!open) return;
    if (row) {
      setForm({
        code:        row.code || '',
        subjectId:   row.subjectId || row.subject?.id || '',
        teacherId:   row.teacherId || row.teacher?.id || '',
        semester:    row.semester || '',
        maxStudents: String(row.maxStudents ?? 50),
        status:      row.status || 'active',
      });
    } else {
      reset({ code: '', subjectId: '', teacherId: '', semester: '', maxStudents: '50', status: 'active' });
    }
  }, [open, row]);

  const statusLabel = { active: lang === 'vi' ? 'Đang mở' : 'Active', completed: lang === 'vi' ? 'Đã kết thúc' : 'Completed', canceled: lang === 'vi' ? 'Đã hủy' : 'Canceled' };

  return (
    <Drawer open={open} onClose={onClose} width={460}
      title={isEdit ? (lang === 'vi' ? 'Sửa lớp học phần' : 'Edit section') : (lang === 'vi' ? 'Tạo lớp học phần' : 'New section')}
      subtitle={isEdit ? row?.code : ''}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button>
        <button className="btn btn-primary" onClick={() => { if (!submit((data) => onSave(data))) toast(t('errFixForm'), 'danger'); }}>
          {isEdit ? t('save') : (lang === 'vi' ? 'Tạo lớp HP' : 'Create section')}
        </button>
      </>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={lang === 'vi' ? 'Mã lớp HP' : 'Section code'} error={showError('code')}>
          <input className={fieldCls(showError('code'))} value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} onBlur={() => touch('code')} placeholder="CS101.01" disabled={isEdit} style={isEdit ? { opacity: .6 } : {}}/>
        </FormField>

        <FormField label={lang === 'vi' ? 'Môn học' : 'Subject'} error={showError('subjectId')}>
          <select className={fieldCls(showError('subjectId'))} value={form.subjectId} onChange={e => set('subjectId', e.target.value)} onBlur={() => touch('subjectId')} disabled={isEdit} style={isEdit ? { opacity: .6 } : {}}>
            <option value="">— {lang === 'vi' ? 'Chọn môn học' : 'Select subject'}</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
          </select>
        </FormField>

        <FormField label={lang === 'vi' ? 'Giảng viên phụ trách' : 'Teacher'} error={showError('teacherId')}>
          <select className={fieldCls(showError('teacherId'))} value={form.teacherId} onChange={e => set('teacherId', e.target.value)} onBlur={() => touch('teacherId')}>
            <option value="">— {lang === 'vi' ? 'Chọn giảng viên' : 'Select teacher'}</option>
            {teachers.map(tc => <option key={tc.id} value={tc.id}>{tc.fullName} ({tc.idTeacher})</option>)}
          </select>
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label={lang === 'vi' ? 'Học kỳ' : 'Semester'} error={showError('semester')}>
            <input className={fieldCls(showError('semester'))} value={form.semester} onChange={e => set('semester', e.target.value)} onBlur={() => touch('semester')} placeholder={lang === 'vi' ? 'HK1 2024-2025' : '2024-Fall'}/>
          </FormField>
          <FormField label={lang === 'vi' ? 'Sĩ số tối đa' : 'Max students'} error={showError('maxStudents')} optional optionalLabel={t('optional') || 'tùy chọn'}>
            <input className={fieldCls(showError('maxStudents'))} value={form.maxStudents} onChange={e => set('maxStudents', e.target.value.replace(/\D/g, ''))} onBlur={() => touch('maxStudents')} placeholder="50" inputMode="numeric"/>
          </FormField>
        </div>

        {isEdit && (
          <FormField label={lang === 'vi' ? 'Trạng thái' : 'Status'}>
            <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
              {SECTION_STATUSES.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
            </select>
          </FormField>
        )}
      </div>
    </Drawer>
  );
}

// ── Sections screen ────────────────────────────────────────────────────────────
const CARDS_PER_PAGE = 6;

function SectionsScreen() {
  const { t, lang } = useApp();
  const toast = useToast();
  const [sections,     setSections]     = useState([]);
  const [subjects,     setSubjects]     = useState([]);
  const [teachers,     setTeachers]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [q,            setQ]            = useState('');
  const [semFilter,    setSemFilter]    = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page,         setPage]         = useState(1);
  const [drawer,       setDrawer]       = useState(null);
  const [confirmDel,   setConfirmDel]   = useState(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([requestSubjectClasses(), requestSubjects(), requestTeachers()])
      .then(([secRes, subRes, tcRes]) => {
        setSections(secRes.metadata ?? []);
        setSubjects(subRes.metadata ?? []);
        setTeachers(tcRes.metadata ?? []);
      })
      .catch(() => toast(lang === 'vi' ? 'Lỗi tải lớp học phần' : 'Failed to load sections', 'danger'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const semesters = useMemo(() => [...new Set(sections.map(s => s.semester).filter(Boolean))].sort(), [sections]);

  const filtered = sections.filter(s => {
    if (q) {
      const name = s.subject?.name || '';
      if (!s.code.toLowerCase().includes(q.toLowerCase()) && !name.toLowerCase().includes(q.toLowerCase())) return false;
    }
    if (semFilter    && s.semester !== semFilter)    return false;
    if (statusFilter && s.status   !== statusFilter) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / CARDS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = filtered.slice((safePage - 1) * CARDS_PER_PAGE, safePage * CARDS_PER_PAGE);

  const statusTone  = { active: 'success', completed: 'muted', canceled: 'danger' };
  const statusLabel = { active: lang === 'vi' ? 'Đang mở' : 'Active', completed: lang === 'vi' ? 'Kết thúc' : 'Completed', canceled: lang === 'vi' ? 'Đã hủy' : 'Canceled' };

  return (
    <Page>
      <SectionHead title={t('sections')}
        desc={lang === 'vi' ? `${sections.length} lớp học phần` : `${sections.length} sections`}
        right={<button className="btn btn-primary btn-sm" style={{ height: 40 }}
          onClick={() => setDrawer({ mode: 'add', row: null })}>
          <I.plus size={16}/>{lang === 'vi' ? 'Tạo lớp HP' : 'New section'}
        </button>}/>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="input-group" style={{ maxWidth: 280 }}>
          <I.search size={16}/>
          <input className="input" style={{ height: 42 }} value={q} onChange={e => { setQ(e.target.value); setPage(1); }} placeholder={t('search')}/>
        </div>
        <FilterSelect value={semFilter} onChange={v => { setSemFilter(v); setPage(1); }}
          allLabel={lang === 'vi' ? 'Mọi học kỳ' : 'All semesters'}
          options={semesters.map(s => ({ value: s, label: s }))}/>
        <FilterSelect value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }}
          allLabel={lang === 'vi' ? 'Mọi trạng thái' : 'All status'}
          options={[
            { value: 'active',    label: lang === 'vi' ? 'Đang mở' : 'Active' },
            { value: 'completed', label: lang === 'vi' ? 'Kết thúc' : 'Completed' },
            { value: 'canceled', label: lang === 'vi' ? 'Đã hủy' : 'Canceled' },
          ]}/>
      </div>

      <div className="grid-cards">
        {pageItems.map(s => {
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                  <span className="badge badge-muted">{s.subject?.credits ?? 0} {t('credits')}</span>
                  {s.status !== 'active' && <span className={`badge badge-${statusTone[s.status] || 'muted'}`}>{statusLabel[s.status] || s.status}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Avatar name={s.teacher?.fullName ?? '?'} hue={160} size={28}/>
                <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>{s.teacher?.fullName ?? '—'}</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                {lang === 'vi' ? 'HK:' : 'Semester:'} {s.semester}
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
                <button className="btn btn-icon btn-sm btn-ghost" onClick={() => setDrawer({ mode: 'edit', row: s })}><I.edit size={15}/></button>
                <button className="btn btn-icon btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDel(s)}><I.trash size={15}/></button>
              </div>
            </div>
          );
        })}
        {pageItems.length === 0 && !loading && (
          <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
            {lang === 'vi' ? 'Không có lớp học phần nào.' : 'No sections found.'}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, paddingTop: 8 }}>
          <button className="btn btn-sm btn-ghost" disabled={safePage <= 1} onClick={() => setPage(p => p - 1)}>‹ {lang === 'vi' ? 'Trước' : 'Prev'}</button>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{safePage} / {totalPages}</span>
          <button className="btn btn-sm btn-ghost" disabled={safePage >= totalPages} onClick={() => setPage(p => p + 1)}>{lang === 'vi' ? 'Sau' : 'Next'} ›</button>
        </div>
      )}

      <SectionDrawer
        open={!!drawer}
        row={drawer?.row ?? null}
        subjects={subjects}
        teachers={teachers}
        onClose={() => setDrawer(null)}
        onSave={async (data) => {
          try {
            if (drawer.mode === 'edit') {
              await requestUpdateSubjectClass(drawer.row.id, {
                semester:    data.semester,
                maxStudents: data.maxStudents ? +data.maxStudents : undefined,
                status:      data.status,
                teacherId:   data.teacherId,
              });
              toast(lang === 'vi' ? 'Đã cập nhật lớp HP' : 'Section updated');
            } else {
              await requestCreateSubjectClass({
                code:        data.code,
                semester:    data.semester,
                maxStudents: data.maxStudents ? +data.maxStudents : 50,
                subjectId:   data.subjectId,
                teacherId:   data.teacherId,
              });
              toast(lang === 'vi' ? 'Đã tạo lớp học phần' : 'Section created');
            }
            loadData();
          } catch (err) {
            toast(err?.response?.data?.message || (lang === 'vi' ? 'Lỗi lưu dữ liệu' : 'Save failed'), 'danger');
          }
          setDrawer(null);
        }}/>

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
              toast(err?.response?.data?.message || (lang === 'vi' ? 'Xóa thất bại' : 'Delete failed'), 'danger');
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

// ── SemestersScreen — Quản lý học kỳ ─────────────────────────────────────────

function SemesterDrawer({ open, row, onClose, onSave }) {
  const { t, lang } = useApp();
  const isEdit = !!row;
  const toast = useToast();
  const [name, setName] = useState('');
  const [nameErr, setNameErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(row?.name ?? '');
    setNameErr('');
  }, [open, row]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setNameErr(lang === 'vi' ? 'Bắt buộc nhập tên học kỳ' : 'Semester name is required'); return; }
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
    }
  };

  return (
    <Drawer open={open} onClose={onClose} width={420}
      title={isEdit ? (lang === 'vi' ? 'Sửa học kỳ' : 'Edit semester') : (lang === 'vi' ? 'Thêm học kỳ' : 'New semester')}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button>
        <button className="btn btn-primary" onClick={handleSave}>
          {isEdit ? t('save') : (lang === 'vi' ? 'Thêm học kỳ' : 'Add semester')}
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

function SemestersScreen() {
  const { t, lang } = useApp();
  const toast = useToast();
  const [semesters,  setSemesters]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [drawer,     setDrawer]     = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
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
            ? '…'
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
          <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>{t('cancel')}</button>
          <button className="btn btn-danger" onClick={async () => {
            try {
              await requestDeleteSemester(confirmDel.id);
              load();
              toast(lang === 'vi' ? 'Đã xóa học kỳ' : 'Semester deleted', 'success');
            } catch (err) {
              toast(err?.response?.data?.message || (lang === 'vi' ? 'Xóa thất bại' : 'Delete failed'), 'danger');
            }
            setConfirmDel(null);
          }}>{t('del')}</button>
        </>}>
        {lang === 'vi'
          ? <>Xóa học kỳ <b>{confirmDel?.name}</b>? Hành động không thể hoàn tác.</>
          : <>Delete semester <b>{confirmDel?.name}</b>? This cannot be undone.</>}
      </Modal>
    </Page>
  );
}

export { TeachersScreen, CatalogScreen, SubjectsScreen, SectionsScreen, SemestersScreen };
