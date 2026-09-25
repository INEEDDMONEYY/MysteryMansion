import express from 'express';
import Milestone from '../../models/Milestone.js';
import User from '../../models/User.js';
import { createNotification } from '../notifications/notificationController.js';
import { sendMilestonesAddedEmail } from '../../common/utils/sendMilestoneAchievedEmail.js';

const router = express.Router();

const ACCOUNT_TYPES = ['provider', 'client'];

// GET /api/admin/milestones?accountType=provider|client
router.get('/', async (req, res) => {
  try {
    const { accountType } = req.query;
    const filter = {};
    if (ACCOUNT_TYPES.includes(accountType)) filter.accountType = accountType;

    const milestones = await Milestone.find(filter)
      .sort({ status: 1, sortOrder: 1, createdAt: 1 })
      .lean();

    res.json(milestones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/milestones — create a draft milestone
router.post('/', async (req, res) => {
  try {
    const { accountType, title, description, sortOrder } = req.body;

    if (!ACCOUNT_TYPES.includes(accountType)) {
      return res.status(400).json({ error: 'accountType must be "provider" or "client".' });
    }
    if (!title?.trim()) {
      return res.status(400).json({ error: 'Title is required.' });
    }

    const milestone = await Milestone.create({
      accountType,
      title: title.trim(),
      description: description?.trim() || '',
      sortOrder: sortOrder ?? 0,
      createdBy: req.user?._id || null,
    });

    res.status(201).json(milestone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/milestones/:id — update
router.put('/:id', async (req, res) => {
  try {
    const { title, description, sortOrder, accountType } = req.body;
    const update = {};
    if (title !== undefined) update.title = String(title).trim();
    if (description !== undefined) update.description = String(description).trim();
    if (sortOrder !== undefined) update.sortOrder = Number(sortOrder);
    if (ACCOUNT_TYPES.includes(accountType)) update.accountType = accountType;

    const milestone = await Milestone.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!milestone) return res.status(404).json({ error: 'Milestone not found.' });

    res.json(milestone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/milestones/:id
router.delete('/:id', async (req, res) => {
  try {
    const milestone = await Milestone.findByIdAndDelete(req.params.id);
    if (!milestone) return res.status(404).json({ error: 'Milestone not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/milestones/publish/preview — count how many users would be notified, without publishing
router.post('/publish/preview', async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(Boolean) : [];
    if (!ids.length) return res.status(400).json({ error: 'No milestone ids provided.' });

    const drafts = await Milestone.find({ _id: { $in: ids }, status: 'draft' }).select('accountType').lean();
    if (!drafts.length) return res.status(404).json({ error: 'No matching draft milestones found.' });

    const accountTypes = [...new Set(drafts.map((m) => m.accountType))];
    const breakdown = {};
    let total = 0;
    for (const accountType of accountTypes) {
      const count = await User.countDocuments({ role: 'user', accountType, status: 'active' });
      breakdown[accountType] = count;
      total += count;
    }

    res.json({ total, breakdown });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/milestones/publish — publish one or more drafts and notify matching users
router.post('/publish', async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(Boolean) : [];
    if (!ids.length) return res.status(400).json({ error: 'No milestone ids provided.' });

    const drafts = await Milestone.find({ _id: { $in: ids }, status: 'draft' });
    if (!drafts.length) return res.status(404).json({ error: 'No matching draft milestones found.' });

    const now = new Date();
    await Milestone.updateMany(
      { _id: { $in: drafts.map((m) => m._id) } },
      { status: 'published', publishedAt: now }
    );

    // Group by accountType so each affected audience gets one notification/email
    // per publish action, even when several milestones go live at once.
    const byAccountType = drafts.reduce((acc, m) => {
      (acc[m.accountType] ||= []).push(m);
      return acc;
    }, {});

    let notifiedUsers = 0;

    for (const [accountType, milestones] of Object.entries(byAccountType)) {
      const users = await User.find({ role: 'user', accountType, status: 'active' })
        .select('username email')
        .lean();
      notifiedUsers += users.length;

      const isBatch = milestones.length > 1;
      const title = isBatch ? `${milestones.length} new milestones added` : 'New milestone added';
      const message = isBatch
        ? `${milestones.length} new milestones were added: ${milestones.map((m) => m.title).join(', ')}`
        : `A new milestone was added: "${milestones[0].title}".`;

      await Promise.allSettled(
        users.map(async (user) => {
          await createNotification({
            audience: 'user',
            type: 'milestone_added',
            title,
            message,
            userId: user._id,
            meta: { milestoneIds: milestones.map((m) => String(m._id)) },
          });

          if (user.email) {
            await sendMilestonesAddedEmail({ to: user.email, username: user.username, milestones });
          }
        })
      );
    }

    const updated = await Milestone.find({ _id: { $in: drafts.map((m) => m._id) } }).lean();
    res.json({ milestones: updated, notifiedUsers });
  } catch (err) {
    console.error('❌ POST /admin/milestones/publish:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
