import {
  canEditThread,
  canDeleteThread,
} from "../utils/threadUtils";

export const getForumThreads = async ({
  categoryId = null,
  sort = "latest",
  page = 1,
  limit = 20,
} = {}) => {
  /*
   * Future backend implementation:
   *
   * const response = await api.get("/forum/threads", {
   *   params: {
   *     categoryId,
   *     sort,
   *     page,
   *     limit,
   *   },
   * });
   *
   * return response.data;
   */

  return {
    threads: [],
    pagination: {
      page,
      limit,
      total: 0,
      hasNextPage: false,
    },
    categoryId,
    sort,
  };
};

export const getForumThread = async ({
  threadId,
} = {}) => {
  if (!threadId) {
    throw new Error("A thread ID is required.");
  }

  /*
   * Future backend implementation:
   *
   * const response = await api.get(
   *   `/forum/threads/${threadId}`
   * );
   *
   * return response.data;
   */

  return null;
};

export const createForumThread = async ({
  title,
  content,
  categoryId,
  authorId,
} = {}) => {
  if (!title?.trim()) {
    throw new Error("A thread title is required.");
  }

  if (!content?.trim()) {
    throw new Error("Thread content is required.");
  }

  if (!categoryId) {
    throw new Error("A forum category is required.");
  }

  if (!authorId) {
    throw new Error(
      "An authenticated user is required to create a thread."
    );
  }

  /*
   * Future backend implementation:
   *
   * return api.post("/forum/threads", {
   *   title,
   *   content,
   *   categoryId,
   * });
   */

  return {
    id: null,
    title: title.trim(),
    content: content.trim(),
    categoryId,
    authorId,
    pinned: false,
    archived: false,
    locked: false,
  };
};

export const updateForumThread = async ({
  thread,
  userId,
  isAdmin = false,
  updates = {},
} = {}) => {
  if (!thread) {
    throw new Error("A thread is required.");
  }

  if (
    !canEditThread({
      thread,
      userId,
      isAdmin,
    })
  ) {
    throw new Error(
      "You do not have permission to edit this thread."
    );
  }

  /*
   * Future backend implementation:
   *
   * return api.patch(
   *   `/forum/threads/${thread.id}`,
   *   updates
   * );
   */

  return {
    ...thread,
    ...updates,
  };
};

export const deleteForumThread = async ({
  thread,
  userId,
  isAdmin = false,
} = {}) => {
  if (!thread) {
    throw new Error("A thread is required.");
  }

  if (
    !canDeleteThread({
      thread,
      userId,
      isAdmin,
    })
  ) {
    throw new Error(
      "You do not have permission to delete this thread."
    );
  }

  /*
   * Future backend implementation:
   *
   * await api.delete(`/forum/threads/${thread.id}`);
   */

  return {
    success: true,
    threadId: thread.id,
  };
};