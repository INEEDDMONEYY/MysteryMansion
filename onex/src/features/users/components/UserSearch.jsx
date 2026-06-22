import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import api from "@/shared/utils/api";

export default function UserSearch({
  users = [],
  posts = [],
  query,
  onQueryChange,
  onResults = () => {},
  onSelectUser = () => {},
}) {
  const activeRequestRef = useRef(0);
  const lastResultsSignatureRef = useRef("");

  useEffect(() => {
    const emitResultsIfChanged = (nextResults) => {
      const safeResults = Array.isArray(nextResults) ? nextResults : [];
      const signature = safeResults
        .map((post) => post?._id || `${post?.userId?._id || "user"}-${post?.title || "post"}`)
        .join("|");

      if (signature === lastResultsSignatureRef.current) return;
      lastResultsSignatureRef.current = signature;
      onResults(safeResults);
    };

    const searchValue = query?.trim();

    if (!searchValue || typeof searchValue !== "string") {
      activeRequestRef.current += 1;
      lastResultsSignatureRef.current = "";
      onResults(null);
      onSelectUser(null);
      return;
    }

    const matchedUsers = users.filter((user) =>
      user?.username?.toLowerCase().includes(searchValue.toLowerCase())
    );

    if (matchedUsers.length > 0) {
      onSelectUser(matchedUsers[0].username);
    } else {
      onSelectUser(null);
    }

    // Show local matches immediately while backend fetch completes.
    const instantMatches = Array.isArray(posts)
      ? posts.filter((post) =>
          post?.userId?.username?.toLowerCase().includes(searchValue.toLowerCase())
        )
      : [];
    emitResultsIfChanged(instantMatches);

    const fetchMatchedUserPosts = async () => {
      try {
        if (matchedUsers.length === 0) {
          // Avoid broad /posts fetches when no user is matched to prevent UI thrashing.
          emitResultsIfChanged(instantMatches);
          return;
        }

        const requestId = activeRequestRef.current + 1;
        activeRequestRef.current = requestId;

        const responses = await Promise.all(
          matchedUsers.map((user) => api.get(`/posts?userId=${user._id || user.id}`))
        );

        if (requestId !== activeRequestRef.current) return;

        const combinedPosts = responses.flatMap((response) =>
          Array.isArray(response?.data) ? response.data : []
        );

        const merged = [...instantMatches, ...combinedPosts];
        const dedupedById = Array.from(new Map(merged.map((post) => [post._id, post])).values());

        emitResultsIfChanged(dedupedById);
      } catch (error) {
        console.error("Failed to fetch searched user posts:", error);
        emitResultsIfChanged(instantMatches);
      }
    };

    const timer = setTimeout(fetchMatchedUserPosts, 180);
    return () => clearTimeout(timer);
  }, [query, users, posts, onResults, onSelectUser]);

  const handleClear = () => {
    onQueryChange("");
    onResults(null);
    onSelectUser(null);
  };

  return (
    <div className="relative w-full sm:w-[200px] md:w-[200px] lg:w-[220px]">
      <input
        type="text"
        placeholder="Search users by username..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="px-3 py-1.5 text-sm border rounded w-full pr-8"
      />

      {query && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}