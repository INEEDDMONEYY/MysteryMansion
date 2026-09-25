/**
 * milestoneAchievementJob.js
 *
 * Runs every 4 hours. Recomputes each active user's milestones and, for any
 * milestone newly crossed since the last run, sends an in-app notification +
 * email and records it in User.notifiedMilestones to avoid re-sending.
 *
 * Uses the same setInterval pattern as profileViewNotificationJob.js.
 */

import User from "../../models/User.js";
import { computeUserMilestones } from "../../modules/milestones/milestoneEngine.js";
import { createNotification } from "../../modules/notifications/notificationController.js";
import { sendMilestoneAchievedEmail } from "./sendMilestoneAchievedEmail.js";

const JOB_INTERVAL_MS = 4 * 60 * 60 * 1000;

async function processMilestoneAchievements() {
  const users = await User.find({ role: "user", status: "active" }).select(
    "username email accountType bio profilePic bannerPic age location gender socialLinks createdAt notifiedMilestones"
  );

  for (const user of users) {
    try {
      const { recent } = await computeUserMilestones(user);
      const alreadyNotified = new Set(user.notifiedMilestones || []);
      const newlyAchieved = recent.filter((m) => !alreadyNotified.has(m.id));
      if (newlyAchieved.length === 0) continue;

      for (const milestone of newlyAchieved) {
        await createNotification({
          audience: "user",
          type: "milestone_achieved",
          title: "Milestone achieved!",
          message: `You reached the "${milestone.title}" milestone.`,
          userId: user._id,
          meta: { milestoneId: milestone.id },
        }).catch(() => {});

        if (user.email) {
          await sendMilestoneAchievedEmail({
            to: user.email,
            username: user.username,
            milestoneTitle: milestone.title,
            milestoneDescription: milestone.description,
          }).catch((err) => console.error("❌ Milestone email failed:", err.message));
        }
      }

      await User.findByIdAndUpdate(user._id, {
        $addToSet: { notifiedMilestones: { $each: newlyAchieved.map((m) => m.id) } },
      });
    } catch (err) {
      console.error(`❌ Milestone check failed for user ${user._id}:`, err.message);
    }
  }
}

export function startMilestoneAchievementJob() {
  if (process.env.NODE_ENV === "test") return () => {};

  let running = false;

  const run = async () => {
    if (running) return;
    running = true;
    try {
      await processMilestoneAchievements();
    } catch (err) {
      console.error("❌ Milestone achievement job failed:", err);
    } finally {
      running = false;
    }
  };

  run();
  const id = setInterval(run, JOB_INTERVAL_MS);
  return () => clearInterval(id);
}
