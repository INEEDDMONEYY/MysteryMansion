import { Bell, MessageSquare, TrendingUp, CheckCheck, RefreshCw, Star, PartyPopper, UserPlus, Eye, Coins, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useNotifications from '@/shared/hooks/useNotifications';

const TYPE_META = {
  welcome:            { icon: PartyPopper,    color: 'text-pink-400',    bg: 'bg-pink-400/10',    label: 'Welcome'         },
  new_comment:        { icon: MessageSquare,  color: 'text-blue-400',    bg: 'bg-blue-400/10',    label: 'New Comment'     },
  new_review:         { icon: Star,           color: 'text-amber-400',   bg: 'bg-amber-400/10',   label: 'New Review'      },
  message:            { icon: MessageSquare,  color: 'text-violet-400',  bg: 'bg-violet-400/10',  label: 'New Message'     },
  new_message:        { icon: MessageSquare,  color: 'text-violet-400',  bg: 'bg-violet-400/10',  label: 'New Message'     },
  promo_approved:     { icon: TrendingUp,     color: 'text-amber-400',   bg: 'bg-amber-400/10',   label: 'Promo Approved'  },
  promo_expiring:     { icon: TrendingUp,     color: 'text-orange-400',  bg: 'bg-orange-400/10',  label: 'Promo Expiring'  },
  account_restricted: { icon: Bell,           color: 'text-red-400',     bg: 'bg-red-400/10',     label: 'Account Update'  },
  new_signup:         { icon: UserPlus,       color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'New Signup'      },
  profile_visited:    { icon: Eye,            color: 'text-sky-400',     bg: 'bg-sky-400/10',     label: 'Profile Visit'   },
  low_credits:        { icon: Coins,          color: 'text-orange-400',  bg: 'bg-orange-400/10',  label: 'Low Credits'     },
  post_liked:         { icon: Heart,          color: 'text-pink-400',    bg: 'bg-pink-400/10',    label: 'Post Liked'      },
};

export default function UserNotificationsPage() {
  const { notifications, unreadCount, loading, refresh, markAllRead, markOneRead } =
    useNotifications('user');

  return (
    <div className="space-y-5 pb-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
          <p className="text-sm text-neutral-400 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-sm text-neutral-300 hover:text-white transition-colors bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
          <button
            onClick={refresh}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl divide-y divide-neutral-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-7 w-7 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-neutral-500">
            <Bell size={36} className="opacity-20" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => {
            const meta = TYPE_META[n.type] || { icon: Bell, color: 'text-neutral-400', bg: 'bg-neutral-400/10', label: n.type };
            const Icon = meta.icon;
            return (
              <button
                key={n._id}
                onClick={() => !n.read && markOneRead(n._id)}
                className={`w-full text-left flex items-start gap-4 px-5 py-4 hover:bg-neutral-800/40 transition-colors ${n.read ? 'opacity-60' : ''}`}
              >
                <span className={`mt-0.5 shrink-0 h-10 w-10 rounded-2xl flex items-center justify-center ${meta.bg}`}>
                  <Icon size={18} className={meta.color} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${n.read ? 'text-neutral-400' : 'text-white'}`}>
                      {n.title}
                    </p>
                    <span className="text-xs text-neutral-600 shrink-0 mt-0.5">
                      {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-400 mt-0.5">{n.message}</p>
                  <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                    {meta.label}
                  </span>
                </div>
                {!n.read && (
                  <span className="mt-2 shrink-0 h-2 w-2 rounded-full bg-pink-500" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
