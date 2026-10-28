import mongoose from 'mongoose';
import { AttachmentSchema } from './AttachmentSchema.js';

const ForumThreadSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    content: { type: String, required: true, trim: true, maxlength: 10000 },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumCategory', required: true, index: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tags: { type: [{ type: String, trim: true, lowercase: true, maxlength: 24 }], default: [] },
    attachments: { type: [AttachmentSchema], default: [] },
    // Gradient border chosen with the Elite perk ('' = default).
    borderColor: { type: String, default: '' },
    pinned: { type: Boolean, default: false },
    // True when a member pinned their own thread with a membership perk (admin pins stay put).
    pinnedByMember: { type: Boolean, default: false },
    // Membership boost: ranks above unboosted threads until this time.
    boostedUntil: { type: Date, default: null, index: true },
    locked: { type: Boolean, default: false },
    archived: { type: Boolean, default: false, index: true },
    viewCount: { type: Number, default: 0 },
    replyCount: { type: Number, default: 0 },
    // Net vote score (upvotes minus downvotes)
    upvoteCount: { type: Number, default: 0 },
    lastActivityAt: { type: Date, default: Date.now, index: true },
    solutionReplyId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumReply', default: null },
  },
  { timestamps: true }
);

export default mongoose.models.ForumThread ||
  mongoose.model('ForumThread', ForumThreadSchema);
