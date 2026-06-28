import React, { useState, useEffect, useMemo } from 'react';
import { DB } from './db';
import { I } from './icons';
import { Avatar, Drawer, FormField, Modal, StatCard, StatusBadge, fieldCls, useApp, useForm, useToast, validate } from './ui';
import { BarChart, DonutChart, HBars } from './charts';
import { BulkImportDrawer, downloadCSV } from './tools';
import { DataTable, MenuRow, Page, SectionHead } from './shell';

/* EduManage — Admin screens */

function TableToolbar({ q, setQ, onAdd, addLabel, filters, right }) {
  const { t } = useApp();
  return (
    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <div className="input-group" style={{ flex: '1 1 240px', maxWidth: 320 }}>
        <I.search size={16}/>
        <input className="input" style={{ height: 40 }} value={q} onChange={e => setQ(e.target.value)} placeholder={t('search')}/>
      </div>
      {filters}
      <div style={{ flex: 1 }}/>
      {right}
      {onAdd && <button className="btn btn-primary btn-sm" onClick={onAdd} style={{ height: 40 }}><I.plus size={16}/>{addLabel || t('add')}</button>}
    </div>
  );
}

function FilterSelect({ value, onChange, options, allLabel }) {
  return (
    <select className="select" style={{ height: 40, width: 'auto', minWidth: 130, paddingRight: 30 }} value={value} onChange={e => onChange(e.target.value)}>
      <option value="">{allLabel}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function RowAction({ onEdit, onToggle, active, onDelete }) {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button className="btn btn-icon btn-sm btn-ghost" onClick={() => setOpen(o => !o)}><I.more size={17}/></button>
      {open && <>
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 30 }}/>
        <div className="card" style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', width: 156, padding: 6, zIndex: 31, boxShadow: 'var(--shadow-lg)', animation: 'scaleIn .14s ease' }}>
          <MenuRow icon={<I.edit size={15}/>} label={t('edit')} onClick={() => { setOpen(false); onEdit && onEdit(); }}/>
          {onToggle && <MenuRow icon={active ? <I.lock size={15}/> : <I.unlock size={15}/>} label={active ? t('lock') : t('unlock')} onClick={() => { setOpen(false); onToggle(); }}/>}
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }}/>
          <button onClick={() => { setOpen(false); onDelete && onDelete(); }} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '8px 11px', borderRadius: 7, fontSize: 13.5, fontWeight: 600, color: 'var(--danger)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-soft)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <I.trash size={15}/>{t('del')}
          </button>
        </div>
      </>}
    </div>
  );
}

// ---------------- Admin Dashboard ----------------
function AdminDashboard() {
  const { t, lang, tn } = useApp();
  const facCount = DB.FACULTIES.map(f => ({
    label: f['name_' + lang], value: DB.STUDENTS.filter(s => {
      const cls = DB.MAP.class[s.classId]; const maj = cls && DB.MAP.major[cls.majorId];
      return maj && maj.facultyId === f.id;
    }).length, color: ['#2F6FED', '#1F8A5B', '#C9821A', '#8B5CF6'][DB.FACULTIES.indexOf(f)]
  }));
  const male = DB.STUDENTS.filter(s => s.gender === 'M').length;
  const female = DB.STUDENTS.length - male;
  const gradeDist = [
    { label: 'A', value: 18, color: '#1F8A5B' }, { label: 'B', value: 27, color: '#2F6FED' },
    { label: 'C', value: 14, color: '#C9821A' }, { label: 'D', value: 4, color: '#E0822F' }, { label: 'F', value: 2, color: '#D8543F' },
  ];
  return (
    <Page>
      <div className="grid-stats">
        <StatCard icon={<I.users size={22}/>} label={t('students')} value={DB.stats.students} delta="+12" deltaUp accent="#2F6FED"/>
        <StatCard icon={<I.teacher size={22}/>} label={t('teachers')} value={DB.stats.teachers} delta="+3" deltaUp accent="#1F8A5B"/>
        <StatCard icon={<I.layers size={22}/>} label={t('sections')} value={DB.stats.sections} accent="#8B5CF6"/>
        <StatCard icon={<I.book size={22}/>} label={t('subjects')} value={DB.stats.subjects} delta="+1" deltaUp accent="#C9821A"/>
      </div>

      <div className="grid-2-1">
        <div className="card" style={{ padding: 22 }}>
          <SectionHead title={lang==='vi'?'Sinh viên theo khoa':'Students by faculty'} desc={lang==='vi'?'Phân bổ toàn trường năm học 2024–2025':'Distribution across faculties · 2024–2025'}/>
          <div style={{ marginTop: 18 }}><BarChart data={facCount} height={230}/></div>
        </div>
        <div className="card" style={{ padding: 22 }}>
          <SectionHead title={lang==='vi'?'Tỉ lệ giới tính':'Gender ratio'}/>
          <div style={{ marginTop: 20 }}>
            <DonutChart centerTop={DB.STUDENTS.length} centerSub={lang==='vi'?'sinh viên':'students'} data={[
              { label: t('male'), value: male, color: '#2F6FED' },
              { label: t('female'), value: female, color: '#EC6A9C' },
            ]}/>
          </div>
        </div>
      </div>

      <div className="grid-1-2">
        <div className="card" style={{ padding: 22 }}>
          <SectionHead title={lang==='vi'?'Phổ điểm chữ':'Grade distribution'} desc={lang==='vi'?'Học kỳ 1':'Semester 1'}/>
          <div style={{ marginTop: 18 }}><BarChart data={gradeDist} height={200}/></div>
        </div>
        <div className="card" style={{ padding: 22 }}>
          <SectionHead title={lang==='vi'?'Lớp học phần đông nhất':'Largest course sections'} right={<button className="btn btn-sm btn-ghost">{t('viewAll')}</button>}/>
          <div style={{ marginTop: 18 }}>
            <HBars data={[...DB.SECTIONS].sort((a,b)=>b.enrolled-a.enrolled).slice(0,5).map((s,i) => ({
              label: tn(DB.MAP.subject[s.subjectId]) + ' · ' + s.code,
              value: s.enrolled, suffix: ' SV', color: ['#2F6FED','#1F8A5B','#8B5CF6','#C9821A','#EC6A9C'][i]
            }))}/>
          </div>
        </div>
      </div>
    </Page>
  );
}

// ---------------- Students screen ----------------
function StudentsScreen({ onOpenProfile }) {
  const { t, lang, tn } = useApp();
  const toast = useToast();
  const [students, setStudents] = useState(DB.STUDENTS);
  const [q, setQ] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [drawer, setDrawer] = useState(null); // {mode, row}
  const [confirmDel, setConfirmDel] = useState(null);
  const [importOpen, setImportOpen] = useState(false);

  const filtered = students.filter(s => {
    if (q && !(s.name.toLowerCase().includes(q.toLowerCase()) || s.code.includes(q) || s.email.includes(q.toLowerCase()))) return false;
    if (classFilter && s.classId !== classFilter) return false;
    if (statusFilter === 'active' && !s.active) return false;
    if (statusFilter === 'locked' && s.active) return false;
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
    { header: t('email'), nowrap: true, cell: s => <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{s.email}</span> },
    { header: t('class'), cell: s => <span className="badge badge-muted">{DB.MAP.class[s.classId].name}</span> },
    { header: t('gender'), cell: s => s.gender === 'M' ? t('male') : t('female') },
    { header: 'GPA', align: 'center', cell: s => <span style={{ fontWeight: 700, fontFamily: 'var(--mono)', color: s.gpa >= 3.2 ? 'var(--success)' : s.gpa >= 2.5 ? 'var(--text)' : 'var(--warn)' }}>{s.gpa.toFixed(2)}</span> },
    { header: t('status'), cell: s => <StatusBadge active={s.active}/> },
  ];

  const toggleActive = (s) => { setStudents(xs => xs.map(x => x.id === s.id ? { ...x, active: !x.active } : x)); toast(s.active ? (lang==='vi'?'Đã khóa tài khoản':'Account locked') : (lang==='vi'?'Đã mở khóa':'Account unlocked'), s.active ? 'warn' : 'success'); };

  const exportCSV = () => {
    downloadCSV('sinh-vien.csv',
      [t('name'), t('code'), t('gender'), t('dob'), t('class'), t('email'), 'GPA', t('credits'), t('status')],
      filtered.map(s => [s.name, s.code, s.gender === 'M' ? t('male') : t('female'), s.dob, DB.MAP.class[s.classId].name, s.email, s.gpa, s.credits, s.active ? t('active') : t('locked')]));
    toast(`${t('exported')} · ${filtered.length} ${lang==='vi'?'dòng':'rows'}`);
  };

  return (
    <Page>
      <SectionHead title={t('students')} desc={lang==='vi'?`Quản lý ${students.length} hồ sơ sinh viên và tài khoản`:`Manage ${students.length} student profiles and accounts`}
        right={<div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-sm" style={{ height: 40 }} onClick={() => setImportOpen(true)}><I.upload size={16}/>{t('import')}</button>
          <button className="btn btn-outline btn-sm" style={{ height: 40 }} onClick={exportCSV}><I.download size={16}/>{t('export')}</button>
        </div>}/>
      <DataTable columns={columns} rows={filtered} perPage={8}
        renderActions={s => <RowAction onEdit={() => setDrawer({ mode: 'edit', row: s })} active={s.active} onToggle={() => toggleActive(s)} onDelete={() => setConfirmDel(s)}/>}
        onRowClick={s => onOpenProfile ? onOpenProfile(s.id) : setDrawer({ mode: 'edit', row: s })}
        toolbar={<TableToolbar q={q} setQ={setQ} onAdd={() => setDrawer({ mode: 'add', row: null })} addLabel={lang==='vi'?'Thêm sinh viên':'Add student'}
          filters={<>
            <FilterSelect value={classFilter} onChange={setClassFilter} allLabel={lang==='vi'?'Mọi lớp':'All classes'} options={DB.CLASSES.map(c => ({ value: c.id, label: c.name }))}/>
            <FilterSelect value={statusFilter} onChange={setStatusFilter} allLabel={lang==='vi'?'Mọi trạng thái':'All status'} options={[{ value: 'active', label: t('active') }, { value: 'locked', label: t('locked') }]}/>
          </>}/>}/>

      <BulkImportDrawer open={importOpen} onClose={() => setImportOpen(false)} onProvision={(rows) => {
        setStudents(xs => [...rows.map(r => ({ id: r.id, code: r.code, name: r.name, gender: r.gender, dob: r.dob, classId: r.classId, email: r.email, personalEmail: r.personalEmail, gpa: 0, credits: 0, active: true, avatarHue: r.avatarHue })), ...xs]);
      }}/>

      <StudentDrawer state={drawer} onClose={() => setDrawer(null)} onSave={(data) => {
        if (drawer.mode === 'add') { const id = 'SVN' + Date.now(); setStudents(xs => [{ ...data, id, gpa: 0, active: true, avatarHue: Math.floor(Math.random()*360) }, ...xs]); toast(lang==='vi'?'Đã tạo hồ sơ & gửi tài khoản về email cá nhân':'Profile created · credentials emailed'); }
        else { setStudents(xs => xs.map(x => x.id === drawer.row.id ? { ...x, ...data } : x)); toast(lang==='vi'?'Đã lưu thay đổi':'Changes saved'); }
        setDrawer(null);
      }}/>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} tone="danger" icon={<I.trash size={22}/>}
        title={lang==='vi'?'Xóa hồ sơ sinh viên?':'Delete student profile?'}
        footer={<><button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>{t('cancel')}</button>
          <button className="btn btn-danger" onClick={() => { setStudents(xs => xs.filter(x => x.id !== confirmDel.id)); toast(lang==='vi'?'Đã xóa hồ sơ':'Profile deleted', 'danger'); setConfirmDel(null); }}>{t('del')}</button></>}>
        {lang==='vi' ? <>Bạn sắp xóa hồ sơ của <b>{confirmDel?.name}</b> ({confirmDel?.code}). Hành động này không thể hoàn tác.</>
                     : <>You are about to delete <b>{confirmDel?.name}</b> ({confirmDel?.code}). This cannot be undone.</>}
      </Modal>
    </Page>
  );
}

function StudentDrawer({ state, onClose, onSave }) {
  const { t, lang } = useApp();
  const open = !!state;
  const row = state?.row;
  const isEdit = state?.mode === 'edit';

  const existingCodes = useMemo(() => DB.STUDENTS.map(s => s.code), [state]);
  const validators = useMemo(() => ({
    name: validate.fullName(t),
    code: validate.studentCode(t, existingCodes, row?.code),
    dob: validate.dob(t),
    personalEmail: validate.email(t, false),
  }), [t, existingCodes, row]);

  const { form, set, touch, showError, submit, reset, isValid } = useForm(
    { name: '', code: '', gender: 'M', dob: '', classId: DB.CLASSES[0].id, email: '', personalEmail: '', credits: 0 },
    validators
  );
  const toast = useToast();

  useEffect(() => {
    if (state) reset(row ? { ...row } : { name: '', code: '', gender: 'M', dob: '', classId: DB.CLASSES[0].id, email: '', personalEmail: '', credits: 0 });
  }, [state]);

  const handleSave = () => {
    const ok = submit((data) => onSave(data));
    if (!ok) toast(t('errFixForm'), 'danger');
  };

  return (
    <Drawer open={open} onClose={onClose} title={isEdit ? (lang==='vi'?'Sửa hồ sơ sinh viên':'Edit student') : (lang==='vi'?'Thêm sinh viên mới':'Add new student')}
      subtitle={isEdit ? row?.code : (lang==='vi'?'Hệ thống tự sinh email & mật khẩu tạm':'Email & temp password auto-generated')}
      footer={<><button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button>
        <button className="btn btn-primary" onClick={handleSave}>{isEdit ? t('save') : (lang==='vi'?'Tạo & cấp tài khoản':'Create & provision')}</button></>}>
      {isEdit && <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 14, background: 'var(--surface-3)', borderRadius: 12, marginBottom: 20 }}>
        <Avatar name={form.name} hue={row?.avatarHue || 210} size={48}/>
        <div><div style={{ fontWeight: 700 }}>{form.name}</div><div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{form.email}</div></div>
        <div style={{ marginLeft: 'auto' }}><StatusBadge active={form.active !== false}/></div>
      </div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FormField label={t('name')} error={showError('name')}>
          <input className={fieldCls(showError('name'))} value={form.name || ''} onChange={e => set('name', e.target.value)} onBlur={() => touch('name')} placeholder="Nguyễn Văn A"/>
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label={lang==='vi'?'Mã sinh viên':'Student code'} error={showError('code')}>
            <input className={fieldCls(showError('code'))} value={form.code || ''} onChange={e => set('code', e.target.value.replace(/\D/g, ''))} onBlur={() => touch('code')} placeholder="20216001" inputMode="numeric"/>
          </FormField>
          <FormField label={t('gender')}>
            <select className="select" value={form.gender} onChange={e => set('gender', e.target.value)}><option value="M">{t('male')}</option><option value="F">{t('female')}</option></select>
          </FormField>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label={t('dob')} error={showError('dob')}>
            <input className={fieldCls(showError('dob'))} value={form.dob || ''} onChange={e => set('dob', e.target.value)} onBlur={() => touch('dob')} placeholder="01/01/2004"/>
          </FormField>
          <FormField label={t('class')}>
            <select className="select" value={form.classId} onChange={e => set('classId', e.target.value)}>{DB.CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          </FormField>
        </div>
        {isEdit && <FormField label={t('email')} hint={lang==='vi'?'Email trường (không đổi)':'School email (read-only)'}>
          <input className="input" value={form.email || ''} disabled style={{ opacity: .7 }}/>
        </FormField>}
        <FormField label={lang==='vi'?'Email cá nhân (nhận OTP)':'Personal email (receives OTP)'} error={showError('personalEmail')}>
          <input className={fieldCls(showError('personalEmail'))} value={form.personalEmail || ''} onChange={e => set('personalEmail', e.target.value)} onBlur={() => touch('personalEmail')} placeholder="student@gmail.com" inputMode="email"/>
        </FormField>
        {!isEdit && <div style={{ display: 'flex', gap: 11, padding: 13, background: 'var(--info-soft)', borderRadius: 11, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
          <I.spark size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}/>
          {lang==='vi' ? 'Email trường và mật khẩu tạm 8 ký tự sẽ được tạo tự động và gửi tới email cá nhân. Sinh viên phải đổi mật khẩu khi đăng nhập lần đầu.'
                       : 'A school email and 8-char temporary password are auto-generated and emailed. The student must change it on first login.'}
        </div>}
      </div>
    </Drawer>
  );
}

export { AdminDashboard, StudentsScreen, TableToolbar, FilterSelect, RowAction, StudentDrawer };
