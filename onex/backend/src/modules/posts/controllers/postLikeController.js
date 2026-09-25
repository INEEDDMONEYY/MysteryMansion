import PostLike from '../../../models/PostLike.js';
import Post from '../../../models/Post.js';
import User from '../../../models/User.js';
import env from '../../../config/env.js';
import { createNotification } from '../../notifications/notificationController.js';
import { sendAccountActivityEmail } from '../../../common/utils/sendAccountActivityEmail.js';

/**
 * POST /api/posts/:id/like
 * Toggles a like on a post for the authenticated user.
 * Returns { liked: true/false, likeCount: number }
 */
export async function toggleLike(req, res) {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId).lean();
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    const existing = await PostLike.findOne({ userId, postId });

    if (existing) {
      await PostLike.deleteOne({ _id: existing._id });
    } else {
      await PostLike.create({ userId, postId });
      // Notify post owner (skip self-likes)
      if (post.userId && String(post.userId) !== String(userId)) {
        const [liker, owner] = await Promise.all([
          User.findById(userId).select('username').lean(),
          User.findById(post.userId).select('email username status').lean(),
        ]);
        const likerName = liker?.username || 'Someone';
        createNotification({
          audience: 'user',
          type: 'post_liked',
          title: 'Someone liked your post',
          message: `${likerName} liked your post.`,
          userId: post.userId,
          meta: { postId: String(postId), likerId: String(userId) },
        }).catch(() => {});

        if (owner?.email && owner.status !== 'suspended') {
          sendAccountActivityEmail({
            to: owner.email,
            username: owner.username,
            type: 'post_liked',
            message: `${likerName} liked your post.`,
            ctaUrl: `${env.CLIENT_URL}/posts/${postId}`,
          }).catch((err) => console.error('❌ Post-liked email failed:', err.message));
        }
      }
    }

    const likeCount = await PostLike.countDocuments({ postId });
    return res.json({ liked: !existing, likeCount });
  } catch (err) {
    console.error('toggleLike error:', err);
    return res.status(500).json({ error: 'Failed to toggle like.' });
  }
}

/**
 * GET /api/posts/:id/like/status
 * Returns { liked: bool, likeCount: number } for the current user.
 * Works for both authenticated and unauthenticated users (liked = false if no token).
 */
export async function getLikeStatus(req, res) {
  try {
    const postId = req.params.id;
    const userId = req.user?.id || null;

    const [likeCount, userLike] = await Promise.all([
      PostLike.countDocuments({ postId }),
      userId ? PostLike.findOne({ userId, postId }).lean() : null,
    ]);

    return res.json({ liked: Boolean(userLike), likeCount });
  } catch (err) {
    console.error('getLikeStatus error:', err);
    return res.status(500).json({ error: 'Failed to fetch like status.' });
  }
}

/**
 * GET /api/users/me/liked-posts
 * Returns all posts liked by the current user, newest first.
 */
export async function getLikedPosts(req, res) {
  try {
    const userId = req.user.id;

    const likes = await PostLike.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'postId',
        populate: { path: 'userId', select: 'username profilePic badgeType' },
      })
      .lean();

    // Filter out likes where the post was deleted
    const posts = likes
      .filter((l) => l.postId)
      .map((l) => ({ ...l.postId, likedAt: l.createdAt }));

    return res.json(posts);
  } catch (err) {
    console.error('getLikedPosts error:', err);
    return res.status(500).json({ error: 'Failed to fetch liked posts.' });
  }
}
