import { useEffect, useMemo, useState } from 'react';
import { AccountDataContext } from './hooks/useAccountData';
<<<<<<< HEAD
import { ACCOUNTS_STORAGE_KEY, authenticateAccount, createAccount, createPasswordChange, createProfileUpdate, getNextAccountCode, loadAccounts, loadSession, persistSession } from './accountStore';
import { getRoleKeyFromAccountRole } from '../../config/roles';

export default function AccountDataProvider({ children }) {
  const [accounts, setAccounts] = useState(() => loadAccounts(localStorage));
  const [session, setSession] = useState(() => loadSession(localStorage, sessionStorage));
  const currentAccount = accounts.find((account) => account.id === session?.accountId);
  const authUser = useMemo(() => {
    if (currentAccount?.status !== 'Active' || !getRoleKeyFromAccountRole(currentAccount.role)) return null;
    const { passwordCredential: _passwordCredential, ...profile } = currentAccount;
    return { ...profile, roleKey: getRoleKeyFromAccountRole(currentAccount.role) };
  }, [currentAccount]);
=======
import {
  ACCOUNTS_STORAGE_KEY,
  createAccount,
  createProfileUpdate,
  getNextAccountCode,
  loadAccounts,
} from './accountStore';
import { getRoleKeyFromAccountRole } from '../../config/roles';
import { getSession, login as backendLogin, saveSession } from '../../services/api';

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
  const [accounts, setAccounts] = useState(() => loadAccounts(localStorage));
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
>>>>>>> main

  useEffect(() => {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
<<<<<<< HEAD
    persistSession(localStorage, sessionStorage, session, authUser);
  }, [session, authUser]);

  async function login(identifier, password, remember) {
    const result = await authenticateAccount(accounts, identifier, password);
    if (!result.ok) return result;
    const { account, roleKey } = result;
    setAccounts((current) => current.map((item) => item.id === account.id
      ? { ...item, lastLogin: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) }
      : item));
    setSession({ accountId: account.id, remember });
    return { ok: true, user: account.user, roleKey };
=======
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
>>>>>>> main
  }

  function addAccount(form) {
    const result = createAccount(accounts, form);
    if (result.ok) setAccounts((current) => [result.account, ...current]);
    return result;
  }

  function toggleLock(id) {
<<<<<<< HEAD
    setAccounts((current) => current.map((account) => account.id === id
      ? { ...account, status: account.status === 'Active' ? 'Locked' : 'Active' }
      : account));
    if (id === session?.accountId) setSession(null);
  }

  function changeRole(id, role) {
    if (!getRoleKeyFromAccountRole(role)) return { ok: false, reason: 'Vai trò không hợp lệ.' };
    setAccounts((current) => current.map((account) => account.id === id ? { ...account, role } : account));
=======
    setAccounts((current) =>
      current.map((account) =>
        account.id === id
          ? { ...account, status: account.status === 'Active' ? 'Locked' : 'Active' }
          : account,
      ),
    );
    // Local mock account status is not a backend revocation or user lock.
  }

  function changeRole(id, role) {
    if (!getRoleKeyFromAccountRole(role)) {
      return { ok: false, reason: 'Vai trò không hợp lệ.' };
    }
    setAccounts((current) =>
      current.map((account) => account.id === id ? { ...account, role } : account),
    );
>>>>>>> main
    return { ok: true };
  }

  function updateProfile(form) {
<<<<<<< HEAD
    if (!authUser) return { ok: false, errors: { user: 'Phiên đăng nhập đã hết hiệu lực.' } };
    const result = createProfileUpdate(accounts, currentAccount, form);
    if (!result.ok) return result;
    setAccounts((current) => current.map((account) => account.id === authUser.id ? { ...account, ...result.profile } : account));
    return { ok: true };
  }

  async function changePassword(form) {
    if (!authUser) return { ok: false, errors: { general: 'Phiên đăng nhập đã hết hiệu lực.' } };
    const result = await createPasswordChange(currentAccount, form);
    if (!result.ok) return result;
    setAccounts((current) => current.map((account) => account.id === authUser.id
      ? { ...account, passwordCredential: result.passwordCredential }
      : account));
    return { ok: true };
  }

  return (
    <AccountDataContext.Provider value={{ accounts, authUser, login, logout: () => setSession(null), addAccount, toggleLock, changeRole, updateProfile, changePassword, nextAccountCode: getNextAccountCode(accounts) }}>
=======
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
>>>>>>> main
      {children}
    </AccountDataContext.Provider>
  );
}
