import express from 'express';
import User from '../../models/User.js';
import CreditRequest from '../../models/CreditRequest.js';
import { authMiddleware } from '../../common/middleware/authMiddleware.js';

const router = express.Router();

// All credits routes require authentication
router.use(authMiddleware);

// ── GET /api/credits/balance ──────────────────────────────────────────────────
// Returns the authenticated user's current credit balance.
router.get('/balance', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('credits accountType').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Credits field may be missing on accounts created before this feature.
    // Default to 200 for clients (matches schema default) and 0 for providers.
    const defaultCredits = user.accountType === 'client' ? 200 : 0;
    const credits = user.credits ?? defaultCredits;
    res.json({ credits, accountType: user.accountType });
  } catch (err) {
    console.error('❌ GET /credits/balance:', err);
    res.status(500).json({ error: 'Failed to fetch credit balance' });
  }
});

// ── GET /api/credits/requests ─────────────────────────────────────────────────
// Returns the authenticated user's own top-up request history.
router.get('/requests', async (req, res) => {
  try {
    const requests = await CreditRequest.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(requests);
  } catch (err) {
    console.error('❌ GET /credits/requests:', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// ── POST /api/credits/request ─────────────────────────────────────────────────
// Client submits a new top-up request for admin approval.
router.post('/request', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('accountType').lean();
    if (!user || user.accountType !== 'client') {
      return res.status(403).json({ error: 'Only client accounts can request credits.' });
    }

    const amount = Number(req.body.amount);
    if (!amount || amount < 1 || amount > 10000 || !Number.isInteger(amount)) {
      return res.status(400).json({ error: 'Amount must be a whole number between 1 and 10,000.' });
    }

    const note = String(req.body.note || '').trim().slice(0, 500);

    // Prevent spamming — one pending request at a time
    const existing = await CreditRequest.findOne({ userId: req.user._id, status: 'pending' }).lean();
    if (existing) {
      return res.status(409).json({
        error: 'You already have a pending credit request. Please wait for it to be reviewed.',
      });
    }

    const request = await CreditRequest.create({
      userId: req.user._id,
      amount,
      note,
    });

    res.status(201).json(request);
  } catch (err) {
    console.error('❌ POST /credits/request:', err);
    res.status(500).json({ error: 'Failed to submit request' });
  }
});

export default router;
