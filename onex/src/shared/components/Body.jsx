import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import LocationSet from "./Location/LocationSet";
import Heading from "./Header";
import PromotionPosts from "./Promotion/PromotedPosts";
import CategoryList from "@/features/posts/components/Categories/categoryList";
import CategoryDisplay from "@/features/posts/components/Categories/categoryDisplay";
import UserSearch from "@/features/users/components/UserSearch";
import EmptyCategoryLoader from "./Loaders/EmptyCategoryLoader";
import PostCard from "@/features/posts/components/PostCard";
import { FEATURE_FLAGS } from "@/config/featureFlags";
import { statesMatch } from "@/shared/utils/stateNormalizer";
import { setLocationSEO } from "@/shared/utils/seo";
import api from "@/shared/utils/api";
import { useServerReady } from "@/context/ServerReadyContext";

// Strip punctuation and normalize whitespace so inputs like ".Great falls." match "Great Falls"
const sanitizeLocation = (str) =>
  (str || "").replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim().toLowerCase();

const dedupePostsById = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    const id = item?._id;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

const formatUploadDateLabel = (createdAt) => {
  if (!createdAt) return "Date unavailable";
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return "Date unavailable";

  return created.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

// ------------------ Onboarding Guide Component ------------------
function OnboardingGuide({ steps, onFinish }) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep + 1 < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinish();
    }
  };

  const step = steps[currentStep];
  const element = step.target?.current;

  const style = element
    ? {
        position: "absolute",
        top: element.getBoundingClientRect().top + window.scrollY - 10,
        left: element.getBoundingClientRect().left + window.scrollX - 10,
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
      {element && <div style={style}></div>}
      <div
        className="fixed bottom-8 right-8 bg-white p-4 rounded-lg shadow-lg z-50 max-w-sm"
        style={{ pointerEvents: "auto" }}
      >
        <h3 className="text-pink-600 font-bold mb-2">{step.title}</h3>
        <p className="text-gray-700 text-sm">{step.description}</p>
        <button
          onClick={nextStep}
          className="mt-3 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 text-sm"
        >
          {currentStep + 1 === steps.length ? "Finish" : "Next"}
        </button>
      </div>
    </>
  );
}

// ------------------ Body Component ------------------
export default function Body() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isLoggedIn = !!user.username;
  const isProvider = isLoggedIn && user.accountType !== 'client';

  const [location, setLocation] = useState(
    JSON.parse(localStorage.getItem("userLocation") || "null")
  );
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [popularProviders, setPopularProviders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [visibleCount, setVisibleCount] = useState(15);
  const LOAD_MORE_STEP = 15;

  // ---- Filter panel state ----
  const [filterOptions, setFilterOptions] = useState({ states: [], citiesByState: {} });
  const [showFilters, setShowFilters] = useState(false);
  const [pendingState, setPendingState] = useState("");
  const [pendingCity, setPendingCity] = useState("");
  const [pendingGender, setPendingGender] = useState("");
  // Applied filters (set when "Update Search" is clicked)
  const [activeFilters, setActiveFilters] = useState({ state: "", city: "", gender: "" });

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

  // --------------------------- Fetch Filter Options ------------------
  const fetchFilterOptions = async () => {
    try {
      const { data } = await api.get("/posts/filter-options");
      setFilterOptions({
        states: Array.isArray(data.states) ? data.states : [],
        citiesByState: data.citiesByState || {},
      });
    } catch {
      // non-critical — filter dropdowns will just be empty
    }
  };

  // --------------------------- Fetch Posts ---------------------------
  const fetchPosts = async (filters = {}) => {
    try {
      const params = {};
      if (filters.state)  params.state  = filters.state;
      if (filters.city)   params.city   = filters.city;
      if (filters.gender) params.gender = filters.gender;
      const { data } = await api.get("/posts", { params });
      const normalized = Array.isArray(data) ? data : [];
      setPosts(dedupePostsById(normalized));
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setPosts([]);
    }
  };

  // --------------------------- Fetch Users ---------------------------
  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/public/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    }
  };

  // --------------------------- Fetch Popular Providers ---------------
  const fetchPopularProviders = async () => {
    try {
      const { data } = await api.get("/public/users/popular");
      setPopularProviders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch popular providers:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchUsers();
    fetchPopularProviders();
    fetchFilterOptions();
  }, []);

  const serverReady = useServerReady();
  // Retry after Render cold-start: if the initial fetches failed (empty arrays),
  // re-run them once the server health check confirms the backend is awake.
  useEffect(() => {
    if (!serverReady) return;
    if (posts.length === 0) fetchPosts();
    if (users.length === 0) fetchUsers();
    if (popularProviders.length === 0) fetchPopularProviders();
    if (filterOptions.states.length === 0) fetchFilterOptions();
  }, [serverReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update page title/description based on selected location so search engines
  // index location-specific phrases like "Escorts in Denver".
  useEffect(() => {
    setLocationSEO(location);
  }, [location]);

  // --------------------------- Load More -----------------------------
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + LOAD_MORE_STEP);
  };

  // --------------------------- Filter handlers ----------------------
  const handleStateChange = (st) => {
    setPendingState(st);
    setPendingCity(""); // reset city when state changes
  };

  // Pre-populate filter panel from the user's current geolocation when opening
  const handleOpenFilters = () => {
    if (!showFilters && location) {
      const locState = (location.state || "").trim();
      const locCity  = (location.city  || "").trim();
      if (locState && filterOptions.states.includes(locState)) {
        setPendingState(locState);
        const cities = filterOptions.citiesByState[locState] || [];
        // pre-select city only if posts exist for that city
        const matched = cities.find((c) => c.toLowerCase() === locCity.toLowerCase());
        setPendingCity(matched || "");
      }
    }
    setShowFilters((v) => !v);
  };

  const handleUpdateSearch = () => {
    const filters = { state: pendingState, city: pendingCity, gender: pendingGender };
    setActiveFilters(filters);
    setVisibleCount(15);
    fetchPosts(filters);
  };

  const handleClearFilters = () => {
    setPendingState(''); setPendingCity(''); setPendingGender('');
    setActiveFilters({ state: '', city: '', gender: '' });
    fetchPosts({});
  };

  // --------------------------- Filter Posts --------------------------
  const locationMatchesPost = (post, selectedLocation) => {
    if (!selectedLocation) return true;

    const locationCity = selectedLocation?.city?.trim()?.toLowerCase();
    const locationState = selectedLocation?.state?.trim();
    const locationCountry = selectedLocation?.country?.trim()?.toLowerCase();

    const hasCity = !!locationCity && !locationCity.includes("unknown");
    const hasState = !!locationState && !locationState.toLowerCase().includes("unknown");
    const hasCountry = !!locationCountry;

    // Support multi-city posts and sanitize punctuation (e.g. ".Great falls." → "great falls")
    const postCities = (post.city || "").split(",").map(sanitizeLocation).filter(Boolean);
    const cityMatch = hasCity && postCities.some((c) => c === sanitizeLocation(locationCity));
    // Sanitize stored state value to handle trailing commas/punctuation (e.g. "Montana,")
    const postState = (post.state || "").replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
    // Also check if the state was accidentally typed inside the city field (e.g. city="Great falls, Montana," state="")
    const stateFromCityParts = !postState
      ? postCities.find((part) => statesMatch(part, locationState))
      : null;
    const stateMatch = hasState && (statesMatch(postState, locationState) || !!stateFromCityParts);
    const countryMatch =
      hasCountry && post.country?.trim()?.toLowerCase() === locationCountry;

    if (!hasCity && !hasState && !hasCountry) return true;
    return cityMatch || stateMatch || countryMatch;
  };

  const hasSearchQuery = typeof searchQuery === "string" && searchQuery.trim().length > 0;
  const sourcePosts = hasSearchQuery
    ? Array.isArray(searchResults)
      ? dedupePostsById(searchResults)
      : []
    : posts;

  const filteredUncategorizedPool = sourcePosts
    .filter((post) => {
      // When active server-side filters are in use, skip client-side location filtering
      const hasServerFilter = activeFilters.state || activeFilters.city || activeFilters.gender;
      const matchesLocation = (hasSearchQuery || hasServerFilter) ? true : locationMatchesPost(post, location);
      return matchesLocation;
    })
  ;

  const filteredUncategorizedPosts = filteredUncategorizedPool.slice(0, visibleCount);
  const listingRows = filteredUncategorizedPosts.flatMap((post, i) => {
    const currentLabel = formatUploadDateLabel(post?.createdAt);
    const previousLabel = i > 0
      ? formatUploadDateLabel(filteredUncategorizedPosts[i - 1]?.createdAt)
      : "";
    const showDateHeader = i === 0 || currentLabel !== previousLabel;

    const rows = [];

    if (showDateHeader) {
      rows.push(
        <div key={`date-${post._id || i}-${currentLabel}`} className="col-span-full mt-1">
          <div className="relative inline-flex overflow-hidden rounded-full p-[1px] align-middle">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-[-160%] bg-[conic-gradient(from_0deg,#ec4899,#f59e0b,#111827,#ec4899)] animate-[spin_4s_linear_infinite]"
            />
            <span className="relative inline-flex items-center rounded-full bg-gradient-to-r from-pink-100 via-rose-100 to-amber-100 px-3 py-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                {currentLabel}
              </p>
            </span>
          </div>
        </div>
      );
    }

    rows.push(
      <PostCard
        key={post._id || i}
        post={post}
        onDelete={(id) => {
          setPosts((prev) => prev.filter((p) => p._id !== id));
        }}
      />
    );

    return rows;
  });
  const areaLabel = getAreaLabel(location);

  // --------------------------- Onboarding Steps ----------------------
  const postsRef = useRef(null);

  const onboardingSteps = [
    {
      target: postsRef,
      title: "Uncategorized Post Section 📢",
      description:
        "The section highlighted in green shows all uncategorized post. You can click the post to bring up the post details.",
    },
    {
      target: null,
      title: "Click 'Finish' to close ❌",
    },
  ];

  // ✅ Feature-flag aware onboarding state
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (!FEATURE_FLAGS.ENABLE_ONBOARDING) return false;
    return sessionStorage.getItem("hasSeenOnboarding") !== "true";
  });

  const handleOnboardingFinish = () => {
    sessionStorage.setItem("hasSeenOnboarding", "true");
    setShowOnboarding(false);
  };

  // --------------------------- Render -------------------------------
  return (
    <section className="min-h-screen py-6 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
      <Heading />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 mt-4">
        <h3 className="text-lg font-semibold text-gray-900">New listings daily</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 sm:flex-none min-w-0">
            <LocationSet onLocationChange={setLocation} />
          </div>
          {/* Filter toggle button */}
          <button
            type="button"
            onClick={handleOpenFilters}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              showFilters || (activeFilters.state || activeFilters.city || activeFilters.gender)
                ? 'bg-pink-600 border-pink-600 text-white'
                : 'border-gray-300 text-gray-600 bg-white hover:border-pink-400 hover:text-pink-600'
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
            {(activeFilters.state || activeFilters.city || activeFilters.gender) && (
              <span className="ml-1 h-2 w-2 rounded-full bg-white opacity-90 inline-block" />
            )}
          </button>
          {isProvider && (
            <Link to="/post" className="shrink-0">
              <button
                className="border border-pink-500 px-4 py-2 rounded bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium"
                id="post-btn"
              >
                Post
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* ---- State / City / Gender filter panel (collapsed by default) ---- */}
      {showFilters && (
        <div className="mb-6 p-3 sm:p-4 rounded-2xl bg-gray-50 border border-gray-200">

          {/* Row 1: State + City — stack on mobile, side-by-side on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">State</label>
              <select
                value={pendingState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option value="">All states</option>
                {filterOptions.states.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* City — only shown when a state is selected AND posts exist with cities there */}
            {pendingState && (filterOptions.citiesByState[pendingState]?.length > 0) && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">City</label>
                <select
                  value={pendingCity}
                  onChange={(e) => setPendingCity(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  <option value="">All cities</option>
                  {filterOptions.citiesByState[pendingState].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Row 2: Gender pills + Update Search + Clear */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Provider</label>
              <div className="flex gap-2">
                {[{ v: 'female', label: '♀ Female' }, { v: 'male', label: '♂ Male' }, { v: 'ts', label: '⚧ TS' }].map(({ v, label }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setPendingGender((g) => g === v ? '' : v)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      pendingGender === v
                        ? 'bg-pink-600 border-pink-600 text-white'
                        : 'border-gray-300 text-gray-600 bg-white hover:border-pink-400 hover:text-pink-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUpdateSearch}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold transition-colors"
              >
                <Search size={15} /> Update Search
              </button>
              {(activeFilters.state || activeFilters.city || activeFilters.gender) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-pink-600 underline"
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {FEATURE_FLAGS.ENABLE_PROMOTE_ACCOUNT && <PromotionPosts />}

      <div className="mt-6 mb-4">
        {FEATURE_FLAGS.ENABLE_USER_SEARCH && (
          <UserSearch
            users={users}
            posts={posts}
            onResults={setSearchResults}
            query={searchQuery}
            onQueryChange={setSearchQuery}
          />
        )}
      </div>

      <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Listings in your area
        </h2>
        <p className="text-sm text-pink-600 mt-1">
          Providers near {areaLabel}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

        {/* POSTS */}
        <div>
          <div
            className="grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2"
            ref={postsRef}
          >
            {filteredUncategorizedPosts.length > 0 ? (
              listingRows
            ) : (
              <EmptyCategoryLoader />
            )}
          </div>

          {filteredUncategorizedPool.length > visibleCount && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 via-black to-yellow-400 text-white rounded-lg shadow-md hover:opacity-90 transition-all text-sm sm:text-base"
              >
                Load More
              </button>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden xl:flex flex-col gap-5">

          {/* Popular Providers */}
          <div className="relative overflow-hidden rounded-3xl p-[2px]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-[-100%] animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_0deg,#fce7f3,#ec4899,#be185d,#e11d48,#f472b6,#c026d3,#fce7f3)]"
            />
            <div className="relative rounded-[22px] bg-white/80 backdrop-blur-sm p-6">
              <h3 className="text-gray-900 font-semibold text-lg mb-6">
                Popular Providers
              </h3>

              <div className="grid grid-cols-3 gap-5">
                {popularProviders.slice(0, 6).map((u) => (
                  <div key={u._id} className="flex flex-col items-center">
                    <img
                      src={u.profilePic || "/default-avatar.png"}
                      alt={u.username}
                      className="w-14 h-14 rounded-full object-cover border border-pink-100"
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center truncate w-full">
                      {u.username}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Popular Searches */}
          <div className="relative overflow-hidden rounded-3xl p-[2px]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-[-100%] animate-[spin_5s_linear_infinite_1.5s] bg-[conic-gradient(from_180deg,#fce7f3,#ec4899,#be185d,#e11d48,#f472b6,#c026d3,#fce7f3)]"
            />
            <div className="relative rounded-[22px] bg-white/80 backdrop-blur-sm p-6">
              <h3 className="text-gray-900 font-semibold text-lg mb-6">
                Popular Searches
              </h3>

              {[
                { label: "Denver Escorts",        value: 85 },
                { label: "Las Vegas Escorts",      value: 65 },
                { label: "Independent Providers", value: 54 },
                { label: "Verified Profiles",      value: 41 },
              ].map((item) => (
                <div key={item.label} className="mb-5">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-1.5 bg-pink-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </aside>

      </div>

      <div className="mt-8">
        <CategoryList onSelect={setSelectedCategory} />
      </div>

      <div className="mt-6">
        <CategoryDisplay
          selectedCategory={selectedCategory}
          users={users}
          posts={posts}
          location={location}
        />
      </div>

      {/* ✅ Feature-flag controlled onboarding */}
      {FEATURE_FLAGS.ENABLE_ONBOARDING && showOnboarding && (
        <OnboardingGuide
          steps={onboardingSteps}
          onFinish={handleOnboardingFinish}
        />
      )}
      </div>{/* /max-w-screen-2xl */}
    </section>
  );
}
