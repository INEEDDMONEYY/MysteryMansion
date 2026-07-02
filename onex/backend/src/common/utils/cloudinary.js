// backend/utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

// Prefer CLOUDINARY_URL if present, otherwise use individual keys
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true });
} else if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  console.error(
    "❌ Cloudinary not configured! Please set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET"
  );
}

export default cloudinary;