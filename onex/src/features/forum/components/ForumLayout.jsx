import { useContext, useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  Bell,
  LayoutGrid,
  MessageSquareText,
  MessagesSquare,
  ListChecks,
  Trophy,
} from "lucide-react";
import { UserContext } from "@/context/UserContext";
import api from "@/shared/utils/api";
import { fetchProgression } from "@/features/users/services/progressionService";
import ForumSearch from "./ForumSearch";
import NewThreadButton from "./NewThreadButton";
import { FORUM_NOTIFICATIONS_CHANGED_EVENT } from "../services/forumNotificationService";

const FORUM_COUNTS_POLL_MS = 20_000;

const links = [
  { to: "/forum", label: "Overview", Icon: MessagesSquare, end: true },
  { to: "/forum/discussions", label: "Discussions", Icon: MessageSquareText },
  { to: "/forum/categories", label: "Categories", Icon: LayoutGrid, iconOnly: true },
  { to: "/forum/engagement", label: "Forum Engagement", Icon: Activity, iconOnly: true },
  { to: "/forum/notifications", label: "Forum Notifications", Icon: Bell, countKey: "notifications" },
  { to: "/forum/followed", label: "Threads Followed", Icon: ListChecks, countKey: "followed" },
];

function useForumCounts(userId) {
  const [counts, setCounts] = useState({ notifications: 0, followed: 0 });

  useEffect(() => {
    if (!userId) return undefined;
    let controller = null;
    const load = () => {
      controller?.abort();
      controller = new AbortController();
      Promise.all([
        api.get("/forum/me/notifications", { params: { limit: 1 }, signal: controller.signal }),
        api.get("/forum/threads", { params: { followed: true, limit: 1 }, signal: controller.signal }),
      ])
        .then(([notifications, followed]) => {
          setCounts({
            notifications: Number(notifications.data?.unreadCount) || 0,
            followed: Number(followed.data?.pagination?.total) || 0,
          });
        })
        .catch((err) => {
          if (err?.name !== "CanceledError" && err?.name !== "AbortError") {
            setCounts({ notifications: 0, followed: 0 });
          }
        });
    };

    load();
    const id = setInterval(load, FORUM_COUNTS_POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener(FORUM_NOTIFICATIONS_CHANGED_EVENT, load);

    return () => {
      clearInterval(id);
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener(FORUM_NOTIFICATIONS_CHANGED_EVENT, load);
    };
  }, [userId]);

  return counts;
}

function CountBadge({ count }) {
  if (!count) return null;
  return (
    <span className="ml-0.5 min-w-[18px] rounded-full bg-pink-500 px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function ForumScorePill() {
  const { user } = useContext(UserContext) || {};
  const userId = user?._id;
  const [progression, setProgression] = useState(null);

  useEffect(() => {
    if (!userId) return undefined;
    const controller = new AbortController();
    fetchProgression(userId, controller.signal)
      .then(setProgression)
      .catch(() => setProgression(null));
    return () => controller.abort();
  }, [userId]);

  if (!userId || !progression) return null;

  return (
    <span
      className="inline-flex items-center gap-2 rounded-xl border border-pink-500/20 bg-pink-500/10 px-3 py-2 text-xs font-semibold text-pink-300"
      title="Your forum score (reputation points) and level"
    >
      <Trophy size={14} aria-hidden="true" />
      Level {progression.level}
      <span className="text-gray-500">·</span>
      {progression.rp.toLocaleString("en-US")} RP
    </span>
  );
}

export default function ForumLayout() {
  const { user } = useContext(UserContext) || {};
  const counts = useForumCounts(user?._id);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const search = (value) => {
    const term = value.trim();
    if (term) navigate(`/forum/discussions?q=${encodeURIComponent(term)}`);
  };

  return (
    <>
      <nav aria-label="Forum navigation" className="sticky top-0 z-30 border-b border-white/10 bg-neutral-950/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 py-3">
            <NavLink to="/forum" className="flex items-center gap-3 text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-700">
                <MessagesSquare size={20} />
              </span>
              <span>
                <span className="block text-sm font-bold tracking-wide">COMMUNITY</span>
                <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-pink-400">Forums</span>
              </span>
            </NavLink>
            <div className="order-last min-w-0 basis-full sm:order-none sm:basis-auto sm:min-w-[200px] sm:flex-1 lg:max-w-xl">
              <ForumSearch compact query={query} onQueryChange={setQuery} onSearch={search} />
            </div>
            <div className="flex items-center gap-3">
              <ForumScorePill />
              <NewThreadButton className="min-h-10" />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-3">
            {links.map((link) => {
              const { to, label, Icon: TabIcon, end, countKey, iconOnly } = link;
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  aria-label={label}
                  title={label}
                  className={({ isActive }) =>
                    `inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition sm:text-sm ${
                      isActive
                        ? "border-pink-500/30 bg-pink-500/15 text-pink-300"
                        : "border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <TabIcon size={16} aria-hidden="true" />
                  {!iconOnly && !countKey && label}
                  {countKey && <CountBadge count={counts[countKey]} />}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>
      <Outlet />
    </>
  );
}
