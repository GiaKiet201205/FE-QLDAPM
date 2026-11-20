export const SOCIAL_FLOW_KEY = 'gk.social.flow.v1';
const base64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export async function createSocialProof() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const verifier = base64url(bytes);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return { verifier, challenge: base64url(new Uint8Array(digest)) };
}

export function readSocialFlow(storage = sessionStorage, now = Date.now()) {
  try {
    const flow = JSON.parse(storage.getItem(SOCIAL_FLOW_KEY));
    if (!flow || !['google', 'facebook'].includes(flow.provider)
        || !/^[A-Za-z0-9_-]{43}$/.test(flow.verifier) || !Number.isFinite(flow.createdAt)
        || now - flow.createdAt < 0 || now - flow.createdAt > 600_000) return null;
    return flow;
  } catch { return null; }
}

export function socialErrorMessage(code) {
  return ({
    EMAIL_EXISTS: 'Email này đã có tài khoản GK. Hãy đăng nhập bằng tài khoản đó, vào hồ sơ và liên kết Google/Facebook để dùng cho lần sau.',
    EMAIL_REQUIRED: 'Nhà cung cấp chưa chia sẻ email hợp lệ. Hãy cho phép quyền email hoặc chọn phương thức đăng nhập khác.',
    IDENTITY_IN_USE: 'Tài khoản mạng xã hội này đã liên kết với một tài khoản GK khác.',
    PROVIDER_ALREADY_LINKED: 'Bạn đã liên kết một tài khoản khác của nhà cung cấp này.',
    CANCELLED: 'Bạn đã hủy đăng nhập. Bạn có thể thử lại bất cứ lúc nào.',
    ACCOUNT_UNAVAILABLE: 'Tài khoản GK không thể đăng nhập hoặc đã bị khóa. Vui lòng liên hệ trung tâm.',
    SESSION_CHANGED: 'Phiên tài khoản đã thay đổi. Vui lòng đăng nhập lại rồi thực hiện liên kết.',
    INVALID_FLOW: 'Phiên xác thực đã hết hạn hoặc không hợp lệ. Vui lòng bắt đầu lại.',
    INVALID_TICKET: 'Liên kết đăng nhập đã hết hạn hoặc đã được sử dụng. Vui lòng bắt đầu lại.',
  })[code] || 'Không thể hoàn tất xác thực với nhà cung cấp. Vui lòng thử lại hoặc dùng tài khoản GK.';
}
