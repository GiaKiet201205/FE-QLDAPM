import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/auth/AuthShell';
import { useAccountData } from '../../features/accounts/hooks/useAccountData';
import { socialExchangeRequest } from '../../services/authApi';
import { getSession } from '../../services/api';
import { readSocialFlow, SOCIAL_FLOW_KEY, socialErrorMessage } from '../../features/user/socialProof';
import { userReturnTo } from '../../features/user/authNavigation';

export default function SocialCallback() {
  const [payload] = useState(() => ({ params: new URLSearchParams(window.location.hash.slice(1)), flow: readSocialFlow() }));
  const [error, setError] = useState('');
  const exchange = useRef(null);
  const { acceptSocialSession } = useAccountData();
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    window.history.replaceState(window.history.state, '', window.location.pathname);
    const { params, flow } = payload;
    const providerError = params.get('error');
    if (providerError || !flow || !/^[A-Za-z0-9_-]{43}$/.test(params.get('code') || '')) {
      sessionStorage.removeItem(SOCIAL_FLOW_KEY);
      setError(socialErrorMessage(providerError || 'INVALID_FLOW'));
      return;
    }
    if (flow.link && getSession()?.username !== flow.username) {
      sessionStorage.removeItem(SOCIAL_FLOW_KEY);setError(socialErrorMessage('SESSION_CHANGED'));return;
    }
    // React StrictMode replays effects; redeem the one-time ticket only once.
    exchange.current ||= socialExchangeRequest(params.get('code'), flow.verifier);
    exchange.current.then((response) => {
      if (!active) return;
      acceptSocialSession(response, flow.remember);
      sessionStorage.removeItem(SOCIAL_FLOW_KEY);
      navigate(flow.link ? '/user/profile?social=linked' : userReturnTo(flow.returnTo), { replace: true });
    }).catch((err) => {
      if (active) { sessionStorage.removeItem(SOCIAL_FLOW_KEY);setError(socialErrorMessage(err.body?.code || 'INVALID_TICKET')); }
    });
    return () => { active = false; };
  }, [payload, acceptSocialSession, navigate]);
  return <AuthShell><section className="gk-auth-card"><p className="gk-auth-eyebrow">Tài khoản GK</p><h1>{error ? 'Chưa thể hoàn tất đăng nhập' : 'Đang xác thực tài khoản'}</h1>{error ? <><p role="alert" className="gk-auth-subtitle">{error}</p><div className="gk-auth-bottom"><Link to={payload.flow?.link ? '/user/profile' : '/user/login'}>Quay lại và thử lại</Link></div></> : <p role="status" className="gk-auth-subtitle">Vui lòng chờ trong giây lát...</p>}</section></AuthShell>;
}
