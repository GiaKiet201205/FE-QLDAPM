import { useState } from 'react';
import { Link } from 'react-router-dom';
import UserAuthLayout from '../../components/user/UserAuthLayout';
import Button from '../../components/ui/Button';

export default function UserForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  return <UserAuthLayout><section className="gk-auth-card"><p className="gk-auth-eyebrow">Hỗ trợ tài khoản</p><h1>Quên mật khẩu?</h1><p className="gk-auth-subtitle">Tìm lại quyền truy cập tài khoản học tập của bạn.</p><form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}><div className="gk-auth-field"><label htmlFor="recovery-email">Email tài khoản</label><input id="recovery-email" type="email" autoComplete="email" required value={email} onChange={(e) => { setEmail(e.target.value); setSubmitted(false); }} placeholder="Nhập email của bạn" /></div><Button variant="primary" className="gk-auth-submit">Xem hướng dẫn khôi phục</Button></form>{submitted && <div role="status" className="gk-auth-notice">GK chưa hỗ trợ gửi email đặt lại mật khẩu trên bản trải nghiệm. Bạn có thể <Link to="/contact">liên hệ trung tâm</Link> để được hướng dẫn. Chưa có email nào được gửi.</div>}<div className="gk-auth-bottom"><Link to="/user/login">Quay lại đăng nhập</Link></div></section></UserAuthLayout>;
}
