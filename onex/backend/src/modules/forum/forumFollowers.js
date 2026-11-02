import User from '../../models/User.js';
import { ForumFollow } from '../../models/ForumInteraction.js';

export async function getThreadFollowerSummaries(threadIds) {
  if (!threadIds.length) return new Map();
  const rows = await ForumFollow.aggregate([
    { $match: { threadId: { $in: threadIds }, following: true } },
    { $lookup: {
      from: User.collection.name,
      localField: 'userId',
      foreignField: '_id',
      pipeline: [{ $project: { username: 1, profilePic: 1 } }],
      as: 'user',
    } },
    { $unwind: '$user' },
    { $group: {
      _id: '$threadId',
      followerCount: { $sum: 1 },
      followers: { $topN: {
        n: 10,
        sortBy: { updatedAt: -1, _id: -1 },
        output: { id: { $toString: '$user._id' }, username: '$user.username', profilePic: { $ifNull: ['$user.profilePic', ''] } },
      } },
    } },
    { $project: { followerCount: 1, followers: 1 } },
  ]);
  return new Map(rows.map(({ _id, ...summary }) => [String(_id), summary]));
}

export const emptyFollowerSummary = () => ({ followerCount: 0, followers: [] });
