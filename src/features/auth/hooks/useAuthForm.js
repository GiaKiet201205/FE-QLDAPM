import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const authContent = {
  login: { title: "Welcome back", subtitle: "Sign in to access your ERP workspace", action: "Sign In →" },
  reset: { title: "Forgot Password?", subtitle: "Enter your email to reset your password", action: "Send Reset Link →" },
};

export function useAuthForm(mode = 'login', setIsLoggedIn) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  
  // Quản lý lỗi riêng biệt cho từng khu vực
  const [errors, setErrors] = useState({ userId: '', password: '', general: '' });
  const [notice, setNotice] = useState('');
  
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const copy = authContent[mode];

  const togglePassword = () => setShowPassword(prev => !prev);

  // Hàm kiểm tra từng input
  const validateInputs = () => {
    let isValid = true;
    let newErrors = { userId: '', password: '', general: '' };

    if (!userId.trim()) {
      newErrors.userId = 'Vui lòng nhập Email hoặc User ID.';
      isValid = false;
    } else if (mode === 'reset' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userId)) {
      newErrors.userId = 'Email không hợp lệ.';
      isValid = false;
    }

    if (mode === 'login' && !password) {
      newErrors.password = 'Vui lòng nhập mật khẩu.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateInputs()) return;
    
    if (mode === 'reset') {
      setNotice("Password recovery is not connected yet. No email has been sent.");
      return;
    }

    setPending(true); 

    if (userId === 'admin' && password === '123456') {
      localStorage.setItem('accessToken', 'jwt_token_demo_here');
      toast.success('Đăng nhập thành công!'); 
      if (setIsLoggedIn) setIsLoggedIn(true);
      navigate('/'); 
    } else {
      toast.error('Tài khoản hoặc mật khẩu không chính xác!');
    }
    
    setPending(false);
  };

  return {
    copy,
    userId, setUserId,
    password, setPassword,
    showPassword, togglePassword,
    pending, errors, notice, handleSubmit
  };
}