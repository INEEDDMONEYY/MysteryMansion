import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  CalendarCheck,
  Clock3,
  DollarSign,
  FileCheck2,
  LayoutGrid,
  MessageSquareText,
} from "lucide-react";

import UserProfileHeader from "@/features/users/components/UserProfileHeader";
import PostList from "@/features/posts/components/PostList";
import UserAvailabilityDisplay from "@/features/users/components/UserAvailabilityDisplay";
import UserMeetupDisplay from "@/features/users/components/UserMeetupDisplay";
import ReviewButton from "@/shared/components/Buttons/reviewButtons/ReviewButton";
import ReferencesLinks from "@/shared/components/References/ReferencesLinks.jsx";
import CompletedDates from "@/shared/components/References/CompletedDates.jsx";
import ReviewsPanel from "@/features/reviews/components/ReviewsPanel";
import api from "@/shared/utils/api.js";

export default function UserProfileViewPage({
  userId: propUserId = null,
  disableActionButtons = false,
}) {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const userId = useMemo(() => {
    const routeUserId =
      params?.userId ||
      params?.id ||
      null;

    if (propUserId) {
      return propUserId;
    }

    return routeUserId || null;
  }, [propUserId, params]);

  const [availability, setAvailability] = useState({
    status: "",
  });

  const [prices, setPrices] = useState({});
  const [reviewCount, setReviewCount] = useState(0);

  // ─────────────────────────────────────────────────────────────
  // FETCH PROFILE DETAILS
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    api
      .get(`/public/users/id/${userId}`)
      .then((res) => {
        if (cancelled) return;

        const u = res?.data || {};

        const rawAvail = u.availability;

        const status =
          typeof rawAvail === "string"
            ? rawAvail
            : rawAvail?.status ?? "";

        setAvailability({
          status,
        });

        setPrices({
          incall:
            u.incallPrice != null
              ? String(u.incallPrice)
              : "",

          outcall:
            u.outcallPrice != null
              ? String(u.outcallPrice)
              : "",

          overnights:
            u.overnightPrice != null
              ? String(u.overnightPrice)
              : "",

          flyOut:
            u.flyOutPrice != null
              ? String(u.flyOutPrice)
              : "",
        });
      })
      .catch(() => {
        if (cancelled) return;

        setAvailability({
          status: "",
        });

        setPrices({});
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // ─────────────────────────────────────────────────────────────
  // DERIVED DATA
  // ─────────────────────────────────────────────────────────────

  const hasPrices = Object.values(prices).some(
    (value) =>
      value !== "" &&
      Number(value) > 0
  );

  // ─────────────────────────────────────────────────────────────
  // TAB NAVIGATION — each nav item is its own page, driven by an
  // optional trailing URL segment (e.g. /user/:userId/references).
  // ─────────────────────────────────────────────────────────────

  const TAB_KEYS = ["references", "completed-dates", "availability", "pricing", "reviews"];

  const { basePath, requestedTab } = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    if (TAB_KEYS.includes(lastSegment)) {
      return {
        basePath: "/" + segments.slice(0, -1).join("/"),
        requestedTab: lastSegment,
      };
    }

    return { basePath: location.pathname, requestedTab: "posts" };
  }, [location.pathname]);

  const tabs = [
    { key: "posts", label: "Posts", icon: LayoutGrid, path: basePath, show: true },
    { key: "references", label: "References", icon: FileCheck2, path: `${basePath}/references`, show: true },
    { key: "completed-dates", label: "Completed Dates", icon: CalendarCheck, path: `${basePath}/completed-dates`, show: true },
    { key: "availability", label: "Availability", icon: Clock3, path: `${basePath}/availability`, show: Boolean(availability.status) },
    { key: "pricing", label: "Pricing", icon: DollarSign, path: `${basePath}/pricing`, show: hasPrices },
    { key: "reviews", label: "Reviews", icon: MessageSquareText, path: `${basePath}/reviews`, show: true, count: reviewCount },
  ];

  const visibleTabs = tabs.filter((tab) => tab.show);
  const activeTab = visibleTabs.some((tab) => tab.key === requestedTab) ? requestedTab : "posts";

  // ─────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────

  const handleReturnToPost = () => {
    navigate("/home");
  };

  const handleReview = () => {
    if (!userId) return;

    navigate(`/reviews/${userId}`);
  };

  // ─────────────────────────────────────────────────────────────
  // PAGE
  // ─────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-gray-100">

      {/* ═══════════════════════════════════════════════════════
          COVER / PROFILE HERO
      ═══════════════════════════════════════════════════════ */}

      <section className="w-full bg-black">

        {/* Cover Banner */}

        <div className="relative h-52 overflow-hidden sm:h-64 lg:h-80">

          {/* Mystery Mansion gradient background */}

          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-black to-pink-500" />

          {/* Atmospheric gradient layers */}

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_35%,rgba(255,255,255,0.28),transparent_30%),radial-gradient(circle_at_75%_20%,rgba(236,72,153,0.35),transparent_35%)]" />

          <div className="absolute inset-0 bg-black/20" />

          {/* Cover pattern */}

          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.15)_45%,transparent_46%,transparent_100%)]" />
          </div>

          {/* Back button */}

          <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-6 lg:left-8">
            <button
              type="button"
              onClick={handleReturnToPost}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition-all hover:border-pink-400 hover:bg-black/80"
            >
              <ArrowLeft size={16} />

              Back
            </button>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════
            PROFILE IDENTITY BAR
        ═════════════════════════════════════════════════════ */}

        <div className="border-b border-white/10 bg-black">

          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="relative">

              {/* Profile Header */}

              <div className="-mt-16 pb-6 sm:-mt-20 sm:pb-7 lg:-mt-24 lg:pb-8">

                <div className="rounded-2xl border border-white/10 bg-[#111111] shadow-2xl">

                  <div className="p-4 sm:p-6 lg:p-7">

                    <UserProfileHeader
                      userId={userId}
                    />

                  </div>

                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════
                PROFILE NAVIGATION
            ═══════════════════════════════════════════════ */}

            <nav className="-mb-px flex overflow-x-auto scrollbar-none">
              {visibleTabs.map(({ key, label, icon: Icon, path, count }) => {
                const isActive = activeTab === key;

                return (
                  <Link
                    key={key}
                    to={path}
                    aria-current={isActive ? "page" : undefined}
                    className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-4 text-sm transition-colors ${
                      isActive
                        ? "border-pink-500 font-semibold text-white"
                        : "border-transparent font-medium text-gray-400 hover:border-pink-500 hover:text-white"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                    {Boolean(count) && (
                      <span className="rounded-full bg-pink-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                        {count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PROFILE CONTENT
      ═══════════════════════════════════════════════════════ */}

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">

          {/* ═══════════════════════════════════════════════════
              MAIN CHANNEL
          ═══════════════════════════════════════════════════ */}

          <div className="min-w-0 space-y-6">

            {/* ───────────────────────────────────────────────
                POSTS
            ─────────────────────────────────────────────── */}

            {activeTab === "posts" && (
              <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {/* Section Header */}

                <div className="border-b border-gray-200 px-5 py-5 sm:px-6">

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                        <LayoutGrid size={19} />
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          Posts
                        </h2>

                        <p className="text-sm text-gray-500">
                          Published posts from this profile.
                        </p>
                      </div>

                    </div>

                  </div>
                </div>

                {/* Posts */}

                <div className="p-4 sm:p-6">
                  <PostList
                    authorId={userId}
                  />
                </div>
              </section>
            )}

            {/* ───────────────────────────────────────────────
                REFERENCES
            ─────────────────────────────────────────────── */}

            {activeTab === "references" && (
              <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-5 py-5 sm:px-6">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                      <FileCheck2 size={19} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        References
                      </h2>

                      <p className="text-sm text-gray-500">
                        References associated with this profile.
                      </p>
                    </div>

                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <ReferencesLinks
                    userId={userId}
                  />
                </div>
              </section>
            )}

            {/* ───────────────────────────────────────────────
                COMPLETED DATES
            ─────────────────────────────────────────────── */}

            {activeTab === "completed-dates" && (
              <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-5 py-5 sm:px-6">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                      <CalendarCheck size={19} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Completed Dates
                      </h2>

                      <p className="text-sm text-gray-500">
                        Completed activity associated with this profile.
                      </p>
                    </div>

                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <CompletedDates
                    userId={userId}
                  />
                </div>
              </section>
            )}

            {/* ───────────────────────────────────────────────
                AVAILABILITY
            ─────────────────────────────────────────────── */}

            {activeTab === "availability" && availability.status && (
              <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-5 py-5 sm:px-6">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                      <Clock3 size={19} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Availability
                      </h2>

                      <p className="text-sm text-gray-500">
                        Current availability information.
                      </p>
                    </div>

                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <UserAvailabilityDisplay
                    availability={availability}
                  />
                </div>
              </section>
            )}

            {/* ───────────────────────────────────────────────
                PRICING
            ─────────────────────────────────────────────── */}

            {activeTab === "pricing" && hasPrices && (
              <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-5 py-5 sm:px-6">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                      <DollarSign size={19} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Pricing
                      </h2>

                      <p className="text-sm text-gray-500">
                        Listed meetup pricing.
                      </p>
                    </div>

                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <UserMeetupDisplay
                    prices={prices}
                  />
                </div>
              </section>
            )}

            {/* ───────────────────────────────────────────────
                REVIEWS
            ─────────────────────────────────────────────── */}

            {activeTab === "reviews" && (
              <ReviewsPanel
                targetUserId={userId}
                onMeta={({ count }) => setReviewCount(count)}
              />
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MOBILE ACTION BAR
      ═══════════════════════════════════════════════════════ */}

      {!disableActionButtons && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md sm:hidden">
          <div className="flex gap-2">

            <button
              type="button"
              onClick={handleReview}
              disabled={!userId}
              className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-50"
            >
              Review
            </button>
          </div>
        </div>
      )}
    </main>
  );
}