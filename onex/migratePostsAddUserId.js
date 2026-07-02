// migratePostsAddUserId.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Post from "./backend/models/Post.js";
import User from "./backend/models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/uninterested";

async function migratePosts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const posts = await Post.find({ userId: { $exists: false } });
    console.log(`Found ${posts.length} posts missing userId`);

    for (const post of posts) {
      const username = post.username?.trim();
      if (!username) continue;

      const user = await User.findOne({ username });
      if (!user) {
        console.warn(`⚠️  No user found for username "${username}"`);
        continue;
      }

      post.userId = user._id;
      await post.save();
      console.log(`✅ Updated post ${post._id} with userId ${user._id}`);
    }

    console.log("🎉 Migration complete!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Migration failed:", err);
  }
}

migratePosts();
