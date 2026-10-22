import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Flag, RefreshCw } from "lucide-react";

import useAdminFlags from "@/features/flagging/hooks/useAdminFlags";
import FlagStatusBadge from "@/features/flagging/components/FlagStatusBadge";
import { FLAG_STATUS_OPTIONS } from "@/features/flagging/data/flagStatuses";
import { getFlagReasonLabel } from "@/features/flagging/data/flagReasons";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const selectClass =
  "rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-neutral-600";

function TargetCell({ flag }) {
  if (flag.targetType === "post") {
    return (
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-neutral-500">Post</p>
        <Link
          to={`/posts/${flag.targetId}`}
          className="block max-w-[220px] truncate text-sm text-white hover:underline"
        >
          {flag.postTitle || "View post"}
        </Link>
        {flag.reportedUserId?.username && (
          <p className="text-xs text-neutral-500">by {flag.reportedUserId.username}</p>
        )}
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-neutral-500">Account</p>
      <Link
        to={`/user/${flag.targetId}`}
        className="block max-w-[220px] truncate text-sm text-white hover:underline"
      >
        {flag.reportedUserId?.username || "View profile"}
      </Link>
    </div>
  );
}

export default function AdminReportedFlagsPage() {
  const { flags, loading, error, refresh } = useAdminFlags();
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const visibleFlags = useMemo(
    () =>
      flags.filter(
        (flag) =>
          (statusFilter === "all" || flag.status === statusFilter) &&
          (typeFilter === "all" || flag.targetType === typeFilter)
      ),
    [flags, statusFilter, typeFilter]
  );

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Reported Flags</h2>
          <p className="mt-0.5 text-sm text-neutral-400">
            Who flagged a post or account, and why.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className={selectClass}
          >
            <option value="all">All types</option>
            <option value="post">Posts</option>
            <option value="user">Accounts</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={selectClass}
          >
            <option value="all">All statuses</option>
            {FLAG_STATUS_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={refresh}
            aria-label="Refresh"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 transition-colors hover:text-white"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
          </div>
        ) : visibleFlags.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-neutral-500">
            <Flag size={36} className="opacity-20" />
            <p className="text-sm">No reported flags found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-neutral-800 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Flagged by</th>
                  <th className="px-5 py-3 font-medium">Reported</th>
                  <th className="px-5 py-3 font-medium">Reason</th>
                  <th className="px-5 py-3 font-medium">Details</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-800">
                {visibleFlags.map((flag) => (
                  <tr key={flag._id} className="align-top hover:bg-neutral-800/40">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">
                        {flag.reporterId?.username || "Deleted user"}
                      </p>
                      {flag.reporterId?.email && (
                        <p className="text-xs text-neutral-500">{flag.reporterId.email}</p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <TargetCell flag={flag} />
                    </td>

                    <td className="px-5 py-4 text-neutral-200">
                      {getFlagReasonLabel(flag.targetType, flag.reason)}
                    </td>

                    <td className="max-w-[260px] px-5 py-4 text-neutral-400">
                      {flag.details ? (
                        <p className="line-clamp-3 break-words">{flag.details}</p>
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-neutral-400">
                      {formatDate(flag.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <FlagStatusBadge status={flag.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
