import mongoose from "mongoose";
import { AttachmentSchema } from "./AttachmentSchema.js";

const CommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      // An image-only comment is allowed.
      required: function requiresText() {
        return !this.attachments?.length;
      },
      trim: true,
      maxlength: 1200,
      default: "",
    },
    attachments: { type: [AttachmentSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", CommentSchema);
