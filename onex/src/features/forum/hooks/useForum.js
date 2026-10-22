import { useCallback, useEffect, useState } from "react";

import {
  DEFAULT_FORUM_SORT,
} from "../data/forumSortOptions";

import {
  getForum,
} from "../services/forumService";

const INITIAL_STATE = {
  categories: [],
  sort: null,
  loading: false,
  error: null,
};

const useForum = ({
  sort = DEFAULT_FORUM_SORT,
  autoLoad = true,
} = {}) => {
  const [state, setState] = useState(INITIAL_STATE);

  const loadForum = useCallback(async () => {
    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    try {
      const result = await getForum({
        sort,
      });

      setState({
        categories: result.categories || [],
        sort: result.sort || null,
        loading: false,
        error: null,
      });

      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load the forum.";

      setState((current) => ({
        ...current,
        loading: false,
        error: message,
      }));

      return null;
    }
  }, [sort]);

  const refresh = useCallback(
    () => loadForum(),
    [loadForum]
  );

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    loadForum();
  }, [autoLoad, loadForum]);

  return {
    categories: state.categories,
    sort: state.sort,
    loading: state.loading,
    error: state.error,
    loadForum,
    refresh,
  };
};

export default useForum;