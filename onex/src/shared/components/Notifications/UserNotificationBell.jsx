import { useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useNotifications from '@/shared/hooks/useNotifications';
import NotificationModal from '@/shared/components/Notifications/NotificationModal';

/**
 * Drop-in bell button + modal for the user dashboard header.
 * @param {string} viewAllHref  - path to the full notifications page
 * @param {string} messagesPath - path to the messages page (for click-through)
 */
export default function UserNotificationBell({
  viewAllHref = '/user/notifications',
  messagesPath = '/user/messages',
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const { notifications, unreadCount, loading, markAllRead, markOneRead } =
    useNotifications('user');

  const handleItemClick = (n) => {
    if (!n.read) markOneRead(n._id);
    // Navigate to the conversation if meta includes one, else go to messages
    if (n.type === 'message' || n.type === 'new_message') {
      setOpen(false);
      const dest = n.meta?.conversationId
        ? `${messagesPath}?conv=${n.meta.conversationId}`
        : messagesPath;
      navigate(dest);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          const opening = !open;
          setOpen(opening);
          if (opening && unreadCount > 0) markAllRead();
        }}
        className="relative h-9 w-9 flex items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-0.5 flex items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      <NotificationModal
        open={open}
        onClose={() => setOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loading}
        markAllRead={markAllRead}
        markOneRead={markOneRead}
        onItemClick={handleItemClick}
        title="Notifications"
        viewAllHref={viewAllHref}
      />
    </div>
  );
}
