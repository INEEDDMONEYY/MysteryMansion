import mongoose from "mongoose";
import PromoCode from "../../../models/PromoCode.js";
import User from "../../../models/User.js";

const normalizeCode = (value = "") => value.trim().toUpperCase();

const resolveAssignedUser = async (input) => {
  const value = (input || "").trim();
  if (!value) return null;

  if (mongoose.Types.ObjectId.isValid(value)) {
    return User.findById(value);
  }

  return User.findOne({ username: value });
};

export const listPromoCodes = async (req, res) => {
  try {
    const codes = await PromoCode.find()
      .sort({ createdAt: -1 })
      .populate("assignedUser", "_id username email");

    return res.json({ success: true, data: codes });
  } catch (err) {
    console.error("❌ [listPromoCodes]", err);
    return res.status(500).json({ success: false, error: "Failed to fetch promo codes" });
  }
};

export const createPromoCode = async (req, res) => {
  try {
    const code = normalizeCode(req.body?.code);
    const durationDays = Number(req.body?.durationDays);
    const maxUses = Number(req.body?.maxUses);
    const assignedUserInput = req.body?.assignedUser || "";

    if (!code) {
      return res.status(400).json({ success: false, error: "Promo code is required" });
    }
    if (!Number.isFinite(durationDays) || durationDays < 1) {
      return res.status(400).json({ success: false, error: "Duration must be at least 1 day" });
    }
    if (!Number.isFinite(maxUses) || maxUses < 1) {
      return res.status(400).json({ success: false, error: "Max uses must be at least 1" });
    }

    const existing = await PromoCode.findOne({ code });
    if (existing) {
      return res.status(409).json({ success: false, error: "Promo code already exists" });
    }

    let assignedUser = null;
    if (assignedUserInput) {
      assignedUser = await resolveAssignedUser(assignedUserInput);
      if (!assignedUser) {
        return res.status(404).json({ success: false, error: "Assigned user not found" });
      }
    }

    const created = await PromoCode.create({
      code,
      durationDays,
      maxUses,
      assignedUser: assignedUser?._id || null,
    });

    const populated = await PromoCode.findById(created._id).populate(
      "assignedUser",
      "_id username email",
    );

    return res.status(201).json({ success: true, data: populated, message: "Promo code created" });
  } catch (err) {
    console.error("❌ [createPromoCode]", err);
    return res.status(500).json({ success: false, error: "Failed to create promo code" });
  }
};

export const redeemPromoCode = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const code = normalizeCode(req.body?.code);
    if (!code) {
      return res.status(400).json({ success: false, error: "Promo code is required" });
    }

    const promo = await PromoCode.findOne({ code, isActive: true });
    if (!promo) {
      return res.status(404).json({ success: false, error: "That promo code is invalid" });
    }

    if (promo.assignedUser && promo.assignedUser.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: "This promo code is assigned to a different user" });
    }

    if ((promo.usageCount || 0) >= promo.maxUses) {
      return res.status(409).json({ success: false, error: "This promo code has reached its max usage limit" });
    }

    const now = new Date();
    const existingActive = promo.redemptions.find(
      (entry) =>
        entry.userId?.toString() === userId.toString() &&
        new Date(entry.expiresAt).getTime() > now.getTime(),
    );

    if (existingActive) {
      // Keep user promo expiry in sync in case historical data drifted.
      await User.findByIdAndUpdate(
        userId,
        { activePromoExpiry: existingActive.expiresAt },
        { new: true },
      );

      const msLeft = new Date(existingActive.expiresAt).getTime() - now.getTime();
      const daysLeft = Math.max(1, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
      return res.json({
        success: true,
        alreadyActive: true,
        data: {
          code: promo.code,
          durationDays: promo.durationDays,
          expiresAt: existingActive.expiresAt,
          daysLeft,
        },
        message: `Promo already active. ${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining.`,
      });
    }

    const expiresAt = new Date(now.getTime() + promo.durationDays * 24 * 60 * 60 * 1000);
    promo.usageCount += 1;
    promo.redemptions.push({
      userId,
      redeemedAt: now,
      expiresAt,
    });
    await promo.save();

    // Update user's activePromoExpiry, badgeType, promoCodeActive
    const user = await User.findByIdAndUpdate(
      userId,
      { activePromoExpiry: expiresAt, badgeType: "pink", promoCodeActive: true },
      { new: true },
    );

    // Update all user's posts
    await Post.updateMany(
      { userId: userId },
      { badgeType: "pink", promoCodeActive: true }
    );

    return res.json({
      success: true,
      data: {
        code: promo.code,
        durationDays: promo.durationDays,
        expiresAt,
      },
      user,
      message: `Promo accepted. Active for ${promo.durationDays} day${promo.durationDays === 1 ? "" : "s"}.`,
    });
  } catch (err) {
    console.error("❌ [redeemPromoCode]", err);
    return res.status(500).json({ success: false, error: "Failed to redeem promo code" });
  }
};

export const redeemPromoCodeForUser = async (req, res) => {
  try {
    const code = normalizeCode(req.body?.code);
    const userInput = (req.body?.userId || "").trim();

    if (!code) {
      return res.status(400).json({ success: false, error: "Promo code is required" });
    }

    const promo = await PromoCode.findOne({ code, isActive: true }).populate("assignedUser", "_id username email");
    if (!promo) {
      return res.status(404).json({ success: false, error: "That promo code is invalid" });
    }

    let targetUser = null;
    if (userInput) {
      targetUser = await resolveAssignedUser(userInput);
      if (!targetUser) {
        return res.status(404).json({ success: false, error: "Target user not found" });
      }
    } else if (promo.assignedUser?._id) {
      targetUser = promo.assignedUser;
    }

    if (!targetUser?._id) {
      return res.status(400).json({
        success: false,
        error: "No target user found. Provide a user ID/username or assign this promo to a user first.",
      });
    }

    if (promo.assignedUser?._id && promo.assignedUser._id.toString() !== targetUser._id.toString()) {
      return res.status(403).json({ success: false, error: "This promo code is assigned to a different user" });
    }

    if ((promo.usageCount || 0) >= promo.maxUses) {
      return res.status(409).json({ success: false, error: "This promo code has reached its max usage limit" });
    }

    const now = new Date();
    const existingActive = promo.redemptions.find(
      (entry) =>
        entry.userId?.toString() === targetUser._id.toString() &&
        new Date(entry.expiresAt).getTime() > now.getTime(),
    );

    if (existingActive) {
      await User.findByIdAndUpdate(
        targetUser._id,
        { activePromoExpiry: existingActive.expiresAt },
        { new: true },
      );

      return res.json({
        success: true,
        alreadyActive: true,
        data: {
          code: promo.code,
          durationDays: promo.durationDays,
          expiresAt: existingActive.expiresAt,
          userId: targetUser._id,
          username: targetUser.username,
        },
        message: `${targetUser.username || "User"} already has this promo active. Expiry was synchronized.`,
      });
    }

    const expiresAt = new Date(now.getTime() + promo.durationDays * 24 * 60 * 60 * 1000);

    promo.usageCount += 1;
    promo.redemptions.push({
      userId: targetUser._id,
      redeemedAt: now,
      expiresAt,
    });
    await promo.save();

    await User.findByIdAndUpdate(
      targetUser._id,
      { activePromoExpiry: expiresAt, badgeType: "pink", promoCodeActive: true },
      { new: true },
    );

    // Update all user's posts
    await Post.updateMany(
      { userId: targetUser._id },
      { badgeType: "pink", promoCodeActive: true }
    );

    return res.json({
      success: true,
      data: {
        code: promo.code,
        durationDays: promo.durationDays,
        expiresAt,
        userId: targetUser._id,
        username: targetUser.username,
      },
      message: `${targetUser.username || "User"} is now promoted for ${promo.durationDays} day${promo.durationDays === 1 ? "" : "s"}.`,
    });
  } catch (err) {
    console.error("❌ [redeemPromoCodeForUser]", err);
    return res.status(500).json({ success: false, error: "Failed to redeem promo code for user" });
  }
};

export const deletePromoCode = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await PromoCode.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Promo code not found" });
    }

    return res.json({ success: true, message: "Promo code deleted successfully" });
  } catch (err) {
    console.error("❌ [deletePromoCode]", err);
    return res.status(500).json({ success: false, error: "Failed to delete promo code" });
  }
};