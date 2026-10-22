import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Flag, RefreshCw } from "lucide-react";

import { fetchMyFlags, fetchReportsAgainstMe } from "../services/flagService";
import { getFlagReasonLabel } from "../data/flagReasons";
import FlagStatusBadge from "../components/FlagStatusBadge";
import FlagTimeline from "../components/FlagTimeline";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

export default function MyReportsPage() {
  const [flags, setFlags] = useState([]);
  const [againstMe, setAgainstMe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [mine, about] = await Promise.all([
        fetchMyFlags(),
        fetchReportsAgainstMe(),
      ]);
      setFlags(mine);
      setAgainstMe(about);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-3xl space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">My Reports</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Track reports you submitted and reports filed about your account or posts.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          aria-label="Refresh"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:text-gray-900"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && againstMe.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            Reported about you
          </h3>

          <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {againstMe.map((flag) => (
              <div
                key={flag._id}
                className="flex items-start justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {flag.targetType === "post"
                      ? `Post: ${flag.targetLabel || "No longer available"}`
                      : "Your account"}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {getFlagReasonLabel(flag.targetType, flag.reason)} · Reported{" "}
                    {formatDate(flag.createdAt)}
                  </p>
                </div>

                <FlagStatusBadge status={flag.status} theme="light" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">
          Reports you submitted
        </h3>

      <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
          </div>
        ) : flags.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
            <Flag size={36} className="opacity-30" />
            <p className="text-sm">You haven't reported anything yet</p>
          </div>
        ) : (
          flags.map((flag) => {
            const isOpen = openId === flag._id;

            return (
              <div key={flag._id}>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : flag._id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {flag.targetType === "post" ? "Post" : "Account"}:{" "}
                      {flag.targetLabel || "No longer available"}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {getFlagReasonLabel(flag.targetType, flag.reason)} · Reported{" "}
                      {formatDate(flag.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <FlagStatusBadge status={flag.status} theme="light" />
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50 px-5 py-5">
                    <FlagTimeline entries={flag.timeline} theme="light" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      </div>
    </div>
  );
}
