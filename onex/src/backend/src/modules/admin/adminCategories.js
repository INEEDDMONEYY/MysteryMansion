import express from 'express';
import Category from '../../models/Category.js';

const router = express.Router();

// GET /api/admin/categories — all (active + inactive)
router.get('/', async (req, res) => {
  try {
    const cats = await Category.find().sort({ sortOrder: 1, name: 1 }).lean();
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/categories — create
router.post('/', async (req, res) => {
  try {
    const { name, sortOrder, isActive } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required.' });
    const existing = await Category.findOne({ name: { $regex: `^${name.trim()}$`, $options: 'i' } });
    if (existing) return res.status(409).json({ error: 'A category with that name already exists.' });
    const cat = await Category.create({
      name: name.trim(),
      sortOrder: sortOrder ?? 0,
      isActive: isActive !== false,
    });
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/categories/:id — update
router.put('/:id', async (req, res) => {
  try {
    const { name, sortOrder, isActive } = req.body;
    const update = {};
    if (name    !== undefined) update.name      = name.trim();
    if (sortOrder !== undefined) update.sortOrder = sortOrder;
    if (isActive !== undefined) update.isActive  = isActive;
    const cat = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!cat) return res.status(404).json({ error: 'Category not found.' });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Category not found.' });
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
