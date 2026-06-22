import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    pictures: [{ type: String }], // <-- Changed to an array for multiple images
    videos: [{ type: String }],
    city: { type: String },
    state: { type: String },
    country: { type: String },
    category: { type: String, default: "" },
    categories: {
      type: [{ type: String, trim: true }],
      default: ["uncategorized"],
    },
    visibility: {
      type: String,
      enum: ["Men", "Women", "Both"],
      default: "Both",
    },
    acknowledgedPayment: {
      type: Boolean,
      default: false,
    },
    isPromo: {
      type: Boolean,
      default: false,
    },
    promoExpiresAt: {
      type: Date,
      default: null,
    },
    // Badge type for post: 'pink' (promo), 'blue' (monthly badge), or ''
    badgeType: {
      type: String,
      enum: ["", "pink", "blue"],
      default: "",
    },
    // Promo code-based promotion active
    promoCodeActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // ✅ Automatically adds createdAt and updatedAt
);

export default mongoose.model("Post", PostSchema);
