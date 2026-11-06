const isAdminUser = (user) => user?.role === "admin";

const isAuthor = (item, user) =>
  Boolean(user?._id) &&
  String(item?.authorId) === String(user._id);

/**
 * Groups a flat reply list into a nested tree. Replies whose parent is not
 * loaded (for example, on another page) are treated as top-level.
 */
export const buildReplyTree = (replies = []) => {
  const ids = new Set(replies.map((reply) => reply.id));
  const childrenByParent = new Map();
  const roots = [];

  replies.forEach((reply) => {
    if (reply.parentReplyId && ids.has(reply.parentReplyId)) {
      const siblings = childrenByParent.get(reply.parentReplyId) || [];
      siblings.push(reply);
      childrenByParent.set(reply.parentReplyId, siblings);
    } else {
      roots.push(reply);
    }
  });

  const attachChildren = (reply) => ({
    ...reply,
    children: (childrenByParent.get(reply.id) || []).map(attachChildren),
  });

  return roots.map(attachChildren);
};

export const canEditReply = ({ reply, user } = {}) =>
  Boolean(reply) &&
  !reply.isDeleted &&
  (isAdminUser(user) || isAuthor(reply, user));

export const canDeleteReply = canEditReply;

export const canMarkSolution = ({ thread, user } = {}) =>
  Boolean(thread) &&
  (isAdminUser(user) || isAuthor(thread, user));

export const canEditThreadContent = ({ thread, user } = {}) =>
  Boolean(thread) &&
  (isAdminUser(user) || isAuthor(thread, user));

export const isOwnContent = (item, user) => isAuthor(item, user);
