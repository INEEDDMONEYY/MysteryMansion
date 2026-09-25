/**
 * accountInactivityEmailJob.js
 *
 * Runs twice a day. Finds providers who haven't posted in 30/60/90+ day
 * increments (since their cached lastPostAt) and sends a staged reminder
 * notification + email, once per threshold crossed.
 *
 * Uses the same setInterval pattern as promoExpiryReminderJob.js.
 */

import User from "../../models/User.js";
import { createNotification } from "../../modules/notifications/notificationController.js";
import { sendAccountInactivityEmail } from "./sendAccountActivityEmail.js";

const JOB_INTERVAL_MS = 12 * 60 * 60 * 1000;
const INACTIVITY_THRESHOLDS_DAYS = [30, 60, 90, 120, 150, 180];

async function processAccountInactivity() {
  const now = Date.now();

  const candidates = await User.find({
    role: "user",
    accountType: "provider",
    status: "active",
    lastPostAt: { $ne: null },
  }).select("username email lastPostAt lastInactivityEmailDays");

  for (const user of candidates) {
    const daysSinceLastPost = Math.floor((now - new Date(user.lastPostAt).getTime()) / 86400000);
    const alreadyEmailedDays = user.lastInactivityEmailDays || 0;

    // Highest threshold crossed that hasn't been emailed yet.
    const threshold = [...INACTIVITY_THRESHOLDS_DAYS]
      .reverse()
      .find((days) => daysSinceLastPost >= days && alreadyEmailedDays < days);

    if (!threshold) continue;

    await createNotification({
      audience: "user",
      type: "account_inactivity",
      title: "We miss you!",
      message: `It's been ${threshold} days since your last post.`,
      userId: user._id,
      meta: { days: threshold },
    }).catch(() => {});

    if (user.email) {
      await sendAccountInactivityEmail({
        to: user.email,
        username: user.username,
        days: threshold,
      }).catch((err) => console.error("❌ Inactivity email failed:", err.message));
    }

    await User.findByIdAndUpdate(user._id, { lastInactivityEmailDays: threshold });
  }
}

export function startAccountInactivityEmailJob() {
  if (process.env.NODE_ENV === "test") return () => {};

  let running = false;

  const run = async () => {
    if (running) return;
    running = true;
    try {
      await processAccountInactivity();
    } catch (err) {
      console.error("❌ Account inactivity job failed:", err);
    } finally {
      running = false;
    }
  };

  run();
  const id = setInterval(run, JOB_INTERVAL_MS);
  return () => clearInterval(id);
}
