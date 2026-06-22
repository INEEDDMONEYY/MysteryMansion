import { Link } from "react-router-dom";
import { Trash2, ChevronLeft, ChevronRight, Star, BadgeCheck, Rocket } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/shared/utils/api";
import { hasPermanentProviderBadge } from "@/features/users/services/providerBadgeEligibility";
import { getPostCategories } from "../services/postCategories";

export default function PostCard({ post, onDelete }) {
  // -------------------- Carousel State --------------------
  const [currentImage, setCurrentImage] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const mediaItems = [
    ...(Array.isArray(post?.pictures)
      ? post.pictures.map((url) => ({ type: "image", url }))
      : []),
    ...(Array.isArray(post?.videos)
      ? post.videos.map((url) => ({ type: "video", url }))
      : []),
  ];
  const totalImages = mediaItems.length;

  // Reset carousel when images change
  useEffect(() => {
    setCurrentImage(0);
  }, [post?.pictures, post?.videos]);

  if (!post || isDeleted) return null;

  // -------------------- User Info --------------------
  const username = post.userId?.username || "Unknown";
  const bio = post.userId?.bio || "";
  const profilePic = post.userId?.profilePic || "";
  const displayCategories = getPostCategories(post).filter(
    (category) => String(category).trim().toLowerCase() !== "uncategorized",
  );

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = user._id && post.userId?._id === user._id;

  // -------------------- Badge Logic (NEW) --------------------
  // Show both badges if both are present (post and user)
  const postBadgeType = post?.badgeType || "";
  const userBadgeType = post?.userId?.badgeType || "";
  const showBlueBadge = postBadgeType === "blue" || userBadgeType === "blue";
  const showPinkBadge = postBadgeType === "pink" || userBadgeType === "pink";

  const hasTrustedAccountAge = () => {
    const createdAt = post?.userId?.createdAt;
    if (!createdAt) return false;
    const createdDate = new Date(createdAt);
    if (Number.isNaN(createdDate.getTime())) return false;
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    return Date.now() - createdDate.getTime() >= oneYearMs;
  };

  const isTrustedProvider = hasTrustedAccountAge();
  const isPermanentProvider = hasPermanentProviderBadge(post?.userId?.createdAt);

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

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % totalImages);
  };

  // -------------------- Delete Post --------------------
  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Delete this post from UI and database?")) return;
    if (isDeleting) return;

    setIsDeleting(true);

    try {
      await api.delete(`/posts/${post._id}`);

      window.dispatchEvent(
        new CustomEvent("app-toast", {
          detail: {
            type: "success",
            message: "Post deleted successfully.",
          },
        }),
      );

      if (typeof onDelete === "function") {
        onDelete(post._id);
      }

      setIsDeleted(true);
    } catch (err) {
      console.error(
        "Failed to delete post:",
        err?.response?.data || err.message,
      );
      alert(err?.response?.data?.error || "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`relative p-[1.5px] rounded-md shadow-md w-full overflow-hidden${
      showBlueBadge
        ? " verified-post-card"
        : " transition-transform hover:scale-[1.01]"
    }`}>
      {/* Rotating border for verified cards */}
      {showBlueBadge && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,#93c5fd_0deg,#2563eb_90deg,#1e40af_180deg,#3b82f6_270deg,#93c5fd_360deg)] animate-[spin_3s_linear_infinite]"
        />
      )}
      {/* Default gradient border for non-verified cards */}
      {!showBlueBadge && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-r from-pink-500 via-black to-yellow-500"
        />
      )}
      <div className="relative bg-white rounded-md p-2">
        {/* -------------------- Image Carousel -------------------- */}
        <div className="mb-2 relative">
          {totalImages > 0 ? (
            <>
              {mediaItems[currentImage]?.type === "video" ? (
                <video
                  src={mediaItems[currentImage]?.url}
                  controls
                  className={`w-full h-28 rounded-md object-cover border ${
                    showBlueBadge ? 'border-blue-400' : 'border-pink-300'
                  }`}
                />
              ) : mediaItems[currentImage]?.url ? (
                <img
                  src={mediaItems[currentImage]?.url}
                  alt={`Post image ${currentImage + 1}`}
                  className={`w-full h-28 rounded-md object-cover border ${
                    showBlueBadge ? 'border-blue-400' : 'border-pink-300'
                  }`}
                />
              ) : (
                <div className="w-full h-28 bg-gray-200 flex items-center justify-center text-gray-500 text-xs rounded-md">
                  No Media
                </div>
              )}

              {totalImages > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition"
                    title="Previous"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition"
                    title="Next"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {mediaItems.map((_, idx) => (
                      <span
                        key={idx}
                        className={`w-2 h-2 rounded-full ${
                          idx === currentImage ? "bg-pink-600" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Show both badges if both are present */}
              <div className="absolute bottom-2 left-2 flex gap-1">
                {showBlueBadge && (
                  <div
                    className="inline-flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded-full ring-1 shadow-md bg-blue-600"
                    title="Verified (Monthly Badge)"
                    aria-label="Verified"
                  >
                    <BadgeCheck size={14} className="text-white" />
                  </div>
                )}
                {showPinkBadge && (
                  <div
                    className="inline-flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded-full ring-1 shadow-md bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500"
                    title="Paid Promo"
                    aria-label="Paid Promo"
                  >
                    <BadgeCheck size={14} className="text-white" />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="w-full h-28 bg-gray-200 flex items-center justify-center text-gray-500 text-xs rounded-md">
              No Media
            </div>
          )}
        </div>

        {/* -------------------- Link wraps only content -------------------- */}
        <Link
          to={`/posts/${post._id}`}
          className="block hover:shadow-xl transition"
        >
            {/* Badges Container */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start gap-2 flex-wrap pointer-events-none">
            {/* Founding Provider / Promotion Indicator */}
            <div className="inline-flex items-center gap-1 sm:gap-2">
              {/* Show both badges if both are present */}
              {showBlueBadge && (
                <div className="relative inline-flex rounded-full p-[1px] overflow-hidden shadow-md">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#60a5fa_0deg,#2563eb_90deg,#1e40af_180deg,#93c5fd_270deg,#60a5fa_360deg)] animate-[spin_8s_linear_infinite]"
                  />
                  <div className="relative inline-flex items-center gap-1 bg-gradient-to-r from-blue-600/90 via-blue-500/90 to-blue-400/90 text-white text-[9px] sm:text-[10px] md:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full">
                    <BadgeCheck size={12} className="text-white" />
                    <span>Verified</span>
                  </div>
                </div>
              )}
              {showPinkBadge && (
                <div className="relative inline-flex rounded-full p-[1px] overflow-hidden shadow-md">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#a78bfa_0deg,#c084fc_90deg,#e879f9_180deg,#f472b6_270deg,#a78bfa_360deg)] animate-[spin_8s_linear_infinite]"
                  />
                  <div className="relative inline-flex items-center gap-1 bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 text-white text-[9px] sm:text-[10px] md:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full">
                    <BadgeCheck size={12} className="text-white" />
                    <span>Paid Promo</span>
                  </div>
                </div>
              )}
              {(!showBlueBadge && !showPinkBadge) && isTrustedProvider ? (
                <div className="inline-flex items-center gap-1 rounded-full bg-yellow-400 text-yellow-950 text-[9px] sm:text-[10px] md:text-xs font-semibold px-1.5 sm:px-2 py-0.5 shadow-md ring-1 ring-yellow-300">
                  <Rocket size={12} className="text-yellow-900" />
                  <span>Trusted provider</span>
                </div>
              ) : null}
              {(!showBlueBadge && !showPinkBadge) && isPermanentProvider ? (
                <div className="relative inline-flex rounded-full p-[1px] overflow-hidden shadow-md">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#86efac_0deg,#4ade80_90deg,#22c55e_180deg,#bbf7d0_270deg,#86efac_360deg)] animate-[spin_8s_linear_infinite]"
                  />
                  <div className="relative inline-flex items-center gap-1 bg-gradient-to-r from-emerald-500/90 via-green-500/90 to-lime-500/90 text-white text-[9px] sm:text-[10px] md:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full backdrop-blur-[1px]">
                    <Star size={12} className="fill-current" />
                    <span>Founding Provider</span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Visibility Badge */}
            {post.visibility && (
              <div
                className={`text-white text-[9px] sm:text-[10px] md:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full shadow-md ${
                  showBlueBadge
                    ? "bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-400"
                    : "bg-pink-600"
                }`}
              >
                {post.visibility === "Both"
                  ? "See's Both"
                  : `See's Only: ${post.visibility}`}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2 mb-1">
            {profilePic && (
              <img
                src={profilePic}
                alt={username}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border ${
                  showBlueBadge ? "border-blue-400" : "border-pink-300"
                }`}
              />
            )}
            <h2
              className={`text-xs font-bold break-words leading-tight ${
                showBlueBadge
                  ? "bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-400 bg-clip-text text-transparent"
                  : "text-pink-600"
              }`}
            >
              {username}
            </h2>
          </div>

          {bio && (
            <p className="text-[10px] text-gray-500 mb-1 break-words line-clamp-1">
              {bio}
            </p>
          )}

          <h4 className="text-[10px] text-black mt-1 break-words font-semibold leading-tight">
            {post.title || "No title provided."}
          </h4>

          <div className="overflow-hidden">
            <p className="text-[10px] text-gray-700 mt-1 break-words line-clamp-2">
              {post.description || "No description provided."}
            </p>
          </div>

          <p className="text-[10px] text-gray-700 mt-1 break-words">
            {post.city && post.state
              ? `${post.city}, ${post.state}`
              : "Location not specified."}
          </p>

          {displayCategories.length > 0 && (
            <div className="mt-2 inline-flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-gray-500">Categories:</span>
              {displayCategories.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center rounded-full border border-pink-300 bg-pink-50 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-pink-700"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {post.createdAt && (
            <p className="text-gray-400 text-[10px] mt-1">
              {getPostedAgoLabel(post.createdAt)}
            </p>
          )}
        </Link>

        {/* Delete Button */}
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="absolute bottom-2 right-2 p-0.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
            title="Delete Post"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
