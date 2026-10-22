import {
  PROVIDER_RANK_CATEGORIES,
  PROVIDER_RANK_TIERS,
  PROVIDER_RANK_VERSION,
} from "../data/providerRankData";

import { PROVIDER_RANK_CRITERIA } from "../data/rankCriteria";

import {
  calculateRankProgress,
  calculateWeightedScore,
  createCategoryScore,
  createRankResult,
  findNextRankTier,
  findRankTier,
  normalizeScore,
} from "./rankUtils";

const getCriterionScore = (criterion, criterionScores = {}) => {
  const value = criterionScores[criterion.id];

  if (typeof value === "boolean") {
    return value ? 100 : 0;
  }

  return normalizeScore(value);
};

const buildCategoryScore = (
  category,
  criterionScores = {}
) => {
  const criteria = PROVIDER_RANK_CRITERIA[category.id] || [];

  if (!criteria.length) {
    return createCategoryScore({
      id: category.id,
      label: category.label,
      weight: category.weight,
      score: 0,
      criteria: [],
    });
  }

  const enabledCriteria = criteria.filter(
    (criterion) => criterion.enabled !== false
  );

  const criteriaWithScores = enabledCriteria.map((criterion) => ({
    ...criterion,
    score: getCriterionScore(criterion, criterionScores),
  }));

  const categoryScore =
    criteriaWithScores.length > 0
      ? criteriaWithScores.reduce(
          (total, criterion) => total + criterion.score,
          0
        ) / criteriaWithScores.length
      : 0;

  return createCategoryScore({
    id: category.id,
    label: category.label,
    weight: category.weight,
    score: categoryScore,
    criteria: criteriaWithScores,
  });
};

const calculateProviderRank = ({
  criterionScores = {},
} = {}) => {
  const categoryScores = PROVIDER_RANK_CATEGORIES.map(
    (category) =>
      buildCategoryScore(category, criterionScores)
  );

  const score = calculateWeightedScore(categoryScores);

  const rank = findRankTier(
    score,
    PROVIDER_RANK_TIERS
  );

  const nextRank = findNextRankTier(
    score,
    PROVIDER_RANK_TIERS
  );

  const progress = calculateRankProgress(
    score,
    rank,
    nextRank
  );

  return createRankResult({
    version: PROVIDER_RANK_VERSION,
    role: "provider",
    score,
    rank,
    nextRank,
    progress,
    categoryScores,
  });
};

export default calculateProviderRank;