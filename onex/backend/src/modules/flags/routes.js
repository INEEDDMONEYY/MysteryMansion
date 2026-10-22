import express from 'express';
import mongoose from 'mongoose';
import Flag, { FLAG_REASON_IDS } from '../../models/Flag.js';
import Post from '../../models/Post.js';
import User from '../../models/User.js';
import { authMiddleware } from '../../common/middleware/authMiddleware.js';
import { createNotification } from '../notifications/notificationController.js';

const router = express.Router();

router.use(authMiddleware);

// ── POST /api/flags ───────────────────────────────────────────────────────────
// Any signed-in user can report a post or an account.
router.post('/', async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;
    const details = String(req.body.details || '').trim().slice(0, 1000);

    if (!FLAG_REASON_IDS[targetType]) {
      return res.status(400).json({ error: 'Unsupported flag target type.' });
    }
    if (!mongoose.isValidObjectId(targetId)) {
      return res.status(400).json({ error: 'A valid target ID is required.' });
    }
    if (!FLAG_REASON_IDS[targetType].includes(reason)) {
      return res.status(400).json({ error: 'Invalid flag reason.' });
    }

    let reportedUserId = null;

    if (targetType === 'post') {
      const post = await Post.findById(targetId).select('userId').lean();
      if (!post) return res.status(404).json({ error: 'Post not found.' });
      reportedUserId = post.userId;
    } else {
      const user = await User.findById(targetId).select('_id').lean();
      if (!user) return res.status(404).json({ error: 'User not found.' });
      reportedUserId = user._id;
    }

    if (String(reportedUserId) === String(req.user._id)) {
      return res.status(400).json({ error: 'You cannot report your own content or account.' });
    }

    const existing = await Flag.findOne({
      reporterId: req.user._id,
      targetType,
      targetId,
      status: { $in: ['pending', 'investigating'] },
    }).lean();

    if (existing) {
      return res.status(409).json({
        error: 'You have already reported this and it is still being reviewed.',
      });
    }

    const flag = await Flag.create({
      reporterId: req.user._id,
      targetType,
      targetId,
      reportedUserId,
      reason,
      details,
      timeline: [
        {
          status: 'pending',
          message: 'Your report has been received and is waiting for review.',
        },
      ],
    });

    createNotification({
      audience: 'admin',
      type: 'new_flag',
      title: 'New report submitted',
      message: `${req.user.username} reported a ${targetType === 'post' ? 'post' : 'user'}.`,
      meta: { flagId: flag._id },
    }).catch((err) => console.error('❌ flag admin notification:', err.message));

    // Reporter identity is intentionally not included.
    if (reportedUserId && String(reportedUserId) !== String(req.user._id)) {
      createNotification({
        audience: 'user',
        userId: reportedUserId,
        type: 'flag_update',
        title: targetType === 'post' ? 'Your post was reported' : 'Your account was reported',
        message: 'A report was submitted and is waiting for review by our team.',
        meta: { flagId: flag._id },
      }).catch((err) => console.error('❌ flag target notification:', err.message));
    }

    res.status(201).json({ success: true, flagId: flag._id });
  } catch (err) {
    console.error('❌ POST /flags:', err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// ── GET /api/flags/mine ───────────────────────────────────────────────────────
// The reporter's own reports with the public timeline of each one.
router.get('/mine', async (req, res) => {
  try {
    const flags = await Flag.find({ reporterId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const postIds = flags.filter((f) => f.targetType === 'post').map((f) => f.targetId);
    const userIds = flags.filter((f) => f.targetType === 'user').map((f) => f.targetId);

    const [posts, users] = await Promise.all([
      Post.find({ _id: { $in: postIds } }).select('title').lean(),
      User.find({ _id: { $in: userIds } }).select('username').lean(),
    ]);

    const postTitles = new Map(posts.map((p) => [String(p._id), p.title]));
    const usernames = new Map(users.map((u) => [String(u._id), u.username]));

    res.json(
      flags.map((f) => ({
        _id: f._id,
        targetType: f.targetType,
        targetId: f.targetId,
        targetLabel:
          (f.targetType === 'post'
            ? postTitles.get(String(f.targetId))
            : usernames.get(String(f.targetId))) || null,
        reason: f.reason,
        details: f.details,
        status: f.status,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
        // updatedBy is intentionally omitted — reporters don't see admin identities.
        timeline: (f.timeline || []).map(({ _id, status, message, createdAt }) => ({
          _id,
          status,
          message,
          createdAt,
        })),
      }))
    );
  } catch (err) {
    console.error('❌ GET /flags/mine:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// ── GET /api/flags/against-me ─────────────────────────────────────────────────
// Reports filed against the caller's account or posts. The reporter, their
// details and the admin timeline notes are intentionally not exposed.
router.get('/against-me', async (req, res) => {
  try {
    const flags = await Flag.find({ reportedUserId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const postIds = flags.filter((f) => f.targetType === 'post').map((f) => f.targetId);
    const posts = await Post.find({ _id: { $in: postIds } }).select('title').lean();
    const postTitles = new Map(posts.map((p) => [String(p._id), p.title]));

    res.json(
      flags.map((f) => ({
        _id: f._id,
        targetType: f.targetType,
        targetId: f.targetId,
        targetLabel: f.targetType === 'post' ? postTitles.get(String(f.targetId)) || null : null,
        reason: f.reason,
        status: f.status,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      }))
    );
  } catch (err) {
    console.error('❌ GET /flags/against-me:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

export default router;
