import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Copy, Facebook, Heart, LayoutGrid, Mail, ShieldCheck, Twitter } from "lucide-react";

function RedditIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <circle cx="12" cy="13.5" r="7.5" />
      <circle cx="19.2" cy="5.8" r="1.6" />
      <path d="M12 6.2 13.2 2.6l5.4 1.2" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <circle cx="9.2" cy="12.8" r="1.2" fill="#fff" />
      <circle cx="14.8" cy="12.8" r="1.2" fill="#fff" />
      <path d="M9 16.3c1.8 1.2 4.2 1.2 6 0" stroke="#fff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

import ForumSort from "../components/ForumSort";
import ForumThreadList from "../components/ForumThreadList";

import useForumStats from "../hooks/useForumStats";
import useForumThreads from "../hooks/useForumThreads";

import { setPublicPageSEO } from "@/shared/utils/seo";

const LATEST_COUNT = 6;
const SHARE_TITLE = "Join the Mystery Mansion forum";

const getForumShareUrl = () =>
  typeof window === "undefined" ? "/forum" : `${window.location.origin}/forum`;

export default function ForumPage() {
  const [sort, setSort] = useState("latest");
  const [copied, setCopied] = useState(false);
  const { stats, loading: statsLoading } = useForumStats();

  const shareUrl = getForumShareUrl();
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(SHARE_TITLE);

  const shareLinks = [
    {
      label: "Share on Facebook",
      Icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "Share on X",
      Icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      label: "Share on Reddit",
      Icon: RedditIcon,
      href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    },
    {
      label: "Share by email",
      Icon: Mail,
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const {
    threads,
    pagination,
    loading: threadsLoading,
    error: threadsError,
  } = useForumThreads({
    sort,
    limit: LATEST_COUNT,
  });

  useEffect(() => {
    setPublicPageSEO("/forum");
  }, []);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-white">
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

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <ForumSort
                    sort={sort}
                    onChange={setSort}
                    disabled={threadsLoading}
                  />

                  <Link
                    to="/forum/discussions"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-pink-400 transition hover:text-pink-300"
                  >
                    View all discussions
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 p-3 sm:p-5">
                <ForumThreadList
                  variant="table"
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
              <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-400">
                  Conversation Stats
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <Heart className="h-4 w-4 text-pink-400" aria-hidden="true" />
                    <p className="mt-3 text-2xl font-black text-white">
                      {statsLoading ? "—" : (stats?.totalLikes ?? 0).toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Total likes</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <LayoutGrid className="h-4 w-4 text-yellow-400" aria-hidden="true" />
                    <p className="mt-3 text-2xl font-black text-white">
                      {statsLoading ? "—" : (stats?.newCategories ?? 0).toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">New categories (30 days)</p>
                  </div>
                </div>

                <p className="mt-4 text-xs text-gray-500">
                  {statsLoading
                    ? ""
                    : `${(stats?.totalCategories ?? 0).toLocaleString()} categories · ${(stats?.totalDiscussions ?? 0).toLocaleString()} discussions`}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-400">
                  Share the Forum
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {shareLinks.map((item) => {
                    const { label, Icon: ShareIcon, href } = item;
                    return (
                    <a
                      key={label}
                      href={href}
                      target={href.startsWith("mailto:") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition hover:border-pink-500/40 hover:bg-pink-500/10 hover:text-white"
                    >
                      <ShareIcon className="h-4 w-4" aria-hidden="true" />
                    </a>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    aria-label="Copy forum link"
                    title="Copy forum link"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition hover:border-pink-500/40 hover:bg-pink-500/10 hover:text-white"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-400" aria-hidden="true" />
                    ) : (
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
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