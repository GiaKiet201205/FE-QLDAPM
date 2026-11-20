import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { socialConnectionsRequest, socialProvidersRequest } from '../../services/authApi';
import { beginSocialLogin } from '../../features/user/socialAuth';
import { isSessionRemembered } from '../../services/api';
import { ProviderIcon } from './SocialLoginButtons';

export default function SocialConnections() {
  const [state, setState] = useState(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState('');
  const [retry, setRetry] = useState(0);
  const [params] = useSearchParams();
  const busy = useRef(false);
  useEffect(() => {
    let active = true;
    Promise.all([socialProvidersRequest(), socialConnectionsRequest()]).then(([providers, connections]) => {
      if (active) setState({ providers, connections });
    }).catch(() => { if (active) setError('Chưa thể tải các tài khoản liên kết.'); });
    return () => { active = false; };
  }, [retry]);
  useEffect(() => {
    const reset = (event) => { if (event.persisted) { busy.current = false; setPending(''); } };
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);
  async function link(provider) {
    if (busy.current) return;
    busy.current = true;setPending(provider);setError('');
    try { await beginSocialLogin(provider, { link: true, remember: isSessionRemembered() }); }
    catch (err) { setError(err.message || 'Chưa thể liên kết tài khoản.'); setPending('');busy.current = false; }
  }
  return <section className="gk-social-connections"><h2>Đăng nhập nhanh</h2><p>Liên kết Google hoặc Facebook để lần sau tiếp tục với tài khoản GK này mà không cần nhập mật khẩu GK.</p>{params.get('social') === 'linked' && state?.connections.length > 0 && <p className="gk-social-success" role="status">Đã liên kết tài khoản thành công.</p>}
    <div className="gk-social-connection-list">{['google','facebook'].map((provider) => {
      const connection = state?.connections.find((item) => item.provider === provider);
      return <div className="gk-social-connection" key={provider}><ProviderIcon provider={provider} /><div><strong>{provider === 'google' ? 'Google' : 'Facebook'}</strong><span>{connection ? connection.email || 'Đã liên kết' : 'Chưa liên kết'}</span></div>{connection ? <span className="gk-social-connected">Đã liên kết</span> : <button type="button" disabled={!state?.providers[provider] || Boolean(pending)} onClick={() => link(provider)}>{pending === provider ? 'Đang chuyển...' : 'Liên kết'}</button>}</div>;
    })}</div>{state && !state.providers.google && !state.providers.facebook && <p className="gk-social-note">Trung tâm chưa mở đăng nhập Google/Facebook.</p>}{error && <div className="gk-social-error" role="alert"><p>{error}</p><button type="button" onClick={() => { setError('');setRetry((n) => n + 1); }}>Thử lại</button></div>}
  </section>;
}
