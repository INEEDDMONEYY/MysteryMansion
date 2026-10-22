import { useCallback, useEffect, useState } from "react";

import {
  getForumReplies,
  createForumReply,
} from "../services/forumReplyService";

const INITIAL_STATE = {
  replies: [],
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    hasNextPage: false,
  },
  loading: false,
  loadingMore: false,
  submitting: false,
  error: null,
};

const useForumReplies = ({
  threadId,
  limit = 25,
  autoLoad = true,
} = {}) => {
  const [state, setState] = useState(
    INITIAL_STATE
  );

  const loadReplies = useCallback(
    async ({
      page = 1,
      append = false,
    } = {}) => {
      if (!threadId) {
        setState((current) => ({
          ...current,
          replies: [],
          loading: false,
          loadingMore: false,
          error: "A thread ID is required.",
        }));

        return null;
      }

      setState((current) => ({
        ...current,
        loading: !append,
        loadingMore: append,
        error: null,
      }));

      try {
        const result = await getForumReplies({
          threadId,
          page,
          limit,
        });

        const replies = Array.isArray(result?.replies)
          ? result.replies
          : [];

        setState((current) => ({
          replies: append
            ? [...current.replies, ...replies]
            : replies,
          pagination: result?.pagination || {
            page,
            limit,
            total: replies.length,
            hasNextPage: false,
          },
          loading: false,
          loadingMore: false,
          submitting: false,
          error: null,
        }));

        return result;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load forum replies.";

        setState((current) => ({
          ...current,
          loading: false,
          loadingMore: false,
          error: message,
        }));

        return null;
      }
    },
    [limit, threadId]
  );

  const loadMore = useCallback(async () => {
    if (
      state.loading ||
      state.loadingMore ||
      !state.pagination.hasNextPage
    ) {
      return null;
    }

    return loadReplies({
      page: state.pagination.page + 1,
      append: true,
    });
  }, [
    loadReplies,
    state.loading,
    state.loadingMore,
    state.pagination,
  ]);

  const addReply = useCallback(
    async ({
      content,
      authorId,
      parentReplyId = null,
    } = {}) => {
      if (!threadId) {
        throw new Error("A thread ID is required.");
      }

      setState((current) => ({
        ...current,
        submitting: true,
        error: null,
      }));

      try {
        const reply = await createForumReply({
          threadId,
          content,
          authorId,
          parentReplyId,
        });

        setState((current) => ({
          ...current,
          replies: reply?.id
            ? [...current.replies, reply]
            : current.replies,
          submitting: false,
          error: null,
        }));

        return reply;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to create the reply.";

        setState((current) => ({
          ...current,
          submitting: false,
          error: message,
        }));

        return null;
      }
    },
    [threadId]
  );

  const refresh = useCallback(
    () =>
      loadReplies({
        page: 1,
        append: false,
      }),
    [loadReplies]
  );

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    loadReplies({
      page: 1,
      append: false,
    });
  }, [autoLoad, loadReplies]);

  return {
    replies: state.replies,
    pagination: state.pagination,
    loading: state.loading,
    loadingMore: state.loadingMore,
    submitting: state.submitting,
    error: state.error,
    loadReplies,
    loadMore,
    addReply,
    refresh,
  };
};

export default useForumReplies;