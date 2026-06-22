// models/AdminSettings.js
import mongoose from "mongoose";

const AdminSettingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: "Mystery Mansion",
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    supportEmail: {
      type: String,
      default: "fantometechnologies@gmail.com",
    },
    maxUploadSize: {
      type: Number,
      default: 10, // MB
    },
    allowedFileTypes: {
      type: [String],
      default: ["jpg", "png", "pdf"],
    },
    customSettings: {
      type: Map,
      of: String,
      default: {},
    },
    devMessage: {
      type: String,
      default:
        "Respect all members on the platform, post often to get rewarded 🌟",
    },
    roleRestriction: {
      type: String,
      default: "",
    },
    suspendUserId: {
      type: String,
      default: "",
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    emailEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ✅ Avoid model overwrite error in development or hot reload
export default
  mongoose.models.AdminSettings ||
  mongoose.model("AdminSettings", AdminSettingsSchema);
