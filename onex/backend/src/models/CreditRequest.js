import mongoose from 'mongoose';

/**
 * CreditRequest — tracks manual credit top-up requests from clients.
 * Admin reviews and approves/rejects each request.
 */
const CreditRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
      max: 10000,
    },
    // Client-provided note: payment method, transaction ID, Venmo handle, etc.
    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    // Admin's note on approval or rejection
    adminNote: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('CreditRequest', CreditRequestSchema);
