export const PROVIDER_RANK_VERSION = 1;

export const PROVIDER_RANK_TIERS = Object.freeze([
  {
    id: "elite",
    tier: "S",
    name: "Elite",
    label: "S-Tier",
    minScore: 90,
    maxScore: 100,
    badge: "elite",
    publicMeaning: "Top reliability, top visibility",
  },
  {
    id: "trusted",
    tier: "A",
    name: "Trusted",
    label: "A-Tier",
    minScore: 80,
    maxScore: 89,
    badge: "trusted",
    publicMeaning: "Highly reliable",
  },
  {
    id: "standard",
    tier: "B",
    name: "Standard",
    label: "B-Tier",
    minScore: 65,
    maxScore: 79,
    badge: "standard",
    publicMeaning: "Normal visibility",
  },
  {
    id: "developing",
    tier: "C",
    name: "Developing",
    label: "C-Tier",
    minScore: 50,
    maxScore: 64,
    badge: "developing",
    publicMeaning: "Needs improvement",
  },
  {
    id: "limited",
    tier: "D",
    name: "Limited",
    label: "D-Tier",
    minScore: 0,
    maxScore: 49,
    badge: "limited",
    publicMeaning: "Restricted visibility",
  },
]);

export const PROVIDER_RANK_CATEGORIES = Object.freeze([
  {
    id: "profile_quality",
    label: "Profile Quality & Completeness",
    weight: 25,
  },
  {
    id: "engagement",
    label: "Engagement & Activity",
    weight: 25,
  },
  {
    id: "satisfaction_reliability",
    label: "Client Satisfaction & Reliability",
    weight: 35,
  },
  {
    id: "platform_contribution",
    label: "Platform Contribution",
    weight: 15,
  },
]);