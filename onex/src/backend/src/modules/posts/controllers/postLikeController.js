import PostLike from '../../../models/PostLike.js';
import Post from '../../../models/Post.js';

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
