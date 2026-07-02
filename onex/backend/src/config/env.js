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

  // ✉️ Email (Unosend)
  UNOSEND_API_KEY: process.env.UNOSEND_API_KEY,

  // 📁 Uploads
  UPLOAD_PATH: path.join(__dirname, "../uploads"),
  PROFILE_PICS_PATH: path.join(__dirname, "../uploads/profile-pics"),
};

export default env;
