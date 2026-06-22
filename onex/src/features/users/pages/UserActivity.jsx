import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FileText, MessageCircle, Star, Mail,
  ImageIcon, ChevronLeft, ChevronRight,
  RefreshCw, Inbox,
} from "lucide-react";
import { useUser } from "@/context/useUser";
import api from "@/shared/utils/api";
import { setSEO } from "@/shared/utils/seo";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : "—";

const TABS = [
  { id: "posts",    label: "Posts",    icon: FileText },
  { id: "comments", label: "Comments", icon: MessageCircle },
  { id: "reviews",  label: "Reviews",  icon: Star },
  { id: "messages", label: "Messages", icon: Mail },
];

// ─────────────────────────────────────────────────────────────────────────────
// Shared sub-components
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center mb-3">
        <Icon size={24} className="text-pink-300" />
      </div>
      <p className="text-sm text-gray-500">No {label} yet.</p>
    </div>
  );
}

function Pagination({ page, total, limit, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
      <span>
        Page {page} of {totalPages} &nbsp;·&nbsp; {total} total
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function TableShell({ head, children, total, limit, page, onPage }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {head.map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">{children}</tbody>
        </table>
      </div>
      <Pagination page={page} total={total} limit={limit} onChange={onPage} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab content panels
// ─────────────────────────────────────────────────────────────────────────────

function PostsTable({ items, total, limit, page, onPage }) {
  if (!items.length) return <EmptyState icon={FileText} label="posts" />;
  return (
    <TableShell
      head={["Post", "Categories", "Date"]}
      total={total} limit={limit} page={page} onPage={onPage}
    >
      {items.map((p) => {
        const thumb = p.pictures?.[0];
        const cats  = (p.categories || []).filter((c) => c !== "uncategorized");
        return (
          <tr key={p._id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                  {thumb
                    ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                    : <ImageIcon size={14} className="text-gray-300" />}
                </div>
                <div className="min-w-0">
                  <Link
                    to={`/posts/${p._id}`}
                    className="font-medium text-gray-900 hover:text-pink-600 transition-colors truncate block max-w-[200px]"
                  >
                    {p.title || "Untitled"}
                  </Link>
                  {p.description && (
                    <p className="text-xs text-gray-400 truncate max-w-[200px]">{p.description}</p>
                  )}
                </div>
              </div>
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-1">
                {cats.slice(0, 3).map((c) => (
                  <span key={c} className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 text-[10px] font-medium whitespace-nowrap">
                    {c}
                  </span>
                ))}
                {cats.length === 0 && <span className="text-xs text-gray-400">—</span>}
              </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">{fmt(p.createdAt)}</td>
          </tr>
        );
      })}
    </TableShell>
  );
}

function CommentsTable({ items, total, limit, page, onPage }) {
  if (!items.length) return <EmptyState icon={MessageCircle} label="comments" />;
  return (
    <TableShell
      head={["Comment", "Post", "Date"]}
      total={total} limit={limit} page={page} onPage={onPage}
    >
      {items.map((c) => (
        <tr key={c._id} className="hover:bg-gray-50 transition-colors">
          <td className="px-4 py-3 max-w-xs">
            <p className="text-gray-700 text-sm line-clamp-2">{c.text}</p>
          </td>
          <td className="px-4 py-3">
            {c.postId ? (
              <Link
                to={`/posts/${c.postId._id}`}
                className="text-pink-600 hover:underline text-xs font-medium truncate block max-w-[160px]"
              >
                {c.postId.title || "View Post"}
              </Link>
            ) : (
              <span className="text-gray-400 text-xs">Post removed</span>
            )}
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">{fmt(c.createdAt)}</td>
        </tr>
      ))}
    </TableShell>
  );
}

function ReviewsTable({ items, total, limit, page, onPage }) {
  if (!items.length) return <EmptyState icon={Star} label="reviews" />;
  return (
    <TableShell
      head={["Review", "From", "Date"]}
      total={total} limit={limit} page={page} onPage={onPage}
    >
      {items.map((r) => (
        <tr key={r._id} className="hover:bg-gray-50 transition-colors">
          <td className="px-4 py-3 max-w-xs">
            <p className="text-gray-700 text-sm line-clamp-2">{r.text}</p>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              {r.authorUserId?.profilePic && (
                <img
                  src={r.authorUserId.profilePic}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover shrink-0"
                />
              )}
              <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]">
                {r.authorUserId?.username || "Anonymous"}
              </span>
            </div>
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">{fmt(r.createdAt)}</td>
        </tr>
      ))}
    </TableShell>
  );
}

function MessagesTable({ items, total, limit, page, onPage }) {
  if (!items.length) return <EmptyState icon={Mail} label="messages" />;
  return (
    <TableShell
      head={["Message", "To", "Date"]}
      total={total} limit={limit} page={page} onPage={onPage}
    >
      {items.map((m) => {
        const preview = m.content || m.text || "";
        const isRead = Array.isArray(m.readBy) ? m.readBy.length > 1 : m.read;
        return (
          <tr key={m._id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 max-w-xs">
              <div className="flex items-center gap-2">
                {!isRead && (
                  <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" title="Unread" />
                )}
                <p className="text-gray-700 text-sm line-clamp-2">{preview || "(No content)"}</p>
              </div>
            </td>
            <td className="px-4 py-3">
              <span className="text-xs font-medium text-gray-700 truncate block max-w-[120px]">
                {m.receiverId?.username || "Admin"}
              </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">{fmt(m.createdAt)}</td>
          </tr>
        );
      })}
    </TableShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

const LIMIT = 15;

export default function UserActivity() {
  const { user, loading: userLoading } = useUser();
  const [activeTab, setActiveTab]     = useState("posts");
  const [pages, setPages]             = useState({ posts: 1, comments: 1, reviews: 1, messages: 1 });
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  useEffect(() => {
    setSEO("Activity | Mystery Mansion", "", { robots: "noindex, nofollow" });
  }, []);

  const fetchActivity = useCallback(async (tab, page) => {
    if (!user?._id) return;
    setLoading(true);
    setError("");
    try {
      const { data: res } = await api.get("/users/me/activity", {
        params: { page, limit: LIMIT },
      });
      setData(res);
    } catch {
      setError("Failed to load activity. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (!userLoading && user?._id) {
      fetchActivity(activeTab, pages[activeTab]);
    }
  }, [user?._id, userLoading, activeTab, pages, fetchActivity]);

  const setPage = (tab, page) =>
    setPages((prev) => ({ ...prev, [tab]: page }));

  const tabCounts = {
    posts:    data?.posts?.total    ?? 0,
    comments: data?.comments?.total ?? 0,
    reviews:  data?.reviews?.total  ?? 0,
    messages: data?.messages?.total ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Activity</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your posts, comments, reviews and messages.</p>
        </div>
        <button
          onClick={() => fetchActivity(activeTab, pages[activeTab])}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl w-fit flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === id
                ? "bg-white shadow-sm text-pink-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Icon size={15} className="shrink-0" />
            {label}
            {tabCounts[id] > 0 && (
              <span className={`min-w-[20px] text-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                activeTab === id ? "bg-pink-100 text-pink-700" : "bg-gray-200 text-gray-600"
              }`}>
                {tabCounts[id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !data && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {!loading && data && (
        <>
          {activeTab === "posts" && (
            <PostsTable
              items={data.posts.items}
              total={data.posts.total}
              limit={LIMIT}
              page={pages.posts}
              onPage={(p) => setPage("posts", p)}
            />
          )}
          {activeTab === "comments" && (
            <CommentsTable
              items={data.comments.items}
              total={data.comments.total}
              limit={LIMIT}
              page={pages.comments}
              onPage={(p) => setPage("comments", p)}
            />
          )}
          {activeTab === "reviews" && (
            <ReviewsTable
              items={data.reviews.items}
              total={data.reviews.total}
              limit={LIMIT}
              page={pages.reviews}
              onPage={(p) => setPage("reviews", p)}
            />
          )}
          {activeTab === "messages" && (
            <MessagesTable
              items={data.messages.items}
              total={data.messages.total}
              limit={LIMIT}
              page={pages.messages}
              onPage={(p) => setPage("messages", p)}
            />
          )}
        </>
      )}

      {/* Signed-out state */}
      {!userLoading && !user?._id && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Inbox size={32} className="text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">Sign in to view your activity.</p>
        </div>
      )}
    </div>
  );
}

