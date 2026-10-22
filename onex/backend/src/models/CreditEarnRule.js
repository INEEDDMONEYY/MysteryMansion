import mongoose from 'mongoose';

export const EARN_ROLES = ['provider', 'client', 'admin'];

/**
 * CreditEarnRule — one way to earn credits (e.g. daily login, publishing a post).
 * Built-in rules are seeded from EVENT_DEFINITIONS in creditEarnService.js and are
 * switched on/off and tuned by admins; custom rules are created in the admin UI.
 */
const CreditEarnRuleSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9_]{3,40}$/,
    },
    label: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    credits: { type: Number, required: true, min: 1, max: 10000 },
    // Account types that can earn from this rule. Admins can always earn.
    roles: {
      type: [{ type: String, enum: EARN_ROLES }],
      default: ['provider', 'client'],
    },
    // 0 = unlimited
    limitPerDay: { type: Number, default: 0, min: 0, max: 1000 },
    lifetimeLimit: { type: Number, default: 0, min: 0, max: 100000 },
    // 'automatic' = awarded by app code calling awardCredits(); 'manual' = admin grants it
    trigger: { type: String, enum: ['automatic', 'manual'], default: 'automatic' },
    isActive: { type: Boolean, default: false },
    // Built-in rules cannot be deleted
    isSystem: { type: Boolean, default: false },
    notify: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.CreditEarnRule ||
  mongoose.model('CreditEarnRule', CreditEarnRuleSchema);
