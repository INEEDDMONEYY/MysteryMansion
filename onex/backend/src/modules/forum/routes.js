import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import env from '../../config/env.js';
import User from '../../models/User.js';
import ForumCategory from '../../models/ForumCategory.js';
import ForumThread from '../../models/ForumThread.js';
import ForumReply from '../../models/ForumReply.js';
import { ForumVote, ForumBookmark } from '../../models/ForumInteraction.js';
import { authMiddleware } from '../../common/middleware/authMiddleware.js';
import { enforceRestriction } from '../../common/middleware/restrictionMiddleware.js';
import { attachmentUpload, saveAttachments } from '../../common/utils/attachmentUpload.js';
import { deleteBackupCopy } from '../../common/utils/backupStorage.js';
import { awardCredits } from '../credits/creditEarnService.js';
import { createNotification } from '../notifications/notificationController.js';
import {
  AUTHOR_SELECT,
  escapeRegex,
  serializeCategory,
  serializeReply,
  serializeThread,
  slugify,
} from './forumHelpers.js';

const router = express.Router();

const isId = (value) => mongoose.isValidObjectId(value);
const isAdmin = (user) => user?.role === 'admin';
const isOwner = (doc, user) => String(doc.authorId?._id || doc.authorId) === String(user?._id);

// Attaches req.user when a valid token is sent but never rejects the request.
const optionalAuth = async (req, _res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || env.JWT_SECRET);
      const user = await User.findById(decoded.id || decoded._id).select('-password');
      if (user) req.user = user;
    }
  } catch {
    // Treated as a signed-out visitor.
  }
  next();
};

const blockSuspended = (req, res, next) =>
  req.user?.status === 'suspended'
    ? res.status(403).json({ error: 'Your account is suspended.' })
    : next();

const parsePaging = (query, defaultLimit, maxLimit) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit));
  return { page, limit };
};

// Tags arrive as an array (JSON) or a JSON/comma-separated string (multipart).
const cleanTags = (value) => {
  let list = value;
  if (typeof value === 'string') {
    try {
      list = JSON.parse(value);
    } catch {
      list = value.split(',');
    }
  }

  return [...new Set((Array.isArray(list) ? list : []).map((t) => slugify(t)).filter(Boolean))]
    .map((t) => t.slice(0, 24))
    .slice(0, 5);
};

const removeStoredFiles = (attachments = []) =>
  Promise.allSettled(attachments.map((a) => deleteBackupCopy(a.key)));

const populateThread = (query) =>
  query.populate('authorId', AUTHOR_SELECT).populate('categoryId', 'name slug');

const SORTS = {
  latest: { pinned: -1, lastActivityAt: -1 },
  active: { pinned: -1, lastActivityAt: -1 },
  newest: { pinned: -1, createdAt: -1 },
  popular: { pinned: -1, upvoteCount: -1, replyCount: -1, viewCount: -1 },
  most_replied: { pinned: -1, replyCount: -1, lastActivityAt: -1 },
};

// ── Categories ───────────────────────────────────────────────────────────────

router.get('/categories', async (_req, res) => {
  try {
    const [categories, counts] = await Promise.all([
      ForumCategory.find({ status: 'approved' }).sort({ sortOrder: 1, name: 1 }).lean(),
      ForumThread.aggregate([
        { $match: { archived: false } },
        { $group: { _id: '$categoryId', n: { $sum: 1 } } },
      ]),
    ]);
    const countById = new Map(counts.map((c) => [String(c._id), c.n]));
    res.json(categories.map((c) => serializeCategory(c, countById.get(String(c._id)) || 0)));
  } catch (err) {
    console.error('❌ GET /forum/categories:', err);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

// Members suggest categories; admins' categories go live immediately.
router.post('/categories', authMiddleware, blockSuspended, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim().slice(0, 60);
    const slug = slugify(name);
    if (name.length < 3 || !slug) return res.status(400).json({ error: 'Category name must be at least 3 characters.' });
    if (await ForumCategory.exists({ slug })) return res.status(409).json({ error: 'A category with this name already exists.' });

    const admin = isAdmin(req.user);
    const category = await ForumCategory.create({
      name,
      slug,
      description: String(req.body.description || '').trim().slice(0, 300),
      status: admin ? 'approved' : 'pending',
      source: admin ? 'admin' : 'user',
      createdBy: req.user._id,
    });
    res.status(201).json(serializeCategory(category));
  } catch (err) {
    console.error('❌ POST /forum/categories:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.patch('/categories/:id', authMiddleware, async (req, res) => {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ error: 'Admins only.' });
    if (!isId(req.params.id)) return res.status(400).json({ error: 'Invalid category ID.' });

    const update = {};
    if (['approved', 'pending', 'rejected', 'archived'].includes(req.body.status)) update.status = req.body.status;
    if (req.body.description != null) update.description = String(req.body.description).trim().slice(0, 300);
    if (req.body.name != null) {
      const name = String(req.body.name).trim().slice(0, 60);
      if (name.length < 3) return res.status(400).json({ error: 'Category name must be at least 3 characters.' });
      update.name = name;
    }

    const category = await ForumCategory.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(serializeCategory(category));
  } catch (err) {
    console.error('❌ PATCH /forum/categories/:id:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// ── Threads ──────────────────────────────────────────────────────────────────

router.get('/threads', async (req, res) => {
  try {
    const { page, limit } = parsePaging(req.query, 20, 50);
    const filter = { archived: false };

    if (req.query.categoryId) {
      if (!isId(req.query.categoryId)) return res.json({ threads: [], pagination: { page, limit, total: 0, hasNextPage: false } });
      filter.categoryId = req.query.categoryId;
    } else if (req.query.categorySlug) {
      const category = await ForumCategory.findOne({ slug: String(req.query.categorySlug).toLowerCase() }).select('_id').lean();
      if (!category) return res.json({ threads: [], pagination: { page, limit, total: 0, hasNextPage: false } });
      filter.categoryId = category._id;
    }

    const q = String(req.query.q || '').trim().slice(0, 80);
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ title: rx }, { content: rx }, { tags: rx }];
    }

    const [total, threads] = await Promise.all([
      ForumThread.countDocuments(filter),
      populateThread(
        ForumThread.find(filter)
          .sort(SORTS[req.query.sort] || SORTS.latest)
          .skip((page - 1) * limit)
          .limit(limit)
      ).lean(),
    ]);

    res.json({
      threads: threads.map(serializeThread),
      pagination: { page, limit, total, hasNextPage: page * limit < total },
    });
  } catch (err) {
    console.error('❌ GET /forum/threads:', err);
    res.status(500).json({ error: 'Failed to load threads' });
  }
});

router.get('/threads/:id', optionalAuth, async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(404).json({ error: 'Thread not found' });

    const thread = await populateThread(
      ForumThread.findOneAndUpdate({ _id: req.params.id, archived: false }, { $inc: { viewCount: 1 } }, { new: true })
    ).lean();
    if (!thread) return res.status(404).json({ error: 'Thread not found' });

    let viewer = { vote: 0, bookmarked: false };
    if (req.user) {
      const [vote, bookmark] = await Promise.all([
        ForumVote.findOne({ userId: req.user._id, targetType: 'thread', targetId: thread._id }).lean(),
        ForumBookmark.exists({ userId: req.user._id, targetType: 'thread', targetId: thread._id }),
      ]);
      viewer = { vote: vote?.value || 0, bookmarked: Boolean(bookmark) };
    }

    res.json({ ...serializeThread(thread), viewer });
  } catch (err) {
    console.error('❌ GET /forum/threads/:id:', err);
    res.status(500).json({ error: 'Failed to load thread' });
  }
});

router.post('/threads', authMiddleware, blockSuspended, enforceRestriction('post:create'), attachmentUpload, async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const content = String(req.body.content || '').trim();
    if (title.length < 3 || title.length > 160) return res.status(400).json({ error: 'Title must be 3-160 characters.' });
    if (content.length < 10 || content.length > 10000) return res.status(400).json({ error: 'Content must be 10-10,000 characters.' });

    const ref = String(req.body.categoryId || '');
    const category = isId(ref)
      ? await ForumCategory.findById(ref)
      : await ForumCategory.findOne({ slug: ref.toLowerCase() });
    if (!category || category.status !== 'approved') return res.status(400).json({ error: 'Choose a valid category.' });

    let attachments = [];
    try {
      attachments = await saveAttachments(req.files, { userId: req.user._id, folder: 'forum' });
    } catch (uploadErr) {
      return res.status(400).json({ error: uploadErr.message });
    }

    const thread = await ForumThread.create({
      title,
      content,
      categoryId: category._id,
      authorId: req.user._id,
      tags: cleanTags(req.body.tags),
      attachments,
    });

    awardCredits({ userId: req.user._id, eventKey: 'thread_post', refId: String(thread._id) });

    const populated = await populateThread(ForumThread.findById(thread._id)).lean();
    res.status(201).json(serializeThread(populated));
  } catch (err) {
    console.error('❌ POST /forum/threads:', err);
    res.status(500).json({ error: 'Failed to create thread' });
  }
});

router.patch('/threads/:id', authMiddleware, blockSuspended, async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(404).json({ error: 'Thread not found' });
    const thread = await ForumThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });

    const admin = isAdmin(req.user);
    if (!admin && !isOwner(thread, req.user)) return res.status(403).json({ error: 'You cannot edit this thread.' });

    if (req.body.title != null) {
      const title = String(req.body.title).trim();
      if (title.length < 3 || title.length > 160) return res.status(400).json({ error: 'Title must be 3-160 characters.' });
      thread.title = title;
    }
    if (req.body.content != null) {
      const content = String(req.body.content).trim();
      if (content.length < 10 || content.length > 10000) return res.status(400).json({ error: 'Content must be 10-10,000 characters.' });
      thread.content = content;
    }
    if (req.body.tags != null) thread.tags = cleanTags(req.body.tags);

    if (admin) {
      for (const flag of ['pinned', 'locked', 'archived']) {
        if (req.body[flag] != null) thread[flag] = Boolean(req.body[flag]);
      }
    }

    await thread.save();
    const populated = await populateThread(ForumThread.findById(thread._id)).lean();
    res.json(serializeThread(populated));
  } catch (err) {
    console.error('❌ PATCH /forum/threads/:id:', err);
    res.status(500).json({ error: 'Failed to update thread' });
  }
});

router.delete('/threads/:id', authMiddleware, async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(404).json({ error: 'Thread not found' });
    const thread = await ForumThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    if (!isAdmin(req.user) && !isOwner(thread, req.user)) return res.status(403).json({ error: 'You cannot delete this thread.' });

    const replyIds = (await ForumReply.find({ threadId: thread._id }).select('_id attachments').lean());
    const files = [...(thread.attachments || []), ...replyIds.flatMap((r) => r.attachments || [])];
    await Promise.all([
      ForumReply.deleteMany({ threadId: thread._id }),
      ForumVote.deleteMany({ $or: [{ targetType: 'thread', targetId: thread._id }, { targetType: 'reply', targetId: { $in: replyIds.map((r) => r._id) } }] }),
      ForumBookmark.deleteMany({ targetType: 'thread', targetId: thread._id }),
      thread.deleteOne(),
    ]);
    removeStoredFiles(files);
    res.json({ success: true, threadId: String(thread._id) });
  } catch (err) {
    console.error('❌ DELETE /forum/threads/:id:', err);
    res.status(500).json({ error: 'Failed to delete thread' });
  }
});

// The thread author (or an admin) marks one reply as the accepted answer.
router.post('/threads/:id/solution', authMiddleware, async (req, res) => {
  try {
    if (!isId(req.params.id) || !isId(req.body.replyId)) return res.status(400).json({ error: 'Invalid thread or reply ID.' });
    const thread = await ForumThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    if (!isAdmin(req.user) && !isOwner(thread, req.user)) return res.status(403).json({ error: 'Only the thread author can mark a solution.' });

    const reply = await ForumReply.findOne({ _id: req.body.replyId, threadId: thread._id, isDeleted: false }).select('_id').lean();
    if (!reply) return res.status(404).json({ error: 'Reply not found in this thread.' });

    thread.solutionReplyId = reply._id;
    await thread.save();
    res.json({ threadId: String(thread._id), solutionReplyId: String(reply._id), isSolved: true });
  } catch (err) {
    console.error('❌ POST /forum/threads/:id/solution:', err);
    res.status(500).json({ error: 'Failed to mark solution' });
  }
});

router.delete('/threads/:id/solution', authMiddleware, async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(404).json({ error: 'Thread not found' });
    const thread = await ForumThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });
    if (!isAdmin(req.user) && !isOwner(thread, req.user)) return res.status(403).json({ error: 'Only the thread author can change the solution.' });

    thread.solutionReplyId = null;
    await thread.save();
    res.json({ threadId: String(thread._id), solutionReplyId: null, isSolved: false });
  } catch (err) {
    console.error('❌ DELETE /forum/threads/:id/solution:', err);
    res.status(500).json({ error: 'Failed to clear solution' });
  }
});

// ── Replies ──────────────────────────────────────────────────────────────────

router.get('/threads/:id/replies', optionalAuth, async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(404).json({ error: 'Thread not found' });
    const { page, limit } = parsePaging(req.query, 50, 100);

    const thread = await ForumThread.findById(req.params.id).select('solutionReplyId').lean();
    if (!thread) return res.status(404).json({ error: 'Thread not found' });

    const filter = { threadId: thread._id };
    const [total, replies] = await Promise.all([
      ForumReply.countDocuments(filter),
      ForumReply.find(filter)
        .sort({ createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('authorId', AUTHOR_SELECT)
        .lean(),
    ]);

    const votes = req.user
      ? await ForumVote.find({ userId: req.user._id, targetType: 'reply', targetId: { $in: replies.map((r) => r._id) } }).lean()
      : [];
    const voteByReply = new Map(votes.map((v) => [String(v.targetId), v.value]));

    res.json({
      replies: replies.map((r) =>
        serializeReply(r, { solutionReplyId: thread.solutionReplyId, viewerVote: voteByReply.get(String(r._id)) || 0 })
      ),
      pagination: { page, limit, total, hasNextPage: page * limit < total },
    });
  } catch (err) {
    console.error('❌ GET /forum/threads/:id/replies:', err);
    res.status(500).json({ error: 'Failed to load replies' });
  }
});

router.post('/threads/:id/replies', authMiddleware, blockSuspended, enforceRestriction('comment:create'), attachmentUpload, async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(404).json({ error: 'Thread not found' });
    const content = String(req.body.content || '').trim();
    const hasFiles = Boolean(req.files?.length);
    if (content.length > 5000 || (content.length < 1 && !hasFiles)) return res.status(400).json({ error: 'Reply must be 1-5,000 characters or include an image.' });

    const thread = await ForumThread.findById(req.params.id);
    if (!thread || thread.archived) return res.status(404).json({ error: 'Thread not found' });
    if (thread.locked) return res.status(403).json({ error: 'This thread is locked.' });

    // Replies nest one level deep: replying to a reply attaches to its parent.
    let parentReplyId = null;
    let parentAuthorId = null;
    if (req.body.parentReplyId) {
      if (!isId(req.body.parentReplyId)) return res.status(400).json({ error: 'Invalid parent reply.' });
      const parent = await ForumReply.findOne({ _id: req.body.parentReplyId, threadId: thread._id }).lean();
      if (!parent) return res.status(400).json({ error: 'Parent reply not found in this thread.' });
      parentReplyId = parent.parentReplyId || parent._id;
      parentAuthorId = parent.authorId;
    }

    let attachments = [];
    try {
      attachments = await saveAttachments(req.files, { userId: req.user._id, folder: 'forum' });
    } catch (uploadErr) {
      return res.status(400).json({ error: uploadErr.message });
    }

    const reply = await ForumReply.create({ threadId: thread._id, authorId: req.user._id, content, parentReplyId, attachments });
    await ForumThread.updateOne({ _id: thread._id }, { $inc: { replyCount: 1 }, $set: { lastActivityAt: new Date() } });

    awardCredits({ userId: req.user._id, eventKey: 'thread_reply', refId: String(reply._id) });

    // Thread author and the member being replied to, never the replier, never twice.
    const preview = content ? `${content.slice(0, 80)}${content.length > 80 ? '…' : ''}` : 'sent an image';
    const notified = new Set([String(req.user._id)]);
    const notifyReply = (recipientId, title) => {
      if (!recipientId || notified.has(String(recipientId))) return;
      notified.add(String(recipientId));
      createNotification({
        audience: 'user',
        type: 'forum_reply',
        title,
        message: `${req.user.username} replied in "${thread.title}": "${preview}"`,
        userId: recipientId,
        meta: { threadId: String(thread._id), replyId: String(reply._id) },
      }).catch((err) => console.error('❌ forum reply notification:', err.message));
    };
    notifyReply(parentAuthorId, 'New reply to your comment');
    notifyReply(thread.authorId, 'New reply to your discussion');

    const populated = await ForumReply.findById(reply._id).populate('authorId', AUTHOR_SELECT).lean();
    res.status(201).json(serializeReply(populated, { solutionReplyId: thread.solutionReplyId }));
  } catch (err) {
    console.error('❌ POST /forum/threads/:id/replies:', err);
    res.status(500).json({ error: 'Failed to post reply' });
  }
});

router.patch('/replies/:id', authMiddleware, blockSuspended, async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(404).json({ error: 'Reply not found' });
    const reply = await ForumReply.findById(req.params.id);
    if (!reply || reply.isDeleted) return res.status(404).json({ error: 'Reply not found' });
    if (!isAdmin(req.user) && !isOwner(reply, req.user)) return res.status(403).json({ error: 'You cannot edit this reply.' });

    const content = String(req.body.content || '').trim();
    if (content.length > 5000 || (content.length < 1 && !reply.attachments?.length)) return res.status(400).json({ error: 'Reply must be 1-5,000 characters.' });

    reply.content = content;
    reply.editedAt = new Date();
    await reply.save();

    const [populated, thread] = await Promise.all([
      ForumReply.findById(reply._id).populate('authorId', AUTHOR_SELECT).lean(),
      ForumThread.findById(reply.threadId).select('solutionReplyId').lean(),
    ]);
    res.json(serializeReply(populated, { solutionReplyId: thread?.solutionReplyId }));
  } catch (err) {
    console.error('❌ PATCH /forum/replies/:id:', err);
    res.status(500).json({ error: 'Failed to update reply' });
  }
});

router.delete('/replies/:id', authMiddleware, async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(404).json({ error: 'Reply not found' });
    const reply = await ForumReply.findById(req.params.id);
    if (!reply || reply.isDeleted) return res.status(404).json({ error: 'Reply not found' });
    if (!isAdmin(req.user) && !isOwner(reply, req.user)) return res.status(403).json({ error: 'You cannot delete this reply.' });

    reply.isDeleted = true;
    const files = reply.attachments || [];
    reply.attachments = [];
    await reply.save();
    removeStoredFiles(files);
    await ForumThread.updateOne(
      { _id: reply.threadId },
      { $inc: { replyCount: -1 } }
    );
    await ForumThread.updateOne({ _id: reply.threadId, solutionReplyId: reply._id }, { $set: { solutionReplyId: null } });

    res.json({ success: true, replyId: String(reply._id) });
  } catch (err) {
    console.error('❌ DELETE /forum/replies/:id:', err);
    res.status(500).json({ error: 'Failed to delete reply' });
  }
});

// ── Interactions ─────────────────────────────────────────────────────────────

const TARGET_MODELS = { thread: ForumThread, reply: ForumReply };

router.post('/interactions/vote', authMiddleware, blockSuspended, async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    const value = Number(req.body.value);
    const Model = TARGET_MODELS[targetType];
    if (!Model || !isId(targetId)) return res.status(400).json({ error: 'Invalid vote target.' });
    if (![1, -1, 0].includes(value)) return res.status(400).json({ error: 'Vote value must be 1, -1, or 0.' });

    const target = await Model.findById(targetId).select('authorId upvoteCount').lean();
    if (!target) return res.status(404).json({ error: 'Vote target not found.' });
    if (isOwner(target, req.user)) return res.status(403).json({ error: 'You cannot vote on your own content.' });

    const key = { userId: req.user._id, targetType, targetId };
    const existing = await ForumVote.findOne(key).lean();
    const previous = existing?.value || 0;

    if (value === 0) {
      if (existing) await ForumVote.deleteOne({ _id: existing._id });
    } else if (existing) {
      await ForumVote.updateOne({ _id: existing._id }, { value });
    } else {
      await ForumVote.create({ ...key, value });
    }

    const delta = value - previous;
    const updated = delta === 0 ? target : await Model.findByIdAndUpdate(targetId, { $inc: { upvoteCount: delta } }, { new: true }).select('upvoteCount').lean();

    res.json({ targetType, targetId, value, score: updated.upvoteCount });
  } catch (err) {
    console.error('❌ POST /forum/interactions/vote:', err);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

router.post('/interactions/bookmark', authMiddleware, async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    if (targetType !== 'thread' || !isId(targetId)) return res.status(400).json({ error: 'Invalid bookmark target.' });
    if (!(await ForumThread.exists({ _id: targetId }))) return res.status(404).json({ error: 'Thread not found.' });

    const key = { userId: req.user._id, targetType, targetId };
    const existing = await ForumBookmark.findOne(key).lean();
    if (existing) {
      await ForumBookmark.deleteOne({ _id: existing._id });
      return res.json({ targetType, targetId, bookmarked: false });
    }
    await ForumBookmark.create(key);
    res.json({ targetType, targetId, bookmarked: true });
  } catch (err) {
    console.error('❌ POST /forum/interactions/bookmark:', err);
    res.status(500).json({ error: 'Failed to update bookmark' });
  }
});

router.get('/bookmarks', authMiddleware, async (req, res) => {
  try {
    const bookmarks = await ForumBookmark.find({ userId: req.user._id, targetType: 'thread' }).sort({ createdAt: -1 }).limit(100).lean();
    const threads = await populateThread(
      ForumThread.find({ _id: { $in: bookmarks.map((b) => b.targetId) }, archived: false })
    ).lean();
    const byId = new Map(threads.map((t) => [String(t._id), t]));
    res.json({
      threads: bookmarks.map((b) => byId.get(String(b.targetId))).filter(Boolean).map(serializeThread),
    });
  } catch (err) {
    console.error('❌ GET /forum/bookmarks:', err);
    res.status(500).json({ error: 'Failed to load bookmarks' });
  }
});

export default router;
