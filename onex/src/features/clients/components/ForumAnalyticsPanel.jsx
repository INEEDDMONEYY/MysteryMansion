import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUp,
  BarChart3,
  Bookmark,
  CheckCircle2,
  Eye,
  MessageCircle,
  MessageSquarePlus,
} from "lucide-react";

import { getMyForumAnalytics } from "@/features/forum/services/forumAnalyticsService";

const formatCount = (value) =>
  new Intl.NumberFormat("en-US", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);

const formatDay = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function Metric({ label, value, icon: Icon, tone }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone}`}>
          <Icon size={14} />
        </span>
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{label}</p>
      </div>
      <p className="mt-2 text-xl font-bold leading-none text-gray-900">{formatCount(value)}</p>
    </div>
  );
}

function ActivityChart({ daily }) {
  const peak = Math.max(1, ...daily.map((d) => d.replies + d.votes));
  const total = daily.reduce((sum, d) => sum + d.replies + d.votes, 0);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-gray-700">Last 14 days</p>
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-600" /> Replies
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Upvotes
          </span>
        </div>
      </div>

      <div
        className="flex h-28 items-end gap-1"
        role="img"
        aria-label={`${total} replies and upvotes from other members in the last 14 days`}
      >
        {daily.map((day) => {
          const sum = day.replies + day.votes;

          return (
            <div
              key={day.date}
              title={`${formatDay(day.date)}: ${day.replies} repl${day.replies === 1 ? "y" : "ies"}, ${day.votes} upvote${day.votes === 1 ? "" : "s"}`}
              className="flex h-full flex-1 flex-col justify-end"
            >
              {sum === 0 ? (
                <div className="h-1 rounded-full bg-slate-100" />
              ) : (
                <div className="flex flex-col overflow-hidden rounded-t" style={{ height: `${(sum / peak) * 100}%` }}>
                  <div className="bg-emerald-500" style={{ flex: day.votes }} />
                  <div className="bg-blue-600" style={{ flex: day.replies }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-1 flex justify-between text-[10px] text-gray-400">
        <span>{formatDay(daily[0].date)}</span>
        <span>{formatDay(daily[daily.length - 1].date)}</span>
      </div>
    </div>
  );
}

function TopThreads({ threads }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-gray-700">Your top discussions</p>
      <ul className="space-y-1">
        {threads.map((thread) => (
          <li key={thread.id}>
            <Link
              to={`/forum/thread/${thread.id}`}
              className="group flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-blue-50/60"
            >
              <p className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-700">
                {thread.title}
              </p>
              <span className="flex shrink-0 items-center gap-3 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1" title="Replies from others">
                  <MessageCircle size={12} /> {formatCount(thread.replies)}
                </span>
                <span className="inline-flex items-center gap-1" title="Upvotes">
                  <ArrowUp size={12} /> {formatCount(thread.votes)}
                </span>
                <span className="hidden items-center gap-1 sm:inline-flex" title="Views">
                  <Eye size={12} /> {formatCount(thread.views)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Forum engagement the member has earned from other people, for the client dashboard. */
export default function ForumAnalyticsPanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getMyForumAnalytics()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load forum analytics.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const totals = data?.totals;
  const hasActivity = Boolean(totals && (totals.threads > 0 || totals.replies > 0));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-blue-600" />
          <h2 className="text-sm font-semibold text-gray-900">Forum Analytics</h2>
        </div>
        <Link to="/forum/discussions" className="text-xs font-medium text-blue-700 hover:underline">
          Open forum &rarr;
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[74px] animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
          <div className="h-28 animate-pulse rounded-xl bg-gray-100" />
        </div>
      ) : error ? (
        <p role="alert" className="py-6 text-center text-sm text-red-600">
          {error}
        </p>
      ) : !hasActivity ? (
        <div className="py-8 text-center">
          <MessageSquarePlus size={32} className="mx-auto mb-2 text-slate-200" />
          <p className="text-sm text-gray-400">
            Start or join a discussion to see how other members engage with you.
          </p>
          <Link
            to="/forum/create"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:underline"
          >
            Start a discussion
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <Metric label="Replies received" value={totals.repliesReceived} icon={MessageCircle} tone="bg-blue-100 text-blue-700" />
            <Metric label="Upvotes received" value={totals.votesReceived} icon={ArrowUp} tone="bg-emerald-100 text-emerald-700" />
            <Metric label="Thread views" value={totals.views} icon={Eye} tone="bg-slate-200 text-slate-700" />
            <Metric label="Saves" value={totals.savesReceived} icon={Bookmark} tone="bg-amber-100 text-amber-700" />
            <Metric label="Accepted answers" value={totals.solutions} icon={CheckCircle2} tone="bg-teal-100 text-teal-700" />
            <Metric label="Discussions started" value={totals.threads} icon={MessageSquarePlus} tone="bg-rose-100 text-rose-700" />
          </div>

          <ActivityChart daily={data.daily} />

          {data.topThreads.length > 0 && <TopThreads threads={data.topThreads} />}
        </div>
      )}
    </div>
  );
}
