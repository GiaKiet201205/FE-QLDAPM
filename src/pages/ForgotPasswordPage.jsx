import AuthShell from '../components/auth/AuthShell';
import { LoginForm } from '../components/auth/LoginForm';

export default function ForgotPasswordPage() {
  return <AuthShell staff><LoginForm mode="reset" /></AuthShell>;
}
