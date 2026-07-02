/**
 * migrateUsersAddAccountType.js
 *
 * One-time migration: sets accountType = "provider" for every user document
 * that has no accountType field yet (all users that signed up before the
 * provider/client overhaul were providers on this platform).
 *
 * Run from the /onex directory:
 *   MONGO_URI=<your-uri> node migrateUsersAddAccountType.js
 *
 * The script is idempotent — re-running it is safe (it only touches documents
 * where the field is missing).
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./backend/.env" });
// Also try the backend directory directly
if (!process.env.MONGO_URI) {
  dotenv.config({ path: "./backend/src/.env" });
}

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/uninterested";

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected.");

  const db = mongoose.connection.db;
  const users = db.collection("users");

  // Count how many documents are missing the field
  const missing = await users.countDocuments({
    accountType: { $exists: false },
  });
  console.log(`Found ${missing} user(s) without accountType.`);

  if (missing === 0) {
    console.log("Nothing to do — all users already have accountType set.");
    await mongoose.disconnect();
    return;
  }

  // Set accountType = "provider" for all documents that don't have the field.
  // This covers every account created before the overhaul (they were all providers).
  const result = await users.updateMany(
    { accountType: { $exists: false } },
    { $set: { accountType: "provider" } }
  );

  console.log(`✅ Updated ${result.modifiedCount} user(s) → accountType: "provider"`);
  await mongoose.disconnect();
  console.log("Done.");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
