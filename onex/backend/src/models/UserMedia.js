import mongoose from "mongoose";

// A provider's personal media library (images/videos) shown in their profile gallery.
const UserMediaSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    url: { type: String, required: true },
    // Cloudinary public_id when storage is "cloudinary"; the R2 object key when "r2".
    publicId: { type: String, required: true },
    storage: { type: String, enum: ["cloudinary", "r2"], default: "cloudinary" },
    backupUrl: { type: String, default: "" },
    backupKey: { type: String, default: "" },
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
