import { mockAccounts } from '../../data/mockAccounts.js';
import { getRoleKeyFromAccountRole } from '../../config/roles.js';

export const ACCOUNTS_STORAGE_KEY = 'iig.accounts.v1';
export const SESSION_STORAGE_KEY = 'iig.session.v1';

export function readJson(storage, key, fallback) {
  try {
    return JSON.parse(storage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

export function loadAccounts(storage) {
  const saved = readJson(storage, ACCOUNTS_STORAGE_KEY, null);
  return Array.isArray(saved) && saved.length > 0 && saved.every((account) =>
    account && Number.isInteger(account.id) && account.id > 0 &&
    ['code', 'user', 'username', 'email', 'role', 'status'].every((key) => typeof account[key] === 'string') &&
    getRoleKeyFromAccountRole(account.role) && ['Active', 'Locked'].includes(account.status)
  ) ? saved : mockAccounts;
}

export function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length > 1
    ? `${parts[0][0]}${parts.at(-1)[0]}`.toUpperCase()
    : (parts[0] ?? '').slice(0, 2).toUpperCase();
}

export function getNextAccountCode(accounts) {
  const used = new Set(accounts.map((account) => account.code.toLowerCase()));
  let number = Math.max(1000, ...accounts.map((account) => {
    const match = /^ACC-(\d+)$/i.exec(account.code);
    return match ? Number(match[1]) : 1000;
  })) + 1;
  while (used.has(`acc-${number}`)) number += 1;
  return `ACC-${number}`;
}

export function validateAccount(accounts, form, excludedId) {
  const errors = {};
  const fields = { code: 'Mã tài khoản', user: 'Họ tên', username: 'Tên đăng nhập' };
  for (const [key, label] of Object.entries(fields)) {
    if (!form[key]?.trim()) errors[key] = `${label} không được để trống.`;
  }
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Email không hợp lệ.';
  }
  if (!getRoleKeyFromAccountRole(form.role)) errors.role = 'Vai trò không hợp lệ.';
  for (const key of ['code', 'username', 'email']) {
    const value = form[key]?.trim().toLowerCase();
    if (value && accounts.some((account) => account.id !== excludedId && account[key]?.trim().toLowerCase() === value)) {
      errors[key] = `${key === 'code' ? 'Mã tài khoản' : key === 'username' ? 'Tên đăng nhập' : 'Email'} đã tồn tại.`;
    }
  }
  for (const key of ['username', 'email']) {
    const otherKey = key === 'username' ? 'email' : 'username';
    const value = form[key]?.trim().toLowerCase();
    if (value && accounts.some((account) => account.id !== excludedId && account[otherKey]?.trim().toLowerCase() === value)) {
      errors[key] = 'Thông tin đăng nhập này đã được tài khoản khác sử dụng.';
    }
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

export async function authenticateAccount(accounts, identifier, password) {
  const value = identifier.trim().toLowerCase();
  const account = accounts.find((item) => item.username.toLowerCase() === value || item.email.toLowerCase() === value);
  if (!account) return { ok: false, reason: 'Tài khoản không tồn tại!' };
  if (account.status !== 'Active') return { ok: false, reason: 'Tài khoản hiện đang bị khóa!' };
  if (!(await verifyAccountPassword(account, password))) return { ok: false, reason: 'Mật khẩu không chính xác!' };
  const roleKey = getRoleKeyFromAccountRole(account.role);
  if (!roleKey) return { ok: false, reason: 'Vai trò của tài khoản không hợp lệ!' };
  return { ok: true, account, roleKey };
}

async function passwordDigest(password, salt) {
  const key = await globalThis.crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await globalThis.crypto.subtle.deriveBits({
    name: 'PBKDF2', salt: Uint8Array.from(salt), iterations: 100000, hash: 'SHA-256',
  }, key, 256);
  return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function verifyAccountPassword(account, password) {
  if (!account.passwordCredential) return password === '123456';
  const { salt, digest } = account.passwordCredential;
  return await passwordDigest(password, salt) === digest;
}

export async function createPasswordChange(account, form) {
  const errors = {};
  if (!form.currentPassword) errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';
  else if (!(await verifyAccountPassword(account, form.currentPassword))) errors.currentPassword = 'Mật khẩu hiện tại không chính xác.';
  if (!form.newPassword || form.newPassword.length < 6 || !form.newPassword.trim()) {
    errors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
  } else if (form.newPassword === form.currentPassword) {
    errors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại.';
  }
  if (!form.confirmPassword) errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.';
  else if (form.confirmPassword !== form.newPassword) errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
  if (Object.keys(errors).length) return { ok: false, errors };
  const salt = Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)));
  return { ok: true, passwordCredential: { salt, digest: await passwordDigest(form.newPassword, salt) } };
}

export function createProfileUpdate(accounts, account, form) {
  const validation = validateAccount(accounts, { ...account, ...form }, account.id);
  const phone = (form.phone ?? '').trim();
  if (phone && (!/^\+?[\d\s().-]+$/.test(phone) || !/^\d{9,15}$/.test(phone.replace(/\D/g, '')))) {
    validation.errors.phone = 'Số điện thoại phải có từ 9 đến 15 chữ số.';
  }
  if (Object.keys(validation.errors).length) return { ok: false, errors: validation.errors };
  return {
    ok: true,
    profile: {
      user: form.user.trim().replace(/\s+/g, ' '), email: form.email.trim(), phone,
      avatar: (form.avatar ?? '').trim(), initials: getInitials(form.user),
    },
  };
}

export function loadSession(local, temporary) {
  const saved = readJson(local, SESSION_STORAGE_KEY, null) ?? readJson(temporary, SESSION_STORAGE_KEY, null);
  if (saved && Number.isInteger(saved.accountId) && typeof saved.remember === 'boolean') return saved;
  const legacyUser = readJson(local, 'authUser', null);
  return local.getItem('accessToken') && Number.isInteger(legacyUser?.id)
    ? { accountId: legacyUser.id, remember: true }
    : null;
}

export function persistSession(local, temporary, session, authUser) {
  for (const storage of [local, temporary]) {
    storage.removeItem(SESSION_STORAGE_KEY);
    for (const key of ['accessToken', 'userRole', 'authUser']) storage.removeItem(key);
  }
  if (!authUser || !session) return;
  const storage = session.remember ? local : temporary;
  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  storage.setItem('accessToken', `mock_token_${authUser.id}`);
  storage.setItem('userRole', authUser.roleKey);
  storage.setItem('authUser', JSON.stringify(authUser));
}

export function createAccount(accounts, form) {
  const validation = validateAccount(accounts, form);
  if (!validation.ok) return validation;
  const account = {
    code: form.code.trim(),
    user: form.user.trim().replace(/\s+/g, ' '),
    username: form.username.trim(),
    email: form.email.trim(),
    role: form.role,
    department: form.department,
    passwordPolicy: form.passwordPolicy,
    mfaStatus: form.mfaStatus,
    id: Math.max(0, ...accounts.map((item) => item.id)) + 1,
    initials: getInitials(form.user),
    status: 'Active',
    lastLogin: 'Chưa đăng nhập',
    createdDate: new Date().toISOString().split('T')[0],
    ipAddress: '-',
  };
  return { ok: true, account };
}
