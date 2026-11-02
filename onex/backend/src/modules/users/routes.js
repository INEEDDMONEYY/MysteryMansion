//User routes file
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import bcrypt from "bcrypt";
import streamifier from "streamifier";
import cloudinary from "../../common/utils/cloudinary.js";
import { uploadBackupCopy, deleteBackupCopy, backupStorageEnabled } from "../../common/utils/backupStorage.js";
import User from "../../models/User.js";
import Post from "../../models/Post.js";
import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";
import Review from "../../models/Review.js";
import Profile from "../../models/Profiles.js";
import PromoCode from "../../models/PromoCode.js";
import Comment from "../../models/Comment.js";
import AnalyticsEvent from "../../models/AnalyticsEvent.js";
import UserMedia from "../../models/UserMedia.js";
import { getLikedPosts } from "../posts/controllers/postLikeController.js";
import { enforceRestriction } from "../../common/middleware/restrictionMiddleware.js";
import { authMiddleware } from "../../common/middleware/authMiddleware.js";
import { allowEmail } from "../../common/utils/emailRateLimiter.js";
import {
  NOTIFICATION_PREFERENCE_KEYS,
  resolveNotificationPreferences,
} from "../../common/utils/notificationPreferences.js";

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);
const looksLikeEmail = (value = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

// ✅ Multer setup — memory storage (no temp files on disk, safe on ephemeral filesystems like Render)
const upload = multer({ storage: multer.memoryStorage() });

// Helper: upload a Buffer to Cloudinary via upload_stream
const uploadBufferToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });

// Only these member-editable fields are accepted by /update-profile. Anything
// else (role, credits, badges, status, restrictions, promo/referral data…)
// is dropped so a crafted request can't escalate privileges.
const PROFILE_TEXT_LIMITS = { bio: 500, phoneNumber: 30, location: 120 };
const SOCIAL_LINK_KEYS = ["website", "instagram", "x", "onlyfans", "youtube"];
const PRICE_FIELDS = ["incallPrice", "outcallPrice", "overnightPrice", "flyOutPrice"];
const COMPLETED_DATE_STATUSES = new Set(["incall", "outcall", "overnight", "flyOut", ""]);
const MAX_COMPLETED_DATES = 500;
const MIN_PASSWORD_LENGTH = 6; // matches the reset-password page rule

class ProfileInputError extends Error {}

// multipart/form-data sends JSON-ish values as strings.
const parseMaybeJson = (value) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const pickProfileUpdates = (body = {}) => {
  const update = {};

  for (const [field, max] of Object.entries(PROFILE_TEXT_LIMITS)) {
    if (body[field] === undefined) continue;
    if (body[field] !== null && typeof body[field] !== "string") {
      throw new ProfileInputError(`${field} must be text.`);
    }
    update[field] = String(body[field] ?? "").trim().slice(0, max);
  }

  if (body.gender !== undefined) update.gender = String(body.gender ?? "").trim();

  if (body.age !== undefined) {
    const age = body.age === null || body.age === "" ? null : Number(body.age);
    if (age !== null && !Number.isFinite(age)) throw new ProfileInputError("Age must be a number.");
    update.age = age;
  }

  for (const field of PRICE_FIELDS) {
    if (body[field] === undefined) continue;
    const price = Number(body[field]);
    if (!Number.isFinite(price) || price < 0) {
      throw new ProfileInputError(`${field} must be a positive number.`);
    }
    update[field] = price;
  }

  const availability = parseMaybeJson(body.availability);
  if (availability !== undefined) {
    update["availability.status"] = String(availability?.status ?? "").trim();
  }

  const socialLinks = parseMaybeJson(body.socialLinks);
  if (socialLinks !== undefined) {
    if (!socialLinks || typeof socialLinks !== "object") {
      throw new ProfileInputError("socialLinks must be an object.");
    }
    for (const key of SOCIAL_LINK_KEYS) {
      if (socialLinks[key] === undefined) continue;
      update[`socialLinks.${key}`] = String(socialLinks[key] ?? "").trim().slice(0, 300);
    }
  }

  const completedDates = parseMaybeJson(body.completedDates);
  if (completedDates !== undefined) {
    if (!Array.isArray(completedDates)) {
      throw new ProfileInputError("completedDates must be a list.");
    }
    update.completedDates = completedDates.slice(0, MAX_COMPLETED_DATES).map((entry) => {
      const status = String(entry?.status ?? "");
      if (!COMPLETED_DATE_STATUSES.has(status)) {
        throw new ProfileInputError("Invalid completed date status.");
      }
      return {
        id: String(entry?.id ?? "").slice(0, 100),
        date: String(entry?.date ?? "").slice(0, 40),
        status,
      };
    });
  }

  return update;
};

// ✅ Update-profile route with Cloudinary integration
router.post("/update-profile", enforceRestriction("profile:update"), upload.fields([
  { name: "profilePic", maxCount: 1 },
  { name: "bannerPic", maxCount: 1 },
]), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized - no user" });
    }

    const body = req.body || {};
    let updateData;
    try {
      updateData = pickProfileUpdates(body);
    } catch (err) {
      if (err instanceof ProfileInputError) return res.status(400).json({ error: err.message });
      throw err;
    }
    if (body.username !== undefined) updateData.username = body.username;
    if (body.email !== undefined) updateData.email = body.email;

    if (body.password !== undefined) {
      if (typeof body.password !== "string" || body.password.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({
          error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        });
      }
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    const profilePicFile = req.files?.profilePic?.[0] || null;
    const bannerPicFile = req.files?.bannerPic?.[0] || null;

    if (updateData.username !== undefined && typeof updateData.username !== "string") {
      return res.status(400).json({ error: "Username must be text" });
    }
    if (updateData.email !== undefined && typeof updateData.email !== "string") {
      return res.status(400).json({ error: "Email must be text" });
    }

    if (typeof updateData.username === "string") {
      const normalizedUsername = updateData.username.trim();
      if (!normalizedUsername) {
        return res.status(400).json({ error: "Username cannot be empty" });
      }
      if (looksLikeEmail(normalizedUsername)) {
        return res.status(400).json({ error: "Username cannot be an email address" });
      }

      const existingUser = await User.findOne({
        username: { $regex: `^${normalizedUsername.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
        _id: { $ne: req.user._id },
      }).select("_id");

      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }

      updateData.username = normalizedUsername;
    }

    if (typeof updateData.email === "string") {
      const normalizedEmail = updateData.email.trim().toLowerCase();
      if (!normalizedEmail) {
        return res.status(400).json({ error: "Email cannot be empty" });
      }
      if (!looksLikeEmail(normalizedEmail)) {
        return res.status(400).json({ error: "Please provide a valid email address" });
      }

      const existingEmail = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.user._id },
      }).select("_id");

      if (existingEmail) {
        return res.status(409).json({ error: "Email already registered" });
      }

      updateData.email = normalizedEmail;
    }

    // ✅ Handle profilePic upload if file is present
    if (profilePicFile) {
      console.log("🔹 [UserRoutes] Uploading profilePic to Cloudinary...");
      const result = await uploadBufferToCloudinary(profilePicFile.buffer, "profile_pics");
      updateData.profilePic = result.secure_url; // ✅ hosted Cloudinary URL
    }

    // ✅ Handle bannerPic upload if file is present
    if (bannerPicFile) {
      console.log("🔹 [UserRoutes] Uploading bannerPic to Cloudinary...");
      const result = await uploadBufferToCloudinary(bannerPicFile.buffer, "profile_banners");
      updateData.bannerPic = result.secure_url;
    }

    // ✅ Perform update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No editable profile fields were provided" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!updatedUser) {
      console.error("❌ [UserRoutes] User not found in DB for id:", req.user._id);
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    if (err?.name === "ValidationError" || err?.name === "CastError") {
      return res.status(400).json({ error: err.message });
    }
    console.error("🚨 [UserRoutes] Error updating profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ── Email notification preferences ──────────────────────────────────────────
router.get("/me/notification-preferences", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("notificationPreferences").lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ preferences: resolveNotificationPreferences(user.notificationPreferences) });
  } catch (err) {
    console.error("❌ GET /users/me/notification-preferences:", err);
    res.status(500).json({ error: "Failed to load notification preferences" });
  }
});

router.patch("/me/notification-preferences", async (req, res) => {
  try {
    const body = req.body || {};
    const update = {};

    for (const key of NOTIFICATION_PREFERENCE_KEYS) {
      if (body[key] === undefined) continue;
      if (typeof body[key] !== "boolean") {
        return res.status(400).json({ error: `${key} must be true or false.` });
      }
      update[`notificationPreferences.${key}`] = body[key];
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "No notification preferences were provided." });
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true })
      .select("notificationPreferences")
      .lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      message: "Notification preferences saved",
      preferences: resolveNotificationPreferences(user.notificationPreferences),
    });
  } catch (err) {
    console.error("❌ PATCH /users/me/notification-preferences:", err);
    res.status(500).json({ error: "Failed to save notification preferences" });
  }
});

// ── Reveal a provider's contact details (signed-in members only) ────────────
// Public APIs only send masked previews; this is the sole way to read the real
// phone/email. Rate-limited per viewer to make bulk scraping impractical.
const CONTACT_REVEAL_LIMIT = 60;
const CONTACT_REVEAL_WINDOW_MS = 60 * 60 * 1000;

router.get("/contact/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const viewerId = String(req.user._id);
    const isSelf = viewerId === String(userId);
    if (
      !isSelf &&
      !allowEmail(`contact-reveal:${viewerId}`, {
        limit: CONTACT_REVEAL_LIMIT,
        windowMs: CONTACT_REVEAL_WINDOW_MS,
      })
    ) {
      return res.status(429).json({ error: "Too many contact requests. Please try again later." });
    }

    const target = await User.findById(userId)
      .select("phoneNumber email role accountType status")
      .lean();
    // Admin and client contact details are never shown on public pages.
    if (
      !target ||
      target.status === "suspended" ||
      (!isSelf && (target.role === "admin" || target.accountType === "client"))
    ) {
      return res.status(404).json({ error: "Contact details not available" });
    }

    res.json({
      phoneNumber: target.phoneNumber || "",
      email: target.email || "",
    });
  } catch (err) {
    console.error("❌ GET /users/contact/:userId:", err);
    res.status(500).json({ error: "Failed to load contact details" });
  }
});

// ── Provider profile details ────────────────────────────────────────────────
// Whitelisted so this endpoint can never touch credits, role, badges, etc.
const PROFILE_DETAIL_LIMITS = {
  catersTo: 120,
  bodyType: 60,
  height: 40,
  weight: 40,
  ethnicity: 60,
  cupSize: 20,
  hairColor: 40,
  eyeColor: 40,
  tourSchedule: 1000,
};
const MAX_ACTIVITIES = 30;
const MAX_ACTIVITY_LENGTH = 80;

router.patch("/me/profile-details", enforceRestriction("profile:update"), async (req, res) => {
  try {
    const body = req.body || {};
    const update = {};

    for (const [field, max] of Object.entries(PROFILE_DETAIL_LIMITS)) {
      if (body[field] === undefined) continue;
      if (body[field] !== null && typeof body[field] !== "string") {
        return res.status(400).json({ error: `${field} must be text.` });
      }
      update[field] = String(body[field] ?? "").trim().slice(0, max);
    }

    if (body.activities !== undefined) {
      if (!Array.isArray(body.activities)) {
        return res.status(400).json({ error: "activities must be a list." });
      }
      const seen = new Set();
      update.activities = body.activities
        .map((a) => String(a ?? "").trim().slice(0, MAX_ACTIVITY_LENGTH))
        .filter((a) => {
          const key = a.toLowerCase();
          if (!a || seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, MAX_ACTIVITIES);
    }

    if (body.showLastActive !== undefined) {
      update.showLastActive = Boolean(body.showLastActive);
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true, runValidators: true })
      .select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "Profile details updated", user });
  } catch (err) {
    console.error("❌ PATCH /users/me/profile-details:", err);
    res.status(500).json({ error: "Failed to update profile details" });
  }
});

// ── Provider media library ──────────────────────────────────────────────────
const MAX_MEDIA_BYTES = 100 * 1024 * 1024; // 100 MB per file (videos)
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_MEDIA_PER_USER = 200;

const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MEDIA_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (/^(image|video)\//.test(file.mimetype)) return cb(null, true);
    cb(new Error("Only image and video files are allowed."));
  },
});

const serializeMedia = (m) => ({
  _id: String(m._id),
  url: m.url,
  backupUrl: m.backupUrl || "",
  mediaType: m.mediaType,
  mimeType: m.mimeType,
  originalName: m.originalName,
  sizeBytes: m.sizeBytes,
  width: m.width,
  height: m.height,
  duration: m.duration,
  thumbnailUrl: m.thumbnailUrl,
  showOnProfile: m.showOnProfile,
  createdAt: m.createdAt,
});

// Images only — videos are stored on Cloudflare R2 because Cloudinary's
// moderation has been flagging/removing legitimate provider videos.
const uploadImageToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    let settled = false;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      fn(value);
    };
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "user_media", resource_type: "image", timeout: 120000 },
      (err, result) => (err ? finish(reject, err) : finish(resolve, result)),
    );
    // Without these listeners a dropped connection mid-upload surfaces as an
    // unhandled stream error, which takes the whole server process down.
    uploadStream.on("error", (err) => finish(reject, err));
    const source = streamifier.createReadStream(buffer);
    source.on("error", (err) => finish(reject, err));
    source.pipe(uploadStream);
  });

const removeStoredMedia = (media) => {
  if (media.storage === "r2") {
    deleteBackupCopy(media.publicId);
  } else {
    cloudinary.uploader
      .destroy(media.publicId, { resource_type: media.mediaType === "video" ? "video" : "image" })
      .catch((err) => console.error("⚠️ Cloudinary media cleanup failed:", err?.message || err));
  }
  if (media.backupKey) deleteBackupCopy(media.backupKey);
};

const ensureMediaOwnerAccount = (req, res, next) => {
  if (req.user?.accountType === "client" && req.user?.role !== "admin") {
    return res.status(403).json({ error: "The media library is available to provider accounts only." });
  }
  next();
};

router.get("/me/media", ensureMediaOwnerAccount, async (req, res) => {
  try {
    const items = await UserMedia.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ items: items.map(serializeMedia), limit: MAX_MEDIA_PER_USER });
  } catch (err) {
    console.error("❌ GET /users/me/media:", err);
    res.status(500).json({ error: "Failed to load media" });
  }
});

router.post(
  "/me/media",
  ensureMediaOwnerAccount,
  enforceRestriction("profile:update"),
  (req, res, next) =>
    mediaUpload.single("file")(req, res, (err) => {
      if (!err) return next();
      const message = err.code === "LIMIT_FILE_SIZE"
        ? `Files must be ${MAX_MEDIA_BYTES / (1024 * 1024)} MB or smaller.`
        : err.message || "Upload failed.";
      res.status(400).json({ error: message, message });
    }),
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: "No file uploaded.", message: "No file uploaded." });

      const isVideo = file.mimetype.startsWith("video/");
      if (!isVideo && file.size > MAX_IMAGE_BYTES) {
        const message = `Images must be ${MAX_IMAGE_BYTES / (1024 * 1024)} MB or smaller.`;
        return res.status(400).json({ error: message, message });
      }

      const count = await UserMedia.countDocuments({ userId: req.user._id });
      if (count >= MAX_MEDIA_PER_USER) {
        const message = `You can store up to ${MAX_MEDIA_PER_USER} media items. Delete some to upload more.`;
        return res.status(409).json({ error: message, message });
      }

      const base = {
        userId: req.user._id,
        mediaType: isVideo ? "video" : "image",
        mimeType: file.mimetype,
        originalName: String(file.originalname || "").slice(0, 255),
        showOnProfile: String(req.body?.showOnProfile ?? "true") !== "false",
      };

      let media;
      if (isVideo) {
        if (!backupStorageEnabled) {
          const message = "Video uploads are temporarily unavailable. Please try again later.";
          return res.status(503).json({ error: message, message });
        }
        const stored = await uploadBackupCopy({
          buffer: file.buffer,
          folder: "user_media",
          userId: req.user._id,
          originalName: file.originalname,
          contentType: file.mimetype || "video/mp4",
        });
        if (!stored) {
          const message = `Could not upload ${file.originalname || "this video"}. Please try again.`;
          return res.status(502).json({ error: message, message });
        }
        media = await UserMedia.create({
          ...base,
          url: stored.url,
          publicId: stored.key,
          storage: "r2",
          sizeBytes: file.size,
        });
      } else {
        let result = null;
        try {
          result = await uploadImageToCloudinary(file.buffer);
        } catch (err) {
          console.error("⚠️ Cloudinary image upload failed, storing on R2 instead:", err?.message || err);
        }
        const r2Copy = await uploadBackupCopy({
          buffer: file.buffer,
          folder: "user_media",
          userId: req.user._id,
          originalName: file.originalname,
          contentType: file.mimetype,
        });
        if (!result && !r2Copy) {
          const message = `Could not upload ${file.originalname || "this image"}. Please try again.`;
          return res.status(502).json({ error: message, message });
        }
        media = await UserMedia.create(
          result
            ? {
                ...base,
                url: result.secure_url,
                publicId: result.public_id,
                storage: "cloudinary",
                backupUrl: r2Copy?.url || "",
                backupKey: r2Copy?.key || "",
                sizeBytes: result.bytes || file.size,
                width: result.width ?? null,
                height: result.height ?? null,
              }
            : { ...base, url: r2Copy.url, publicId: r2Copy.key, storage: "r2", sizeBytes: file.size },
        );
      }
      // Release the upload buffer promptly; Render instances have little memory.
      file.buffer = null;

      res.status(201).json({ item: serializeMedia(media) });
    } catch (err) {
      console.error("❌ POST /users/me/media:", err);
      res.status(500).json({ error: "Failed to upload media", message: "Failed to upload media" });
    }
  },
);

router.patch("/me/media/:mediaId/visibility", ensureMediaOwnerAccount, enforceRestriction("profile:update"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.mediaId)) {
      return res.status(400).json({ error: "Invalid media id", message: "Invalid media id" });
    }
    const media = await UserMedia.findOneAndUpdate(
      { _id: req.params.mediaId, userId: req.user._id },
      { $set: { showOnProfile: Boolean(req.body?.showOnProfile) } },
      { new: true },
    ).lean();
    if (!media) return res.status(404).json({ error: "Media not found", message: "Media not found" });
    res.json({ item: serializeMedia(media) });
  } catch (err) {
    console.error("❌ PATCH /users/me/media/:id/visibility:", err);
    res.status(500).json({ error: "Failed to update media", message: "Failed to update media" });
  }
});

router.delete("/me/media/:mediaId", ensureMediaOwnerAccount, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.mediaId)) {
      return res.status(400).json({ error: "Invalid media id", message: "Invalid media id" });
    }
    const media = await UserMedia.findOneAndDelete({ _id: req.params.mediaId, userId: req.user._id }).lean();
    if (!media) return res.status(404).json({ error: "Media not found", message: "Media not found" });

    removeStoredMedia(media);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /users/me/media/:id:", err);
    res.status(500).json({ error: "Failed to delete media", message: "Failed to delete media" });
  }
});

// ✅ Delete current user's account and related data
router.delete("/delete-account", async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user._id;

    // Remove user-owned data to keep the platform clean after account deletion.
    const [postsResult, messagesResult, conversationsResult, reviewsResult, profileResult] =
      await Promise.all([
        Post.deleteMany({ userId }),
        Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] }),
        Conversation.deleteMany({ participants: userId }),
        Review.deleteMany({ $or: [{ authorUserId: userId }, { targetUserId: userId }] }),
        Profile.deleteOne({ userId }),
      ]);

    const ownedMedia = await UserMedia.find({ userId }).select("publicId mediaType storage backupKey").lean();
    await UserMedia.deleteMany({ userId });
    ownedMedia.forEach(removeStoredMedia);

    // Remove references to this user from promo code assignment/redemption history.
    await Promise.all([
      PromoCode.updateMany(
        { assignedUser: userId },
        { $set: { assignedUser: null } }
      ),
      PromoCode.updateMany(
        { "redemptions.userId": userId },
        { $pull: { redemptions: { userId } } }
      ),
    ]);

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });

    return res.json({
      success: true,
      message: "Account and related data deleted successfully",
      data: {
        deletedPosts: postsResult.deletedCount || 0,
        deletedMessages: messagesResult.deletedCount || 0,
        deletedConversations: conversationsResult.deletedCount || 0,
        deletedReviews: reviewsResult.deletedCount || 0,
        deletedProfile: profileResult.deletedCount || 0,
      },
    });
  } catch (err) {
    console.error("🚨 [UserRoutes] Error deleting account:", err);
    return res.status(500).json({
      error: "Failed to delete account",
      details: err.message || err,
    });
  }
});

// ── User self-activity ───────────────────────────────────────────────────────
// Returns paginated posts, comments, received-reviews, authored-reviews, and sent messages
router.get('/me/activity', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const userId = req.user._id;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    // Run all queries in parallel
    const [
      posts, postTotal,
      comments, commentTotal,
      reviews, reviewTotal,
      messages, messageTotal,
      authoredReviews, authoredReviewTotal,
    ] = await Promise.all([
      // Posts authored by this user
      Post.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit)
        .select('title description pictures categories createdAt')
        .lean(),
      Post.countDocuments({ userId }),

      // Comments made by this user — populate post title
      Comment.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit)
        .populate('postId', 'title')
        .lean(),
      Comment.countDocuments({ userId }),

      // Reviews received by this user — populate reviewer username
      Review.find({ targetUserId: userId })
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit)
        .populate('authorUserId', 'username profilePic')
        .lean(),
      Review.countDocuments({ targetUserId: userId }),

      // Messages sent by this user
      Message.find({ senderId: userId })
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit)
        .populate('receiverId', 'username')
        .select('content text senderId receiverId createdAt read readBy')
        .lean(),
      Message.countDocuments({ senderId: userId }),

      // Reviews authored by this user — populate target provider
      Review.find({ authorUserId: userId })
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit)
        .populate('targetUserId', 'username profilePic')
        .lean(),
      Review.countDocuments({ authorUserId: userId }),
    ]);

    res.json({
      posts:          { items: posts,          total: postTotal,          page, limit },
      comments:       { items: comments,       total: commentTotal,       page, limit },
      reviews:        { items: reviews,        total: reviewTotal,        page, limit },
      messages:       { items: messages,       total: messageTotal,       page, limit },
      authoredReviews:{ items: authoredReviews,total: authoredReviewTotal,page, limit },
    });
  } catch (err) {
    console.error('[UserActivity]', err);
    res.status(500).json({ error: 'Failed to load activity.' });
  }
});

// ── User self-analytics ──────────────────────────────────────────────────────
router.get('/me/analytics', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const userId = req.user._id;
    const username = req.user.username || '';
    const now = new Date();

    // Date boundaries
    const day7ago  = new Date(now - 7  * 24 * 60 * 60 * 1000);
    const day30ago = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // ── Member age (from account creation) ─────────────────────────────────
    const joinedAt = req.user.createdAt || new Date();
    const memberDays = Math.floor((now - joinedAt) / (1000 * 60 * 60 * 24));

    // ── Totals (parallel) ──────────────────────────────────────────────────
    const [totalPosts, totalReviews, userPosts] = await Promise.all([
      Post.countDocuments({ userId }),
      Review.countDocuments({ targetUserId: userId }),
      Post.find({ userId }).select('_id').lean(),
    ]);

    const postIds = userPosts.map((p) => p._id);

    const [commentsReceived, profileVisits] = await Promise.all([
      Comment.countDocuments({ postId: { $in: postIds } }),
      AnalyticsEvent.countDocuments({
        eventType: 'page_view',
        $or: [
          { pagePath: { $regex: String(userId), $options: 'i' } },
          ...(username ? [{ pagePath: { $regex: username, $options: 'i' } }] : []),
        ],
      }),
    ]);

    // ── Post activity — last 7 days ────────────────────────────────────────
    const postActivity = await Post.aggregate([
      { $match: { userId, createdAt: { $gte: day7ago } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing days so chart has 7 points
    const activityMap = Object.fromEntries(postActivity.map((d) => [d._id, d.count]));
    const postActivityFilled = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(day7ago);
      d.setDate(d.getDate() + i + 1);
      const key = d.toISOString().slice(0, 10);
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        posts: activityMap[key] || 0,
      };
    });

    // ── Reviews trend — last 30 days, grouped by week ─────────────────────
    const reviewsTrend = await Review.aggregate([
      { $match: { targetUserId: userId, createdAt: { $gte: day30ago } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: { $dateTrunc: { unit: 'week', date: '$createdAt' } },
            },
          },
          reviews: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalPosts,
      totalReviews,
      commentsReceived,
      profileVisits,
      memberDays,
      joinedAt: joinedAt.toISOString(),
      postActivity: postActivityFilled,
      reviewsTrend: reviewsTrend.map((r) => ({
        week: new Date(r._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        reviews: r.reviews,
      })),
    });
  } catch (err) {
    console.error('[UserAnalytics]', err);
    res.status(500).json({ error: 'Failed to load analytics.' });
  }
});

// GET /api/users/me/liked-posts
router.get('/me/liked-posts', getLikedPosts);

export default router;
