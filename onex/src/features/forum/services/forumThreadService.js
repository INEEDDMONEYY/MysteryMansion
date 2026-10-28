import { forumRequest, toRequestData } from "./forumApi";

export const getForumThreads = async ({
  categoryId = null,
  categorySlug = null,
  sort = "latest",
  query = "",
  page = 1,
  limit = 20,
} = {}) => {
  const result = await forumRequest({
    method: "get",
    url: "/forum/threads",
    params: {
      categoryId: categoryId || undefined,
      categorySlug: categorySlug || undefined,
      q: query?.trim() || undefined,
      sort,
      page,
      limit,
    },
  });

  return {
    threads: Array.isArray(result?.threads) ? result.threads : [],
    pagination: result?.pagination || {
      page,
      limit,
      total: 0,
      hasNextPage: false,
    },
    categoryId,
    sort,
  };
};

export const getForumThread = async ({ threadId } = {}) => {
  if (!threadId) {
    throw new Error("A thread ID is required.");
  }

  return forumRequest({
    method: "get",
    url: `/forum/threads/${encodeURIComponent(threadId)}`,
  });
};

export const createForumThread = async ({
  title,
  content,
  categoryId,
  tags = [],
  attachments = [],
  borderColor,
} = {}) => {
  if (!title?.trim()) throw new Error("A thread title is required.");
  if (!content?.trim()) throw new Error("Thread content is required.");
  if (!categoryId) throw new Error("A forum category is required.");

  return forumRequest({
    method: "post",
    url: "/forum/threads",
    data: toRequestData(
      { title: title.trim(), content: content.trim(), categoryId, tags, borderColor },
      attachments
    ),
  });
};

export const updateForumThread = async ({
  thread,
  updates = {},
} = {}) => {
  if (!thread?.id) throw new Error("A thread is required.");

  return forumRequest({
    method: "patch",
    url: `/forum/threads/${encodeURIComponent(thread.id)}`,
    data: updates,
  });
};

export const deleteForumThread = async ({ thread } = {}) => {
  if (!thread?.id) throw new Error("A thread is required.");

  return forumRequest({
    method: "delete",
    url: `/forum/threads/${encodeURIComponent(thread.id)}`,
  });
};

/** Spends one membership boost; resolves { thread, boostsRemaining }. */
export const boostForumThread = async ({ thread } = {}) => {
  if (!thread?.id) throw new Error("A thread is required.");

  return forumRequest({
    method: "post",
    url: `/forum/threads/${encodeURIComponent(thread.id)}/boost`,
  });
};
