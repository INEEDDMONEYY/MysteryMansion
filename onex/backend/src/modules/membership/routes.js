import express from 'express';

import { authMiddleware } from '../../common/middleware/authMiddleware.js';
import { MEMBERSHIP_TIERS, TIER_ORDER, serializePlan } from './membershipCatalog.js';
import {
  getMembershipStatus,
  renewNow,
  setAutoRenew,
  subscribe,
  upgrade,
} from './membershipService.js';

const router = express.Router();

const respond = (res, result) =>
  result.ok
    ? res.json({ success: true, data: result.data })
    : res.status(result.status).json({ success: false, error: result.error, data: result.data });

const run = (handler) => async (req, res) => {
  try {
    respond(res, await handler(req));
  } catch (err) {
    console.error('❌ membership route:', err);
    res.status(500).json({ success: false, error: 'Membership request failed.' });
  }
};

// Public: plans for the marketing page.
router.get('/plans', (_req, res) => {
  res.json(TIER_ORDER.map((id) => serializePlan(MEMBERSHIP_TIERS[id])));
});

router.use(authMiddleware);

router.get('/me', run(async (req) => ({ ok: true, data: await getMembershipStatus(req.user) })));
router.post('/subscribe', run((req) => subscribe(req.user, String(req.body?.tierId || ''))));
router.post('/upgrade', run((req) => upgrade(req.user, String(req.body?.tierId || ''))));
router.post('/cancel', run((req) => setAutoRenew(req.user, false)));
router.post('/resume', run((req) => setAutoRenew(req.user, true)));
router.post('/renew', run((req) => renewNow(req.user)));

export default router;
