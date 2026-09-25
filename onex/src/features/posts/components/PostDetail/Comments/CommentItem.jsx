// 💬 Individual Comment

import {
  Pencil,
  Trash2,
  Send,
  X,
} from "lucide-react";

export default function CommentItem({
  comment,
  currentUserId,
  currentUser,
  editingCommentId,
  editingText,
  setEditingText,
  commentBusyId,
  onStartEditing,
  onCancelEditing,
  onUpdate,
  onDelete,
}) {
  const commentUser =
    comment?.userId || {};

  const commentUserId =
    commentUser?._id ||
    commentUser?.id ||
    "";

  const canManage =
    Boolean(currentUserId) &&
    (String(currentUserId) ===
      String(commentUserId) ||
      currentUser?.role === "admin");

  const isEditing =
    editingCommentId === comment?._id;

  return (
    <div className="rounded-lg border border-gray-200 p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <img
            src={
              commentUser?.profilePic ||
              "https://via.placeholder.com/40?text=?"
            }
            alt={
              commentUser?.username ||
              "User"
            }
            className="h-10 w-10 rounded-full border border-pink-200 object-cover"
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800">
              {commentUser?.username ||
                "User"}
            </p>

            <p className="text-xs text-gray-500">
              {comment?.createdAt
                ? new Date(
                    comment.createdAt
                  ).toLocaleString()
                : ""}
            </p>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-1">
            {!isEditing && (
              <button
                type="button"
                onClick={() =>
                  onStartEditing(comment)
                }
                className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100"
                title="Edit comment"
              >
                <Pencil size={14} />
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                onDelete(comment._id)
              }
              disabled={
                commentBusyId ===
                comment._id
              }
              className="rounded-md p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-60"
              title="Delete comment"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="mt-3">
          <textarea
            value={editingText}
            onChange={(e) =>
              setEditingText(e.target.value)
            }
            rows={3}
            className="w-full rounded-lg border border-pink-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
          />

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancelEditing}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              <X size={13} />
              Cancel
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdate(comment._id)
              }
              disabled={
                !String(
                  editingText || ""
                ).trim() ||
                commentBusyId ===
                  comment._id
              }
              className="inline-flex items-center gap-1 rounded-md bg-pink-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-pink-500 disabled:opacity-60"
            >
              <Send size={13} />

              {commentBusyId ===
              comment._id
                ? "Saving..."
                : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-3 max-h-28 overflow-y-auto break-words whitespace-pre-wrap pr-1 text-sm text-gray-700">
          {comment?.text || ""}
        </p>
      )}
    </div>
  );
}