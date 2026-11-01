import BrandLoader from "@/shared/components/Loaders/BrandLoader";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Inbox,
  Search,
  Mail,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  X,
} from "lucide-react";
import api from "@/shared/utils/api";

const STATUS_TABS = [
  { key: "", label: "All" },
  { key: "new", label: "New" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
];

const STATUS_STYLES = {
  new: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  in_progress: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  resolved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

const STATUS_LABELS = {
  new: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const PAGE_SIZE = 20;

const notifyUpdated = () =>
  window.dispatchEvent(new Event("contact-inquiries-updated"));

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
        STATUS_STYLES[status] || "border-neutral-700 text-neutral-300"
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function InquiryDetail({ inquiry, onClose, onUpdated, onDeleted }) {
  const [notes, setNotes] = useState(inquiry.adminNotes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setNotes(inquiry.adminNotes || "");
    setError("");
  }, [inquiry._id, inquiry.adminNotes]);

  const patch = async (body) => {
    setSaving(true);
    setError("");
    try {
      const { data } = await api.patch(
        `/admin/contact-inquiries/${inquiry._id}`,
        body
      );
      onUpdated(data);
      notifyUpdated();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to update inquiry.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this inquiry permanently?")) return;
    setSaving(true);
    setError("");
    try {
      await api.delete(`/admin/contact-inquiries/${inquiry._id}`);
      onDeleted(inquiry._id);
      notifyUpdated();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to delete inquiry.");
      setSaving(false);
    }
  };

  const replyHref =
    `mailto:${inquiry.email}` +
    `?subject=${encodeURIComponent(`Re: ${inquiry.subject}`)}` +
    `&body=${encodeURIComponent(
      `Hi ${inquiry.name},\n\n\n\n— Mystery Mansion Support\n\n> ${inquiry.message
        .split("\n")
        .join("\n> ")}`
    )}`;

  const account = inquiry.userId;

  return (
    <div className="flex h-full flex-col rounded-xl border border-neutral-800 bg-neutral-900">
      <div className="flex items-start justify-between gap-3 border-b border-neutral-800 p-4">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <StatusBadge status={inquiry.status} />
            <span className="text-xs text-neutral-400">{inquiry.topic}</span>
          </div>
          <h2 className="break-words text-lg font-semibold text-white">
            {inquiry.subject}
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            {formatDate(inquiry.createdAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white lg:hidden"
          aria-label="Close inquiry"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <div className="grid gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">From</p>
            <p className="break-words text-white">{inquiry.name}</p>
            <a
              href={`mailto:${inquiry.email}`}
              className="break-all text-pink-400 hover:underline"
            >
              {inquiry.email}
            </a>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">Account</p>
            {account?.username ? (
              <Link
                to={`/profile/${encodeURIComponent(account.username)}`}
                className="inline-flex items-center gap-1 text-pink-400 hover:underline"
              >
                <User size={14} />@{account.username}
              </Link>
            ) : (
              <p className="text-neutral-400">Not signed in</p>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-neutral-500">Message</p>
          <p className="whitespace-pre-wrap break-words rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-sm leading-relaxed text-neutral-200">
            {inquiry.message}
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-neutral-500">Status</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.filter((t) => t.key).map((tab) => (
              <button
                key={tab.key}
                type="button"
                disabled={saving || inquiry.status === tab.key}
                onClick={() => patch({ status: tab.key })}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-default ${
                  inquiry.status === tab.key
                    ? STATUS_STYLES[tab.key]
                    : "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {inquiry.handledBy?.username && (
            <p className="mt-2 text-xs text-neutral-500">
              Last updated by @{inquiry.handledBy.username}
              {inquiry.resolvedAt ? ` · resolved ${formatDate(inquiry.resolvedAt)}` : ""}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="inquiry-notes"
            className="mb-2 block text-xs uppercase tracking-wide text-neutral-500"
          >
            Internal notes
          </label>
          <textarea
            id="inquiry-notes"
            rows={4}
            maxLength={5000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Only visible to admins"
            className="w-full resize-y rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-pink-500"
          />
          <button
            type="button"
            disabled={saving || notes === (inquiry.adminNotes || "")}
            onClick={() => patch({ adminNotes: notes })}
            className="mt-2 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            Save notes
          </button>
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-neutral-800 p-4">
        <a
          href={replyHref}
          onClick={() => {
            if (inquiry.status === "new") patch({ status: "in_progress" });
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-500"
        >
          <Mail size={16} /> Reply by email
        </a>
        <button
          type="button"
          onClick={remove}
          disabled={saving}
          className="ml-auto inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50"
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </div>
  );
}

export default function AdminContactInquiriesPage() {
  const [status, setStatus] = useState("new");
  const [topic, setTopic] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);
  const [topics, setTopics] = useState([]);
  const [counts, setCounts] = useState({});
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setQuery(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/contact-inquiries", {
        params: {
          status: status || undefined,
          topic: topic || undefined,
          q: query || undefined,
          page,
          limit: PAGE_SIZE,
        },
      });
      setItems(data.items || []);
      setTopics(data.topics || []);
      setCounts(data.counts || {});
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load inquiries.");
    } finally {
      setLoading(false);
    }
  }, [status, topic, query, page]);

  useEffect(() => {
    load();
  }, [load]);

  const allCount = Object.values(counts).reduce((sum, n) => sum + n, 0);

  const handleUpdated = (updated) => {
    setSelected(updated);
    setItems((current) =>
      current.map((item) => (item._id === updated._id ? updated : item))
    );
    // Status changes shift the per-tab counts.
    load();
  };

  const handleDeleted = (id) => {
    setSelected(null);
    setItems((current) => current.filter((item) => item._id !== id));
    load();
  };

  return (
    <div className="space-y-5 p-4 text-white sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-pink-600/15 p-2.5 text-pink-400">
            <Inbox size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Contact Inquiries</h1>
            <p className="text-sm text-neutral-400">
              Messages submitted through the public contact form.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const count = tab.key ? counts[tab.key] || 0 : allCount;
          const active = status === tab.key;
          return (
            <button
              key={tab.key || "all"}
              type="button"
              onClick={() => {
                setStatus(tab.key);
                setPage(1);
                setSelected(null);
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-pink-600 text-white"
                  : "border border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 text-xs ${
                  active ? "bg-white/20" : "bg-neutral-800 text-neutral-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, email, subject or message"
            aria-label="Search inquiries"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-pink-500"
          />
        </div>
        <select
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by inquiry type"
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-pink-500"
        >
          <option value="">All inquiry types</option>
          {topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className={`${selected ? "hidden lg:block" : ""}`}>
          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
            {loading && !items.length ? (
              <BrandLoader size="sm" tone="dark" />
            ) : !items.length ? (
              <div className="p-10 text-center text-sm text-neutral-400">
                No inquiries found.
              </div>
            ) : (
              <ul className="divide-y divide-neutral-800">
                {items.map((item) => (
                  <li key={item._id}>
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className={`w-full px-4 py-3 text-left transition hover:bg-neutral-800/60 ${
                        selected?._id === item._id ? "bg-neutral-800" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`truncate text-sm ${
                            item.status === "new" ? "font-semibold text-white" : "text-neutral-200"
                          }`}
                        >
                          {item.name}
                        </span>
                        <span className="shrink-0 text-[11px] text-neutral-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="truncate text-sm text-neutral-300">{item.subject}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <StatusBadge status={item.status} />
                        <span className="truncate text-[11px] text-neutral-500">
                          {item.topic}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {pages > 1 && (
            <div className="mt-3 flex items-center justify-between text-sm text-neutral-400">
              <span>
                Page {page} of {pages} · {total} total
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-neutral-700 p-1.5 hover:bg-neutral-800 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-neutral-700 p-1.5 hover:bg-neutral-800 disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={`${selected ? "" : "hidden lg:block"}`}>
          {selected ? (
            <InquiryDetail
              inquiry={selected}
              onClose={() => setSelected(null)}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center rounded-xl border border-dashed border-neutral-800 text-sm text-neutral-500">
              Select an inquiry to view it.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
