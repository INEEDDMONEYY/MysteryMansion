/** Shared loading / error / empty / load-more wrapper for the admin profile panels. */
export default function AdminDataState({
  loading,
  error,
  empty,
  emptyTitle,
  emptyDescription,
  hasMore,
  loadingMore,
  onLoadMore,
  children,
}) {
  if (loading) {
    return (
      <div className="space-y-3" aria-label="Loading">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-24 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
        {error}
      </p>
    );
  }

  if (empty) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 px-6 py-12 text-center">
        <h3 className="text-base font-bold text-gray-900">{emptyTitle}</h3>
        {emptyDescription && (
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">{emptyDescription}</p>
        )}
      </div>
    );
  }

  return (
    <>
      {children}

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="min-h-11 rounded-xl border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-pink-300 hover:text-pink-600 disabled:opacity-60"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}

export const chipClass = (active) =>
  `inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-pink-500 ${
    active
      ? "border-pink-600 bg-pink-600 text-white"
      : "border-gray-200 bg-white text-gray-700 hover:border-pink-300 hover:text-pink-600"
  }`;
