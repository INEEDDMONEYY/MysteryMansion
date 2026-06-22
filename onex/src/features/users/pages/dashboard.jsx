import { useContext, useEffect, useState } from "react";
import CountUp from "react-countup";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FileText, Star, MessageCircle, Eye, Clock,
  TrendingUp, Sparkles, CalendarDays,
} from "lucide-react";
import { UserContext } from "@/context/UserContext";
import api from "@/shared/utils/api";
import { setSEO } from "@/shared/utils/seo";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatJoinDate(isoDate) {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatAccountAge(isoDate) {
  if (!isoDate) return '—';
  const totalDays = Math.floor((Date.now() - new Date(isoDate)) / (1000 * 60 * 60 * 24));
  if (totalDays < 1)  return 'Today';
  if (totalDays < 2)  return '1 day';
  if (totalDays < 30) return `${totalDays} days`;
  const months = Math.floor(totalDays / 30.44);
  if (months < 12)    return months === 1 ? '1 month' : `${months} months`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return years === 1 ? '1 year' : `${years} years`;
  return `${years}y ${rem}m`;
}

// ── Member Since card ─────────────────────────────────────────────────────────
function MemberSinceCard({ joinedAt, loading }) {
  return (
    <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-5 shadow-md flex items-center gap-5">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
        <CalendarDays size={24} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Member Since</p>
        {loading ? (
          <div className="h-5 w-40 bg-white/50 rounded animate-pulse" />
        ) : (
          <p className="text-base font-bold text-gray-900 leading-snug">{formatJoinDate(joinedAt)}</p>
        )}
      </div>
      <div className="shrink-0 bg-purple-100 rounded-xl px-3 py-2 text-center min-w-[80px]">
        <p className="text-[10px] text-purple-600 font-medium uppercase tracking-wide leading-tight mb-0.5">Account Age</p>
        {loading ? (
          <div className="h-6 w-14 bg-purple-200 rounded animate-pulse mx-auto" />
        ) : (
          <p className="text-base font-bold text-purple-700 leading-tight">{formatAccountAge(joinedAt)}</p>
        )}
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, suffix = "" }) {
  return (
    <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-5 shadow-md flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color} shadow-lg`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-none">
          <CountUp end={value} duration={1.6} separator="," suffix={suffix} />
        </p>
      </div>
    </div>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="text-gray-500 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function UserDashboard() {
  const { user } = useContext(UserContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSEO("Dashboard | Mystery Mansion", "", { robots: "noindex, nofollow" });
    api.get("/users/me/analytics")
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const SHOW_WHATS_NEW_BADGE = true;
  const restriction = user?.roleRestriction || "";
  const restrictionLabelMap = {
    "no-posting": "Posting disabled",
    "no-comments": "Commenting disabled",
    "read-only": "Read-only access",
  };

  const stats = [
    {
      label: "Total Posts",
      value: data?.totalPosts ?? 0,
      icon: FileText,
      color: "bg-pink-500",
    },
    {
      label: "Reviews Received",
      value: data?.totalReviews ?? 0,
      icon: Star,
      color: "bg-amber-500",
    },
    {
      label: "Comments on Posts",
      value: data?.commentsReceived ?? 0,
      icon: MessageCircle,
      color: "bg-blue-500",
    },
    {
      label: "Profile Visits",
      value: data?.profileVisits ?? 0,
      icon: Eye,
      color: "bg-emerald-500",
    },
    {
      label: "Days on Platform",
      value: data?.memberDays ?? 0,
      icon: Clock,
      color: "bg-purple-500",
      suffix: " days",
    },
  ];

  return (
    /* Gradient canvas — bleeds to edges of the scroll container */
    <div className="min-h-full -m-4 md:-m-6 p-4 md:p-6 space-y-6 bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">

      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.username || "User"} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Here's how your profile is performing.</p>
      </div>

      {/* Restriction banner */}
      {restriction && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/80 backdrop-blur-sm px-4 py-3 text-amber-800 text-sm">
          <span className="font-semibold">Access restricted — </span>
          {restrictionLabelMap[restriction] || restriction}
        </div>
      )}

      {/* ── Stat Cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white/30 backdrop-blur-md rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Post Activity – Area */}
        <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-5 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-pink-500" />
            <h2 className="text-sm font-semibold text-gray-900">Post Activity — Last 7 Days</h2>
          </div>
          {loading ? (
            <div className="h-48 bg-white/30 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data?.postActivity ?? []} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="postGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="posts"
                  name="Posts"
                  stroke="#ec4899"
                  strokeWidth={2}
                  fill="url(#postGrad)"
                  dot={{ r: 3, fill: "#ec4899" }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Reviews Trend – Bar */}
        <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-5 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-900">Reviews — Last 30 Days</h2>
          </div>
          {loading ? (
            <div className="h-48 bg-white/30 rounded-xl animate-pulse" />
          ) : !data?.reviewsTrend?.length ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No reviews yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.reviewsTrend} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="reviews" name="Reviews" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Member Since ── */}
      <MemberSinceCard joinedAt={data?.joinedAt} loading={loading} />

      {/* ── What's New card ── */}
      <div className="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-2xl shadow-md">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-sm font-semibold inline-flex items-center gap-2 text-gray-900">
            <Sparkles size={16} className="text-pink-500" />
            What's New for Users
          </h2>
          {SHOW_WHATS_NEW_BADGE && (
            <span className="rounded-full bg-pink-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow">
              New
            </span>
          )}
        </div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>📞 <strong className="text-gray-900">Contact privacy:</strong> phone &amp; email display on your profile when set.</li>
          <li>💬 <strong className="text-gray-900">Messages (Beta):</strong> contact site admin for bugs or questions.</li>
          <li>🔗 <strong className="text-gray-900">Verified Links:</strong> add references in Edit Profile.</li>
          <li>📸 <strong className="text-gray-900">Post templates:</strong> save and reuse posts from the Posts tab.</li>
          <li>🗑️ <strong className="text-gray-900">Danger Zone:</strong> delete your account any time with confirmation.</li>
        </ul>
      </div>
    </div>
  );
}
