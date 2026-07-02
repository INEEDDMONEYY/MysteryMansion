import Banner from '../../models/Banner.js';

/* ── Public: active banners (not expired) ── */
export const getActiveBanners = async (req, res) => {
  try {
    const now = new Date();
    const banners = await Banner.find({
      active: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch banners' });
  }
};

/* ── Admin: all banners ── */
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch banners' });
  }
};

/* ── Admin: create ── */
export const createBanner = async (req, res) => {
  try {
    const { title, message, type, expiresAt } = req.body;
    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({ success: false, error: 'Title and message are required' });
    }
    const banner = await Banner.create({
      title: title.trim(),
      message: message.trim(),
      type: type || 'info',
      expiresAt: expiresAt || null,
      createdBy: req.user?._id,
    });
    res.status(201).json({ success: true, data: banner });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create banner' });
  }
};

/* ── Admin: toggle active ── */
export const toggleBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, error: 'Banner not found' });
    banner.active = !banner.active;
    await banner.save();
    res.json({ success: true, data: banner });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to toggle banner' });
  }
};

/* ── Admin: delete ── */
export const deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete banner' });
  }
};
