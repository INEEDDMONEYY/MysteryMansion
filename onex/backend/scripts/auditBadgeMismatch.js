// Read-only diagnostic: finds users with an active badge/promo whose most
// recent post doesn't carry the same badgeType — helps pinpoint why the
// "card effect" sometimes doesn't show up on a newly created listing.
import mongoose from "mongoose";
import env from "../src/config/env.js";
import User from "../src/models/User.js";
import Post from "../src/models/Post.js";

async function run() {
  await mongoose.connect(env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const badgedUsers = await User.find({ badgeType: { $in: ["blue", "pink"] } })
    .select("_id username badgeType activePromoExpiry")
    .lean();

  console.log(`Found ${badgedUsers.length} user(s) with an active badge`);

  for (const user of badgedUsers) {
    const posts = await Post.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .select("_id title badgeType createdAt")
      .lean();

    if (!posts.length) {
      console.log(`  - ${user.username} (${user.badgeType}): no posts`);
      continue;
    }

    const mismatched = posts.filter((p) => p.badgeType !== user.badgeType);
    if (mismatched.length) {
      console.log(`  ⚠️  ${user.username} (user.badgeType=${user.badgeType}) has ${mismatched.length}/${posts.length} post(s) with a different badgeType:`);
      for (const p of mismatched) {
        console.log(`      post ${p._id} "${p.title}" badgeType="${p.badgeType}" createdAt=${p.createdAt.toISOString()}`);
      }
    } else {
      console.log(`  ✅ ${user.username} (${user.badgeType}): all ${posts.length} post(s) match`);
    }
  }

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("❌ Audit failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
