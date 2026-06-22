import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    // 'admin' = visible in admin bell | 'user' = visible in user bell
    audience: {
      type: String,
      enum: ['admin', 'user'],
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['new_signup', 'new_comment', 'new_review', 'welcome', 'browse_peak', 'new_message', 'promo_approved', 'promo_expiring', 'account_restricted'],
      required: true,
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    // For user notifications — which user it belongs to (null = all admins)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    // Extra metadata (e.g. the new user's id for new_signup)
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Compound index for fast unread queries
notificationSchema.index({ audience: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model('Notification', notificationSchema);
