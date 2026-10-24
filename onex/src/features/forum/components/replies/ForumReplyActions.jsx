import { CornerDownRight, Pencil, Trash2 } from "lucide-react";

const actionClass =
  "inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500";

export default function ForumReplyActions({
  canReply = false,
  canEdit = false,
  canDelete = false,
  onReply,
  onEdit,
  onDelete,
}) {
  if (!canReply && !canEdit && !canDelete) return null;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {canReply && (
        <button type="button" onClick={onReply} className={actionClass}>
          <CornerDownRight className="h-3.5 w-3.5" />
          Reply
        </button>
      )}

      {canEdit && (
        <button type="button" onClick={onEdit} className={actionClass}>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      )}

      {canDelete && (
        <button
          type="button"
          onClick={onDelete}
          className={`${actionClass} hover:bg-red-50 hover:text-red-600`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      )}
    </div>
  );
}
