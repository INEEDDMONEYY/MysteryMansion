import express from 'express';
import FAQ from '../../models/FAQ.js';

const router = express.Router();

// GET /api/faqs — public, returns only active FAQs sorted by sortOrder
router.get('/', async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .select('question answer')
      .lean();
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
