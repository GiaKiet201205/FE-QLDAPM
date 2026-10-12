import { useEffect, useMemo, useState } from 'react';
import { AccountDataContext } from './hooks/useAccountData';
import {
  ACCOUNTS_STORAGE_KEY,
  createAccount,
  createPasswordChange,
  createProfileUpdate,
  getNextAccountCode,
  loadAccounts,
  loadSession,
  persistSession,
} from './accountStore';
import { getRoleKeyFromAccountRole } from '../../config/roles';
import { loginRequest } from '../../services/authApi';
import { setAccessToken } from '../../services/api';

const ROLE_LABELS = {
  ADMIN: 'Admin',
  TEACHER: 'Teacher',
  TC: 'Teaching Coordinator',
  CM: 'Center Manager',
  SALE: 'Sale',
  CS: 'CS Specialist',
};

const BACKEND_USERNAME_ALIASES = {
  admin: 'admin',
  teacher: 'teacher001',
  tc: 'tc001',
  cm: 'cm001',
  cs: 'cs001',
};

function normalizedBackendUsername(identifier, accounts) {
  const value = identifier.trim().toLowerCase();
  const localAccount = accounts.find(
    (item) =>
      item.username?.toLowerCase() === value ||
      item.email?.toLowerCase() === value,
  );

  const localUsername = localAccount?.username?.toLowerCase() ?? value;
  return BACKEND_USERNAME_ALIASES[localUsername] ?? localUsername;
}

export default function AccountDataProvider({ children }) {
  const [accounts, setAccounts] = useState(() => loadAccounts(localStorage));
  const [session, setSession] = useState(() =>
    loadSession(localStorage, sessionStorage),
  );

  const currentAccount = accounts.find(
    (account) => account.id === session?.accountId,
  );

  const authUser = useMemo(() => {
    if (
      currentAccount?.status !== 'Active' ||
      !getRoleKeyFromAccountRole(currentAccount.role)
    ) {
      return null;
    }

    const { passwordCredential: _passwordCredential, ...profile } =
      currentAccount;

    return {
      ...profile,
      roleKey: getRoleKeyFromAccountRole(currentAccount.role),
    };
  }, [currentAccount]);

  useEffect(() => {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    persistSession(localStorage, sessionStorage, session, authUser);
  }, [session, authUser]);

  useEffect(() => {
    function handleUnauthorized() {
      setAccessToken(null);
      setSession(null);
    }

    window.addEventListener('iig:unauthorized', handleUnauthorized);
    return () =>
      window.removeEventListener('iig:unauthorized', handleUnauthorized);
  }, []);

  async function login(identifier, password, remember) {
    const normalizedIdentifier = identifier.trim();
    const backendUsername = normalizedBackendUsername(
      normalizedIdentifier,
      accounts,
    );

    let response;
    try {
      response = await loginRequest(backendUsername, password);
    } catch (error) {
      return {
        ok: false,
        reason: error?.message || 'Không thể đăng nhập vào hệ thống.',
      };
    }

    const roleKey = response?.role?.toUpperCase();
    const accountRole = ROLE_LABELS[roleKey];

    if (!response?.token) {
      return {
        ok: false,
        reason: 'Backend không trả về access token.',
      };
    }

    if (!accountRole) {
      setAccessToken(null);
      return {
        ok: false,
        reason: `Vai trò backend không được hỗ trợ: ${roleKey || 'unknown'}.`,
      };
    }

    setAccessToken(response.token);

    const responseUsername = response.username || backendUsername;
    const inputValue = normalizedIdentifier.toLowerCase();

    let account = accounts.find(
      (item) =>
        item.username?.toLowerCase() === inputValue ||
        item.email?.toLowerCase() === inputValue ||
        item.username?.toLowerCase() === responseUsername.toLowerCase(),
    );

    const lastLogin = new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
    });

    if (account) {
      const updatedAccount = {
        ...account,
        role: accountRole,
        status: 'Active',
        lastLogin,
      };

      account = updatedAccount;
      setAccounts((current) =>
        current.map((item) =>
          item.id === updatedAccount.id ? updatedAccount : item,
        ),
      );
    } else {
      account = {
        id: Math.max(0, ...accounts.map((item) => item.id)) + 1,
        code: `BE-${responseUsername.toUpperCase()}`,
        user: responseUsername,
        initials: responseUsername.slice(0, 2).toUpperCase(),
        role: accountRole,
        status: 'Active',
        lastLogin,
        username: responseUsername,
        email: '',
        department: '',
        createdDate: new Date().toISOString().slice(0, 10),
        mfaStatus: 'Disabled',
        passwordPolicy: 'Standard',
        ipAddress: '-',
      };

      setAccounts((current) => [...current, account]);
    }

    setSession({
      accountId: account.id,
      remember,
    });

    return {
      ok: true,
      user: account.user,
      roleKey,
    };
  }

  function logout() {
    setAccessToken(null);
    setSession(null);
  }

  function addAccount(form) {
    const result = createAccount(accounts, form);
    if (result.ok) {
      setAccounts((current) => [result.account, ...current]);
    }
    return result;
  }

  function toggleLock(id) {
    setAccounts((current) =>
      current.map((account) =>
        account.id === id
          ? {
              ...account,
              status: account.status === 'Active' ? 'Locked' : 'Active',
            }
          : account,
      ),
    );

    if (id === session?.accountId) {
      logout();
    }
  }

  function changeRole(id, role) {
    if (!getRoleKeyFromAccountRole(role)) {
      return {
        ok: false,
        reason: 'Vai trò không hợp lệ.',
      };
    }

    setAccounts((current) =>
      current.map((account) =>
        account.id === id ? { ...account, role } : account,
      ),
    );

    return { ok: true };
  }

  function updateProfile(form) {
    if (!authUser) {
      return {
        ok: false,
        errors: {
          user: 'Phiên đăng nhập đã hết hiệu lực.',
        },
      };
    }

    const result = createProfileUpdate(accounts, currentAccount, form);
    if (!result.ok) {
      return result;
    }

    setAccounts((current) =>
      current.map((account) =>
        account.id === authUser.id
          ? { ...account, ...result.profile }
          : account,
      ),
    );

    return { ok: true };
  }

  async function changePassword(form) {
    if (!authUser) {
      return {
        ok: false,
        errors: {
          general: 'Phiên đăng nhập đã hết hiệu lực.',
        },
      };
    }

    const result = await createPasswordChange(currentAccount, form);
    if (!result.ok) {
      return result;
    }

    setAccounts((current) =>
      current.map((account) =>
        account.id === authUser.id
          ? {
              ...account,
              passwordCredential: result.passwordCredential,
            }
          : account,
      ),
    );

    return { ok: true };
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
