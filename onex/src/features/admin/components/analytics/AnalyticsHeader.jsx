import { TrendingUp } from 'lucide-react';

const SELECT_CLASS =
  'bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-2 text-neutral-300 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-700';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function AnalyticsHeader({
  dateRange,
  onDateRangeChange,
  userType,
  onUserTypeChange,
  activityType,
  onActivityTypeChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      {/* Greeting */}
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <TrendingUp size={14} className="text-neutral-500" />
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Analytics
          </span>
        </div>
        <h1 className="text-xl font-semibold text-white">
          {getGreeting()}, Admin
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">This Year</option>
        </select>

        <select
          value={userType}
          onChange={(e) => onUserTypeChange(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="all">All Users</option>
          <option value="admin">Admins</option>
          <option value="user">Regular Users</option>
        </select>

        <select
          value={activityType}
          onChange={(e) => onActivityTypeChange(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="all">All Activity</option>
          <option value="posts">Posts</option>
          <option value="logins">Logins</option>
          <option value="comments">Comments</option>
        </select>
      </div>
    </div>
  );
}
