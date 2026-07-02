import express from 'express';
import User from '../../models/User.js';
import CreditRequest from '../../models/CreditRequest.js';

const router = express.Router();

// ── GET /api/admin/credit-requests ───────────────────────────────────────────
// List all credit requests, optionally filtered by status.
router.get('/', async (req, res) => {
  try {
    const { status } = req.query; // 'pending' | 'approved' | 'rejected' | omit for all
    const filter = status ? { status } : {};
    const requests = await CreditRequest.find(filter)
      .populate('userId', 'username email accountType credits')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 })
      .lean();
    res.json(requests);
  } catch (err) {
    console.error('❌ GET /admin/credit-requests:', err);
    res.status(500).json({ error: 'Failed to fetch credit requests' });
  }
});

// ── POST /api/admin/credit-requests/:id/approve ───────────────────────────────
// Approve a pending request and add credits to the user's balance.
router.post('/:id/approve', async (req, res) => {
  try {
    const request = await CreditRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(409).json({ error: `Request is already ${request.status}.` });
    }

    const adminNote = String(req.body.adminNote || '').trim().slice(0, 500);

    // Add credits atomically
    const updatedUser = await User.findByIdAndUpdate(
      request.userId,
      { $inc: { credits: request.amount } },
      { new: true, select: 'username credits' }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found — cannot approve.' });
    }

    request.status     = 'approved';
    request.adminNote  = adminNote;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    res.json({
      message: `Approved. ${updatedUser.username} now has ${updatedUser.credits} credits.`,
      request,
      newBalance: updatedUser.credits,
    });
  } catch (err) {
    console.error('❌ POST /admin/credit-requests/:id/approve:', err);
    res.status(500).json({ error: 'Failed to approve request' });
  }
});

// ── POST /api/admin/credit-requests/:id/reject ────────────────────────────────
// Reject a pending request (credits are not changed).
router.post('/:id/reject', async (req, res) => {
  try {
    const request = await CreditRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(409).json({ error: `Request is already ${request.status}.` });
    }

    const adminNote = String(req.body.adminNote || '').trim().slice(0, 500);

    request.status     = 'rejected';
    request.adminNote  = adminNote;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    res.json({ message: 'Request rejected.', request });
  } catch (err) {
    console.error('❌ POST /admin/credit-requests/:id/reject:', err);
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

export default router;
