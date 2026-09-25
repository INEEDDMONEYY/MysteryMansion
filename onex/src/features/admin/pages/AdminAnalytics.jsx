import { useEffect, useState } from 'react';
import { Eye, UserPlus, Clock, Activity } from 'lucide-react';
import api from '@/shared/utils/api';

// Register ChartJS + export shared options
import '@/features/admin/components/analytics/chartOptions';

import {
  AnalyticsHeader,
  AnalyticsStatCard,
  TrafficChart,
  SignupsChart,
  AnalyticsSummary,
} from '@/features/admin/components/analytics';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('7d');
  const [userType, setUserType] = useState('all');
  const [activityType, setActivityType] = useState('all');

  const fetchAnalytics = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/analytics', {
        params: { range: dateRange, userType, activityType },
      });
      setAnalytics(res?.data?.data || null);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || err.message || 'Unknown error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial + filter-change fetch
  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, userType, activityType]); // eslint-disable-line react-hooks/exhaustive-deps

  // 30-second silent refresh to keep "Active Now" live
  useEffect(() => {
    const iv = setInterval(() => fetchAnalytics(true), 30_000);
    return () => clearInterval(iv);
  }, [dateRange, userType, activityType]); // eslint-disable-line react-hooks/exhaustive-deps

  // "Active Now" = real-time count of sessions seen in the last couple minutes
  // (not a cumulative daily visitor count, which is misleading for "right now").
  const activeNow = analytics?.activeNow || { total: 0, idle: 0, breakdown: {}, windowSeconds: 120 };
  const activeWindowMinutes = Math.max(1, Math.round((activeNow.windowSeconds || 120) / 60));

  // Average browse time for stat card
  const browseSeconds = analytics?.session?.averageBrowseSeconds || 0;
  const browseDisplay =
    browseSeconds > 0
      ? `${Math.floor(browseSeconds / 60)}m ${Math.floor(browseSeconds % 60)}s`
      : '—';

  // ── Growth indicators: split the period array in half, compare halves ──
  function periodGrowth(arr, valueKey) {
    if (!arr || arr.length < 2) return null;
    const mid = Math.floor(arr.length / 2);
    const prev = arr.slice(0, mid).reduce((s, d) => s + (Number(d[valueKey]) || 0), 0);
    const curr = arr.slice(mid).reduce((s, d) => s + (Number(d[valueKey]) || 0), 0);
    if (prev === 0) return curr > 0 ? 100 : null;
    return Number((((curr - prev) / prev) * 100).toFixed(1));
  }

  const visitsGrowth  = periodGrowth(analytics?.traffic,  'visits');
  const signupsGrowth = periodGrowth(analytics?.signups,  'count');

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header + Filters ── */}
      <AnalyticsHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        userType={userType}
        onUserTypeChange={setUserType}
        activityType={activityType}
        onActivityTypeChange={setActivityType}
      />

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <AnalyticsStatCard
          icon={Eye}
          label="Visits"
          value={analytics?.summary?.totalVisits ?? 0}
          sub="Total in range"
          loading={loading}
          change={visitsGrowth}
        />
        <AnalyticsStatCard
          icon={UserPlus}
          label="Sign Ups"
          value={analytics?.summary?.totalSignups ?? 0}
          sub="New registrations"
          loading={loading}
          change={signupsGrowth}
        />
        <AnalyticsStatCard
          icon={Clock}
          label="Browse Time"
          value={browseDisplay}
          sub="Avg per session"
          loading={loading}
        />
        <AnalyticsStatCard
          icon={Activity}
          label="Active Now"
          value={activeNow.total}
          sub={`Last ${activeWindowMinutes} min · ${activeNow.idle} recently idle`}
          loading={loading}
          breakdown={[
            { label: 'Browsing', value: activeNow.breakdown?.browsing || 0 },
            { label: 'Viewing', value: activeNow.breakdown?.viewing || 0 },
            { label: 'Editing', value: activeNow.breakdown?.editing || 0 },
            { label: 'Messaging', value: activeNow.breakdown?.messaging || 0 },
          ]}
        />
      </div>

      {/* ── Traffic Chart + Analytics Summary ── */}
      <div className="
        grid
        grid-cols-1
        xl:grid-cols-3
        gap-6
      ">
        {/* Traffic chart — spans 2 of 3 columns */}
        <div className="xl:col-span-2">
          <TrafficChart data={analytics?.traffic} loading={loading} />
        </div>

        {/* Analytics summary panel — 1 column */}
        <div className="xl:col-span-1">
          <AnalyticsSummary
            summary={analytics?.summary}
            session={analytics?.session}
            loading={loading}
          />
        </div>
      </div>

      {/* ── Signups Chart (full width) ── */}
      <SignupsChart data={analytics?.signups} loading={loading} />
    </div>
  );
}
