import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  followerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  followedId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  following: { type: Boolean, required: true },
}, { timestamps: true });

schema.index({ followerId: 1, followedId: 1 }, { unique: true });
schema.index({ followedId: 1, following: 1 });

export default mongoose.models.UserFollow || mongoose.model('UserFollow', schema);
