// One-time backfill: sets Post.gender from the owning provider's account
// gender for posts that never had it set, so the homepage gender filter
// (added after many posts already existed) can actually surface them.
import mongoose from "mongoose";
import env from "../src/config/env.js";
import Post from "../src/models/Post.js";
import User from "../src/models/User.js";

const ACCOUNT_GENDER_TO_POST_GENDER = {
  "Woman escort": "female",
  "Man escort": "male",
  "TS escort": "ts",
};

const isDryRun = process.argv.includes("--dry-run");

async function run() {
  await mongoose.connect(env.MONGO_URI);
  console.log("✅ Connected to MongoDB", isDryRun ? "(dry run)" : "");

  const posts = await Post.find({ gender: { $in: ["", null] } }).select("_id userId gender");
  console.log(`Found ${posts.length} post(s) missing a gender`);

  let updated = 0;
  for (const post of posts) {
    const owner = await User.findById(post.userId).select("gender").lean();
    const mapped = owner ? ACCOUNT_GENDER_TO_POST_GENDER[owner.gender] : undefined;
    if (!mapped) continue;

    console.log(`  ${isDryRun ? "[dry-run] would set" : "setting"} post ${post._id} gender -> ${mapped}`);
    if (!isDryRun) {
      post.gender = mapped;
      await post.save();
    }
    updated += 1;
  }

  console.log(`🎉 Done. ${isDryRun ? "Would update" : "Updated"} ${updated} post(s).`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("❌ Backfill failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
