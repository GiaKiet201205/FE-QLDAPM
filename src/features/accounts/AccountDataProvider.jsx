import { useEffect, useMemo, useState } from 'react';
import { AccountDataContext } from './hooks/useAccountData';
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

  useEffect(() => {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
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
  }

  function addAccount(form) {
    const result = createAccount(accounts, form);
    if (result.ok) setAccounts((current) => [result.account, ...current]);
    return result;
  }

  function toggleLock(id) {
    setAccounts((current) => current.map((account) => account.id === id
      ? { ...account, status: account.status === 'Active' ? 'Locked' : 'Active' }
      : account));
    if (id === session?.accountId) setSession(null);
  }

  function changeRole(id, role) {
    if (!getRoleKeyFromAccountRole(role)) return { ok: false, reason: 'Vai trò không hợp lệ.' };
    setAccounts((current) => current.map((account) => account.id === id ? { ...account, role } : account));
    return { ok: true };
  }

  function updateProfile(form) {
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
      {children}
    </AccountDataContext.Provider>
  );
}
