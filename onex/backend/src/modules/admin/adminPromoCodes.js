import express from "express";
import {
	createPromoCode,
	listPromoCodes,
	redeemPromoCodeForUser,
	deletePromoCode,
} from "../promoCodes/controllers/promoCodeController.js";

const router = express.Router();

router.get("/", listPromoCodes);
router.post("/", createPromoCode);
router.post("/redeem", redeemPromoCodeForUser);
router.delete("/:id", deletePromoCode);

export default router;