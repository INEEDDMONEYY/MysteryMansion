/**
 * NotFoundPage
 * Rendered for any route that doesn't match — the catch-all "*" route.
 * Wraps the NotFound component; no layout wrapper needed (MainLayout handles Navbar/Footer).
 */
import NotFound from '@/shared/components/NotFound';

export default function NotFoundPage() {
  return <NotFound />;
}
