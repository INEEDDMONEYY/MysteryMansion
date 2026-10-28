import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Pages through an admin profile-data endpoint. Resets to page 1 whenever
 * `params` changes (pass a memoised/primitive-derived object or a stable key).
 */
export default function usePagedProfileData(fetcher, params = {}, { limit = 20 } = {}) {
  const [state, setState] = useState({
    items: [],
    extra: {},
    pagination: { page: 1, limit, total: 0, hasNextPage: false },
    loading: true,
    loadingMore: false,
    error: "",
  });

  const paramsKey = JSON.stringify(params);
  const requestId = useRef(0);

  const load = useCallback(
    async (page, append) => {
      const id = ++requestId.current;

      setState((current) => ({
        ...current,
        loading: !append,
        loadingMore: append,
        error: "",
      }));

      try {
        const { items, pagination, ...extra } = await fetcher({
          ...JSON.parse(paramsKey),
          page,
          limit,
        });

        if (id !== requestId.current) return;

        setState((current) => ({
          items: append ? [...current.items, ...items] : items,
          extra,
          pagination,
          loading: false,
          loadingMore: false,
          error: "",
        }));
      } catch (error) {
        if (id !== requestId.current) return;

        setState((current) => ({
          ...current,
          loading: false,
          loadingMore: false,
          error: error instanceof Error ? error.message : "Unable to load data.",
        }));
      }
    },
    [fetcher, limit, paramsKey]
  );

  useEffect(() => {
    load(1, false);
  }, [load]);

  const loadMore = useCallback(() => {
    if (state.loading || state.loadingMore || !state.pagination.hasNextPage) return;
    load(state.pagination.page + 1, true);
  }, [load, state.loading, state.loadingMore, state.pagination]);

  return { ...state, loadMore, reload: () => load(1, false) };
}
