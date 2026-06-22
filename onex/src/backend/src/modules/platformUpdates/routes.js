// backend/routes/platformUpdatesRoutes.js
import express from "express";
import { createUpdate, getUpdates, updateUpdate, deleteUpdate } from "./controllers/PlatformUpdatesController.js";
import { authMiddleware, adminOnlyMiddleware } from "../../common/middleware/authMiddleware.js";

const router = express.Router();

// Only authenticated admins can create updates
router.post("/", authMiddleware, adminOnlyMiddleware, createUpdate);

// Authenticated users (or public if you want) can fetch all updates
router.get("/", getUpdates);

// Admin can edit an update entry
router.put("/:id", authMiddleware, adminOnlyMiddleware, updateUpdate);

// Admin can delete an update entry
router.delete("/:id", authMiddleware, adminOnlyMiddleware, deleteUpdate);

export default router;
