import express from 'express';
import mongoose from 'mongoose';
import User from '../../models/User.js';
import CreditEarnRule, { EARN_ROLES } from '../../models/CreditEarnRule.js';
import CreditTransaction from '../../models/CreditTransaction.js';
import { awardCredits, announceEarnRule, HOOKED_KEYS } from '../credits/creditEarnService.js';

const router = express.Router();

const intIn = (value, min, max) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
};

// Validates the editable fields; returns { update } or { error }.
function parseRuleFields(body, { partial }) {
  const update = {};

  if (body.label != null) {
    const label = String(body.label).trim().slice(0, 80);
    if (!label) return { error: 'Label cannot be empty.' };
    update.label = label;
  } else if (!partial) {
    return { error: 'Label is required.' };
  }

  if (body.description != null) update.description = String(body.description).trim().slice(0, 300);

  if (body.credits != null || !partial) {
    const credits = intIn(body.credits, 1, 10000);
    if (credits == null) return { error: 'Credits must be a whole number between 1 and 10,000.' };
    update.credits = credits;
  }

  if (body.roles != null) {
    const roles = Array.isArray(body.roles) ? body.roles.filter((r) => EARN_ROLES.includes(r)) : [];
    if (roles.length === 0) return { error: 'Select at least one role.' };
    update.roles = [...new Set(roles)];
  }

  if (body.limitPerDay != null) {
    const v = intIn(body.limitPerDay, 0, 1000);
    if (v == null) return { error: 'Daily limit must be a whole number from 0 to 1,000 (0 = unlimited).' };
    update.limitPerDay = v;
  }

  if (body.lifetimeLimit != null) {
    const v = intIn(body.lifetimeLimit, 0, 100000);
    if (v == null) return { error: 'Lifetime limit must be a whole number from 0 to 100,000 (0 = unlimited).' };
    update.lifetimeLimit = v;
  }

  if (body.isActive != null) update.isActive = Boolean(body.isActive);
  if (body.notify != null) update.notify = Boolean(body.notify);
  if (body.sortOrder != null) update.sortOrder = Number(body.sortOrder) || 0;

  return { update };
}

// ── GET /api/admin/credit-earn-rules ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rules, totals] = await Promise.all([
      CreditEarnRule.find().sort({ sortOrder: 1, createdAt: 1 }).lean(),
      CreditTransaction.aggregate([
        { $group: { _id: '$ruleKey', awards: { $sum: 1 }, credits: { $sum: '$amount' } } },
      ]),
    ]);
    const totalsByKey = new Map(totals.map((t) => [t._id, t]));

    res.json(
      rules.map((rule) => ({
        ...rule,
        hooked: HOOKED_KEYS.has(rule.key),
        totalAwards: totalsByKey.get(rule.key)?.awards || 0,
        totalCredits: totalsByKey.get(rule.key)?.credits || 0,
      }))
    );
  } catch (err) {
    console.error('❌ GET /admin/credit-earn-rules:', err);
    res.status(500).json({ error: 'Failed to fetch earn rules' });
  }
});

// ── POST /api/admin/credit-earn-rules (custom rule) ──────────────────────────
router.post('/', async (req, res) => {
  try {
    const key = String(req.body.key || '').trim().toLowerCase();
    if (!/^[a-z0-9_]{3,40}$/.test(key)) {
      return res.status(400).json({ error: 'Key must be 3-40 characters: lowercase letters, numbers, underscores.' });
    }

    const { update, error } = parseRuleFields(req.body, { partial: false });
    if (error) return res.status(400).json({ error });

    if (await CreditEarnRule.exists({ key })) {
      return res.status(409).json({ error: 'A rule with this key already exists.' });
    }

    const trigger = req.body.trigger === 'automatic' ? 'automatic' : 'manual';
    const rule = await CreditEarnRule.create({
      roles: ['provider', 'client'],
      ...update,
      key,
      trigger,
      isSystem: false,
    });
    if (rule.isActive) announceEarnRule(rule);
    res.status(201).json({ ...rule.toObject(), hooked: HOOKED_KEYS.has(key), totalAwards: 0, totalCredits: 0 });
  } catch (err) {
    console.error('❌ POST /admin/credit-earn-rules:', err);
    res.status(500).json({ error: 'Failed to create earn rule' });
  }
});

// ── GET /api/admin/credit-earn-rules/transactions ────────────────────────────
router.get('/transactions', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const filter = {};
    if (req.query.ruleKey) filter.ruleKey = String(req.query.ruleKey);

    const transactions = await CreditTransaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'username accountType role')
      .populate('grantedBy', 'username')
      .lean();
    res.json(transactions);
  } catch (err) {
    console.error('❌ GET /admin/credit-earn-rules/transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// ── PUT /api/admin/credit-earn-rules/:id ─────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid rule ID.' });

    const { update, error } = parseRuleFields(req.body, { partial: true });
    if (error) return res.status(400).json({ error });

    const before = await CreditEarnRule.findById(req.params.id).select('isActive').lean();
    if (!before) return res.status(404).json({ error: 'Rule not found' });

    const rule = await CreditEarnRule.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    if (!before.isActive && rule.isActive) announceEarnRule(rule);
    res.json({ ...rule.toObject(), hooked: HOOKED_KEYS.has(rule.key) });
  } catch (err) {
    console.error('❌ PUT /admin/credit-earn-rules/:id:', err);
    res.status(500).json({ error: 'Failed to update earn rule' });
  }
});

// ── DELETE /api/admin/credit-earn-rules/:id (custom rules only) ──────────────
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid rule ID.' });

    const rule = await CreditEarnRule.findById(req.params.id);
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    if (rule.isSystem) {
      return res.status(409).json({ error: 'Built-in rules cannot be deleted. Turn them off instead.' });
    }

    await rule.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error('❌ DELETE /admin/credit-earn-rules/:id:', err);
    res.status(500).json({ error: 'Failed to delete earn rule' });
  }
});

// ── POST /api/admin/credit-earn-rules/:id/grant ──────────────────────────────
// Manually pays a rule to one user (contests, bonuses). Ignores role and limits.
router.post('/:id/grant', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid rule ID.' });

    const rule = await CreditEarnRule.findById(req.params.id).lean();
    if (!rule) return res.status(404).json({ error: 'Rule not found' });

    const username = String(req.body.username || '').trim();
    const userId = req.body.userId;
    const target = userId && mongoose.isValidObjectId(userId)
      ? await User.findById(userId).select('_id username').lean()
      : username
        ? await User.findOne({ username: new RegExp(`^${username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') })
            .select('_id username')
            .lean()
        : null;
    if (!target) return res.status(404).json({ error: 'User not found.' });

    const amount = req.body.amount != null && req.body.amount !== '' ? intIn(req.body.amount, 1, 10000) : null;
    if (req.body.amount != null && req.body.amount !== '' && amount == null) {
      return res.status(400).json({ error: 'Amount must be a whole number between 1 and 10,000.' });
    }

    const result = await awardCredits({
      userId: target._id,
      eventKey: rule.key,
      force: true,
      amount,
      source: 'admin_grant',
      grantedBy: req.user._id,
      note: String(req.body.note || '').trim().slice(0, 300),
    });

    if (!result.awarded) return res.status(500).json({ error: 'Grant failed.' });
    res.json({
      message: `Granted ${result.amount} credits to ${target.username}. New balance: ${result.balance}.`,
      ...result,
    });
  } catch (err) {
    console.error('❌ POST /admin/credit-earn-rules/:id/grant:', err);
    res.status(500).json({ error: 'Failed to grant credits' });
  }
});

export default router;
