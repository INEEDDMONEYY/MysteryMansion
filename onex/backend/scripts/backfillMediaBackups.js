// One-time migration: create backup copies (in R2/S3) for EXISTING post
// media that predates the backup-storage feature, so old posts are also
// protected if Cloudinary ever flags/removes an asset — not just new ones.
//
// Usage:
//   node scripts/backfillMediaBackups.js            (writes backups)
//   node scripts/backfillMediaBackups.js --dry-run   (preview only, no writes)
import mongoose from "mongoose";
import env from "../src/config/env.js";
import Post from "../src/models/Post.js";
import { uploadBackupCopy, backupStorageEnabled } from "../src/common/utils/backupStorage.js";

const DRY_RUN = process.argv.includes("--dry-run");

async function downloadBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), contentType: res.headers.get("content-type") || "application/octet-stream" };
}

async function backfillArray(post, urls, backups, label) {
  let changed = false;
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    if (!url || backups[i]) continue; // nothing to back up, or already backed up
    try {
      const { buffer, contentType } = await downloadBuffer(url);
      if (DRY_RUN) {
        console.log(`  [dry-run] would back up ${label}[${i}] for post ${post._id}`);
        continue;
      }
      const backup = await uploadBackupCopy({
        buffer,
        folder: "posts",
        userId: post.userId,
        originalName: `${label}-${i}`,
        contentType,
      });
      if (backup) {
        backups[i] = backup.url;
        changed = true;
        console.log(`  ✅ backed up ${label}[${i}] for post ${post._id}`);
      } else {
        console.warn(`  ⚠️  backup upload failed for ${label}[${i}] of post ${post._id}`);
      }
    } catch (err) {
      // Most commonly hit for content Cloudinary already removed/flagged — can't
      // back up what's already gone; that case needs the manual restore endpoint.
      console.warn(`  ⚠️  could not fetch ${label}[${i}] for post ${post._id}: ${err.message}`);
    }
  }
  return changed;
}

async function run() {
  if (!backupStorageEnabled) {
    console.error("❌ Backup storage isn't configured (BACKUP_STORAGE_* env vars). Set them first, then re-run.");
    process.exit(1);
  }

  await mongoose.connect(env.MONGO_URI);
  console.log("✅ Connected to MongoDB");
  if (DRY_RUN) console.log("🔎 Dry run — no uploads or writes will happen");

  const posts = await Post.find({
    $or: [{ pictures: { $exists: true, $ne: [] } }, { videos: { $exists: true, $ne: [] } }],
  });
  console.log(`Found ${posts.length} post(s) with media`);

  let postsUpdated = 0;
  for (const post of posts) {
    // Keep backup arrays index-aligned with the source arrays before filling gaps
    while (post.pictureBackups.length < post.pictures.length) post.pictureBackups.push("");
    while (post.videoBackups.length < post.videos.length) post.videoBackups.push("");

    const picChanged = await backfillArray(post, post.pictures, post.pictureBackups, "picture");
    const vidChanged = await backfillArray(post, post.videos, post.videoBackups, "video");

    if (!DRY_RUN && (picChanged || vidChanged)) {
      post.markModified("pictureBackups");
      post.markModified("videoBackups");
      await post.save();
      postsUpdated++;
    }
  }

  console.log(`🎉 Done. Updated ${postsUpdated} post(s).`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("❌ Migration failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
