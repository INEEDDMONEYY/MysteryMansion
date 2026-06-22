import mongoose from "mongoose";

const PromotionRequestSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tier: { type: String, required: true },
    transactionId: { type: String },
    paymentProofUrl: { type: String }, // for screenshot uploads (optional)
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("PromotionRequest", PromotionRequestSchema);
