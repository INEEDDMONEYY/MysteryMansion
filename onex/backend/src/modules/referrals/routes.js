import express from "express";
import crypto from "crypto";
import Referral from "../../models/Referral.js";
import User from "../../models/User.js";
import { authMiddleware } from "../../common/middleware/authMiddleware.js";

const router = express.Router();

const generateCode = () => crypto.randomBytes(4).toString("hex");

async function getOrCreateReferral(providerId) {
  const existing = await Referral.findOne({ providerId });
  if (existing) return existing;

  // Retry a few times in case of a code collision (extremely unlikely).
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await Referral.create({ providerId, code: generateCode() });
    } catch (err) {
      if (err?.code !== 11000) throw err;
    }
  }
  throw new Error("Failed to generate a unique referral code");
}

// ── GET /api/referrals/resolve/:code (public) ───────────────────────────────
// Identifies the referral source for a link, records the click, and returns
// the inviting provider's public display info for the referral landing page.
router.get("/resolve/:code", async (req, res) => {
  try {
    const referral = await Referral.findOneAndUpdate(
      { code: req.params.code },
      { $inc: { clickCount: 1 }, $set: { lastClickedAt: new Date() } },
      { new: true }
    ).populate("providerId", "username profilePic");

    if (!referral || !referral.providerId) {
      return res.status(404).json({ error: "Referral link not found" });
    }

    res.json({
      code: referral.code,
      provider: {
        username: referral.providerId.username,
        profilePic: referral.providerId.profilePic,
      },
    });
  } catch (err) {
    console.error("❌ GET /referrals/resolve/:code:", err);
    res.status(500).json({ error: "Failed to resolve referral link" });
  }
});

// All routes below require authentication
router.use(authMiddleware);

// ── GET /api/referrals/me ────────────────────────────────────────────────────
// Gets (creating on first use) the authenticated provider's referral link,
// click/signup stats, and the clients who signed up through it.
router.get("/me", async (req, res) => {
  try {
    if (req.user.accountType !== "provider") {
      return res.status(403).json({ error: "Referral links are available to provider accounts only." });
    }

    const referral = await getOrCreateReferral(req.user._id);

    const referredUsers = await User.find({ referredBy: req.user._id })
      .select("username profilePic accountType createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      code: referral.code,
      clickCount: referral.clickCount,
      signupCount: referral.signupCount,
      createdAt: referral.createdAt,
      referredUsers,
    });
  } catch (err) {
    console.error("❌ GET /referrals/me:", err);
    res.status(500).json({ error: "Failed to load referral link" });
  }
});

export default router;
