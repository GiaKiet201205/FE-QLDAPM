import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAccountData } from '../../accounts/hooks/useAccountData';

const authContent = {
  login: {
    title: 'Đăng nhập quản lý',
    subtitle: 'Chào mừng bạn trở lại không gian làm việc GK.',
    action: 'Đăng nhập',
  },
  reset: {
    title: 'Quên mật khẩu?',
    subtitle: 'Nhập email để kiểm tra hướng dẫn hỗ trợ truy cập.',
    action: 'Xem hướng dẫn khôi phục',
  },
};

export function useAuthForm(mode = 'login') {
  const { login } = useAccountData();
  const [rememberMe, setRememberMe] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ userId: '', password: '', general: '' });
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const pendingRef = useRef(false);
  const navigate = useNavigate();
  const copy = authContent[mode];

  const togglePassword = () => setShowPassword((prev) => !prev);

  const validateInputs = () => {
    let isValid = true;
    const newErrors = { userId: '', password: '', general: '' };

    if (!userId.trim()) {
      newErrors.userId = mode === 'login' ? 'Vui lòng nhập tên đăng nhập.' : 'Vui lòng nhập email.';
      isValid = false;
    }

    if (mode === 'login' && !password) {
      newErrors.password = 'Vui lòng nhập mật khẩu.';
      isValid = false;
    }

    if (mode === 'reset' && userId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userId.trim())) {
      newErrors.userId = 'Email không hợp lệ.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pendingRef.current || !validateInputs()) return;

    if (mode === 'reset') {
      setNotice('Chức năng gửi email khôi phục hiện chưa được kết nối. Vui lòng liên hệ quản lý GK để được hỗ trợ đặt lại mật khẩu.');
      return;
    }

    pendingRef.current = true;
    setPending(true);

    try {
      const result = await login(userId, password, rememberMe);
      if (!result.ok) {
        setErrors((current) => ({ ...current, general: result.reason }));
        return;
      }
      toast.success(`Xin chào ${result.user}!`);
      navigate(`/${result.roleKey.toLowerCase()}`, { replace: true });
    } catch {
      setErrors((current) => ({ ...current, general: 'Không thể đăng nhập. Vui lòng thử lại.' }));
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  };

  return {
    copy,
    rememberMe,
    setRememberMe,
    userId,
    setUserId,
    password,
    setPassword,
    showPassword,
    togglePassword,
    pending,
    errors,
    notice,
    handleSubmit,
  };
}
