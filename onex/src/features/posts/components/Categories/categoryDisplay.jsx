import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import UserSearch from "@/features/users/components/UserSearch";
import CategoryPostsLoader from "@/shared/components/Loaders/CategoryPostsLoader";
import PostCard from "../PostCard";
import { FEATURE_FLAGS } from "@/config/featureFlags";
import { statesMatch } from "@/shared/utils/stateNormalizer";
import { hasPermanentProviderBadge } from "@/features/users/services/providerBadgeEligibility";
import {
  formatCategoryTitle,
  postHasCategory,
} from "../../services/postCategories";

const sanitizeLocation = (str) =>
  (str || "")
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const normalizeCategory = (value = "") =>
  String(value).trim().toLowerCase();

const createCategorySlug = (value = "") =>
  normalizeCategory(value)
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getAreaLabel = (selectedLocation) => {
  if (!selectedLocation) {
    return "your area";
  }

  const city = selectedLocation?.city?.trim();
  const state = selectedLocation?.state?.trim();
  const country =
    selectedLocation?.country?.trim();

  const cityKnown =
    city &&
    !city.toLowerCase().includes("unknown");

  const stateKnown =
    state &&
    !state.toLowerCase().includes("unknown");

  const countryKnown =
    country &&
    !country.toLowerCase().includes("unknown");

  if (stateKnown) {
    return state;
  }

  if (cityKnown) {
    return city;
  }

  if (countryKnown) {
    return country;
  }

  return "your area";
};

const hasActivePromotion = (post) => {
  const now = Date.now();

  const postExpiry = post?.promoExpiresAt
    ? new Date(post.promoExpiresAt)
    : null;

  const userExpiry =
    post?.userId?.activePromoExpiry
      ? new Date(
          post.userId.activePromoExpiry
        )
      : null;

  const postPromoActive = Boolean(
    post?.isPromo &&
      postExpiry &&
      !Number.isNaN(
        postExpiry.getTime()
      ) &&
      postExpiry.getTime() > now
  );

  const userPromoActive = Boolean(
    userExpiry &&
      !Number.isNaN(
        userExpiry.getTime()
      ) &&
      userExpiry.getTime() > now
  );

  return (
    postPromoActive ||
    userPromoActive
  );
};

const getPostPriority = (post) => {
  if (hasActivePromotion(post)) {
    return 0;
  }

  if (
    hasPermanentProviderBadge(
      post?.userId?.createdAt
    )
  ) {
    return 1;
  }

  return 2;
};

const sortPostsByPriority = (
  sourcePosts = []
) =>
  [...sourcePosts].sort(
    (firstPost, secondPost) =>
      getPostPriority(firstPost) -
      getPostPriority(secondPost)
  );

export default function CategoryDisplay({
  category: providedCategory,
  selectedCategory,
  users = [],
  posts = [],
  location = null,
}) {
  const { categoryName } = useParams();

  const categorySlug = createCategorySlug(
    providedCategory ||
      selectedCategory ||
      categoryName ||
      ""
  );

  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] =
    useState(null);
  const [visiblePosts, setVisiblePosts] =
    useState([]);

  useEffect(() => {
    setVisiblePosts(
      Array.isArray(posts) ? posts : []
    );
  }, [posts]);

  const locationMatchesPost = useCallback(
    (post) => {
      if (!location) {
        return true;
      }

      const locationCity =
        location?.city
          ?.trim()
          ?.toLowerCase();

      const locationState =
        location?.state?.trim();

      const locationCountry =
        location?.country
          ?.trim()
          ?.toLowerCase();

      const hasCity =
        Boolean(locationCity) &&
        !locationCity.includes("unknown");

      const hasState =
        Boolean(locationState) &&
        !locationState
          .toLowerCase()
          .includes("unknown");

      const hasCountry =
        Boolean(locationCountry) &&
        !locationCountry.includes(
          "unknown"
        );

      const postCities = (
        post?.city || ""
      )
        .split(",")
        .map(sanitizeLocation)
        .filter(Boolean);

      const cityMatch =
        hasCity &&
        postCities.some(
          (city) =>
            city ===
            sanitizeLocation(
              locationCity
            )
        );

      const postState = (
        post?.state || ""
      )
        .replace(/[^a-z0-9\s]/gi, " ")
        .replace(/\s+/g, " ")
        .trim();

      const stateFromCityParts =
        !postState && hasState
          ? postCities.find((part) =>
              statesMatch(
                part,
                locationState
              )
            )
          : null;

      const stateMatch =
        hasState &&
        (statesMatch(
          postState,
          locationState
        ) ||
          Boolean(stateFromCityParts));

      const countryMatch =
        hasCountry &&
        post?.country
          ?.trim()
          ?.toLowerCase() ===
          locationCountry;

      if (
        !hasCity &&
        !hasState &&
        !hasCountry
      ) {
        return true;
      }

      return (
        cityMatch ||
        stateMatch ||
        countryMatch
      );
    },
    [location]
  );

  const categoryPosts = useMemo(() => {
    const sourcePosts = Array.isArray(
      visiblePosts
    )
      ? visiblePosts
      : [];

    return sortPostsByPriority(
      sourcePosts
    ).filter((post) => {
      const matchesCategory =
        postHasCategory(
          post,
          categorySlug
        );

      const matchesLocation =
        locationMatchesPost(post);

      const matchesUser = selectedUser
        ? post?.userId?.username ===
          selectedUser
        : true;

      return (
        matchesCategory &&
        matchesLocation &&
        matchesUser
      );
    });
  }, [
    visiblePosts,
    categorySlug,
    locationMatchesPost,
    selectedUser,
  ]);

  const areaLabel =
    getAreaLabel(location);

  const categoryTitle =
    formatCategoryTitle(
      providedCategory ||
        selectedCategory ||
        categoryName ||
        ""
    );

  const hasCategory =
    Boolean(categorySlug);

  const handleDeletePost = useCallback(
    (id) => {
      setVisiblePosts((previous) =>
        previous.filter(
          (post) => post?._id !== id
        )
      );
    },
    []
  );

  const handleSearchResults =
    useCallback(() => {}, []);

  const handleSelectUser =
    useCallback((username) => {
      setSelectedUser(
        username || null
      );
    }, []);

  const handleClearUser = useCallback(
    () => {
      setSelectedUser(null);
      setQuery("");
    },
    []
  );

  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
        <div className="mb-8 flex flex-col gap-6 border-b border-black/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-600">
              Category Listings
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-black sm:text-4xl">
              {hasCategory
                ? categoryTitle
                : "Category"}
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Providers near{" "}
              <span className="font-semibold text-gray-900">
                {areaLabel}
              </span>
            </p>
          </div>

          {FEATURE_FLAGS.ENABLE_USER_SEARCH && (
            <div className="w-full lg:max-w-md">
              <UserSearch
                users={users}
                posts={visiblePosts}
                query={query}
                onQueryChange={setQuery}
                onResults={
                  handleSearchResults
                }
                onSelectUser={
                  handleSelectUser
                }
              />

              {selectedUser && (
                <div className="mt-3 flex items-center justify-between rounded-xl border border-pink-200 bg-pink-50 px-4 py-2.5">
                  <p className="text-xs font-medium text-pink-700">
                    Showing posts from{" "}
                    <span className="font-bold">
                      {selectedUser}
                    </span>
                  </p>

                  <button
                    type="button"
                    onClick={
                      handleClearUser
                    }
                    className="text-xs font-semibold text-pink-600 transition hover:text-pink-800"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {!hasCategory ? (
          <div className="rounded-2xl border border-black/10 bg-gray-50 px-6 py-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              No category selected
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Select a category to view
              available listings.
            </p>
          </div>
        ) : categoryPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoryPosts.map(
              (post, index) => (
                <PostCard
                  key={
                    post?._id || index
                  }
                  post={post}
                  onDelete={
                    handleDeletePost
                  }
                />
              )
            )}
          </div>
        ) : (
          <CategoryPostsLoader />
        )}
      </div>
    </section>
  );
}