import express from "express";

import { submitPromotionRequest, getPromotionRequests, reviewPromotionRequest } from "./controllers/promotionController.js";
import { authMiddleware } from "../../common/middleware/authMiddleware.js";
import isAdmin from "../../common/middleware/isAdmin.js";
import upload from "../../common/utils/multer.js";

const router = express.Router();

// User submits a promotion request (with optional paymentProof file)
router.post("/request", authMiddleware, upload.single("paymentProof"), submitPromotionRequest);

// Admin: get all promotion requests
router.get("/requests", authMiddleware, isAdmin, getPromotionRequests);

// Admin: approve/reject a promotion request
router.post("/requests/:id/review", authMiddleware, isAdmin, reviewPromotionRequest);

export default router;
