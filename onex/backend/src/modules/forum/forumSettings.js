import User from '../../models/User.js';
import { ForumFollow } from '../../models/ForumInteraction.js';

export const DEFAULT_FORUM_SETTINGS = Object.freeze({
  discussionReplies: true,
  mentions: true,
  followedDiscussionNotifications: true,
  followedCategoryNotifications: true,
  autoFollowDiscussions: true,
  digestFrequency: 'weekly',
});
export const FORUM_NOTIFICATION_TYPES = ['forum_reply', 'forum_mention', 'forum_category'];

export const resolveForumSettings = (settings = {}) =>
  Object.fromEntries(Object.entries(DEFAULT_FORUM_SETTINGS).map(([key, fallback]) =>
    [key, settings?.[key] ?? fallback]));

export async function autoFollowDiscussion(user, threadId) {
  const saved = await User.findById(user._id).select('+forumSettings').lean();
  if (!saved || !resolveForumSettings(saved.forumSettings).autoFollowDiscussions) return;
  // An explicit unfollow or muted bell must not be overwritten by participation.
  await ForumFollow.updateOne(
    { userId: user._id, threadId },
    { $setOnInsert: { following: true, notificationsEnabled: true } },
    { upsert: true }
  );
}

export async function getForumRecipients(ids) {
  const users = await User.find({ _id: { $in: ids }, status: 'active' })
    .select('+forumSettings').lean();
  return new Map(users.map((user) => [String(user._id), resolveForumSettings(user.forumSettings)]));
}
