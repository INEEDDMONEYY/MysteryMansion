import { useEffect, useState } from "react";
import PostCard from "./PostCard";
import EmptyCategoryLoader from "@/shared/components/Loaders/EmptyCategoryLoader";
import { statesMatch } from "@/shared/utils/stateNormalizer";
import { hasPermanentProviderBadge } from "@/features/users/services/providerBadgeEligibility";
import { postHasCategory } from "../services/postCategories";

// Strip punctuation and normalize whitespace so inputs like ".Great falls." match "Great Falls"
const sanitizeLocation = (str) =>
  (str || "").replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim().toLowerCase();

export default function FilteredPosts({
  posts = [],
  location = null,
  selectedCategory = null,
  visibleCount = 15,
  handleLoadMore,
  MAX_POSTS = 100,
}) {
  const [visiblePosts, setVisiblePosts] = useState(posts);

  useEffect(() => {
    setVisiblePosts(posts);
  }, [posts]);

  // ------------------ Sort: promoted first, founding provider second ------------------
  const sortPostsByPriority = (arr) =>
    [...arr].sort((a, b) => {
      const now = Date.now();

      const hasActivePromotion = (post) => {
        const postExpiry = post?.promoExpiresAt ? new Date(post.promoExpiresAt) : null;
        const userExpiry = post?.userId?.activePromoExpiry
          ? new Date(post.userId.activePromoExpiry)
          : null;

        const postPromoActive =
          post?.isPromo && postExpiry && !Number.isNaN(postExpiry.getTime()) && postExpiry.getTime() > now;
        const userPromoActive =
          userExpiry && !Number.isNaN(userExpiry.getTime()) && userExpiry.getTime() > now;

        return Boolean(postPromoActive || userPromoActive);
      };

      const isFoundingProvider = (post) => {
        if (hasActivePromotion(post)) return false;

        return hasPermanentProviderBadge(post?.userId?.createdAt);
      };

      const getPriority = (post) => {
        if (hasActivePromotion(post)) return 0;
        if (isFoundingProvider(post)) return 1;
        return 2;
      };

      return getPriority(a) - getPriority(b);
    });

  // ------------------ Filter posts by location, category ------------------
  const filteredPosts = sortPostsByPriority(visiblePosts)
    .filter((post) => {
      // Support multi-city posts (e.g. "NYC, Brooklyn") and punctuation-heavy input (e.g. ".Great falls.")
      const postCities = (post.city || "").split(",").map(sanitizeLocation).filter(Boolean);
      const filterCity = sanitizeLocation(location?.city);
      const cityMatch = filterCity ? postCities.some((c) => c === filterCity) : false;
      // Sanitize stored state value to handle trailing commas/punctuation (e.g. "Montana,")
      const postState = (post.state || "").replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
      // Also check if state was typed into the city field (e.g. city="Great falls, Montana," state="")
      const stateFromCityParts = !postState
        ? postCities.find((part) => statesMatch(part, location?.state))
        : null;
      const matchesLocation =
        !location ||
        cityMatch ||
        statesMatch(postState, location.state) ||
        !!stateFromCityParts;

      // ✅ Safe optional chaining for category filter
      const matchesCategory =
        !selectedCategory ||
        postHasCategory(post, selectedCategory);

      return matchesLocation && matchesCategory;
    })
    .slice(0, visibleCount);

  // ------------------ Render ------------------
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post, i) => {
            // ✅ Ensure PostCard gets username from populated userId
            const postWithUsername = {
              ...post,
              username: post.userId?.username || "Unknown",
              profilePic: post.userId?.profilePic || null,
              bio: post.userId?.bio || "",
            };
            return (
              <PostCard
                key={post._id || i}
                post={postWithUsername}
                onDelete={(id) => {
                  setVisiblePosts((prev) => prev.filter((p) => p._id !== id));
                }}
              />
            );
          })
        ) : (
          <EmptyCategoryLoader />
        )}
      </div>

      {/* ------------------ Load More Button ------------------ */}
      {visibleCount < posts.length && visibleCount < MAX_POSTS && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 via-black to-yellow-400 text-white rounded-lg shadow-md hover:opacity-90 transition-all text-sm sm:text-base"
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
}
