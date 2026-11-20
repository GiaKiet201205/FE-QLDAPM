import { socialStartRequest } from '../../services/authApi';
import { getSession } from '../../services/api';
import { createSocialProof, SOCIAL_FLOW_KEY } from './socialProof';
import { userReturnTo } from './authNavigation';

export async function beginSocialLogin(provider, { remember = false, returnTo, link = false } = {}) {
  if (!['google', 'facebook'].includes(provider)) throw new Error('Nhà cung cấp không hợp lệ.');
  const { verifier, challenge } = await createSocialProof();
  const account = getSession();
  if (link && account?.role !== 'USER') throw new Error('Vui lòng đăng nhập tài khoản học viên để liên kết.');
  const flow = { provider, verifier, createdAt: Date.now(), remember, returnTo: userReturnTo(returnTo), link,
    username: link ? account.username : null };
  // Keep the proof in this tab only. No password, provider token or JWT goes in the redirect URL.
  sessionStorage.setItem(SOCIAL_FLOW_KEY, JSON.stringify(flow));
  try {
    const result = await socialStartRequest(provider, challenge, link);
    if (!new RegExp(`^/api/oauth2/authorization/${provider}[?]flow=[A-Za-z0-9_-]{43}$`).test(result.authorizationUrl)) {
      throw new Error('Không thể bắt đầu xác thực. Vui lòng thử lại.');
    }
    const api = new URL(import.meta.env.VITE_API_URL || '/api', window.location.origin);
    window.location.assign(new URL(result.authorizationUrl, api.origin).href);
  } catch (error) {
    sessionStorage.removeItem(SOCIAL_FLOW_KEY);
    throw error;
  }
}
