import { Link } from "react-router-dom";
import { Star } from "lucide-react";

import usePagedProfileData from "../../hooks/usePagedProfileData";
import { fetchProfileReviews } from "../../services/profileActivityService";
import ProfileDataState from "../profile-shared/ProfileDataState";
import { formatProfileDate } from "../profile-shared/formatters";

function Stars({ rating }) {
  return (
    <span className="inline-flex" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`h-4 w-4 ${value <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </span>
  );
}

/** Reviews a member has written about provider accounts. */
export default function ClientReviewsGiven({ userId }) {
  const { items, extra, pagination, loading, loadingMore, error, loadMore } =
    usePagedProfileData(fetchProfileReviews, { userId }, { limit: 15 });

  const summary = extra.summary || { total: 0, averageRating: 0 };

  return (
    <div>
      {summary.total > 0 && (
        <p className="mb-4 text-sm text-gray-600">
          <span className="font-bold text-gray-950">{summary.total}</span>{" "}
          {summary.total === 1 ? "review" : "reviews"} written · average rating given{" "}
          <span className="font-bold text-gray-950">{summary.averageRating}</span>
        </p>
      )}

      <ProfileDataState
        loading={loading}
        error={error}
        empty={items.length === 0}
        emptyTitle="No reviews written yet"
        emptyDescription="Reviews this member leaves on provider accounts will appear here."
        hasMore={pagination.hasNextPage}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
      >
        <ul className="space-y-3">
          {items.map((review) => (
            <li key={review.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  {review.target?.profilePic ? (
                    <img
                      src={review.target.profilePic}
                      alt=""
                      className="h-9 w-9 rounded-full border border-gray-200 object-cover"
                    />
                  ) : (
                    <span className="h-9 w-9 rounded-full bg-gray-100" aria-hidden="true" />
                  )}

                  <div>
                    <p className="text-xs text-gray-500">Review for</p>
                    {review.target ? (
                      <Link
                        to={`/user/${review.target.id}`}
                        className="text-sm font-bold text-gray-950 hover:text-pink-600"
                      >
                        {review.target.username}
                      </Link>
                    ) : (
                      <span className="text-sm font-bold text-gray-500">Deleted account</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <Stars rating={review.rating} />
                  <p className="mt-0.5 text-xs text-gray-500">{formatProfileDate(review.createdAt)}</p>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                {review.text}
              </p>
            </li>
          ))}
        </ul>
      </ProfileDataState>
    </div>
  );
}
