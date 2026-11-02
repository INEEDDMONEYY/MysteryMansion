import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  MessageSquareText,
  MessagesSquare,
  Users,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import ForumSearch from "../components/ForumSearch";
import ForumThreadList from "../components/ForumThreadList";
import NewThreadButton from "../components/NewThreadButton";

import useForumThreads from "../hooks/useForumThreads";

import { setPublicPageSEO } from "@/shared/utils/seo";

const LATEST_COUNT = 6;

function ForumHero({ query, onQueryChange, onSearch }) {
  return (
    <section className="relative isolate overflow-hidden bg-neutral-950">
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-fuchsia-600/15 blur-[130px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-pink-600/10 blur-[130px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-4 py-2">
            <Sparkles size={14} className="text-pink-400" />

            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-300 sm:text-xs">
              Mystery Mansion Community
            </span>
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Your Community.
            <span className="mt-2 block bg-gradient-to-r from-pink-400 via-fuchsia-400 to-pink-200 bg-clip-text text-transparent">
              Your Conversations.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
            Explore discussions, exchange ideas, ask questions, and
            connect with the Mystery Mansion community. Find conversations
            that matter and contribute your perspective.
          </p>

          <div className="mt-8 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.04] p-2 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-3">
            <ForumSearch
              query={query}
              onQueryChange={onQueryChange}
              onSearch={onSearch}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-5 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-2">
              <MessageSquareText size={15} className="text-pink-400" />
              Community discussions
            </span>

            <span className="flex items-center gap-2">
              <Users size={15} className="text-pink-400" />
              Member perspectives
            </span>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute inset-0 rounded-full bg-pink-500/10 blur-3xl" />

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/10">
                <MessagesSquare
                  size={25}
                  className="text-pink-400"
                />
              </div>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Community Hub
              </span>
            </div>

            <h2 className="mt-10 text-3xl font-black leading-tight text-white">
              Every conversation starts somewhere.
            </h2>

            <p className="mt-4 text-sm leading-7 text-gray-400">
              Ask questions, share experiences, exchange ideas, and help
              shape the community through meaningful discussions.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "Start a discussion",
                "Explore community categories",
                "Share your perspective",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.04] p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 text-pink-400">
                    {index + 1}
                  </div>

                  <span className="text-sm font-medium text-gray-300">
                    {item}
                  </span>

                  <ChevronRight
                    size={16}
                    className="ml-auto text-gray-600"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ForumPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const {
    threads,
    pagination,
    loading: threadsLoading,
    error: threadsError,
  } = useForumThreads({
    sort: "latest",
    limit: LATEST_COUNT,
  });

  useEffect(() => {
    setPublicPageSEO("/forum");
  }, []);

  const search = (value) => {
    const term = value.trim();

    if (term) {
      navigate(
        `/forum/discussions?q=${encodeURIComponent(term)}`
      );
    }
  };

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-white">
      <ForumHero
        query={query}
        onQueryChange={setQuery}
        onSearch={search}
      />

      {/* Latest Discussions */}
      <section className="bg-neutral-950 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
            <div className="min-w-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-400">
                    Community Activity
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                    Latest Discussions
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    See what the community is talking about.
                  </p>
                </div>

                <Link
                  to="/forum/discussions"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-pink-400 transition hover:text-pink-300"
                >
                  View all discussions
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 p-3 sm:p-5">
                <ForumThreadList
                  threads={threads}
                  loading={threadsLoading}
                  error={threadsError}
                  emptyTitle="No discussions yet"
                  emptyDescription="Be the first to start a conversation with the community."
                />
              </div>

              {pagination.hasNextPage && (
                <div className="mt-8 flex justify-center">
                  <Link
                    to="/forum/discussions"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-gray-300 transition hover:border-pink-500/40 hover:bg-pink-500/10 hover:text-white"
                  >
                    See all {pagination.total} discussions
                    <ArrowRight size={15} />
                  </Link>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <aside className="space-y-5">
              <div className="relative overflow-hidden rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-950/40 via-neutral-900 to-neutral-950 p-6">
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl" />

                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/15 text-pink-400">
                  <MessageSquareText className="h-5 w-5" />
                </div>

                <h3 className="relative mt-5 text-lg font-bold text-white">
                  Start a Conversation
                </h3>

                <p className="relative mt-2 text-sm leading-7 text-gray-400">
                  Have a question, an idea, or something useful to share?
                  Start a discussion with the community.
                </p>

                <NewThreadButton
                  label="Create a Discussion"
                  className="relative mt-5 w-full"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
                  <ShieldCheck size={20} />
                </div>

                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-400">
                  Community First
                </p>

                <h3 className="mt-2 text-lg font-bold text-white">
                  Keep Discussions Constructive.
                </h3>

                <p className="mt-2 text-sm leading-7 text-gray-400">
                  Respect other members, protect personal information,
                  and follow the platform's community guidelines.
                </p>

                <Link
                  to="/community-guidelines"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-pink-400 underline decoration-pink-500/30 underline-offset-4 transition hover:text-pink-300"
                >
                  Read the guidelines
                  <ArrowRight size={14} />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}