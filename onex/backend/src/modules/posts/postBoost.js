const isActiveBoost = (post, now) => {
  const until = post?.boostedUntil ? new Date(post.boostedUntil).getTime() : 0;
  return until > now;
};

// Moves posts with a live boost to the front (most recently boosted first),
// keeping the existing order for everything else. Expired boosts rank normally.
export function orderBoostedFirst(posts = [], now = Date.now()) {
  const boosted = [];
  const rest = [];
  for (const post of posts) (isActiveBoost(post, now) ? boosted : rest).push(post);
  boosted.sort((a, b) => new Date(b.boostedUntil) - new Date(a.boostedUntil));
  return [...boosted, ...rest];
}
