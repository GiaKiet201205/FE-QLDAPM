import { useRef, useState } from 'react';
import { Camera, Eye, EyeOff, LockKeyhole, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';
import { useAccountData } from '../features/accounts/hooks/useAccountData';
import { getInitials } from '../features/accounts/data/accountStore';
import { ROLES } from '../config/roles';

const inputClass = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50';
const emptyPasswords = { currentPassword: '', newPassword: '', confirmPassword: '' };

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

async function readAvatar(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Vui lòng chọn ảnh JPG, PNG hoặc WebP.');
  }
  if (file.size > 2 * 1024 * 1024) throw new Error('Ảnh đại diện không được vượt quá 2 MB.');
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 256, 256);
    const side = Math.min(bitmap.width, bitmap.height);
    context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 256, 256);
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally {
    bitmap.close();
  }
}

export default function ProfilePage() {
  const { authUser, updateProfile, changePassword } = useAccountData();
  const [form, setForm] = useState(() => ({
    user: authUser.user || '', email: authUser.email || '',
    phone: authUser.phone || '', avatar: authUser.avatar || '',
  }));
  const [errors, setErrors] = useState({});
  const [passwords, setPasswords] = useState(emptyPasswords);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [failedAvatar, setFailedAvatar] = useState('');
  const uploadVersion = useRef(0);
  const role = ROLES[authUser.roleKey];

  function updateField(event) {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
    setErrors(current => ({ ...current, [name]: undefined }));
  }

  async function uploadAvatar(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const version = ++uploadVersion.current;
    setUploading(true);
    setErrors(current => ({ ...current, avatar: undefined }));
    try {
      const avatar = await readAvatar(file);
      if (version === uploadVersion.current) {
        setForm(current => ({ ...current, avatar }));
        setFailedAvatar('');
      }
    } catch (error) {
      if (version === uploadVersion.current) setErrors(current => ({ ...current, avatar: error.message || 'Không thể đọc ảnh. Vui lòng chọn ảnh khác.' }));
    } finally {
      if (version === uploadVersion.current) setUploading(false);
    }
  }

  function removeAvatar() {
    uploadVersion.current += 1;
    setUploading(false);
    setForm(current => ({ ...current, avatar: '' }));
    setErrors(current => ({ ...current, avatar: undefined }));
  }

  function saveProfile(event) {
    event.preventDefault();
    if (uploading) return;
    const result = updateProfile(form);
    if (!result.ok) { setErrors(result.errors); return; }
    setErrors({});
    toast.success('Cập nhật thông tin cá nhân thành công!');
  }

  async function savePassword(event) {
    event.preventDefault();
    if (changingPassword) return;
    setChangingPassword(true);
    try {
      const result = await changePassword(passwords);
      if (!result.ok) { setPasswordErrors(result.errors); return; }
      setPasswords(emptyPasswords);
      setPasswordErrors({});
      setVisiblePasswords({});
      toast.success('Đổi mật khẩu thành công! Hãy dùng mật khẩu mới khi đăng nhập lần sau.');
    } catch {
      setPasswordErrors({ general: 'Không thể đổi mật khẩu. Vui lòng thử lại.' });
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Thông tin cá nhân</h2>
        <p className="mt-1 text-sm text-slate-500">Cập nhật hồ sơ, quản lý mật khẩu và xem thông tin tài khoản của bạn.</p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-800"><UserRound size={18} />Hồ sơ cá nhân</h3>
          <form onSubmit={saveProfile} noValidate className="space-y-5">
            <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 pb-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#173557] text-xl font-semibold text-white">
                {form.avatar && failedAvatar !== form.avatar ? (
                  <img src={form.avatar} alt="Ảnh đại diện" onError={() => setFailedAvatar(form.avatar)} className="h-full w-full object-cover" />
                ) : getInitials(form.user) || 'US'}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-md border border-slate-300 px-3.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-600">
                    <Camera size={15} />{uploading ? 'Đang xử lý ảnh...' : 'Chọn ảnh đại diện'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} className="sr-only" aria-label="Chọn ảnh đại diện" disabled={uploading} />
                  </label>
                  {form.avatar && <Button type="button" onClick={removeAvatar}><Trash2 size={14} />Xóa ảnh</Button>}
                </div>
                <p className="text-xs text-slate-400">JPG, PNG hoặc WebP, tối đa 2 MB. Nhấn lưu để cập nhật ảnh.</p>
                {errors.avatar && <p role="alert" className="text-xs text-red-600">{errors.avatar}</p>}
              </div>
            </div>

            <Field id="profile-name" label="Họ và tên" error={errors.user}>
              <input id="profile-name" name="user" autoComplete="name" required value={form.user} onChange={updateField} className={inputClass} aria-invalid={!!errors.user} aria-describedby={errors.user ? 'profile-name-error' : undefined} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="profile-phone" label="Số điện thoại" error={errors.phone}>
                <input id="profile-phone" name="phone" type="tel" autoComplete="tel" placeholder="0901234567" value={form.phone} onChange={updateField} className={inputClass} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'profile-phone-error' : undefined} />
              </Field>
              <Field id="profile-email" label="Email" error={errors.email}>
                <input id="profile-email" name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} className={inputClass} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'profile-email-error' : undefined} />
              </Field>
            </div>
            <div className="flex justify-end border-t border-slate-100 pt-4">
              <Button type="submit" variant="primary" disabled={uploading}>Lưu thông tin</Button>
            </div>
          </form>
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800"><ShieldCheck size={18} />Thông tin tài khoản</h3>
          <dl className="space-y-4 text-sm">
            <div><dt className="mb-1 text-xs text-slate-400">Mã tài khoản</dt><dd className="font-mono text-slate-800">{authUser.code}</dd></div>
            <div><dt className="mb-1 text-xs text-slate-400">Tên đăng nhập</dt><dd className="break-all font-medium text-slate-800">{authUser.username}</dd></div>
            <div><dt className="mb-1 text-xs text-slate-400">Vai trò</dt><dd className="font-medium text-slate-800">{role?.label || authUser.role}</dd></div>
            <div><dt className="mb-1 text-xs text-slate-400">Trạng thái tài khoản</dt><dd className={`inline-flex items-center gap-2 font-medium ${authUser.status === 'Active' ? 'text-emerald-700' : 'text-red-600'}`}><span className={`h-2 w-2 rounded-full ${authUser.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />{authUser.status === 'Active' ? 'Đang hoạt động' : 'Đã khóa'}</dd></div>
            <div><dt className="mb-1 text-xs text-slate-400">Phòng ban / Cơ sở</dt><dd className="text-slate-800">{authUser.department || 'Chưa cập nhật'}</dd></div>
          </dl>
          <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">Vai trò và trạng thái tài khoản do quản trị viên quản lý.</p>
        </aside>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800"><LockKeyhole size={18} />Thay đổi mật khẩu</h3>
        <p className="mb-5 mt-1 text-sm text-slate-500">Mật khẩu mới phải có ít nhất 6 ký tự và khác mật khẩu hiện tại.</p>
        <form onSubmit={savePassword} noValidate className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['currentPassword', 'Mật khẩu hiện tại', 'current-password'],
              ['newPassword', 'Mật khẩu mới', 'new-password'],
              ['confirmPassword', 'Xác nhận mật khẩu mới', 'new-password'],
            ].map(([name, label, autoComplete]) => (
              <Field key={name} id={name} label={label} error={passwordErrors[name]}>
                <div className="relative">
                  <input id={name} name={name} type={visiblePasswords[name] ? 'text' : 'password'} autoComplete={autoComplete} required disabled={changingPassword} value={passwords[name]} onChange={event => {
                    setPasswords(current => ({ ...current, [name]: event.target.value }));
                    setPasswordErrors(current => ({ ...current, [name]: undefined, general: undefined }));
                  }} className={`${inputClass} pr-10`} aria-invalid={!!passwordErrors[name]} aria-describedby={passwordErrors[name] ? `${name}-error` : undefined} />
                  <button type="button" onClick={() => setVisiblePasswords(current => ({ ...current, [name]: !current[name] }))} aria-label={`${visiblePasswords[name] ? 'Ẩn' : 'Hiện'} ${label.toLowerCase()}`} aria-pressed={!!visiblePasswords[name]} className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-700">{visiblePasswords[name] ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </Field>
            ))}
          </div>
          {passwordErrors.general && <p role="alert" className="text-sm text-red-600">{passwordErrors.general}</p>}
          <div className="flex justify-end border-t border-slate-100 pt-4"><Button type="submit" variant="primary" disabled={changingPassword}>{changingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu'}</Button></div>
        </form>
      </section>
    </div>
  );
}
