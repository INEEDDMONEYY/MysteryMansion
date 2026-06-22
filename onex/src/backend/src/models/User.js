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
        enum: ["Available", "Not Available", ""],
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
