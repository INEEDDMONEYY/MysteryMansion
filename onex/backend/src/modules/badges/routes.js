import express from 'express';
import mongoose from 'mongoose';
import User from '../../models/User.js';
import { computeEarnedBadges } from './badgeEngine.js';

const router = express.Router();

const BADGE_USER_FIELDS =
  'accountType createdAt bio profilePic bannerPic age location gender socialLinks status activity';

// ── GET /api/badges/:userId ──────────────────────────────────────────────────
// Public. Returns the badges a profile has earned from real account activity.
router.get('/:userId', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.userId)) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    const user = await User.findById(req.params.userId).select(BADGE_USER_FIELDS).lean();
    if (!user || user.status === 'suspended') {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    const result = await computeEarnedBadges(user);
    return res.json(result);
  } catch (err) {
    console.error('Badge computation failed:', err);
    return res.status(500).json({ error: 'Could not load badges.' });
  }
});

export default router;
