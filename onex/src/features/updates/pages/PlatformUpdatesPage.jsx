import { useState, useEffect } from "react";
import api from "@/shared/utils/api";
import { useUser } from "@/context/useUser";
import { setSEO } from "@/shared/utils/seo";
import {
  Newspaper, Sparkles, Pencil, Trash2,
  ChevronDown, ChevronUp, RefreshCw, Zap,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────
const FILTERS = [
  { label: "All Posts",         value: "all"      },
  { label: "Platform Updates",  value: "platform" },
  { label: "Upcoming Features", value: "feature"  },
];

const TYPE_META = {
  platform: {
    label: "Platform Update",
    badge: "bg-pink-100 text-pink-700",
    bar:   "bg-pink-500",
    dot:   "bg-pink-400",
  },
  feature: {
    label: "Upcoming Feature",
    badge: "bg-purple-100 text-purple-700",
    bar:   "bg-purple-500",
    dot:   "bg-purple-400",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function isNew(createdAt) {
  return (Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24) <= 7;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function toLines(description = "") {
  return description
    .split(/\r?\n/)
    .map((l) => l.trim().replace(/^[-*•]\s*/, ""))
    .filter(Boolean);
}

// ── BlogCard ──────────────────────────────────────────────────────────────────
function BlogCard({
  update, isAdmin,
  editingId, editForm, savingEdit,
  onEdit, onDelete, onSave, onCancel, onEditChange,
}) {
  const [expanded, setExpanded] = useState(false);
  const isEditing = editingId === update._id;
  const meta = TYPE_META[update.type] || TYPE_META.platform;
  const lines = toLines(update.description);
  const preview = lines.slice(0, 3);
  const hasMore = lines.length > 3;

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Colour accent bar */}
      <div className={`h-1 ${meta.bar}`} />

      <div className="p-6 flex flex-col flex-1">
        {isEditing ? (
          <div className="space-y-3 flex-1">
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => onEditChange("title", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Update title"
            />
            <textarea
              value={editForm.description}
              onChange={(e) => onEditChange("description", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[110px] resize-y focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Details — one point per line"
            />
            <select
              value={editForm.type}
              onChange={(e) => onEditChange("type", e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="platform">Platform Update</option>
              <option value="feature">Upcoming Feature</option>
            </select>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onSave(update._id)}
                disabled={savingEdit}
                className="text-xs bg-pink-600 text-white px-4 py-1.5 rounded-lg hover:bg-pink-700 transition disabled:opacity-60"
              >
                {savingEdit ? "Saving…" : "Save"}
              </button>
              <button
                onClick={onCancel}
                disabled={savingEdit}
                className="text-xs bg-gray-100 text-gray-700 px-4 py-1.5 rounded-lg hover:bg-gray-200 transition disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Badges + admin controls */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${meta.badge}`}>
                  {meta.label}
                </span>
                {isNew(update.createdAt) && (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    NEW
                  </span>
                )}
              </div>

              {isAdmin && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEdit(update)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(update._id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-gray-900 leading-snug mb-3">
              {update.title}
            </h2>

            {/* Bullet points */}
            <ul className="space-y-2 mb-3 flex-1">
              {(expanded ? lines : preview).map((line, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-gray-600 leading-relaxed">
                  <span className={`mt-[7px] w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
                  {line}
                </li>
              ))}
            </ul>

            {hasMore && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-xs font-medium text-pink-600 hover:text-pink-700 mb-3 transition"
              >
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                {expanded ? "Show less" : `+${lines.length - 3} more`}
              </button>
            )}

            {/* Footer */}
            <p className="text-xs text-gray-400 pt-3 border-t border-gray-100 mt-auto">
              {formatDate(update.createdAt)}
            </p>
          </>
        )}
      </div>
    </article>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-1 bg-gray-100" />
      <div className="p-6 space-y-3">
        <div className="h-4 w-24 bg-gray-100 rounded-full" />
        <div className="h-5 w-3/4 bg-gray-100 rounded-lg" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded-lg" />
          <div className="h-3 w-5/6 bg-gray-100 rounded-lg" />
          <div className="h-3 w-4/6 bg-gray-100 rounded-lg" />
        </div>
        <div className="h-3 w-20 bg-gray-100 rounded-full mt-4" />
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PlatformUpdatesPage() {
  const [updates, setUpdates]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [filter, setFilter]         = useState("all");
  const [editingId, setEditingId]   = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm]     = useState({ title: "", description: "", type: "platform" });
  const { user } = useUser();
  const isAdmin = user?.role === "admin";

  const fetchUpdates = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/platform-updates");
      setUpdates(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load updates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSEO(
      "Platform Updates | Mystery Mansion",
      "Stay up to date with the latest features, improvements, and announcements from Mystery Mansion.",
      { robots: "index, follow", canonicalPath: "/platform-updates" }
    );
    fetchUpdates();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this update?")) return;
    try {
      await api.delete(`/platform-updates/${id}`);
      setUpdates((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to delete");
    }
  };

  const startEdit = (update) => {
    setEditingId(update._id);
    setEditForm({
      title:       update.title       || "",
      description: update.description || "",
      type:        update.type        || "platform",
    });
  };

  const cancelEdit = () => {
    setEditingId("");
    setSavingEdit(false);
    setEditForm({ title: "", description: "", type: "platform" });
  };

  const saveEdit = async (id) => {
    const title       = editForm.title.trim();
    const description = editForm.description.trim();
    if (!title || !description) { alert("Title and description are required."); return; }
    try {
      setSavingEdit(true);
      const { data } = await api.put(`/platform-updates/${id}`, {
        title, description, type: editForm.type,
      });
      const updated = data?.data;
      if (updated) setUpdates((prev) => prev.map((u) => (u._id === id ? updated : u)));
      cancelEdit();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to save");
      setSavingEdit(false);
    }
  };

  const editChange = (key, val) => setEditForm((prev) => ({ ...prev, [key]: val }));

  const filtered = filter === "all" ? updates : updates.filter((u) => u.type === filter);
  const counts = {
    all:      updates.length,
    platform: updates.filter((u) => u.type === "platform").length,
    feature:  updates.filter((u) => u.type === "feature").length,
  };
  const thisWeek = updates.filter((u) => isNew(u.createdAt)).length;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <Newspaper size={12} />
            Mystery Mansion Blog
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
            What's New
          </h1>

          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Platform updates, upcoming features, and announcements —
            everything happening at Mystery Mansion.
          </p>

          {/* Stats row */}
          {!loading && (
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{counts.platform}</p>
                <p className="text-xs text-gray-400 mt-0.5">Updates</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{counts.feature}</p>
                <p className="text-xs text-gray-400 mt-0.5">Features</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{thisWeek}</p>
                <p className="text-xs text-gray-400 mt-0.5">This week</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Filter + refresh bar */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === f.value
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {f.label}
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                filter === f.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {counts[f.value]}
              </span>
            </button>
          ))}

          <button
            onClick={fetchUpdates}
            disabled={loading}
            title="Refresh"
            className="ml-auto p-2 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Post grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 text-sm">{error}</p>
            <button onClick={fetchUpdates} className="mt-4 text-sm text-pink-600 hover:underline">
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Zap size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm font-medium">Nothing here yet.</p>
            <p className="text-gray-300 text-xs mt-1">Check back soon for updates.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {filtered.map((update) => (
              <BlogCard
                key={update._id}
                update={update}
                isAdmin={isAdmin}
                editingId={editingId}
                editForm={editForm}
                savingEdit={savingEdit}
                onEdit={startEdit}
                onDelete={handleDelete}
                onSave={saveEdit}
                onCancel={cancelEdit}
                onEditChange={editChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
