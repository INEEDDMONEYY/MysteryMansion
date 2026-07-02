import mongoose from 'mongoose';

/**
 * EmailVerification
 * Stores a hashed one-time code for email address verification during signup.
 *
 * Rate-limit fields (enforced in the controller):
 *   sendCount   – how many codes have been sent in the current window
 *   windowStart – start of the current 60-minute send window
 *   lastSentAt  – timestamp of the most recent send (60-second resend cooldown)
 *   attempts    – how many times a wrong code was submitted (burn after 5)
 *
 * The TTL index on expiresAt lets MongoDB auto-delete records after expiry.
 */
const schema = new mongoose.Schema(
  {
    email:       { type: String, required: true, lowercase: true, index: true },
    codeHash:    { type: String, required: true },
    expiresAt:   { type: Date,   required: true },
    sendCount:   { type: Number, default: 1 },
    windowStart: { type: Date,   default: Date.now },
    lastSentAt:  { type: Date,   default: Date.now },
    attempts:    { type: Number, default: 0 },
    verified:    { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Auto-delete documents 1 hour after their expiresAt
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

export default mongoose.model('EmailVerification', schema);
