/**
 * App.jsx — legacy entry point, no longer used as a route.
 * Routing is handled in main.jsx via createBrowserRouter with layout routes.
 * This file can be removed or repurposed during the redesign.
 */
import { Navigate } from 'react-router-dom';

export default function App() {
  return <Navigate to="/" replace />;
}
