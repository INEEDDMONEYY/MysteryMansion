import express from "express";

import { purchasePromotion, cancelBadge, getStatus } from "./controllers/promotionPurchaseController.js";
import { authMiddleware } from "../../common/middleware/authMiddleware.js";

const router = express.Router();

// Provider spends credits on a promotion tier / monthly Blue Badge
router.post("/purchase", authMiddleware, purchasePromotion);
router.post("/badge/cancel", authMiddleware, cancelBadge);
router.get("/status", authMiddleware, getStatus);

export default router;
