import React, { useState, useEffect } from 'react';
import { I } from '../../components/icons';
import { Avatar, StatusBadge, useToast } from '../../components/ui';
import { Page } from '../../components/shell';
import { Spinner } from '../../components/feedback';
import { useApp } from '../../context/AppContext';
import StudentDrawer from './StudentDrawer';
import { requestUser, requestUpdateUser, requestToggleUserStatus } from '../../config/userRequest';

/* EduManage — Admin: Hồ sơ chi tiết sinh viên */

function InfoRow({ icon, label, value, mono }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ width: 34, height: 34, borderRadius: 9, display: 'grid', placeItems: 'center', color: 'var(--accent)', background: 'var(--info-soft)', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 13, color: 'var(--muted)', minWidth: 96 }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, marginLeft: 'auto', textAlign: 'right', fontFamily: mono ? 'var(--mono)' : 'inherit', wordBreak: 'break-word' }}>{value || '—'}</span>
    </div>
  );
}

// Trang hồ sơ chi tiết một sinh viên (admin mở từ danh sách để xem / chỉnh sửa)
export default function StudentProfile({ studentId, onBack }) {
  const { t, lang } = useApp();
  const toast = useToast();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    requestUser(studentId)
      .then(res => setStudent(res.metadata || null))
      .catch(() => setStudent(null))
      .finally(() => setLoading(false));
  }, [studentId, tick]);

  if (loading) return <Page><Spinner size={28} padding={40}/></Page>;
  if (!student) return <Page><div style={{ color: 'var(--muted)', padding: 32 }}>Không tìm thấy sinh viên</div></Page>;

  const onToggle = async () => {
    try {
      const newStatus = (student.status === 'studying' || student.status === 'active') ? 'inactive' : 'studying';
      await requestToggleUserStatus(student.id, newStatus);
      setStudent(s => ({ ...s, status: newStatus }));
      toast(newStatus === 'inactive' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản', newStatus === 'inactive' ? 'warn' : 'success');
    } catch (err) {
      toast(err?.response?.data?.message || 'Lỗi', 'danger');
    }
  };

  const isActive = student.status === 'studying' || student.status === 'active';

  return (
    <Page>
      <button className="link-btn" onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--muted)', fontWeight: 600, alignSelf: 'flex-start' }}>
        <I.chevL size={16}/>{t('students')}
      </button>

      {/* Header card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ height: 92, background: 'linear-gradient(120deg, #14253B, #1E3A5F 55%, #2F6FED)', position: 'relative' }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .4 }}>
            <defs><pattern id="pp" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0H0V26" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#pp)"/>
          </svg>
        </div>
        <div style={{ padding: '0 26px 22px', display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: -38 }}>
          <div style={{ borderRadius: '50%', padding: 4, background: 'var(--surface)' }}>
            <Avatar name={student.fullName} size={84}/>
          </div>
          <div style={{ flex: 1, minWidth: 200, paddingBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: 23, fontWeight: 800, letterSpacing: '-0.02em' }}>{student.fullName}</h2>
              <StatusBadge active={isActive}/>
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 5, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--mono)' }}>{student.idStudent}</span>
              {student.class && <span>· {student.class}</span>}
              {student.department && <span>· {student.department}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, paddingBottom: 4 }}>
            <button className="btn btn-outline btn-sm" style={{ height: 40 }} onClick={onToggle}>
              {isActive ? <I.lock size={16}/> : <I.unlock size={16}/>}{isActive ? t('lock') : t('unlock')}
            </button>
            <button className="btn btn-primary btn-sm" style={{ height: 40 }} onClick={() => setDrawer({ mode: 'edit', row: student })}>
              <I.edit size={15}/>{t('editProfile')}
            </button>
          </div>
        </div>
      </div>

      <StudentDrawer
        state={drawer}
        onClose={() => setDrawer(null)}
        onSave={async (data) => {
          try {
            await requestUpdateUser(student.id, data);
            setTick(x => x + 1);
            toast(lang==='vi'?'Đã lưu thay đổi':'Changes saved');
            setDrawer(null);
          } catch (err) {
            toast(err?.response?.data?.message || 'Lỗi khi lưu', 'danger');
          }
        }}/>

      <div className="grid-2-1" style={{ alignItems: 'start' }}>
        {/* Left: info */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700 }}>{t('information')}</h3>
          <InfoRow icon={<I.idcard size={17}/>} label={t('code')} value={student.idStudent} mono/>
          <InfoRow icon={<I.cake size={17}/>} label={t('dob')} value={student.birthDay ? new Date(student.birthDay).toLocaleDateString('vi-VN') : null} mono/>
          <InfoRow icon={<I.user size={17}/>} label={t('gender')} value={student.gender === 'male' ? t('male') : student.gender === 'female' ? t('female') : student.gender}/>
          <InfoRow icon={<I.faculty size={17}/>} label={lang==='vi'?'Khoa':'Faculty'} value={student.department}/>
          <InfoRow icon={<I.class size={17}/>} label={t('class')} value={student.class}/>
          <div style={{ height: 8 }}/>
          <h3 style={{ margin: '8px 0 6px', fontSize: 15, fontWeight: 700 }}>{t('contact')}</h3>
          <InfoRow icon={<I.mail size={17}/>} label={t('email')} value={student.email}/>
          <InfoRow icon={<I.mail size={17}/>} label={t('personalEmail')} value={student.personalEmail}/>
          {student.address && <InfoRow icon={<I.pin size={17}/>} label={lang==='vi'?'Địa chỉ':'Address'} value={student.address}/>}
        </div>

        {/* Right: status */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>{lang==='vi'?'Trạng thái':'Status'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--surface-3)' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{lang==='vi'?'Trạng thái học':'Study status'}</div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>{student.status}</div>
            </div>
            {student.createdAt && (
              <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--surface-3)' }}>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{lang==='vi'?'Ngày tạo':'Created'}</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{new Date(student.createdAt).toLocaleDateString('vi-VN')}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}
