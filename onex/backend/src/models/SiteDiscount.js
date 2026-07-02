import mongoose from 'mongoose';

const VALID_PERCENTS = [3, 5, 10, 20, 30, 50, 60, 80, 100];

const TIER_LABELS = [
  '1 Week Promotion',
  '2 Weeks Promotion',
  '2 Weeks Promotion + Verification',
  '3 Weeks Promotion',
  '3 Weeks Promotion + Verification',
  'Blue Badge Verification',
];

const siteDiscountSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    discountPercent: {
      type: Number,
      required: true,
      enum: VALID_PERCENTS,
    },
    // empty array = applies to ALL tiers
    targetTiers: {
      type: [String],
      enum: [...TIER_LABELS, ''],
      default: [],
    },
    active: { type: Boolean, default: true, index: true },
    expiresAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export { VALID_PERCENTS, TIER_LABELS };
export default mongoose.model('SiteDiscount', siteDiscountSchema);
