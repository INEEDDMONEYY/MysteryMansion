import { useCallback, useEffect, useState } from "react";

import {
  getForumCategories,
  getForumCategory,
  getForumCategoryBySlug,
} from "../services/forumService";

const INITIAL_STATE = {
  categories: [],
  loading: false,
  error: null,
};

const useForumCategories = ({
  includeArchived = false,
  autoLoad = true,
} = {}) => {
  const [state, setState] = useState(INITIAL_STATE);

  const loadCategories = useCallback(async () => {
    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    try {
      const categories = await getForumCategories({
        includeArchived,
      });

      setState({
        categories: Array.isArray(categories)
          ? categories
          : [],
        loading: false,
        error: null,
      });

      return categories;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load forum categories.";

      setState((current) => ({
        ...current,
        loading: false,
        error: message,
      }));

      return [];
    }
  }, [includeArchived]);

  const findCategory = useCallback(
    async (categoryId) => {
      try {
        return await getForumCategory({
          categoryId,
          categories: state.categories,
        });
      } catch {
        return null;
      }
    },
    [state.categories]
  );

  const findCategoryBySlug = useCallback(
    async (slug) => {
      try {
        return await getForumCategoryBySlug({
          slug,
          categories: state.categories,
        });
      } catch {
        return null;
      }
    },
    [state.categories]
  );

  const refresh = useCallback(
    () => loadCategories(),
    [loadCategories]
  );

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    loadCategories();
  }, [autoLoad, loadCategories]);

  return {
    categories: state.categories,
    loading: state.loading,
    error: state.error,
    loadCategories,
    findCategory,
    findCategoryBySlug,
    refresh,
  };
};

export default useForumCategories;