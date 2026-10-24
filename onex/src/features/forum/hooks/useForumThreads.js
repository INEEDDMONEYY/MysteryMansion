import { useCallback, useEffect, useState } from "react";

import { getForumThreads } from "../services/forumThreadService";

const INITIAL_STATE = {
  threads: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasNextPage: false,
  },
  loading: false,
  loadingMore: false,
  error: null,
};

const useForumThreads = ({
  categoryId = null,
  categorySlug = null,
  sort = "latest",
  query = "",
  limit = 20,
  autoLoad = true,
} = {}) => {
  const [state, setState] = useState(INITIAL_STATE);

  const loadThreads = useCallback(
    async ({ page = 1, append = false } = {}) => {
      setState((current) => ({
        ...current,
        loading: !append,
        loadingMore: append,
        error: null,
      }));

      try {
        const result = await getForumThreads({
          categoryId,
          categorySlug,
          sort,
          query,
          page,
          limit,
        });

        setState((current) => ({
          threads: append
            ? [...current.threads, ...result.threads]
            : result.threads,
          pagination: result.pagination,
          loading: false,
          loadingMore: false,
          error: null,
        }));

        return result;
      } catch (error) {
        setState((current) => ({
          ...current,
          loading: false,
          loadingMore: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load forum threads.",
        }));

        return null;
      }
    },
    [categoryId, categorySlug, limit, query, sort]
  );

  const loadMore = useCallback(async () => {
    if (
      state.loading ||
      state.loadingMore ||
      !state.pagination.hasNextPage
    ) {
      return null;
    }

    return loadThreads({
      page: state.pagination.page + 1,
      append: true,
    });
  }, [loadThreads, state.loading, state.loadingMore, state.pagination]);

  const refresh = useCallback(
    () => loadThreads({ page: 1, append: false }),
    [loadThreads]
  );

  useEffect(() => {
    if (!autoLoad) return;

    loadThreads({ page: 1, append: false });
  }, [autoLoad, loadThreads]);

  return {
    threads: state.threads,
    pagination: state.pagination,
    loading: state.loading,
    loadingMore: state.loadingMore,
    error: state.error,
    loadThreads,
    loadMore,
    refresh,
  };
};

export default useForumThreads;
