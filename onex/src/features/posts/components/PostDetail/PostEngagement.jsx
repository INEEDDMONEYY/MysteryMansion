// ❤️ Post Engagement

import { Heart } from "lucide-react";
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
          aria-label={
            liked
              ? "Unlike this post"
              : "Like this post"
          }
          className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold shadow-sm transition-all disabled:opacity-60 ${
            liked
              ? "border-pink-600 bg-pink-600 text-white hover:bg-pink-500"
              : "border-pink-300 bg-white text-pink-600 hover:bg-pink-50"
          }`}
        >
          <Heart
            size={16}
            className={
              liked
                ? "fill-white"
                : "fill-none"
            }
          />

          {liked ? "Liked" : "Like"}

          {likeCount > 0 && (
            <span
              className={`ml-0.5 text-xs font-bold ${
                liked
                  ? "text-pink-100"
                  : "text-pink-500"
              }`}
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