const clamp = (value, min = 0, max = 100) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return min;
  }

  return Math.min(Math.max(numericValue, min), max);
};

export const normalizeScore = (value) => clamp(value);

export const normalizeWeight = (weight) => {
  const numericWeight = Number(weight);

  if (!Number.isFinite(numericWeight) || numericWeight < 0) {
    return 0;
  }

  return numericWeight;
};

export const calculateWeightedScore = (categoryScores = []) => {
  const validCategories = categoryScores.filter(
    (category) =>
      category &&
      Number.isFinite(Number(category.score)) &&
      Number.isFinite(Number(category.weight))
  );

  if (!validCategories.length) {
    return 0;
  }

  const totalWeight = validCategories.reduce(
    (total, category) => total + normalizeWeight(category.weight),
    0
  );

  if (totalWeight <= 0) {
    return 0;
  }

  const weightedTotal = validCategories.reduce(
    (total, category) =>
      total +
      normalizeScore(category.score) *
        normalizeWeight(category.weight),
    0
  );

  return Math.round((weightedTotal / totalWeight) * 100) / 100;
};

export const findRankTier = (score, tiers = []) => {
  const normalizedScore = normalizeScore(score);

  return (
    tiers.find(
      (tier) =>
        normalizedScore >= tier.minScore &&
        normalizedScore <= tier.maxScore
    ) || null
  );
};

export const findNextRankTier = (score, tiers = []) => {
  const normalizedScore = normalizeScore(score);

  const sortedTiers = [...tiers].sort(
    (a, b) => a.minScore - b.minScore
  );

  return (
    sortedTiers.find(
      (tier) => tier.minScore > normalizedScore
    ) || null
  );
};

export const calculateRankProgress = (
  score,
  currentTier,
  nextTier
) => {
  if (!nextTier) {
    return 100;
  }

  if (!currentTier) {
    return 0;
  }

  const range = nextTier.minScore - currentTier.minScore;

  if (range <= 0) {
    return 100;
  }

  const progress =
    ((normalizeScore(score) - currentTier.minScore) / range) * 100;

  return Math.round(clamp(progress));
};

export const getPointsToNextRank = (score, nextTier) => {
  if (!nextTier) {
    return 0;
  }

  return Math.max(
    0,
    Math.ceil(nextTier.minScore - normalizeScore(score))
  );
};

export const createCategoryScore = ({
  id,
  label,
  weight,
  score = 0,
  criteria = [],
}) => ({
  id,
  label,
  weight,
  score: normalizeScore(score),
  criteria,
});

export const createRankResult = ({
  role,
  score,
  rank,
  nextRank = null,
  progress = 100,
  categoryScores = [],
  version = 1,
}) => ({
  version,
  role,
  score: normalizeScore(score),
  rank,
  nextRank,
  progress: clamp(progress),
  pointsToNextRank: nextRank
    ? getPointsToNextRank(score, nextRank)
    : 0,
  categoryScores,
});