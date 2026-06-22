/**
 * ReviewCard
 * Displays a single review: author, text, date, and optional delete action.
 * Used by ReviewsPage — extract inline JSX here during UI redesign.
 *
 * Props:
 *   review        — review object { _id, text, authorUserId, createdAt }
 *   canDelete     — bool, show delete button
 *   onDelete      — fn(reviewId)
 *   isDeleting    — bool, show spinner
 */
export default function ReviewCard({ review, canDelete, onDelete, isDeleting }) {
  return (
    <div className="review-card">
      {/* Author / meta row */}
      <div className="review-card__meta">
        <span className="review-card__author">
          {review?.authorUserId?.username ?? 'Anonymous'}
        </span>
        <span className="review-card__date">
          {review?.createdAt
            ? new Date(review.createdAt).toLocaleDateString()
            : ''}
        </span>
      </div>

      {/* Review text */}
      <p className="review-card__text">{review?.text}</p>

      {/* Delete action */}
      {canDelete && (
        <button
          type="button"
          onClick={() => onDelete(review._id)}
          disabled={isDeleting}
          className="review-card__delete"
        >
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
      )}
    </div>
  );
}
