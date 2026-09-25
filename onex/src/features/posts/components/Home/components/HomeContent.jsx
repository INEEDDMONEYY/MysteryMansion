import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";

import LocationSet from "@/shared/components/Location/LocationSet";
import PromotionPosts from "@/shared/components/Promotion/PromotedPosts";
import EmptyCategoryLoader from "@/shared/components/Loaders/EmptyCategoryLoader";
import PostCard from "@/features/posts/components/PostCard";
import { FEATURE_FLAGS } from "@/config/featureFlags";
import { statesMatch } from "@/shared/utils/stateNormalizer";
import { setLocationSEO } from "@/shared/utils/seo";
import api from "@/shared/utils/api";
import { useServerReady } from "@/context/ServerReadyContext";

import HomeCategorySelector from "./HomeCategorySelector";
import HomeSearch from "./HomeSearch";
import HomeFilters from "./HomeFilters";

const sanitizeLocation = (str) =>
  (str || "")
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const POSTS_PER_PAGE = 20;

// Windowed page-number list with "..." gaps, e.g. [1, "...", 4, 5, 6, "...", 10].
const getPageNumbers = (current, total) => {
  const delta = 1;
  const range = [];
  const withDots = [];
  let last;

  for (let i = 1; i <= total; i += 1) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (last) {
      if (i - last === 2) {
        withDots.push(last + 1);
      } else if (i - last > 2) {
        withDots.push("...");
      }
    }

    withDots.push(i);
    last = i;
  }

  return withDots;
};

const dedupePostsById = (items = []) => {
  const seen = new Set();

  return items.filter((item) => {
    const id = item?._id;

    if (!id || seen.has(id)) {
      return false;
    }

    seen.add(id);
    return true;
  });
};

const formatUploadDateLabel = (createdAt) => {
  if (!createdAt) {
    return "Date unavailable";
  }

  const created = new Date(createdAt);

  if (Number.isNaN(created.getTime())) {
    return "Date unavailable";
  }

  return created.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

function OnboardingGuide({ steps, onFinish }) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep + 1 < steps.length) {
      setCurrentStep((previous) => previous + 1);
      return;
    }

    onFinish();
  };

  const step = steps[currentStep];

  if (!step) {
    return null;
  }

  const element = step.target?.current;

  const style = element
    ? {
        position: "absolute",
        top:
          element.getBoundingClientRect().top +
          window.scrollY -
          10,
        left:
          element.getBoundingClientRect().left +
          window.scrollX -
          10,
        width: element.offsetWidth + 20,
        height: element.offsetHeight + 20,
        border: "2px solid #2fda62ff",
        borderRadius: "0.5rem",
        zIndex: 9999,
        pointerEvents: "none",
      }
    : {};

  return (
    <>
      {element && <div style={style} />}

      <div
        className="fixed bottom-8 right-8 z-50 max-w-sm rounded-lg bg-white p-4 shadow-lg"
        style={{ pointerEvents: "auto" }}
      >
        <h3 className="mb-2 font-bold text-pink-600">
          {step.title}
        </h3>

        <p className="text-sm text-gray-700">
          {step.description}
        </p>

        <button
          type="button"
          onClick={nextStep}
          className="mt-3 rounded bg-pink-500 px-4 py-2 text-sm text-white hover:bg-pink-600"
        >
          {currentStep + 1 === steps.length
            ? "Finish"
            : "Next"}
        </button>
      </div>
    </>
  );
}

function HomeSidebar({ popularProviders = [] }) {
  const popularSearches = [
    {
      label: "Denver Escorts",
      value: 85,
    },
    {
      label: "Las Vegas Escorts",
      value: 65,
    },
    {
      label: "Independent Providers",
      value: 54,
    },
    {
      label: "Verified Profiles",
      value: 41,
    },
  ];

  return (
    <aside className="hidden flex-col gap-5 xl:flex">
      <div className="relative overflow-hidden rounded-3xl p-[2px]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[-100%] animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_0deg,#fce7f3,#ec4899,#be185d,#e11d48,#f472b6,#c026d3,#fce7f3)]"
        />

        <div className="relative rounded-[22px] bg-white/95 p-6">
          <h3 className="mb-6 text-lg font-semibold text-gray-900">
            Popular Providers
          </h3>

          <div className="grid grid-cols-3 gap-5">
            {popularProviders
              .slice(0, 6)
              .map((provider) => (
                <div
                  key={provider._id}
                  className="flex flex-col items-center"
                >
                  <img
                    src={
                      provider.profilePic ||
                      "/default-avatar.png"
                    }
                    alt={provider.username}
                    className="h-14 w-14 rounded-full border border-pink-100 object-cover"
                  />

                  <p className="mt-2 w-full truncate text-center text-xs text-gray-500">
                    {provider.username}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl p-[2px]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[-100%] animate-[spin_5s_linear_infinite_1.5s] bg-[conic-gradient(from_180deg,#fce7f3,#ec4899,#be185d,#e11d48,#f472b6,#c026d3,#fce7f3)]"
        />

        <div className="relative rounded-[22px] bg-white/95 p-6">
          <h3 className="mb-6 text-lg font-semibold text-gray-900">
            Popular Searches
          </h3>

          {popularSearches.map((item) => (
            <div key={item.label} className="mb-5">
              <div className="mb-2 flex justify-between text-xs text-gray-500">
                <span>{item.label}</span>
                <span>{item.value}%</span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-pink-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-400 to-pink-600"
                  style={{
                    width: `${item.value}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function HomeContent({
  user: pageUser = null,
}) {
  const serverReady = useServerReady();

  const storedUser = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "{}"
      );
    } catch {
      return {};
    }
  })();

  const user = pageUser || storedUser;
  const isLoggedIn = Boolean(user?.username);
  const isProvider =
    isLoggedIn && user?.accountType !== "client";

  const [location, setLocation] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("userLocation") || "null"
      );
    } catch {
      return null;
    }
  });

  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [popularProviders, setPopularProviders] =
    useState([]);

  const [searchResults, setSearchResults] =
    useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] =
    useState(1);

  const [filterOptions, setFilterOptions] =
    useState({
      states: [],
      citiesByState: {},
      cities: [],
      genders: ["female", "male", "ts"],
    });

  const [showFilters, setShowFilters] =
    useState(false);

  const [pendingState, setPendingState] =
    useState("");
  const [pendingCity, setPendingCity] =
    useState("");
  const [pendingGender, setPendingGender] =
    useState("");

  const [activeFilters, setActiveFilters] =
    useState({
      state: "",
      city: "",
      gender: "",
    });

  const postsRef = useRef(null);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const { data } = await api.get(
        "/posts/filter-options"
      );

      const citiesByState =
        data?.citiesByState || {};

      const cities = Object.values(
        citiesByState
      ).flat();

      const uniqueCities = [
        ...new Set(cities.filter(Boolean)),
      ];

      const genders =
        Array.isArray(data?.genders) &&
        data.genders.length > 0
          ? data.genders
          : ["female", "male", "ts"];

      setFilterOptions({
        states: Array.isArray(data?.states)
          ? data.states
          : [],
        citiesByState,
        cities: uniqueCities,
        genders,
      });
    } catch {
      setFilterOptions((previous) => ({
        ...previous,
        states: [],
        citiesByState: {},
        cities: [],
      }));
    }
  }, []);

  const fetchPosts = useCallback(
    async (filters = {}) => {
      try {
        const params = {};

        if (filters.state) {
          params.state = filters.state;
        }

        if (filters.city) {
          params.city = filters.city;
        }

        if (filters.gender) {
          params.gender = filters.gender;
        }

        const { data } = await api.get("/posts", {
          params,
        });

        const normalized = Array.isArray(data)
          ? data
          : [];

        setPosts(dedupePostsById(normalized));
      } catch (error) {
        console.error(
          "Failed to fetch posts:",
          error
        );

        setPosts([]);
      }
    },
    []
  );

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get(
        "/public/users"
      );

      setUsers(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Failed to fetch users:",
        error
      );

      setUsers([]);
    }
  }, []);

  const fetchPopularProviders =
    useCallback(async () => {
      try {
        const { data } = await api.get(
          "/public/users/popular"
        );

        setPopularProviders(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Failed to fetch popular providers:",
          error
        );

        setPopularProviders([]);
      }
    }, []);

  useEffect(() => {
    fetchPosts();
    fetchUsers();
    fetchPopularProviders();
    fetchFilterOptions();
  }, [
    fetchPosts,
    fetchUsers,
    fetchPopularProviders,
    fetchFilterOptions,
  ]);

  useEffect(() => {
    if (!serverReady) {
      return;
    }

    if (posts.length === 0) {
      fetchPosts();
    }

    if (users.length === 0) {
      fetchUsers();
    }

    if (popularProviders.length === 0) {
      fetchPopularProviders();
    }

    if (filterOptions.states.length === 0) {
      fetchFilterOptions();
    }
  }, [
    serverReady,
    posts.length,
    users.length,
    popularProviders.length,
    filterOptions.states.length,
    fetchPosts,
    fetchUsers,
    fetchPopularProviders,
    fetchFilterOptions,
  ]);

  useEffect(() => {
    setLocationSEO(location);
  }, [location]);

  const getAreaLabel = useCallback(
    (selectedLocation) => {
      if (!selectedLocation) {
        return "your area";
      }

      const city =
        selectedLocation?.city?.trim();
      const state =
        selectedLocation?.state?.trim();
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
    },
    []
  );

  const handlePageChange = useCallback(
    (page) => {
      setCurrentPage(page);

      if (postsRef.current) {
        const top =
          postsRef.current.getBoundingClientRect()
            .top +
          window.scrollY -
          100;

        window.scrollTo({
          top,
          behavior: "smooth",
        });
      }
    },
    []
  );

  const handleStateChange = useCallback(
    (state) => {
      setPendingState(state);
      setPendingCity("");
    },
    []
  );

  const handleOpenFilters = useCallback(() => {
    if (!showFilters && location) {
      const locationState =
        (location.state || "").trim();

      const locationCity =
        (location.city || "").trim();

      if (
        locationState &&
        filterOptions.states.includes(
          locationState
        )
      ) {
        setPendingState(locationState);

        const cities =
          filterOptions.citiesByState[
            locationState
          ] || [];

        const matchedCity = cities.find(
          (city) =>
            city.toLowerCase() ===
            locationCity.toLowerCase()
        );

        setPendingCity(matchedCity || "");
      }
    }

    setShowFilters(
      (previous) => !previous
    );
  }, [
    showFilters,
    location,
    filterOptions,
  ]);

  const handleUpdateSearch = useCallback(() => {
    const filters = {
      state: pendingState,
      city: pendingCity,
      gender: pendingGender,
    };

    setActiveFilters(filters);
    setCurrentPage(1);
    fetchPosts(filters);
  }, [
    pendingState,
    pendingCity,
    pendingGender,
    fetchPosts,
  ]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters = {
      state: "",
      city: "",
      gender: "",
    };

    setPendingState("");
    setPendingCity("");
    setPendingGender("");
    setActiveFilters(clearedFilters);
    setCurrentPage(1);
    fetchPosts({});
  }, [fetchPosts]);

  const handleSearchResults =
    useCallback((results) => {
      setSearchResults(
        Array.isArray(results)
          ? dedupePostsById(results)
          : []
      );

      setCurrentPage(1);
    }, []);

  const handleSearchQueryChange =
    useCallback((query) => {
      setSearchQuery(query);

      if (!query.trim()) {
        setSearchResults(null);
        setCurrentPage(1);
      }
    }, []);

  const handleSearchUserSelect =
    useCallback(() => {}, []);

  const handleClearSearch =
    useCallback(() => {
      setSearchQuery("");
      setSearchResults(null);
      setCurrentPage(1);
    }, []);

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
        Boolean(locationCountry);

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
            sanitizeLocation(locationCity)
        );

      const postState = (
        post?.state || ""
      )
        .replace(/[^a-z0-9\s]/gi, " ")
        .replace(/\s+/g, " ")
        .trim();

      const stateFromCityParts =
        !postState
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

  const hasSearchQuery =
    typeof searchQuery === "string" &&
    searchQuery.trim().length > 0;

  const sourcePosts = hasSearchQuery
    ? Array.isArray(searchResults)
      ? dedupePostsById(searchResults)
      : []
    : posts;

  const hasServerFilter =
    Boolean(activeFilters.state) ||
    Boolean(activeFilters.city) ||
    Boolean(activeFilters.gender);

  const filteredPostsPool =
    sourcePosts.filter((post) => {
      const matchesLocation =
        hasSearchQuery ||
        hasServerFilter
          ? true
          : locationMatchesPost(post);

      return matchesLocation;
    });

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredPostsPool.length /
        POSTS_PER_PAGE
    )
  );

  const filteredPosts =
    filteredPostsPool.slice(
      (currentPage - 1) * POSTS_PER_PAGE,
      currentPage * POSTS_PER_PAGE
    );

  const listingRows =
    filteredPosts.flatMap(
      (post, index) => {
        const currentLabel =
          formatUploadDateLabel(
            post?.createdAt
          );

        const previousLabel =
          index > 0
            ? formatUploadDateLabel(
                filteredPosts[
                  index - 1
                ]?.createdAt
              )
            : "";

        const showDateHeader =
          index === 0 ||
          currentLabel !== previousLabel;

        const rows = [];

        if (showDateHeader) {
          rows.push(
            <div
              key={`date-${
                post._id || index
              }-${currentLabel}`}
              className="col-span-full mt-1"
            >
              <div className="relative inline-flex overflow-hidden rounded-full p-[1px] align-middle">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-[-160%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,#ec4899,#f59e0b,#111827,#ec4899)]"
                />

                <span className="relative inline-flex items-center rounded-full bg-gradient-to-r from-pink-100 via-rose-100 to-amber-100 px-3 py-1">
                  <p className="whitespace-nowrap text-xs font-semibold text-gray-700 sm:text-sm">
                    {currentLabel}
                  </p>
                </span>
              </div>
            </div>
          );
        }

        rows.push(
          <PostCard
            key={
              post._id || index
            }
            post={post}
            onDelete={(id) => {
              setPosts((previous) =>
                previous.filter(
                  (item) =>
                    item._id !== id
                )
              );

              setSearchResults(
                (previous) => {
                  if (
                    !Array.isArray(
                      previous
                    )
                  ) {
                    return previous;
                  }

                  return previous.filter(
                    (item) =>
                      item._id !== id
                  );
                }
              );
            }}
          />
        );

        return rows;
      }
    );

  // Clamp back to the last valid page if filtering/searching shrinks the result pool.
  useEffect(() => {
    setCurrentPage((previous) =>
      previous > totalPages ? totalPages : previous
    );
  }, [totalPages]);

  const areaLabel =
    getAreaLabel(location);

  const onboardingSteps = [
    {
      target: postsRef,
      title:
        "Uncategorized Post Section 📢",
      description:
        "The section highlighted in green shows all uncategorized post. You can click the post to bring up the post details.",
    },
    {
      target: null,
      title:
        "Click 'Finish' to close ❌",
      description: "",
    },
  ];

  const [showOnboarding, setShowOnboarding] =
    useState(() => {
      if (
        !FEATURE_FLAGS.ENABLE_ONBOARDING
      ) {
        return false;
      }

      return (
        sessionStorage.getItem(
          "hasSeenOnboarding"
        ) !== "true"
      );
    });

  const handleOnboardingFinish =
    useCallback(() => {
      sessionStorage.setItem(
        "hasSeenOnboarding",
        "true"
      );

      setShowOnboarding(false);
    }, []);

  const filterProps = {
    showFilters,
    onToggle: handleOpenFilters,
    filterOptions,
    pendingState,
    pendingCity,
    pendingGender,
    activeFilters,
    onStateChange: handleStateChange,
    onCityChange: setPendingCity,
    onGenderChange: setPendingGender,
    onApply: handleUpdateSearch,
    onClear: handleClearFilters,
  };

  return (
    <section className="min-h-screen bg-white py-6">
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              New listings daily
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Browse current listings and discover providers in your area.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-0 flex-1 sm:flex-none">
              <LocationSet
                onLocationChange={setLocation}
              />
            </div>

            <button
              type="button"
              onClick={handleOpenFilters}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                showFilters ||
                hasServerFilter
                  ? "border-pink-600 bg-pink-600 text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:border-pink-400 hover:text-pink-600"
              }`}
            >
              Filters

              {hasServerFilter && (
                <span className="ml-1 inline-block h-2 w-2 rounded-full bg-white opacity-90" />
              )}
            </button>

            {isProvider && (
              <Link
                to="/post"
                className="shrink-0"
              >
                <span
                  id="post-btn"
                  className="block rounded border border-pink-500 bg-pink-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-700"
                >
                  Post
                </span>
              </Link>
            )}
          </div>
        </div>

        <HomeCategorySelector />

        {FEATURE_FLAGS.ENABLE_USER_SEARCH && (
          <HomeSearch
            users={users}
            posts={posts}
            query={searchQuery}
            onQueryChange={
              handleSearchQueryChange
            }
            onResults={
              handleSearchResults
            }
            onSelectUser={
              handleSearchUserSelect
            }
          />
        )}

        <HomeFilters {...filterProps} />

        {FEATURE_FLAGS.ENABLE_PROMOTE_ACCOUNT && (
          <div className="mt-6">
            <PromotionPosts />
          </div>
        )}

        <div className="mb-4 mt-6">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Listings in your area
          </h2>

          <p className="mt-1 text-sm text-pink-600">
            Providers near {areaLabel}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          <div>
            <div
              ref={postsRef}
              className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              {filteredPosts.length > 0
                ? listingRows
                : <EmptyCategoryLoader />}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="Listings pagination"
                className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
              >
                <button
                  type="button"
                  onClick={() =>
                    handlePageChange(currentPage - 1)
                  }
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-pink-400 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Prev
                </button>

                {getPageNumbers(currentPage, totalPages).map(
                  (page, index) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 text-sm text-gray-400"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        onClick={() =>
                          handlePageChange(page)
                        }
                        aria-current={
                          page === currentPage
                            ? "page"
                            : undefined
                        }
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          page === currentPage
                            ? "bg-gradient-to-r from-pink-500 via-black to-yellow-400 text-white shadow-md"
                            : "border border-gray-300 bg-white text-gray-600 hover:border-pink-400 hover:text-pink-600"
                        }`}
                      >
                        {page}
                      </button>
                    )
                )}

                <button
                  type="button"
                  onClick={() =>
                    handlePageChange(currentPage + 1)
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-pink-400 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </nav>
            )}
          </div>

          <HomeSidebar
            popularProviders={
              popularProviders
            }
          />
        </div>

        {FEATURE_FLAGS.ENABLE_ONBOARDING &&
          showOnboarding && (
            <OnboardingGuide
              steps={onboardingSteps}
              onFinish={
                handleOnboardingFinish
              }
            />
          )}
      </div>
    </section>
  );
}
