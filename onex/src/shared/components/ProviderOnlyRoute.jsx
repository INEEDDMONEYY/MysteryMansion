import { Navigate } from 'react-router-dom';

/**
 * ProviderOnlyRoute — blocks access for client accounts.
 * Redirects unauthenticated users to /signin and clients to /.
 */
export default function ProviderOnlyRoute({ children }) {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token) return <Navigate to="/signin" replace />;
  if (user?.accountType === 'client') return <Navigate to="/" replace />;

  return children;
}
