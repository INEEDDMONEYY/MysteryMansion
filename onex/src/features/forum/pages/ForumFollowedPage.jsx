import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "@/context/UserContext";
import { setSEO } from "@/shared/utils/seo";
import ForumThreadList from "../components/ForumThreadList";
import useForumThreads from "../hooks/useForumThreads";
import { FORUM_FOLLOW_CHANGED } from "../services/forumThreadService";

function FollowedThreads() {
  const { threads, loading, error, pagination, loadingMore, loadMore, refresh } = useForumThreads({ followed: true });

  useEffect(() => {
    window.addEventListener(FORUM_FOLLOW_CHANGED, refresh);
    return () => window.removeEventListener(FORUM_FOLLOW_CHANGED, refresh);
  }, [refresh]);

  return (
    <>
      <ForumThreadList
        threads={threads}
        loading={loading}
        error={error}
        emptyTitle="No followed threads yet"
        emptyDescription="Follow a discussion to keep it here. Turn on its bell to receive new reply notifications."
      />
      {pagination.hasNextPage && (
        <button type="button" disabled={loadingMore} onClick={loadMore} className="mt-6 rounded-xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
          {loadingMore ? "Loading..." : "Load more threads"}
        </button>
      )}
    </>
  );
}

export default function ForumFollowedPage() {
  const { user } = useContext(UserContext) || {};
  useEffect(() => {
    setSEO("Threads Followed | TopEscortNetwork Forum", "Keep track of the forum discussions you follow.", {
      canonicalPath: "/forum/followed",
      robots: "noindex, nofollow",
    });
  }, []);

  return (
    <main className="min-h-[65vh] bg-neutral-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-black tracking-tight">Threads Followed</h1>
        <p className="mt-3 text-sm leading-7 text-gray-400">Your saved conversations, with reply alerts controlled by each thread's bell.</p>
        <div className="mt-8">
          {user?._id ? <FollowedThreads key={user._id} /> : (
            <div className="rounded-2xl border border-white/10 bg-neutral-900 p-8 text-center">
              <p className="text-gray-300">Sign in to follow threads and manage reply notifications.</p>
              <Link to="/signin" className="mt-5 inline-block rounded-xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white">Sign In</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
