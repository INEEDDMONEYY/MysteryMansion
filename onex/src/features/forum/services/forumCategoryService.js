import {
  DEFAULT_FORUM_CATEGORIES,
  getActiveForumCategories,
  getForumCategoryById,
  getForumCategoryBySlug,
} from "../data/forumCategories";

import { createForumSlug } from "../utils/forumUtils";

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
  if (!categoryId) {
    throw new Error("A forum category ID is required.");
  }

  return getForumCategoryById(categoryId, categories);
};

export const getForumCategoryBySlug = async ({
  slug,
  categories = DEFAULT_FORUM_CATEGORIES,
} = {}) => {
  if (!slug) {
    throw new Error("A forum category slug is required.");
  }

  return getForumCategoryBySlug(slug, categories);
};

export const createForumCategory = async ({
  name,
  description = "",
  createdBy,
} = {}) => {
  const trimmedName = name?.trim();

  if (!trimmedName) {
    throw new Error("A forum category name is required.");
  }

  if (!createdBy) {
    throw new Error(
      "An authenticated user is required to create a forum category."
    );
  }

  const slug = createForumSlug(trimmedName);

  if (!slug) {
    throw new Error("A valid forum category slug could not be created.");
  }

  return {
    id: null,
    name: trimmedName,
    slug,
    description: description.trim(),
    createdBy,
    source: "user",
    status: "pending",
    visibility: "public",
    archived: false,
    createdAt: null,
    updatedAt: null,
  };
};

export const updateForumCategory = async ({
  category,
  updates = {},
  userId,
  isAdmin = false,
} = {}) => {
  if (!category) {
    throw new Error("A forum category is required.");
  }

  if (!userId) {
    throw new Error(
      "An authenticated user is required to update a forum category."
    );
  }

  const isOwner =
    category.createdBy &&
    String(category.createdBy) === String(userId);

  if (!isAdmin && !isOwner) {
    throw new Error(
      "You do not have permission to update this forum category."
    );
  }

  const nextName =
    typeof updates.name === "string"
      ? updates.name.trim()
      : category.name;

  if (!nextName) {
    throw new Error("A forum category name is required.");
  }

  const nextDescription =
    typeof updates.description === "string"
      ? updates.description.trim()
      : category.description || "";

  const nextSlug =
    typeof updates.slug === "string" && updates.slug.trim()
      ? createForumSlug(updates.slug)
      : createForumSlug(nextName);

  return {
    ...category,
    ...updates,
    name: nextName,
    slug: nextSlug,
    description: nextDescription,
  };
};

export const updateForumCategoryStatus = async ({
  category,
  status,
  userId,
  isAdmin = false,
} = {}) => {
  if (!category) {
    throw new Error("A forum category is required.");
  }

  if (!userId) {
    throw new Error(
      "An authenticated user is required to update category status."
    );
  }

  if (!isAdmin) {
    throw new Error(
      "Only administrators can change forum category status."
    );
  }

  const validStatuses = [
    "pending",
    "approved",
    "rejected",
    "archived",
  ];

  if (!validStatuses.includes(status)) {
    throw new Error(`Unsupported forum category status: ${status}`);
  }

  return {
    ...category,
    status,
    archived: status === "archived",
  };
};

export const archiveForumCategory = async ({
  category,
  userId,
  isAdmin = false,
} = {}) => {
  return updateForumCategoryStatus({
    category,
    status: "archived",
    userId,
    isAdmin,
  });
};

export const deleteForumCategory = async ({
  category,
  userId,
  isAdmin = false,
} = {}) => {
  if (!category) {
    throw new Error("A forum category is required.");
  }

  if (!userId) {
    throw new Error(
      "An authenticated user is required to delete a forum category."
    );
  }

  if (!isAdmin) {
    throw new Error(
      "Only administrators can delete forum categories."
    );
  }

  return {
    success: true,
    categoryId: category.id,
  };
};