export const CLIENT_RANK_VERSION = 1;

export const CLIENT_RANK_TIERS = Object.freeze([
  {
    id: "diamond",
    name: "Diamond Client",
    label: "Diamond",
    minScore: 90,
    maxScore: 100,
    badge: "diamond",
    publicMeaning: "Extremely reliable",
  },
  {
    id: "gold",
    name: "Gold Client",
    label: "Gold",
    minScore: 80,
    maxScore: 89,
    badge: "gold",
    publicMeaning: "High trust",
  },
  {
    id: "silver",
    name: "Silver Client",
    label: "Silver",
    minScore: 65,
    maxScore: 79,
    badge: "silver",
    publicMeaning: "Standard",
  },
  {
    id: "bronze",
    name: "Bronze Client",
    label: "Bronze",
    minScore: 50,
    maxScore: 64,
    badge: "bronze",
    publicMeaning: "Limited access",
  },
  {
    id: "red_flag",
    name: "Red-Flag Client",
    label: "Red Flag",
    minScore: 0,
    maxScore: 49,
    badge: "red_flag",
    publicMeaning: "Hidden or restricted",
  },
]);

export const CLIENT_RANK_CATEGORIES = Object.freeze([
  {
    id: "account_trust",
    label: "Account Trust Signals",
    weight: 30,
  },
  {
    id: "behavior_reliability",
    label: "Behavior & Reliability",
    weight: 35,
  },
  {
    id: "engagement_quality",
    label: "Engagement Quality",
    weight: 20,
  },
  {
    id: "spending_support",
    label: "Spending & Support",
    weight: 15,
  },
]);