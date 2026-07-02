import SiteDiscount, { VALID_PERCENTS, TIER_LABELS } from '../../models/SiteDiscount.js';

/* ── Public: active discounts ── */
export const getActiveDiscounts = async (req, res) => {
  try {
    const now = new Date();
    const discounts = await SiteDiscount.find({
      active: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    }).sort({ discountPercent: -1 });
    res.json({ success: true, data: discounts });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch discounts' });
  }
};

/* ── Admin: all discounts ── */
export const getAllDiscounts = async (req, res) => {
  try {
    const discounts = await SiteDiscount.find().sort({ createdAt: -1 });
    res.json({ success: true, data: discounts, meta: { validPercents: VALID_PERCENTS, tierLabels: TIER_LABELS } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch discounts' });
  }
};

/* ── Admin: create ── */
export const createDiscount = async (req, res) => {
  try {
    const { label, discountPercent, targetTiers, expiresAt } = req.body;

    if (!label?.trim()) {
      return res.status(400).json({ success: false, error: 'Label is required' });
    }
    if (!VALID_PERCENTS.includes(Number(discountPercent))) {
      return res.status(400).json({ success: false, error: `Discount must be one of: ${VALID_PERCENTS.join(', ')}` });
    }

    const discount = await SiteDiscount.create({
      label: label.trim(),
      discountPercent: Number(discountPercent),
      targetTiers: Array.isArray(targetTiers) ? targetTiers : [],
      expiresAt: expiresAt || null,
      createdBy: req.user?._id,
    });
    res.status(201).json({ success: true, data: discount });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create discount' });
  }
};

/* ── Admin: toggle active ── */
export const toggleDiscount = async (req, res) => {
  try {
    const discount = await SiteDiscount.findById(req.params.id);
    if (!discount) return res.status(404).json({ success: false, error: 'Discount not found' });
    discount.active = !discount.active;
    await discount.save();
    res.json({ success: true, data: discount });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to toggle discount' });
  }
};

/* ── Admin: delete ── */
export const deleteDiscount = async (req, res) => {
  try {
    await SiteDiscount.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete discount' });
  }
};
