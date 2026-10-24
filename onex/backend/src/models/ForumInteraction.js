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
