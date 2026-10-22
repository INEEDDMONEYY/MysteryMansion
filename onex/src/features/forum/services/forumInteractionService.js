export const voteOnForumItem = async ({
  targetType,
  targetId,
  value,
} = {}) => {
  if (!targetType) {
    throw new Error(
      "A forum target type is required."
    );
  }

  if (!targetId) {
    throw new Error(
      "A forum target ID is required."
    );
  }

  if (![1, -1, 0].includes(value)) {
    throw new Error(
      "Forum vote value must be 1, -1, or 0."
    );
  }

  /*
   * Future backend implementation:
   *
   * return api.post("/forum/interactions/vote", {
   *   targetType,
   *   targetId,
   *   value,
   * });
   */

  return {
    targetType,
    targetId,
    value,
  };
};

export const toggleForumBookmark = async ({
  targetType,
  targetId,
} = {}) => {
  if (!targetType) {
    throw new Error(
      "A forum target type is required."
    );
  }

  if (!targetId) {
    throw new Error(
      "A forum target ID is required."
    );
  }

  /*
   * Future backend implementation:
   *
   * return api.post("/forum/interactions/bookmark", {
   *   targetType,
   *   targetId,
   * });
   */

  return {
    targetType,
    targetId,
  };
};

export const markForumReplyHelpful = async ({
  replyId,
} = {}) => {
  if (!replyId) {
    throw new Error("A reply ID is required.");
  }

  /*
   * Future backend implementation:
   *
   * return api.post(
   *   `/forum/replies/${replyId}/helpful`
   * );
   */

  return {
    replyId,
    helpful: true,
  };
};

export const markForumReplySolution = async ({
  threadId,
  replyId,
  userId,
} = {}) => {
  if (!threadId) {
    throw new Error("A thread ID is required.");
  }

  if (!replyId) {
    throw new Error("A reply ID is required.");
  }

  if (!userId) {
    throw new Error(
      "An authenticated user is required."
    );
  }

  /*
   * The backend should verify that the authenticated
   * user is the thread author before accepting this action.
   *
   * Future backend implementation:
   *
   * return api.post(
   *   `/forum/threads/${threadId}/solution`,
   *   { replyId }
   * );
   */

  return {
    threadId,
    replyId,
    markedBy: userId,
    solution: true,
  };
};

export const removeForumReplySolution = async ({
  threadId,
  userId,
} = {}) => {
  if (!threadId) {
    throw new Error("A thread ID is required.");
  }

  if (!userId) {
    throw new Error(
      "An authenticated user is required."
    );
  }

  /*
   * Future backend implementation:
   *
   * return api.delete(
   *   `/forum/threads/${threadId}/solution`
   * );
   */

  return {
    threadId,
    removedBy: userId,
    solution: false,
  };
};