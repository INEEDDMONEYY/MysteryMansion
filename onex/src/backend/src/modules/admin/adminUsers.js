import express from "express";
import {
  getAllUsers,
  deleteUser,
  promoteUser,
} from "./controllers/AdminSettingsController.js";

const router = express.Router();

/* ----------------------------- 👥 Admin User Management ----------------------------- */
// ✅ Get all users
router.get("/", getAllUsers);              // GET /api/admin/users

// ✅ Promote user account
router.post("/promote", promoteUser);      // POST /api/admin/users/promote

// ✅ Delete a specific user
router.delete("/:id", deleteUser);         // DELETE /api/admin/users/:id

export default router;
