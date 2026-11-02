import { NavLink, Outlet } from "react-router-dom";
import {
  Activity,
  Bell,
  LayoutGrid,
  MessageSquareText,
  MessagesSquare,
  ShieldCheck,
  ListChecks,
} from "lucide-react";
import NewThreadButton from "./NewThreadButton";

const links = [
  { to: "/forum", label: "Overview", Icon: MessagesSquare, end: true },
  { to: "/forum/discussions", label: "Discussions", Icon: MessageSquareText },
  { to: "/forum/categories", label: "Categories", Icon: LayoutGrid },
  { to: "/forum/engagement", label: "Forum Engagement", Icon: Activity },
  { to: "/forum/notifications", label: "Forum Notifications", Icon: Bell },
  { to: "/forum/followed", label: "Threads Followed", Icon: ListChecks },
  { to: "/community-guidelines", label: "Guidelines", Icon: ShieldCheck },
];

export default function ForumLayout() {
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
            <NewThreadButton className="min-h-10" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-3">
            {links.map((link) => {
              const { to, label, Icon: TabIcon, end } = link;
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition sm:text-sm ${
                      isActive
                        ? "border-pink-500/30 bg-pink-500/15 text-pink-300"
                        : "border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <TabIcon size={16} aria-hidden="true" />
                  {label}
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
