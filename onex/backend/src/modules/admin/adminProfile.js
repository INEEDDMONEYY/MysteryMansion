import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { uploadProfilePicture } from "./controllers/AdminSettingsController.js";
import { authMiddleware } from "../../common/middleware/authMiddleware.js";

const router = express.Router();

/* --------------------------- 📂 ES Modules Path Fix --------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* --------------------------- 📂 Multer Setup (Memory Storage) --------------------------- */
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
    } else {
      cb(null, true);
    }
  },
});

/* ----------------------------- 🖼 Profile Upload ----------------------------- */
// Ensure auth middleware is applied
router.post("/picture", authMiddleware, upload.single("profilePic"), uploadProfilePicture);

export default router;