import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';
import {
  Heart, MessageSquareText, CalendarDays, Search,
  Sparkles, BadgeCheck, ArrowRight, Coins,
} from 'lucide-react';
import { UserContext } from '@/context/UserContext';
import api from '@/shared/utils/api';
import { setSEO } from '@/shared/utils/seo';

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatJoinDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatAccountAge(iso) {
  if (!iso) return '—';
  const days = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (days < 1)  return 'Today';
  if (days < 2)  return '1 day';
  if (days < 30) return `${days} days`;
  const months = Math.floor(days / 30.44);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'}`;
  const years = Math.floor(months / 12);
  const rem   = months % 12;
  return rem === 0 ? `${years} year${years === 1 ? '' : 's'}` : `${years}y ${rem}m`;
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, gradient, suffix = '' }) {
  return (
    <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${gradient} shadow-md`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-none">
          <CountUp end={value} duration={1.4} separator="," suffix={suffix} />
        </p>
      </div>
    </div>
  );
}

// ── Recent liked post row ─────────────────────────────────────────────────────
function LikedRow({ post }) {
  const thumb = post.pictures?.[0] ?? null;
  const badge = post.badgeType || post.userId?.badgeType || '';
  return (
    <Link
      to={`/posts/${post._id}`}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-colors group"
    >
      <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        {thumb
          ? <img src={thumb} alt={post.title} className="h-full w-full object-cover" />
          : <div className="h-full w-full flex items-center justify-center text-gray-300 text-xl">📷</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
          {post.title || 'Untitled'}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {post.userId?.username || 'Unknown provider'}
          {[post.city, post.state].filter(Boolean).length > 0 && (
            <> · {[post.city, post.state].filter(Boolean).join(', ')}</>
          )}
        </p>
      </div>
      {badge === 'blue' && (
        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-600 px-2 py-0.5 text-[10px] font-semibold">
          <BadgeCheck size={10} /> Verified
        </span>
      )}
      <ArrowRight size={14} className="shrink-0 text-gray-300 group-hover:text-purple-500 transition-colors" />
    </Link>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const { user } = useContext(UserContext);
  const [likedPosts, setLikedPosts]     = useState([]);
  const [unreadCount, setUnreadCount]   = useState(0);
  const [credits, setCredits]           = useState(0);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    setSEO('My Dashboard | Mystery Mansion', '', { robots: 'noindex, nofollow' });

    Promise.allSettled([
      api.get('/users/me/liked-posts'),
      api.get('/messages/unread/count'),
      api.get('/credits/balance'),
    ]).then(([likedR, msgR, credR]) => {
      if (likedR.status === 'fulfilled') {
        setLikedPosts(Array.isArray(likedR.value.data) ? likedR.value.data : []);
      }
      if (msgR.status === 'fulfilled') {
        setUnreadCount(Number(msgR.value.data?.unreadCount) || 0);
      }
      if (credR.status === 'fulfilled') {
        setCredits(Number(credR.value.data?.credits) || 0);
      }
    }).finally(() => setLoading(false));
  }, []);

  const joinedAt = user?.createdAt ?? null;

  return (
    <div className="min-h-full -m-4 md:-m-6 p-4 md:p-6 space-y-6 bg-gradient-to-br from-purple-50 via-pink-50 to-white">

      {/* Welcome */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.username || 'Client'} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Browse providers, save your favourites, and manage your account.
          </p>
        </div>
        <Link
          to="/"
          className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 transition-colors shadow-sm"
        >
          <Search size={15} /> Browse
        </Link>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div key="stats-loading" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/60 animate-pulse" />
          ))}
        </div>
      ) : (
        <div key="stats-loaded" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Liked Posts"
            value={likedPosts.length}
            icon={Heart}
            gradient="bg-gradient-to-br from-pink-500 to-rose-500"
          />
          <StatCard
            label="Unread Messages"
            value={unreadCount}
            icon={MessageSquareText}
            gradient="bg-gradient-to-br from-purple-500 to-violet-600"
          />
          <Link to="/client/credits" className="block">
            <StatCard
              label="Credits"
              value={credits}
              icon={Coins}
              gradient={credits < 20
                ? 'bg-gradient-to-br from-red-400 to-rose-500'
                : 'bg-gradient-to-br from-yellow-400 to-amber-500'}
            />
          </Link>
          <StatCard
            label="Days on Platform"
            value={joinedAt ? Math.floor((Date.now() - new Date(joinedAt)) / 86400000) : 0}
            icon={CalendarDays}
            gradient="bg-gradient-to-br from-indigo-500 to-blue-500"
            suffix=" days"
          />
        </div>
      )}

      {/* Liked posts preview */}
      <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-pink-500 fill-pink-400" />
            <h2 className="text-sm font-semibold text-gray-900">Recently Liked</h2>
          </div>
          <Link
            to="/client/liked-posts"
            className="text-xs text-purple-600 font-medium hover:underline"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div key="liked-loading" className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : likedPosts.length === 0 ? (
          <div key="liked-empty" className="py-8 text-center">
            <Heart size={32} className="mx-auto mb-2 text-purple-200" />
            <p className="text-sm text-gray-400">You haven't liked any posts yet.</p>
            <Link to="/" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:underline">
              <Search size={13} /> Start browsing
            </Link>
          </div>
        ) : (
          <div key="liked-list" className="space-y-1">
            {likedPosts.slice(0, 5).map((post) => (
              <LikedRow key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Buy Credits CTA */}
      {credits < 100 && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold text-sm">
              {credits < 20 ? '⚠️ You\'re out of messaging credits!' : '💬 Running low on credits?'}
            </p>
            <p className="text-purple-100 text-xs mt-0.5">
              Top up to keep messaging providers. Each message costs 20 credits.
            </p>
          </div>
          <Link
            to="/client/credits"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-white text-purple-700 font-semibold text-sm px-4 py-2 hover:bg-purple-50 transition-colors shadow-sm"
          >
            <Coins size={14} /> Buy Credits
          </Link>
        </div>
      )}

      {/* What's new for clients */}
      <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-purple-500" />
          <h2 className="text-sm font-semibold text-gray-900">What's New for Clients</h2>
          <span className="ml-auto rounded-full bg-purple-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow">
            New
          </span>
        </div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>❤️ <strong className="text-gray-900">Liked Posts:</strong> heart any provider listing to save it here.</li>
          <li>💬 <strong className="text-gray-900">Messages:</strong> contact providers or site support directly.</li>
          <li>🔔 <strong className="text-gray-900">Notifications:</strong> stay up to date with platform activity.</li>
          <li>🔍 <strong className="text-gray-900">Browse:</strong> search listings by location and category.</li>
        </ul>
      </div>
    </div>
  );
}
