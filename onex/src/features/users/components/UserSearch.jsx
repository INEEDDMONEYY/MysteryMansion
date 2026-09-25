import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

import api from "@/shared/utils/api";

export default function UserSearch({
  users = [],
  posts = [],
  query = "",
  onQueryChange,
  onResults = () => {},
  onSelectUser = () => {},
  placeholder = "Search users by username...",
}) {
  const activeRequestRef = useRef(0);
  const lastResultsSignatureRef = useRef("");

  useEffect(() => {
    const emitResultsIfChanged = (nextResults) => {
      const safeResults = Array.isArray(nextResults)
        ? nextResults
        : [];

      const signature = safeResults
        .map(
          (post) =>
            post?._id ||
            `${post?.userId?._id || "user"}-${
              post?.title || "post"
            }`
        )
        .join("|");

      if (signature === lastResultsSignatureRef.current) {
        return;
      }

      lastResultsSignatureRef.current = signature;
      onResults(safeResults);
    };

    const searchValue =
      typeof query === "string" ? query.trim() : "";

    if (!searchValue) {
      activeRequestRef.current += 1;
      lastResultsSignatureRef.current = "";
      onResults(null);
      onSelectUser(null);
      return;
    }

    const normalizedSearchValue =
      searchValue.toLowerCase();

    const matchedUsers = Array.isArray(users)
      ? users.filter((user) =>
          user?.username
            ?.toLowerCase()
            .includes(normalizedSearchValue)
        )
      : [];

    if (matchedUsers.length > 0) {
      onSelectUser(matchedUsers[0]?.username || null);
    } else {
      onSelectUser(null);
    }

    const instantMatches = Array.isArray(posts)
      ? posts.filter((post) =>
          post?.userId?.username
            ?.toLowerCase()
            .includes(normalizedSearchValue)
        )
      : [];

    emitResultsIfChanged(instantMatches);

    const fetchMatchedUserPosts = async () => {
      if (matchedUsers.length === 0) {
        emitResultsIfChanged(instantMatches);
        return;
      }

      const requestId =
        activeRequestRef.current + 1;

      activeRequestRef.current = requestId;

      try {
        const responses = await Promise.all(
          matchedUsers.map((user) =>
            api.get(
              `/posts?userId=${encodeURIComponent(
                user?._id || user?.id
              )}`
            )
          )
        );

        if (
          requestId !== activeRequestRef.current
        ) {
          return;
        }

        const combinedPosts = responses.flatMap(
          (response) =>
            Array.isArray(response?.data)
              ? response.data
              : []
        );

        const mergedPosts = [
          ...instantMatches,
          ...combinedPosts,
        ];

        const dedupedPosts = Array.from(
          new Map(
            mergedPosts
              .filter((post) => post?._id)
              .map((post) => [post._id, post])
          ).values()
        );

        emitResultsIfChanged(dedupedPosts);
      } catch (error) {
        if (
          requestId !== activeRequestRef.current
        ) {
          return;
        }

        console.error(
          "Failed to fetch searched user posts:",
          error
        );

        emitResultsIfChanged(instantMatches);
      }
    };

    const timer = setTimeout(
      fetchMatchedUserPosts,
      180
    );

    return () => {
      clearTimeout(timer);
    };
  }, [
    query,
    users,
    posts,
    onResults,
    onSelectUser,
  ]);

  const handleClear = () => {
    activeRequestRef.current += 1;
    lastResultsSignatureRef.current = "";

    onQueryChange?.("");
    onResults(null);
    onSelectUser(null);
  };

  return (
    <div className="relative w-full">
      <Search
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="search"
        value={query}
        onChange={(event) =>
          onQueryChange?.(event.target.value)
        }
        placeholder={placeholder}
        aria-label="Search users by username"
        className="w-full rounded-xl border border-black/10 bg-gray-50 py-3 pl-11 pr-11 text-sm text-black shadow-sm outline-none transition focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/10"
      />

      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full p-1.5 text-gray-400 transition hover:bg-gray-200 hover:text-gray-700"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}