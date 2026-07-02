import express from "express";
import { redeemPromoCode } from "./controllers/promoCodeController.js";

const router = express.Router();

router.post("/redeem", redeemPromoCode);

export default router;