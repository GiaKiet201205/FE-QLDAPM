import { Link } from 'react-router-dom';
import { LockKeyhole, Mail, UserRound } from 'lucide-react';
import Button from '../ui/Button';
import SocialLoginButtons from './SocialLoginButtons';
import UserAuthField from './UserAuthField';
import { useUserAuthForm } from '../../features/user/useUserAuthForm';

export default function UserRegisterForm() {
  const { form, errors, pending, showPassword, togglePassword, change, submit, returnTo } = useUserAuthForm(true);
  return (
    <section className="gk-auth-card">
      <h1 className="mb-2 text-2xl font-bold text-[#1a365d]">Tạo tài khoản</h1>
      <p className="mb-6 text-sm text-gray-500">Bắt đầu hành trình học tập cùng GK Academy.</p>
      <p className="mb-6 rounded-md border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-slate-600">Tạo tài khoản học viên để đăng ký khóa học. Tên đăng nhập gồm 3–50 ký tự, chỉ dùng chữ không dấu, số và dấu gạch dưới.</p>
      <SocialLoginButtons remember={form.remember} returnTo={returnTo} disabled={pending} />
      <form onSubmit={submit} className="gk-auth-form" noValidate aria-busy={pending}>
        <UserAuthField label="Tên đăng nhập" name="username" icon={UserRound} autoComplete="username" required minLength={3} maxLength={50}
          value={form.username} onChange={change} disabled={pending} error={errors.username} placeholder="Chọn tên đăng nhập" />
        <UserAuthField label="Email" name="email" icon={Mail} type="email" autoComplete="email" required maxLength={100}
          value={form.email} onChange={change} disabled={pending} error={errors.email} placeholder="you@example.com" />
        <UserAuthField label="Mật khẩu" name="password" icon={LockKeyhole} password visible={showPassword} onToggle={togglePassword}
          autoComplete="new-password" required minLength={6} maxLength={72} value={form.password} onChange={change} disabled={pending} error={errors.password} placeholder="Ít nhất 6 ký tự" />
        <UserAuthField label="Xác nhận mật khẩu" name="confirm" icon={LockKeyhole} password autoComplete="new-password" required maxLength={72}
          value={form.confirm} onChange={change} disabled={pending} error={errors.confirm} placeholder="Nhập lại mật khẩu" />
        <label className="flex items-center gap-2 text-sm text-gray-700"><input name="remember" type="checkbox" checked={form.remember} onChange={change} disabled={pending} className="h-4 w-4 rounded border-gray-300 accent-[#1a365d]" />Ghi nhớ đăng nhập</label>
        {errors.general && <p role="alert" className="rounded-md border border-red-100 bg-red-50 p-3 text-xs leading-5 text-red-700">{errors.general}</p>}
        <Button type="submit" variant="primary" className="gk-auth-submit" disabled={pending}>{pending ? 'Đang xử lý...' : 'Tạo tài khoản'}</Button>
      </form>
      <div className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-500">Đã có tài khoản? <Link to="/user/login" state={{ returnTo }} className="font-medium text-[#1a365d] hover:underline">Đăng nhập</Link></div>
      <p className="mt-4 text-center text-xs leading-5 text-slate-500">Đăng ký thành công sẽ tự đăng nhập và đưa bạn về khóa học đang mua, nếu có.</p>
    </section>
  );
}
