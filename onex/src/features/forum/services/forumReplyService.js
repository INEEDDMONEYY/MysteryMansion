export const getForumReplies = async ({
  threadId,
  page = 1,
  limit = 25,
} = {}) => {
  if (!threadId) {
    throw new Error("A thread ID is required.");
  }

  /*
   * Future backend implementation:
   *
   * const response = await api.get(
   *   `/forum/threads/${threadId}/replies`,
   *   {
   *     params: {
   *       page,
   *       limit,
   *     },
   *   }
   * );
   *
   * return response.data;
   */

  return {
    replies: [],
    pagination: {
      page,
      limit,
      total: 0,
      hasNextPage: false,
    },
  };
};

export const createForumReply = async ({
  threadId,
  content,
  authorId,
  parentReplyId = null,
} = {}) => {
  if (!threadId) {
    throw new Error("A thread ID is required.");
  }

  if (!content?.trim()) {
    throw new Error("Reply content is required.");
  }

  if (!authorId) {
    throw new Error(
      "An authenticated user is required to create a reply."
    );
  }

  /*
   * Future backend implementation:
   *
   * return api.post(
   *   `/forum/threads/${threadId}/replies`,
   *   {
   *     content,
   *     parentReplyId,
   *   }
   * );
   */

  return {
    id: null,
    threadId,
    content: content.trim(),
    authorId,
    parentReplyId,
  };
};

export const updateForumReply = async ({
  reply,
  userId,
  isAdmin = false,
  content,
} = {}) => {
  if (!reply) {
    throw new Error("A reply is required.");
  }

  if (!userId) {
    throw new Error(
      "An authenticated user is required."
    );
  }

  const isOwner =
    String(reply.authorId) === String(userId);

  if (!isOwner && !isAdmin) {
    throw new Error(
      "You do not have permission to edit this reply."
    );
  }

  if (!content?.trim()) {
    throw new Error("Reply content is required.");
  }

  /*
   * Future backend implementation:
   *
   * return api.patch(
   *   `/forum/replies/${reply.id}`,
   *   { content }
   * );
   */

  return {
    ...reply,
    content: content.trim(),
  };
};

export const deleteForumReply = async ({
  reply,
  userId,
  isAdmin = false,
} = {}) => {
  if (!reply) {
    throw new Error("A reply is required.");
  }

  if (!userId) {
    throw new Error(
      "An authenticated user is required."
    );
  }

  const isOwner =
    String(reply.authorId) === String(userId);

  if (!isOwner && !isAdmin) {
    throw new Error(
      "You do not have permission to delete this reply."
    );
  }

  /*
   * Future backend implementation:
   *
   * await api.delete(`/forum/replies/${reply.id}`);
   */

  return {
    success: true,
    replyId: reply.id,
  };
};