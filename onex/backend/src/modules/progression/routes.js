import express from 'express';
import mongoose from 'mongoose';
import User from '../../models/User.js';
import { getProgression } from './rpEngine.js';
import { getUserPerks } from '../membership/membershipService.js';

const router = express.Router();

// ── GET /api/progression/:userId ─────────────────────────────────────────────
// Public. Returns RP, level, the per-category breakdown, and the ring color.
router.get('/:userId', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.userId)) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    const user = await User.findById(req.params.userId).select('status role progressionColor').lean();
    if (!user || user.status === 'suspended') {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    const result = await getProgression(req.params.userId);

    // A saved color only applies while the member still holds the perk; otherwise the default ring shows.
    const { perks } = await getUserPerks({ _id: user._id, role: user.role });
    const savedColor = user.progressionColor || '';
    const progressionColor = savedColor && perks.progressionColors.includes(savedColor) ? savedColor : null;

    return res.json({ ...result, progressionColor });
  } catch (err) {
    console.error('Progression computation failed:', err);
    return res.status(500).json({ error: 'Could not load progression.' });
  }
});

export default router;
