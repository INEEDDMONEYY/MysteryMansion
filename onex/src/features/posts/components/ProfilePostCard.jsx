import { BadgeCheck, MapPin, Trash2, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import FlagButton from "@/features/flagging/components/FlagButton";
import { FLAG_TARGET_TYPES } from "@/features/flagging/utils/flagTargets";
import { getPostCategories } from "../services/postCategories";
import { formatLocation, getPriceBadges } from "../utils/postLocation";
import BoostedBadge from "./BoostedBadge";

/**
 * Card for "profile" posts: the author's avatar, location and prices as
 * badges. Profile data is read live from the populated author, so changes to
 * the profile show up without re-posting.
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
  const prices = getPriceBadges(author);
  const categories = getPostCategories(post || {}).filter(
    (category) => String(category).trim().toLowerCase() !== "uncategorized"
  );

  const ringClass = showBlueBadge ? "ring-blue-400" : "ring-pink-300";

  const body = (
    <>
      <div className="flex flex-col items-center px-3 pb-3 pt-4 text-center">
        <div className={`relative h-20 w-20 overflow-hidden rounded-full bg-gray-100 ring-2 ${ringClass}`}>
          {author.profilePic ? (
            <img src={author.profilePic} alt={username} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-gray-400">
              <UserRound size={36} />
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1">
          <h2
            className={`break-all text-sm font-bold ${
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
              className={showBlueBadge ? "text-blue-600" : "text-fuchsia-500"}
              aria-label={showBlueBadge ? "Verified" : "Paid Promo"}
            />
          )}
        </div>

        {location && (
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-gray-600">
            <MapPin size={12} className="text-pink-500" />
            {location}
          </p>
        )}

        {prices.length > 0 ? (
          <ul className="mt-3 flex flex-wrap justify-center gap-1.5" aria-label="Prices">
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
          preview && (
            <p className="mt-3 text-[11px] text-gray-400">No prices set on your profile yet.</p>
          )
        )}

        {categories.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-1">
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
    </>
  );

  return (
    <article
      className={`relative w-full overflow-hidden rounded-md p-[1.5px] shadow-md ${
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
          <Link to={profileHref} className="block" aria-label={`View ${username}'s profile`}>
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
