import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import api from "@/shared/utils/api";

const createCategorySlug = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function HomeCategorySelector() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        const { data } = await api.get("/categories");

        if (!mounted) return;

        const normalized = Array.isArray(data)
          ? data
              .map((category) => {
                if (typeof category === "string") {
                  return {
                    name: category,
                    slug: createCategorySlug(category),
                  };
                }

                return {
                  ...category,
                  name: category?.name,
                  slug:
                    category?.slug ||
                    createCategorySlug(category?.name),
                };
              })
              .filter(
                (category) =>
                  category.name &&
                  category.slug
              )
          : [];

        setCategories(normalized);
      } catch (error) {
        console.error(
          "Failed to load homepage categories:",
          error
        );

        if (mounted) {
          setCategories([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="w-full border-y border-black/10 bg-white">
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10">
          <div className="mb-5">
            <div className="h-3 w-20 animate-pulse rounded bg-pink-200" />

            <div className="mt-3 h-8 w-56 animate-pulse rounded bg-gray-200" />

            <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded bg-gray-100" />
          </div>

          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3, 4, 5].map(
              (item) => (
                <div
                  key={item}
                  className="h-[58px] min-w-[170px] animate-pulse rounded-xl bg-gray-100"
                />
              )
            )}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="w-full border-y border-black/10 bg-white">
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-600">
            Explore
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-black sm:text-3xl">
            Browse Categories
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Find providers and posts by category.
          </p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(
            (category, index) => (
              <Link
                key={
                  category.slug ||
                  category.name ||
                  index
                }
                to={`/category/${category.slug}`}
                className="group flex min-w-[180px] shrink-0 items-center justify-between rounded-xl border border-black/10 bg-white px-5 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-pink-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              >
                <span className="text-sm font-semibold text-black">
                  {category.name}
                </span>

                <ArrowRight
                  size={17}
                  className="text-pink-500 transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            )
          )}
        </div>
      </div>
    </section>
  );
}