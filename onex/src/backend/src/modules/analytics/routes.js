import express from "express";
import jwt from "jsonwebtoken";
import AnalyticsEvent from "../../models/AnalyticsEvent.js";
import env from "../../config/env.js";

const router = express.Router();

function maybeDecodeUserId(req) {
  try {
    const headerToken = req.header("Authorization")?.replace("Bearer ", "");
    const cookieToken = req.cookies?.token;
    const token = headerToken || cookieToken;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || env.JWT_SECRET);
    return decoded?.id || decoded?._id || null;
  } catch {
    return null;
  }
}

router.post("/track", async (req, res) => {
  try {
    const { eventType, sessionId, pagePath = "/", activeSeconds = 0, occurredAt } = req.body || {};

    if (!["page_view", "heartbeat"].includes(eventType)) {
      return res.status(400).json({ success: false, error: "Invalid eventType" });
    }
    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({ success: false, error: "sessionId is required" });
    }

    const userId = maybeDecodeUserId(req);
    await AnalyticsEvent.create({
      eventType,
      sessionId: sessionId.slice(0, 120),
      pagePath: String(pagePath || "/").slice(0, 300),
      activeSeconds: Math.max(0, Number(activeSeconds) || 0),
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
      userId: userId || null,
    });

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error("❌ Failed to save analytics event:", err);
    return res.status(500).json({ success: false, error: "Failed to track analytics event" });
  }
});

export default router;
