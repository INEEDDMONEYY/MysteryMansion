import mongoose from 'mongoose';

/**
 * Milestone — admin-authored milestone announcements shown to providers/clients.
 * Drafts can be added, edited, and deleted freely; publishing notifies matching
 * users (single milestone_added notification, or one grouped notification when
 * multiple drafts are published together).
 */
const MilestoneSchema = new mongoose.Schema(
  {
    accountType: {
      type: String,
      enum: ['provider', 'client'],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    sortOrder: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Milestone', MilestoneSchema);
