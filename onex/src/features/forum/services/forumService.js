import {
  DEFAULT_FORUM_SORT,
  FORUM_SORT_OPTIONS,
  getForumSortOption,
} from "../data/forumSortOptions";

import { forumRequest } from "./forumApi";

export const getForumCategories = async () => {
  const categories = await forumRequest({
    method: "get",
    url: "/forum/categories",
  });

  return Array.isArray(categories) ? categories : [];
};

export const getForum = async ({
  sort = DEFAULT_FORUM_SORT,
} = {}) => ({
  categories: await getForumCategories(),
  sort: getForumSortOption(sort, FORUM_SORT_OPTIONS),
});

const findCategory = async (categories, matches) => {
  const list =
    Array.isArray(categories) && categories.length
      ? categories
      : await getForumCategories();

  return list.find(matches) || null;
};

export const getForumCategory = async ({
  categoryId,
  categories,
} = {}) =>
  categoryId
    ? findCategory(categories, (category) => category.id === categoryId)
    : null;

export const getForumCategoryBySlug = async ({
  slug,
  categories,
} = {}) =>
  slug
    ? findCategory(categories, (category) => category.slug === slug)
    : null;

export const createForumCategory = async ({
  name,
  description = "",
} = {}) => {
  if (!name?.trim()) {
    throw new Error("A forum category name is required.");
  }

  return forumRequest({
    method: "post",
    url: "/forum/categories",
    data: { name: name.trim(), description: description.trim() },
  });
};
