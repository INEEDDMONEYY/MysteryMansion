export const getThreadReplyCount = (thread) => {
  const count = Number(thread?.replyCount);

  return Number.isFinite(count) && count >= 0
    ? count
    : 0;
};

export const getThreadScore = (thread) => {
  const score = Number(thread?.score);

  return Number.isFinite(score) ? score : 0;
};

export const isThreadPinned = (thread) =>
  Boolean(thread?.pinned);

export const isThreadArchived = (thread) =>
  Boolean(thread?.archived);

export const isThreadLocked = (thread) =>
  Boolean(thread?.locked);

export const isThreadActive = (thread) =>
  Boolean(thread) &&
  !isThreadArchived(thread) &&
  !isThreadLocked(thread);

export const canThreadReceiveReplies = (thread) =>
  isThreadActive(thread);

export const canMarkThreadSolution = ({
  thread,
  userId,
} = {}) => {
  if (!thread || !userId) {
    return false;
  }

  return String(thread.authorId) === String(userId);
};

export const canEditThread = ({
  thread,
  userId,
  isAdmin = false,
} = {}) => {
  if (!thread || !userId) {
    return false;
  }

  if (isAdmin) {
    return true;
  }

  return String(thread.authorId) === String(userId);
};

export const canDeleteThread = ({
  thread,
  userId,
  isAdmin = false,
} = {}) => {
  if (!thread || !userId) {
    return false;
  }

  if (isAdmin) {
    return true;
  }

  return String(thread.authorId) === String(userId);
};