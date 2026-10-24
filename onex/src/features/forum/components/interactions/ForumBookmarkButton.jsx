import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";

import useForumInteractions from "../../hooks/useForumInteractions";

export default function ForumBookmarkButton({
  threadId,
  bookmarked = false,
  canBookmark = true,
  onRequireAuth,
  className = "",
}) {
  const { busy, bookmark } = useForumInteractions();
  const [active, setActive] = useState(bookmarked);

  useEffect(() => {
    setActive(bookmarked);
  }, [bookmarked]);

  const toggle = async () => {
    if (!canBookmark) {
      onRequireAuth?.();
      return;
    }

    if (busy) return;

    const previous = active;
    setActive(!previous);

    try {
      const result = await bookmark(threadId);
      setActive(Boolean(result.bookmarked));
    } catch {
      setActive(previous);
    }
  };

  const Icon = active ? BookmarkCheck : Bookmark;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={active}
      className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-60 ${
        active
          ? "border-pink-300 bg-pink-50 text-pink-700"
          : "border-gray-200 bg-white text-gray-600 hover:border-pink-300 hover:text-pink-600"
      } ${className}`}
    >
      <Icon className="h-4 w-4" />
      {active ? "Saved" : "Save"}
    </button>
  );
}
