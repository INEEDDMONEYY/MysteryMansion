import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import UserSearch from "@/features/users/components/UserSearch";
import CategoryPostsLoader from "@/shared/components/Loaders/CategoryPostsLoader";
import PostCard from "../PostCard";
import { FEATURE_FLAGS } from "@/config/featureFlags";
import { statesMatch } from "@/shared/utils/stateNormalizer";
import { hasPermanentProviderBadge } from "@/features/users/services/providerBadgeEligibility";
import { postHasCategory } from "../../services/postCategories";

// Strip punctuation and normalize whitespace so inputs like ".Great falls." match "Great Falls"
const sanitizeLocation = (str) =>
  (str || "").replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim().toLowerCase();

export default function CategoryDisplay({ selectedCategory, users = [], posts = [], location = null }) {
  const { categoryName } = useParams();
  const category = selectedCategory || categoryName;

  const getAreaLabel = (selectedLocation) => {
    if (!selectedLocation) return "your area";

    const city = selectedLocation?.city?.trim();
    const state = selectedLocation?.state?.trim();
    const country = selectedLocation?.country?.trim();

    const cityKnown = city && !city.toLowerCase().includes("unknown");
    const stateKnown = state && !state.toLowerCase().includes("unknown");
    const countryKnown = country && !country.toLowerCase().includes("unknown");

    if (stateKnown) return state;
    if (cityKnown) return city;
    if (countryKnown) return country;
    return "your area";
  };

  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [visiblePosts, setVisiblePosts] = useState(posts);

  useEffect(() => {
    setVisiblePosts(posts);
  }, [posts]);

  const locationMatchesPost = (post) => {
    if (!location) return true;

    const locationCity = location?.city?.trim()?.toLowerCase();
    const locationState = location?.state?.trim();
    const locationCountry = location?.country?.trim()?.toLowerCase();

    const hasCity = !!locationCity && !locationCity.includes("unknown");
    const hasState = !!locationState && !locationState.toLowerCase().includes("unknown");
    const hasCountry = !!locationCountry;

    // Support multi-city posts and sanitize punctuation (e.g. ".Great falls." → "great falls")
    const postCities = (post.city || "").split(",").map(sanitizeLocation).filter(Boolean);
    const cityMatch = hasCity && postCities.some((c) => c === sanitizeLocation(locationCity));
    // Sanitize stored state value to handle trailing commas/punctuation (e.g. "Montana,")
    const postState = (post.state || "").replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
    // Also check if state was typed into the city field (e.g. city="Great falls, Montana," state="")
    const stateFromCityParts = !postState
      ? postCities.find((part) => statesMatch(part, locationState))
      : null;
    const stateMatch = hasState && (statesMatch(postState, locationState) || !!stateFromCityParts);
    const countryMatch = hasCountry && post.country?.trim()?.toLowerCase() === locationCountry;

    if (!hasCity && !hasState && !hasCountry) return true;
    return cityMatch || stateMatch || countryMatch;
  };

  // Sort: promoted first, founding provider second
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

  // Filter posts by category, location, and optionally user
  const categoryPosts = sortPostsByPriority(visiblePosts).filter((post) => {
    const matchesCategory = postHasCategory(post, category);
    const matchesLocation = locationMatchesPost(post);
    const matchesUser = selectedUser ? post.userId?.username === selectedUser : true;

    return matchesCategory && matchesLocation && matchesUser;
  });

  const selectedPost = categoryPosts.find((post) => post._id === selectedPostId);
  const areaLabel = getAreaLabel(location);

  return (
    <div className="w-full py-10 px-4 sm:px-6 md:px-12 lg:px-20">
      <div className="bg-pink-100 text-black rounded-t-lg shadow-md p-4 sm:p-6 border border-black border-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">
              {category ? `Posts for: ${category}` : "Select a category to view posts"}
            </h2>
            <p className="text-sm text-gray-700 mt-1">
              Providers near {areaLabel}
            </p>
          </div>
          <div className="w-full md:w-1/2 lg:w-1/3">
            {FEATURE_FLAGS.ENABLE_USER_SEARCH && (
              <UserSearch
                users={users}
                query={query}
                onQueryChange={setQuery}
                onSelectUser={setSelectedUser}
              />
            )}
          </div>
        </div>

        {selectedPost ? (
          <div className="mb-6">
            <button
              onClick={() => setSelectedPostId(null)}
              className="text-pink-600 underline text-sm mb-4"
            >
              ← Back to category posts
            </button>
            <PostCard
              post={selectedPost}
              onDelete={(id) => {
                setVisiblePosts((prev) => prev.filter((p) => p._id !== id));
                setSelectedPostId(null);
              }}
            />
          </div>
        ) : category ? (
          categoryPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryPosts.map((post, i) => (
                <PostCard
                  key={post._id || i}
                  post={post}
                  onDelete={(id) => {
                    setVisiblePosts((prev) => prev.filter((p) => p._id !== id));
                  }}
                />
              ))}
            </div>
          ) : (
            <CategoryPostsLoader />
          )
        ) : (
          <p className="text-black italic">No category selected.</p>
        )}
      </div>
    </div>
  );
}
