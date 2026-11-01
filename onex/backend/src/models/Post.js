import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // 'profile' posts showcase the author's profile (avatar, location, prices)
    // in the chosen categories instead of a custom title/description/media.
    postType: {
      type: String,
      enum: ["listing", "profile"],
      default: "listing",
    },
    title: {
      type: String,
      required: function requireTitle() { return this.postType !== "profile"; },
      default: "",
    },
    description: {
      type: String,
      required: function requireDescription() { return this.postType !== "profile"; },
      default: "",
    },
    pictures: [{ type: String }], // <-- Changed to an array for multiple images
    videos: [{ type: String }],
    // Index-aligned with pictures/videos above; used by the frontend as a
    // fallback src if the primary URL fails. Pictures upload to Cloudinary
    // with a Cloudflare R2 backup copy here; videos upload directly to R2
    // (no Cloudinary), so their backup entry is normally empty.
    pictureBackups: [{ type: String, default: "" }],
    videoBackups: [{ type: String, default: "" }],
    // Normalized via common/utils/locationNormalizer (Title Case city, full
    // state/province name, canonical country) so location filters match.
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },
    gender: {
      type: String,
      enum: ["", "female", "male", "ts"],
      default: "",
    },
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
    // Membership boost: the listing ranks first until this time.
    boostedUntil: {
      type: Date,
      default: null,
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

PostSchema.index({ state: 1, city: 1, createdAt: -1 });
PostSchema.index({ country: 1, createdAt: -1 });
PostSchema.index({ userId: 1, postType: 1 });

export default mongoose.model("Post", PostSchema);
