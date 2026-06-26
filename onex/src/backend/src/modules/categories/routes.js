import express from 'express';
import Category from '../../models/Category.js';

const router = express.Router();

// GET /api/categories — public, active categories sorted by sortOrder
router.get('/', async (req, res) => {
  try {
    const cats = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select('name')
      .lean();
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
