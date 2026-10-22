import express from 'express';
import mongoose from 'mongoose';
import Flag, { FLAG_STATUSES } from '../../models/Flag.js';
import Post from '../../models/Post.js';
import { createNotification } from '../notifications/notificationController.js';

const router = express.Router();

const STATUS_LABELS = {
  pending: 'Received',
  investigating: 'Under investigation',
  action_taken: 'Action taken',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
};

// ── GET /api/admin/flags ──────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { status, targetType } = req.query;
    const filter = {};
    if (FLAG_STATUSES.includes(status)) filter.status = status;
    if (['post', 'user'].includes(targetType)) filter.targetType = targetType;

    const flags = await Flag.find(filter)
      .populate('reporterId', 'username email accountType')
      .populate('reportedUserId', 'username email accountType')
      .populate('timeline.updatedBy', 'username')
      .sort({ createdAt: -1 })
      .lean();

    const posts = await Post.find({
      _id: { $in: flags.filter((f) => f.targetType === 'post').map((f) => f.targetId) },
    })
      .select('title')
      .lean();
    const postTitles = new Map(posts.map((p) => [String(p._id), p.title]));

    res.json(
      flags.map((f) => ({
        ...f,
        postTitle: f.targetType === 'post' ? postTitles.get(String(f.targetId)) || null : null,
      }))
    );
  } catch (err) {
    console.error('❌ GET /admin/flags:', err);
    res.status(500).json({ error: 'Failed to fetch flags' });
  }
});

// ── PATCH /api/admin/flags/:id ────────────────────────────────────────────────
// Sets the flag status and appends a timeline entry the reporter can see.
router.patch('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid flag ID.' });
    }

    const { status } = req.body;
    const message = String(req.body.message || '').trim().slice(0, 1000);

    if (!FLAG_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const flag = await Flag.findById(req.params.id);
    if (!flag) return res.status(404).json({ error: 'Flag not found.' });

    flag.status = status;
    flag.timeline.push({ status, message, updatedBy: req.user._id });
    await flag.save();

    createNotification({
      audience: 'user',
      userId: flag.reporterId,
      type: 'flag_update',
      title: 'Update on your report',
      message: `Your report is now: ${STATUS_LABELS[status]}.${message ? ` ${message}` : ''}`,
      meta: { flagId: flag._id },
    }).catch((err) => console.error('❌ flag reporter notification:', err.message));

    const updated = await Flag.findById(flag._id)
      .populate('reporterId', 'username email accountType')
      .populate('reportedUserId', 'username email accountType')
      .populate('timeline.updatedBy', 'username')
      .lean();

    res.json(updated);
  } catch (err) {
    console.error('❌ PATCH /admin/flags/:id:', err);
    res.status(500).json({ error: 'Failed to update flag' });
  }
});

export default router;
