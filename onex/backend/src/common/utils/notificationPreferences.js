// Member-controlled email categories. Each optional mailer tags its sendEmail()
// call with one of these keys; essential mail (verification, password reset,
// welcome, account deletion) is sent without a category and can't be muted.
import User from '../../models/User.js';

export const EMAIL_CATEGORIES = Object.freeze({
  PROMOTIONAL: 'promotionalEmails',
  MESSAGES: 'messageEmails',
  ENGAGEMENT: 'accountEngagementEmails',
  MILESTONES: 'milestoneNotifications',
  MEMBERSHIP: 'membershipEmails',
  ACCOUNT_FLAGS: 'accountFlaggingEmails',
});

export const NOTIFICATION_PREFERENCE_KEYS = Object.values(EMAIL_CATEGORIES);

// Everything defaults to on so existing members keep receiving what they get today.
export const DEFAULT_NOTIFICATION_PREFERENCES = Object.freeze(
  Object.fromEntries(NOTIFICATION_PREFERENCE_KEYS.map((key) => [key, true])),
);

export const resolveNotificationPreferences = (stored) => {
  const source = stored && typeof stored === 'object' ? stored : {};
  return Object.fromEntries(
    NOTIFICATION_PREFERENCE_KEYS.map((key) => [
      key,
      typeof source[key] === 'boolean' ? source[key] : DEFAULT_NOTIFICATION_PREFERENCES[key],
    ]),
  );
};

/**
 * True when the recipient hasn't opted out of `category`. Addresses that don't
 * belong to a member (e.g. the test inbox) are always allowed.
 */
export async function isEmailCategoryAllowed(email, category) {
  if (!category || !NOTIFICATION_PREFERENCE_KEYS.includes(category)) return true;
  const address = String(email || '').trim().toLowerCase();
  if (!address) return true;

  const user = await User.findOne({ email: address })
    .select(`notificationPreferences.${category}`)
    .lean();
  if (!user) return true;
  return resolveNotificationPreferences(user.notificationPreferences)[category];
}
