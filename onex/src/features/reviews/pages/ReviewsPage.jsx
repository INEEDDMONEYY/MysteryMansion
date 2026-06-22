import { useState, useContext, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "@/context/UserContext";
import api from "@/shared/utils/api";
import { setSEO } from "@/shared/utils/seo";

const reviewsInFlightByUserId = new Map();

export default function ReviewsPage() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { userId: targetUserId } = useParams();

  const handleReturnToPost = () => {
    navigate("/home");
  };

  const currentUserId = useMemo(() => user?._id || user?.id || "", [user]);

  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [targetUsername, setTargetUsername] = useState("this user");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [posting, setPosting] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      if (!targetUserId) {
        setLoading(false);
        setFetchError("Missing user id for reviews.");
        return;
      }

      try {
        setLoading(true);
        setFetchError("");
        let request = reviewsInFlightByUserId.get(targetUserId);
        if (!request) {
          request = api
            .get(`/reviews/${targetUserId}`)
            .then((res) => res.data)
            .finally(() => {
              reviewsInFlightByUserId.delete(targetUserId);
            });
          reviewsInFlightByUserId.set(targetUserId, request);
        }

        const data = await request;
        setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
        const resolvedUsername = data?.targetUser?.username || "this user";
        setTargetUsername(resolvedUsername);
        if (resolvedUsername && resolvedUsername !== "this user") {
          setSEO(
            `Client Reviews for ${resolvedUsername} | Mystery Mansion`,
            `Read verified client reviews for ${resolvedUsername} on Mystery Mansion. See honest feedback from real clients.`
          );
        }
      } catch (err) {
        setFetchError(err?.response?.data?.error || "Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [targetUserId]);

  const handleSubmitReview = async () => {
    const text = reviewText.trim();
    if (!text || !targetUserId || !user) return;

    try {
      setPosting(true);
      const { data } = await api.post(`/reviews/${targetUserId}`, { text });
      if (data?.review) {
        setReviews((prev) => [data.review, ...prev]);
      }
      setReviewText("");
    } catch (err) {
      setFetchError(err?.response?.data?.error || "Failed to post review.");
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!targetUserId || !reviewId) return;

    try {
      setDeletingReviewId(reviewId);
      await api.delete(`/reviews/${targetUserId}/${reviewId}`);
      setReviews((prev) => prev.filter((rev) => String(rev._id) !== String(reviewId)));
    } catch (err) {
      setFetchError(err?.response?.data?.error || "Failed to delete review.");
    } finally {
      setDeletingReviewId("");
    }
  };

  const canDeleteReview = (review) => {
    if (!currentUserId) return false;
    const authorId = String(review?.authorUserId?._id || review?.authorUserId || "");
    const targetId = String(review?.targetUserId || targetUserId || "");
    return currentUserId === authorId || currentUserId === targetId;
  };

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto pb-36 sm:pb-10">
      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">
        {targetUsername && `Reviews for @${targetUsername}`}
      </h1>

      {/* Description / login prompt */}
      <p className="text-pink-500 mb-6">
        {user
          ? `Logged in as @${user.username}`
          : "Login or Sign-up to leave a review."}
      </p>

      {fetchError && (
        <p className="text-red-400 text-sm mb-4">{fetchError}</p>
      )}

      {/* Review input section */}
      {user && (
        <div className="mb-6 bg-white rounded-xl shadow p-4">
          <textarea
            className="w-full resize-none border border-gray-300 rounded-md p-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-pink-400"
            rows={3}
            placeholder="What's your review?"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSubmitReview}
              disabled={!reviewText.trim() || posting}
              className="bg-pink-600 text-white px-4 py-2 rounded-md text-sm md:text-base hover:bg-pink-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}

      {!user && (
        <div className="mb-6 bg-white/90 rounded-xl shadow p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-sm text-gray-700">You must be logged in to leave a review.</p>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/signin")}
              className="bg-pink-600 text-white px-3 py-2 rounded-md text-sm hover:bg-pink-700 transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="bg-gray-800 text-white px-3 py-2 rounded-md text-sm hover:bg-black transition"
            >
              Sign-up
            </button>
          </div>
        </div>
      )}

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-gray-400 col-span-full">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500 col-span-full">
            No reviews for {targetUsername} yet, be the first one to leave one
          </p>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev._id}
              className="relative bg-white rounded-lg p-4 pb-10 shadow hover:shadow-md transition"
            >
              <h3 className="font-semibold text-gray-800">@{rev?.authorUserId?.username || "User"}</h3>
              <p className="text-gray-700 text-sm mt-1 break-words">{rev.text}</p>
              <p className="text-gray-400 text-xs mt-2">
                {new Date(rev.createdAt).toLocaleString()}
              </p>

              {canDeleteReview(rev) && (
                <button
                  onClick={() => handleDeleteReview(rev._id)}
                  disabled={deletingReviewId === rev._id}
                  className="absolute bottom-3 right-3 text-xs px-2 py-1 rounded bg-rose-100 text-rose-700 hover:bg-rose-200 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deletingReviewId === rev._id ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="fixed bottom-4 left-4 right-4 z-40 sm:bottom-6 sm:right-6 sm:left-auto flex flex-col gap-2 sm:items-end">
        <button
          onClick={() => navigate(`/user/${targetUserId}`)}
          className="w-full sm:w-auto bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-black transition"
        >
          Return to profile
        </button>

        <button
          onClick={handleReturnToPost}
          className="w-full sm:w-auto bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-900 transition"
        >
          Return to post
        </button>
      </div>
    </div>
  );
}