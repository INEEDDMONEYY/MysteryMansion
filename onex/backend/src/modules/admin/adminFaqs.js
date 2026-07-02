import express from 'express';
import FAQ from '../../models/FAQ.js';

const router = express.Router();

// GET /api/admin/faqs — all FAQs (active + inactive)
router.get('/', async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/faqs — create
router.post('/', async (req, res) => {
  try {
    const { question, answer, sortOrder, isActive } = req.body;
    if (!question?.trim() || !answer?.trim()) {
      return res.status(400).json({ error: 'Question and answer are required.' });
    }
    const faq = await FAQ.create({
      question: question.trim(),
      answer: answer.trim(),
      sortOrder: sortOrder ?? 0,
      isActive: isActive !== false,
    });
    res.status(201).json(faq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/faqs/:id — update
router.put('/:id', async (req, res) => {
  try {
    const { question, answer, sortOrder, isActive } = req.body;
    const update = {};
    if (question !== undefined) update.question = String(question).trim();
    if (answer  !== undefined) update.answer   = String(answer).trim();
    if (sortOrder !== undefined) update.sortOrder = Number(sortOrder);
    if (isActive !== undefined) update.isActive  = Boolean(isActive);

    const faq = await FAQ.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!faq) return res.status(404).json({ error: 'FAQ not found.' });
    res.json(faq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/faqs/:id
router.delete('/:id', async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ error: 'FAQ not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
