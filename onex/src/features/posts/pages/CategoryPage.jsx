import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import api from "@/shared/utils/api";
import CategoryDisplay from "../components/Categories/categoryDisplay";
import { formatCategoryTitle } from "../services/postCategories";
import { useServerReady } from "@/context/ServerReadyContext";
import { setSEO } from "@/shared/utils/seo";

const createCategorySlug = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const CATEGORY_DESCRIPTIONS = {};

const CATEGORY_IMAGES = {};

const DEFAULT_CATEGORY_IMAGE = "/mm-hero.png";

const normalizeCategories = (data) => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((category) => {
      if (typeof category === "string") {
        return {
          name: category,
          slug: createCategorySlug(category),
        };
      }

      if (
        category &&
        typeof category === "object"
      ) {
        return {
          ...category,
          name: category.name,
          slug:
            category.slug ||
            createCategorySlug(category.name),
        };
      }

      return null;
    })
    .filter(
      (category) =>
        category?.name &&
        category?.slug
    );
};

export default function CategoryPage() {
  const { categoryName } = useParams();
  const serverReady = useServerReady();

  const [categories, setCategories] =
    useState([]);

  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [location, setLocation] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const categorySlug = useMemo(
    () =>
      createCategorySlug(
        categoryName || ""
      ),
    [categoryName]
  );

  useEffect(() => {
    let mounted = true;

    const loadCategoryData =
      async () => {
        setLoading(true);

        try {
          const [
            categoriesResponse,
            postsResponse,
            usersResponse,
          ] = await Promise.all([
            api.get("/categories"),
            api.get("/posts"),
            api.get("/public/users"),
          ]);

          if (!mounted) {
            return;
          }

          setCategories(
            normalizeCategories(
              categoriesResponse?.data
            )
          );

          setPosts(
            Array.isArray(
              postsResponse?.data
            )
              ? postsResponse.data
              : []
          );

          setUsers(
            Array.isArray(
              usersResponse?.data
            )
              ? usersResponse.data
              : []
          );
        } catch (error) {
          if (!mounted) {
            return;
          }

          console.error(
            "Failed to load category page:",
            error
          );

          setCategories([]);
          setPosts([]);
          setUsers([]);
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    loadCategoryData();

    return () => {
      mounted = false;
    };
  }, [categorySlug, serverReady]);

  const category = useMemo(
    () =>
      categories.find(
        (item) =>
          createCategorySlug(
            item?.name
          ) === categorySlug ||
          createCategorySlug(
            item?.slug
          ) === categorySlug
      ),
    [categories, categorySlug]
  );

  const categoryNameDisplay = formatCategoryTitle(
    category?.name || categoryName || "Category"
  );

  const description =
    CATEGORY_DESCRIPTIONS[
      categorySlug
    ] ||
    "Explore providers and posts within this category.";

  const headerImage =
    CATEGORY_IMAGES[
      categorySlug
    ] ||
    category?.image ||
    category?.imageUrl ||
    category?.bannerImage ||
    DEFAULT_CATEGORY_IMAGE;

  useEffect(() => {
    const possibleKeys = [
      "location",
      "userLocation",
      "mm_location",
    ];

    for (const key of possibleKeys) {
      try {
        const stored =
          localStorage.getItem(key);

        if (!stored) {
          continue;
        }

        const parsed =
          JSON.parse(stored);

        if (
          parsed &&
          typeof parsed === "object"
        ) {
          setLocation(parsed);
          break;
        }
      } catch {
        continue;
      }
    }
  }, []);

  useEffect(() => {
    const title = `${categoryNameDisplay} | Mystery Mansion`;

    const metaDescription =
      description ||
      `Explore ${categoryNameDisplay} listings on Mystery Mansion.`;

    setSEO(
      title,
      metaDescription,
      {
        robots: "index, follow",
        canonicalPath: `/category/${categorySlug}`,
      }
    );
  }, [
    categoryNameDisplay,
    description,
    categorySlug,
  ]);

  if (loading) {
    return (
      <main className="w-full">
        <section className="relative w-full overflow-hidden bg-black">
          <div className="mx-auto flex min-h-[420px] max-w-screen-2xl items-center px-4 sm:px-6 lg:px-10">
            <div className="w-full max-w-3xl animate-pulse">
              <div className="mb-5 h-4 w-28 rounded bg-white/20" />

              <div className="h-12 w-80 rounded bg-white/20 sm:h-16 sm:w-[520px]" />

              <div className="mt-5 h-5 w-[420px] max-w-full rounded bg-white/20" />
            </div>
          </div>
        </section>

        <section className="w-full bg-white">
          <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({
                length: 8,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-64 animate-pulse rounded-xl bg-gray-100"
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="w-full">
      <section className="relative w-full overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${headerImage})`,
          }}
        />

        <div className="absolute inset-0 bg-black/65" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />

        <div className="relative mx-auto flex min-h-[420px] w-full max-w-screen-2xl items-end px-4 py-14 sm:min-h-[480px] sm:px-6 sm:py-16 lg:px-10 lg:py-20">
          <div className="max-w-4xl text-white">
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white"
            >
              <ArrowLeft size={17} />
              Back to Home
            </Link>

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-pink-400">
              Explore Category
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {categoryNameDisplay}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              {description}
            </p>
          </div>
        </div>
      </section>

      <section className="w-full bg-white">
        <CategoryDisplay
          selectedCategory={categorySlug}
          users={users}
          posts={posts}
          location={location}
        />
      </section>
    </main>
  );
}