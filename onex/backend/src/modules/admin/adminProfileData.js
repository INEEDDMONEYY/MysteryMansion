import express from 'express';
import mongoose from 'mongoose';

import Comment from '../../models/Comment.js';
import Flag from '../../models/Flag.js';
import ForumReply from '../../models/ForumReply.js';
import ForumThread from '../../models/ForumThread.js';
import Post from '../../models/Post.js';
import { serializeAttachments } from '../../models/AttachmentSchema.js';
// Registered for populate().
import '../../models/User.js';
import '../../models/ForumCategory.js';

// Data behind the admin profile page: platform activity, media library, resolved flags.
const router = express.Router();

const AUTHOR_FIELDS = 'username profilePic role';

const parsePaging = (query, defaultLimit, maxLimit) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit));
  return { page, limit };
};

const author = (user) =>
  user?._id
    ? { id: String(user._id), username: user.username, profilePic: user.profilePic || '' }
    : { id: null, username: 'Deleted user', profilePic: '' };

const excerpt = (text = '', max = 300) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

const countAttachments = async (Model, match = {}) => {
  const [row] = await Model.aggregate([
    { $match: { ...match, 'attachments.0': { $exists: true } } },
    { $group: { _id: null, n: { $sum: { $size: '$attachments' } } } },
  ]);
  return row?.n || 0;
};

// ── GET /api/admin/profile-data/activity ─────────────────────────────────────
// Forum threads, forum replies and post comments across the whole platform.
router.get('/activity', async (req, res) => {
  try {
    const { page, limit } = parsePaging(req.query, 20, 50);
    const type = ['threads', 'replies', 'comments'].includes(req.query.type) ? req.query.type : 'all';
    const want = (name) => type === 'all' || type === name;
    const take = page * limit;

    const [threads, replies, comments, threadTotal, replyTotal, commentTotal] = await Promise.all([
      want('threads')
        ? ForumThread.find().sort({ createdAt: -1 }).limit(take)
            .populate('authorId', AUTHOR_FIELDS).populate('categoryId', 'name slug').lean()
        : [],
      want('replies')
        ? ForumReply.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(take)
            .populate('authorId', AUTHOR_FIELDS).populate('threadId', 'title').lean()
        : [],
      want('comments')
        ? Comment.find().sort({ createdAt: -1 }).limit(take)
            .populate('userId', AUTHOR_FIELDS).populate('postId', 'title').lean()
        : [],
      want('threads') ? ForumThread.countDocuments() : 0,
      want('replies') ? ForumReply.countDocuments({ isDeleted: false }) : 0,
      want('comments') ? Comment.countDocuments() : 0,
    ]);

    const items = [
      ...threads.map((t) => ({
        id: String(t._id),
        type: 'thread',
        title: t.title,
        text: excerpt(t.content),
        author: author(t.authorId),
        context: t.categoryId ? { label: t.categoryId.name, link: `/forum/category/${t.categoryId.slug}` } : null,
        link: `/forum/thread/${t._id}`,
        attachments: serializeAttachments(t.attachments),
        createdAt: t.createdAt,
      })),
      ...replies.map((r) => ({
        id: String(r._id),
        type: 'reply',
        title: '',
        text: excerpt(r.content),
        author: author(r.authorId),
        context: r.threadId?._id ? { label: r.threadId.title, link: `/forum/thread/${r.threadId._id}` } : null,
        link: r.threadId?._id ? `/forum/thread/${r.threadId._id}` : null,
        attachments: serializeAttachments(r.attachments),
        createdAt: r.createdAt,
      })),
      ...comments.map((c) => ({
        id: String(c._id),
        type: 'comment',
        title: '',
        text: excerpt(c.text),
        author: author(c.userId),
        context: c.postId?._id ? { label: c.postId.title, link: `/posts/${c.postId._id}` } : null,
        link: c.postId?._id ? `/posts/${c.postId._id}` : null,
        attachments: [],
        createdAt: c.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice((page - 1) * limit, page * limit);

    const total = threadTotal + replyTotal + commentTotal;
    res.json({
      items,
      counts: { threads: threadTotal, replies: replyTotal, comments: commentTotal },
      pagination: { page, limit, total, hasNextPage: page * limit < total },
    });
  } catch (err) {
    console.error('❌ GET /admin/profile-data/activity:', err);
    res.status(500).json({ error: 'Failed to load platform activity' });
  }
});

// ── GET /api/admin/profile-data/media ────────────────────────────────────────
// Every image/GIF uploaded through forum threads and forum replies.
router.get('/media', async (req, res) => {
  try {
    const { page, limit } = parsePaging(req.query, 24, 60);
    const source = ['threads', 'replies'].includes(req.query.source) ? req.query.source : 'all';
    const kind = ['image', 'gif'].includes(req.query.kind) ? req.query.kind : null;
    const want = (name) => source === 'all' || source === name;

    const match = { 'attachments.0': { $exists: true } };
    if (kind) match['attachments.kind'] = kind;
    const take = page * limit;

    const [threads, replies, threadN, replyN] = await Promise.all([
      want('threads')
        ? ForumThread.find(match).sort({ createdAt: -1 }).limit(take).populate('authorId', AUTHOR_FIELDS).lean()
        : [],
      want('replies')
        ? ForumReply.find({ ...match, isDeleted: false }).sort({ createdAt: -1 }).limit(take)
            .populate('authorId', AUTHOR_FIELDS).populate('threadId', 'title').lean()
        : [],
      want('threads') ? countAttachments(ForumThread) : 0,
      want('replies') ? countAttachments(ForumReply, { isDeleted: false }) : 0,
    ]);

    const entries = (docs, sourceName, ownerKey, contextOf) =>
      docs.flatMap((doc) =>
        (doc.attachments || [])
          .filter((a) => !kind || a.kind === kind)
          .map((a, index) => ({
            id: `${sourceName}-${doc._id}-${index}`,
            url: a.url,
            kind: a.kind,
            mimeType: a.mimeType,
            size: a.size,
            source: sourceName,
            uploader: author(doc[ownerKey]),
            context: contextOf(doc),
            uploadedAt: doc.createdAt,
          }))
      );

    const merged = [
      ...entries(threads, 'thread', 'authorId', (t) => ({ label: t.title, link: `/forum/thread/${t._id}` })),
      ...entries(replies, 'reply', 'authorId', (r) =>
        r.threadId?._id ? { label: r.threadId.title, link: `/forum/thread/${r.threadId._id}` } : null),
    ].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    // Counts ignore the kind filter on purpose so the source chips stay stable.
    res.json({
      items: merged.slice((page - 1) * limit, page * limit),
      counts: { threads: threadN, replies: replyN },
      pagination: { page, limit, total: threadN + replyN, hasNextPage: merged.length > page * limit },
    });
  } catch (err) {
    console.error('❌ GET /admin/profile-data/media:', err);
    res.status(500).json({ error: 'Failed to load media library' });
  }
});

// ── GET /api/admin/profile-data/resolved-flags ───────────────────────────────
// Flags this admin (or ?adminId=) moved to "resolved", newest first.
router.get('/resolved-flags', async (req, res) => {
  try {
    const adminId = req.query.adminId && mongoose.isValidObjectId(req.query.adminId) ? req.query.adminId : req.user._id;
    const { page, limit } = parsePaging(req.query, 20, 50);

    const flags = await Flag.find({
      timeline: { $elemMatch: { status: 'resolved', updatedBy: adminId } },
    })
      .populate('reporterId', 'username')
      .populate('reportedUserId', 'username')
      .populate('timeline.updatedBy', 'username')
      .lean();

    const posts = await Post.find({
      _id: { $in: flags.filter((f) => f.targetType === 'post').map((f) => f.targetId) },
    }).select('title').lean();
    const postTitles = new Map(posts.map((p) => [String(p._id), p.title]));

    const rows = flags
      .map((flag) => {
        const entry = [...flag.timeline]
          .reverse()
          .find((t) => t.status === 'resolved' && String(t.updatedBy?._id || t.updatedBy) === String(adminId));
        return {
          id: String(flag._id),
          targetType: flag.targetType,
          targetId: String(flag.targetId),
          postTitle: flag.targetType === 'post' ? postTitles.get(String(flag.targetId)) || null : null,
          reason: flag.reason,
          details: flag.details,
          reporter: flag.reporterId?.username || 'Deleted user',
          reportedUser: flag.reportedUserId?.username || null,
          reportedAt: flag.createdAt,
          resolvedAt: entry.createdAt,
          resolutionNote: entry.message || '',
          currentStatus: flag.status,
          timeline: flag.timeline.map((t) => ({
            status: t.status,
            message: t.message,
            by: t.updatedBy?.username || null,
            at: t.createdAt,
          })),
        };
      })
      .sort((a, b) => new Date(b.resolvedAt) - new Date(a.resolvedAt));

    const total = rows.length;
    const averageHours = total
      ? Math.round(rows.reduce((sum, r) => sum + (new Date(r.resolvedAt) - new Date(r.reportedAt)), 0) / total / 36e5)
      : 0;

    res.json({
      items: rows.slice((page - 1) * limit, page * limit),
      summary: { total, averageHours },
      pagination: { page, limit, total, hasNextPage: page * limit < total },
    });
  } catch (err) {
    console.error('❌ GET /admin/profile-data/resolved-flags:', err);
    res.status(500).json({ error: 'Failed to load resolved flags' });
  }
});

export default router;
