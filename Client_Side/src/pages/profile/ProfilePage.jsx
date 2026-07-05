import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useToast, FormField, fieldCls } from '../../components/ui';
import { I } from '../../components/icons';
import { PwField, PwChecklist } from '../login/LoginUser';
import { requestUpdateUser, requestChangePassword } from '../../config/userRequest';
import { ROLE_TEACHER, ROLE_STUDENT, AVATAR_HUE, PW_RULES } from '../../constants/auth.constants';

function compressImage(file, maxPx = 256, quality = 0.78) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function AvatarCircle({ src, name, hue, size = 90, editing, onClick }) {
  const initials = (name || '?').split(' ').slice(-2).map(s => s[0]).join('').toUpperCase();
  return (
    <div
      style={{ position: 'relative', display: 'inline-block', cursor: editing ? 'pointer' : 'default', flexShrink: 0 }}
      onClick={editing ? onClick : undefined}
    >
      {src
        ? <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block', boxShadow: '0 0 0 3px var(--border)' }} />
        : <div style={{
            width: size, height: size, borderRadius: '50%',
            display: 'grid', placeItems: 'center',
            fontWeight: 700, fontSize: size * 0.33, letterSpacing: '-0.02em',
            color: `hsl(${hue} 62% 32%)`,
            background: `hsl(${hue} 70% 92%)`,
            boxShadow: `0 0 0 3px hsl(${hue} 60% 84%)`,
          }}>{initials}</div>}
      {editing && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center', color: '#fff',
        }}>
          <I.edit size={20} />
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  if (value == null || value === '') return null;
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ color: 'var(--muted)', flexShrink: 0, marginTop: 1 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 14.5, fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, login, logout } = useAuth();
  const { t, lang } = useApp();
  const toast = useToast();
  const fileRef = useRef();

  const hue = AVATAR_HUE[user?.roleKey] || 210;
  const isStudent = user?.roleKey === ROLE_STUDENT;
  const isTeacher = user?.roleKey === ROLE_TEACHER;

  const initForm = useCallback(() => ({
    fullName:      user?.fullName      || '',
    personalEmail: user?.personalEmail || '',
    gender:        user?.gender        || '',
    birthDay:      user?.birthDay ? new Date(user.birthDay).toISOString().split('T')[0] : '',
    address:       user?.address       || '',
    class:         user?.class         || '',
    phone:         user?.phone         || '',
    degree:        user?.degree        || '',
  }), [user]);

  const [editing,    setEditing]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [form,       setForm]       = useState(initForm);
  const [newAvatar,  setNewAvatar]  = useState(null);

  const [pwOpen,   setPwOpen]   = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwForm,   setPwForm]   = useState({ currentPw: '', newPw: '', confirmPw: '' });

  const pwAllPass = PW_RULES.every(r => r.test(pwForm.newPw));
  const pwMatch   = pwForm.newPw === pwForm.confirmPw;

  function setF(k) { return (e) => setForm(f => ({ ...f, [k]: e.target.value })); }

  function startEdit() { setForm(initForm()); setNewAvatar(null); setEditing(true); }
  function cancelEdit() { setEditing(false); setNewAvatar(null); }

  async function handleAvatarPick(e) {
    const file = e.target.files[0];
    if (!file) return;
    const b64 = await compressImage(file);
    setNewAvatar(b64);
    e.target.value = '';
  }

  async function handleSave() {
    if (!form.fullName.trim()) { toast(t('errRequired'), 'danger'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (newAvatar) payload.avatar = newAvatar;
      if (!payload.birthDay) delete payload.birthDay;
      const res = await requestUpdateUser(user.id, payload);
      login(res.metadata);
      setEditing(false);
      setNewAvatar(null);
      toast(t('profileSaved'));
    } catch (err) {
      toast(err?.response?.data?.message || t('errFixForm'), 'danger');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!pwForm.currentPw)  { toast(t('errRequired'), 'danger'); return; }
    if (!pwAllPass)          { toast(t('errFixForm'), 'danger'); return; }
    if (!pwMatch)            { toast(t('pwMismatch'), 'danger'); return; }
    setPwSaving(true);
    try {
      await requestChangePassword({ currentPassword: pwForm.currentPw, newPassword: pwForm.newPw });
      toast(t('pwChanged'));
      setTimeout(() => logout(), 2500);
    } catch (err) {
      toast(err?.response?.data?.message || t('currentPwWrong'), 'danger');
    } finally {
      setPwSaving(false);
    }
  }

  const displayAvatar = newAvatar || user?.avatar || null;

  const genderLabel = { male: t('male'), female: t('female'), other: lang === 'vi' ? 'Khác' : 'Other' };

  const statusMap = {
    studying: lang === 'vi' ? 'Đang học'    : 'Studying',
    reserved: lang === 'vi' ? 'Bảo lưu'     : 'On leave',
    graduate: lang === 'vi' ? 'Tốt nghiệp'  : 'Graduated',
    teaching: lang === 'vi' ? 'Đang dạy'    : 'Teaching',
    retired:  lang === 'vi' ? 'Đã nghỉ hưu' : 'Retired',
    resigned: lang === 'vi' ? 'Đã thôi việc': 'Resigned',
    active:   t('active'),
    inactive: t('locked'),
  };

  const roleLabel = isStudent
    ? t('students')
    : isTeacher
    ? t('teachers')
    : (lang === 'vi' ? 'Quản trị viên' : 'Administrator');

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-GB');
  };

  return (
    <div className="anim-fade" style={{ padding: 'clamp(18px, 3vw, 30px)', maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header card ────────────────────────────────────── */}
      <div className="card" style={{ padding: 28, display: 'flex', gap: 22, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <AvatarCircle
            src={displayAvatar}
            name={user?.fullName}
            hue={hue}
            size={88}
            editing={editing}
            onClick={() => fileRef.current.click()}
          />
          {editing && (
            <button className="btn btn-ghost btn-sm" style={{ fontSize: 11.5 }} onClick={() => fileRef.current.click()}>
              {t('chooseAvatar')}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarPick} />
        </div>

        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>{user?.fullName}</div>
          <div style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 12 }}>{user?.email}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge badge-success">{roleLabel}</span>
            {user?.status && (
              <span className="badge" style={{ background: 'var(--surface-3)', color: 'var(--text-2)' }}>
                {statusMap[user.status] || user.status}
              </span>
            )}
            {user?.isAdmin && (
              <span className="badge" style={{ background: 'color-mix(in srgb, var(--accent) 14%, transparent)', color: 'var(--accent)' }}>
                Admin
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-start' }}>
          {!editing ? (
            <button className="btn btn-primary btn-sm" onClick={startEdit}>
              <I.edit size={14} />{t('editProfile')}
            </button>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={cancelEdit} disabled={saving}>{t('cancel')}</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? '…' : t('save')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Info card ──────────────────────────────────────── */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
          {t('information')}
        </div>

        {!editing ? (
          <div>
            <InfoRow icon={<I.mail size={16}/>}     label={t('personalEmail')} value={user?.personalEmail} />
            <InfoRow icon={<I.calendar size={16}/>} label={t('dob')}           value={formatDate(user?.birthDay)} />
            <InfoRow icon={<I.user size={16}/>}     label={t('gender')}        value={genderLabel[user?.gender]} />
            <InfoRow icon={<I.pin size={16}/>}      label={t('address')}       value={user?.address} />
            {isStudent && <>
              <InfoRow icon={<I.idcard size={16}/>} label={t('studentId')} value={user?.idStudent} />
              <InfoRow icon={<I.class size={16}/>}  label={t('class')}     value={user?.class} />
            </>}
            {isTeacher && <>
              <InfoRow icon={<I.idcard size={16}/>}  label={t('teacherId')} value={user?.idTeacher} />
              <InfoRow icon={<I.award size={16}/>}   label={t('degree')}    value={user?.degree} />
              <InfoRow icon={<I.phone size={16}/>}   label={t('phone')}     value={user?.phone} />
              <InfoRow icon={<I.building size={16}/>}label={t('faculty')}   value={user?.department} />
            </>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
            <FormField label={t('name')}>
              <input className={fieldCls(!form.fullName.trim())} value={form.fullName} onChange={setF('fullName')} />
            </FormField>
            <FormField label={t('personalEmail')}>
              <input className="input" type="email" value={form.personalEmail} onChange={setF('personalEmail')} />
            </FormField>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <FormField label={t('gender')}>
                <select className="input" value={form.gender} onChange={setF('gender')}>
                  <option value="">{lang === 'vi' ? '— Chọn —' : '— Select —'}</option>
                  <option value="male">{t('male')}</option>
                  <option value="female">{t('female')}</option>
                  <option value="other">{lang === 'vi' ? 'Khác' : 'Other'}</option>
                </select>
              </FormField>
              <FormField label={t('dob')}>
                <input className="input" type="date" value={form.birthDay} onChange={setF('birthDay')} />
              </FormField>
            </div>
            <FormField label={t('address')}>
              <input className="input" value={form.address} onChange={setF('address')} />
            </FormField>
            {isStudent && (
              <FormField label={t('class')}>
                <input className="input" value={form.class} onChange={setF('class')} />
              </FormField>
            )}
            {isTeacher && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FormField label={t('phone')}>
                  <input className="input" type="tel" value={form.phone} onChange={setF('phone')} />
                </FormField>
                <FormField label={t('degree')}>
                  <input className="input" value={form.degree} onChange={setF('degree')} />
                </FormField>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Change password card ───────────────────────────── */}
      <div className="card" style={{ padding: 24 }}>
        <button
          onClick={() => setPwOpen(o => !o)}
          style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left' }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'var(--surface-3)', color: 'var(--accent)', flexShrink: 0 }}>
            <I.lock size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700 }}>{t('changePassword')}</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
              {lang === 'vi' ? 'Cập nhật mật khẩu đăng nhập' : 'Update your login password'}
            </div>
          </div>
          <I.chevD size={16} style={{ transform: pwOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: 'var(--muted)', flexShrink: 0 }} />
        </button>

        {pwOpen && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <PwField
              label={t('currentPw')}
              value={pwForm.currentPw}
              onChange={(v) => setPwForm(f => ({ ...f, currentPw: v }))}
            />
            <PwField
              label={t('newPw')}
              value={pwForm.newPw}
              onChange={(v) => setPwForm(f => ({ ...f, newPw: v }))}
            />
            {pwForm.newPw && <PwChecklist value={pwForm.newPw} lang={lang} />}
            <PwField
              label={t('confirmPw')}
              value={pwForm.confirmPw}
              onChange={(v) => setPwForm(f => ({ ...f, confirmPw: v }))}
            />
            {pwForm.confirmPw && !pwMatch && (
              <div style={{ fontSize: 12.5, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <I.alert size={13} />{t('pwMismatch')}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary"
                onClick={handleChangePassword}
                disabled={pwSaving || !pwForm.currentPw || !pwAllPass || !pwMatch}
              >
                {pwSaving ? '…' : t('updatePw')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
