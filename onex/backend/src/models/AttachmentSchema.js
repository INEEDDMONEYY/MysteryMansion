import mongoose from 'mongoose';

// Image/GIF uploaded with a comment, forum thread or forum reply.
export const AttachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    key: { type: String, required: true },
    kind: { type: String, enum: ['image', 'gif'], required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, default: 0 },
  },
  { _id: false }
);

export const serializeAttachments = (attachments = []) =>
  attachments.map((a) => ({ url: a.url, kind: a.kind, mimeType: a.mimeType, size: a.size }));
