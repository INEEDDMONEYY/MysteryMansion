import express from 'express';
import { authMiddleware, adminOnlyMiddleware } from '../../common/middleware/authMiddleware.js';
import {
  getAdminNotifications,
  markAdminAllRead,
  markOneRead,
  getUserNotifications,
  markUserAllRead,
} from './notificationController.js';

const router = express.Router();

// ── Admin bell (requires auth + admin) ───────────────────────────────────────
router.get('/',             authMiddleware, adminOnlyMiddleware, getAdminNotifications);
router.patch('/read-all',   authMiddleware, adminOnlyMiddleware, markAdminAllRead);

// ── User bell (requires auth) ─────────────────────────────────────────────────
router.get('/user',         authMiddleware, getUserNotifications);
router.patch('/user/read-all', authMiddleware, markUserAllRead);

// ── Shared: mark single notification read ────────────────────────────────────
router.patch('/:id/read',   authMiddleware, markOneRead);

export default router;
