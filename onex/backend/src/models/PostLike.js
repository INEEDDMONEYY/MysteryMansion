import mongoose from 'mongoose';

const PostLikeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent a user from liking the same post twice
PostLikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export default mongoose.model('PostLike', PostLikeSchema);
