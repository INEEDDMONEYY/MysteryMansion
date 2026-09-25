import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Rocket,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "@/shared/utils/api";
import { hasPermanentProviderBadge } from "@/features/users/services/providerBadgeEligibility";
import { getPostCategories } from "../services/postCategories";

const getPostedAgoLabel = (createdAt) => {
  if (!createdAt) {
    return "";
  }

  const created = new Date(createdAt);

  if (Number.isNaN(created.getTime())) {
    return "";
  }

  const diffMs = Date.now() - created.getTime();

  if (diffMs < 0) {
    return "Posted just now";
  }

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (diffMs < minute) {
    return "Posted just now";
  }

  if (diffMs < hour) {
    const minutes = Math.floor(
      diffMs / minute
    );

    return `Posted ${minutes} minute${
      minutes === 1 ? "" : "s"
    } ago`;
  }

  if (diffMs < day) {
    const hours = Math.floor(
      diffMs / hour
    );

    return `Posted ${hours} hour${
      hours === 1 ? "" : "s"
    } ago`;
  }

  if (diffMs < week) {
    const days = Math.floor(
      diffMs / day
    );

    return `Posted ${days} day${
      days === 1 ? "" : "s"
    } ago`;
  }

  if (diffMs < month) {
    const weeks = Math.floor(
      diffMs / week
    );

    return `Posted ${weeks} week${
      weeks === 1 ? "" : "s"
    } ago`;
  }

  if (diffMs < year) {
    const months = Math.floor(
      diffMs / month
    );

    return `Posted ${months} month${
      months === 1 ? "" : "s"
    } ago`;
  }

  const years = Math.floor(
    diffMs / year
  );

  return `Posted ${years} year${
    years === 1 ? "" : "s"
  } ago`;
};

const getUserFromStorage = () => {
  try {
    return JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  } catch {
    return {};
  }
};

export default function PostCard({
  post,
  onDelete,
}) {
  const [currentImage, setCurrentImage] =
    useState(0);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [isDeleted, setIsDeleted] =
    useState(false);

  const mediaItems = useMemo(() => {
    return [
      ...(Array.isArray(post?.pictures)
        ? post.pictures
            .filter(Boolean)
            .map((url) => ({
              type: "image",
              url,
            }))
        : []),
      ...(Array.isArray(post?.videos)
        ? post.videos
            .filter(Boolean)
            .map((url) => ({
              type: "video",
              url,
            }))
        : []),
    ];
  }, [post?.pictures, post?.videos]);

  const totalMedia = mediaItems.length;

  useEffect(() => {
    setCurrentImage(0);
  }, [post?.pictures, post?.videos]);

  if (!post || isDeleted) {
    return null;
  }

  const username =
    post?.userId?.username ||
    "Unknown";

  const bio =
    post?.userId?.bio || "";

  const profilePic =
    post?.userId?.profilePic || "";

  const displayCategories =
    getPostCategories(post).filter(
      (category) =>
        String(category)
          .trim()
          .toLowerCase() !==
        "uncategorized"
    );

  const user = getUserFromStorage();

  const isOwner =
    Boolean(user?._id) &&
    post?.userId?._id === user._id;

  const postBadgeType =
    post?.badgeType || "";

  const userBadgeType =
    post?.userId?.badgeType || "";

  const showBlueBadge =
    postBadgeType === "blue" ||
    userBadgeType === "blue";

  const showPinkBadge =
    postBadgeType === "pink" ||
    userBadgeType === "pink";

  const hasTrustedAccountAge = () => {
    const createdAt =
      post?.userId?.createdAt;

    if (!createdAt) {
      return false;
    }

    const createdDate =
      new Date(createdAt);

    if (
      Number.isNaN(
        createdDate.getTime()
      )
    ) {
      return false;
    }

    const oneYearMs =
      365 *
      24 *
      60 *
      60 *
      1000;

    return (
      Date.now() -
        createdDate.getTime() >=
      oneYearMs
    );
  };

  const isTrustedProvider =
    hasTrustedAccountAge();

  const isPermanentProvider =
    hasPermanentProviderBadge(
      post?.userId?.createdAt
    );

  const prevImage = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (totalMedia <= 1) {
      return;
    }

    setCurrentImage(
      (previous) =>
        (previous - 1 + totalMedia) %
        totalMedia
    );
  };

  const nextImage = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (totalMedia <= 1) {
      return;
    }

    setCurrentImage(
      (previous) =>
        (previous + 1) %
        totalMedia
    );
  };

  const handleDelete = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      !window.confirm(
        "Delete this post from UI and database?"
      )
    ) {
      return;
    }

    if (isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await api.delete(
        `/posts/${post._id}`
      );

      window.dispatchEvent(
        new CustomEvent("app-toast", {
          detail: {
            type: "success",
            message:
              "Post deleted successfully.",
          },
        })
      );

      if (
        typeof onDelete ===
        "function"
      ) {
        onDelete(post._id);
      }

      setIsDeleted(true);
    } catch (error) {
      console.error(
        "Failed to delete post:",
        error?.response?.data ||
          error?.message
      );

      alert(
        error?.response?.data?.error ||
          "Failed to delete post"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article
      className={`relative w-full overflow-hidden rounded-md p-[1.5px] shadow-md [content-visibility:auto] [contain-intrinsic-size:auto_360px] ${
        showBlueBadge
          ? "verified-post-card"
          : "transition-transform hover:scale-[1.01]"
      }`}
    >
      {showBlueBadge && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,#93c5fd_0deg,#2563eb_90deg,#1e40af_180deg,#3b82f6_270deg,#93c5fd_360deg)]"
        />
      )}

      {!showBlueBadge && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-r from-pink-500 via-black to-yellow-500"
        />
      )}

      <div className="relative rounded-md bg-white p-2">
        <div className="relative mb-2">
          {totalMedia > 0 ? (
            <>
              {mediaItems[
                currentImage
              ]?.type === "video" ? (
                <video
                  src={
                    mediaItems[
                      currentImage
                    ]?.url
                  }
                  controls
                  className={`h-28 w-full rounded-md border object-cover ${
                    showBlueBadge
                      ? "border-blue-400"
                      : "border-pink-300"
                  }`}
                />
              ) : mediaItems[
                  currentImage
                ]?.url ? (
                <img
                  src={
                    mediaItems[
                      currentImage
                    ]?.url
                  }
                  alt={`Post media ${
                    currentImage + 1
                  }`}
                  className={`h-28 w-full rounded-md border object-cover ${
                    showBlueBadge
                      ? "border-blue-400"
                      : "border-pink-300"
                  }`}
                />
              ) : (
                <div className="flex h-28 w-full items-center justify-center rounded-md bg-gray-200 text-xs text-gray-500">
                  No Media
                </div>
              )}

              {totalMedia > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white transition hover:bg-black/70"
                    title="Previous"
                    aria-label="Previous media"
                  >
                    <ChevronLeft
                      size={20}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white transition hover:bg-black/70"
                    title="Next"
                    aria-label="Next media"
                  >
                    <ChevronRight
                      size={20}
                    />
                  </button>

                  <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                    {mediaItems.map(
                      (_, index) => (
                        <span
                          key={index}
                          className={`h-2 w-2 rounded-full ${
                            index ===
                            currentImage
                              ? "bg-pink-600"
                              : "bg-gray-300"
                          }`}
                        />
                      )
                    )}
                  </div>
                </>
              )}

              <div className="absolute bottom-2 left-2 flex gap-1">
                {showBlueBadge && (
                  <div
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 shadow-md ring-1 sm:h-7 sm:w-7"
                    title="Verified (Monthly Badge)"
                    aria-label="Verified"
                  >
                    <BadgeCheck
                      size={14}
                      className="text-white"
                    />
                  </div>
                )}

                {showPinkBadge && (
                  <div
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 shadow-md ring-1 sm:h-7 sm:w-7"
                    title="Paid Promo"
                    aria-label="Paid Promo"
                  >
                    <BadgeCheck
                      size={14}
                      className="text-white"
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-28 w-full items-center justify-center rounded-md bg-gray-200 text-xs text-gray-500">
              No Media
            </div>
          )}
        </div>

        <Link
          to={`/posts/${post._id}`}
          className="block transition hover:shadow-xl"
        >
          <div className="pointer-events-none absolute left-2 right-2 top-2 flex flex-wrap items-start justify-between gap-2">
            <div className="inline-flex items-center gap-1 sm:gap-2">
              {showBlueBadge && (
                <div className="relative inline-flex overflow-hidden rounded-full p-[1px] shadow-md">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 animate-[spin_8s_linear_infinite] rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#60a5fa_0deg,#2563eb_90deg,#1e40af_180deg,#93c5fd_270deg,#60a5fa_360deg)]"
                  />

                  <div className="relative inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600/90 via-blue-500/90 to-blue-400/90 px-1.5 py-0.5 text-[9px] font-semibold text-white sm:px-2 sm:text-[10px] md:text-xs">
                    <BadgeCheck
                      size={12}
                    />
                    <span>
                      Verified
                    </span>
                  </div>
                </div>
              )}

              {showPinkBadge && (
                <div className="relative inline-flex overflow-hidden rounded-full p-[1px] shadow-md">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 animate-[spin_8s_linear_infinite] rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#a78bfa_0deg,#c084fc_90deg,#e879f9_180deg,#f472b6_270deg,#a78bfa_360deg)]"
                  />

                  <div className="relative inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 px-1.5 py-0.5 text-[9px] font-semibold text-white sm:px-2 sm:text-[10px] md:text-xs">
                    <BadgeCheck
                      size={12}
                    />
                    <span>
                      Paid Promo
                    </span>
                  </div>
                </div>
              )}

              {!showBlueBadge &&
                !showPinkBadge &&
                isTrustedProvider && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-yellow-400 px-1.5 py-0.5 text-[9px] font-semibold text-yellow-950 shadow-md ring-1 ring-yellow-300 sm:px-2 sm:text-[10px] md:text-xs">
                    <Rocket
                      size={12}
                      className="text-yellow-900"
                    />
                    <span>
                      Trusted provider
                    </span>
                  </div>
                )}

              {!showBlueBadge &&
                !showPinkBadge &&
                isPermanentProvider && (
                  <div className="relative inline-flex overflow-hidden rounded-full p-[1px] shadow-md">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 animate-[spin_8s_linear_infinite] rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#86efac_0deg,#4ade80_90deg,#22c55e_180deg,#bbf7d0_270deg,#86efac_360deg)]"
                    />

                    <div className="relative inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500/90 via-green-500/90 to-lime-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white sm:px-2 sm:text-[10px] md:text-xs">
                      <Star
                        size={12}
                        className="fill-current"
                      />
                      <span>
                        Founding Provider
                      </span>
                    </div>
                  </div>
                )}
            </div>

            {post.visibility && (
              <div
                className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-md sm:px-2 sm:text-[10px] md:text-xs ${
                  showBlueBadge
                    ? "bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-400"
                    : "bg-pink-600"
                }`}
              >
                {post.visibility ===
                "Both"
                  ? "See's Both"
                  : `See's Only: ${post.visibility}`}
              </div>
            )}
          </div>

          <div className="mb-1 flex items-center gap-2">
            {profilePic && (
              <img
                src={profilePic}
                alt={username}
                className={`h-7 w-7 rounded-full border object-cover sm:h-8 sm:w-8 ${
                  showBlueBadge
                    ? "border-blue-400"
                    : "border-pink-300"
                }`}
              />
            )}

            <h2
              className={`break-words text-xs font-bold leading-tight ${
                showBlueBadge
                  ? "bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-400 bg-clip-text text-transparent"
                  : "text-pink-600"
              }`}
            >
              {username}
            </h2>
          </div>

          {bio && (
            <p className="mb-1 line-clamp-1 break-words text-[10px] text-gray-500">
              {bio}
            </p>
          )}

          <h4 className="mt-1 break-words text-[10px] font-semibold leading-tight text-black">
            {post.title ||
              "No title provided."}
          </h4>

          <p className="mt-1 line-clamp-2 break-words text-[10px] text-gray-700">
            {post.description ||
              "No description provided."}
          </p>

          <p className="mt-1 break-words text-[10px] text-gray-700">
            {post.city &&
            post.state
              ? `${post.city}, ${post.state}`
              : "Location not specified."}
          </p>

          {displayCategories.length >
            0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-gray-500">
                Categories:
              </span>

              {displayCategories.map(
                (category) => (
                  <span
                    key={category}
                    className="inline-flex items-center rounded-full border border-pink-300 bg-pink-50 px-2 py-0.5 text-[10px] font-semibold text-pink-700 sm:text-xs"
                  >
                    {category}
                  </span>
                )
              )}
            </div>
          )}

          {post.createdAt && (
            <p className="mt-1 text-[10px] text-gray-400">
              {getPostedAgoLabel(
                post.createdAt
              )}
            </p>
          )}
        </Link>

        {isOwner && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="absolute bottom-2 right-2 rounded-full bg-red-500 p-0.5 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            title="Delete Post"
            aria-label="Delete Post"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </article>
  );
}