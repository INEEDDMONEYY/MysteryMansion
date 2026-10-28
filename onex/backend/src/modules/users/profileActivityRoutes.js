import express from 'express';
import mongoose from 'mongoose';

import Comment from '../../models/Comment.js';
import ForumReply from '../../models/ForumReply.js';
import ForumThread from '../../models/ForumThread.js';
import Review from '../../models/Review.js';
import User from '../../models/User.js';
import { serializeAttachments } from '../../models/AttachmentSchema.js';
// Registered for populate().
import '../../models/ForumCategory.js';
import '../../models/Post.js';

// Public, read-only activity behind a member's profile (mounted at /api/public/users/id/:userId).
const router = express.Router({ mergeParams: true });

const parsePaging = (query, defaultLimit, maxLimit) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit));
  return { page, limit };
};

const excerpt = (text = '', max = 300) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

// Rejects unknown or suspended accounts and exposes the id as req.profileUserId.
router.use(async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) return res.status(400).json({ error: 'Invalid user id' });

    const user = await User.findById(userId).select('status').lean();
    if (!user || user.status === 'suspended') return res.status(404).json({ error: 'User not found' });

    req.profileUserId = user._id;
    next();
  } catch (err) {
    console.error('❌ profile activity lookup:', err);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// Forum threads and replies the member wrote, newest first.
router.get('/forum-activity', async (req, res) => {
  try {
    const { page, limit } = parsePaging(req.query, 15, 40);
    const authorId = req.profileUserId;
    const take = page * limit;

    const [threads, replies, threadTotal, replyTotal] = await Promise.all([
      ForumThread.find({ authorId, archived: false }).sort({ createdAt: -1 }).limit(take)
        .populate('categoryId', 'name slug').lean(),
      ForumReply.find({ authorId, isDeleted: false }).sort({ createdAt: -1 }).limit(take)
        .populate('threadId', 'title archived').lean(),
      ForumThread.countDocuments({ authorId, archived: false }),
      ForumReply.countDocuments({ authorId, isDeleted: false }),
    ]);

    const items = [
      ...threads.map((t) => ({
        id: String(t._id),
        type: 'thread',
        title: t.title,
        text: excerpt(t.content),
        context: t.categoryId ? { label: t.categoryId.name, link: `/forum/category/${t.categoryId.slug}` } : null,
        link: `/forum/thread/${t._id}`,
        attachments: serializeAttachments(t.attachments),
        stats: { replies: t.replyCount, score: t.upvoteCount },
        createdAt: t.createdAt,
      })),
      ...replies
        .filter((r) => r.threadId && !r.threadId.archived)
        .map((r) => ({
          id: String(r._id),
          type: 'reply',
          title: '',
          text: excerpt(r.content),
          context: { label: r.threadId.title, link: `/forum/thread/${r.threadId._id}` },
          link: `/forum/thread/${r.threadId._id}`,
          attachments: serializeAttachments(r.attachments),
          stats: { score: r.upvoteCount },
          createdAt: r.createdAt,
        })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice((page - 1) * limit, page * limit);

    const total = threadTotal + replyTotal;
    res.json({
      items,
      counts: { threads: threadTotal, replies: replyTotal },
      pagination: { page, limit, total, hasNextPage: page * limit < total },
    });
  } catch (err) {
    console.error('❌ GET profile forum-activity:', err);
    res.status(500).json({ error: 'Failed to load forum activity' });
  }
});

// Images and GIFs the member uploaded in forum threads and replies.
router.get('/library', async (req, res) => {
  try {
    const { page, limit } = parsePaging(req.query, 24, 60);
    const kind = ['image', 'gif'].includes(req.query.kind) ? req.query.kind : null;
    const owner = req.profileUserId;
    const take = page * limit;

    const has = { 'attachments.0': { $exists: true }, ...(kind ? { 'attachments.kind': kind } : {}) };

    const [threads, replies] = await Promise.all([
      ForumThread.find({ authorId: owner, archived: false, ...has }).sort({ createdAt: -1 }).limit(take).lean(),
      ForumReply.find({ authorId: owner, isDeleted: false, ...has }).sort({ createdAt: -1 }).limit(take)
        .populate('threadId', 'title').lean(),
    ]);

    const entries = (docs, source, contextOf) =>
      docs.flatMap((doc) =>
        (doc.attachments || [])
          .filter((a) => !kind || a.kind === kind)
          .map((a, index) => ({
            id: `${source}-${doc._id}-${index}`,
            url: a.url,
            kind: a.kind,
            source,
            context: contextOf(doc),
            uploadedAt: doc.createdAt,
          }))
      );

    const merged = [
      ...entries(threads, 'thread', (t) => ({ label: t.title, link: `/forum/thread/${t._id}` })),
      ...entries(replies, 'reply', (r) =>
        r.threadId?._id ? { label: r.threadId.title, link: `/forum/thread/${r.threadId._id}` } : null),
    ].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.json({
      items: merged.slice((page - 1) * limit, page * limit),
      pagination: { page, limit, total: merged.length, hasNextPage: merged.length > page * limit },
    });
  } catch (err) {
    console.error('❌ GET profile library:', err);
    res.status(500).json({ error: 'Failed to load library' });
  }
});

// Reviews the member has written about other accounts.
router.get('/reviews', async (req, res) => {
  try {
    const { page, limit } = parsePaging(req.query, 15, 40);
    const filter = { authorUserId: req.profileUserId };

    const [reviews, total, [stats]] = await Promise.all([
      Review.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
        .populate('targetUserId', 'username profilePic').lean(),
      Review.countDocuments(filter),
      Review.aggregate([{ $match: filter }, { $group: { _id: null, avg: { $avg: '$rating' } } }]),
    ]);

    res.json({
      items: reviews.map((r) => ({
        id: String(r._id),
        rating: r.rating,
        text: r.text,
        target: r.targetUserId?._id
          ? { id: String(r.targetUserId._id), username: r.targetUserId.username, profilePic: r.targetUserId.profilePic || '' }
          : null,
        createdAt: r.createdAt,
      })),
      summary: { total, averageRating: stats ? Math.round(stats.avg * 10) / 10 : 0 },
      pagination: { page, limit, total, hasNextPage: page * limit < total },
    });
  } catch (err) {
    console.error('❌ GET profile reviews:', err);
    res.status(500).json({ error: 'Failed to load reviews' });
  }
});

// Comments the member has left on posts.
router.get('/comments', async (req, res) => {
  try {
    const { page, limit } = parsePaging(req.query, 15, 40);
    const filter = { userId: req.profileUserId };

    const [comments, total] = await Promise.all([
      Comment.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
        .populate('postId', 'title').lean(),
      Comment.countDocuments(filter),
    ]);

    res.json({
      items: comments.map((c) => ({
        id: String(c._id),
        text: c.text,
        post: c.postId?._id ? { id: String(c.postId._id), title: c.postId.title } : null,
        createdAt: c.createdAt,
      })),
      pagination: { page, limit, total, hasNextPage: page * limit < total },
    });
  } catch (err) {
    console.error('❌ GET profile comments:', err);
    res.status(500).json({ error: 'Failed to load comments' });
  }
});

export default router;
