import { Link } from "react-router-dom";

import usePagedProfileData from "../../hooks/usePagedProfileData";
import { fetchProfileComments } from "../../services/profileActivityService";
import ProfileDataState from "../profile-shared/ProfileDataState";
import { formatProfileDateTime } from "../profile-shared/formatters";

/** Every comment a member has left on posts. */
export default function ClientComments({ userId }) {
  const { items, pagination, loading, loadingMore, error, loadMore } =
    usePagedProfileData(fetchProfileComments, { userId }, { limit: 15 });

  return (
    <ProfileDataState
      loading={loading}
      error={error}
      empty={items.length === 0}
      emptyTitle="No comments yet"
      emptyDescription="Comments this member leaves on posts will appear here."
      hasMore={pagination.hasNextPage}
      loadingMore={loadingMore}
      onLoadMore={loadMore}
    >
      <ul className="space-y-3">
        {items.map((comment) => (
          <li key={comment.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">
              {comment.post ? (
                <>
                  On{" "}
                  <Link to={`/posts/${comment.post.id}`} className="font-semibold text-pink-600 hover:underline">
                    {comment.post.title}
                  </Link>
                </>
              ) : (
                "On a post that is no longer available"
              )}
              {" · "}
              <time dateTime={comment.createdAt}>{formatProfileDateTime(comment.createdAt)}</time>
            </p>

            {comment.text && (
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                {comment.text}
              </p>
            )}
          </li>
        ))}
      </ul>
    </ProfileDataState>
  );
}
