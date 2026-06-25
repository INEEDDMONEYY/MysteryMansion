/**
 * Migration: set credits = 200 on all client users that lack the field.
 *
 * Safe to run multiple times (idempotent — only updates docs where credits
 * does not exist, leaving any manually set balances untouched).
 *
 * Usage (run from /onex directory):
 *   MONGO_URI=<your-uri> node migrateClientsAddCredits.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌  MONGO_URI environment variable is required.');
  process.exit(1);
}

await mongoose.connect(MONGO_URI);
console.log('✅  Connected to MongoDB');

const col = mongoose.connection.collection('users');

const result = await col.updateMany(
  { accountType: 'client', credits: { $exists: false } },
  { $set: { credits: 200 } }
);

console.log(`✅  Done. ${result.modifiedCount} client account(s) updated with 200 starting credits.`);
await mongoose.disconnect();
