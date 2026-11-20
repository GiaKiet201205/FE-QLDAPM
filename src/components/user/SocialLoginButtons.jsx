import { useEffect, useRef, useState } from 'react';
import { socialProvidersRequest } from '../../services/authApi';
import { beginSocialLogin } from '../../features/user/socialAuth';

export function ProviderIcon({ provider }) {
  return provider === 'google' ? <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.5-.2-2.2H12v4.3h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.7 2.9-4.3 2.9-7.6Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.1H3v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3a10 10 0 0 0 0 9l3.4-2.6Z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.6 9.6 0 0 0 12 2a10 10 0 0 0-9 5.5l3.4 2.6A6 6 0 0 1 12 6Z"/></svg> : <span className="gk-facebook-mark" aria-hidden="true">f</span>;
}

export default function SocialLoginButtons({ remember = false, returnTo, disabled = false }) {
  const [providers, setProviders] = useState(null);
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const busy = useRef(false);
  useEffect(() => {
    let active = true;
    socialProvidersRequest().then((data) => { if (active) setProviders(data); })
      .catch(() => { if (active) { setProviders({}); setError('Đăng nhập nhanh tạm thời chưa sẵn sàng.'); } });
    return () => { active = false; };
  }, [retry]);
  useEffect(() => {
    const reset = (event) => { if (event.persisted) { busy.current = false; setPending(''); } };
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);
  async function start(provider) {
    if (busy.current || disabled) return;
    busy.current = true; setPending(provider); setError('');
    try { await beginSocialLogin(provider, { remember, returnTo }); }
    catch (err) { setError(err.message || 'Không thể mở đăng nhập mạng xã hội.'); busy.current = false; setPending(''); }
  }
  return <div className="gk-social-login"><div className="gk-social-buttons">{['google','facebook'].map((provider) => <button key={provider} type="button" disabled={disabled || Boolean(pending) || !providers?.[provider]} onClick={() => start(provider)}><ProviderIcon provider={provider} /><span>{pending === provider ? 'Đang chuyển...' : `Tiếp tục với ${provider === 'google' ? 'Google' : 'Facebook'}`}</span></button>)}</div>
    {providers && !providers.google && !providers.facebook && !error && <p className="gk-social-note">Đăng nhập Google/Facebook sẽ được mở khi trung tâm hoàn tất cấu hình.</p>}
    {error && <div className="gk-social-error" role="alert"><p>{error}</p><button type="button" onClick={() => { setError(''); setProviders(null); setRetry((n) => n + 1); }}>Thử lại</button></div>}
    <div className="gk-social-divider"><span>Hoặc dùng tài khoản GK</span></div>
  </div>;
}
