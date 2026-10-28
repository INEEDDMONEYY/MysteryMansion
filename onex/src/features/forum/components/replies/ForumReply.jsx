import { useState } from "react";

import ForumReplyActions from "./ForumReplyActions";
import ForumReplyForm from "./ForumReplyForm";
import ForumVoteButton from "../interactions/ForumVoteButton";
import ForumSolutionButton from "../interactions/ForumSolutionButton";
import AttachmentGallery from "@/shared/components/attachments/AttachmentGallery";

import { formatForumTimeAgo } from "../../utils/forumUtils";
import {
  canDeleteReply,
  canEditReply,
  canMarkSolution,
  isOwnContent,
} from "../../utils/replyUtils";

const AUTHOR_BADGES = {
  Admin: "bg-black text-white",
  Provider: "bg-pink-50 text-pink-700",
  Client: "bg-purple-50 text-purple-700",
};

export default function ForumReply({
  reply,
  thread,
  user,
  canReply = true,
  canEditPosts = true,
  allowAttachments = true,
  isChild = false,
  onReply,
  onEdit,
  onDelete,
  onSolutionChange,
  onVoteChange,
  onRequireAuth,
  children,
}) {
  const [mode, setMode] = useState("view");
  const [saving, setSaving] = useState(false);

  const signedIn = Boolean(user?._id);
  const own = isOwnContent(reply, user);
  const deleted = reply.isDeleted;

  const submitReply = async (content, files) => {
    setSaving(true);

    try {
      await onReply?.(reply.id, content, files);
      setMode("view");
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async (content) => {
    setSaving(true);

    try {
      await onEdit?.(reply, content);
      setMode("view");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Delete this reply? This cannot be undone.")) {
      onDelete?.(reply);
    }
  };

  return (
    <article
      id={`reply-${reply.id}`}
      className={`rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${
        reply.isSolution ? "border-emerald-300 ring-1 ring-emerald-200" : "border-gray-200"
      } ${isChild ? "bg-gray-50/60" : ""}`}
    >
      <div className="flex gap-3 sm:gap-4">
        {!deleted && (
          <ForumVoteButton
            targetType="reply"
            targetId={reply.id}
            score={reply.upvoteCount}
            value={reply.viewerVote}
            canVote={signedIn}
            isOwn={own}
            onRequireAuth={onRequireAuth}
            onChange={(result) => onVoteChange?.(reply.id, result)}
          />
        )}

        <div className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="text-sm font-bold text-gray-900">
              {reply.author?.username || "Community Member"}
            </span>

            {reply.author?.role && (
              <span
                className={`rounded-full px-2 py-0.5 font-semibold ${
                  AUTHOR_BADGES[reply.author.role] || "bg-gray-100 text-gray-600"
                }`}
              >
                {reply.author.role}
              </span>
            )}

            <span className="text-gray-400" aria-hidden="true">
              ·
            </span>

            <time dateTime={reply.createdAt} className="text-gray-500">
              {formatForumTimeAgo(reply.createdAt)}
            </time>

            {reply.editedAt && !deleted && (
              <span className="text-gray-400">(edited)</span>
            )}
          </header>

          {mode === "edit" ? (
            <div className="mt-3">
              <ForumReplyForm
                initialValue={reply.content}
                submitLabel="Save changes"
                submitting={saving}
                allowAttachments={false}
                autoFocus
                onSubmit={submitEdit}
                onCancel={() => setMode("view")}
              />
            </div>
          ) : (
            <>
              {(reply.content || deleted) && (
                <p
                  className={`mt-2 whitespace-pre-wrap break-words text-sm leading-7 ${
                    deleted ? "italic text-gray-400" : "text-gray-700"
                  }`}
                >
                  {reply.content}
                </p>
              )}

              <AttachmentGallery attachments={reply.attachments} className="mt-3" />
            </>
          )}

          {!deleted && mode === "view" && (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
              <ForumReplyActions
                canReply={canReply && signedIn}
                canEdit={canEditPosts && canEditReply({ reply, user })}
                canDelete={canDeleteReply({ reply, user })}
                onReply={() => setMode("reply")}
                onEdit={() => setMode("edit")}
                onDelete={handleDelete}
              />

              <ForumSolutionButton
                threadId={thread?.id}
                replyId={reply.id}
                isSolution={reply.isSolution}
                canMark={canMarkSolution({ thread, user })}
                onChange={onSolutionChange}
              />
            </div>
          )}

          {mode === "reply" && (
            <div className="mt-4">
              <ForumReplyForm
                placeholder={`Reply to ${reply.author?.username || "this member"}...`}
                submitting={saving}
                allowAttachments={allowAttachments}
                autoFocus
                onSubmit={submitReply}
                onCancel={() => setMode("view")}
              />
            </div>
          )}
        </div>
      </div>

      {children && (
        <div className="mt-4 space-y-3 border-l-2 border-gray-100 pl-3 sm:ml-12 sm:pl-5">
          {children}
        </div>
      )}
    </article>
  );
}
