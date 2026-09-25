const normalizeCategory = (value = "") => String(value).trim().toLowerCase();

export const createCategorySlug = (value = "") =>
  normalizeCategory(value)
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const formatCategoryTitle = (value = "") =>
  String(value)
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      word.length === 2
        ? word.toUpperCase()
        : `${word.charAt(0).toUpperCase()}${word.slice(1)}`
    )
    .join(" ");

export const getPostCategories = (post = {}) => {
  const arrayCategories = Array.isArray(post?.categories) ? post.categories : [];
  const legacyCategory =
    typeof post?.category === "string" && post.category.trim() ? [post.category.trim()] : [];

  const merged = [...arrayCategories, ...legacyCategory]
    .map((category) => String(category || "").trim())
    .filter(Boolean);

  if (!merged.length) return ["uncategorized"];

  const uniqueByNormalized = new Map();
  merged.forEach((category) => {
    const key = normalizeCategory(category);
    if (!uniqueByNormalized.has(key)) {
      uniqueByNormalized.set(key, category);
    }
  });

  return Array.from(uniqueByNormalized.values());
};

export const postHasCategory = (post, selectedCategory) => {
  const target = normalizeCategory(selectedCategory);
  const targetSlug = createCategorySlug(selectedCategory);
  if (!target) return true;

  return getPostCategories(post).some(
    (category) =>
      normalizeCategory(category) === target ||
      createCategorySlug(category) === targetSlug
  );
};
