import express from 'express';
import User from '../../models/User.js';
import CreditRequest from '../../models/CreditRequest.js';
import CreditPackage from '../../models/CreditPackage.js';
import CreditEarnRule from '../../models/CreditEarnRule.js';
import CreditTransaction from '../../models/CreditTransaction.js';
import { authMiddleware } from '../../common/middleware/authMiddleware.js';
import { awardCredits, dayKey, getEarnOverview } from './creditEarnService.js';
import { createNotification } from '../notifications/notificationController.js';

const router = express.Router();

// ── GET /api/credits/packages (public — no auth) ────────────────────────
router.get('/packages', async (req, res) => {
  try {
    const packages = await CreditPackage
      .find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// All routes below require authentication
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

// ── GET /api/credits/earn/rules ───────────────────────────────────────────────
// Active ways to earn credits for the caller's role, with their progress.
router.get('/earn/rules', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('role accountType').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(await getEarnOverview(user));
  } catch (err) {
    console.error('❌ GET /credits/earn/rules:', err);
    res.status(500).json({ error: 'Failed to fetch earn rules' });
  }
});

// ── GET /api/credits/earn/history ─────────────────────────────────────────────
router.get('/earn/history', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const transactions = await CreditTransaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const labels = new Map(
      (await CreditEarnRule.find({ key: { $in: [...new Set(transactions.map((t) => t.ruleKey))] } })
        .select('key label')
        .lean()).map((r) => [r.key, r.label])
    );

    res.json(
      transactions.map((t) => ({
        _id: t._id,
        ruleKey: t.ruleKey,
        label: labels.get(t.ruleKey) || t.ruleKey,
        amount: t.amount,
        balanceAfter: t.balanceAfter,
        createdAt: t.createdAt,
      }))
    );
  } catch (err) {
    console.error('❌ GET /credits/earn/history:', err);
    res.status(500).json({ error: 'Failed to fetch earning history' });
  }
});

// ── POST /api/credits/earn/daily-login ────────────────────────────────────────
// Idempotent per Mountain-time day. Covers sessions that stay signed in for days.
router.post('/earn/daily-login', async (req, res) => {
  const result = await awardCredits({
    userId: req.user._id,
    eventKey: 'daily_login',
    refId: dayKey(),
  });
  res.json(result);
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
// Any authenticated account submits a new top-up request for admin approval.
router.post('/request', async (req, res) => {
  try {
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

    createNotification({
      audience: 'admin',
      type: 'new_credit_request',
      title: 'New credit request',
      message: `${req.user.username} requested ${amount} credits.`,
      meta: { creditRequestId: request._id },
    }).catch((err) => console.error('❌ credit request notification:', err.message));

    res.status(201).json(request);
  } catch (err) {
    console.error('❌ POST /credits/request:', err);
    res.status(500).json({ error: 'Failed to submit request' });
  }
});

export default router;
