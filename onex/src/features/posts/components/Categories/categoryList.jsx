import { useEffect, useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import api from "@/shared/utils/api";

const normalizeCategory = (value = "") =>
  String(value).trim().toLowerCase();

const createCategorySlug = (value = "") =>
  normalizeCategory(value)
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Pill styling mirrors the homepage's HomeCategorySelector, but renders
// buttons (not links) so picking a category selects it instead of navigating away.
export default function CategoryList({ selectedCategories = [], onSelect }) {
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
              .filter((category) => category.name && category.slug)
          : [];

        setCategories(normalized);
      } catch (error) {
        console.error("Failed to load post categories:", error);
        if (mounted) setCategories([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedSet = new Set(
    (Array.isArray(selectedCategories)
      ? selectedCategories
      : []
    )
      .map((category) => normalizeCategory(category))
      .filter(Boolean)
  );

  if (loading) {
    return (
      <div className="flex gap-3 overflow-hidden">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-[58px] min-w-[170px] animate-pulse rounded-xl bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category, index) => {
        const categoryName = category.name;
        const categorySlug = category.slug;
        const isSelected = selectedSet.has(
          normalizeCategory(categoryName)
        );

        return (
          <button
            key={categorySlug || index}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect?.(categoryName)}
            className={`
              group flex min-w-[170px] shrink-0 items-center justify-between
              rounded-xl border px-5 py-4
              transition-all duration-200
              hover:-translate-y-0.5
              hover:border-pink-500
              hover:shadow-lg
              focus:outline-none
              focus:ring-2
              focus:ring-pink-500
              focus:ring-offset-2
              ${
                isSelected
                  ? "border-pink-500 bg-gradient-to-r from-pink-500 to-yellow-300 text-white shadow-md"
                  : "border-black/10 bg-white text-black shadow-sm"
              }
            `}
          >
            <span className="text-sm font-semibold">
              {categoryName}
            </span>

            {isSelected ? (
              <Check size={17} className="text-white" />
            ) : (
              <ArrowRight
                size={17}
                className="text-pink-500 transition-transform duration-200 group-hover:translate-x-1"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

