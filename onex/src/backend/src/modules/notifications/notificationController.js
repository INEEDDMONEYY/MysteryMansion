import Notification from '../../models/Notification.js';

// ── helpers ──────────────────────────────────────────────────────────────────

export async function createNotification({ audience, type, title, message, userId = null, meta = {} }) {
  return Notification.create({ audience, type, title, message, userId, meta });
}

// ── GET /api/notifications  (admin bell) ─────────────────────────────────────
export const getAdminNotifications = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const notifications = await Notification.find({ audience: 'admin' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    const unreadCount = await Notification.countDocuments({ audience: 'admin', read: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── PATCH /api/notifications/read-all  (admin mark all read) ─────────────────
export const markAdminAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ audience: 'admin', read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── PATCH /api/notifications/:id/read ────────────────────────────────────────
export const markOneRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/notifications/user  (user bell) ─────────────────────────────────
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const notifications = await Notification.find({
      audience: 'user',
      userId,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    const unreadCount = await Notification.countDocuments({ audience: 'user', userId, read: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── PATCH /api/notifications/user/read-all ────────────────────────────────────
export const markUserAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { audience: 'user', userId: req.user._id, read: false },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
