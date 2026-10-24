import { useMemo } from "react";
import { MessageCircle } from "lucide-react";

import ForumReply from "./ForumReply";
import { buildReplyTree } from "../../utils/replyUtils";

export default function ForumReplyList({
  replies = [],
  loading = false,
  error = "",
  thread,
  user,
  canReply = true,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  onReply,
  onEdit,
  onDelete,
  onSolutionChange,
  onVoteChange,
  onRequireAuth,
}) {
  const tree = useMemo(() => buildReplyTree(replies), [replies]);

  if (loading) {
    return (
      <div className="space-y-3" aria-label="Loading replies">
        {[1, 2, 3].map((item) => (
          <div key={item} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="mt-3 h-4 w-full rounded bg-gray-100" />
            <div className="mt-2 h-4 w-2/3 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
        <MessageCircle className="mx-auto h-7 w-7 text-gray-400" />
        <h3 className="mt-3 text-base font-bold text-gray-900">No replies yet</h3>
        <p className="mt-1 text-sm text-gray-500">Be the first to respond to this discussion.</p>
      </div>
    );
  }

  const shared = {
    thread,
    user,
    onReply,
    onEdit,
    onDelete,
    onSolutionChange,
    onVoteChange,
    onRequireAuth,
  };

  return (
    <div className="space-y-4">
      {tree.map((reply) => (
        <ForumReply key={reply.id} reply={reply} canReply={canReply} {...shared}>
          {reply.children.length > 0 &&
            reply.children.map((child) => (
              <ForumReply key={child.id} reply={child} canReply={canReply} isChild {...shared} />
            ))}
        </ForumReply>
      ))}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="min-h-11 rounded-xl border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-pink-300 hover:text-pink-600 disabled:opacity-60"
          >
            {loadingMore ? "Loading..." : "Load more replies"}
          </button>
        </div>
      )}
    </div>
  );
}
