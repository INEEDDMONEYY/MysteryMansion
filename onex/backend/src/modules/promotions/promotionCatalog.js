// Server-side source of truth for credit prices. Labels must match SiteDiscount TIER_LABELS.
export const PROMOTION_TIERS = {
  "promo-1w": { id: "promo-1w", label: "1 Week Promotion", credits: 250, days: 7, verified: false },
  "promo-2w": { id: "promo-2w", label: "2 Weeks Promotion", credits: 425, days: 14, verified: false },
  "promo-2w-verified": {
    id: "promo-2w-verified",
    label: "2 Weeks Promotion + Verification",
    credits: 850,
    days: 14,
    verified: true,
  },
  "promo-3w": { id: "promo-3w", label: "3 Weeks Promotion", credits: 1025, days: 21, verified: false },
  "promo-3w-verified": {
    id: "promo-3w-verified",
    label: "3 Weeks Promotion + Verification",
    credits: 1100,
    days: 21,
    verified: true,
  },
  "blue-badge": {
    id: "blue-badge",
    label: "Blue Badge Verification",
    credits: 50,
    monthly: true,
  },
};

export const BLUE_BADGE_MONTHLY_CREDITS = PROMOTION_TIERS["blue-badge"].credits;

export const applyDiscountPercent = (credits, percent) =>
  Math.max(0, Math.round(credits * (1 - (Number(percent) || 0) / 100)));
