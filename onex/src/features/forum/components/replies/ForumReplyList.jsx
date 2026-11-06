import BrandLoader from "@/shared/components/Loaders/BrandLoader";
import { useMemo } from "react";
import { MessageCircle } from "lucide-react";

import ForumReply from "./ForumReply";
import { buildReplyTree } from "../../utils/replyUtils";

// Past this depth replies stop indenting so they don't squeeze on small screens.
const MAX_NEST_DEPTH = 8;
const NESTED_CLASS = "ml-3 border-l-2 border-gray-200 pl-3 sm:ml-6 sm:pl-4";

export default function ForumReplyList({
  replies = [],
  loading = false,
  error = "",
  thread,
  user,
  canReply = true,
  canEditPosts = true,
  allowAttachments = true,
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
      <BrandLoader size="sm" label="Loading replies..." />
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
    canEditPosts,
    allowAttachments,
    onReply,
    onEdit,
    onDelete,
    onSolutionChange,
    onVoteChange,
    onRequireAuth,
  };

  const renderReplies = (nodes, parentReply, depth) =>
    nodes.map((reply) => {
      const nested = depth < MAX_NEST_DEPTH;

      return (
        <ForumReply
          key={reply.id}
          reply={reply}
          parentReply={parentReply}
          canReply={canReply}
          {...shared}
        >
          {reply.children.length > 0 && (
            <div className={nested ? NESTED_CLASS : ""}>
              {renderReplies(reply.children, reply, depth + 1)}
            </div>
          )}
        </ForumReply>
      );
    });

  return (
    <div className="divide-y divide-gray-200">
      {renderReplies(tree, null, 0)}

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
