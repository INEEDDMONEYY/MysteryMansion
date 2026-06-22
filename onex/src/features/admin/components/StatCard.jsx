/**
 * StatCard
 * Single metric/stat display card for the admin dashboard.
 * Style during UI redesign.
 *
 * Props:
 *   label   — string, e.g. "Total Users"
 *   value   — string | number
 *   icon    — ReactNode, optional (e.g. a lucide icon)
 *   trend   — "up" | "down" | null, optional
 */
export default function StatCard({ label, value, icon, trend }) {
  return (
    <div className="stat-card">
      {icon && <div className="stat-card__icon">{icon}</div>}
      <div className="stat-card__body">
        <span className="stat-card__value">{value ?? '—'}</span>
        <span className="stat-card__label">{label}</span>
      </div>
      {trend && (
        <span className={`stat-card__trend stat-card__trend--${trend}`}>
          {trend === 'up' ? '↑' : '↓'}
        </span>
      )}
    </div>
  );
}
