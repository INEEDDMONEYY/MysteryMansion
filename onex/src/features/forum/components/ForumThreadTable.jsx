import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MoreVertical, Pin, Rocket } from "lucide-react";

import { isNewForumThread } from "../utils/forumUtils";

const formatActivity = (value) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  }).format(date);
};

function ThreadRowMenu({ threadHref }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${threadHref}`);
    } finally {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label="Thread options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/10 hover:text-white"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-white/10 bg-neutral-900 py-1 shadow-xl">
          <Link
            role="menuitem"
            to={threadHref}
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-gray-200 hover:bg-white/5"
          >
            Open thread
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={copyLink}
            className="block w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-white/5"
          >
            Copy link
          </button>
        </div>
      )}
    </div>
  );
}

export default function ForumThreadTable({ threads = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0 text-left md:min-w-[640px]">
        <thead>
          <tr className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
            <th scope="col" className="border-b border-white/10 px-3 py-3 sm:px-4">Topic</th>
            <th scope="col" className="hidden border-b border-white/10 px-4 py-3 md:table-cell">Category</th>
            <th scope="col" className="hidden border-b border-white/10 px-4 py-3 md:table-cell">Activity</th>
            <th scope="col" className="border-b border-white/10 px-4 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {threads.map((thread, index) => {
            const threadId = thread?.id || thread?._id || thread?.slug || index;
            const threadHref = `/forum/thread/${encodeURIComponent(threadId)}`;
            const categoryName = thread?.category?.name || thread?.categoryName || "General Discussion";
            const authorName = thread?.author?.username || thread?.author?.name || "Community Member";
            const isNew = isNewForumThread(thread);

            return (
              <tr key={threadId} className="group transition hover:bg-white/[0.03]">
                <td className="border-b border-white/5 px-3 py-4 align-middle sm:px-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={threadHref} className="text-sm font-semibold text-white transition group-hover:text-pink-300 sm:text-base">
                      {thread?.title || "Untitled discussion"}
                    </Link>

                    {isNew && (
                      <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                        New
                      </span>
                    )}

                    {thread?.pinned && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300">
                        <Pin size={11} aria-hidden="true" />
                        Pinned
                      </span>
                    )}

                    {thread?.isBoosted && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-fuchsia-300">
                        <Rocket size={11} aria-hidden="true" />
                        Boosted
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    by {authorName} · {Number(thread?.replyCount) || 0} replies · {Number(thread?.viewCount) || 0} views
                  </p>
                  <p className="mt-1 text-xs text-gray-500 md:hidden">
                    {categoryName} · {formatActivity(thread?.lastActivityAt || thread?.createdAt)}
                  </p>
                </td>

                <td className="hidden border-b border-white/5 px-4 py-4 align-middle md:table-cell">
                  <span className="inline-block rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-300">
                    {categoryName}
                  </span>
                </td>

                <td className="hidden border-b border-white/5 px-4 py-4 align-middle text-sm text-gray-400 md:table-cell">
                  <time dateTime={thread?.lastActivityAt || thread?.createdAt || undefined}>
                    {formatActivity(thread?.lastActivityAt || thread?.createdAt)}
                  </time>
                </td>

                <td className="border-b border-white/5 px-2 py-4 text-right align-middle">
                  <ThreadRowMenu threadHref={threadHref} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
