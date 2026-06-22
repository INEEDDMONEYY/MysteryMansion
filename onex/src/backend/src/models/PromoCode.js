import mongoose from "mongoose";

const PromoRedemptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    redeemedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false },
);

const PromoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1,
    },
    maxUses: {
      type: Number,
      required: true,
      min: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    redemptions: {
      type: [PromoRedemptionSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("PromoCode", PromoCodeSchema);