import express from 'express';
import mongoose from 'mongoose';
import User from '../../models/User.js';
import UserFollow from '../../models/UserFollow.js';
import { authMiddleware, optionalAuthMiddleware } from '../../common/middleware/authMiddleware.js';

const router = express.Router();

// Admin/member follows are defaults in both directions. Explicit rows override
// them, including false rows so an unfollow survives restarts and new logins.
export async function getProfileConnections(owner) {
  const [defaults, edges] = await Promise.all([
    User.find({
      _id: { $ne: owner._id }, status: 'active',
      ...(owner.role === 'admin' ? {} : { role: 'admin' }),
    }).select('_id').lean(),
    UserFollow.find({ $or: [{ followerId: owner._id }, { followedId: owner._id }] }).lean(),
  ]);
  const following = new Set(defaults.map((user) => String(user._id)));
  const followers = new Set(following);
  for (const edge of edges) {
    const outgoing = String(edge.followerId) === String(owner._id);
    const set = outgoing ? following : followers;
    const id = String(outgoing ? edge.followedId : edge.followerId);
    if (edge.following) set.add(id);
    else set.delete(id);
  }
  const active = await User.find({
    _id: { $in: [...new Set([...following, ...followers])] }, status: 'active',
  }).select('_id').lean();
  const activeIds = new Set(active.map((user) => String(user._id)));
  for (const set of [following, followers]) {
    for (const id of set) if (!activeIds.has(id) || id === String(owner._id)) set.delete(id);
  }
  return { following, followers, friends: [...following].filter((id) => followers.has(id)) };
}

router.get('/:id', optionalAuthMiddleware, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Profile not found.' });
  try {
    const owner = await User.findOne({ _id: req.params.id, status: 'active' }).select('_id role').lean();
    if (!owner) return res.status(404).json({ error: 'Profile not found.' });
    const connections = await getProfileConnections(owner);
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = 20;
    const friends = await User.find({ _id: { $in: connections.friends }, status: 'active' })
      .select('_id username profilePic role accountType').sort({ role: 1, username: 1, _id: 1 })
      .skip((page - 1) * limit).limit(limit).lean();
    const viewerId = req.user ? String(req.user._id) : null;
    res.json({
      followerCount: connections.followers.size,
      followingCount: connections.following.size,
      friendCount: connections.friends.length,
      friends,
      viewer: {
        userId: viewerId,
        following: viewerId ? connections.followers.has(viewerId) : false,
        followedBy: viewerId ? connections.following.has(viewerId) : false,
        isFriend: viewerId ? connections.friends.includes(viewerId) : false,
      },
      pagination: { page, limit, hasNextPage: page * limit < connections.friends.length },
    });
  } catch (err) {
    console.error('GET /social/:id:', err);
    res.status(500).json({ error: 'Failed to load profile connections.' });
  }
});

router.put('/:id/follow', authMiddleware, async (req, res) => {
  if (req.user.status === 'suspended') return res.status(403).json({ error: 'Your account is suspended.' });
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Profile not found.' });
  if (String(req.user._id) === req.params.id.toLowerCase()) return res.status(400).json({ error: 'You cannot follow yourself.' });
  if (typeof req.body?.following !== 'boolean') return res.status(400).json({ error: 'Provide a boolean following value.' });
  try {
    const target = await User.findOne({ _id: req.params.id, status: 'active' }).select('_id');
    if (!target) return res.status(404).json({ error: 'Profile not found.' });
    await UserFollow.updateOne(
      { followerId: req.user._id, followedId: target._id },
      { $set: { following: req.body.following } },
      { upsert: true, runValidators: true }
    );
    res.json({ following: req.body.following });
  } catch (err) {
    console.error('PUT /social/:id/follow:', err);
    res.status(500).json({ error: 'Failed to update profile follow.' });
  }
});

export default router;
