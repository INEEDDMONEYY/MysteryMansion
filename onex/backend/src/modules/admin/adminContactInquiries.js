import express from 'express';
import mongoose from 'mongoose';
import ContactInquiry, {
  CONTACT_STATUSES,
  CONTACT_TOPICS,
} from '../../models/ContactInquiry.js';

const router = express.Router();

const MAX_PAGE_SIZE = 50;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const validId = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id)
    ? next()
    : res.status(404).json({ error: 'Inquiry not found.' });

// GET /api/admin/contact-inquiries/new-count — sidebar badge.
router.get('/new-count', async (req, res) => {
  try {
    const count = await ContactInquiry.countDocuments({ status: 'new' });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/contact-inquiries?status=&topic=&q=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { status, topic } = req.query;
    const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));

    const filter = {};
    if (CONTACT_STATUSES.includes(status)) filter.status = status;
    if (CONTACT_TOPICS.includes(topic)) filter.topic = topic;
    if (q) {
      const re = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ name: re }, { email: re }, { subject: re }, { message: re }];
    }

    const [items, total, statusCounts] = await Promise.all([
      ContactInquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({ path: 'userId', select: 'username accountType profilePic' })
        .populate({ path: 'handledBy', select: 'username' })
        .lean(),
      ContactInquiry.countDocuments(filter),
      ContactInquiry.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    const counts = Object.fromEntries(CONTACT_STATUSES.map((key) => [key, 0]));
    for (const row of statusCounts) counts[row._id] = row.count;

    res.json({
      items,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      counts,
      topics: CONTACT_TOPICS,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/contact-inquiries/:id — { status?, adminNotes? }
router.patch('/:id', validId, async (req, res) => {
  try {
    const { status, adminNotes } = req.body || {};
    const update = {};

    if (status !== undefined) {
      if (!CONTACT_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Invalid status.' });
      }
      update.status = status;
      update.resolvedAt = status === 'resolved' ? new Date() : null;
      update.handledBy = req.user._id;
    }

    if (adminNotes !== undefined) {
      if (typeof adminNotes !== 'string') {
        return res.status(400).json({ error: 'Notes must be text.' });
      }
      update.adminNotes = adminNotes.trim().slice(0, 5000);
    }

    if (!Object.keys(update).length) {
      return res.status(400).json({ error: 'Nothing to update.' });
    }

    const inquiry = await ContactInquiry.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    )
      .populate({ path: 'userId', select: 'username accountType profilePic' })
      .populate({ path: 'handledBy', select: 'username' })
      .lean();

    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found.' });
    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/contact-inquiries/:id
router.delete('/:id', validId, async (req, res) => {
  try {
    const inquiry = await ContactInquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
