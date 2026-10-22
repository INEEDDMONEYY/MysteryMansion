// backend/config/env.js
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate required env variables
const requiredVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "UNOSEND_API_KEY",
];

requiredVars.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`⚠️ Warning: ${key} is not defined in environment`);
  }
});

const env = {
  PORT: process.env.PORT || 5020,
  NODE_ENV: process.env.NODE_ENV || "development",

  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,

  CLIENT_URL: (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, ""),
  // Canonical frontend origin used for email image assets — must return 200 (no redirect).
  // Defaults to CLIENT_URL but override with the primary domain if CLIENT_URL redirects.
  EMAIL_ASSET_BASE: (process.env.EMAIL_ASSET_BASE || process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, ""),

  // ☁️ Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // 🗄️ Backup media storage (S3-compatible — e.g. Cloudflare R2) — optional.
  // Keeps a redundant copy of post images/videos in case Cloudinary ever
  // flags/removes an asset. All four must be set for backups to be enabled.
  BACKUP_STORAGE_ENDPOINT: process.env.BACKUP_STORAGE_ENDPOINT,
  BACKUP_STORAGE_ACCESS_KEY_ID: process.env.BACKUP_STORAGE_ACCESS_KEY_ID,
  BACKUP_STORAGE_SECRET_ACCESS_KEY: process.env.BACKUP_STORAGE_SECRET_ACCESS_KEY,
  BACKUP_STORAGE_BUCKET: process.env.BACKUP_STORAGE_BUCKET,
  // Public base URL that serves objects from the bucket (e.g. an R2 public
  // bucket URL or custom domain), no trailing slash.
  BACKUP_STORAGE_PUBLIC_URL_BASE: (process.env.BACKUP_STORAGE_PUBLIC_URL_BASE || "").replace(/\/+$/, ""),

  // ✉️ Email (Unosend)
  UNOSEND_API_KEY: process.env.UNOSEND_API_KEY,

  // 📁 Uploads
  UPLOAD_PATH: path.join(__dirname, "../uploads"),
  PROFILE_PICS_PATH: path.join(__dirname, "../uploads/profile-pics"),
};

export default env;
