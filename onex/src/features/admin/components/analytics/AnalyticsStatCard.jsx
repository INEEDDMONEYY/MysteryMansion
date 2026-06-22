import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function AnalyticsStatCard({ icon: Icon, label, value, sub, loading, change }) {
  // change: number | null — percentage change vs previous period
  const changeColor =
    change === null || change === undefined
      ? null
      : change > 0
      ? 'text-emerald-400 bg-emerald-500/10'
      : change < 0
      ? 'text-red-400 bg-red-500/10'
      : 'text-neutral-400 bg-neutral-800';

  const ChangeIcon =
    change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        {Icon && (
          <div className="h-7 w-7 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
            <Icon size={13} className="text-neutral-400" />
          </div>
        )}
        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
          {label}
        </span>
      </div>

      {loading ? (
        <div className="h-8 w-20 bg-neutral-800 animate-pulse rounded-lg" />
      ) : (
        <p className="text-2xl font-bold text-white">{value ?? 0}</p>
      )}

      <div className="flex items-center gap-2 mt-2">
        {sub && <p className="text-xs text-neutral-500">{sub}</p>}

        {!loading && change !== null && change !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${changeColor}`}
          >
            <ChangeIcon size={10} />
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
    </div>
  );
}
