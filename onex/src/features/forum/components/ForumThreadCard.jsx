import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Check,
  CheckCircle2,
  Copy,
  Eye,
  MessageCircle,
  MoreHorizontal,
  Pin,
  LockKeyhole,
  Rocket,
  Share2,
} from "lucide-react";

import ForumBorderFrame from "./ForumBorderFrame";
import ForumFollowControls from "./interactions/ForumFollowControls";
import ForumVoteButton from "./interactions/ForumVoteButton";
import { getForumTextColor } from "../utils/forumTextColor";
// import ForumBookmarkButton from "./interactions/ForumBookmarkButton";
import ForumAuthor from "./ForumAuthor";
import ForumFollowers from "./ForumFollowers";
import AttachmentGallery from "@/shared/components/attachments/AttachmentGallery";
import { UserContext } from "@/context/UserContext";
import { isNewForumThread } from "../utils/forumUtils";
import { isOwnContent } from "../utils/replyUtils";

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

export default function ForumThreadCard({ thread, showPinned = false }) {
  const { user } = useContext(UserContext) || {};
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!thread) return null;

  const threadId =
    thread.id || thread._id || thread.slug;

  const title = thread.title || "Untitled discussion";
  const textPair = getForumTextColor(thread.textColor);

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

  const signedIn = Boolean(user?._id);
  const requireAuth = () => navigate("/signin");
  const images = Array.isArray(thread.attachments)
    ? thread.attachments.filter((item) => item.kind === "image" || item.kind === "gif")
    : [];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${threadHref}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <ForumBorderFrame color={thread.borderColor}>
    <article className={`group rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 sm:p-6 ${
      thread.borderColor
        ? "border-transparent"
        : "border-gray-200 hover:border-pink-200 hover:shadow-lg hover:shadow-pink-100/50"
    }`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <ForumAuthor author={thread.author} fallbackName={authorName} />
          <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
            <time dateTime={createdAt || undefined}>{formatDate(createdAt)}</time>
            <span aria-hidden="true">·</span>
            <span className="rounded-full bg-pink-50 px-2.5 py-0.5 font-semibold text-pink-700">
              {categoryName}
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {formatCount(viewCount)} views
            </span>
          </div>
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="More options"
            aria-expanded={menuOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
              <ForumFollowControls thread={thread} />
            </div>
          )}
        </div>
      </div>

      {(showPinned && isPinned) || isNewForumThread(thread) || thread.isBoosted || isSolved || isLocked ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {showPinned && isPinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              <Pin className="h-3 w-3" />
              Pinned
            </span>
          )}

          {isNewForumThread(thread) && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
              New
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
      ) : null}

      <h3
        className="mt-4 text-lg font-bold leading-snug text-gray-950 transition-colors group-hover:text-pink-600 sm:text-xl"
        style={textPair ? { color: textPair.title } : undefined}
      >
        <Link to={threadHref}>{title}</Link>
      </h3>

      {excerpt && (
        <p
          className="mt-2 line-clamp-4 whitespace-pre-line text-sm leading-7 text-gray-600"
          style={textPair ? { color: textPair.description } : undefined}
        >
          {excerpt}
        </p>
      )}

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
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

      {images.length > 0 && (
        <div className="mt-4">
          <AttachmentGallery attachments={images} />
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
        <Link
          to={threadHref}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
        >
          <MessageCircle className="h-4 w-4" />
          {formatCount(replyCount)}
        </Link>

        <ForumVoteButton
          targetType="thread"
          targetId={threadId}
          score={voteCount}
          value={thread.viewer?.vote || 0}
          canVote={signedIn}
          isOwn={isOwnContent(thread, user)}
          onRequireAuth={requireAuth}
        />

        <button
          type="button"
          onClick={copyLink}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
        >
          {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          {copied ? "Copied" : "Share"}
        </button>

        {/* <div className="ml-auto">
          <ForumBookmarkButton
            threadId={threadId}
            bookmarked={thread.viewer?.bookmarked}
            canBookmark={signedIn}
            onRequireAuth={requireAuth}
          />
        </div> */}
      </div>

      <ForumFollowers key={threadId} thread={thread} />
    </article>
    </ForumBorderFrame>
  );
}
