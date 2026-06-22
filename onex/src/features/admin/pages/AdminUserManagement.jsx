import { useEffect, useRef, useState } from "react";
import api from "@/shared/utils/api";
import PromoteAccountSettings from "@/shared/components/admin/settings/PromoteAccountSettings";
import PromocodeSettings from "@/shared/components/admin/settings/PromocodeSettings";
import PromotionRequestsAdmin from "@/shared/components/admin/settings/PromotionRequestsAdmin.jsx";

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState("");

  const postsRailRef = useRef(null);
  const usersRailRef = useRef(null);

  const scrollPosts = (direction) => {
    const container = postsRailRef.current;
    if (!container) return;

    const amount = Math.max(container.clientWidth * 0.8, 280);
    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const scrollUsers = (direction) => {
    const container = usersRailRef.current;
    if (!container) return;

    const amount = Math.max(container.clientWidth * 0.8, 280);
    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const sortedUsersForProfiles = [...users].sort((a, b) => {
    const aHasProfilePic = Boolean(a?.profilePic);
    const bHasProfilePic = Boolean(b?.profilePic);
    const aHasBio = Boolean(a?.bio?.trim());
    const bHasBio = Boolean(b?.bio?.trim());

    const aScore = Number(aHasProfilePic) + Number(aHasBio);
    const bScore = Number(bHasProfilePic) + Number(bHasBio);

    if (aScore !== bScore) return bScore - aScore;

    const aName = (a?.username || a?.email || "").toLowerCase();
    const bName = (b?.username || b?.email || "").toLowerCase();
    return aName.localeCompare(bName);
  });

  useEffect(() => {
    const fetchUsersAndPosts = async () => {
      setUsersLoading(true);
      setPostsLoading(true);
      setUsersError("");
      setPostsError("");

      const [usersResult, postsResult] = await Promise.allSettled([
        api.get("/admin/users"),
        api.get("/posts"),
      ]);

      if (usersResult.status === "fulfilled") {
        const usersData = usersResult.value?.data;
        if (Array.isArray(usersData)) {
          setUsers(usersData);
        } else if (Array.isArray(usersData?.data)) {
          setUsers(usersData.data);
        } else if (Array.isArray(usersData?.users)) {
          setUsers(usersData.users);
        } else {
          setUsers([]);
        }
      } else {
        console.error("Failed to fetch users:", usersResult.reason);
        setUsers([]);
        setUsersError(
          usersResult.reason?.response?.data?.error ||
            "Failed to fetch users. Make sure you are an admin."
        );
      }

      if (postsResult.status === "fulfilled") {
        const postsData = postsResult.value?.data;
        setPosts(Array.isArray(postsData) ? postsData.slice(0, 30) : []);
      } else {
        console.error("Failed to fetch posts:", postsResult.reason);
        setPosts([]);
        const status = postsResult.reason?.response?.status;
        const backendMsg = postsResult.reason?.response?.data?.error;
        setPostsError(
          backendMsg ||
            (status
              ? `Failed to fetch posts for the platform feed (status ${status}).`
              : "Failed to fetch posts for the platform feed. Check API base URL/proxy.")
        );
      }

      setUsersLoading(false);
      setPostsLoading(false);
    };

    fetchUsersAndPosts();
  }, []);

  return (
    <div className="space-y-6 pb-8">
      {usersError && <p className="text-red-400 text-sm mb-2">{usersError}</p>}

      {/* Platform Posts rail */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Platform Posts</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Showing latest 30 posts. Swipe or use arrows to scroll.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollPosts("left")}
              className="rounded-xl border border-neutral-700 px-3 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition"
              aria-label="Scroll posts left"
            >
              ← Left
            </button>
            <button
              type="button"
              onClick={() => scrollPosts("right")}
              className="rounded-xl border border-neutral-700 px-3 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition"
              aria-label="Scroll posts right"
            >
              Right →
            </button>
          </div>
        </div>

        {postsError && <p className="mb-3 text-sm text-red-400">{postsError}</p>}

        {postsLoading ? (
          <p className="text-neutral-500 text-sm">Loading posts...</p>
        ) : posts.length > 0 ? (
          <div
            ref={postsRailRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
          >
            {posts.map((post) => (
              <article
                key={post._id}
                className="min-w-[240px] max-w-[240px] snap-start rounded-xl border border-neutral-700 bg-neutral-800 p-3 shrink-0"
              >
                {Array.isArray(post.pictures) && post.pictures[0] && (
                  <img
                    src={post.pictures[0]}
                    alt={post.title || "Post image"}
                    className="mb-3 h-32 w-full rounded-lg object-cover"
                  />
                )}
                <h3 className="line-clamp-1 text-sm font-semibold text-white">{post.title || "Untitled post"}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-neutral-400">{post.description || "No description."}</p>
                <p className="mt-2 text-xs text-rose-400">@{post.userId?.username || "unknown"}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 text-sm">No posts available.</p>
        )}
      </div>

      {/* User Profiles rail */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">User Profiles</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Profiles with picture and bio shown first. Swipe or use arrows.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollUsers("left")}
              className="rounded-xl border border-neutral-700 px-3 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition"
              aria-label="Scroll users left"
            >
              ← Left
            </button>
            <button
              type="button"
              onClick={() => scrollUsers("right")}
              className="rounded-xl border border-neutral-700 px-3 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition"
              aria-label="Scroll users right"
            >
              Right →
            </button>
          </div>
        </div>

        {usersLoading ? (
          <p className="text-neutral-500 text-sm">Loading user profiles...</p>
        ) : sortedUsersForProfiles.length > 0 ? (
          <div
            ref={usersRailRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
          >
            {sortedUsersForProfiles.map((u) => {
              const hasCompleteProfile = Boolean(u?.profilePic) && Boolean(u?.bio?.trim());
              return (
                <article
                  key={u._id}
                  className="min-w-[240px] max-w-[240px] snap-start rounded-xl border border-neutral-700 bg-neutral-800 p-3 shrink-0"
                >
                  <img
                    src={u?.profilePic || "https://cdn-icons-png.flaticon.com/512/9131/9131529.png"}
                    alt={u?.username || "User profile"}
                    className="mb-3 h-32 w-full rounded-lg object-cover"
                  />
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <h3 className="line-clamp-1 text-sm font-semibold text-white">@{u?.username || "unknown"}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      hasCompleteProfile ? "bg-emerald-500/10 text-emerald-400" : "bg-neutral-700 text-neutral-400"
                    }`}>{hasCompleteProfile ? "Complete" : "Incomplete"}</span>
                  </div>
                  <p className="line-clamp-2 text-xs text-neutral-400">{u?.bio?.trim() || "No bio added yet."}</p>
                  <p className="mt-2 text-xs text-neutral-500">{u?.email || "No email"}</p>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="text-neutral-500 text-sm">No users available.</p>
        )}
      </div>

      {usersLoading && <p className="text-neutral-500 text-sm">Loading users for settings...</p>}

      {/* Admin management tools */}
      <div className="space-y-5">
        <PromoteAccountSettings
          users={users}
          onUserPromoted={(userId, expiresAt) =>
            setUsers((prev) =>
              prev.map((u) =>
                u._id === userId ? { ...u, activePromoExpiry: expiresAt } : u
              )
            )
          }
        />
        <PromocodeSettings />
        <PromotionRequestsAdmin />
      </div>
    </div>
  );

}