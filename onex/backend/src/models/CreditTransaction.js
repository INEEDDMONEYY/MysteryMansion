import mongoose from 'mongoose';

/**
 * CreditTransaction — ledger of credits earned or granted.
 * refId identifies the thing that earned the credits (post id, review id, a date for
 * daily login) so the same event can never be paid twice.
 */
const CreditTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ruleKey: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, default: 0 },
    refId: { type: String, default: '' },
    source: { type: String, enum: ['earn', 'admin_grant'], default: 'earn' },
    grantedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    note: { type: String, trim: true, maxlength: 300, default: '' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

CreditTransactionSchema.index(
  { userId: 1, ruleKey: 1, refId: 1 },
  { unique: true, partialFilterExpression: { refId: { $gt: '' } } }
);
CreditTransactionSchema.index({ userId: 1, ruleKey: 1, createdAt: -1 });

export default mongoose.models.CreditTransaction ||
  mongoose.model('CreditTransaction', CreditTransactionSchema);
