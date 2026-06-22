/**
 * AuthLayout
 * Used by: SignIn, SignUp, ForgotPassword, ResetPassword, Signout
 * Structure: Centered card, no Navbar or Footer
 */
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      {/* Centered auth card — style during UI redesign */}
      <div className="auth-layout__card">
        <Outlet />
      </div>
    </div>
  );
}
