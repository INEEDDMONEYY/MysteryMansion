export const FORUM_CATEGORY_SOURCES = Object.freeze({
  ADMIN: "admin",
  USER: "user",
});

export const FORUM_CATEGORY_STATUSES = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  ARCHIVED: "archived",
});

export const DEFAULT_FORUM_CATEGORIES = Object.freeze([
  {
    id: "general",
    name: "General Discussion",
    slug: "general",
    description:
      "General conversations and discussions within the Mystery Mansion community.",
    source: FORUM_CATEGORY_SOURCES.ADMIN,
    status: FORUM_CATEGORY_STATUSES.APPROVED,
    archived: false,
  },
  {
    id: "community",
    name: "Community",
    slug: "community",
    description:
      "Community conversations, experiences, questions, and discussions.",
    source: FORUM_CATEGORY_SOURCES.ADMIN,
    status: FORUM_CATEGORY_STATUSES.APPROVED,
    archived: false,
  },
]);

export const getForumCategoryById = (
  categoryId,
  categories = DEFAULT_FORUM_CATEGORIES
) => {
  if (!categoryId) {
    return null;
  }

  return (
    categories.find(
      (category) => category.id === categoryId
    ) || null
  );
};

export const getForumCategoryBySlug = (
  slug,
  categories = DEFAULT_FORUM_CATEGORIES
) => {
  if (!slug) {
    return null;
  }

  return (
    categories.find(
      (category) => category.slug === slug
    ) || null
  );
};

export const getActiveForumCategories = (
  categories = DEFAULT_FORUM_CATEGORIES
) =>
  categories.filter(
    (category) =>
      category.status ===
        FORUM_CATEGORY_STATUSES.APPROVED &&
      !category.archived
  );