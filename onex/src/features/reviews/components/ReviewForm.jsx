/**
 * ReviewForm
 * Input + submit button for posting a new review.
 * Used by ReviewsPage — extract inline form logic here during UI redesign.
 *
 * Props:
 *   value       — controlled textarea value
 *   onChange    — fn(e)
 *   onSubmit    — fn()
 *   isPosting   — bool, show loading state
 *   isDisabled  — bool, hide/disable when user can't post
 */
export default function ReviewForm({ value, onChange, onSubmit, isPosting, isDisabled }) {
  if (isDisabled) return null;

  return (
    <form
      className="review-form"
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
    >
      <textarea
        className="review-form__input"
        value={value}
        onChange={onChange}
        placeholder="Write a review…"
        rows={3}
        maxLength={500}
        required
      />
      <button
        type="submit"
        disabled={isPosting || !value?.trim()}
        className="review-form__submit"
      >
        {isPosting ? 'Posting…' : 'Post Review'}
      </button>
    </form>
  );
}
