import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ForumSearch from "./ForumSearch";
import ForumSort from "./ForumSort";
import ForumThreadList from "./ForumThreadList";

import useForumThreads from "../hooks/useForumThreads";
import { DEFAULT_FORUM_SORT } from "../data/forumSortOptions";

const chipClass = (active) =>
  `inline-flex min-h-10 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-pink-500 ${
    active
      ? "border-pink-600 bg-pink-600 text-white"
      : "border-gray-200 bg-white text-gray-700 hover:border-pink-300 hover:text-pink-600"
  }`;

/**
 * Searchable, sortable discussion list backed by the API. Filters live in the URL
 * (?q=, ?category=, ?sort=) so results can be shared and survive a refresh.
 * Pass fixedCategorySlug to lock the list to one category.
 */
export default function ForumDiscussionsBrowser({
  categories = [],
  fixedCategorySlug = "",
}) {
  const [params, setParams] = useSearchParams();

  const urlQuery = params.get("q") || "";
  const sort = params.get("sort") || DEFAULT_FORUM_SORT;
  const categorySlug = fixedCategorySlug || params.get("category") || "";

  const [queryInput, setQueryInput] = useState(urlQuery);

  useEffect(() => {
    setQueryInput(urlQuery);
  }, [urlQuery]);

  const { threads, pagination, loading, loadingMore, error, loadMore } =
    useForumThreads({
      categorySlug: categorySlug || null,
      sort,
      query: urlQuery,
      limit: 12,
    });

  const updateParams = (changes) => {
    const next = new URLSearchParams(params);

    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });

    setParams(next, { replace: true });
  };

  const activeCategory = categories.find((c) => c.slug === categorySlug);
  const hasFilters = Boolean(urlQuery || (!fixedCategorySlug && categorySlug));

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <ForumSearch
          query={queryInput}
          onQueryChange={setQueryInput}
          onSearch={(value) => updateParams({ q: value.trim() })}
        />
      </div>

      {!fixedCategorySlug && categories.length > 0 && (
        <div
          className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
          role="group"
          aria-label="Filter by category"
        >
          <button
            type="button"
            onClick={() => updateParams({ category: "" })}
            aria-pressed={!categorySlug}
            className={chipClass(!categorySlug)}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => updateParams({ category: category.slug })}
              aria-pressed={categorySlug === category.slug}
              className={chipClass(categorySlug === category.slug)}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-gray-950 sm:text-2xl">
            {activeCategory?.name || "All Discussions"}
          </h2>

          <p className="mt-1 text-sm text-gray-500" aria-live="polite">
            {loading
              ? "Loading..."
              : `${pagination.total} ${pagination.total === 1 ? "discussion" : "discussions"}${
                  urlQuery ? ` matching "${urlQuery}"` : ""
                }`}
          </p>
        </div>

        <ForumSort
          sort={sort}
          onChange={(value) =>
            updateParams({ sort: value === DEFAULT_FORUM_SORT ? "" : value })
          }
          disabled={loading}
        />
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() =>
            updateParams({
              q: "",
              category: fixedCategorySlug ? categorySlug : "",
            })
          }
          className="mt-4 text-xs font-semibold text-gray-500 underline underline-offset-4 transition hover:text-pink-600"
        >
          Clear filters
        </button>
      )}

      <div className="mt-6">
        <ForumThreadList
          threads={threads}
          loading={loading}
          error={error}
          emptyTitle="No discussions found"
          emptyDescription="Try another search or category, or start a new discussion with the community."
        />
      </div>

      {pagination.hasNextPage && !loading && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="min-h-11 rounded-xl border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-pink-300 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingMore ? "Loading more..." : "Load More Discussions"}
          </button>
        </div>
      )}
    </div>
  );
}
