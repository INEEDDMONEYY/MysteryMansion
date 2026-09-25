import { useEffect, useMemo, useState } from 'react';
import { Link2, TrendingUp, Gift, Percent, Search } from 'lucide-react';
import api from '@/shared/utils/api';
import { setSEO } from '@/shared/utils/seo';
import { AnalyticsStatCard } from '@/features/admin/components/analytics';

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setSEO('Referral Analytics | Admin', '', { robots: 'noindex, nofollow' });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/admin/referrals');
        setReferrals(Array.isArray(data) ? data : []);
      } catch {
        setError('Failed to load referral analytics.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totals = useMemo(() => {
    const clicks = referrals.reduce((s, r) => s + (r.clickCount || 0), 0);
    const signups = referrals.reduce((s, r) => s + (r.signupCount || 0), 0);
    const conversion = clicks > 0 ? Number(((signups / clicks) * 100).toFixed(1)) : 0;
    return { providers: referrals.length, clicks, signups, conversion };
  }, [referrals]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return referrals;
    return referrals.filter((r) => r.providerId?.username?.toLowerCase().includes(q));
  }, [referrals, search]);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Link2 size={22} className="text-pink-400" /> Referral Analytics
        </h1>
        <p className="text-sm text-neutral-400 mt-0.5">
          Click and signup activity across every provider's referral link.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-400 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <AnalyticsStatCard icon={Link2} label="Providers with links" value={totals.providers} loading={loading} />
        <AnalyticsStatCard icon={TrendingUp} label="Total Clicks" value={totals.clicks} loading={loading} />
        <AnalyticsStatCard icon={Gift} label="Total Signups" value={totals.signups} loading={loading} />
        <AnalyticsStatCard icon={Percent} label="Conversion Rate" value={`${totals.conversion}%`} loading={loading} />
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by provider username…"
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl bg-neutral-800 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-neutral-500">
          {referrals.length === 0 ? 'No providers have generated a referral link yet.' : 'No providers match your search.'}
        </p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3">Provider</th>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Clicks</th>
                <th className="px-5 py-3">Signups</th>
                <th className="px-5 py-3">Conversion</th>
                <th className="px-5 py-3">Last Click</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r) => {
                const conversion = r.clickCount > 0 ? ((r.signupCount / r.clickCount) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={r._id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={r.providerId?.profilePic || '/default-avatar.png'}
                          alt={r.providerId?.username}
                          className="w-8 h-8 rounded-full object-cover bg-gray-200"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{r.providerId?.username || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 truncate">{r.providerId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-600">{r.code}</td>
                    <td className="px-5 py-3 text-gray-900 font-medium">{r.clickCount ?? 0}</td>
                    <td className="px-5 py-3 text-gray-900 font-medium">{r.signupCount ?? 0}</td>
                    <td className="px-5 py-3 text-gray-600">{conversion}%</td>
                    <td className="px-5 py-3 text-gray-500">{fmtDate(r.lastClickedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
