import { useEffect, useMemo, useState } from 'react';
import { AccountDataContext } from './hooks/useAccountData';
import {
  ACCOUNTS_STORAGE_KEY,
  createProfileUpdate,
  getNextAccountCode,
} from './accountStore';
import { getRoleKeyFromAccountRole } from '../../config/roles';
import { accountAdminApi, getSession, login as backendLogin, saveSession } from '../../services/api';

const ROLE_LABELS = {
  ADMIN: 'Admin',
  TEACHER: 'Teacher',
  TC: 'Teaching Coordinator',
  CM: 'Center Manager',
  SALE: 'Sale',
  CS: 'CS Specialist',
};

const USERNAME_ALIASES = {
  teacher: 'teacher001',
  tc: 'tc001',
  cm: 'cm001',
  cs: 'cs001',
};

function backendUsername(identifier, accounts) {
  const input = identifier.trim().toLowerCase();
  const known = accounts.find(
    (item) =>
      item.username?.toLowerCase() === input ||
      item.email?.toLowerCase() === input,
  );
  const username = known?.username?.toLowerCase() ?? input;
  return USERNAME_ALIASES[username] ?? username;
}

function serverAccount(item) {
  return {
    id: item.username,
    code: item.employeeCode || `BE-${item.username.toUpperCase()}`,
    user: item.fullName || item.username,
    username: item.username,
    email: item.email || '',
    role: ROLE_LABELS[item.role] || item.role,
    status: item.status === 'ACTIVE' ? 'Active' : 'Locked',
    department: '',
    phone: '',
    initials: (item.fullName || item.username).slice(0, 2).toUpperCase(),
    createdDate: item.createdAt ? String(item.createdAt).slice(0, 10) : '',
  };
}

function accountForSession(accounts, session) {
  if (!session?.token || !session.username || !ROLE_LABELS[session.role]) return null;

  const username = session.username;
  const existing = accounts.find(
    (item) => item.username?.toLowerCase() === username.toLowerCase(),
  );
  if (existing) return existing;

  // Accounts in this provider are UI profiles, not a second login authority.
  return {
    id: Math.max(0, ...accounts.map((item) => Number(item.id) || 0)) + 1,
    code: `BE-${username.toUpperCase()}`,
    user: username,
    username,
    email: '',
    initials: username.slice(0, 2).toUpperCase(),
    role: ROLE_LABELS[session.role],
    status: 'Active',
    department: '',
    phone: '',
    avatar: '',
  };
}

export default function AccountDataProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [session, setSession] = useState(() => getSession());

  // Only the backend JWT authorizes access. UI account records can never
  // authenticate users or change the effective role of a signed-in session.
  const currentAccount = useMemo(
    () => accountForSession(accounts, session),
    [accounts, session],
  );

  const authUser = useMemo(() => {
    if (!currentAccount || !session?.token) return null;
    const { passwordCredential: _passwordCredential, ...profile } = currentAccount;
    return {
      ...profile,
      status: 'Active',
      role: ROLE_LABELS[session.role],
      roleKey: session.role,
    };
  }, [currentAccount, session]);

  useEffect(() => {
    let active = true;
    if (session?.token && session.role === 'ADMIN') {
      accountAdminApi.list().then((rows) => {
        if (active) setAccounts((rows || []).map(serverAccount));
      }).catch(() => { if (active) setAccounts([]); });
    } else {
      setAccounts([]);
    }
    return () => { active = false; };
  }, [session?.token, session?.role]);

  useEffect(() => {
    function handleExpiredSession() {
      setSession(null);
    }
    window.addEventListener('qldapm:session-expired', handleExpiredSession);
    window.addEventListener('iig:unauthorized', handleExpiredSession);
    return () => {
      window.removeEventListener('qldapm:session-expired', handleExpiredSession);
      window.removeEventListener('iig:unauthorized', handleExpiredSession);
    };
  }, []);

  async function login(identifier, password, remember) {
    try {
      const response = await backendLogin(backendUsername(identifier, accounts), password);
      const role = response?.role?.toUpperCase();

      if (!response?.token || !ROLE_LABELS[role]) {
        return { ok: false, reason: 'Backend không trả về JWT hoặc vai trò hợp lệ.' };
      }

      const nextSession = {
        token: response.token,
        tokenType: response.tokenType || 'Bearer',
        username: response.username,
        role,
      };

      // Save the real JWT before any protected academic/scheduling API calls.
      saveSession(nextSession, Boolean(remember));
      setSession(nextSession);
      return {
        ok: true,
        user: accountForSession(accounts, nextSession)?.user || nextSession.username,
        roleKey: role,
      };
    } catch (error) {
      return { ok: false, reason: error?.message || 'Không thể đăng nhập vào backend.' };
    }
  }

  function logout() {
    saveSession(null);
    setSession(null);
  }

  async function addAccount(form) {
    const role = getRoleKeyFromAccountRole(form.role);
    if (!role) return { ok: false, errors: { role: 'Vai trò không hợp lệ.' } };
    try {
      const created = await accountAdminApi.create({
        username: form.username?.trim(),
        email: form.email?.trim(),
        password: form.password,
        employeeCode: form.code?.trim(),
        fullName: form.user?.trim(),
        role,
      });
      setAccounts((current) => [serverAccount(created), ...current]);
      return { ok: true, account: serverAccount(created) };
    } catch (error) {
      return { ok: false, errors: { general: error.message || 'Không thể tạo tài khoản.' } };
    }
  }

  async function toggleLock(id) {
    const account = accounts.find((item) => item.id === id);
    if (!account) return { ok: false, reason: 'Không tìm thấy tài khoản.' };
    try {
      const result = await accountAdminApi.status(account.username, account.status === 'Active' ? 'LOCKED' : 'ACTIVE');
      setAccounts((current) => current.map((item) => item.id === id ? serverAccount(result) : item));
      return { ok: true };
    } catch (error) {
      return { ok: false, reason: error.message };
    }
  }

  async function changeRole(id, role) {
    const roleKey = getRoleKeyFromAccountRole(role);
    const account = accounts.find((item) => item.id === id);
    if (!roleKey || !account) return { ok: false, reason: 'Tài khoản hoặc vai trò không hợp lệ.' };
    try {
      const result = await accountAdminApi.role(account.username, roleKey);
      setAccounts((current) => current.map((item) => item.id === id ? serverAccount(result) : item));
      return { ok: true };
    } catch (error) {
      return { ok: false, reason: error.message };
    }
  }

  function updateProfile(form) {
    if (!authUser) {
      return { ok: false, errors: { user: 'Phiên đăng nhập đã hết hiệu lực.' } };
    }
    // This updates the local presentation profile only; backend user data is not edited.
    const profileAccount = accounts.find(
      (account) => account.username?.toLowerCase() === session.username.toLowerCase(),
    ) ?? currentAccount;
    const result = createProfileUpdate(accounts, profileAccount, form);
    if (!result.ok) return result;

    const profile = { ...profileAccount, ...result.profile };
    setAccounts((current) => {
      const existing = current.find(
        (item) => item.username?.toLowerCase() === session.username.toLowerCase(),
      );
      if (existing) {
        return current.map((item) =>
          item.username?.toLowerCase() === session.username.toLowerCase()
            ? { ...item, ...result.profile }
            : item,
        );
      }
      return [...current, profile];
    });
    return { ok: true };
  }

  async function changePassword() {
    return {
      ok: false,
      errors: {
        general: 'Đổi mật khẩu trên backend chưa được triển khai. Mật khẩu hiện tại không thay đổi.',
      },
    };
  }

  return (
    <AccountDataContext.Provider
      value={{
        accounts,
        authUser,
        login,
        logout,
        addAccount,
        toggleLock,
        changeRole,
        updateProfile,
        changePassword,
        nextAccountCode: getNextAccountCode(accounts),
      }}
    >
      {children}
    </AccountDataContext.Provider>
  );
}
