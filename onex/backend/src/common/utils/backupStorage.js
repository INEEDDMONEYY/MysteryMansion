// Redundant off-Cloudinary storage for post media. If Cloudinary ever
// removes/flags an asset (moderation takedown, account issue, etc.), the
// backup copy — stored on a separate provider — keeps the user's media
// viewable via the frontend's onError fallback.
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import env from "../../config/env.js";

const isConfigured = Boolean(
  env.BACKUP_STORAGE_ENDPOINT &&
    env.BACKUP_STORAGE_ACCESS_KEY_ID &&
    env.BACKUP_STORAGE_SECRET_ACCESS_KEY &&
    env.BACKUP_STORAGE_BUCKET &&
    env.BACKUP_STORAGE_PUBLIC_URL_BASE
);

let client = null;
if (isConfigured) {
  client = new S3Client({
    region: "auto",
    endpoint: env.BACKUP_STORAGE_ENDPOINT,
    credentials: {
      accessKeyId: env.BACKUP_STORAGE_ACCESS_KEY_ID,
      secretAccessKey: env.BACKUP_STORAGE_SECRET_ACCESS_KEY,
    },
  });
} else {
  console.warn(
    "⚠️ Backup storage not configured (BACKUP_STORAGE_* env vars missing) — post media will not have a redundant copy."
  );
}

export const backupStorageEnabled = isConfigured;

function buildKey({ folder, userId, originalName }) {
  const safeName = String(originalName || "media").replace(/[^a-zA-Z0-9._-]/g, "_");
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${folder}/${userId}/${unique}-${safeName}`;
}

/**
 * Uploads a buffer to the backup bucket. Never throws — returns null on any
 * failure or when backup storage isn't configured, so it never blocks the
 * primary (Cloudinary) upload path.
 */
export async function uploadBackupCopy({ buffer, folder, userId, originalName, contentType }) {
  if (!client) return null;
  const key = buildKey({ folder, userId, originalName });
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: env.BACKUP_STORAGE_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );
    return { key, url: `${env.BACKUP_STORAGE_PUBLIC_URL_BASE}/${key}` };
  } catch (err) {
    console.error("❌ Backup storage upload failed:", err.message);
    return null;
  }
}

/** Best-effort delete; failures are logged but never thrown. */
export async function deleteBackupCopy(key) {
  if (!client || !key) return;
  try {
    await client.send(new DeleteObjectCommand({ Bucket: env.BACKUP_STORAGE_BUCKET, Key: key }));
  } catch (err) {
    console.error("❌ Backup storage delete failed:", err.message);
  }
}
