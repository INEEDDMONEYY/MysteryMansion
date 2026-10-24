import mongoose from 'mongoose';
import { AttachmentSchema } from './AttachmentSchema.js';

const ForumReplySchema = new mongoose.Schema(
  {
    threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumThread', required: true, index: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: {
      type: String,
      // An image-only reply is allowed.
      required: function requiresContent() {
        return !this.attachments?.length && !this.isDeleted;
      },
      trim: true,
      maxlength: 5000,
      default: '',
    },
    attachments: { type: [AttachmentSchema], default: [] },
    parentReplyId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumReply', default: null },
    upvoteCount: { type: Number, default: 0 },
    // Soft delete keeps nested replies attached to their parent.
    isDeleted: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.ForumReply ||
  mongoose.model('ForumReply', ForumReplySchema);
