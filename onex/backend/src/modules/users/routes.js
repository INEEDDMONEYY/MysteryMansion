//User routes file
import express from "express";
import multer from "multer";
import streamifier from "streamifier";
import cloudinary from "../../common/utils/cloudinary.js";
import User from "../../models/User.js";
import Post from "../../models/Post.js";
import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";
import Review from "../../models/Review.js";
import Profile from "../../models/Profiles.js";
import PromoCode from "../../models/PromoCode.js";
import Comment from "../../models/Comment.js";
import AnalyticsEvent from "../../models/AnalyticsEvent.js";
import { getLikedPosts } from "../posts/controllers/postLikeController.js";
import { enforceRestriction } from "../../common/middleware/restrictionMiddleware.js";
import { authMiddleware } from "../../common/middleware/authMiddleware.js";

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

// ✅ Update-profile route with Cloudinary integration
router.post("/update-profile", enforceRestriction("profile:update"), upload.fields([
  { name: "profilePic", maxCount: 1 },
  { name: "bannerPic", maxCount: 1 },
]), async (req, res) => {
  try {
    console.log("🔹 [UserRoutes] Incoming request to /update-profile");
    console.log("🔹 [UserRoutes] req.user:", req.user ? req.user._id : "No user attached");
    console.log("🔹 [UserRoutes] req.body:", req.body);

    if (!req.user) {
      console.error("❌ [UserRoutes] Unauthorized — no user attached to request");
      return res.status(401).json({ error: "Unauthorized - no user" });
    }

    let updateData = { ...req.body };
    const profilePicFile = req.files?.profilePic?.[0] || null;
    const bannerPicFile = req.files?.bannerPic?.[0] || null;

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
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      console.error("❌ [UserRoutes] User not found in DB for id:", req.user._id);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ [UserRoutes] Updated user:", updatedUser._id);
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error("🚨 [UserRoutes] Error updating profile:", err);
    res.status(500).json({
      error: "Failed to update profile",
      details: err.message || err,
    });
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
