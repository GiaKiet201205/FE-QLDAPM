import { Link } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, UserRound, Mail } from 'lucide-react';
import { useAuthForm } from '../../features/auth/hooks/useAuthForm';
import Button from '../ui/Button';

export function LoginForm({ mode = 'login' }) {
  const { copy, userId, setUserId, password, setPassword, showPassword, togglePassword, pending, errors, notice, handleSubmit, rememberMe, setRememberMe } = useAuthForm(mode);
  const reset = mode === 'reset';
  const IdentifierIcon = reset ? Mail : UserRound;
  return <section className="gk-auth-card">
    <p className="gk-auth-eyebrow">{reset ? 'Hỗ trợ truy cập' : 'Cổng quản lý GK'}</p><h1>{copy.title}</h1><p className="gk-auth-subtitle">{copy.subtitle}</p>
    <form onSubmit={handleSubmit} noValidate aria-busy={pending}>
      <div className="gk-auth-field"><label htmlFor="login-identifier">{reset ? 'Email' : 'Tên đăng nhập'}</label><div className="gk-input-wrap"><IdentifierIcon size={18} aria-hidden="true" /><input id="login-identifier" type={reset ? 'email' : 'text'} autoComplete={reset ? 'email' : 'username'} value={userId} onChange={(e) => setUserId(e.target.value)} disabled={pending} required aria-invalid={Boolean(errors.userId)} aria-describedby={errors.userId ? 'login-identifier-error' : undefined} placeholder={reset ? 'Email của bạn' : 'Nhập tên đăng nhập'} /></div>{errors.userId && <p id="login-identifier-error" className="gk-field-error">{errors.userId}</p>}</div>
      {!reset && <><div className="gk-auth-field"><label htmlFor="login-password">Mật khẩu</label><div className="gk-input-wrap"><LockKeyhole size={18} aria-hidden="true" /><input id="login-password" autoComplete="current-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required disabled={pending} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'login-password-error' : undefined} placeholder="Nhập mật khẩu" /><button type="button" disabled={pending} onClick={togglePassword} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{errors.password && <p id="login-password-error" className="gk-field-error">{errors.password}</p>}</div><div className="gk-auth-options"><label><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={pending} />Ghi nhớ đăng nhập</label><Link to="/forgot-password">Quên mật khẩu?</Link></div></>}
      {notice && <p role="status" className="gk-auth-notice">{notice}</p>}{errors.general && <p role="alert" className="gk-field-error gk-auth-error">{errors.general}</p>}
      <Button type="submit" variant="primary" className="gk-auth-submit" disabled={pending}>{pending ? 'Đang đăng nhập...' : copy.action}</Button>
    </form>
    <div className="gk-auth-bottom">{reset ? <Link to="/login">Quay lại đăng nhập</Link> : <p>Dùng tài khoản nhân viên được cấp bởi trung tâm. Liên hệ quản lý khi cần hỗ trợ truy cập.</p>}</div>
  </section>;
}
