import express from "express";
import Referral from "../../models/Referral.js";

const router = express.Router();

// ── GET /api/admin/referrals ─────────────────────────────────────────────────
// Lists every provider's referral link with click/signup activity, for
// administrative tracking of the referral program.
router.get("/", async (req, res) => {
  try {
    const referrals = await Referral.find()
      .populate("providerId", "username profilePic email")
      .sort({ signupCount: -1, clickCount: -1 })
      .lean();
    res.json(referrals);
  } catch (err) {
    console.error("❌ GET /admin/referrals:", err);
    res.status(500).json({ error: "Failed to fetch referrals" });
  }
});

export default router;
