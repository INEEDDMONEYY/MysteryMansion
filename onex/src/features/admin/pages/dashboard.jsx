import { useEffect, useState } from "react";
import {
  Users, FileText, ShieldAlert, Mail, Clock3, Ticket,
  TrendingUp, Tag, Megaphone, Percent, UserCheck,
  Activity, Calendar, Crown, AlertCircle,
} from "lucide-react";
import CountUp from "react-countup";
import { useUser } from "@/context/useUser";
import api from "@/shared/utils/api";
import { setSEO } from "@/shared/utils/seo";

/* ── Reusable stat card ── */
function StatCard({ icon: Icon, label, value, sub, loading, accent = 'neutral' }) {
  const accents = {
    neutral: 'text-neutral-500',
    pink:    'text-pink-400',
    emerald: 'text-emerald-400',
    amber:   'text-amber-400',
    sky:     'text-sky-400',
    rose:    'text-rose-400',
    violet:  'text-violet-400',
  };
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon size={15} className={`${accents[accent]} shrink-0`} />}
        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">{label}</span>
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-neutral-800 animate-pulse rounded-lg" />
      ) : typeof value === 'number' ? (
        <p className="text-3xl font-bold text-white">
          <CountUp end={value} separator="," duration={1.2} useEasing />
        </p>
      ) : (
        <p className="text-3xl font-bold text-white">{value ?? 0}</p>
      )}
      {sub && <p className="text-xs text-neutral-500 mt-1">{sub}</p>}
    </div>
  );
}

/* ── Mini bar for a simple chart ── */
function MiniBar({ label, count, max, color = 'bg-pink-500' }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-neutral-400 w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-neutral-500 w-6 text-right">{count}</span>
    </div>
  );
}

/* ── Section heading ── */
function SectionHead({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} className="text-neutral-500" />
      <h2 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">{label}</h2>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, setUser } = useUser();

  const [stats, setStats]                   = useState({ totalUsers: 0, totalAdmins: 0 });
  const [restrictedAccounts, setRestricted] = useState([]);
  const [posts, setPosts]                   = useState([]);
  const [users, setUsers]                   = useState([]);
  const [promoCodes, setPromoCodes]         = useState([]);
  const [promotions, setPromotions]         = useState([]);
  const [banners, setBanners]               = useState([]);
  const [discounts, setDiscounts]           = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [nowMs, setNowMs]                   = useState(Date.now());
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [emailEnabled, setEmailEnabled]     = useState(true);

  useEffect(() => {
    setSEO("Admin | Mystery Mansion", "", { robots: "noindex, nofollow" });
  }, []);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Unread messages polling
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    let alive = true;
    const fetch = async () => {
      try {
        const { data } = await api.get("/messages/unread/count");
        if (alive) setUnreadMessages(Number(data?.unreadCount) || 0);
      } catch { if (alive) setUnreadMessages(0); }
    };
    fetch();
    const iv = setInterval(fetch, 30000);
    return () => { alive = false; clearInterval(iv); };
  }, [user?._id]);

  // Main fetch
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    (async () => {
      try {
        const [statsR, usersR, postsR, restrictedR, settingsR, promoCodesR, promotionsR, bannersR, discountsR] =
          await Promise.allSettled([
            api.get("/admin/stats"),
            api.get("/admin/users"),
            api.get("/posts"),
            api.get("/admin/users/restricted"),
            api.get("/admin"),
            api.get("/admin/promo-codes"),
            api.get("/promotions/requests"),
            api.get("/banners"),
            api.get("/discounts"),
          ]);

        if (statsR.status === "fulfilled") {
          const p = statsR.value?.data?.data || statsR.value?.data;
          setStats({ totalUsers: p?.totalUsers || 0, totalAdmins: p?.totalAdmins || 0 });
        } else if (usersR.status === "fulfilled") {
          const list = usersR.value?.data?.data || usersR.value?.data || [];
          setStats({ totalUsers: list.length, totalAdmins: list.filter(u => u?.role === "admin").length });
        }
        if (usersR.status === "fulfilled") {
          const d = usersR.value?.data;
          setUsers(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
        }
        if (postsR.status === "fulfilled") {
          const d = postsR.value?.data;
          setPosts(Array.isArray(d) ? d : []);
        }
        if (restrictedR.status === "fulfilled") {
          const d = restrictedR.value?.data;
          setRestricted(Array.isArray(d) ? d : []);
        }
        if (settingsR.status === "fulfilled") {
          const p = settingsR.value?.data?.data || settingsR.value?.data;
          if (p?.profilePicture) {
            localStorage.setItem("profilePicture", p.profilePicture);
            setUser(prev => ({ ...prev, profilePic: p.profilePicture }));
          }
          setEmailEnabled(p?.emailEnabled !== false);
        }
        if (promoCodesR.status === "fulfilled") {
          const d = promoCodesR.value?.data;
          setPromoCodes(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
        }
        if (promotionsR.status === "fulfilled") {
          const d = promotionsR.value?.data;
          setPromotions(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
        }
        if (bannersR.status === "fulfilled") {
          const d = bannersR.value?.data;
          setBanners(Array.isArray(d?.data) ? d.data : []);
        }
        if (discountsR.status === "fulfilled") {
          const d = discountsR.value?.data;
          setDiscounts(Array.isArray(d?.data) ? d.data : []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [setUser]);

  /* ── Derived analytics ── */
  const now     = new Date();
  const day1    = new Date(now); day1.setDate(now.getDate() - 1);
  const day7    = new Date(now); day7.setDate(now.getDate() - 7);
  const day30   = new Date(now); day30.setDate(now.getDate() - 30);

  const postsToday  = posts.filter(p => new Date(p.createdAt) >= day1).length;
  const postsWeek   = posts.filter(p => new Date(p.createdAt) >= day7).length;
  const postsMonth  = posts.filter(p => new Date(p.createdAt) >= day30).length;
  const usersWeek   = users.filter(u => new Date(u.createdAt) >= day7).length;
  const usersMonth  = users.filter(u => new Date(u.createdAt) >= day30).length;

  const pendingPromos  = promotions.filter(p => p.status === "pending").length;
  const approvedPromos = promotions.filter(p => p.status === "approved").length;
  const activeBanners  = banners.filter(b => b.active).length;
  const activeDiscounts = discounts.filter(d => d.active).length;

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Post category breakdown
  const catCounts = {};
  posts.forEach(p => {
    const cats = Array.isArray(p.categories) ? p.categories : [p.category || "Uncategorized"];
    cats.forEach(c => {
      const label = String(c || "Uncategorized").trim() || "Uncategorized";
      catCounts[label] = (catCounts[label] || 0) + 1;
    });
  });
  const topCats = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxCat = topCats[0]?.[1] || 1;

  // Posts last 7 days by day
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const count = posts.filter(p => {
      const cd = new Date(p.createdAt);
      return cd.toDateString() === d.toDateString();
    }).length;
    return { label, count };
  });
  const maxDay = Math.max(...last7Days.map(d => d.count), 1);

  /* ── Promo countdowns ── */
  const activePromoEntries = promoCodes.map(promo => {
    const code = promo?.code || "";
    const assignedUser = promo?.assignedUser?.username || promo?.assignedUser?.email || "Any user";
    const redemptions = Array.isArray(promo?.redemptions) ? promo.redemptions : [];
    const active = redemptions.filter(e => {
      const ms = new Date(e?.expiresAt || 0).getTime();
      return Number.isFinite(ms) && ms > nowMs;
    });
    if (active.length === 0) return null;
    const nearestMs = Math.min(...active.map(e => new Date(e.expiresAt).getTime()));
    const diff = Math.max(0, nearestMs - nowMs);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    const countdown = days > 0 ? `${days}d ${hours}h ${mins}m ${secs}s` : `${hours}h ${mins}m ${secs}s`;
    return { code, assignedUser, countdown, expiresAt: new Date(nearestMs).toLocaleString(), redeemedCount: active.length };
  }).filter(Boolean);

  return (
    <div className="space-y-6 pb-10">
      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-400 text-sm">{error}</div>
      )}

      {/* Email disabled warning */}
      {!emailEnabled && (
        <div className="flex items-start justify-between gap-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl px-5 py-4">
          <div className="flex items-start gap-3">
            <Mail size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Transactional emails are disabled</p>
              <p className="text-xs text-amber-400/70 mt-0.5">Welcome emails, password resets, and notifications are being skipped.</p>
            </div>
          </div>
          <a
            href="/admin/banners"
            className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition-colors"
          >
            Manage
          </a>
        </div>
      )}

      {/* ── Row 1: Core stats ── */}
      <div>
        <SectionHead icon={Activity} label="Platform Overview" />
        <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard icon={Users}       label="Total Users"   value={stats.totalUsers}          sub={`+${usersMonth} this month`}    accent="sky"     loading={loading} />
          <StatCard icon={FileText}    label="Total Posts"   value={posts.length}              sub={`+${postsMonth} this month`}    accent="pink"    loading={loading} />
          <StatCard icon={ShieldAlert} label="Restricted"    value={restrictedAccounts.length} sub="Active restrictions"            accent="rose"    loading={loading} />
          <StatCard icon={Mail}        label="Unread Msgs"   value={unreadMessages}            sub="Awaiting reply"                 accent="amber"   loading={loading} />
        </div>
      </div>

      {/* ── Row 2: Growth + activity stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard icon={TrendingUp}   label="New Users / 7d"  value={usersWeek}       accent="emerald"  loading={loading} />
        <StatCard icon={Calendar}     label="Posts Today"     value={postsToday}      accent="pink"     loading={loading} />
        <StatCard icon={Calendar}     label="Posts / 7d"      value={postsWeek}       accent="pink"     loading={loading} />
        <StatCard icon={Crown}        label="Pending Promos"  value={pendingPromos}   accent="amber"    loading={loading} />
        <StatCard icon={Megaphone}    label="Live Banners"    value={activeBanners}   accent="violet"   loading={loading} />
        <StatCard icon={Percent}      label="Live Discounts"  value={activeDiscounts} accent="sky"      loading={loading} />
      </div>

      {/* ── Middle row: Recent signups + Post activity chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent signups */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5">
          <SectionHead icon={UserCheck} label="Recent Signups" />
          {loading ? (
            <div className="space-y-2">
              {[1,2,3,4].map(i => <div key={i} className="h-10 bg-neutral-800 rounded-xl animate-pulse" />)}
            </div>
          ) : recentUsers.length === 0 ? (
            <p className="text-neutral-600 text-sm">No users yet.</p>
          ) : (
            <div className="space-y-2">
              {recentUsers.map(u => (
                <div key={u._id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-neutral-800/60">
                  {u.profilePic ? (
                    <img src={u.profilePic} alt={u.username} className="h-7 w-7 rounded-full object-cover border border-neutral-700 shrink-0" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-neutral-700 shrink-0 flex items-center justify-center text-[10px] text-neutral-400 font-bold">
                      {(u.username || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white truncate">{u.username}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{u.email}</p>
                  </div>
                  <span className="text-[10px] text-neutral-500 shrink-0">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Post activity last 7 days */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5">
          <SectionHead icon={TrendingUp} label="Posts — Last 7 Days" />
          {loading ? (
            <div className="space-y-3 mt-2">
              {[1,2,3,4,5,6,7].map(i => <div key={i} className="h-4 bg-neutral-800 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              {last7Days.map(d => (
                <MiniBar key={d.label} label={d.label} count={d.count} max={maxDay} />
              ))}
            </div>
          )}
          <div className="mt-4 pt-3 border-t border-neutral-800 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-white">{postsToday}</p>
              <p className="text-[10px] text-neutral-500">Today</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{postsWeek}</p>
              <p className="text-[10px] text-neutral-500">This week</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{postsMonth}</p>
              <p className="text-[10px] text-neutral-500">This month</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Categories breakdown + Promotions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top categories */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5">
          <SectionHead icon={Tag} label="Top Post Categories" />
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-4 bg-neutral-800 rounded animate-pulse" />)}
            </div>
          ) : topCats.length === 0 ? (
            <p className="text-neutral-600 text-sm">No posts to analyze.</p>
          ) : (
            <div className="space-y-3">
              {topCats.map(([cat, count]) => (
                <MiniBar key={cat} label={cat} count={count} max={maxCat} color="bg-pink-500" />
              ))}
            </div>
          )}
        </div>

        {/* Promotions summary */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5">
          <SectionHead icon={Crown} label="Promotion Requests" />
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-neutral-800 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Pending',  value: pendingPromos,  color: 'text-amber-400'  },
                  { label: 'Approved', value: approvedPromos, color: 'text-emerald-400'},
                  { label: 'Total',    value: promotions.length, color: 'text-neutral-300'},
                ].map(s => (
                  <div key={s.label} className="bg-neutral-800 rounded-xl p-3 text-center">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {pendingPromos > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-950/40 border border-amber-800/40">
                  <AlertCircle size={13} className="text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-300">
                    {pendingPromos} promotion request{pendingPromos > 1 ? 's' : ''} awaiting review
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Recent posts ── */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5">
        <SectionHead icon={FileText} label="Recent Posts" />
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-neutral-800 rounded-xl animate-pulse" />)}
          </div>
        ) : recentPosts.length === 0 ? (
          <p className="text-neutral-600 text-sm">No posts yet.</p>
        ) : (
          <div className="divide-y divide-neutral-800">
            {recentPosts.map(p => (
              <div key={p._id} className="flex items-center gap-3 py-2.5">
                <div className="h-8 w-8 rounded-lg overflow-hidden bg-neutral-800 shrink-0">
                  {p.pictures?.[0] ? (
                    <img src={p.pictures[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-neutral-600">
                      <FileText size={12} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-white truncate">{p.title || 'Untitled'}</p>
                  <p className="text-[10px] text-neutral-500 truncate">
                    {p.userId?.username || 'Unknown'} · {p.city || ''}{p.state ? `, ${p.state}` : ''}
                  </p>
                </div>
                <span className="text-[10px] text-neutral-500 shrink-0">
                  {new Date(p.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Active promo countdowns ── */}
      <div>
        <SectionHead icon={Clock3} label="Active Promo Countdowns" />
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-neutral-900 border border-neutral-800 rounded-2xl animate-pulse" />)}
          </div>
        ) : activePromoEntries.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <p className="text-neutral-500 text-sm">No active promo code redemptions right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {activePromoEntries.map((entry, i) => (
              <div key={`${entry.code}-${i}`} className="relative bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
                <span className="absolute right-4 top-4 inline-flex rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-xs font-semibold text-rose-400">
                  {entry.redeemedCount} redeemed
                </span>
                <div className="flex items-center gap-2 mb-1">
                  <Ticket size={15} className="text-amber-400" />
                  <span className="font-semibold text-white">{entry.code}</span>
                </div>
                <p className="text-xs text-neutral-500 mb-3">Assigned: {entry.assignedUser}</p>
                <div className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 font-mono font-semibold text-sm text-white">
                  {entry.countdown}
                </div>
                <p className="text-xs text-neutral-500 mt-2">Nearest expiry: {entry.expiresAt}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
