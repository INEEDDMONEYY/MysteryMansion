import {
  purchaseTier,
  cancelBadgeRenewal,
  getPromotionStatus,
} from "../promotionService.js";

const respond = (res, result) =>
  result.ok
    ? res.json({ success: true, data: result.data })
    : res.status(result.status).json({ success: false, error: result.error, data: result.data });

export const purchasePromotion = async (req, res) => {
  try {
    const tierId = String(req.body?.tierId || "");
    respond(res, await purchaseTier(req.user._id, tierId));
  } catch (err) {
    console.error("❌ POST /promotions/purchase:", err);
    res.status(500).json({ success: false, error: "Failed to complete purchase." });
  }
};

export const cancelBadge = async (req, res) => {
  try {
    respond(res, await cancelBadgeRenewal(req.user._id));
  } catch (err) {
    console.error("❌ POST /promotions/badge/cancel:", err);
    res.status(500).json({ success: false, error: "Failed to cancel badge renewal." });
  }
};

export const getStatus = async (req, res) => {
  try {
    respond(res, await getPromotionStatus(req.user._id));
  } catch (err) {
    console.error("❌ GET /promotions/status:", err);
    res.status(500).json({ success: false, error: "Failed to fetch promotion status." });
  }
};
