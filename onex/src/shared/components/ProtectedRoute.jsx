import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute — two usage patterns:
 *
 * 1. Wrapper (old style):
 *    <ProtectedRoute role="user"><MyPage /></ProtectedRoute>
 *
 * 2. Layout route (React Router v6 nested routes, no children):
 *    { element: <ProtectedRoute role="admin" />, children: [...] }
 *    → renders <Outlet /> when authenticated
 */
export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token) return <Navigate to="/signin" replace />;

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children ?? <Outlet />;
}
