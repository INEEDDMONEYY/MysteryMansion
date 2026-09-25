// 💬 Comment List

import CommentItem from "./CommentItem";

export default function CommentList({
  comments = [],
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
  if (comments.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No comments yet. Be the first to
        comment.
      </p>
    );
  }

  return (
    <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
      {comments.map((comment) => (
        <CommentItem
          key={comment._id}
          comment={comment}
          currentUserId={currentUserId}
          currentUser={currentUser}
          editingCommentId={
            editingCommentId
          }
          editingText={editingText}
          setEditingText={setEditingText}
          commentBusyId={commentBusyId}
          onStartEditing={
            onStartEditing
          }
          onCancelEditing={
            onCancelEditing
          }
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}