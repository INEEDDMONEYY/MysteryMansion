import { Link } from "react-router-dom";
import { CheckCircle2, Timer } from "lucide-react";

import usePagedProfileData from "../../hooks/usePagedProfileData";
import { fetchAdminResolvedFlags } from "../../services/adminProfileService";
import FlagTimeline from "@/features/flagging/components/FlagTimeline";
import { getFlagReasonLabel } from "@/features/flagging/data/flagReasons";
import ProfileDataState from "../profile-shared/ProfileDataState";

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

const formatHours = (hours) => {
  if (!hours) return "Under an hour";
  if (hours < 48) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
};

// FlagTimeline expects createdAt/updatedBy.username entries.
const toTimelineEntries = (timeline = []) =>
  timeline.map((entry) => ({
    status: entry.status,
    message: entry.message,
    createdAt: entry.at,
    updatedBy: entry.by ? { username: entry.by } : null,
  }));

/** Reports this admin moved to "Resolved", with the full investigation timeline of each. */
export default function AdminResolvedFlags({ adminId }) {
  const { items, extra, pagination, loading, loadingMore, error, loadMore } =
    usePagedProfileData(fetchAdminResolvedFlags, { adminId });

  const summary = extra.summary || { total: 0, averageHours: 0 };

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-2xl font-black text-gray-950">{summary.total}</p>
            <p className="text-xs font-medium text-gray-500">Reports resolved</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
            <Timer className="h-5 w-5" />
          </span>
          <div>
            <p className="text-2xl font-black text-gray-950">{formatHours(summary.averageHours)}</p>
            <p className="text-xs font-medium text-gray-500">Average time to resolve</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ProfileDataState
          loading={loading}
          error={error}
          empty={items.length === 0}
          emptyTitle="No resolved reports yet"
          emptyDescription="Reports you mark as resolved in Reported Flags Timeline will be listed here."
          hasMore={pagination.hasNextPage}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
        >
          <ul className="space-y-4">
            {items.map((flag) => (
              <li key={flag.id} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                      {flag.targetType === "post" ? "Post report" : "Account report"}
                    </p>

                    <h3 className="mt-0.5 break-words text-base font-bold text-gray-950">
                      {flag.targetType === "post" ? (
                        <Link to={`/posts/${flag.targetId}`} className="hover:text-pink-600">
                          {flag.postTitle || "View post"}
                        </Link>
                      ) : (
                        <Link to={`/user/${flag.targetId}`} className="hover:text-pink-600">
                          {flag.reportedUser || "View account"}
                        </Link>
                      )}
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                      Reason: <span className="font-semibold">{getFlagReasonLabel(flag.targetType, flag.reason)}</span>
                      {" · "}Reported by <span className="font-semibold">{flag.reporter}</span>
                    </p>
                  </div>

                  <div className="shrink-0 text-left text-xs text-gray-500 sm:text-right">
                    <p className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Resolved {formatDateTime(flag.resolvedAt)}
                    </p>
                    <p className="mt-0.5">Reported {formatDateTime(flag.reportedAt)}</p>
                  </div>
                </div>

                {flag.resolutionNote && (
                  <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                    {flag.resolutionNote}
                  </p>
                )}

                <details className="group mt-4">
                  <summary className="cursor-pointer text-xs font-semibold text-pink-600 hover:underline">
                    View timeline
                  </summary>
                  <div className="mt-3">
                    <FlagTimeline entries={toTimelineEntries(flag.timeline)} theme="light" showAuthor />
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </ProfileDataState>
      </div>
    </div>
  );
}
