import User from '../../models/User.js';
import ForumThread from '../../models/ForumThread.js';
import ForumReply from '../../models/ForumReply.js';
import ForumCategory from '../../models/ForumCategory.js';
import { ForumFollow, ForumCategoryFollow } from '../../models/ForumInteraction.js';
import { resolveForumSettings } from './forumSettings.js';
import { sendEmail, FROM_ADDRESS } from '../../common/utils/unosend.js';
import { buildEmail, SITE_URL } from '../../common/utils/emailTemplate.js';

const DAY_MS = 86400000;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export async function collectForumDigest(userId, since, through) {
  const [follows, categoryFollows] = await Promise.all([
    ForumFollow.find({ userId, following: true }).select('threadId').lean(),
    ForumCategoryFollow.find({ userId }).select('categoryId').lean(),
  ]);
  const categories = await ForumCategory.find({
    _id: { $in: categoryFollows.map((follow) => follow.categoryId) }, status: 'approved',
  }).select('_id').lean();
  const threads = await ForumThread.find({
    archived: false,
    $or: [
      { _id: { $in: follows.map((follow) => follow.threadId) } },
      { categoryId: { $in: categories.map((category) => category._id) } },
    ],
  }).select('_id title createdAt authorId').lean();
  const replyCounts = await ForumReply.aggregate([
    { $match: {
      threadId: { $in: threads.map((thread) => thread._id) }, isDeleted: false,
      authorId: { $ne: userId }, createdAt: { $gt: since, $lte: through },
    } },
    { $group: { _id: '$threadId', count: { $sum: 1 }, latest: { $max: '$createdAt' } } },
  ]);
  const counts = new Map(replyCounts.map((row) => [String(row._id), row]));
  return threads.map((thread) => {
    const replies = counts.get(String(thread._id));
    const isNew = thread.createdAt > since && thread.createdAt <= through && String(thread.authorId) !== String(userId);
    return {
      id: String(thread._id), title: thread.title,
      newDiscussion: isNew, replyCount: replies?.count || 0,
      latest: replies?.latest || thread.createdAt,
    };
  }).filter((item) => item.newDiscussion || item.replyCount)
    .sort((a, b) => new Date(b.latest) - new Date(a.latest));
}

export async function sendForumDigestEmail({ to, username, items, frequency, settingsPath }) {
  const rows = items.slice(0, 20).map((item) =>
    `<li style="margin:12px 0"><a href="${SITE_URL}/forum/thread/${encodeURIComponent(item.id)}">${escapeHtml(item.title)}</a>
    ${item.newDiscussion ? ' &mdash; new discussion' : ''} &mdash; ${item.replyCount} new replies</li>`).join('');
  return sendEmail({
    from: FROM_ADDRESS, to,
    subject: `Your ${frequency} Mystery Mansion forum digest`,
    html: buildEmail(`<h2>Your forum digest</h2><p>Hi ${escapeHtml(username)},</p>
      <p>New activity in the discussions and categories you follow:</p><ul>${rows}</ul>
      ${items.length > 20 ? `<p>${items.length - 20} more active discussions are available in the forum.</p>` : ''}
      <p><a href="${SITE_URL}/forum">Visit the forum</a></p>
      <p><a href="${SITE_URL}${settingsPath}#forum-settings">Change or turn off your digest</a></p>`),
  });
}

export async function processForumDigests({ now = new Date(), send = sendForumDigestEmail } = {}) {
  const candidates = User.find({
    role: 'user', status: 'active', email: { $exists: true, $ne: '' },
    'forumSettings.digestFrequency': { $ne: 'off' },
  }).select('username email accountType createdAt +forumSettings +forumDigest').cursor();
  for await (const user of candidates) {
    const frequency = resolveForumSettings(user.forumSettings).digestFrequency;
    const period = frequency === 'daily' ? DAY_MS : 7 * DAY_MS;
    const through = user.forumDigest?.through || user.createdAt;
    if (!through || now - through < period) continue;
    const claim = await User.findOneAndUpdate({
      _id: user._id,
      'forumSettings.digestFrequency': { $ne: 'off' },
      $and: [
        { $or: [{ 'forumDigest.leaseUntil': null }, { 'forumDigest.leaseUntil': { $lte: now } }] },
        { $or: [{ 'forumDigest.nextAttemptAt': null }, { 'forumDigest.nextAttemptAt': { $lte: now } }] },
        { $or: [{ 'forumDigest.through': null }, { 'forumDigest.through': { $lte: new Date(now - period) } }] },
      ],
    }, { $set: { 'forumDigest.leaseUntil': new Date(+now + 30 * 60 * 1000) } }, { new: true })
      .select('username email accountType createdAt +forumSettings +forumDigest').lean();
    if (!claim) continue;
    try {
      // Bound old accounts to one digest period; never flood users with backfill.
      const since = new Date(Math.max(+through, +now - period));
      const items = await collectForumDigest(user._id, since, now);
      if (items.length) {
        const current = await User.findById(user._id).select('status +forumSettings +forumDigest').lean();
        if (!current || current.status !== 'active' ||
            resolveForumSettings(current.forumSettings).digestFrequency !== frequency ||
            +(current.forumDigest?.through || 0) !== +(claim.forumDigest?.through || 0)) {
          await User.updateOne({ _id: user._id, 'forumDigest.leaseUntil': claim.forumDigest.leaseUntil },
            { $set: { 'forumDigest.leaseUntil': null } });
          continue;
        }
        const result = await send({
          to: claim.email, username: claim.username, items, frequency,
          settingsPath: claim.accountType === 'client' ? '/client/settings' : '/user/settings',
        });
        if (result?.skipped) {
          await User.updateOne({ _id: user._id, 'forumDigest.leaseUntil': claim.forumDigest.leaseUntil }, { $set: {
            'forumDigest.leaseUntil': null, 'forumDigest.nextAttemptAt': new Date(+now + 60 * 60 * 1000),
          } });
          continue;
        }
      }
      await User.updateOne({
        _id: user._id, 'forumDigest.leaseUntil': claim.forumDigest.leaseUntil,
        'forumDigest.through': claim.forumDigest?.through || null,
      }, { $set: {
        'forumDigest.through': now, 'forumDigest.leaseUntil': null, 'forumDigest.nextAttemptAt': null,
      } });
    } catch (err) {
      console.error(`Forum digest failed for account ${user._id}:`, err.message);
      await User.updateOne({ _id: user._id, 'forumDigest.leaseUntil': claim.forumDigest.leaseUntil }, { $set: {
        'forumDigest.leaseUntil': null, 'forumDigest.nextAttemptAt': new Date(+now + 60 * 60 * 1000),
      } });
    }
  }
}

export function startForumDigestJob() {
  if (process.env.NODE_ENV === 'test') return () => {};
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try { await processForumDigests(); }
    catch (err) { console.error('Forum digest job failed:', err); }
    finally { running = false; }
  };
  run();
  const timer = setInterval(run, 60 * 60 * 1000);
  return () => clearInterval(timer);
}
