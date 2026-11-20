import { Navigate, useLocation } from 'react-router-dom';
import { useAccountData } from '../../features/accounts/hooks/useAccountData';
import { userReturnTo } from '../../features/user/authNavigation';
import AuthShell from '../auth/AuthShell';

export default function UserAuthLayout({ children }) {
  const { authUser } = useAccountData();
  const location = useLocation();
  if (authUser) return <Navigate replace to={userReturnTo(location.state?.returnTo)} />;
  return <AuthShell>{children}</AuthShell>;
}
