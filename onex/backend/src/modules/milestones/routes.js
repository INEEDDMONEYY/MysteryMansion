import express from "express";
import { authMiddleware } from "../../common/middleware/authMiddleware.js";
import { computeUserMilestones } from "./milestoneEngine.js";

const router = express.Router();

router.use(authMiddleware);

// ── GET /api/milestones/me ───────────────────────────────────────────────────
// Computes the authenticated user's milestones from real account activity and
// splits them into "recent" (achieved) and "new" (not yet achieved) buckets.
router.get("/me", async (req, res) => {
  try {
    const { accountType, recent, new: upcoming } = await computeUserMilestones(req.user);
    res.json({ accountType, recent, new: upcoming });
  } catch (err) {
    console.error("❌ GET /milestones/me:", err);
    res.status(500).json({ error: "Failed to load milestones" });
  }
});

export default router;

