// 💬 Comment Section

import CommentForm from "./CommentForm";
import CommentList from "./CommentList";

export default function CommentSection({
  comments = [],
  commentsLoading = false,
  commentText,
  setCommentText,
  editingCommentId,
  editingText,
  setEditingText,
  commentBusyId,
  commentError,
  currentUserId,
  currentUser,
  onCreateComment,
  onStartEditing,
  onCancelEditing,
  onUpdateComment,
  onDeleteComment,
  onSignIn,
  onSignUp,
}) {
  return (
    <section className="border-b border-gray-200 py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-xl font-semibold text-pink-500">
          Comments
        </h2>

        {currentUserId ? (
          <CommentForm
            commentText={commentText}
            setCommentText={
              setCommentText
            }
            onSubmit={onCreateComment}
            busy={
              commentBusyId === "new"
            }
          />
        ) : (
          <div className="mb-5 rounded-lg border border-pink-100 bg-pink-50 px-4 py-3 text-sm text-pink-700">
            <p className="font-medium">
              You need to be logged in to
              comment.
            </p>

            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={onSignIn}
                className="rounded-md bg-pink-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-pink-500"
              >
                Sign in
              </button>

              <button
                type="button"
                onClick={onSignUp}
                className="rounded-md border border-pink-400 px-3 py-1.5 text-xs font-semibold text-pink-700 hover:bg-white"
              >
                Sign up
              </button>
            </div>
          </div>
        )}

        {commentError && (
          <p className="mb-3 text-sm text-red-500">
            {commentError}
          </p>
        )}

        {commentsLoading ? (
          <p className="text-sm text-gray-500">
            Loading comments...
          </p>
        ) : (
          <CommentList
            comments={comments}
            currentUserId={
              currentUserId
            }
            currentUser={currentUser}
            editingCommentId={
              editingCommentId
            }
            editingText={editingText}
            setEditingText={
              setEditingText
            }
            commentBusyId={
              commentBusyId
            }
            onStartEditing={
              onStartEditing
            }
            onCancelEditing={
              onCancelEditing
            }
            onUpdate={onUpdateComment}
            onDelete={onDeleteComment}
          />
        )}
      </div>
    </section>
  );
}