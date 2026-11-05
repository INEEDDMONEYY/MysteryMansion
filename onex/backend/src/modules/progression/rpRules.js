export const MAX_LEVEL = 50;
export const RP_AT_MAX_LEVEL = 50000;

// Level curve: threshold(L) = RP_AT_MAX_LEVEL * ((L - 1) / (MAX_LEVEL - 1))^2
// Early levels come quickly and later levels take progressively more RP.
export function levelThreshold(level) {
  const clamped = Math.min(Math.max(Math.floor(level), 1), MAX_LEVEL);
  const ratio = (clamped - 1) / (MAX_LEVEL - 1);
  return Math.round(RP_AT_MAX_LEVEL * ratio * ratio);
}

export function levelForRp(rp) {
  const value = Math.max(0, Number(rp) || 0);
  let level = 1;
  while (level < MAX_LEVEL && value >= levelThreshold(level + 1)) level += 1;
  return level;
}

export const RP_RULES = Object.freeze({
  profileComplete: { points: 100, label: 'Complete profile', category: 'onboarding', oneTime: true },
  emailVerified: { points: 25, label: 'Verify email', category: 'onboarding', oneTime: true },
  dailyLogin: { points: 5, label: 'Daily login', category: 'activity', perDay: true },
  listingPublished: { points: 15, label: 'Publish listing', category: 'content' },
  profileCardPublished: { points: 20, label: 'Publish profile card', category: 'content' },
  reviewReceived: { points: 15, label: 'Receive review', category: 'community' },
  reviewSubmitted: { points: 10, label: 'Submit review', category: 'community' },
  forumThreadCreated: { points: 10, label: 'Create forum discussion', category: 'forum' },
  forumReplyCreated: { points: 2, label: 'Forum reply', category: 'forum', dailyCap: 10 },
  forumFollow: { points: 1, label: 'Follow discussion', category: 'forum', dailyCap: 5 },
  milestoneComplete: { points: 25, label: 'Platform milestone', category: 'milestones' },
  referralSignup: { points: 50, label: 'Successful referral', category: 'referrals' },
});

// Minimum characters for a forum reply to earn RP, which blocks one-word spam.
export const FORUM_REPLY_MIN_LENGTH = 20;

export const ACHIEVEMENT_TIER_RP = Object.freeze({ 1: 10, 2: 25, 3: 50, 4: 100, 5: 200 });
