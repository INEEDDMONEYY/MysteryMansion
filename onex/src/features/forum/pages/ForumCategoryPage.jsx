import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import ForumPageHero from "../components/ForumPageHero";
import ForumDiscussionsBrowser from "../components/ForumDiscussionsBrowser";
import NewThreadButton from "../components/NewThreadButton";

import useForum from "../hooks/useForum";
import { getForumPageConfig } from "../data/forumPageConfig";
import { setSEO } from "@/shared/utils/seo";

export default function ForumCategoryPage() {
  const { slug } = useParams();
  const { categories, loading, error } = useForum();
  const hero = getForumPageConfig("category");

  const category = categories.find((item) => item.slug === slug);

  useEffect(() => {
    if (!category) return;

    setSEO(
      `${category.name} | Mystery Mansion Forum`,
      category.description || `Discussions in ${category.name}.`,
      { robots: "index, follow", canonicalPath: `/forum/category/${category.slug}` }
    );
  }, [category]);

  if (!loading && !error && !category) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <h1 className="text-2xl font-black text-gray-950">Category not found</h1>
        <p className="mt-2 text-sm text-gray-500">
          This category may have been removed or is not available yet.
        </p>
        <Link
          to="/forum/discussions"
          className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-pink-600"
        >
          Browse all discussions
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-gray-50">
      <ForumPageHero
        {...hero}
        title={category?.name || "Loading..."}
        description={category?.description}
      >
        <NewThreadButton categorySlug={slug} />
        <Link
          to="/forum/discussions"
          className="inline-flex min-h-11 items-center rounded-xl border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          All discussions
        </Link>
      </ForumPageHero>

      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-5xl">
          {category && (
            <ForumDiscussionsBrowser
              categories={categories}
              fixedCategorySlug={category.slug}
            />
          )}
        </div>
      </section>
    </main>
  );
}
