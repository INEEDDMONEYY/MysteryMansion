import { forumRequest } from "./forumApi";

export const voteOnForumItem = async ({
  targetType,
  targetId,
  value,
} = {}) => {
  if (!targetType) throw new Error("A forum target type is required.");
  if (!targetId) throw new Error("A forum target ID is required.");
  if (![1, -1, 0].includes(value)) {
    throw new Error("Forum vote value must be 1, -1, or 0.");
  }

  return forumRequest({
    method: "post",
    url: "/forum/interactions/vote",
    data: { targetType, targetId, value },
  });
};

export const toggleForumBookmark = async ({
  targetType = "thread",
  targetId,
} = {}) => {
  if (!targetId) throw new Error("A forum target ID is required.");

  return forumRequest({
    method: "post",
    url: "/forum/interactions/bookmark",
    data: { targetType, targetId },
  });
};

export const markForumReplySolution = async ({
  threadId,
  replyId,
} = {}) => {
  if (!threadId) throw new Error("A thread ID is required.");
  if (!replyId) throw new Error("A reply ID is required.");

  return forumRequest({
    method: "post",
    url: `/forum/threads/${encodeURIComponent(threadId)}/solution`,
    data: { replyId },
  });
};

export const removeForumReplySolution = async ({ threadId } = {}) => {
  if (!threadId) throw new Error("A thread ID is required.");

  return forumRequest({
    method: "delete",
    url: `/forum/threads/${encodeURIComponent(threadId)}/solution`,
  });
};
