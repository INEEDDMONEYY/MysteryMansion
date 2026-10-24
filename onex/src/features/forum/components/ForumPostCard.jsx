import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Eye, LockKeyhole, Pencil, Pin, Trash2 } from "lucide-react";

import ForumVoteButton from "./interactions/ForumVoteButton";
import ForumBookmarkButton from "./interactions/ForumBookmarkButton";
import AttachmentGallery from "@/shared/components/attachments/AttachmentGallery";

import { formatForumCount, formatForumDate } from "../utils/forumUtils";
import { canEditThreadContent, isOwnContent } from "../utils/replyUtils";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 disabled:opacity-60";

export default function ForumPostCard({
  thread,
  user,
  onSave,
  onDelete,
  onModerate,
  onRequireAuth,
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(thread.title);
  const [content, setContent] = useState(thread.content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const signedIn = Boolean(user?._id);
  const isAdmin = user?.role === "admin";
  const canEdit = canEditThreadContent({ thread, user });

  const startEdit = () => {
    setTitle(thread.title);
    setContent(thread.content);
    setError("");
    setEditing(true);
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await onSave?.({ title, content });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const remove = () => {
    if (window.confirm("Delete this discussion and all of its replies? This cannot be undone.")) {
      onDelete?.();
    }
  };

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex gap-4 sm:gap-6">
        <ForumVoteButton
          targetType="thread"
          targetId={thread.id}
          score={thread.upvoteCount}
          value={thread.viewer?.vote || 0}
          canVote={signedIn}
          isOwn={isOwnContent(thread, user)}
          onRequireAuth={onRequireAuth}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {thread.category && (
              <Link
                to={`/forum/category/${thread.category.slug}`}
                className="rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700 transition hover:bg-pink-100"
              >
                {thread.category.name}
              </Link>
            )}

            {thread.pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                <Pin className="h-3 w-3" /> Pinned
              </span>
            )}

            {thread.isSolved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> Solved
              </span>
            )}

            {thread.locked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                <LockKeyhole className="h-3 w-3" /> Locked
              </span>
            )}
          </div>

          {editing ? (
            <form onSubmit={save} className="mt-4 space-y-3">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={160}
                disabled={saving}
                aria-label="Discussion title"
                className={inputClass}
              />

              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={10000}
                rows={8}
                disabled={saving}
                aria-label="Discussion content"
                className={`${inputClass} resize-y leading-7`}
              />

              {error && (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-10 rounded-lg bg-black px-5 text-sm font-semibold text-white transition hover:bg-pink-600 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>

                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="min-h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="mt-4 break-words text-2xl font-black leading-tight tracking-tight text-gray-950 sm:text-3xl">
                {thread.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                <span>
                  By <span className="font-semibold text-gray-800">{thread.author?.username}</span>
                </span>
                <span aria-hidden="true">·</span>
                <time dateTime={thread.createdAt}>{formatForumDate(thread.createdAt)}</time>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {formatForumCount(thread.viewCount)} views
                </span>
              </div>

              <p className="mt-6 whitespace-pre-wrap break-words text-base leading-8 text-gray-700">
                {thread.content}
              </p>

              <AttachmentGallery attachments={thread.attachments} className="mt-5" />

              {thread.tags?.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {thread.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {!editing && (
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
              <ForumBookmarkButton
                threadId={thread.id}
                bookmarked={thread.viewer?.bookmarked}
                canBookmark={signedIn}
                onRequireAuth={onRequireAuth}
              />

              {canEdit && (
                <button
                  type="button"
                  onClick={startEdit}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-600 transition hover:border-pink-300 hover:text-pink-600"
                >
                  <Pencil className="h-4 w-4" /> Edit
                </button>
              )}

              {canEdit && (
                <button
                  type="button"
                  onClick={remove}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              )}

              {isAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => onModerate?.({ pinned: !thread.pinned })}
                    className="min-h-10 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-600 transition hover:border-amber-300 hover:text-amber-700"
                  >
                    {thread.pinned ? "Unpin" : "Pin"}
                  </button>

                  <button
                    type="button"
                    onClick={() => onModerate?.({ locked: !thread.locked })}
                    className="min-h-10 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-600 transition hover:border-gray-400 hover:text-gray-900"
                  >
                    {thread.locked ? "Unlock" : "Lock"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
