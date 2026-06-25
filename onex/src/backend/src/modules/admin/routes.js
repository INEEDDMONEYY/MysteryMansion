import express from "express";
import {
  getSettings,
  getStats,
  getAdminAnalytics,
  updateSettings,
  updateAdminCredentials,
} from "./controllers/AdminSettingsController.js";
import { emailUsers } from "./controllers/emailUsersController.js";
import adminProfileRouter from "./adminProfile.js";
import adminUsersRouter from "./adminUsers.js";
import adminPromoCodesRouter from "./adminPromoCodes.js";import adminCreditRequestsRouter from './adminCreditRequests.js';import adminCreditPackagesRouter from './adminCreditPackages.js';const router = express.Router();

/* --- Settings --- */
router.get("/stats", getStats);
router.get("/analytics", getAdminAnalytics);
router.get("/", getSettings);
router.put("/", updateSettings);
router.put("/credentials", updateAdminCredentials);

/* --- Email Users --- */
router.post("/email-users", emailUsers);

/* --- Admin sub-routers --- */
router.use("/profile", adminProfileRouter);
router.use("/users", adminUsersRouter);
router.use("/promo-codes", adminPromoCodesRouter);router.use('/credit-requests', adminCreditRequestsRouter);router.use('/credit-packages', adminCreditPackagesRouter);export default router;
