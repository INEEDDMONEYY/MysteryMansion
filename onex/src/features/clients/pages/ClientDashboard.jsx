import BrandLoader from "@/shared/components/Loaders/BrandLoader";
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';
import {
  Heart, MessageSquareText, CalendarDays, Search, Coins,
} from 'lucide-react';
import { UserContext } from '@/context/UserContext';
import api from '@/shared/utils/api';
import { setSEO } from '@/shared/utils/seo';
import ForumAnalyticsPanel from '../components/ForumAnalyticsPanel';

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
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
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

// ── Main ─────────────────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const { user } = useContext(UserContext);
  const [likedPosts, setLikedPosts]     = useState([]);
  const [unreadCount, setUnreadCount]   = useState(0);
  const [credits, setCredits]           = useState(null);
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
        const val = credR.value.data?.credits;
        setCredits(val != null ? Number(val) : 200);
      }
    }).finally(() => setLoading(false));
  }, []);

  const joinedAt = user?.createdAt ?? null;

  return (
    <div className="min-h-full -m-4 md:-m-6 p-4 md:p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">

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
          className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Search size={15} /> Browse
        </Link>
      </div>

      {/* Stat cards */}
      {loading ? (
        <BrandLoader key="stats-loading" size="sm" />
      ) : (
        <div key="stats-loaded" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Liked Posts"
            value={likedPosts.length}
            icon={Heart}
            gradient="bg-gradient-to-br from-rose-600 to-red-700"
          />
          <StatCard
            label="Unread Messages"
            value={unreadCount}
            icon={MessageSquareText}
            gradient="bg-gradient-to-br from-blue-700 to-slate-700"
          />
          <Link to="/client/credits" className="block">
            <StatCard
              label="Credits"
              value={credits ?? '—'}
              icon={Coins}
              gradient={credits != null && credits < 20
                ? 'bg-gradient-to-br from-red-400 to-rose-500'
                : 'bg-gradient-to-br from-yellow-400 to-amber-500'}
            />
          </Link>
          <StatCard
            label="Days on Platform"
            value={joinedAt ? Math.floor((Date.now() - new Date(joinedAt)) / 86400000) : 0}
            icon={CalendarDays}
            gradient="bg-gradient-to-br from-slate-600 to-zinc-700"
            suffix=" days"
          />
        </div>
      )}

      {/* Forum analytics */}
      <ForumAnalyticsPanel />

    </div>
  );
}
