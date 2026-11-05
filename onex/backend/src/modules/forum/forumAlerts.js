import User from '../../models/User.js';
import { ForumFollow, ForumCategoryFollow } from '../../models/ForumInteraction.js';
import { createNotification } from '../notifications/notificationController.js';
import { getForumRecipients, resolveForumSettings } from './forumSettings.js';
import { escapeRegex } from './forumHelpers.js';

async function mentionedUsers(content) {
  // Match complete @usernames rather than substrings (including names with spaces).
  if (!content.includes('@')) return [];
  const names = [...new Set([...content.matchAll(/(?<=^|[\s([{])@([^\n@]{1,80})/g)].flatMap((match) => {
    const text = match[1];
    return [...text].flatMap((_, index) =>
      index === text.length - 1 || /[\s,.!?;:]/.test(text[index + 1])
        ? [text.slice(0, index + 1).trim()] : []).filter(Boolean);
  }))];
  if (!names.length) return [];
  const candidates = await User.find({
    status: 'active',
    $or: names.map((name) => ({ username: new RegExp(`^${escapeRegex(name)}$`, 'i') })),
  }).select('username +forumSettings').lean();
  // The candidate query is only an optimization; this boundary check is authoritative.
  return candidates.filter((user) =>
    new RegExp(`(?:^|[\\s([{])@${escapeRegex(user.username)}(?=$|[\\s,.!?;:])`, 'i').test(content));
}

export async function notifyForumActivity({ thread, actor, content, replyId, parentAuthorId }) {
  const follows = await ForumFollow.find({ threadId: thread._id }).lean();
  const muted = new Set(follows.filter((follow) => !follow.notificationsEnabled).map((follow) => String(follow.userId)));
  const categoryFollows = replyId ? [] : await ForumCategoryFollow.find({ categoryId: thread.categoryId }).lean();
  const mentioned = await mentionedUsers(content);
  const recipientIds = [thread.authorId, parentAuthorId, ...follows.map((f) => f.userId), ...categoryFollows.map((f) => f.userId)]
    .filter(Boolean);
  const settings = await getForumRecipients(recipientIds);
  const alerts = new Map();
  const add = (id, type, title) => {
    if (!id || String(id) === String(actor._id)) return;
    if (!alerts.has(String(id))) alerts.set(String(id), { type, title });
  };
  // Mentions are independent of the thread bell and take precedence over duplicate reply alerts.
  for (const user of mentioned) {
    if (resolveForumSettings(user.forumSettings).mentions) add(user._id, 'forum_mention', 'You were mentioned in the forum');
  }
  if (replyId) {
    for (const [id, title] of [[thread.authorId, 'New reply to your discussion'], [parentAuthorId, 'New reply to your comment']]) {
      if (id && !muted.has(String(id)) && settings.get(String(id))?.discussionReplies) add(id, 'forum_reply', title);
    }
    for (const follow of follows) {
      if (follow.following && follow.notificationsEnabled && settings.get(String(follow.userId))?.followedDiscussionNotifications) {
        // The author's reply preference controls replies to their own discussions.
        if (String(follow.userId) !== String(thread.authorId) && String(follow.userId) !== String(parentAuthorId)) {
          add(follow.userId, 'forum_reply', 'New reply in a thread you follow');
        }
      }
    }
  } else {
    for (const follow of categoryFollows) {
      if (settings.get(String(follow.userId))?.followedCategoryNotifications) {
        add(follow.userId, 'forum_category', 'New discussion in a category you follow');
      }
    }
  }
  const preview = content ? content.slice(0, 80) : 'sent an image';
  await Promise.all([...alerts].map(([userId, alert]) => createNotification({
    audience: 'user', userId, ...alert,
    message: `${actor.username} ${replyId ? 'replied in' : 'posted'} "${thread.title}": "${preview}"`,
    meta: { threadId: String(thread._id), ...(replyId ? { replyId: String(replyId) } : {}) },
  })));
}
