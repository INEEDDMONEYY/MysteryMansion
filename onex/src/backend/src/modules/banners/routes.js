import express from 'express';
import {
  getActiveBanners,
  getAllBanners,
  createBanner,
  toggleBanner,
  deleteBanner,
} from './bannerController.js';
import { authMiddleware, adminOnlyMiddleware } from '../../common/middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/public', getActiveBanners);

// Admin-only
router.get('/', authMiddleware, adminOnlyMiddleware, getAllBanners);
router.post('/', authMiddleware, adminOnlyMiddleware, createBanner);
router.patch('/:id/toggle', authMiddleware, adminOnlyMiddleware, toggleBanner);
router.delete('/:id', authMiddleware, adminOnlyMiddleware, deleteBanner);

export default router;
