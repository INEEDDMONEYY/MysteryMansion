import { motion } from "framer-motion";
import {
  ArrowRight,
  MessageCircle,
  MessageSquareText,
} from "lucide-react";

const normalizeValue = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

function getCategoryValue(category) {
  if (typeof category === "string") {
    return category;
  }

  return (
    category?.slug ||
    category?._id ||
    category?.id ||
    category?.name ||
    ""
  );
}

function getCategoryName(category) {
  if (typeof category === "string") {
    return category;
  }

  return category?.name || category?.title || "Category";
}

export default function ForumCategoryList({
  categories = [],
  selectedCategory = "",
  onSelect,
  showAll = true,
  loading = false,
}) {
  const normalizedSelected = normalizeValue(selectedCategory);

  if (loading) {
    return (
      <section className="bg-white px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 h-3 w-24 animate-pulse rounded bg-pink-200" />
          <div className="mb-3 h-8 w-64 animate-pulse rounded bg-gray-200" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-600">
              Explore Discussions
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
              Browse by Category
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
              Find discussions that match your interests and the topics you
              want to explore.
            </p>
          </div>

          {showAll && (
            <button
              type="button"
              onClick={() => onSelect?.("")}
              aria-pressed={!normalizedSelected}
              className={`inline-flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                !normalizedSelected
                  ? "border-pink-600 bg-pink-600 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-pink-300 hover:text-pink-600"
              }`}
            >
              All Discussions
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {categories.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
            <MessageSquareText className="mx-auto h-8 w-8 text-gray-400" />

            <h3 className="mt-4 text-lg font-bold text-gray-900">
              Categories will appear here
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Forum categories will be displayed when they are available.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => {
              const value = getCategoryValue(category);
              const name = getCategoryName(category);
              const description =
                typeof category === "object"
                  ? category?.description
                  : "";

              const Icon =
                typeof category === "object" && category?.icon
                  ? category.icon
                  : MessageCircle;

              const selected =
                normalizedSelected === normalizeValue(value);

              return (
                <motion.button
                  key={value || name || index}
                  type="button"
                  onClick={() => onSelect?.(value)}
                  aria-pressed={selected}
                  whileHover={{ y: -4 }}
                  className={`group flex min-h-40 w-full flex-col rounded-2xl border p-5 text-left shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-pink-100/60 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
                    selected
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 bg-white hover:border-pink-200"
                  }`}
                >
                  <div className="flex w-full items-start justify-between gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                        selected
                          ? "bg-pink-600 text-white"
                          : "bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white"
                      }`}
                    >
                      <Icon size={20} />
                    </div>

                    <ArrowRight
                      size={17}
                      className={`mt-1 transition-transform group-hover:translate-x-1 ${
                        selected ? "text-pink-600" : "text-gray-300"
                      }`}
                    />
                  </div>

                  <h3 className="mt-5 text-base font-bold text-gray-950">
                    {name}
                  </h3>

                  {description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                      {description}
                    </p>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}