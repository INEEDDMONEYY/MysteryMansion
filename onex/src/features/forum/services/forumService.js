import {
  DEFAULT_FORUM_CATEGORIES,
  FORUM_CATEGORY_SOURCES,
  FORUM_CATEGORY_STATUSES,
  getActiveForumCategories,
  getForumCategoryById as findForumCategoryById,
  getForumCategoryBySlug as findForumCategoryBySlug,
} from "../data/forumCategories";

import {
  DEFAULT_FORUM_SORT,
  FORUM_SORT_OPTIONS,
  getForumSortOption,
} from "../data/forumSortOptions";

export const getForum = async ({
  categories = DEFAULT_FORUM_CATEGORIES,
  sort = DEFAULT_FORUM_SORT,
} = {}) => {
  const selectedSort = getForumSortOption(
    sort,
    FORUM_SORT_OPTIONS
  );

  return {
    categories: getActiveForumCategories(categories),
    sort: selectedSort,
  };
};

export const getForumCategories = async ({
  categories = DEFAULT_FORUM_CATEGORIES,
  includeArchived = false,
} = {}) => {
  if (includeArchived) {
    return categories;
  }

  return getActiveForumCategories(categories);
};

export const getForumCategory = async ({
  categoryId,
  categories = DEFAULT_FORUM_CATEGORIES,
} = {}) => {
  return findForumCategoryById(
    categoryId,
    categories
  );
};

export const getForumCategoryBySlug = async ({
  slug,
  categories = DEFAULT_FORUM_CATEGORIES,
} = {}) => {
  return findForumCategoryBySlug(
    slug,
    categories
  );
};

export const createForumCategory = async ({
  name,
  description = "",
  createdBy,
} = {}) => {
  if (!name?.trim()) {
    throw new Error(
      "A forum category name is required."
    );
  }

  if (!createdBy) {
    throw new Error(
      "An authenticated user is required to create a forum category."
    );
  }

  return {
    id: null,
    name: name.trim(),
    description: description.trim(),
    createdBy,
    source: FORUM_CATEGORY_SOURCES.USER,
    status: FORUM_CATEGORY_STATUSES.PENDING,
    archived: false,
  };
};