import { useCallback, useEffect, useState } from "react";

import { forumDemoThreads } from "../data/forumDemoThreads";
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

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const getThreadCategoryId = (thread) =>
  thread?.categoryId ||
  thread?.category?.id ||
  thread?.category?._id ||
  null;

const getTimestamp = (value) => {
  const timestamp = value ? new Date(value).getTime() : 0;

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getActivityTimestamp = (thread) =>
  getTimestamp(
    thread?.lastReplyAt ||
      thread?.lastActivityAt ||
      thread?.updatedAt ||
      thread?.createdAt
  );

const getReplyCount = (thread) =>
  Number(thread?.replyCount ?? thread?.reply_count ?? 0);

const getVoteCount = (thread) =>
  Number(
    thread?.upvoteCount ??
      thread?.voteCount ??
      thread?.votes ??
      0
  );

const getViewCount = (thread) =>
  Number(thread?.viewCount ?? thread?.views ?? 0);

const sortDemoThreads = (threads, sort) =>
  [...threads].sort((first, second) => {
    const firstPinned = Boolean(
      first?.isPinned ?? first?.pinned
    );

    const secondPinned = Boolean(
      second?.isPinned ?? second?.pinned
    );

    if (firstPinned !== secondPinned) {
      return Number(secondPinned) - Number(firstPinned);
    }

    switch (sort) {
      case "newest":
        return (
          getTimestamp(second?.createdAt) -
          getTimestamp(first?.createdAt)
        );

      case "active":
        return (
          getActivityTimestamp(second) -
          getActivityTimestamp(first)
        );

      case "popular":
        return (
          getVoteCount(second) +
          getReplyCount(second) * 2 +
          getViewCount(second) * 0.05 -
          (getVoteCount(first) +
            getReplyCount(first) * 2 +
            getViewCount(first) * 0.05)
        );

      case "most_replied":
        return getReplyCount(second) - getReplyCount(first);

      case "latest":
      default:
        return (
          getActivityTimestamp(second) -
          getActivityTimestamp(first)
        );
    }
  });

const getDemoResult = ({
  categoryId,
  sort,
  page,
  limit,
}) => {
  const filteredThreads = forumDemoThreads.filter(
    (thread) =>
      !categoryId ||
      normalize(getThreadCategoryId(thread)) ===
        normalize(categoryId)
  );

  const sortedThreads = sortDemoThreads(
    filteredThreads,
    sort
  );

  const start = (page - 1) * limit;
  const threads = sortedThreads.slice(
    start,
    start + limit
  );

  return {
    threads,
    pagination: {
      page,
      limit,
      total: sortedThreads.length,
      hasNextPage: start + limit < sortedThreads.length,
    },
  };
};

const useForumThreads = ({
  categoryId = null,
  sort = "latest",
  limit = 20,
  autoLoad = true,
  useDemoData = false,
} = {}) => {
  const [state, setState] = useState(INITIAL_STATE);

  const loadThreads = useCallback(
    async ({
      page = 1,
      append = false,
    } = {}) => {
      setState((current) => ({
        ...current,
        loading: !append,
        loadingMore: append,
        error: null,
      }));

      try {
        const result = await getForumThreads({
          categoryId,
          sort,
          page,
          limit,
        });

        let threads = Array.isArray(result?.threads)
          ? result.threads
          : [];

        let pagination = result?.pagination || {
          page,
          limit,
          total: threads.length,
          hasNextPage: false,
        };

        if (
          useDemoData &&
          page === 1 &&
          threads.length === 0
        ) {
          const demoResult = getDemoResult({
            categoryId,
            sort,
            page,
            limit,
          });

          threads = demoResult.threads;
          pagination = demoResult.pagination;
        }

        setState((current) => ({
          threads: append
            ? [...current.threads, ...threads]
            : threads,
          pagination,
          loading: false,
          loadingMore: false,
          error: null,
        }));

        return {
          ...result,
          threads,
          pagination,
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load forum threads.";

        setState((current) => ({
          ...current,
          loading: false,
          loadingMore: false,
          error: message,
        }));

        return null;
      }
    },
    [categoryId, limit, sort, useDemoData]
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
  }, [
    loadThreads,
    state.loading,
    state.loadingMore,
    state.pagination,
  ]);

  const refresh = useCallback(
    () =>
      loadThreads({
        page: 1,
        append: false,
      }),
    [loadThreads]
  );

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    loadThreads({
      page: 1,
      append: false,
    });
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