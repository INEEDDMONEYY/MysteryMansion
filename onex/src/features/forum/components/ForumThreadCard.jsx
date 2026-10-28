import { Link } from "react-router-dom";
import {
  ArrowUp,
  CheckCircle2,
  Eye,
  MessageCircle,
  Pin,
  LockKeyhole,
  Rocket,
} from "lucide-react";

import ForumBorderFrame from "./ForumBorderFrame";

const formatDate = (value) => {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() !== new Date().getFullYear()
        ? "numeric"
        : undefined,
  }).format(date);
};

const formatCount = (value) =>
  new Intl.NumberFormat("en-US", {
    notation: Number(value) >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);

export default function ForumThreadCard({ thread }) {
  if (!thread) return null;

  const threadId =
    thread.id || thread._id || thread.slug;

  const title = thread.title || "Untitled discussion";

  const excerpt =
    thread.excerpt ||
    thread.content ||
    thread.body ||
    "";

  const categoryName =
    thread.category?.name ||
    thread.categoryName ||
    (typeof thread.category === "string"
      ? thread.category
      : "General Discussion");

  const authorName =
    thread.author?.username ||
    thread.author?.name ||
    thread.authorName ||
    "Community Member";

  const createdAt =
    thread.createdAt || thread.created_at;

  const replyCount = Number(
    thread.replyCount ??
      thread.reply_count ??
      thread.repliesCount ??
      0
  );

  const voteCount = Number(
    thread.upvoteCount ??
      thread.voteCount ??
      thread.votes ??
      0
  );

  const viewCount = Number(
    thread.viewCount ?? thread.views ?? 0
  );

  const isPinned = Boolean(
    thread.isPinned ?? thread.pinned
  );

  const isSolved = Boolean(
    thread.isSolved ?? thread.solved
  );

  const isLocked = Boolean(
    thread.isLocked ?? thread.locked
  );

  const tags = Array.isArray(thread.tags)
    ? thread.tags
    : [];

  const threadHref = threadId
    ? `/forum/thread/${encodeURIComponent(threadId)}`
    : "/forum";

  return (
    <ForumBorderFrame color={thread.borderColor}>
    <article className={`group rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 sm:p-6 ${
      thread.borderColor
        ? "border-transparent"
        : "border-gray-200 hover:border-pink-200 hover:shadow-lg hover:shadow-pink-100/50"
    }`}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex shrink-0 gap-3 sm:flex-col sm:items-center">
          <div className="flex h-11 min-w-11 items-center justify-center gap-1 rounded-xl bg-gray-50 px-2 text-gray-700">
            <ArrowUp className="h-4 w-4" />
            <span className="text-xs font-bold">
              {formatCount(voteCount)}
            </span>
          </div>

          <div className="flex h-11 min-w-11 items-center justify-center gap-1 rounded-xl bg-pink-50 px-2 text-pink-600">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-bold">
              {formatCount(replyCount)}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700">
              {categoryName}
            </span>

            {isPinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                <Pin className="h-3 w-3" />
                Pinned
              </span>
            )}

            {thread.isBoosted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-50 px-2.5 py-1 text-xs font-semibold text-fuchsia-700">
                <Rocket className="h-3 w-3" />
                Boosted
              </span>
            )}

            {isSolved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Solved
              </span>
            )}

            {isLocked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                <LockKeyhole className="h-3 w-3" />
                Locked
              </span>
            )}
          </div>

          <h3 className="mt-4 text-lg font-bold leading-snug text-gray-950 transition-colors group-hover:text-pink-600 sm:text-xl">
            <Link to={threadHref}>{title}</Link>
          </h3>

          {excerpt && (
            <p className="mt-2 line-clamp-3 text-sm leading-7 text-gray-600">
              {excerpt}
            </p>
          )}

          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
            <span>
              By{" "}
              <span className="font-semibold text-gray-700">
                {authorName}
              </span>
            </span>

            <span aria-hidden="true">·</span>

            <time dateTime={createdAt || undefined}>
              {formatDate(createdAt)}
            </time>

            <span aria-hidden="true">·</span>

            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {formatCount(viewCount)} views
            </span>
          </div>
        </div>
      </div>
    </article>
    </ForumBorderFrame>
  );
}