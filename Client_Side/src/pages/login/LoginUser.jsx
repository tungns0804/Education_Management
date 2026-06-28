import React, { useState, useEffect, useRef } from 'react';
import { I } from '../../materials/icons';
import { useApp, useToast } from '../../materials/ui';
import { useAuth } from '../../context/AuthContext';
import { requestLogin, requestForgotPassword, requestVerifyOtp, requestResetPassword } from '../../config/userRequest';
import {
  DEMO_USERS,
  DEMO_PASSWORDS,
  PW_RULES,
  ROLE_ADMIN,
  ROLE_TEACHER,
  ROLE_STUDENT,
  OTP_LENGTH,
  OTP_EXPIRY_SECONDS,
  OTP_TIMER_INTERVAL_MS,
} from '../../constants/auth.constants';

export { PW_RULES };

export function PwField({ label, value, onChange, placeholder, autoFocus }) {
  const { t } = useApp();
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <label>{label}</label>
      <div className="input-group">
        <I.lock />
        <input
          className="input"
          type={show ? 'text' : 'password'}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ paddingRight: 70 }}
        />
        <button
          type="button"
          className="input-affix btn btn-sm btn-ghost"
          onClick={() => setShow((s) => !s)}
          style={{ height: 30, fontSize: 12, gap: 4 }}
        >
          {show ? <I.eyeOff size={15} /> : <I.eye size={15} />}
          {show ? t('pwShown') : t('pwHidden')}
        </button>
      </div>
    </div>
  );
}

export function PwChecklist({ value, lang }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 14px', marginTop: 2 }}>
      {PW_RULES.map((r) => {
        const ok = r.test(value);
        return (
          <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: ok ? 'var(--success)' : 'var(--muted)', transition: 'color .2s' }}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0, background: ok ? 'var(--success-soft)' : 'var(--surface-3)' }}>
              {ok ? <I.check size={11} /> : <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--muted)' }} />}
            </span>
            {r['label_' + lang]}
          </div>
        );
      })}
    </div>
  );
}

function BrandPanel() {
  const { t, lang } = useApp();
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(155deg, #14253B 0%, #1E3A5F 55%, #285285 100%)', color: '#fff', padding: '56px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ position: 'absolute', top: -120, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,216,234,.32), transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: -140, left: -100, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(47,111,237,.28), transparent 70%)' }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .5 }}>
        <defs><pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M34 0H0V34" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="1" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.14)', display: 'grid', placeItems: 'center', backdropFilter: 'blur(8px)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.18)' }}>
          <I.faculty size={24} />
        </div>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em' }}>EduManage</div>
          <div style={{ fontSize: 12, opacity: .7 }}>University Suite</div>
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', margin: 0 }}>{t('appSub')}</h1>
        <p style={{ fontSize: 16, opacity: .82, lineHeight: 1.6, marginTop: 18, maxWidth: 380 }}>
          {lang === 'vi' ? 'Quản lý sinh viên, giảng viên, môn học, điểm danh và điểm số — tất cả trong một nền tảng thống nhất.' : 'Manage students, teachers, courses, attendance and grades — all in one unified platform.'}
        </p>
        <div style={{ display: 'flex', gap: 28, marginTop: 36 }}>
          {[['1.2K+', lang === 'vi' ? 'Sinh viên' : 'Students'], ['86', lang === 'vi' ? 'Giảng viên' : 'Teachers'], ['4', lang === 'vi' ? 'Khoa' : 'Faculties']].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{s[0]}</div>
              <div style={{ fontSize: 12.5, opacity: .7, marginTop: 2 }}>{s[1]}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', fontSize: 12.5, opacity: .6 }}>© 2025 EduManage · ReactJS · NestJS · PostgreSQL</div>
    </div>
  );
}

export default function LoginUser({ renderApp }) {
  const { login, logout, user, loading: authLoading } = useAuth();
  const { t, lang, theme, toggleTheme, toggleLang } = useApp();
  const toast = useToast();

  const [view, setView]         = useState('login'); // login | forgot | otp | reset | first
  const [role, setRole]         = useState(ROLE_ADMIN);
  const [email, setEmail]       = useState('');
  const [pw, setPw]             = useState('');
  const [npw, setNpw]           = useState('');
  const [cpw, setCpw]           = useState('');
  const [otp, setOtp]           = useState(Array(OTP_LENGTH).fill(''));
  const [secs, setSecs]         = useState(OTP_EXPIRY_SECONDS);
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');
  const otpRefs = useRef([]);

  const navigate = (v) => { setApiError(''); setView(v); };

  // Must be declared before any early returns (Rules of Hooks)
  useEffect(() => {
    if (view !== 'otp') return;
    setSecs(OTP_EXPIRY_SECONDS);
    const iv = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), OTP_TIMER_INTERVAL_MS);
    return () => clearInterval(iv);
  }, [view]);

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>
            {lang === 'vi' ? 'Đang kiểm tra phiên đăng nhập...' : 'Checking session...'}
          </span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (user) return renderApp(user, logout);

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || '').trim());
  const emailError = emailTouched && !isEmail(email)
    ? (lang === 'vi' ? 'Email không hợp lệ' : 'Invalid email address')
    : '';

  // Fill demo credentials into the form for quick testing
  const quick = (r) => {
    setRole(r);
    setEmail(DEMO_USERS[r].email);
    setPw(DEMO_PASSWORDS[r]);
    setApiError('');
  };

  const submitLogin = async (e) => {
    e && e.preventDefault();
    setEmailTouched(true);
    if (!isEmail(email)) return;
    if (!pw) {
      setApiError(lang === 'vi' ? 'Vui lòng nhập mật khẩu' : 'Please enter password');
      return;
    }

    setLoading(true);
    setApiError('');
    try {
      const res  = await requestLogin({ email: email.trim(), password: pw });
      const user = res.metadata?.user;
      login(user);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (lang === 'vi' ? 'Đăng nhập thất bại. Vui lòng thử lại.' : 'Login failed. Please try again.');
      setApiError(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const pwValid = PW_RULES.every((r) => r.test(npw)) && npw === cpw;

  const setOtpAt = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp]; next[i] = v; setOtp(next);
    if (v && i < OTP_LENGTH - 1) otpRefs.current[i + 1]?.focus();
  };
  const otpFull = otp.join('').length === OTP_LENGTH;
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  const ROLE_BUTTONS = [
    [ROLE_ADMIN,   I.shield,  t('management')],
    [ROLE_TEACHER, I.teacher, t('teaching')],
    [ROLE_STUDENT, I.user,    t('learning')],
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20, background: 'var(--bg)' }}>
      <div className="card anim-up auth-card" style={{ width: 'min(960px, 100%)', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', minHeight: 560 }}>
        <div className="auth-brand"><BrandPanel /></div>
        <div style={{ padding: '40px 44px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8 }}>
            <button className="btn btn-icon btn-sm btn-ghost" onClick={toggleLang} title="Language">
              <span style={{ fontSize: 12, fontWeight: 800 }}>{lang.toUpperCase()}</span>
            </button>
            <button className="btn btn-icon btn-sm btn-ghost" onClick={toggleTheme}>
              {theme === 'light' ? <I.moon size={17} /> : <I.sun size={17} />}
            </button>
          </div>

          {/* ---- Login view ---- */}
          {view === 'login' && (
            <form onSubmit={submitLogin} style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>{t('signIn')}</h2>
                <p style={{ margin: '7px 0 0', fontSize: 14.5, color: 'var(--muted)' }}>{t('signInSub')}</p>
              </div>
              <div className="field">
                <label>{t('email')}</label>
                <div className="input-group"><I.mail />
                  <input className={emailError ? 'input input-error' : 'input'} type="email" value={email}
                    onChange={(e) => { setEmail(e.target.value); setApiError(''); }}
                    onBlur={() => setEmailTouched(true)} placeholder="name@school.edu.vn" />
                </div>
                {emailError && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--danger)', fontWeight: 500 }}><I.alert size={13} />{emailError}</span>}
              </div>
              <PwField label={t('password')} value={pw} onChange={(v) => { setPw(v); setApiError(''); }} placeholder="••••••••" />
              {apiError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 14px', borderRadius: 10, background: 'var(--danger-soft, rgba(220,38,38,.08))', color: 'var(--danger)', fontSize: 13.5 }}>
                  <I.alert size={15} />{apiError}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-2)', cursor: 'pointer', userSelect: 'none' }}>
                  <input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />{t('rememberMe')}
                </label>
                <button type="button" className="link-btn" onClick={() => navigate('forgot')} style={{ fontSize: 13.5, color: 'var(--accent)', fontWeight: 600 }}>{t('forgotPw')}</button>
              </div>
              <button className="btn btn-primary" style={{ height: 46, fontSize: 15 }} type="submit" disabled={loading}>
                {loading ? (lang === 'vi' ? 'Đang đăng nhập...' : 'Signing in...') : t('loginBtn')}
              </button>
              <div>
                <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', margin: '4px 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{t('loginAs')}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {ROLE_BUTTONS.map(([r, Ic, lbl]) => (
                    <button key={r} type="button" onClick={() => quick(r)} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 6px', borderRadius: 11,
                      background: role === r ? 'color-mix(in srgb, var(--accent) 9%, transparent)' : 'var(--surface-3)',
                      boxShadow: role === r ? 'inset 0 0 0 1.5px var(--accent)' : 'inset 0 0 0 1px var(--border)',
                      color: role === r ? 'var(--accent)' : 'var(--text-2)', transition: 'all .15s',
                    }}>
                      <Ic size={19} /><span style={{ fontSize: 11.5, fontWeight: 700 }}>{lbl}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* ---- First-login password change ---- */}
          {view === 'first' && (
            <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: 'var(--warn-soft)', color: 'var(--warn)', display: 'grid', placeItems: 'center' }}><I.shield size={26} /></div>
              <div>
                <h2 style={{ margin: 0, fontSize: 23, fontWeight: 800, letterSpacing: '-0.02em' }}>{t('firstLoginTitle')}</h2>
                <p style={{ margin: '7px 0 0', fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>{t('firstLoginSub')}</p>
              </div>
              <PwField label={t('newPw')} value={npw} onChange={setNpw} placeholder="••••••••" autoFocus />
              <PwChecklist value={npw} lang={lang} />
              <PwField label={t('confirmPw')} value={cpw} onChange={setCpw} placeholder="••••••••" />
              {cpw && npw !== cpw && <span style={{ fontSize: 12.5, color: 'var(--danger)' }}>{lang === 'vi' ? 'Mật khẩu xác nhận không khớp' : 'Passwords do not match'}</span>}
              <button className="btn btn-primary" style={{ height: 46 }} disabled={!pwValid}
                onClick={() => { toast(lang === 'vi' ? 'Đổi mật khẩu thành công' : 'Password updated'); submitLogin(); }}>
                {t('updatePw')}
              </button>
            </div>
          )}

          {/* ---- Forgot password ---- */}
          {view === 'forgot' && (
            <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <button className="link-btn" onClick={() => navigate('login')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--muted)', fontWeight: 600, alignSelf: 'flex-start' }}><I.chevL size={15} />{t('backToLogin')}</button>
              <div>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>{t('forgotTitle')}</h2>
                <p style={{ margin: '7px 0 0', fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>
                  {lang === 'vi'
                    ? 'Nhập email trường của bạn. Mã OTP sẽ được gửi tới email cá nhân đã đăng ký.'
                    : 'Enter your school email. An OTP will be sent to your registered personal email.'}
                </p>
              </div>
              <div className="field">
                <label>{lang === 'vi' ? 'Email trường' : 'School email'}</label>
                <div className="input-group"><I.mail />
                  <input className={emailError ? 'input input-error' : 'input'} type="email" value={email} onChange={(e) => { setEmail(e.target.value); setApiError(''); }} onBlur={() => setEmailTouched(true)} placeholder="name@school.edu.vn" />
                </div>
                {emailError && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--danger)', fontWeight: 500 }}><I.alert size={13} />{emailError}</span>}
              </div>
              {apiError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 14px', borderRadius: 10, background: 'var(--danger-soft, rgba(220,38,38,.08))', color: 'var(--danger)', fontSize: 13.5 }}>
                  <I.alert size={15} />{apiError}
                </div>
              )}
              <button className="btn btn-primary" style={{ height: 46 }} disabled={loading}
                onClick={async () => {
                  setEmailTouched(true);
                  if (!isEmail(email)) return;
                  setLoading(true);
                  setApiError('');
                  try {
                    await requestForgotPassword({ email: email.trim() });
                    setView('otp');
                    setSecs(OTP_EXPIRY_SECONDS);
                    setOtp(Array(OTP_LENGTH).fill(''));
                    toast(lang === 'vi' ? 'Đã gửi mã OTP tới email cá nhân' : 'OTP sent to your personal email', 'success');
                  } catch (err) {
                    const msg = err?.response?.data?.message || (lang === 'vi' ? 'Gửi OTP thất bại. Vui lòng thử lại.' : 'Failed to send OTP. Please try again.');
                    setApiError(msg);
                  } finally {
                    setLoading(false);
                  }
                }}>
                {loading ? (lang === 'vi' ? 'Đang gửi...' : 'Sending...') : t('sendOtp')}
              </button>
            </div>
          )}

          {/* ---- OTP entry ---- */}
          {view === 'otp' && (
            <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <button className="link-btn" onClick={() => navigate('forgot')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--muted)', fontWeight: 600, alignSelf: 'flex-start' }}><I.chevL size={15} />{t('back')}</button>
              <div>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>{t('otpTitle')}</h2>
                <p style={{ margin: '7px 0 0', fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>
                  {secs > 0
                    ? <>{lang === 'vi' ? 'Nhập mã OTP đã gửi tới email cá nhân của bạn. Hết hạn sau ' : 'Enter the OTP sent to your personal email. Expires in '}<b style={{ color: secs <= 60 ? 'var(--danger)' : 'var(--text-2)' }}>{mm}:{ss}</b></>
                    : <b style={{ color: 'var(--danger)' }}>{lang === 'vi' ? 'Mã OTP đã hết hạn.' : 'OTP has expired.'}</b>}
                </p>
              </div>
              {secs === 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 14px', borderRadius: 10, background: 'var(--danger-soft, rgba(220,38,38,.08))', color: 'var(--danger)', fontSize: 13.5 }}>
                  <I.alert size={15} />{lang === 'vi' ? 'Mã OTP đã hết hạn. Vui lòng nhấn "Gửi lại mã" để nhận mã mới.' : 'OTP has expired. Please click "Resend code" to get a new one.'}
                </div>
              )}
              <div style={{ display: 'flex', gap: 9, justifyContent: 'space-between' }}>
                {otp.map((d, i) => (
                  <input key={i} ref={(el) => (otpRefs.current[i] = el)} value={d} inputMode="numeric" maxLength={1}
                    onChange={(e) => setOtpAt(i, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus(); }}
                    style={{ width: 50, height: 58, textAlign: 'center', fontSize: 24, fontWeight: 700, borderRadius: 12, border: 'none', background: 'var(--surface)', color: 'var(--text)', outline: 'none', opacity: secs === 0 ? 0.5 : 1, boxShadow: d ? 'inset 0 0 0 1.5px var(--accent)' : 'inset 0 0 0 1px var(--border-strong)' }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13.5 }}>
                <span style={{ color: 'var(--muted)' }}>{lang === 'vi' ? 'Chưa nhận được mã?' : "Didn't get the code?"}</span>
                <button className="link-btn" disabled={loading} style={{ color: 'var(--accent)', fontWeight: 600 }}
                  onClick={async () => {
                    setLoading(true);
                    setApiError('');
                    try {
                      await requestForgotPassword({ email: email.trim() });
                      setSecs(OTP_EXPIRY_SECONDS);
                      setOtp(Array(OTP_LENGTH).fill(''));
                      toast(lang === 'vi' ? 'Đã gửi lại mã OTP' : 'OTP resent', 'success');
                    } catch {
                      toast(lang === 'vi' ? 'Gửi lại thất bại' : 'Resend failed', 'error');
                    } finally {
                      setLoading(false);
                    }
                  }}>
                  {t('resend')}
                </button>
              </div>
              {apiError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 14px', borderRadius: 10, background: 'var(--danger-soft, rgba(220,38,38,.08))', color: 'var(--danger)', fontSize: 13.5 }}>
                  <I.alert size={15} />{apiError}
                </div>
              )}
              <button className="btn btn-primary" style={{ height: 46 }} disabled={!otpFull || loading || secs === 0}
                onClick={async () => {
                  setLoading(true);
                  setApiError('');
                  try {
                    await requestVerifyOtp({ email: email.trim(), otp: otp.join('') });
                    setNpw('');
                    setCpw('');
                    setView('reset');
                  } catch (err) {
                    const msg = err?.response?.data?.message || (lang === 'vi' ? 'OTP không hợp lệ hoặc đã hết hạn' : 'Invalid or expired OTP');
                    setApiError(msg);
                  } finally {
                    setLoading(false);
                  }
                }}>
                {loading ? (lang === 'vi' ? 'Đang xác thực...' : 'Verifying...') : t('verify')}
              </button>
            </div>
          )}

          {/* ---- Reset password ---- */}
          {view === 'reset' && (
            <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <button className="link-btn" onClick={() => navigate('otp')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--muted)', fontWeight: 600, alignSelf: 'flex-start' }}><I.chevL size={15} />{t('back')}</button>
              <div>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>{t('setNewPw')}</h2>
                <p style={{ margin: '7px 0 0', fontSize: 14, color: 'var(--muted)' }}>{t('pwPolicy')}</p>
              </div>
              <PwField label={t('newPw')} value={npw} onChange={setNpw} placeholder="••••••••" autoFocus />
              <PwChecklist value={npw} lang={lang} />
              <PwField label={t('confirmPw')} value={cpw} onChange={setCpw} placeholder="••••••••" />
              {cpw && npw !== cpw && <span style={{ fontSize: 12.5, color: 'var(--danger)' }}>{lang === 'vi' ? 'Mật khẩu xác nhận không khớp' : 'Passwords do not match'}</span>}
              {apiError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 14px', borderRadius: 10, background: 'var(--danger-soft, rgba(220,38,38,.08))', color: 'var(--danger)', fontSize: 13.5 }}>
                  <I.alert size={15} />{apiError}
                </div>
              )}
              <button className="btn btn-primary" style={{ height: 46 }} disabled={!pwValid || loading}
                onClick={async () => {
                  setLoading(true);
                  setApiError('');
                  try {
                    await requestResetPassword({ email: email.trim(), otp: otp.join(''), newPassword: npw });
                    toast(lang === 'vi' ? 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.' : 'Password reset! Please sign in again.', 'success');
                    navigate('login');
                    setPw('');
                    setNpw('');
                    setCpw('');
                    setOtp(Array(OTP_LENGTH).fill(''));
                  } catch (err) {
                    const msg = err?.response?.data?.message || (lang === 'vi' ? 'Đặt lại mật khẩu thất bại' : 'Password reset failed');
                    setApiError(msg);
                  } finally {
                    setLoading(false);
                  }
                }}>
                {loading ? (lang === 'vi' ? 'Đang xử lý...' : 'Processing...') : t('setNewPw')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
