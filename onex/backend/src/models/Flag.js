import mongoose from 'mongoose';

export const FLAG_STATUSES = [
  'pending',
  'investigating',
  'action_taken',
  'resolved',
  'dismissed',
];

export const FLAG_REASON_IDS = {
  post: ['spam', 'scam', 'fake', 'misleading', 'other'],
  user: ['fake-profile', 'spam', 'scam', 'harassment', 'inappropriate', 'other'],
};

const TimelineEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: FLAG_STATUSES, required: true },
    // Shown to the reporter — keep it free of internal details.
    message: { type: String, trim: true, maxlength: 1000, default: '' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const FlagSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetType: { type: String, enum: ['post', 'user'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    // Account being reported: the post owner for posts, the user itself for users.
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    reason: { type: String, required: true, trim: true },
    details: { type: String, trim: true, maxlength: 1000, default: '' },
    status: { type: String, enum: FLAG_STATUSES, default: 'pending', index: true },
    timeline: { type: [TimelineEntrySchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Flag || mongoose.model('Flag', FlagSchema);
