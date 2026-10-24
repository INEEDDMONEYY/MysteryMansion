// ❤️ Post Engagement

import AnimatedLikeIcon from "@/shared/components/likes/AnimatedLikeIcon";
import FlagButton from "@/features/flagging/components/FlagButton";
import { FLAG_TARGET_TYPES } from "@/features/flagging/utils/flagTargets";

export default function PostEngagement({
  postId = "",
  isOwner = false,
  liked = false,
  likeCount = 0,
  likeBusy = false,
  currentUserId = "",
  postedLabel = "",
  onToggleLike,
}) {
  return (
    <section className="border-b border-gray-200 py-6">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onToggleLike}
          disabled={likeBusy}
          aria-pressed={liked}
          aria-label={
            liked
              ? "Unlike this post"
              : "Like this post"
          }
          className={`inline-flex items-center gap-2 rounded-full border py-1.5 pl-4 pr-5 text-sm font-semibold shadow-sm transition-all disabled:opacity-60 ${
            liked
              ? "border-pink-300 bg-pink-50 text-pink-700 hover:bg-pink-100"
              : "border-pink-300 bg-white text-pink-600 hover:bg-pink-50"
          }`}
        >
          <AnimatedLikeIcon
            liked={liked}
            size={28}
          />

          {liked ? "Liked" : "Like"}

          {likeCount > 0 && (
            <span
              className="ml-0.5 text-xs font-bold text-pink-500"
            >
              {likeCount}
            </span>
          )}
        </button>

        {!currentUserId && (
          <p className="text-xs text-gray-400">
            Sign in to like and save this
            post
          </p>
        )}

        {!isOwner && postId && (
          <FlagButton
            targetType={FLAG_TARGET_TYPES.POST}
            targetId={postId}
            label="Report post"
            showLabel
            variant="dropdown"
            className="rounded-full border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          />
        )}

        {postedLabel && (
          <p className="ml-auto text-xs text-gray-400">
            {postedLabel}
          </p>
        )}
      </div>
    </section>
  );
}