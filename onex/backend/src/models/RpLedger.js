import mongoose from 'mongoose';

// One row per rewarded event. The unique (userId, eventKey) index makes awards idempotent.
const RpLedgerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventKey: { type: String, required: true, trim: true, maxlength: 160 },
    category: { type: String, required: true, trim: true, maxlength: 40 },
    label: { type: String, trim: true, maxlength: 120, default: '' },
    points: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);
RpLedgerSchema.index({ userId: 1, eventKey: 1 }, { unique: true });
RpLedgerSchema.index({ userId: 1, category: 1 });

export const RpLedger = mongoose.models.RpLedger || mongoose.model('RpLedger', RpLedgerSchema);
