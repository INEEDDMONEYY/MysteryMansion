// Single source of truth for membership plans: pricing, perks and the benefit copy shown to members.

export const MEMBERSHIP_GRACE_MS = 2 * 60 * 60 * 1000;
export const BOOST_DURATION_MS = 24 * 60 * 60 * 1000;
export const CATEGORY_CREATE_LIMIT = { count: 3, windowMs: 30 * 24 * 60 * 60 * 1000 };
export const FORUM_BORDER_COLORS = ['pink', 'yellow', 'green', 'blue', 'red', 'orange', 'purple', 'gray'];

export const NO_PERKS = Object.freeze({
  boostsPerMonth: 0,
  editForumPosts: false,
  maxPinnedThreads: 0,
  forumUploads: false,
  createForumCategories: false,
  forumBorderColor: false,
  profileBadge: false,
  betterSearchFilters: false,
});

// Admins are never restricted by membership.
export const ADMIN_PERKS = Object.freeze({
  boostsPerMonth: 999,
  editForumPosts: true,
  maxPinnedThreads: 999,
  forumUploads: true,
  createForumCategories: true,
  forumBorderColor: true,
  profileBadge: false,
  betterSearchFilters: true,
});

export const TIER_ORDER = ['Standard', 'Premium', 'Elite'];

export const MEMBERSHIP_TIERS = Object.freeze({
  Standard: {
    id: 'Standard',
    name: 'Standard Plan',
    description: 'Everything you need to take part more fully in the forum.',
    monthlyCoinCost: 1200,
    // Coins granted back each billing period; adjust here.
    monthlyCoinAllocation: 200,
    featured: false,
    perks: { ...NO_PERKS, boostsPerMonth: 4, editForumPosts: true, profileBadge: true },
    benefits: ['200 monthly coin allocation','Edit forum posts', '4 post boosts', 'Membership status on your profile'],
  },
  Premium: {
    id: 'Premium',
    name: 'Premium Plan',
    description: 'More boosts, thread pinning and a membership badge on your profile.',
    monthlyCoinCost: 2600,
    monthlyCoinAllocation: 600,
    featured: true,
    perks: {
      ...NO_PERKS,
      boostsPerMonth: 8,
      editForumPosts: true,
      maxPinnedThreads: 1,
      profileBadge: true,
      betterSearchFilters: true,
    },
    benefits: [
      'Access to better search filter options',
      '600 monthly coin allocation',
      'Edit forum posts',
      '8 post boosts',
      'Pin forum thread',
      'Membership status on your profile',
    ],
  },
  Elite: {
    id: 'Elite',
    name: 'Elite Plan',
    description: 'The full toolkit: uploads, categories, maximum boosts and every new feature.',
    monthlyCoinCost: 4000,
    monthlyCoinAllocation: 1000,
    featured: false,
    perks: {
      boostsPerMonth: 14,
      editForumPosts: true,
      maxPinnedThreads: 3,
      forumUploads: true,
      createForumCategories: true,
      forumBorderColor: true,
      profileBadge: true,
      betterSearchFilters: true,
    },
    benefits: [
      'Access to all new features',
      '1000 monthly coin allocation',
      'Membership status on your profile',
      'Edit forum posts',
      '14 post boosts',
      'Pin forum thread',
      'Forum image/gif upload',
      'Offline storage',
      'Forum card border customization',
      'Access to create forum categories',
    ],
  },
});

export const serializePlan = (tier) => ({
  id: tier.id,
  name: tier.name,
  description: tier.description,
  monthlyCoinCost: tier.monthlyCoinCost,
  monthlyCoinAllocation: tier.monthlyCoinAllocation,
  featured: tier.featured,
  benefits: tier.benefits,
  perks: tier.perks,
});
