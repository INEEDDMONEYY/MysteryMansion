import User from "../../models/User.js";
import Message from "../../models/Message.js";
import Conversation from "../../models/Conversation.js";
import { getPrimaryAdminId, ensureUserAdminConversation } from "./ensureAdminWelcomeConversation.js";

const REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000;
const JOB_INTERVAL_MS = 60 * 60 * 1000;

const buildReminderText = (expiresAt) => {
  const expiryLabel = new Date(expiresAt).toLocaleString();
  return `Heads up: your promoted account status expires on ${expiryLabel}.\n\nTo get the most from your remaining promotion window, post as much as possible before your account returns to standard status.`;
};

const processPromoExpiryReminders = async () => {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_MS);

  const adminId = await getPrimaryAdminId();
  if (!adminId) return;

  const candidates = await User.find({
    role: "user",
    status: "active",
    activePromoExpiry: {
      $gt: now,
      $lte: windowEnd,
    },
  }).select("_id activePromoExpiry lastPromoExpiryReminderFor");

  for (const user of candidates) {
    const activePromoExpiry = user?.activePromoExpiry ? new Date(user.activePromoExpiry) : null;
    if (!activePromoExpiry || Number.isNaN(activePromoExpiry.getTime())) continue;

    const alreadyRemindedFor = user?.lastPromoExpiryReminderFor
      ? new Date(user.lastPromoExpiryReminderFor)
      : null;

    if (
      alreadyRemindedFor &&
      !Number.isNaN(alreadyRemindedFor.getTime()) &&
      alreadyRemindedFor.getTime() === activePromoExpiry.getTime()
    ) {
      continue;
    }

    const conversation = await ensureUserAdminConversation(user._id, adminId);
    if (!conversation?._id) continue;

    const message = await Message.create({
      conversationId: conversation._id,
      sender: adminId,
      senderId: adminId,
      receiverId: user._id,
      senderRole: "admin",
      text: buildReminderText(activePromoExpiry),
      readBy: [adminId],
    });

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: message._id,
      updatedAt: Date.now(),
    });

    await User.findByIdAndUpdate(user._id, {
      lastPromoExpiryReminderFor: activePromoExpiry,
    });
  }
};

export const startPromoExpiryReminderJob = () => {
  if (process.env.NODE_ENV === "test") {
    return () => {};
  }

  let running = false;

  const run = async () => {
    if (running) return;
    running = true;

    try {
      await processPromoExpiryReminders();
    } catch (err) {
      console.error("❌ Promo expiry reminder job failed:", err);
    } finally {
      running = false;
    }
  };

  run();
  const intervalId = setInterval(run, JOB_INTERVAL_MS);

  return () => clearInterval(intervalId);
};
