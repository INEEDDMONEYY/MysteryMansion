import { useEffect, useState } from "react";
import { BadgeCheck, Images, MapPin, Trash2, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import FlagButton from "@/features/flagging/components/FlagButton";
import { FLAG_TARGET_TYPES } from "@/features/flagging/utils/flagTargets";
import { fetchProfileMedia } from "@/features/users/services/profileActivityService";
import { getPostCategories } from "../services/postCategories";
import { formatLocation, getPriceBadges } from "../utils/postLocation";
import BoostedBadge from "./BoostedBadge";

const BIO_PREVIEW_LENGTH = 110;

const imageCountCache = new Map();

const loadProfileImageCount = (userId) => {
  if (!imageCountCache.has(userId)) {
    const request = fetchProfileMedia({ userId, type: "image", limit: 1 })
      .then((data) => data?.pagination?.total ?? 0)
      .catch(() => {
        imageCountCache.delete(userId);
        return null;
      });
    imageCountCache.set(userId, request);
  }
  return imageCountCache.get(userId);
};

/** Number of profile-visible images for a member, or null while loading. */
function useProfileImageCount(userId) {
  const [count, setCount] = useState(null);

  useEffect(() => {
    if (!userId) return undefined;
    let active = true;
    setCount(null);
    loadProfileImageCount(userId).then((total) => {
      if (active) setCount(total);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  return count;
}

const formatPostDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const truncateBio = (bio) => {
  const text = String(bio || "").trim();
  if (text.length <= BIO_PREVIEW_LENGTH) return text;
  return `${text.slice(0, BIO_PREVIEW_LENGTH).trimEnd()}...`;
};

/**
 * Card for "profile" posts: the author's avatar on the left with their
 * details on the right. Profile data is read live from the populated author,
 * so changes to the profile show up without re-posting.
 */
export default function ProfilePostCard({
  post,
  author: authorOverride,
  showBlueBadge = false,
  showPinkBadge = false,
  isOwner = false,
  isDeleting = false,
  onDelete,
  preview = false,
  isBoosted = false,
}) {
  const author = authorOverride || post?.userId || {};
  const username = author.username || "Unknown";
  const authorId = author._id || author.id || (typeof post?.userId === "string" ? post.userId : "");
  const profileHref = authorId ? `/user/${authorId}` : post?._id ? `/posts/${post._id}` : "";
  const location = formatLocation(post) || author.location || "";
  const prices = getPriceBadges(author).filter((price) => price.key === "outcallPrice");
  const categories = getPostCategories(post || {}).filter(
    (category) => String(category).trim().toLowerCase() !== "uncategorized"
  );

  const imageCount = useProfileImageCount(authorId);
  const postedOn = formatPostDate(post?.createdAt);
  const bio = truncateBio(author.bio);

  const body = (
    <div className="flex h-full items-stretch">
      <div className="relative w-36 shrink-0 overflow-hidden rounded-l-md bg-gray-100 sm:w-52">
        {author.profilePic ? (
          <img
            src={author.profilePic}
            alt={username}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-gray-400">
            <UserRound size={48} />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-5 pb-9 sm:gap-3 sm:p-7 sm:pb-10">
        <div className="flex items-center gap-1">
          <h2
            className={`truncate text-sm font-bold ${
              showBlueBadge
                ? "bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-400 bg-clip-text text-transparent"
                : "text-pink-600"
            }`}
          >
            {username}
          </h2>
          {(showBlueBadge || showPinkBadge) && (
            <BadgeCheck
              size={15}
              className={showBlueBadge ? "shrink-0 text-blue-600" : "shrink-0 text-fuchsia-500"}
              aria-label={showBlueBadge ? "Verified" : "Paid Promo"}
            />
          )}
        </div>

        {postedOn && <p className="mt-0.5 text-[10px] uppercase tracking-wide text-gray-400">{postedOn}</p>}

        {author.gender && <p className="mt-1 text-[11px] font-semibold text-gray-700">{author.gender}</p>}

        {location && (
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-gray-600">
            <MapPin size={12} className="shrink-0 text-pink-500" />
            <span className="truncate">{location}</span>
          </p>
        )}

        {prices.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Prices">
            {prices.map((price) => (
              <li
                key={price.key}
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm"
              >
                <span className="opacity-90">{price.label}</span>
                <span>{price.amount}</span>
              </li>
            ))}
          </ul>
        ) : (
          preview && <p className="mt-2 text-[11px] text-gray-400">No outcall price set on your profile yet.</p>
        )}

        {bio && <p className="mt-2 text-[11px] leading-snug text-gray-600">{bio}</p>}

        <div className="mt-2 flex items-center gap-2">
          <span
            className="relative inline-flex items-center text-gray-700"
            title={imageCount === null ? "Images" : `${imageCount} image${imageCount === 1 ? "" : "s"} on profile`}
            aria-label={`${imageCount ?? 0} images on profile`}
          >
            <Images size={16} />
            {imageCount !== null && (
              <span className="absolute -right-2 -top-2 min-w-[16px] rounded-full bg-pink-500 px-1 text-center text-[9px] font-bold leading-4 text-white">
                {imageCount}
              </span>
            )}
          </span>
        </div>

        {categories.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {categories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-pink-200 bg-pink-50 px-2 py-0.5 text-[10px] font-medium text-pink-700"
              >
                {category}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <article
      className={`relative w-full overflow-hidden rounded-md p-[1.5px] shadow-md sm:col-span-2 xl:col-span-2 ${
        preview ? "" : "transition-transform hover:scale-[1.01]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 rounded-md ${
          showBlueBadge
            ? "bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-400"
            : "bg-gradient-to-r from-pink-500 via-black to-yellow-500"
        }`}
      />

      <div className="relative h-full rounded-md bg-white">
        <span className="absolute left-2 top-2 rounded-full bg-black/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
          Profile
        </span>
        {isBoosted && <BoostedBadge className="absolute right-2 top-2 z-10" />}

        {preview || !profileHref ? (
          body
        ) : (
          <Link to={profileHref} className="block h-full" aria-label={`View ${username}'s profile`}>
            {body}
          </Link>
        )}

        {!preview && isOwner && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="absolute bottom-2 right-2 rounded-full bg-red-500 p-0.5 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            title="Delete Post"
            aria-label="Delete Post"
          >
            <Trash2 size={16} />
          </button>
        )}

        {!preview && !isOwner && post?._id && (
          <FlagButton
            targetType={FLAG_TARGET_TYPES.POST}
            targetId={post._id}
            label="Report post"
            variant="dropdown"
            className="absolute bottom-2 right-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
          />
        )}
      </div>
    </article>
  );
}
