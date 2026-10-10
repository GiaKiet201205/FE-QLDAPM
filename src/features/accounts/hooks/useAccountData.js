import { createContext, useContext } from 'react';

export const AccountDataContext = createContext(null);

export function useAccountData() {
  const context = useContext(AccountDataContext);
  if (!context) throw new Error('useAccountData requires AccountDataProvider');
  return context;
}
