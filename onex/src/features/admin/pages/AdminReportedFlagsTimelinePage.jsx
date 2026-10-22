import { Fragment, useMemo, useState } from "react";
import { ChevronDown, Flag, RefreshCw } from "lucide-react";

import useAdminFlags from "@/features/flagging/hooks/useAdminFlags";
import FlagStatusBadge from "@/features/flagging/components/FlagStatusBadge";
import FlagTimeline from "@/features/flagging/components/FlagTimeline";
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

const fieldClass =
  "w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-neutral-600";

const targetLabel = (flag) =>
  flag.targetType === "post"
    ? flag.postTitle || "Post"
    : flag.reportedUserId?.username || "Account";

function FlagManager({ flag, onSave }) {
  const [status, setStatus] = useState(flag.status);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await onSave(flag._id, { status, message });
      setMessage("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
          Timeline
        </p>
        <FlagTimeline entries={flag.timeline} showAuthor />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Update timeline
        </p>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className={fieldClass}
        >
          {FLAG_STATUS_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Update shown to the reporter (e.g. what is being done for this account)"
          className={`${fieldClass} resize-none`}
        />

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Post update"}
        </button>
      </form>
    </div>
  );
}

export default function AdminReportedFlagsTimelinePage() {
  const { flags, loading, error, refresh, updateFlag } = useAdminFlags();
  const [statusFilter, setStatusFilter] = useState("all");
  const [openId, setOpenId] = useState(null);

  const visibleFlags = useMemo(
    () =>
      statusFilter === "all"
        ? flags
        : flags.filter((flag) => flag.status === statusFilter),
    [flags, statusFilter]
  );

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Reported Flags Timeline</h2>
          <p className="mt-0.5 text-sm text-neutral-400">
            Set the status and timeline reporters see for each flag.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-neutral-600"
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
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-neutral-800 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Reported</th>
                  <th className="px-5 py-3 font-medium">Reason</th>
                  <th className="px-5 py-3 font-medium">Flagged by</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Last update</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-800">
                {visibleFlags.map((flag) => {
                  const isOpen = openId === flag._id;
                  const latest = flag.timeline?.[flag.timeline.length - 1];

                  return (
                    <Fragment key={flag._id}>
                      <tr className="align-top hover:bg-neutral-800/40">
                        <td className="px-5 py-4">
                          <p className="text-xs uppercase tracking-wide text-neutral-500">
                            {flag.targetType === "post" ? "Post" : "Account"}
                          </p>
                          <p className="max-w-[220px] truncate text-white">
                            {targetLabel(flag)}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-neutral-200">
                          {getFlagReasonLabel(flag.targetType, flag.reason)}
                        </td>

                        <td className="px-5 py-4 text-neutral-300">
                          {flag.reporterId?.username || "Deleted user"}
                        </td>

                        <td className="px-5 py-4">
                          <FlagStatusBadge status={flag.status} />
                        </td>

                        <td className="px-5 py-4 text-neutral-400">
                          <p className="whitespace-nowrap">
                            {formatDate(latest?.createdAt || flag.updatedAt)}
                          </p>
                          {latest?.message && (
                            <p className="mt-0.5 line-clamp-2 max-w-[240px] text-xs text-neutral-500">
                              {latest.message}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setOpenId(isOpen ? null : flag._id)}
                            aria-expanded={isOpen}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-200 transition hover:bg-neutral-800"
                          >
                            Manage
                            <ChevronDown
                              size={13}
                              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                            />
                          </button>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr className="bg-neutral-950/60">
                          <td colSpan={6} className="px-5 py-5">
                            <FlagManager flag={flag} onSave={updateFlag} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
