import express from 'express';
import {
  getActiveDiscounts,
  getAllDiscounts,
  createDiscount,
  toggleDiscount,
  deleteDiscount,
} from './discountController.js';
import { authMiddleware, adminOnlyMiddleware } from '../../common/middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/public', getActiveDiscounts);

// Admin-only
router.get('/', authMiddleware, adminOnlyMiddleware, getAllDiscounts);
router.post('/', authMiddleware, adminOnlyMiddleware, createDiscount);
router.patch('/:id/toggle', authMiddleware, adminOnlyMiddleware, toggleDiscount);
router.delete('/:id', authMiddleware, adminOnlyMiddleware, deleteDiscount);

export default router;
