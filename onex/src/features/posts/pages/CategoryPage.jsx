import BrandLoader from "@/shared/components/Loaders/BrandLoader";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import api from "@/shared/utils/api";
import CategoryDisplay from "../components/Categories/categoryDisplay";
import { formatCategoryTitle } from "../services/postCategories";
import { useServerReady } from "@/context/ServerReadyContext";
import { setSEO } from "@/shared/utils/seo";
import { toNearParams } from "../utils/postLocation";

const STORED_LOCATION_KEYS = ["userLocation", "location", "mm_location"];

const readStoredLocation = () => {
  for (const key of STORED_LOCATION_KEYS) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "null");
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // ignore malformed entries
    }
  }
  return null;
};

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
  const [location] = useState(readStoredLocation);
  const locationKey = JSON.stringify(toNearParams(location));

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
            api.get("/posts", {
              params: {
                category: categorySlug,
                ...JSON.parse(locationKey),
              },
            }),
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
  }, [categorySlug, locationKey, serverReady]);

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
    const title = `${categoryNameDisplay} | TopEscortNetwork`;

    const metaDescription =
      description ||
      `Explore ${categoryNameDisplay} listings on TopEscortNetwork.`;

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
      <section className="w-full bg-white">
        <BrandLoader size="lg" className="min-h-[60vh]" />
      </section>
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