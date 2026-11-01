/**
 * AuthLayout
 * Used by: SignIn, SignUp, ForgotPassword, ResetPassword, Signout
 * Structure: Centered card, no Navbar or Footer
 */
import { Outlet } from 'react-router-dom';
import RouteSEO from '@/shared/components/SEO/RouteSEO';

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <RouteSEO />
      {/* Centered auth card — style during UI redesign */}
      <div className="auth-layout__card">
        <Outlet />
      </div>
    </div>
  );
}
