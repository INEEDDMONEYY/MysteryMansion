import { useEffect, useState } from "react";
import { CalendarPlus, CheckCircle2, XCircle, RefreshCcw, Trash2 } from "lucide-react";
import { useUser } from "@/context/useUser";
import api from "@/shared/utils/api";

const STATUS_OPTIONS = [
  { value: "incall", label: "Incall", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 border-green-300" },
  { value: "outcall", label: "Outcall", icon: XCircle, color: "text-red-500", bg: "bg-red-50 border-red-300" },
  { value: "overnight", label: "Overnight", icon: RefreshCcw, color: "text-amber-600", bg: "bg-amber-50 border-amber-300" },
  { value: "flyOut", label: "Fly-Out", icon: CalendarPlus, color: "text-sky-600", bg: "bg-sky-50 border-sky-300" },
];

const STATUS_BADGE = {
  incall: "bg-green-100 text-green-700 border border-green-200",
  outcall: "bg-red-100 text-red-600 border border-red-200",
  overnight: "bg-amber-100 text-amber-700 border border-amber-200",
  flyOut: "bg-sky-100 text-sky-700 border border-sky-200",
};

export default function CompletedDates({ userId }) {
  const { user } = useUser();
  const isOwner = user && userId && (user._id === userId || user.id === userId);

  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("incall");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const normalizeEntries = (rawEntries) => {
    if (!Array.isArray(rawEntries)) return [];

    return rawEntries
      .map((entry) => {
        const id = String(entry?.id || entry?._id || crypto.randomUUID());
        const rawDate = String(entry?.date || "").slice(0, 10);
        const nextStatus = String(entry?.status || "");
        const isValidStatus = STATUS_OPTIONS.some((opt) => opt.value === nextStatus);

        if (!rawDate || !isValidStatus) return null;
        return { id, date: rawDate, status: nextStatus };
      })
      .filter(Boolean);
  };

  useEffect(() => {
    let cancelled = false;

    const loadCompletedDates = async () => {
      if (!userId) {
        setEntries([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await api.get(`/public/users/id/${userId}`);
        if (cancelled) return;
        const userData = res?.data || {};
        setEntries(normalizeEntries(userData.completedDates));
      } catch {
        if (cancelled) return;
        setEntries([]);
        setError("Unable to load completed dates.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCompletedDates();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const persistEntries = async (nextEntries) => {
    if (!isOwner) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/users/update-profile", { completedDates: nextEntries });
    } catch {
      setError("Failed to save completed dates.");
      throw new Error("save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!date) return;
    const nextEntries = [
      { id: crypto.randomUUID(), date, status },
      ...entries,
    ];
    setEntries(nextEntries);

    try {
      await persistEntries(nextEntries);
    } catch {
      setEntries(entries);
      return;
    }

    setDate("");
    setStatus("incall");
  };

  const handleRemove = async (id) => {
    const nextEntries = entries.filter((e) => e.id !== id);
    setEntries(nextEntries);

    try {
      await persistEntries(nextEntries);
    } catch {
      setEntries(entries);
    }
  };

  return (
    <div className="rounded-xl border border-pink-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-800 tracking-wide uppercase">
        Completed Dates
      </h3>

      {/* Input row — owner only */}
      {isOwner && (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <label className="text-xs font-medium text-gray-500">Date Hosted</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Service Type</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={`flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-medium transition active:scale-95 ${
                  status === opt.value
                    ? `${opt.bg} ${opt.color} ring-2 ring-offset-1 ring-pink-300`
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <opt.icon size={13} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!date || saving}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-pink-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CalendarPlus size={15} />
          {saving ? "Saving..." : "Add"}
        </button>
      </div>
      )}

      {/* Entries list */}
      {loading ? (
        <p className="mt-5 text-center text-xs text-gray-400">Loading completed dates...</p>
      ) : entries.length > 0 ? (
        <ul className="mt-5 space-y-2">
          {entries.map(({ id, date, status }) => {
            const opt = STATUS_OPTIONS.find((o) => o.value === status);
            const Icon = opt?.icon;
            return (
              <li
                key={id}
                className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="shrink-0 text-sm text-gray-700">
                    {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[status]}`}
                  >
                    {Icon && <Icon size={11} />}
                    {opt?.label}
                  </span>
                </div>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => handleRemove(id)}
                    disabled={saving}
                    className="shrink-0 rounded p-1 text-gray-400 transition hover:text-red-500 active:scale-95"
                    aria-label="Remove entry"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-5 text-center text-xs text-gray-400">
          No dates recorded yet.
        </p>
      )}

      {error && <p className="mt-3 text-center text-xs text-red-500">{error}</p>}
    </div>
  );
}
