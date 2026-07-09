import User from "../../../models/User.js";
import AdminSettings from "../../../models/AdminSettings.js";
import Post from "../../../models/Post.js";
import cloudinary from "../../../common/utils/cloudinary.js";
import streamifier from "streamifier";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { getAdminAnalytics } from "./adminAnalyticsController.js";

export { getAdminAnalytics };

/* --------------------------- 📊 Get Admin Stats --------------------------- */
export const getStats = async (req, res) => {
  try {
    const [totalUsers, totalAdmins, totalPosts, restrictedAccounts] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      // Lazy import to avoid circular dependencies and keep controller focused.
      (await import("../models/Post.js")).default.countDocuments(),
      User.countDocuments({ roleRestriction: { $in: ["no-posting", "no-comments", "read-only"] } }),
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        totalPosts,
        restrictedAccounts,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching stats:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch stats" });
  }
};

/* --------------------------- ⚙️ Get Admin Settings --------------------------- */
export const getSettings = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = await AdminSettings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    console.error("❌ Error fetching settings:", err);
    res.status(500).json({ success: false, error: "Failed to fetch settings" });
  }
};

/* --------------------- 📢 Get Public Developer Message --------------------- */
export const getPublicDevMessage = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = await AdminSettings.create({});
    }

    return res.json({
      success: true,
      data: {
        devMessage: settings.devMessage || "",
      },
    });
  } catch (err) {
    console.error("❌ Error fetching public dev message:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch developer message" });
  }
};

/* --------------------------- ⚙️ Update Admin Settings --------------------------- */
export const updateSettings = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;
    if (!adminId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const { field, value } = req.body;

    if (field === "roleRestriction") {
      const userId = value?.userId;
      const restriction = value?.restriction;
      const isAllUsers = userId === "__ALL_USERS__";
      const allowedRestrictions = ["no-posting", "no-comments", "read-only"];

      if (!userId || !restriction) {
        return res.status(400).json({ success: false, error: "User and restriction are required" });
      }

      if (!allowedRestrictions.includes(restriction)) {
        return res.status(400).json({ success: false, error: "Invalid restriction value" });
      }

      if (isAllUsers) {
        const result = await User.updateMany(
          { role: { $ne: "admin" } },
          { roleRestriction: restriction }
        );

        return res.json({
          success: true,
          affectedCount: result.modifiedCount,
          appliedRestriction: restriction,
          message: `Restriction applied to all non-admin users: ${restriction}`,
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { roleRestriction: restriction },
        { new: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      return res.json({
        success: true,
        data: updatedUser,
        appliedRestriction: updatedUser.roleRestriction,
        message: `Restriction applied: ${restriction}`,
      });
    }

    if (field === "roleUnrestriction") {
      const userId = value?.userId;
      const isAllUsers = userId === "__ALL_USERS__";

      if (!userId) {
        return res.status(400).json({ success: false, error: "User is required" });
      }

      if (isAllUsers) {
        const result = await User.updateMany(
          { role: { $ne: "admin" } },
          { roleRestriction: "" }
        );

        return res.json({
          success: true,
          affectedCount: result.modifiedCount,
          message: "Restriction removed for all non-admin users",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { roleRestriction: "" },
        { new: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      return res.json({
        success: true,
        data: updatedUser,
        message: "Restriction removed",
      });
    }

    if (field === "suspendUserId") {
      const userId = value;

      if (!userId) {
        return res.status(400).json({ success: false, error: "User is required" });
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { status: "suspended" },
        { new: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      return res.json({
        success: true,
        data: updatedUser,
        message: "User suspended",
      });
    }

    if (field && value !== undefined) {
      req.body[field] = value;
    }

    const {
      siteName,
      maintenanceMode,
      supportEmail,
      maxUploadSize,
      allowedFileTypes,
      customSettings,
      devMessage,
      roleRestriction,
      suspendUserId,
      emailEnabled,
    } = req.body;

    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = await AdminSettings.create({});
    }

    // Update only provided fields
    if (siteName !== undefined) settings.siteName = siteName;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (supportEmail !== undefined) settings.supportEmail = supportEmail;
    if (maxUploadSize !== undefined) settings.maxUploadSize = maxUploadSize;
    if (allowedFileTypes !== undefined) settings.allowedFileTypes = allowedFileTypes;
    if (customSettings !== undefined) settings.customSettings = customSettings;
    if (devMessage !== undefined) settings.devMessage = devMessage;
    if (roleRestriction !== undefined) settings.roleRestriction = roleRestriction;
    if (suspendUserId !== undefined) settings.suspendUserId = suspendUserId;
    if (emailEnabled !== undefined) settings.emailEnabled = emailEnabled;
    if (req.body.visitorCount !== undefined) settings.visitorCount = Number(req.body.visitorCount);

    settings.lastUpdatedBy = adminId;
    await settings.save();

    res.json({ success: true, data: settings, message: "Settings updated" });
  } catch (err) {
    console.error("❌ Error updating settings:", err);
    res.status(500).json({ success: false, error: "Failed to update settings" });
  }
};

/* --------------------------- 🔐 Update Admin Credentials --------------------------- */
export const updateAdminCredentials = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;
    if (!adminId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const { username, currentPassword, newPassword } = req.body;

    // Fetch admin user
    const admin = await User.findById(adminId);
    if (!admin) return res.status(404).json({ success: false, error: "Admin not found" });

    // Verify current password if changing password
    if (newPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword || "", admin.password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, error: "Current password is incorrect" });
      }
      admin.password = await bcrypt.hash(newPassword, 10);
    }

    // Update username if provided
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: adminId } });
      if (existingUser) {
        return res.status(400).json({ success: false, error: "Username already taken" });
      }
      admin.username = username;
    }

    await admin.save();
    res.json({ success: true, message: "Credentials updated" });
  } catch (err) {
    console.error("❌ Error updating credentials:", err);
    res.status(500).json({ success: false, error: "Failed to update credentials" });
  }
};

/* --------------------------- � Get All Users (Admin) --------------------------- */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, data: users });
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
};

/* --------------------------- 🗑️ Delete User (Admin) --------------------------- */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id || req.user?._id;
    // Accept reason from frontend (body or query)
    const reason = req.body?.reason || req.query?.reason || "violation of our terms";

    if (!adminId) return res.status(401).json({ success: false, error: "Unauthorized" });
    if (id === adminId.toString()) {
      return res.status(400).json({ success: false, error: "Cannot delete yourself" });
    }

    // Find user before deleting to get email/username
    const userToDelete = await User.findById(id);
    if (!userToDelete) return res.status(404).json({ success: false, error: "User not found" });

    // Delete all posts by user
    await import("../models/Post.js").then(async ({ default: Post }) => {
      await Post.deleteMany({ userId: id });
    });
    // Delete all comments by user
    await import("../models/Comment.js").then(async ({ default: Comment }) => {
      await Comment.deleteMany({ userId: id });
    });
    // Delete all messages by user (as sender or recipient)
    await import("../models/Message.js").then(async ({ default: Message }) => {
      await Message.deleteMany({ $or: [ { sender: id }, { recipient: id }, { userId: id } ] });
    });
    // Delete user profile
    await import("../models/Profiles.js").then(async ({ default: Profiles }) => {
      await Profiles.deleteMany({ userId: id });
    });
    // Delete conversations where user is a participant
    await import("../models/Conversation.js").then(async ({ default: Conversation }) => {
      await Conversation.deleteMany({ participants: id });
    });

    // Delete user
    await User.findByIdAndDelete(id);

    // Send account deletion email (non-blocking)
    import("../utils/sendAccountDeletionEmail.js").then(({ sendAccountDeletionEmail }) => {
      sendAccountDeletionEmail({
        to: userToDelete.email,
        username: userToDelete.username,
        reason,
      }).catch((err) => console.error("Failed to send account deletion email:", err));
    });

    res.json({ success: true, message: "User and all related data deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ success: false, error: "Failed to delete user" });
  }
};

/* --------------------------- ⭐ Promote User (Admin) --------------------------- */
const PROMO_DURATION_MAP = {
  "24hrs":   1,
  "2days":   2,
  "4days":   4,
  "1week":   7,
  "2weeks":  14,
  "3weeks":  21,
  "monthly": 30,
};

export const promoteUser = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;
    if (!adminId) return res.status(401).json({ success: false, error: "Unauthorized" });

    // Accept new fields for more flexible badge/promo assignment
    const { userId, duration, cancel, badgeType, promoActive } = req.body || {};
    if (!userId || (duration === undefined && badgeType === undefined && promoActive === undefined && !cancel)) {
      return res.status(400).json({ success: false, error: "User and at least one action (duration, badgeType, promoActive, or cancel) are required" });
    }

    // Cancel all promo/badge
    if (cancel) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { badgeType: "", activePromoExpiry: null },
        { new: true }
      ).select("-password");
      if (!updatedUser) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      await Post.updateMany(
        { userId: updatedUser._id },
        { badgeType: "", isPromo: false, promoExpiresAt: null }
      );
      return res.json({
        success: true,
        message: "Promotion and badge cancelled for user.",
        data: updatedUser,
      });
    }

    // Determine badgeType and promo fields to set
    let newBadgeType = badgeType;
    let setPromo = promoActive;
    let promoExpiry = null;
    let promoDurationDays = null;
    if (duration) {
      // If duration is provided, treat as promo
      promoDurationDays = PROMO_DURATION_MAP[duration] || Number(duration);
      if (!Number.isFinite(promoDurationDays) || promoDurationDays < 1) {
        return res.status(400).json({ success: false, error: "Invalid promotion duration" });
      }
      const now = new Date();
      promoExpiry = new Date(now.getTime() + promoDurationDays * 24 * 60 * 60 * 1000);
      setPromo = true;
      // If badgeType not explicitly set, default to 'pink' for promo
      if (!newBadgeType) newBadgeType = "pink";
    }

    // If badgeType is set to 'blue' and promoActive is true, allow both
    // If only badgeType is set, allow just badge
    // If only promoActive is set, allow just promo
    // If both, set both
    const userUpdate = {};
    if (newBadgeType !== undefined) userUpdate.badgeType = newBadgeType;
    if (setPromo) userUpdate.activePromoExpiry = promoExpiry || null;
    if (!setPromo) userUpdate.activePromoExpiry = null;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      userUpdate,
      { new: true }
    ).select("-password");
    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Update posts accordingly
    const postUpdate = {};
    if (newBadgeType !== undefined) postUpdate.badgeType = newBadgeType;
    if (setPromo) {
      postUpdate.isPromo = true;
      postUpdate.promoExpiresAt = promoExpiry || null;
    } else {
      postUpdate.isPromo = false;
      postUpdate.promoExpiresAt = null;
    }
    await Post.updateMany(
      { userId: updatedUser._id },
      postUpdate
    );

    return res.json({
      success: true,
      message: "User badge/promo updated successfully",
      data: {
        updatedUser,
        badgeType: newBadgeType,
        promoActive: !!setPromo,
        promoExpiry,
        promoDurationDays,
      },
    });
  } catch (err) {
    console.error("❌ Error promoting user:", err);
    return res.status(500).json({ success: false, error: "Failed to promote user" });
  }
}

/* --------------------------- ⭐ Promote All Users (Admin) --------------------------- */
export const promoteAllUsers = async (req, res) => {
  try {
    const adminId = req.user?.id || req.user?._id;
    if (!adminId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const { duration } = req.body || {};
    if (!duration) {
      return res.status(400).json({ success: false, error: "Promotion duration is required." });
    }

    const promoDurationDays = PROMO_DURATION_MAP[duration];
    if (!promoDurationDays) {
      return res.status(400).json({ success: false, error: "Invalid promotion duration." });
    }

    const promoExpiry = new Date(Date.now() + promoDurationDays * 24 * 60 * 60 * 1000);

    // Promote all non-admin users
    const userResult = await User.updateMany(
      { role: { $ne: "admin" } },
      { activePromoExpiry: promoExpiry, badgeType: "pink" }
    );

    // Update all posts belonging to non-admin users
    const adminIds = await User.find({ role: "admin" }).distinct("_id");
    await Post.updateMany(
      { userId: { $nin: adminIds } },
      { isPromo: true, promoExpiresAt: promoExpiry, badgeType: "pink" }
    );

    return res.json({
      success: true,
      message: `${userResult.modifiedCount} users promoted for ${promoDurationDays} day(s).`,
      data: { count: userResult.modifiedCount, promoExpiry, promoDurationDays },
    });
  } catch (err) {
    console.error("❌ Error promoting all users:", err);
    return res.status(500).json({ success: false, error: "Failed to promote all users." });
  }
};

/* --------------------------- 🖼 Upload Profile Picture --------------------------- */
/* --------------------------- 🖼 Upload Profile Picture to Cloudinary --------------------------- */
export const uploadProfilePicture = async (req, res) => {
  try {
    console.log("📸 [uploadProfilePicture] Request received");
    console.log("📸 [uploadProfilePicture] req.user:", req.user);
    console.log("📸 [uploadProfilePicture] req.file:", req.file ? { fieldname: req.file.fieldname, size: req.file.size, mimetype: req.file.mimetype } : null);

    const adminId = req.user?.id || req.user?._id;
    console.log("📸 [uploadProfilePicture] adminId:", adminId);

    if (!adminId) {
      console.error("❌ [uploadProfilePicture] No admin ID found");
      return res.status(401).json({ success: false, error: "Unauthorized - no admin ID" });
    }

    if (!req.file) {
      console.error("❌ [uploadProfilePicture] No file uploaded");
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    console.log("📸 [uploadProfilePicture] Starting Cloudinary upload...");

    let responseSent = false;

    // Upload to Cloudinary using the file buffer
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "mystery-mansion/profiles",
        public_id: `admin_${adminId}_profile`,
        overwrite: true,
        resource_type: "auto",
      },
      async (error, result) => {
        if (responseSent) return; // Prevent double response
        responseSent = true;

        if (error) {
          console.error("❌ [uploadProfilePicture] Cloudinary error:", error);
          return res.status(500).json({ success: false, error: `Cloudinary upload failed: ${error.message}` });
        }

        console.log("📸 [uploadProfilePicture] Cloudinary upload success, updating database...");

        try {
          const imageUrl = result.secure_url;
          console.log("📸 [uploadProfilePicture] Image URL:", imageUrl);

          const updatedUser = await User.findByIdAndUpdate(
            adminId,
            { profilePic: imageUrl },
            { new: true }
          ).select("-password");

          if (!updatedUser) {
            console.error("❌ [uploadProfilePicture] Admin user not found");
            return res.status(404).json({ success: false, error: "Admin not found" });
          }

          console.log("📸 [uploadProfilePicture] Database updated successfully");
          res.json({ success: true, url: imageUrl, message: "Profile picture updated" });
        } catch (dbErr) {
          console.error("❌ [uploadProfilePicture] Database error:", dbErr);
          if (!responseSent) {
            responseSent = true;
            res.status(500).json({ success: false, error: `Database error: ${dbErr.message}` });
          }
        }
      }
    );

    // Handle stream errors
    uploadStream.on('error', (error) => {
      console.error("❌ [uploadProfilePicture] Upload stream error:", error);
      if (!responseSent) {
        responseSent = true;
        res.status(500).json({ success: false, error: `Stream error: ${error.message}` });
      }
    });

    // Stream the file buffer to Cloudinary
    console.log("📸 [uploadProfilePicture] Creating read stream and piping to upload stream...");
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (err) {
    console.error("❌ [uploadProfilePicture] Outer catch error:", err);
    res.status(500).json({ success: false, error: `Upload error: ${err.message}` });
  }
};