import { Bell, MessageSquare, TrendingUp, CheckCheck, RefreshCw, Star, PartyPopper, UserPlus, Eye, Coins, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useNotifications from '@/shared/hooks/useNotifications';
import { setSEO } from '@/shared/utils/seo';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TYPE_META = {
  welcome:            { icon: PartyPopper,    color: 'text-pink-600',    bg: 'bg-pink-100',    label: 'Welcome'         },
  new_comment:        { icon: MessageSquare,  color: 'text-blue-600',    bg: 'bg-blue-100',    label: 'New Comment'     },
  new_review:         { icon: Star,           color: 'text-amber-600',   bg: 'bg-amber-100',   label: 'New Review'      },
  message:            { icon: MessageSquare,  color: 'text-blue-700',    bg: 'bg-blue-100',    label: 'New Message'     },
  new_message:        { icon: MessageSquare,  color: 'text-blue-700',    bg: 'bg-blue-100',    label: 'New Message'     },
  promo_approved:     { icon: TrendingUp,     color: 'text-amber-600',   bg: 'bg-amber-100',   label: 'Promo Approved'  },
  promo_expiring:     { icon: TrendingUp,     color: 'text-orange-600',  bg: 'bg-orange-100',  label: 'Promo Expiring'  },
  account_restricted: { icon: Bell,           color: 'text-red-600',     bg: 'bg-red-100',     label: 'Account Update'  },
  new_signup:         { icon: UserPlus,       color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'New Signup'      },
  profile_visited:    { icon: Eye,            color: 'text-sky-600',     bg: 'bg-sky-100',     label: 'Profile Visit'   },
  low_credits:        { icon: Coins,          color: 'text-orange-600',  bg: 'bg-orange-100',  label: 'Low Credits'     },
  post_liked:         { icon: Heart,          color: 'text-rose-600',    bg: 'bg-rose-100',    label: 'Post Liked'      },
};

export default function ClientNotificationsPage() {
  const { notifications, unreadCount, loading, refresh, markAllRead, markOneRead } =
    useNotifications('user');
  const navigate = useNavigate();

  useEffect(() => {
    setSEO('Notifications | Mystery Mansion', '', { robots: 'noindex, nofollow' });
  }, []);

  const handleItemClick = (n) => {
    if (!n.read) markOneRead(n._id);
    switch (n.type) {
      case 'message':
      case 'new_message':
        navigate(n.meta?.conversationId
          ? `/client/messages?conv=${n.meta.conversationId}`
          : '/client/messages');
        break;
      case 'post_liked':
        if (n.meta?.postId) navigate(`/posts/${n.meta.postId}`);
        break;
      case 'low_credits':
        navigate('/client/credits');
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-5 pb-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Notifications</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors bg-white border border-slate-200 rounded-xl px-3 py-2"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
          <button
            onClick={refresh}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-700 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-7 w-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <Bell size={36} className="opacity-20" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => {
            const meta = TYPE_META[n.type] || { icon: Bell, color: 'text-slate-500', bg: 'bg-slate-100', label: n.type };
            const Icon = meta.icon;
            return (
              <button
                key={n._id}
                onClick={() => handleItemClick(n)}
                className={`w-full text-left flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors ${n.read ? 'opacity-60' : ''}`}
              >
                <span className={`mt-0.5 shrink-0 h-10 w-10 rounded-2xl flex items-center justify-center ${meta.bg}`}>
                  <Icon size={18} className={meta.color} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${n.read ? 'text-slate-400' : 'text-slate-900'}`}>
                      {n.title}
                    </p>
                    <span className="text-xs text-slate-400 shrink-0 mt-0.5">
                      {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
                  <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full ${meta.bg} ${meta.color} font-medium`}>
                    {meta.label}
                  </span>
                </div>
                {!n.read && (
                  <span className="mt-2 shrink-0 h-2 w-2 rounded-full bg-blue-600" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
