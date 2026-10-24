import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, MessageSquareText } from "lucide-react";

import ForumHeader from "../components/ForumHeader";
import ForumCategoryList from "../components/ForumCategoryList";
import ForumSearch from "../components/ForumSearch";
import ForumThreadList from "../components/ForumThreadList";
import ForumCard from "../components/ForumCard";
import NewThreadButton from "../components/NewThreadButton";

import useForum from "../hooks/useForum";
import useForumThreads from "../hooks/useForumThreads";

import { setSEO } from "@/shared/utils/seo";

const LATEST_COUNT = 6;

export default function ForumPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useForum();

  const {
    threads,
    pagination,
    loading: threadsLoading,
    error: threadsError,
  } = useForumThreads({ sort: "latest", limit: LATEST_COUNT });

  useEffect(() => {
    setSEO(
      "Community Forums | Mystery Mansion",
      "Join Mystery Mansion discussions, ask questions, share knowledge, and connect with the community.",
      { robots: "index, follow", canonicalPath: "/forum" }
    );
  }, []);

  const search = (value) => {
    const term = value.trim();

    if (term) navigate(`/forum/discussions?q=${encodeURIComponent(term)}`);
  };

  const selectCategory = (slug) =>
    navigate(slug ? `/forum/category/${slug}` : "/forum/discussions");

  return (
    <main className="min-h-screen w-full bg-white">
      <ForumHeader createThreadHref="/forum/create" />

      <ForumCategoryList
        categories={categories}
        selectedCategory=""
        onSelect={selectCategory}
        loading={categoriesLoading}
      />

      <section className="bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-7">
                <ForumSearch query={query} onQueryChange={setQuery} onSearch={search} />
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-600">
                    Community Forum
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
                    Latest Discussions
                  </h2>
                </div>

                <Link
                  to="/forum/discussions"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-pink-600 transition hover:text-pink-700"
                >
                  View all discussions
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-6">
                <ForumThreadList
                  threads={threads}
                  loading={threadsLoading}
                  error={threadsError || categoriesError}
                  emptyTitle="No discussions yet"
                  emptyDescription="Be the first to start a conversation with the community."
                />
              </div>

              {pagination.hasNextPage && (
                <div className="mt-8 flex justify-center">
                  <Link
                    to="/forum/discussions"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-pink-300 hover:text-pink-600"
                  >
                    See all {pagination.total} discussions
                  </Link>
                </div>
              )}
            </div>

            <aside className="space-y-5">
              <ForumCard>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                  <MessageSquareText className="h-5 w-5" />
                </div>

                <h3 className="mt-5 text-lg font-bold text-gray-950">Start a conversation</h3>

                <p className="mt-2 text-sm leading-7 text-gray-600">
                  Have a question, an idea, or something useful to share? Start a
                  discussion with the community.
                </p>

                <NewThreadButton label="Create a Discussion" className="mt-5 w-full" />
              </ForumCard>

              <ForumCard eyebrow="Community First" title="Keep discussions constructive.">
                <p className="text-sm leading-7 text-gray-600">
                  Respect other members, protect personal information, and follow the
                  platform's community guidelines.
                </p>

                <Link
                  to="/community-guidelines"
                  className="mt-4 inline-flex text-sm font-semibold text-pink-600 underline decoration-pink-200 underline-offset-4 transition hover:text-pink-700"
                >
                  Read the guidelines
                </Link>
              </ForumCard>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
