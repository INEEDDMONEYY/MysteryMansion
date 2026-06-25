import express from 'express';
import { getPublicDevMessage } from './controllers/AdminSettingsController.js';
import AdminSettings from '../../models/AdminSettings.js';

const router = express.Router();

// Public read-only endpoint for developer message shown in header
router.get('/dev-message', getPublicDevMessage);

// Public read-only endpoint — exposes only safe, non-sensitive flags
router.get('/flags', async (req, res) => {
  try {
    const settings = await AdminSettings.findOne().select('emailEnabled visitorCount').lean();
    res.json({
      emailEnabled: settings?.emailEnabled !== false,
      visitorCount: settings?.visitorCount ?? 13000,
    });
  } catch {
    res.json({ emailEnabled: true, visitorCount: 13000 }); // fail-safe
  }
});

export default router;
