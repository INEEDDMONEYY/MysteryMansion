import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profilePic: {
      type: String,
      default: "",
    },
    bannerPic: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },
    socialLinks: {
      website: { type: String, trim: true, default: "" },
      instagram: { type: String, trim: true, default: "" },
      x: { type: String, trim: true, default: "" },
      onlyfans: { type: String, trim: true, default: "" },
      youtube: { type: String, trim: true, default: "" },
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
      default: null,
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    gender: {
      type: String,
      enum: ["Man escort", "Woman escort", "TS escort", ""],
      default: "",
    },
    availability: {
      status: {
        type: String,
        maxlength: 100,
        default: "",
      },
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    roleRestriction: {
      type: String,
      enum: ["", "no-posting", "no-comments", "read-only"],
      default: "",
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    // Server-recorded session activity — set on sign-in, on authenticated
    // requests (throttled), and on sign-out. Independent of showLastActive,
    // which only controls whether it's shown publicly.
    lastActiveAt: {
      type: Date,
      default: null,
    },
    lastLogoutAt: {
      type: Date,
      default: null,
    },
    // Consecutive UTC days with any authenticated activity; drives the streak badges.
    activity: {
      lastDay: { type: String, default: null },
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
    },
    // Cached RP total; the RpLedger is the source of truth.
    progression: {
      rp: { type: Number, default: 0 },
      syncedAt: { type: Date, default: null },
      catalogRewardsSyncedAt: { type: Date, default: null },
    },
    /* -------------------- Provider profile details -------------------- */
    catersTo: { type: String, trim: true, maxlength: 120, default: "" },
    bodyType: { type: String, trim: true, maxlength: 60, default: "" },
    height: { type: String, trim: true, maxlength: 40, default: "" },
    weight: { type: String, trim: true, maxlength: 40, default: "" },
    ethnicity: { type: String, trim: true, maxlength: 60, default: "" },
    cupSize: { type: String, trim: true, maxlength: 20, default: "" },
    hairColor: { type: String, trim: true, maxlength: 40, default: "" },
    eyeColor: { type: String, trim: true, maxlength: 40, default: "" },
    tourSchedule: { type: String, trim: true, maxlength: 1000, default: "" },
    activities: { type: [String], default: [] },
    showLastActive: { type: Boolean, default: false },
    // Email opt-outs; see common/utils/notificationPreferences.js. Unset keys
    // are treated as enabled.
    notificationPreferences: {
      promotionalEmails: { type: Boolean, default: true },
      messageEmails: { type: Boolean, default: true },
      accountEngagementEmails: { type: Boolean, default: true },
      milestoneNotifications: { type: Boolean, default: true },
      membershipEmails: { type: Boolean, default: true },
      accountFlaggingEmails: { type: Boolean, default: true },
    },
    forumSettings: {
      type: new mongoose.Schema({
        discussionReplies: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true },
        followedDiscussionNotifications: { type: Boolean, default: true },
        followedCategoryNotifications: { type: Boolean, default: true },
        autoFollowDiscussions: { type: Boolean, default: true },
        digestFrequency: { type: String, enum: ['off', 'daily', 'weekly'], default: 'weekly' },
      }, { _id: false }),
      default: () => ({}),
      select: false,
    },
    forumDigest: {
      type: new mongoose.Schema({
        through: { type: Date, default: null },
        nextAttemptAt: { type: Date, default: null },
        leaseUntil: { type: Date, default: null },
      }, { _id: false }),
      default: () => ({}),
      select: false,
    },
    incallPrice: {
      type: Number,
      default: 0,
    },
    outcallPrice: {
      type: Number,
      default: 0,
    },
    overnightPrice: {
      type: Number,
      default: 0,
    },
    flyOutPrice: {
      type: Number,
      default: 0,
    },
    completedDates: [
      {
        id: {
          type: String,
          default: "",
        },
        date: {
          type: String,
          default: "",
        },
        status: {
          type: String,
          enum: ["incall", "outcall", "overnight", "flyOut", ""],
          default: "",
        },
      },
    ],
    conversations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
      },
    ],

    /* ---------------- 🔐 Password Reset Fields ---------------- */
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    /* -------------------- Promo Expiry -------------------- */
    activePromoExpiry: {
      type: Date,
      default: null,
    },
    lastPromoExpiryReminderFor: {
      type: Date,
      default: null,
    },
    // Badge type: 'pink' (promo), 'blue' (monthly badge), or ''
    badgeType: {
      type: String,
      enum: ["", "pink", "blue"],
      default: "",
    },
    // Promo code-based promotion active
    promoCodeActive: {
      type: Boolean,
      default: false,
    },
    // Credit-purchased blue badge. null expiry + no auto-renew on a blue badge = admin-granted (permanent).
    badgeExpiresAt: {
      type: Date,
      default: null,
    },
    // Monthly blue badge subscription — 50 credits deducted at each badgeExpiresAt.
    badgeAutoRenew: {
      type: Boolean,
      default: false,
    },
    // Account type: provider (escort/advertiser) or client (browser/buyer)
    // Default is "provider" for backwards compatibility — all pre-overhaul
    // users are providers. New signups set this explicitly via the signup form.
    accountType: {
      type: String,
      enum: ["provider", "client"],
      default: "provider",
    },
    // Platform credits (client accounts only — 200 on signup, deducted per message)
    credits: {
      type: Number,
      default: 200,
      min: 0,
    },
    // Elite perk: gradient border colour remembered for new forum threads ('' = default).
    forumBorderColor: {
      type: String,
      default: "",
    },
    // Progression ring color id chosen from the member's perks. Empty means the default purple ring.
    progressionColor: {
      type: String,
      default: "",
    },
    // Referral tracking — the provider whose referral link this account signed up through
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    referralCodeUsed: {
      type: String,
      default: "",
    },
    // Cached timestamp of the user's most recent post — powers inactivity emails.
    lastPostAt: {
      type: Date,
      default: null,
    },
    // Highest inactivity threshold (days) already emailed for; resets to 0 on new post.
    lastInactivityEmailDays: {
      type: Number,
      default: 0,
    },
    // Milestone ids already emailed/notified for — prevents duplicate milestone emails.
    notifiedMilestones: {
      type: [String],
      default: [],
    },
    /* ----------------------------------------------------------- */
  },
  { timestamps: true },
);

UserSchema.virtual("isAdmin").get(function () {
  return this.role === "admin";
});

UserSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.resetPasswordToken; // extra safety
    delete ret.resetPasswordExpires;
    return ret;
  },
});

export default mongoose.model("User", UserSchema);
