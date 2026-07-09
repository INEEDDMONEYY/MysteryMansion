import express from "express";
import {
  getAllUsers,
  deleteUser,
  promoteUser,
  promoteAllUsers,
  cancelAllPromotions,
} from "./controllers/AdminSettingsController.js";

const router = express.Router();

/* ----------------------------- 👥 Admin User Management ----------------------------- */
router.get("/", getAllUsers);                          // GET  /api/admin/users
router.post("/promote", promoteUser);                  // POST /api/admin/users/promote
router.post("/promote-all", promoteAllUsers);          // POST /api/admin/users/promote-all
router.post("/cancel-all-promotions", cancelAllPromotions); // POST /api/admin/users/cancel-all-promotions
router.delete("/:id", deleteUser);                     // DELETE /api/admin/users/:id

export default router;
