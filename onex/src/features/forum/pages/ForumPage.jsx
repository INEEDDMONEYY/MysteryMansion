import { useEffect, useMemo, useState } from "react";
import { MessageSquareText } from "lucide-react";

import ForumHeader from "../components/ForumHeader";
import ForumCategoryList from "../components/ForumCategoryList";
import ForumSearch from "../components/ForumSearch";
import ForumSort from "../components/ForumSort";
import ForumThreadList from "../components/ForumThreadList";

import useForum from "../hooks/useForum";
import useForumThreads from "../hooks/useForumThreads";

import { DEFAULT_FORUM_SORT } from "../data/forumSortOptions";
import { setSEO } from "@/shared/utils/seo";

export default function ForumPage() {
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useForum();

  const [selectedCategorySlug, setSelectedCategorySlug] =
    useState("");

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(DEFAULT_FORUM_SORT);

  const selectedCategory = categories.find(
    (category) =>
      category.slug === selectedCategorySlug
  );

  const categoryId = selectedCategory?.id || null;

  const {
    threads,
    pagination,
    loading: threadsLoading,
    loadingMore,
    error: threadsError,
    loadMore,
  } = useForumThreads({
    categoryId,
    sort,
    limit: 20,
    autoLoad: true,
    useDemoData: import.meta.env.DEV,
  });

  useEffect(() => {
    setSEO(
      "Community Forums | Mystery Mansion",
      "Join Mystery Mansion discussions, ask questions, share knowledge, and connect with the community.",
      {
        robots: "index, follow",
        canonicalPath: "/forum",
      }
    );
  }, []);

  const filteredThreads = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    if (!searchTerm) {
      return threads;
    }

    return threads.filter((thread) => {
      const tags = Array.isArray(thread?.tags)
        ? thread.tags
        : [];

      const searchableText = [
        thread?.title,
        thread?.excerpt,
        thread?.content,
        thread?.body,
        thread?.author?.username,
        thread?.authorName,
        thread?.category?.name,
        ...tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchTerm);
    });
  }, [threads, query]);

  const clearFilters = () => {
    setSelectedCategorySlug("");
    setQuery("");
    setSort(DEFAULT_FORUM_SORT);
  };

  const error = categoriesError || threadsError;

  return (
    <main className="min-h-screen w-full bg-white">
      <ForumHeader createThreadHref="/forum/create" />

      <ForumCategoryList
        categories={categories}
        selectedCategory={selectedCategorySlug}
        onSelect={setSelectedCategorySlug}
        loading={categoriesLoading}
      />

      <section className="bg-gray-50 px-6 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
                <ForumSearch
                  query={query}
                  onQueryChange={setQuery}
                  onSearch={setQuery}
                />
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-600">
                    Community Forum
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
                    {selectedCategory?.name ||
                      "Latest Discussions"}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    {filteredThreads.length}{" "}
                    {filteredThreads.length === 1
                      ? "discussion"
                      : "discussions"}
                    {query.trim()
                      ? ` matching "${query.trim()}"`
                      : ""}
                  </p>
                </div>

                <ForumSort
                  sort={sort}
                  onChange={setSort}
                  disabled={threadsLoading}
                />
              </div>

              {(selectedCategorySlug || query.trim()) && (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {selectedCategory && (
                    <span className="rounded-full bg-pink-100 px-3 py-1.5 text-xs font-semibold text-pink-700">
                      Category: {selectedCategory.name}
                    </span>
                  )}

                  {query.trim() && (
                    <span className="rounded-full bg-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700">
                      Search: {query.trim()}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-semibold text-gray-500 underline underline-offset-4 transition hover:text-pink-600"
                  >
                    Clear filters
                  </button>
                </div>
              )}

              <div className="mt-6">
                <ForumThreadList
                  threads={filteredThreads}
                  loading={threadsLoading}
                  error={error}
                  emptyTitle="No discussions found"
                  emptyDescription="Try another search or category, or start a new discussion with the community."
                />
              </div>

              {pagination.hasNextPage &&
                !query.trim() && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loadingMore || threadsLoading}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-pink-300 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingMore
                        ? "Loading more..."
                        : "Load More Discussions"}
                    </button>
                  </div>
                )}
            </div>

            <aside className="space-y-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                  <MessageSquareText className="h-5 w-5" />
                </div>

                <h3 className="mt-5 text-lg font-bold text-gray-950">
                  Start a conversation
                </h3>

                <p className="mt-2 text-sm leading-7 text-gray-600">
                  Have a question, an idea, or something useful to share?
                  Start a discussion with the community.
                </p>

                <a
                  href="/forum/create"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-pink-600"
                >
                  Create a Discussion
                </a>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-600">
                  Community First
                </p>

                <h3 className="mt-3 text-lg font-bold text-gray-950">
                  Keep discussions constructive.
                </h3>

                <p className="mt-2 text-sm leading-7 text-gray-600">
                  Respect other members, protect personal information, and
                  follow the platform's community guidelines.
                </p>

                <a
                  href="/community-guidelines"
                  className="mt-4 inline-flex text-sm font-semibold text-pink-600 underline decoration-pink-200 underline-offset-4 transition hover:text-pink-700"
                >
                  Read the guidelines
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}