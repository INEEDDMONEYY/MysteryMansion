// 📦 External Libraries
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BadgeCheck, Star, Rocket, Send, Pencil, Trash2, X, Heart } from "lucide-react";
import { FEATURE_FLAGS } from "@/config/featureFlags";
import api from "@/shared/utils/api";
import { UserContext } from "@/context/UserContext";
import { hasPermanentProviderBadge } from "@/features/users/services/providerBadgeEligibility";
import { getPostCategories } from "../services/postCategories";

// 🌀 Loaders & Components
import PostDetailLoader from "@/shared/components/Loaders/PostDetailLoader";
import UserAvailabilityDisplay from "@/features/users/components/UserAvailabilityDisplay";
import UserMeetupDisplay from "@/features/users/components/UserMeetupDisplay";

const postRequestCache = new Map();

const formatPhoneNumber = (value = "") => {
  const digits = String(value).replace(/\D/g, "").slice(0, 10);
  if (!digits) return "";
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const getPhoneHref = (value = "") => {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  return `tel:${digits}`;
};



const getPostedAgoLabel = (createdAt) => {
  if (!createdAt) return "";

  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return "";

  const diffMs = Date.now() - created.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (diffMs < minute) return "Posted just now";
  if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);
    return `Posted ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `Posted ${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  if (diffMs < week) {
    const days = Math.floor(diffMs / day);
    return `Posted ${days} day${days === 1 ? "" : "s"} ago`;
  }
  if (diffMs < month) {
    const weeks = Math.floor(diffMs / week);
    return `Posted ${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }
  if (diffMs < year) {
    const months = Math.floor(diffMs / month);
    return `Posted ${months} month${months === 1 ? "" : "s"} ago`;
  }

  const years = Math.floor(diffMs / year);
  return `Posted ${years} year${years === 1 ? "" : "s"} ago`;
};

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(UserContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState("");
  const [editingText, setEditingText] = useState("");
  const [commentBusyId, setCommentBusyId] = useState("");
  const [commentError, setCommentError] = useState("");

  // ── Like state ───────────────────────────────────────────────────────────
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeBusy, setLikeBusy] = useState(false);
  const mediaItems = [
    ...(Array.isArray(post?.pictures)
      ? post.pictures.map((url) => ({ type: "image", url }))
      : []),
    ...(Array.isArray(post?.videos)
      ? post.videos.map((url) => ({ type: "video", url }))
      : []),
  ];
  const postOwnerId = post?.userId?._id || post?.userId?.id || "";
  const currentUserId = currentUser?._id || currentUser?.id || "";
  const effectiveUser = postOwnerId && currentUserId && postOwnerId === currentUserId
    ? { ...post?.userId, ...currentUser }
    : post?.userId;
  const locationParts = [post?.city, post?.state, post?.country].filter(Boolean);
  const displayLocation = locationParts.length > 0 ? locationParts.join(", ") : "";
  const displayCategories = getPostCategories(post);
  const displayPhoneNumber = effectiveUser?.phoneNumber
    ? formatPhoneNumber(effectiveUser.phoneNumber)
    : "";
  const phoneHref = getPhoneHref(effectiveUser?.phoneNumber || "");
  const displayEmail = typeof effectiveUser?.email === "string" ? effectiveUser.email.trim() : "";
  const emailHref = displayEmail ? `mailto:${displayEmail}` : "";
  const hasPhoneNumber = Boolean(displayPhoneNumber);
  const hasEmail = Boolean(displayEmail);
  // BADGE LOGIC (NEW): Use post.badgeType as primary, fallback to user badgeType
  const badgeType = post?.badgeType || effectiveUser?.badgeType || "";
  const hasTrustedAccountAge = () => {
    const createdAt = effectiveUser?.createdAt;
    if (!createdAt) return false;
    const createdDate = new Date(createdAt);
    if (Number.isNaN(createdDate.getTime())) return false;
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    return Date.now() - createdDate.getTime() >= oneYearMs;
  };
  const isTrustedProvider = hasTrustedAccountAge();
  const isPermanentProvider = hasPermanentProviderBadge(effectiveUser?.createdAt);
  const availability = effectiveUser?.availability || { status: "" };
  const gender = effectiveUser?.gender || "";
  const prices = {
    incall: effectiveUser?.incallPrice != null ? String(effectiveUser.incallPrice) : "",
    outcall: effectiveUser?.outcallPrice != null ? String(effectiveUser.outcallPrice) : "",
    overnights: effectiveUser?.overnightPrice != null ? String(effectiveUser.overnightPrice) : "",
    flyOut: effectiveUser?.flyOutPrice != null ? String(effectiveUser.flyOutPrice) : "",
  };
  const hasPrices = Object.values(prices).some((v) => v !== "" && Number(v) > 0);

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      setCommentError("");
      const { data } = await api.get(`/posts/${postId}/comments`);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      setComments([]);
      setCommentError(err?.response?.data?.error || "Failed to load comments.");
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchPost = async () => {
      try {
        setFetchError("");
        let request = postRequestCache.get(postId);
        if (!request) {
          request = api
            .get(`/posts/${postId}`)
            .then((res) => res.data)
            .finally(() => {
              postRequestCache.delete(postId);
            });
          postRequestCache.set(postId, request);
        }

        const data = await request;
        if (!cancelled) {
          setPost(data);
        }
      } catch (err) {
        console.error("Failed to fetch post:", err);
        if (!cancelled) {
          setPost(null);
        }
        const status = err?.response?.status;
        const backendMessage = err?.response?.data?.error;
        if (!cancelled) {
          if (!status) {
            setFetchError("Unable to reach the server. Please check your connection or deployment API URL.");
          } else if (status === 404) {
            setFetchError("This post could not be found. It may have been deleted or the link is invalid.");
          } else {
            setFetchError(backendMessage || `Failed to load post details (HTTP ${status}).`);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  useEffect(() => {
    if (!FEATURE_FLAGS.ENABLE_COMMENTS) return;
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  // ── Fetch like status once post is loaded ────────────────────────────────
  useEffect(() => {
    if (!postId) return;
    api.get(`/posts/${postId}/like/status`)
      .then(({ data }) => {
        setLiked(data.liked);
        setLikeCount(data.likeCount ?? 0);
      })
      .catch(() => {});
  }, [postId]);

  const handleToggleLike = async () => {
    if (!currentUserId) {
      navigate('/signin');
      return;
    }
    if (likeBusy) return;
    setLikeBusy(true);
    try {
      const { data } = await api.post(`/posts/${postId}/like`);
      setLiked(data.liked);
      setLikeCount(data.likeCount ?? 0);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    } finally {
      setLikeBusy(false);
    }
  };

  const handleCreateComment = async (e) => {
    e.preventDefault();
    const text = String(commentText || "").trim();
    if (!text) return;

    try {
      setCommentBusyId("new");
      setCommentError("");
      const { data } = await api.post(`/posts/${postId}/comments`, { text });
      setComments((prev) => [data, ...prev]);
      setCommentText("");
    } catch (err) {
      console.error("Failed to create comment:", err);
      setCommentError(err?.response?.data?.error || "Failed to add comment.");
    } finally {
      setCommentBusyId("");
    }
  };

  const startEditingComment = (comment) => {
    setEditingCommentId(comment?._id || "");
    setEditingText(comment?.text || "");
  };

  const cancelEditingComment = () => {
    setEditingCommentId("");
    setEditingText("");
  };

  const handleUpdateComment = async (commentId) => {
    const text = String(editingText || "").trim();
    if (!text) return;

    try {
      setCommentBusyId(commentId);
      setCommentError("");
      const { data } = await api.put(`/posts/${postId}/comments/${commentId}`, { text });
      setComments((prev) => prev.map((comment) => (comment._id === commentId ? data : comment)));
      cancelEditingComment();
    } catch (err) {
      console.error("Failed to update comment:", err);
      setCommentError(err?.response?.data?.error || "Failed to update comment.");
    } finally {
      setCommentBusyId("");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setCommentBusyId(commentId);
      setCommentError("");
      await api.delete(`/posts/${postId}/comments/${commentId}`);
      setComments((prev) => prev.filter((comment) => comment._id !== commentId));
      if (editingCommentId === commentId) {
        cancelEditingComment();
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
      setCommentError(err?.response?.data?.error || "Failed to delete comment.");
    } finally {
      setCommentBusyId("");
    }
  };

  if (loading) return <PostDetailLoader />;
  if (!post) {
    return (
      <div className="text-center py-10 text-red-500">
        <p className="font-semibold">Post not found.</p>
        {fetchError && <p className="mt-2 text-sm text-red-400">{fetchError}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 bg-white rounded-xl shadow-md m-5 relative">
      <div className="absolute right-4 top-4 inline-flex items-center gap-1 sm:gap-2">
        {/* Always show check mark badge, color by badgeType */}
        <span
          className={`inline-flex items-center gap-1 rounded-full font-semibold px-2.5 py-1 text-xs shadow-sm
            ${badgeType === 'blue' ? 'bg-blue-600 text-white' : badgeType === 'pink' ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 text-white' : 'bg-gray-200 text-gray-400'}`}
          aria-label={badgeType === 'blue' ? 'Verified' : badgeType === 'pink' ? 'Paid Promo' : 'Unverified'}
          title={badgeType === 'blue' ? 'Verified (Monthly Badge)' : badgeType === 'pink' ? 'Paid Promo' : 'Unverified'}
        >
          <BadgeCheck size={16} className={badgeType === 'blue' || badgeType === 'pink' ? 'text-white' : 'text-gray-400'} />
          {badgeType === 'blue' && 'Verified'}
          {badgeType === 'pink' && 'Paid Promo'}
        </span>
        {isTrustedProvider ? (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-yellow-400 text-yellow-950 text-xs font-semibold px-2.5 py-1 shadow-sm ring-1 ring-yellow-300"
            aria-label="Trusted provider"
            title="Trusted provider"
          >
            <Rocket size={14} className="text-yellow-900" />
            Trusted provider
          </span>
        ) : isPermanentProvider ? (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 shadow-sm"
            aria-label="Founding Provider"
            title="Founding Provider"
          >
            <Star size={14} className="fill-current" />
            Founding Provider
          </span>
        ) : null}
      </div>

      {/* 🖼️ Post Images Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {mediaItems.length > 0 ? (
          mediaItems.map((media, idx) =>
            media.type === "video" ? (
              <video
                key={`video-${idx}`}
                src={media.url}
                controls
                className="w-full h-auto object-cover rounded-md"
              />
            ) : (
              <img
                key={`image-${idx}`}
                src={media.url}
                alt={`Post image ${idx + 1}`}
                className="w-full h-auto object-cover rounded-md"
              />
            )
          )
        ) : post.picture ? (
          <img
            src={post.picture}
            alt="Post"
            className="w-full h-auto object-cover rounded-md"
          />
        ) : (
          <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-md col-span-full">
            No Media Available
          </div>
        )}
      </div>

      {/* 🧑 Username + Title + Age + Phone Number + location */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-pink-600">
          {post.title || "Untitled Post"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          by {effectiveUser?.username || "Anonymous"}
        </p>
        {gender && (
          <p className="text-sm text-gray-500 mt-1">{gender}</p>
        )}
        {effectiveUser?.age && (
          <p className="text-sm text-gray-500 mt-1">
            Age: {effectiveUser.age}
          </p>
        )}
        <p className="text-sm text-gray-500 mt-1 break-all">
          Phone:{" "}
          {hasPhoneNumber ? (
            <a
              href={phoneHref}
              className="text-pink-600 underline decoration-pink-400 underline-offset-2 hover:text-pink-700"
            >
              {displayPhoneNumber}
            </a>
          ) : (
            <span className="italic text-gray-400">Not provided</span>
          )}
        </p>
        <p className="text-sm text-gray-500 mt-1 break-all">
          Email:{" "}
          {hasEmail ? (
            <a
              href={emailHref}
              className="text-pink-600 underline decoration-pink-400 underline-offset-2 hover:text-pink-700"
            >
              {displayEmail}
            </a>
          ) : (
            <span className="italic text-gray-400">Not provided</span>
          )}
        </p>
        {displayLocation && (
          <p className="text-sm text-gray-500 mt-1">
            Location: {displayLocation}
          </p>
        )}
        {displayCategories.length > 0 && (
          <p className="text-sm text-gray-500 mt-1 inline-flex items-center gap-2 flex-wrap">
            <span>Categories:</span>
            {displayCategories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center rounded-full border border-pink-300 bg-pink-50 px-2.5 py-0.5 text-xs font-semibold text-pink-700"
              >
                {category}
              </span>
            ))}
          </p>
        )}

      </div>

      {/* 📝 Description */}
      <p className="text-gray-700 text-base mb-6">
        {(post.description || "No description provided.")
          .split(/(?<=[.!?])\s+/)
          .map((sentence, i) => (
            <span key={i}>
              {sentence}
              <br />
            </span>
          ))}
      </p>

      {/* 🟢 User Availability */}
      {availability.status && (
        <div className="mb-6">
          <div className="h-auto overflow-hidden p-1">
            <UserAvailabilityDisplay availability={availability} />
          </div>
        </div>
      )}

      {/* 💲 User Meetup Prices */}
      {hasPrices && (
        <div className="mb-6">
          <div className="h-auto overflow-hidden p-1">
            <UserMeetupDisplay prices={prices} />
          </div>
        </div>
      )}

      {/* 📅 Timestamp */}
      {post.createdAt && (
        <p className="text-xs text-gray-400 mb-6">
          {getPostedAgoLabel(post.createdAt)}
        </p>
      )}

      {/* 💬 Comment Section Placeholder */}
      {FEATURE_FLAGS.ENABLE_COMMENTS && (
        <div className="mt-8 border-t pt-6 mb-7">
          <h3 className="text-lg font-semibold text-pink-500 mb-2">Comments</h3>

          {currentUserId ? (
            <form onSubmit={handleCreateComment} className="mb-5">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                placeholder="Add your comment..."
                className="w-full rounded-lg border border-pink-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!String(commentText || "").trim() || commentBusyId === "new"}
                  className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-pink-500 disabled:opacity-60"
                >
                  <Send size={14} />
                  {commentBusyId === "new" ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-5 rounded-lg border border-pink-100 bg-pink-50 px-4 py-3 text-sm text-pink-700">
              <p className="font-medium">You need to be logged in to comment.</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/signin")}
                  className="rounded-md bg-pink-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-pink-500"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="rounded-md border border-pink-400 px-3 py-1.5 text-xs font-semibold text-pink-700 hover:bg-white"
                >
                  Sign up
                </button>
              </div>
            </div>
          )}

          {commentError && (
            <p className="mb-3 text-sm text-red-500">{commentError}</p>
          )}

          {commentsLoading ? (
            <p className="text-sm text-gray-500">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-500">No comments yet. Be the first to comment.</p>
          ) : (
            <div className="max-h-[320px] overflow-y-auto pr-1 sm:max-h-[420px] space-y-4">
              {comments.map((comment) => {
                const commentUser = comment?.userId || {};
                const commentUserId = commentUser?._id || "";
                const canManage =
                  Boolean(currentUserId) &&
                  (String(currentUserId) === String(commentUserId) || currentUser?.role === "admin");
                const isEditing = editingCommentId === comment._id;

                return (
                  <div key={comment._id} className="rounded-lg border border-gray-200 p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <img
                          src={commentUser?.profilePic || "https://via.placeholder.com/40?text=?"}
                          alt={commentUser?.username || "User"}
                          className="h-10 w-10 rounded-full object-cover border border-pink-200"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {commentUser?.username || "User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {comment?.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}
                          </p>
                        </div>
                      </div>

                      {canManage && (
                        <div className="flex items-center gap-1">
                          {!isEditing && (
                            <button
                              type="button"
                              onClick={() => startEditingComment(comment)}
                              className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100"
                              title="Edit comment"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment._id)}
                            disabled={commentBusyId === comment._id}
                            className="rounded-md p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-60"
                            title="Delete comment"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-3">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border border-pink-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                        />
                        <div className="mt-2 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={cancelEditingComment}
                            className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                          >
                            <X size={13} />
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateComment(comment._id)}
                            disabled={!String(editingText || "").trim() || commentBusyId === comment._id}
                            className="inline-flex items-center gap-1 rounded-md bg-pink-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-pink-500 disabled:opacity-60"
                          >
                            <Send size={13} />
                            {commentBusyId === comment._id ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 max-h-28 overflow-y-auto pr-1 text-sm text-gray-700 whitespace-pre-wrap break-words">
                        {comment?.text || ""}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ❤️ Like Button */}
      <div className="flex items-center gap-3 mt-6 mb-2">
        <button
          type="button"
          onClick={handleToggleLike}
          disabled={likeBusy}
          aria-label={liked ? 'Unlike this post' : 'Like this post'}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm border transition-all disabled:opacity-60
            ${liked
              ? 'bg-pink-600 border-pink-600 text-white hover:bg-pink-500'
              : 'bg-white border-pink-300 text-pink-600 hover:bg-pink-50'
            }`}
        >
          <Heart
            size={16}
            className={liked ? 'fill-white' : 'fill-none'}
          />
          {liked ? 'Liked' : 'Like'}
          {likeCount > 0 && (
            <span className={`ml-0.5 text-xs font-bold ${liked ? 'text-pink-100' : 'text-pink-500'}`}>
              {likeCount}
            </span>
          )}
        </button>
        {!currentUserId && (
          <p className="text-xs text-gray-400">Sign in to like and save this post</p>
        )}
      </div>

      {/* 🔘 Action Buttons */}
      <div className="flex flex-row justify-between items-center mt-8">
        <button
          onClick={() => navigate("/home")}
          className="px-4 py-2 text-[12px] text-white font-medium rounded-lg shadow-md transition-all hover:opacity-90 bg-gradient-to-r from-yellow-400 via-black to-pink-500"
        >
          Return to posts
        </button>

        {FEATURE_FLAGS.ENABLE_PUBLIC_PROFILE && (
          <button
            onClick={() => {
              const creatorId = post.userId?._id || post.userId?.id;
              if (!creatorId) return;
              navigate(`/user/${creatorId}`);
            }}
            className="px-4 py-2 text-[12px] text-white font-medium rounded-lg shadow-md transition-all hover:opacity-90 bg-gradient-to-r from-pink-500 via-black to-yellow-400"
          >
            View profile
          </button>
        )}
      </div>
    </div>
  );
}