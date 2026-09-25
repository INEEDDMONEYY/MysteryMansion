import mongoose from "mongoose";

const ReferralSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    clickCount: { type: Number, default: 0 },
    signupCount: { type: Number, default: 0 },
    lastClickedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Referral", ReferralSchema);
