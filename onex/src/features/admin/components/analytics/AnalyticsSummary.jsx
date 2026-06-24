import { Clock, Eye, UserPlus, TrendingUp } from 'lucide-react';
import CountUp from 'react-countup';

export default function AnalyticsSummary({ summary, session, loading }) {
  const browseSeconds = session?.averageBrowseSeconds || 0;
  const minutes = Math.floor(browseSeconds / 60);
  const secs = Math.floor(browseSeconds % 60);
  const browseTime = browseSeconds > 0 ? `${minutes}m ${secs}s` : '—';

  const totalVisits = summary?.totalVisits || 0;
  const totalSignups = summary?.totalSignups || 0;
  const conversionRate =
    totalVisits > 0
      ? `${((totalSignups / totalVisits) * 100).toFixed(1)}%`
      : '—';

  const rows = [
    { icon: Clock,       label: 'Average Browse Time', value: browseTime,  numValue: null },
    { icon: Eye,         label: 'Total Visits',         value: null,        numValue: totalVisits },
    { icon: UserPlus,    label: 'Total Signups',        value: null,        numValue: totalSignups },
    { icon: TrendingUp,  label: 'Conversion Rate',      value: conversionRate, numValue: null },
  ];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col h-full">
      <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-5 shrink-0">
        Analytics Summary
      </h2>

      <div className="flex-1 space-y-1">
        {rows.map(({ icon: Icon, label, value, numValue }) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 py-3 border-b border-neutral-800 last:border-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-neutral-800 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-neutral-400" />
              </div>
              <span className="text-sm text-neutral-300 truncate">{label}</span>
            </div>

          {loading ? (
              <div className="h-5 w-14 bg-neutral-800 animate-pulse rounded" />
            ) : numValue !== null ? (
              <span className="text-sm font-semibold text-white shrink-0">
                <CountUp end={numValue} separator="," duration={1.5} useEasing />
              </span>
            ) : (
              <span className="text-sm font-semibold text-white shrink-0">{value}</span>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-neutral-500 mt-4 pt-4 border-t border-neutral-800 shrink-0">
        {session?.trackedSessions
          ? `Based on ${Number(session.trackedSessions).toLocaleString()} tracked sessions`
          : 'No session data yet'}
      </p>
    </div>
  );
}
