import { forumRequest, toRequestData } from "./forumApi";

export const getForumReplies = async ({
  threadId,
  page = 1,
  limit = 50,
} = {}) => {
  if (!threadId) {
    throw new Error("A thread ID is required.");
  }

  const result = await forumRequest({
    method: "get",
    url: `/forum/threads/${encodeURIComponent(threadId)}/replies`,
    params: { page, limit },
  });

  return {
    replies: Array.isArray(result?.replies) ? result.replies : [],
    pagination: result?.pagination || {
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
  parentReplyId = null,
  attachments = [],
} = {}) => {
  if (!threadId) throw new Error("A thread ID is required.");
  if (!content?.trim() && !attachments.length) {
    throw new Error("Write a reply or attach an image.");
  }

  return forumRequest({
    method: "post",
    url: `/forum/threads/${encodeURIComponent(threadId)}/replies`,
    data: toRequestData(
      { content: (content || "").trim(), parentReplyId },
      attachments
    ),
  });
};

export const updateForumReply = async ({ reply, content } = {}) => {
  if (!reply?.id) throw new Error("A reply is required.");
  if (!content?.trim()) throw new Error("Reply content is required.");

  return forumRequest({
    method: "patch",
    url: `/forum/replies/${encodeURIComponent(reply.id)}`,
    data: { content: content.trim() },
  });
};

export const deleteForumReply = async ({ reply } = {}) => {
  if (!reply?.id) throw new Error("A reply is required.");

  return forumRequest({
    method: "delete",
    url: `/forum/replies/${encodeURIComponent(reply.id)}`,
  });
};
