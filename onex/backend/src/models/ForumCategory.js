import mongoose from 'mongoose';

export const FORUM_CATEGORY_STATUSES = ['approved', 'pending', 'rejected', 'archived'];

const ForumCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    // User-suggested categories stay 'pending' until an admin approves them.
    status: { type: String, enum: FORUM_CATEGORY_STATUSES, default: 'pending', index: true },
    source: { type: String, enum: ['admin', 'user'], default: 'admin' },
    sortOrder: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export default mongoose.models.ForumCategory ||
  mongoose.model('ForumCategory', ForumCategorySchema);
