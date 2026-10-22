/**
 * AdminLayout
 * Wraps all admin pages: provides sidebar + header shell.
 * Components:
 *   AdminSidebar         — left nav panel (src/layouts/admin/AdminSidebar.jsx)
 *   AdminDashboardHeader — top bar       (src/layouts/admin/AdminDashboardHeader.jsx)
 *   DevMessage           — broadcast banner (src/shared/components/DevMessage.jsx)
 */
import { useState } from 'react';
import { Outlet, useMatches } from 'react-router-dom';
import AdminSidebar from './admin/AdminSidebar';
import AdminDashboardHeader from './admin/AdminDashboardHeader';
import ScrollToTop from '@/shared/components/ScrollToTop';
import useUnreadMessages from '@/shared/hooks/useUnreadMessages';
import usePendingCreditRequests from '@/shared/hooks/usePendingCreditRequests';

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { unreadCount: unreadMessages } = useUnreadMessages();
  const { count: pendingCreditRequests } = usePendingCreditRequests();

  // Derive a page title from the current route's pathname for the header
  const matches = useMatches();
  const lastMatch = matches[matches.length - 1];
  const rawSegment = lastMatch?.pathname?.split('/').filter(Boolean).pop() ?? 'admin';
  const pageTitle = rawSegment.charAt(0).toUpperCase() + rawSegment.slice(1).replace(/-/g, ' ');

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-950">
      <ScrollToTop />

      {/* ── Sidebar (fixed, 280 px, hidden on mobile until open) ── */}
      <AdminSidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        unreadMessages={unreadMessages}
        pendingCreditRequests={pendingCreditRequests}
      />

      {/* ── Main column — offset by sidebar width on lg+ ── */}
      <div className="flex flex-col flex-1 lg:ml-[280px] min-w-0 overflow-hidden">
        <AdminDashboardHeader
          title={pageTitle}
          menuOpen={menuOpen}
          onMenuToggle={() => setMenuOpen((o) => !o)}
          unreadMessages={unreadMessages}
        />

        {/* Scrollable page content — intentionally a <div> to avoid the global main{overflow:hidden} rule */}
        <div id="admin-scroll" className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
