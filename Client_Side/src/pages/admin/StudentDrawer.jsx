import React, { useState, useEffect, useMemo } from 'react';
import { I } from '../../components/icons';
import { Avatar, Drawer, FormField, StatusBadge, fieldCls, useForm, useToast, validate } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { requestNextStudentId } from '../../config/userRequest';

/* EduManage — Admin: Drawer thêm / sửa hồ sơ sinh viên */

export default function StudentDrawer({ state, classes = [], onClose, onSave }) {
  const { t, lang } = useApp();
  const open   = !!state;
  const row    = state?.row;
  const isEdit = state?.mode === 'edit';

  const [previewId, setPreviewId] = useState('...');

  const validators = useMemo(() => ({
    name:          validate.fullName(t),
    dob:           validate.dob(t),
    personalEmail: validate.email(t, false),
  }), [t]);

  const defaultClass = classes[0]?.code || '';
  const { form, set, touch, showError, submit, reset } = useForm(
    { name: '', gender: 'M', dob: '', classId: defaultClass, email: '', personalEmail: '' },
    validators,
  );
  const toast = useToast();

  useEffect(() => {
    if (!state) return;
    const def = classes[0]?.code || '';
    if (!row) {
      setPreviewId('...');
      requestNextStudentId()
        .then(r => setPreviewId(r.metadata?.nextId || '—'))
        .catch(() => setPreviewId('—'));
      reset({ name: '', gender: 'M', dob: '', classId: def, email: '', personalEmail: '' });
    } else {
      setPreviewId(row.code || '—');
      reset({ name: row.name, gender: row.gender, dob: row.dob, classId: row.classId || def, email: row.email, personalEmail: row.personalEmail });
    }
  }, [state, classes]);

  const handleSave = () => {
    const ok = submit((data) => onSave(data));
    if (!ok) toast(t('errFixForm'), 'danger');
  };

  return (
    <Drawer open={open} onClose={onClose}
      title={isEdit ? (lang === 'vi' ? 'Sửa hồ sơ sinh viên' : 'Edit student') : (lang === 'vi' ? 'Thêm sinh viên mới' : 'Add new student')}
      subtitle={isEdit ? row?.code : (lang === 'vi' ? 'Mã sinh viên & email trường tự động sinh' : 'Student code & school email auto-generated')}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>{t('cancel')}</button>
        <button className="btn btn-primary" onClick={handleSave}>{isEdit ? t('save') : (lang === 'vi' ? 'Tạo & cấp tài khoản' : 'Create & provision')}</button>
      </>}>
      {isEdit && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 14, background: 'var(--surface-3)', borderRadius: 12, marginBottom: 20 }}>
          <Avatar name={form.name} hue={280} size={48}/>
          <div><div style={{ fontWeight: 700 }}>{form.name}</div><div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{form.email}</div></div>
          <div style={{ marginLeft: 'auto' }}><StatusBadge active={row?.active !== false}/></div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FormField label={t('name')} error={showError('name')}>
          <input className={fieldCls(showError('name'))} value={form.name || ''} onChange={e => set('name', e.target.value)} onBlur={() => touch('name')} placeholder="Nguyễn Văn A"/>
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label={lang === 'vi' ? 'Mã sinh viên' : 'Student code'} hint={lang === 'vi' ? 'Tự động sinh' : 'Auto-generated'}>
            <input className="input" value={previewId} disabled style={{ opacity: .7, fontFamily: 'var(--mono)', cursor: 'not-allowed' }}/>
          </FormField>
          <FormField label={t('gender')}>
            <select className="select" value={form.gender} onChange={e => set('gender', e.target.value)}>
              <option value="M">{t('male')}</option>
              <option value="F">{t('female')}</option>
            </select>
          </FormField>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label={t('dob')} error={showError('dob')}>
            <input className={fieldCls(showError('dob'))} value={form.dob || ''} onChange={e => set('dob', e.target.value)} onBlur={() => touch('dob')} placeholder="01/01/2004"/>
          </FormField>
          <FormField label={t('class')}>
            <select className="select" value={form.classId} onChange={e => set('classId', e.target.value)}>
              {classes.map(c => <option key={c.id} value={c.code}>{c.nameClass}</option>)}
            </select>
          </FormField>
        </div>
        {isEdit && (
          <FormField label={t('email')} hint={lang === 'vi' ? 'Email trường (không đổi)' : 'School email (read-only)'}>
            <input className="input" value={form.email || ''} disabled style={{ opacity: .7 }}/>
          </FormField>
        )}
        <FormField label={lang === 'vi' ? 'Email cá nhân (nhận OTP)' : 'Personal email (receives OTP)'} error={showError('personalEmail')}>
          <input className={fieldCls(showError('personalEmail'))} value={form.personalEmail || ''} onChange={e => set('personalEmail', e.target.value)} onBlur={() => touch('personalEmail')} placeholder="student@gmail.com" inputMode="email"/>
        </FormField>
        {!isEdit && (
          <div style={{ display: 'flex', gap: 11, padding: 13, background: 'var(--info-soft)', borderRadius: 11, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
            <I.spark size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}/>
            {lang === 'vi'
              ? 'Email trường và mật khẩu tạm 8 ký tự sẽ được tạo tự động và gửi tới email cá nhân. Sinh viên phải đổi mật khẩu khi đăng nhập lần đầu.'
              : 'A school email and 8-char temporary password are auto-generated and emailed. The student must change it on first login.'}
          </div>
        )}
      </div>
    </Drawer>
  );
}
