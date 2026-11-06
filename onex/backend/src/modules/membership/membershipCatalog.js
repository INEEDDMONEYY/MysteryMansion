// Single source of truth for membership plans: pricing, perks and the benefit copy shown to members.

export const MEMBERSHIP_GRACE_MS = 2 * 60 * 60 * 1000;
export const BOOST_DURATION_MS = 24 * 60 * 60 * 1000;
export const CATEGORY_CREATE_LIMIT = { count: 3, windowMs: 30 * 24 * 60 * 60 * 1000 };
export const FORUM_BORDER_COLORS = ['pink', 'yellow', 'green', 'blue', 'red', 'orange', 'purple', 'gray'];

// Forum title and description colour pairs (title, description). Ids are shared with forumTextColors.js.
export const FORUM_TEXT_COLORS = Object.freeze({
  'raspberry-lime': { label: 'Raspberry & Lime', title: '#DB2763', description: '#B0DB43' },
  'ember-lemon': { label: 'Ember & Lemon', title: '#E43D00', description: '#FFE900' },
  'mint-sky': { label: 'Mint & Sky', title: '#E4F3E3', description: '#5CA9B9' },
  'midnight-plum': { label: 'Midnight & Plum', title: '#212130', description: '#39304A' },
  'frost-orchid': { label: 'Frost & Orchid', title: '#BCE7FC', description: '#C491B1' },
  'solid-black': { label: 'Black', title: '#000000', description: '#000000' },
  'solid-green': { label: 'Green', title: '#22C55E', description: '#22C55E' },
  'solid-yellow': { label: 'Yellow', title: '#FACC15', description: '#FACC15' },
  'solid-red': { label: 'Red', title: '#EF4444', description: '#EF4444' },
  'solid-orange': { label: 'Orange', title: '#F97316', description: '#F97316' },
  'solid-purple': { label: 'Purple', title: '#A855F7', description: '#A855F7' },
  'solid-pink': { label: 'Pink', title: '#EC4899', description: '#EC4899' },
});
export const FORUM_TEXT_COLOR_IDS = Object.keys(FORUM_TEXT_COLORS);

// Progression ring colors. Ids are shared with the frontend palette (progressionColors.js).
export const PROGRESSION_SOLID_COLOR_IDS = ['orange', 'yellow', 'pink', 'blue', 'green', 'purple', 'brown', 'peach'];
export const PROGRESSION_GRADIENT_COLOR_IDS = [
  'watermelon-crush',
  'sedona-sunrise',
  'seascape',
  'blackcurrant',
  'cotton-candy',
  'carrot',
  'honeydew',
];
export const PROGRESSION_COLOR_IDS = [...PROGRESSION_SOLID_COLOR_IDS, ...PROGRESSION_GRADIENT_COLOR_IDS];
const STANDARD_PROGRESSION_COLOR_IDS = ['orange', 'yellow', 'pink', 'blue'];
// Standard and Premium text colour sets were drawn at random; Elite gets all of them.
// Solid colours are split 2 / 2 across Standard and Premium; the other 3 are Elite-only.
const STANDARD_FORUM_TEXT_COLOR_IDS = ['midnight-plum', 'frost-orchid', 'solid-black', 'solid-green'];
const PREMIUM_FORUM_TEXT_COLOR_IDS = ['midnight-plum', 'frost-orchid', 'raspberry-lime', 'solid-red', 'solid-orange'];

export const NO_PERKS = Object.freeze({
  boostsPerMonth: 0,
  editForumPosts: false,
  maxPinnedThreads: 0,
  forumUploads: false,
  createForumCategories: false,
  forumBorderColor: false,
  forumTextColors: [],
  profileBadge: false,
  betterSearchFilters: false,
  progressionColors: [],
});

// Admins are never restricted by membership.
export const ADMIN_PERKS = Object.freeze({
  boostsPerMonth: 999,
  editForumPosts: true,
  maxPinnedThreads: 999,
  forumUploads: true,
  createForumCategories: true,
  forumBorderColor: true,
  forumTextColors: FORUM_TEXT_COLOR_IDS,
  profileBadge: true,
  betterSearchFilters: true,
  progressionColors: PROGRESSION_COLOR_IDS,
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
    perks: {
      ...NO_PERKS,
      boostsPerMonth: 4,
      editForumPosts: true,
      profileBadge: true,
      progressionColors: STANDARD_PROGRESSION_COLOR_IDS,
      forumTextColors: STANDARD_FORUM_TEXT_COLOR_IDS,
    },
    benefits: [
      '200 monthly coin allocation',
      'Edit forum posts',
      '4 post boosts',
      'Membership status on your profile',
      '4 progression ring colors',
      '4 forum title and description colors (2 pairs, 2 solids)',
    ],
  },
  Premium: {
    id: 'Premium',
    name: 'Premium Plan',
    description: 'More boosts, thread pinning and a membership badge on your profile.',
    monthlyCoinCost: 2400,
    monthlyCoinAllocation: 600,
    featured: true,
    perks: {
      ...NO_PERKS,
      boostsPerMonth: 8,
      editForumPosts: true,
      maxPinnedThreads: 1,
      profileBadge: true,
      betterSearchFilters: true,
      progressionColors: PROGRESSION_SOLID_COLOR_IDS,
      forumTextColors: PREMIUM_FORUM_TEXT_COLOR_IDS,
    },
    benefits: [
      'Access to better search filter options',
      '600 monthly coin allocation',
      'Edit forum posts',
      '8 post boosts',
      'Pin forum thread',
      'Membership status on your profile',
      '8 solid progression ring colors',
      '5 forum title and description colors (3 pairs, 2 solids)',
    ],
  },
  Elite: {
    id: 'Elite',
    name: 'Elite Plan',
    description: 'The full toolkit: uploads, categories, maximum boosts and every new feature.',
    monthlyCoinCost: 3000,
    monthlyCoinAllocation: 1000,
    featured: false,
    perks: {
      boostsPerMonth: 14,
      editForumPosts: true,
      maxPinnedThreads: 3,
      forumUploads: true,
      createForumCategories: true,
      forumBorderColor: true,
      forumTextColors: FORUM_TEXT_COLOR_IDS,
      profileBadge: true,
      betterSearchFilters: true,
      progressionColors: PROGRESSION_COLOR_IDS,
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
      'All progression ring colors, including gradients',
      'All 12 forum title and description colors (5 pairs, 7 solids)',
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
