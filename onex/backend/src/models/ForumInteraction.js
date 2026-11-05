import mongoose from 'mongoose';

const TARGET_TYPES = ['thread', 'reply'];

const VoteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: TARGET_TYPES, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    value: { type: Number, enum: [1, -1], required: true },
  },
  { timestamps: true }
);
VoteSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

const BookmarkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: TARGET_TYPES, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);
BookmarkSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

export const ForumVote = mongoose.models.ForumVote || mongoose.model('ForumVote', VoteSchema);
export const ForumBookmark =
  mongoose.models.ForumBookmark || mongoose.model('ForumBookmark', BookmarkSchema);

const FollowSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumThread', required: true },
    following: { type: Boolean, default: true },
    notificationsEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);
FollowSchema.index({ userId: 1, threadId: 1 }, { unique: true });
FollowSchema.index({ threadId: 1, notificationsEnabled: 1 });

export const ForumFollow = mongoose.models.ForumFollow || mongoose.model('ForumFollow', FollowSchema);

const CategoryFollowSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumCategory', required: true },
}, { timestamps: true });
CategoryFollowSchema.index({ userId: 1, categoryId: 1 }, { unique: true });
export const ForumCategoryFollow = mongoose.models.ForumCategoryFollow ||
  mongoose.model('ForumCategoryFollow', CategoryFollowSchema);
