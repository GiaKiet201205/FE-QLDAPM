import { Link } from 'react-router-dom';
import { LockKeyhole, UserRound } from 'lucide-react';
import Button from '../ui/Button';
import SocialLoginButtons from './SocialLoginButtons';
import UserAuthField from './UserAuthField';
import { managementLoginUrl } from '../../features/user/authNavigation';
import { useUserAuthForm } from '../../features/user/useUserAuthForm';

export default function UserLoginForm() {
  const { form, errors, pending, showPassword, togglePassword, change, submit, returnTo } = useUserAuthForm();
  const staffLogin = managementLoginUrl(window.location.origin, import.meta.env.VITE_ADMIN_URL);
  return (
    <section className="gk-auth-card">
      <h1 className="mb-2 text-2xl font-bold text-[#1a365d]">Đăng nhập học viên</h1>
      <p className="mb-8 text-sm text-gray-500">Dành cho học viên đăng ký khóa học và xem hồ sơ học tập tại GK.</p>
      <SocialLoginButtons remember={form.remember} returnTo={returnTo} disabled={pending} />
      <form onSubmit={submit} className="gk-auth-form" noValidate aria-busy={pending}>
        <UserAuthField label="Tên đăng nhập" name="username" icon={UserRound} autoComplete="username" required maxLength={50}
          value={form.username} onChange={change} disabled={pending} error={errors.username} placeholder="Nhập tên đăng nhập" />
        <UserAuthField label="Mật khẩu" name="password" icon={LockKeyhole} password visible={showPassword} onToggle={togglePassword}
          autoComplete="current-password" required maxLength={255} value={form.password} onChange={change} disabled={pending} error={errors.password} placeholder="••••••••" />
        <div className="gk-auth-options"><label><input name="remember" type="checkbox" checked={form.remember} onChange={change} disabled={pending} />Ghi nhớ đăng nhập</label><Link to="/user/forgot-password" state={{ returnTo }}>Quên mật khẩu?</Link></div>
        {errors.general && <div role="alert" className="gk-login-feedback"><p>{errors.general}</p>{errors.staffPortal && staffLogin && <a className="gk-portal-link" href={staffLogin}>Mở cổng đăng nhập quản lý</a>}</div>}
        <Button type="submit" variant="primary" className="gk-auth-submit" disabled={pending}>{pending ? 'Đang xử lý...' : 'Đăng nhập'}</Button>
      </form>
      <div className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-500">
        Chưa có tài khoản? <Link to="/user/register" state={{ returnTo }} className="font-medium text-[#1a365d] hover:underline">Tạo tài khoản</Link>
      </div>
      <p className="mt-4 text-center text-xs leading-5 text-slate-500">Đăng nhập để tiếp tục đăng ký khóa học và xem các khóa đã mua trong tài khoản của bạn.</p>
    </section>
  );
}
