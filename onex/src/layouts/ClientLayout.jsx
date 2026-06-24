import { useState, useEffect } from 'react';
import { Outlet, useMatches } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '@/context/UserContext';
import ClientSidebar from './client/ClientSidebar';
import ClientDashboardHeader from './client/ClientDashboardHeader';
import ScrollToTop from '@/shared/components/ScrollToTop';
import api from '@/shared/utils/api';

export default function ClientLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { user } = useContext(UserContext);

  const matches = useMatches();
  const lastMatch = matches[matches.length - 1];
  const rawSegment = lastMatch?.pathname?.split('/').filter(Boolean).pop() ?? 'dashboard';
  const pageTitle = rawSegment.charAt(0).toUpperCase() + rawSegment.slice(1).replace(/-/g, ' ');

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
    <div className="flex h-screen overflow-hidden bg-purple-50/30">
      <ScrollToTop />

      <ClientSidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        unreadMessages={unreadMessages}
      />

      <div className="flex flex-col flex-1 lg:ml-[280px] min-w-0 overflow-hidden">
        <ClientDashboardHeader
          title={pageTitle}
          menuOpen={menuOpen}
          onMenuToggle={() => setMenuOpen((o) => !o)}
        />

        <div id="client-scroll" className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
