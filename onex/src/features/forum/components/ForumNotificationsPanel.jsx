import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import BrandLoader from "@/shared/components/Loaders/BrandLoader";
import {
  getForumNotifications,
  markAllForumNotificationsRead,
  markForumNotificationRead,
} from "../services/forumNotificationService";

export default function ForumNotificationsPanel() {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);
  const mounted = useRef(false);

  const load = useCallback(async (page = 1) => {
    const request = ++requestId.current;
    setLoading(page === 1);
    setLoadingMore(page > 1);
    setError("");
    try {
      const result = await getForumNotifications({ page, unread });
      if (request !== requestId.current) return;
      setData((current) => ({
        ...result,
        notifications: page > 1
          ? [...new Map([...(current?.notifications || []), ...result.notifications].map((item) => [item._id, item])).values()]
          : result.notifications,
      }));
    } catch (err) {
      if (request === requestId.current) {
        setError(err instanceof Error ? err.message : "Unable to load forum notifications.");
      }
    } finally {
      if (request === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [unread]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
      requestId.current += 1;
    };
  }, [load]);

  const markRead = async (notification = null) => {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      if (notification) {
        if (!notification.read) await markForumNotificationRead(notification._id);
      } else {
        await markAllForumNotificationsRead();
      }
      if (!mounted.current) return;
      await load();
      if (notification?.meta?.threadId && mounted.current) {
        navigate(`/forum/thread/${encodeURIComponent(notification.meta.threadId)}`);
      }
    } catch (err) {
      if (mounted.current) setError(err instanceof Error ? err.message : "Unable to mark notifications read.");
    } finally {
      if (mounted.current) setSaving(false);
    }
  };

  const busy = loading || loadingMore || saving;

  return (
    <section aria-label="Your forum notifications" className="rounded-2xl border border-white/10 bg-neutral-900 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2" aria-label="Filter forum notifications">
          {[{ label: "All", value: false }, { label: "Unread", value: true }].map((filter) => (
            <button
              key={filter.label}
              type="button"
              aria-pressed={unread === filter.value}
              disabled={busy}
              onClick={() => setUnread(filter.value)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50 ${unread === filter.value ? "bg-pink-500/15 text-pink-300" : "text-gray-400 hover:text-white"}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {data && !loading && <span className="text-xs text-gray-400" role="status">{data.unreadCount} unread</span>}
          <button type="button" disabled={busy || !data?.unreadCount} onClick={() => markRead()} className="inline-flex items-center gap-2 text-xs font-semibold text-pink-300 disabled:opacity-40">
            <CheckCheck size={16} /> Mark all read
          </button>
          <button type="button" aria-label="Refresh forum notifications" disabled={busy} onClick={() => load()} className="rounded-lg border border-white/10 p-2 text-gray-400 hover:text-white disabled:opacity-50">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}
      {loading ? (
        <BrandLoader size="sm" className="py-12" />
      ) : !data ? null : data.notifications.length === 0 ? (
        <div className="py-14 text-center">
          <Bell size={32} className="mx-auto text-pink-400/50" />
          <h2 className="mt-4 text-lg font-bold text-white">{unread ? "You're all caught up" : "No forum notifications yet"}</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-gray-400">
            Replies to your discussions and comments appear here. Follow a thread and enable its bell for additional reply alerts.
          </p>
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-white/5">
          {data.notifications.map((notification) => (
            <li key={notification._id}>
              <button
                type="button"
                disabled={busy}
                onClick={() => markRead(notification)}
                className={`flex w-full items-start gap-3 rounded-xl px-3 py-5 text-left transition hover:bg-white/5 disabled:opacity-50 ${notification.read ? "text-gray-400" : "text-white"}`}
              >
                <Bell size={18} className={`mt-1 shrink-0 ${notification.read ? "text-gray-500" : "text-pink-400"}`} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{notification.title}</span>
                  <span className="mt-1 block break-words text-sm leading-6 text-gray-400">{notification.message}</span>
                  <time dateTime={notification.createdAt} className="mt-2 block text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </time>
                  {!notification.read && <span className="mt-2 block text-xs font-semibold text-pink-400">Unread</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {!loading && data?.pagination.hasNextPage && (
        <button type="button" disabled={busy} onClick={() => load(data.pagination.page + 1)} className="mt-5 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
          {loadingMore ? "Loading..." : "Load more notifications"}
        </button>
      )}
    </section>
  );
}
