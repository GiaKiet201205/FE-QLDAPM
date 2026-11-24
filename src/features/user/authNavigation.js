export function userReturnTo(requested) {
  if (typeof requested !== 'string') return '/user/profile';
  return (/^\/user\/profile(?:\?payment=gk-[a-zA-Z0-9-]+)?$/.test(requested) || /^\/checkout\/[a-z0-9-]+(?:\?class=[a-zA-Z0-9-]+)?$/.test(requested))
    ? requested : '/user/profile';
}

// Các cổng local dùng địa chỉ khác nhau; không truyền thông tin đăng nhập qua URL.
export function managementLoginUrl(origin, configuredUrl = '') {
  try {
    const current = new URL(origin);
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(current.hostname);
    if (!configuredUrl && !local) return null;
    const target = configuredUrl ? new URL(configuredUrl) : new URL('/login', current);
    if (!['http:', 'https:'].includes(target.protocol)) return null;
    if (!configuredUrl) target.port = '5174';
    return target.href;
  } catch {
    return null;
  }
}
