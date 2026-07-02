import mongoose from 'mongoose';

/**
 * CreditPackage — defines the pricing tiers displayed to clients.
 * Admin creates/edits these; clients see them when purchasing credits.
 */
const CreditPackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
    },
    // Price in USD cents (e.g. 999 = $9.99) — avoids floating-point issues
    priceCents: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 120,
      default: '',
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('CreditPackage', CreditPackageSchema);
