import { useCallback, useEffect, useState } from "react";

import {
  createForumReply,
  deleteForumReply,
  getForumReplies,
  updateForumReply,
} from "../services/forumReplyService";

const INITIAL_STATE = {
  replies: [],
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    hasNextPage: false,
  },
  loading: false,
  loadingMore: false,
  submitting: false,
  error: null,
};

const toMessage = (error, fallback) =>
  error instanceof Error ? error.message : fallback;

const useForumReplies = ({
  threadId,
  limit = 50,
  autoLoad = true,
} = {}) => {
  const [state, setState] = useState(INITIAL_STATE);

  const loadReplies = useCallback(
    async ({ page = 1, append = false } = {}) => {
      if (!threadId) return null;

      setState((current) => ({
        ...current,
        loading: !append,
        loadingMore: append,
        error: null,
      }));

      try {
        const result = await getForumReplies({ threadId, page, limit });

        setState((current) => ({
          ...current,
          replies: append
            ? [...current.replies, ...result.replies]
            : result.replies,
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
          error: toMessage(error, "Unable to load replies."),
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
  }, [loadReplies, state.loading, state.loadingMore, state.pagination]);

  // Rejects with the server message so forms can show it inline.
  const addReply = useCallback(
    async ({ content, parentReplyId = null, attachments = [] } = {}) => {
      setState((current) => ({ ...current, submitting: true }));

      try {
        const reply = await createForumReply({
          threadId,
          content,
          parentReplyId,
          attachments,
        });

        setState((current) => ({
          ...current,
          replies: [...current.replies, reply],
          pagination: {
            ...current.pagination,
            total: current.pagination.total + 1,
          },
          submitting: false,
        }));

        return reply;
      } catch (error) {
        setState((current) => ({ ...current, submitting: false }));
        throw error;
      }
    },
    [threadId]
  );

  const editReply = useCallback(async (reply, content) => {
    const updated = await updateForumReply({ reply, content });

    setState((current) => ({
      ...current,
      replies: current.replies.map((item) =>
        item.id === updated.id ? updated : item
      ),
    }));

    return updated;
  }, []);

  const removeReply = useCallback(async (reply) => {
    await deleteForumReply({ reply });

    setState((current) => ({
      ...current,
      replies: current.replies.map((item) =>
        item.id === reply.id
          ? {
              ...item,
              isDeleted: true,
              isSolution: false,
              content: "[This reply was deleted]",
            }
          : item
      ),
    }));
  }, []);

  // Local patch used after a vote or solution change.
  const patchReply = useCallback((replyId, patch) => {
    setState((current) => ({
      ...current,
      replies: current.replies.map((item) =>
        item.id === replyId ? { ...item, ...patch } : item
      ),
    }));
  }, []);

  // Only one reply can be the accepted answer.
  const setSolution = useCallback((replyId) => {
    setState((current) => ({
      ...current,
      replies: current.replies.map((item) => ({
        ...item,
        isSolution: Boolean(replyId) && item.id === replyId,
      })),
    }));
  }, []);

  const refresh = useCallback(
    () => loadReplies({ page: 1, append: false }),
    [loadReplies]
  );

  useEffect(() => {
    if (!autoLoad) return;

    loadReplies({ page: 1, append: false });
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
    editReply,
    removeReply,
    patchReply,
    setSolution,
    refresh,
  };
};

export default useForumReplies;
