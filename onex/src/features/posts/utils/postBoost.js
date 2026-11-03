export const isPostBoosted = (post, now = Date.now()) => {
  if (!post?.boostedUntil) return false;
  const until = new Date(post.boostedUntil).getTime();
  return !Number.isNaN(until) && until > now;
};
