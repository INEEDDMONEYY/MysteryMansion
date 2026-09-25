import express from "express";
import Message from "../../models/Message.js";
import Conversation from "../../models/Conversation.js";
import User from "../../models/User.js";
import { authMiddleware } from "../../common/middleware/authMiddleware.js";
import { enforceRestriction } from "../../common/middleware/restrictionMiddleware.js";
import { createNotification } from "../notifications/notificationController.js";
import { sendNewMessageEmail } from "../../common/utils/sendNewMessageEmail.js";
import { allowEmail } from "../../common/utils/emailRateLimiter.js";
import env from "../../config/env.js";

const router = express.Router();

// Cooldown between new-message emails to the same recipient (prevents inbox
// floods during a fast back-and-forth conversation).
const MESSAGE_EMAIL_COOLDOWN_MS = 5 * 60 * 1000;

// Maps a participant to the messages page they'd use to view a conversation
function messagesPathFor(participant) {
  if (participant.role === "admin") return "/admin/messages";
  return participant.accountType === "client" ? "/client/messages" : "/user/messages";
}

router.get("/unread/count", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({ participants: userId }).select("_id");
    const conversationIds = conversations.map((c) => c._id);

    if (!conversationIds.length) {
      return res.json({ unreadCount: 0 });
    }

    const unreadCount = await Message.countDocuments({
      conversationId: { $in: conversationIds },
      sender: { $ne: userId },
      readBy: { $ne: userId },
    });

    return res.json({ unreadCount });
  } catch (err) {
    console.error("❌ Failed to fetch unread count:", err);
    return res.status(500).json({ error: "Failed to fetch unread count" });
  }
});

// GET all messages for a conversation
router.get("/:conversationId", authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId).select("participants");
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (participantId) => String(participantId) === String(userId)
    );

    if (!isParticipant) {
      return res.status(403).json({ error: "You are not a participant in this conversation" });
    }

    const messages = await Message.find({ conversationId })
      .populate("sender", "username role profilePic")
      .sort({ createdAt: 1 });

    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId },
        readBy: { $ne: userId },
      },
      {
        $addToSet: { readBy: userId },
      }
    );

    res.json(messages);
  } catch (err) {
    console.error("❌ Failed to fetch messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// POST send new message
router.post("/", authMiddleware, enforceRestriction("message:send"), async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const senderId = req.user._id;

    if (!conversationId || !String(text || "").trim()) {
      return res.status(400).json({ error: "conversationId and text are required" });
    }

    const conversation = await Conversation.findById(conversationId).populate(
      "participants",
      "_id role accountType username email"
    );

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (participant) => String(participant._id) === String(senderId)
    );

    if (!isParticipant) {
      return res.status(403).json({ error: "You are not a participant in this conversation" });
    }

    const recipients = conversation.participants.filter(
      (participant) => String(participant._id) !== String(senderId)
    );

    const senderUser = await User.findById(senderId).select('accountType credits').lean();
    const isClientSender = senderUser?.accountType === 'client';
    const recipientIsProvider = recipients.some(
      (p) => p.role === 'user' && p.accountType === 'provider'
    );

    // Clients messaging providers (not admin) require 20 credits per message
    const CREDITS_PER_MESSAGE = 20;
    if (isClientSender && recipientIsProvider) {
      if ((senderUser.credits ?? 0) < CREDITS_PER_MESSAGE) {
        return res.status(402).json({
          error: 'Insufficient credits. You need at least 20 credits to send a message.',
          credits: senderUser.credits ?? 0,
        });
      }
      // Deduct credits atomically before saving the message
      await User.findByIdAndUpdate(senderId, { $inc: { credits: -CREDITS_PER_MESSAGE } });

      // Fire low-credits notification if balance is now low (< 40 = 2 messages left)
      const LOW_CREDITS_THRESHOLD = CREDITS_PER_MESSAGE * 2;
      const remainingCredits = (senderUser.credits ?? 0) - CREDITS_PER_MESSAGE;
      if (remainingCredits < LOW_CREDITS_THRESHOLD) {
        createNotification({
          audience: 'user',
          type: 'low_credits',
          title: 'Message credits running low',
          message: `You have ${remainingCredits} credits remaining — that's ${Math.floor(remainingCredits / CREDITS_PER_MESSAGE)} message${Math.floor(remainingCredits / CREDITS_PER_MESSAGE) !== 1 ? 's' : ''} left. Refill soon to keep chatting.`,
          userId: senderId,
          meta: { credits: remainingCredits },
        }).catch(() => {});
      }
    }

    // Providers (role=user, accountType=provider) may only message admins or clients — not other providers.
    if (req.user.role === 'user' && !isClientSender) {
      const hasProviderRecipient = recipients.some(
        (p) => p.role === 'user' && p.accountType !== 'client'
      );
      if (hasProviderRecipient) {
        return res.status(403).json({ error: 'Providers can only message admins or clients.' });
      }
    }

    const message = await Message.create({
      conversationId,
      sender: senderId,
      senderId,
      receiverId: recipients[0]?._id,
      senderRole: req.user.role,
      text: text.trim(),
      readBy: [senderId],
    });

    // Update conversation's lastMessage
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: Date.now(),
    });

    const populated = await message.populate(
      "sender",
      "username role profilePic"
    );

    // ── Notify non-admin recipients of the new message ───────────────────────────
    const senderUsername = populated.sender?.username || 'Someone';
    const userRecipients = recipients.filter((p) => p.role === 'user');
    for (const recipient of userRecipients) {
      createNotification({
        audience: 'user',
        type: 'message',
        title: 'New message',
        message: `${senderUsername} sent you a message.`,
        userId: recipient._id,
        meta: { conversationId: String(conversationId), senderId: String(senderId) },
      }).catch(() => {}); // fire-and-forget, don't block the response
    }

    // ── Email admin<->user recipients of the new message ─────────────────────────
    // Only admin-involved conversations get emailed (admin messaging a user, or a
    // user messaging admin) — regular user-to-user (e.g. client<->provider) chats
    // don't trigger email. Also rate-limited per recipient to avoid inbox floods
    // during a fast back-and-forth conversation.
    const isAdminInvolved = req.user.role === 'admin' || recipients.some((p) => p.role === 'admin');
    if (isAdminInvolved) {
      for (const recipient of recipients) {
        if (!recipient.email) continue;
        if (req.user.role !== 'admin' && recipient.role !== 'admin') continue; // skip user<->user leg
        if (!allowEmail(`message:${recipient._id}`, { limit: 1, windowMs: MESSAGE_EMAIL_COOLDOWN_MS })) continue;

        sendNewMessageEmail({
          to: recipient.email,
          recipientUsername: recipient.username,
          senderUsername,
          messageText: text.trim(),
          ctaUrl: `${env.CLIENT_URL}${messagesPathFor(recipient)}?conv=${conversationId}`,
        }).catch((err) => console.error('❌ Failed to send new-message email:', err.message));
      }
    }

    res.status(201).json(populated);
  } catch (err) {
    console.error("❌ Failed to send message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// POST toggle a reaction (emoji) on a message
router.post("/:messageId/react", authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    if (!emoji || typeof emoji !== "string") {
      return res.status(400).json({ error: "emoji is required" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const conversation = await Conversation.findById(message.conversationId).select("participants");
    const isParticipant = conversation?.participants.some(
      (participantId) => String(participantId) === String(userId)
    );
    if (!isParticipant) {
      return res.status(403).json({ error: "You are not a participant in this conversation" });
    }

    const existingIndex = message.reactions.findIndex(
      (r) => String(r.userId) === String(userId) && r.emoji === emoji
    );

    if (existingIndex >= 0) {
      message.reactions.splice(existingIndex, 1); // toggle off
    } else {
      message.reactions.push({ emoji, userId });
    }

    await message.save();
    const populated = await message.populate("sender", "username role profilePic");
    res.json(populated);
  } catch (err) {
    console.error("❌ Failed to react to message:", err);
    res.status(500).json({ error: "Failed to react to message" });
  }
});

export default router;
