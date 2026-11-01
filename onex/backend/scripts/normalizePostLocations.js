// One-time backfill: rewrites every post's city/state/country into the
// canonical form used by location filtering (see locationNormalizer.js),
// e.g. city "denver, co" -> city "Denver", state "Colorado", country "United States".
//
// Dry run (default):  npm run backfill:post-locations
// Apply changes:      npm run backfill:post-locations -- --apply
import mongoose from "mongoose";
import env from "../src/config/env.js";
import Post from "../src/models/Post.js";
import { normalizeLocation } from "../src/common/utils/locationNormalizer.js";

const APPLY = process.argv.includes("--apply");

async function run() {
  await mongoose.connect(env.MONGO_URI);
  console.log(`✅ Connected to MongoDB (${APPLY ? "APPLY" : "DRY RUN"})`);

  const cursor = Post.find({}, { city: 1, state: 1, country: 1 }).lean().cursor();
  const ops = [];
  let scanned = 0;
  let changed = 0;

  for await (const post of cursor) {
    scanned += 1;
    const next = normalizeLocation(post);
    const same =
      (post.city || "") === next.city &&
      (post.state || "") === next.state &&
      (post.country || "") === next.country;
    if (same) continue;

    changed += 1;
    if (changed <= 25) {
      console.log(
        `  ${post._id}: "${post.city || ""}" / "${post.state || ""}" / "${post.country || ""}"` +
          ` -> "${next.city}" / "${next.state}" / "${next.country}"`
      );
    }
    ops.push({ updateOne: { filter: { _id: post._id }, update: { $set: next } } });
  }

  if (changed > 25) console.log(`  ...and ${changed - 25} more`);
  console.log(`Scanned ${scanned} post(s); ${changed} need normalizing.`);

  if (APPLY && ops.length) {
    for (let i = 0; i < ops.length; i += 500) {
      await Post.bulkWrite(ops.slice(i, i + 500), { ordered: false });
    }
    console.log(`✅ Updated ${ops.length} post(s).`);
  } else if (!APPLY && ops.length) {
    console.log("Re-run with --apply to save these changes.");
  }

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("❌ Backfill failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
