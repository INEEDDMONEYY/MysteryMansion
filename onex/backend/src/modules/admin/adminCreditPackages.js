import express from 'express';
import CreditPackage from '../../models/CreditPackage.js';

const router = express.Router();

// ── GET /api/admin/credit-packages ───────────────────────────────────────────
// Returns all packages (including inactive) for admin management.
router.get('/', async (req, res) => {
  try {
    const packages = await CreditPackage.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// ── POST /api/admin/credit-packages ──────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, credits, priceCents, description, isPopular, isActive, sortOrder } = req.body;
    if (!name || !credits || priceCents == null) {
      return res.status(400).json({ error: 'name, credits, and priceCents are required.' });
    }
    const pkg = await CreditPackage.create({
      name: String(name).trim(),
      credits: Number(credits),
      priceCents: Number(priceCents),
      description: String(description || '').trim(),
      isPopular: Boolean(isPopular),
      isActive: isActive !== false,
      sortOrder: Number(sortOrder || 0),
    });
    res.status(201).json(pkg);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create package' });
  }
});

// ── PUT /api/admin/credit-packages/:id ───────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { name, credits, priceCents, description, isPopular, isActive, sortOrder } = req.body;
    const update = {};
    if (name       != null) update.name        = String(name).trim();
    if (credits    != null) update.credits      = Number(credits);
    if (priceCents != null) update.priceCents   = Number(priceCents);
    if (description!= null) update.description  = String(description).trim();
    if (isPopular  != null) update.isPopular    = Boolean(isPopular);
    if (isActive   != null) update.isActive     = Boolean(isActive);
    if (sortOrder  != null) update.sortOrder    = Number(sortOrder);

    const pkg = await CreditPackage.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update package' });
  }
});

// ── DELETE /api/admin/credit-packages/:id ────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const pkg = await CreditPackage.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete package' });
  }
});

export default router;
