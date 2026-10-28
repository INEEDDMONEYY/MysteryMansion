import mongoose from 'mongoose';

export const MEMBERSHIP_TX_TYPES = [
  'subscribe',
  'upgrade',
  'renew',
  'renew_failed',
  'allocation',
  'cancel',
  'resume',
  'expire',
];

// Audit trail of every membership charge, grant and state change.
const MembershipTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tier: { type: String, required: true },
    type: { type: String, enum: MEMBERSHIP_TX_TYPES, required: true },
    // Coins: negative for charges, positive for allocations, 0 for state changes.
    amount: { type: Number, default: 0 },
    balanceAfter: { type: Number, default: null },
    note: { type: String, default: '', maxlength: 300 },
  },
  { timestamps: true }
);

MembershipTransactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.MembershipTransaction ||
  mongoose.model('MembershipTransaction', MembershipTransactionSchema);
