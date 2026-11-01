import mongoose from "mongoose";

// A provider's personal media library (images/videos) shown in their profile gallery.
const UserMediaSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    mediaType: { type: String, enum: ["image", "video"], required: true },
    mimeType: { type: String, default: "" },
    originalName: { type: String, trim: true, maxlength: 255, default: "" },
    sizeBytes: { type: Number, default: 0 },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    duration: { type: Number, default: null },
    thumbnailUrl: { type: String, default: "" },
    showOnProfile: { type: Boolean, default: true },
  },
  { timestamps: true },
);

UserMediaSchema.index({ userId: 1, showOnProfile: 1, createdAt: -1 });

export default mongoose.model("UserMedia", UserMediaSchema);
