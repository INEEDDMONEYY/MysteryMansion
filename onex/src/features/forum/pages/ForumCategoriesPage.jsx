import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LayoutGrid, Hash } from "lucide-react";
import BrandLoader from "@/shared/components/Loaders/BrandLoader";
import { setSEO } from "@/shared/utils/seo";
import useForum from "../hooks/useForum";

export default function ForumCategoriesPage() {
  const { categories, loading, error } = useForum();

  useEffect(() => {
    setSEO(
      "Forum Categories | TopEscortNetwork",
      "Explore all TopEscortNetwork forum categories and find your next community conversation.",
      { canonicalPath: "/forum/categories", robots: "index, follow" }
    );
  }, []);

  return (
    <main className="min-h-[65vh] bg-neutral-950 px-4 py-12 text-white sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-400">Find Your Space</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">All Forum Categories</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400">
          Discover topics, exchange ideas, and join the conversations that matter to you.
        </p>
        <div className="mt-10">
          {loading ? (
            <BrandLoader size="sm" />
          ) : error ? (
            <p role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-300">{error}</p>
          ) : categories.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-neutral-900 p-8 text-center text-gray-400">
              No categories are available yet. Community categories will appear here when available.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/forum/category/${category.slug}`}
                  className="group flex min-h-48 flex-col rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-900 to-neutral-950 p-6 transition hover:-translate-y-1 hover:border-pink-500/40 focus-visible:outline-2 focus-visible:outline-pink-400"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
                      <LayoutGrid size={20} aria-hidden="true" />
                    </span>
                    <ArrowRight size={18} className="text-gray-500 transition group-hover:translate-x-1 group-hover:text-pink-400" />
                  </div>
                  <h2 className="mt-5 text-lg font-bold group-hover:text-pink-300">{category.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{category.description || "Explore conversations and connect with the community."}</p>
                  {typeof category.threadCount === "number" && (
                    <span className="mt-auto flex items-center gap-1.5 pt-4 text-xs text-gray-500">
                      <Hash size={12} /> {category.threadCount} discussion{category.threadCount === 1 ? "" : "s"}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
