import { useRef, useEffect } from 'react';
import { X, UserPlus, MessageSquare, TrendingUp, Bell, CheckCheck, Star, PartyPopper } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TYPE_META = {
  welcome:            { icon: PartyPopper,    color: 'text-pink-400',    bg: 'bg-pink-400/10'    },
  new_signup:         { icon: UserPlus,       color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  new_comment:        { icon: MessageSquare,  color: 'text-blue-400',    bg: 'bg-blue-400/10'    },
  new_review:         { icon: Star,           color: 'text-amber-400',   bg: 'bg-amber-400/10'   },
  browse_peak:        { icon: TrendingUp,     color: 'text-pink-400',    bg: 'bg-pink-400/10'    },
  message:            { icon: MessageSquare,  color: 'text-violet-400',  bg: 'bg-violet-400/10'  },
  new_message:        { icon: MessageSquare,  color: 'text-violet-400',  bg: 'bg-violet-400/10'  },
  promo_approved:     { icon: TrendingUp,     color: 'text-amber-400',   bg: 'bg-amber-400/10'   },
  promo_expiring:     { icon: TrendingUp,     color: 'text-orange-400',  bg: 'bg-orange-400/10'  },
  account_restricted: { icon: Bell,           color: 'text-red-400',     bg: 'bg-red-400/10'     },
};

function NotificationItem({ n, onRead, onItemClick }) {
  const meta  = TYPE_META[n.type] || { icon: Bell, color: 'text-neutral-400', bg: 'bg-neutral-400/10' };
  const Icon  = meta.icon;
  const timeAgo = n.createdAt
    ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
    : '';

  const handleClick = () => {
    if (onItemClick) { onItemClick(n); return; }
    if (!n.read) onRead(n._id);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-neutral-800/60 ${
        n.read ? 'opacity-60' : ''
      }`}
    >
      <span className={`mt-0.5 shrink-0 h-8 w-8 rounded-xl flex items-center justify-center ${meta.bg}`}>
        <Icon size={15} className={meta.color} />
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${n.read ? 'text-neutral-400' : 'text-white'}`}>
          {n.title}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5 leading-snug">{n.message}</p>
        <p className="text-xs text-neutral-600 mt-1">{timeAgo}</p>
      </div>
      {!n.read && (
        <span className="mt-2 shrink-0 h-2 w-2 rounded-full bg-pink-500" />
      )}
    </button>
  );
}

/**
 * NotificationModal — shared dropdown for both admin and user bells.
 * Props:
 *   open, onClose, notifications, unreadCount, loading, markAllRead, markOneRead,
 *   title (string), viewAllHref (string)
 */
export default function NotificationModal({
  open,
  onClose,
  notifications,
  unreadCount,
  loading,
  markAllRead,
  markOneRead,
  onItemClick,
  title = 'Notifications',
  viewAllHref,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 z-50 w-[calc(100vw-2rem)] max-w-80 sm:max-w-96 rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl shadow-black/40 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-pink-400" />
          <span className="text-sm font-semibold text-white">{title}</span>
          {unreadCount > 0 && (
            <span className="text-xs font-bold bg-pink-500 text-white rounded-full px-1.5 py-0.5 leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-neutral-800"
            >
              <CheckCheck size={12} />
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-neutral-800/50">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-6 w-6 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-neutral-500">
            <Bell size={28} className="opacity-30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n._id} n={n} onRead={markOneRead} onItemClick={onItemClick} />
          ))
        )}
      </div>

      {/* Footer */}
      {viewAllHref && (
        <div className="border-t border-neutral-800 px-4 py-2.5">
          <a
            href={viewAllHref}
            onClick={onClose}
            className="block text-center text-xs text-pink-400 hover:text-pink-300 transition-colors"
          >
            View all notifications
          </a>
        </div>
      )}
    </div>
  );
}
