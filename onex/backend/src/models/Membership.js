import mongoose from 'mongoose';

export const MEMBERSHIP_TIER_IDS = ['Standard', 'Premium', 'Elite'];
export const MEMBERSHIP_STATUSES = ['active', 'grace', 'expired'];

// One membership per user. "Cancelled" is autoRenew=false on a still-active period.
const MembershipSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    tier: { type: String, enum: MEMBERSHIP_TIER_IDS, required: true },
    status: { type: String, enum: MEMBERSHIP_STATUSES, default: 'active', index: true },
    autoRenew: { type: Boolean, default: true },
    startedAt: { type: Date, default: Date.now },
    currentPeriodStart: { type: Date, default: Date.now },
    renewsAt: { type: Date, required: true, index: true },
    // Set when a renewal charge fails; the backend expires the membership once it passes.
    graceEndsAt: { type: Date, default: null },
    boostsUsed: { type: Number, default: 0 },
    // The renewsAt value the one-week expiry reminder was already sent for.
    expiryReminderFor: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Membership || mongoose.model('Membership', MembershipSchema);
