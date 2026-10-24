import { useEffect } from "react";
import { Link } from "react-router-dom";

import ForumPageHero from "../components/ForumPageHero";
import ForumDiscussionsBrowser from "../components/ForumDiscussionsBrowser";
import ForumCard from "../components/ForumCard";
import NewThreadButton from "../components/NewThreadButton";

import useForum from "../hooks/useForum";
import { getForumPageConfig } from "../data/forumPageConfig";
import { setSEO } from "@/shared/utils/seo";

export default function AllDiscussionsPage() {
  const { categories, error } = useForum();
  const hero = getForumPageConfig("allDiscussions");

  useEffect(() => {
    setSEO(
      "All Discussions | Mystery Mansion Forum",
      "Browse and search every Mystery Mansion community discussion.",
      { robots: "index, follow", canonicalPath: "/forum/discussions" }
    );
  }, []);

  return (
    <main className="min-h-screen w-full bg-gray-50">
      <ForumPageHero {...hero}>
        <NewThreadButton />
        <Link
          to="/forum"
          className="inline-flex min-h-11 items-center rounded-xl border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Forum home
        </Link>
      </ForumPageHero>

      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            {error && (
              <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <ForumDiscussionsBrowser categories={categories} />
          </div>

          <aside className="space-y-5">
            <ForumCard eyebrow="Community First" title="Keep discussions constructive.">
              <p className="text-sm leading-7 text-gray-600">
                Respect other members, protect personal information, and follow the
                platform's community guidelines.
              </p>
              <Link
                to="/community-guidelines"
                className="mt-4 inline-flex text-sm font-semibold text-pink-600 underline decoration-pink-200 underline-offset-4 hover:text-pink-700"
              >
                Read the guidelines
              </Link>
            </ForumCard>
          </aside>
        </div>
      </section>
    </main>
  );
}
