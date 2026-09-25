import {
  useState,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Send,
  Trash2,
  UserRound,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

import { UserContext } from "@/context/UserContext";
import api from "@/shared/utils/api";

const reviewsInFlightByUserId = new Map();

/**
 * Review composer + review grid — shared by the standalone ReviewsPage and the
 * profile view's "Reviews" tab so both surfaces look and behave identically.
 */
export default function ReviewsPanel({ targetUserId, onMeta }) {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const currentUserId = useMemo(
    () => user?._id || user?.id || "",
    [user]
  );

  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [targetUsername, setTargetUsername] =
    useState("this user");

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [posting, setPosting] = useState(false);
  const [deletingReviewId, setDeletingReviewId] =
    useState("");

  const reviewCount = reviews.length;

  // ─────────────────────────────────────────────────────────────
  // FETCH REVIEWS
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchReviews = async () => {
      if (!targetUserId) {
        setLoading(false);
        setFetchError(
          "Missing user id for reviews."
        );
        return;
      }

      try {
        setLoading(true);
        setFetchError("");

        let request =
          reviewsInFlightByUserId.get(
            targetUserId
          );

        if (!request) {
          request = api
            .get(`/reviews/${targetUserId}`)
            .then((res) => res.data)
            .finally(() => {
              reviewsInFlightByUserId.delete(
                targetUserId
              );
            });

          reviewsInFlightByUserId.set(
            targetUserId,
            request
          );
        }

        const data = await request;

        setReviews(
          Array.isArray(data?.reviews)
            ? data.reviews
            : []
        );

        setTargetUsername(
          data?.targetUser?.username ||
            "this user"
        );
      } catch (err) {
        setFetchError(
          err?.response?.data?.error ||
            "Failed to load reviews."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [targetUserId]);

  // Surface the review count/username up to whichever page is hosting this panel.
  useEffect(() => {
    onMeta?.({ count: reviewCount, targetUsername });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewCount, targetUsername]);

  // ─────────────────────────────────────────────────────────────
  // SUBMIT REVIEW
  // ─────────────────────────────────────────────────────────────

  const handleSubmitReview = async () => {
    const text = reviewText.trim();

    if (
      !text ||
      !reviewRating ||
      !targetUserId ||
      !user
    ) {
      return;
    }

    try {
      setPosting(true);
      setFetchError("");

      const { data } = await api.post(
        `/reviews/${targetUserId}`,
        { text, rating: reviewRating }
      );

      if (data?.review) {
        setReviews((prev) => [
          data.review,
          ...prev,
        ]);
      }

      setReviewText("");
      setReviewRating(0);
    } catch (err) {
      setFetchError(
        err?.response?.data?.error ||
          "Failed to post review."
      );
    } finally {
      setPosting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // DELETE REVIEW
  // ─────────────────────────────────────────────────────────────

  const handleDeleteReview = async (
    reviewId
  ) => {
    if (
      !targetUserId ||
      !reviewId
    ) {
      return;
    }

    try {
      setDeletingReviewId(reviewId);
      setFetchError("");

      await api.delete(
        `/reviews/${targetUserId}/${reviewId}`
      );

      setReviews((prev) =>
        prev.filter(
          (rev) =>
            String(rev._id) !==
            String(reviewId)
        )
      );
    } catch (err) {
      setFetchError(
        err?.response?.data?.error ||
          "Failed to delete review."
      );
    } finally {
      setDeletingReviewId("");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // PERMISSIONS
  // ─────────────────────────────────────────────────────────────

  const canDeleteReview = (review) => {
    if (!currentUserId) {
      return false;
    }

    const authorId = String(
      review?.authorUserId?._id ||
        review?.authorUserId ||
        ""
    );

    const targetId = String(
      review?.targetUserId ||
        targetUserId ||
        ""
    );

    return (
      currentUserId === authorId ||
      currentUserId === targetId
    );
  };

  // ─────────────────────────────────────────────────────────────
  // PANEL
  // ─────────────────────────────────────────────────────────────

  return (
    <>
      {/* ═════════════════════════════════════════════════════
          REVIEW PARTICIPATION
      ═════════════════════════════════════════════════════ */}

      <section>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg sm:p-6 lg:p-7">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

            <div className="flex gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                {user ? (
                  <UserRound size={20} />
                ) : (
                  <Users size={20} />
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {user
                    ? `Share your experience`
                    : "Want to leave a review?"}
                </h2>

                <p className="mt-1 text-sm leading-5 text-gray-500">
                  {user
                    ? `You're logged in as @${user.username}.`
                    : "Log in or sign up to participate in the conversation."}
                </p>
              </div>

            </div>

            {!user && (
              <div className="flex flex-col gap-2 sm:flex-row">

                <button
                  type="button"
                  onClick={() =>
                    navigate("/signin")
                  }
                  className="rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-pink-700 hover:shadow-md active:scale-[0.98]"
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/signup")
                  }
                  className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98]"
                >
                  Sign-up
                </button>

              </div>
            )}

          </div>

          {/* Review composer */}

          {user && (
            <div className="mt-6 border-t border-gray-100 pt-6">

              <div className="relative">

                {/* Star rating picker */}

                <div className="mb-4 flex items-center gap-3">

                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Your rating
                  </span>

                  <div
                    className="flex items-center gap-1"
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const filled =
                        starValue <=
                        (hoverRating || reviewRating);

                      return (
                        <button
                          key={starValue}
                          type="button"
                          onClick={() =>
                            setReviewRating(starValue)
                          }
                          onMouseEnter={() =>
                            setHoverRating(starValue)
                          }
                          aria-label={`Rate ${starValue} star${starValue === 1 ? "" : "s"}`}
                          className="p-0.5 transition-transform hover:scale-110"
                        >
                          <Star
                            size={24}
                            className={
                              filled
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-none text-gray-300"
                            }
                          />
                        </button>
                      );
                    })}
                  </div>

                </div>

                <textarea
                  className="min-h-[130px] w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-500/10 sm:text-base"
                  rows={5}
                  placeholder={`Share your experience with @${targetUsername}...`}
                  value={reviewText}
                  onChange={(e) =>
                    setReviewText(
                      e.target.value
                    )
                  }
                />

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <p className="text-xs text-gray-400">
                    {reviewRating
                      ? "Your review will be visible on this profile."
                      : "Select a star rating to continue."}
                  </p>

                  <button
                    type="button"
                    onClick={
                      handleSubmitReview
                    }
                    disabled={
                      !reviewText.trim() ||
                      !reviewRating ||
                      posting
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 via-pink-500 to-yellow-400 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    <Send size={16} />

                    {posting
                      ? "Posting..."
                      : "Post Review"}
                  </button>

                </div>

              </div>

            </div>
          )}

        </div>

      </section>

      {/* ═════════════════════════════════════════════════════
          ERROR
      ═════════════════════════════════════════════════════ */}

      {fetchError && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4">

          <p className="text-sm font-medium text-rose-700">
            {fetchError}
          </p>

        </div>
      )}

      {/* ═════════════════════════════════════════════════════
          REVIEWS HEADER
      ═════════════════════════════════════════════════════ */}

      <section className="mt-10">

        <div className="mb-6 flex flex-col gap-3 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <div className="flex items-center gap-2">

              <Star
                size={19}
                className="fill-yellow-400 text-yellow-400"
              />

              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Community feedback
              </h2>

            </div>

            <p className="mt-1 text-sm text-gray-500">
              Reviews shared by members of Mystery
              Mansion.
            </p>

          </div>

          {!loading && reviewCount > 0 && (
            <span className="text-sm font-medium text-gray-400">
              {reviewCount}{" "}
              {reviewCount === 1
                ? "review"
                : "reviews"}
            </span>
          )}

        </div>

        {/* ═════════════════════════════════════════════════
            LOADING
        ═════════════════════════════════════════════════ */}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >

                <div className="flex items-center gap-3">

                  <div className="h-10 w-10 rounded-full bg-gray-200" />

                  <div className="space-y-2">
                    <div className="h-3 w-24 rounded bg-gray-200" />
                    <div className="h-2 w-16 rounded bg-gray-100" />
                  </div>

                </div>

                <div className="mt-5 space-y-2">
                  <div className="h-3 w-full rounded bg-gray-100" />
                  <div className="h-3 w-5/6 rounded bg-gray-100" />
                  <div className="h-3 w-2/3 rounded bg-gray-100" />
                </div>

              </div>
            ))}

          </div>
        ) : reviews.length === 0 ? (

          /* ═══════════════════════════════════════════════
              EMPTY STATE
          ═══════════════════════════════════════════════ */

          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">

              <MessageSquare
                size={28}
              />

            </div>

            <h3 className="mt-5 text-lg font-semibold text-gray-900">
              No reviews yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              There aren't any reviews for{" "}
              <span className="font-semibold text-gray-700">
                @{targetUsername}
              </span>{" "}
              yet.
              {user
                ? " Be the first to share your experience."
                : " Sign in to be the first to share your experience."}
            </p>

            {!user && (
              <button
                type="button"
                onClick={() =>
                  navigate("/signin")
                }
                className="mt-6 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700 hover:shadow-md"
              >
                Login to leave a review
              </button>
            )}

          </div>
        ) : (

          /* ═══════════════════════════════════════════════
              REVIEW GRID
          ═══════════════════════════════════════════════ */

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

            {reviews.map((rev) => {

              const authorUsername =
                rev?.authorUserId
                  ?.username ||
                "User";

              const createdDate =
                rev?.createdAt
                  ? new Date(
                      rev.createdAt
                    ).toLocaleString()
                  : "";

              const canDelete =
                canDeleteReview(
                  rev
                );

              const isDeleting =
                deletingReviewId ===
                rev._id;

              return (
                <article
                  key={rev._id}
                  className="group relative flex min-h-[220px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-pink-200 hover:shadow-lg sm:p-6"
                >

                  {/* Top accent */}

                  <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-pink-500 via-pink-400 to-yellow-400 opacity-80" />

                  {/* Author */}

                  <div className="flex items-center justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-yellow-400 text-white shadow-sm">
                        <UserRound
                          size={17}
                        />
                      </div>

                      <div className="min-w-0">

                        <h3 className="truncate text-sm font-bold text-gray-900">
                          @{authorUsername}
                        </h3>

                        <div className="mt-0.5 flex items-center gap-1.5">

                          <ShieldCheck
                            size={12}
                            className="text-pink-500"
                          />

                          <span className="text-[11px] text-gray-400">
                            Community member
                          </span>

                        </div>

                      </div>

                    </div>

                    <div className="flex shrink-0 gap-0.5">

                      {[1, 2, 3, 4, 5].map((starValue) => (
                        <Star
                          key={starValue}
                          size={13}
                          className={
                            starValue <= (rev.rating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-none text-gray-300"
                          }
                        />
                      ))}

                    </div>

                  </div>

                  {/* Review */}

                  <div className="mt-5 flex-1">

                    <p className="break-words text-sm leading-6 text-gray-700">
                      {rev.text}
                    </p>

                  </div>

                  {/* Footer */}

                  <div className="mt-6 flex items-end justify-between gap-3 border-t border-gray-100 pt-4">

                    <p className="text-[11px] text-gray-400">
                      {createdDate}
                    </p>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteReview(
                            rev._id
                          )
                        }
                        disabled={
                          isDeleting
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2
                          size={13}
                        />

                        {isDeleting
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    )}

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </section>
    </>
  );
}
