/**
 * UserLayout
 * Wraps all user dashboard pages: provides sidebar + header shell.
 * Components:
 *   UserSidebar          — left nav panel (src/layouts/user/UserSidebar.jsx)
 *   UserDashboardHeader  — top bar       (src/layouts/user/UserDashboardHeader.jsx)
 *   DevMessage           — broadcast banner (src/shared/components/DevMessage.jsx)
 * Public Navbar + Footer come from the parent MainLayout (not duplicated here).
 */
import { useState, useEffect } from 'react';
import { Outlet, useMatches } from 'react-router-dom';
import UserSidebar from './user/UserSidebar';
import UserDashboardHeader from './user/UserDashboardHeader';
import api from '@/shared/utils/api';
import ScrollToTop from '@/shared/components/ScrollToTop';
import { useContext } from 'react';
import { UserContext } from '@/context/UserContext';

export default function UserLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { user } = useContext(UserContext);

  // Derive page title from current route
  const matches = useMatches();
  const lastMatch = matches[matches.length - 1];
  const rawSegment = lastMatch?.pathname?.split('/').filter(Boolean).pop() ?? 'dashboard';
  const pageTitle = rawSegment.charAt(0).toUpperCase() + rawSegment.slice(1).replace(/-/g, ' ');

  // Poll unread message count (shared between header badge and sidebar badge)
  useEffect(() => {
    if (!user?._id) { setUnreadMessages(0); return; }

    let active = true;
    const fetch = async () => {
      try {
        const { data } = await api.get('/messages/unread/count');
        if (!active) return;
        const count = Number(data?.unreadCount);
        setUnreadMessages(Number.isFinite(count) && count >= 0 ? count : 0);
      } catch { if (active) setUnreadMessages(0); }
    };

    fetch();
    const id = setInterval(fetch, 30_000);
    return () => { active = false; clearInterval(id); };
  }, [user?._id]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ScrollToTop />

      {/* ── Sidebar (fixed, 280 px, hidden on mobile until open) ── */}
      <UserSidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        unreadMessages={unreadMessages}
      />

      {/* ── Main column — offset by sidebar width on lg+ ── */}
      <div className="flex flex-col flex-1 lg:ml-[280px] min-w-0 overflow-hidden">
        <UserDashboardHeader
          title={pageTitle}
          menuOpen={menuOpen}
          onMenuToggle={() => setMenuOpen((o) => !o)}
        />

        {/* Scrollable page content */}
        <div id="user-scroll" className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
