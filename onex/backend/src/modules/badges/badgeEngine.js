import Post from '../../models/Post.js';
import PostLike from '../../models/PostLike.js';
import Comment from '../../models/Comment.js';
import Review from '../../models/Review.js';
import Referral from '../../models/Referral.js';
import Flag from '../../models/Flag.js';
import ForumThread from '../../models/ForumThread.js';
import ForumReply from '../../models/ForumReply.js';
import { ForumVote } from '../../models/ForumInteraction.js';
import { computeLegacyDefinitions } from '../milestones/milestoneEngine.js';
import { BADGE_CATALOG } from './badgeCatalog.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// Points per reputation source. Standing is granted to accounts with no open flags.
export const REPUTATION_POINTS = {
  likeReceived: 20,
  comment: 15,
  review: 40,
  milestone: 10,
  solution: 25,
  cleanStanding: 50,
};

// Whole calendar months between two dates (UTC), so "1 Month" lands on the same day next month.
function calendarMonthsBetween(from, to) {
  const months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (to.getUTCMonth() - from.getUTCMonth()) -
    (to.getUTCDate() < from.getUTCDate() ? 1 : 0);
  return Math.max(0, months);
}

function timeStats(createdAt, now) {
  const start = new Date(createdAt);
  const months = calendarMonthsBetween(start, now);
  return {
    days: Math.max(0, Math.floor((now - start) / DAY_MS)),
    months,
    years: Math.floor(months / 12),
  };
}

/**
 * Gathers the raw counts behind every badge. `user` must include the fields
 * used by computeLegacyDefinitions (see BADGE_USER_FIELDS in routes.js).
 */
export async function computeBadgeStats(user, now = new Date()) {
  const userId = user._id;

  const [postIds, threadIds, replyDocs] = await Promise.all([
    Post.distinct('_id', { userId }),
    ForumThread.distinct('_id', { authorId: userId }),
    ForumReply.find({ authorId: userId }).select('_id isDeleted').lean(),
  ]);
  const replyIds = replyDocs.map((reply) => reply._id);
  const liveReplyCount = replyDocs.filter((reply) => !reply.isDeleted).length;

  const [
    listingLikesReceived,
    listingLikesGiven,
    forumLikesReceived,
    forumLikesGiven,
    solutions,
    listingComments,
    reviews,
    referral,
    guardian,
    flagsAgainst,
    milestones,
  ] = await Promise.all([
    PostLike.countDocuments({ postId: { $in: postIds }, userId: { $ne: userId } }),
    PostLike.countDocuments({ userId }),
    ForumVote.countDocuments({
      value: 1,
      userId: { $ne: userId },
      $or: [
        { targetType: 'thread', targetId: { $in: threadIds } },
        { targetType: 'reply', targetId: { $in: replyIds } },
      ],
    }),
    ForumVote.countDocuments({ userId, value: 1 }),
    ForumThread.countDocuments({ solutionReplyId: { $in: replyIds } }),
    Comment.countDocuments({ userId }),
    Review.countDocuments({ targetUserId: userId }),
    Referral.findOne({ providerId: userId }).select('signupCount').lean(),
    Flag.countDocuments({ reporterId: userId, status: { $in: ['action_taken', 'resolved'] } }),
    Flag.countDocuments({ reportedUserId: userId, status: { $ne: 'dismissed' } }),
    computeLegacyDefinitions(user).then((defs) => defs.filter((m) => m.achieved).length),
  ]);

  const likesReceived = listingLikesReceived + forumLikesReceived;
  const commentCount = listingComments + liveReplyCount;
  const cleanStanding = user.status === 'active' && flagsAgainst === 0;
  const reputation =
    likesReceived * REPUTATION_POINTS.likeReceived +
    commentCount * REPUTATION_POINTS.comment +
    reviews * REPUTATION_POINTS.review +
    milestones * REPUTATION_POINTS.milestone +
    solutions * REPUTATION_POINTS.solution +
    (cleanStanding ? REPUTATION_POINTS.cleanStanding : 0);

  return {
    ...timeStats(user.createdAt, now),
    posts: postIds.length,
    replies: liveReplyCount,
    threads: threadIds.length,
    likesGiven: listingLikesGiven + forumLikesGiven,
    likesReceived,
    solutions,
    // Forum invitations are not a feature yet, so invites come from referral sign-ups only.
    invites: referral?.signupCount ?? 0,
    streak: user.activity?.longestStreak ?? 0,
    guardian,
    reputation,
  };
}

/** Returns every badge the user has earned, in catalog order. */
export async function computeEarnedBadges(user, now = new Date()) {
  const stats = await computeBadgeStats(user, now);
  const badges = BADGE_CATALOG
    .filter((badge) => (stats[badge.metric] ?? 0) >= badge.threshold)
    .map(({ id, set, tier, title, description }) => ({ id, set, tier, title, description }));
  return { badges, totalBadges: BADGE_CATALOG.length };
}
