import express from "express";
import Conversation from "../../models/Conversation.js";
import Message from "../../models/Message.js";
import User from "../../models/User.js";
import { authMiddleware } from "../../common/middleware/authMiddleware.js";
import { enforceRestriction } from "../../common/middleware/restrictionMiddleware.js";
import {
  ensureAdminConversationsForAllUsers,
  ensureUserAdminConversation,
} from "../../common/utils/ensureAdminWelcomeConversation.js";

const router = express.Router();

// GET all conversations for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.user.role === "user") {
      await ensureUserAdminConversation(userId);
    }

    if (req.user.role === "admin") {
      await ensureAdminConversationsForAllUsers(userId);
    }

    const conversations = await Conversation.find({ participants: userId })
      .populate("participants", "username role profilePic")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (err) {
    console.error("❌ Failed to fetch conversations:", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// POST create new conversation
router.post("/", authMiddleware, enforceRestriction("conversation:create"), async (req, res) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({ error: "recipientId is required" });
    }

    if (String(recipientId) === String(userId)) {
      return res.status(400).json({ error: "Cannot create a conversation with yourself" });
    }

    const recipient = await User.findById(recipientId).select("_id role accountType");
    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    const senderUser = await User.findById(userId).select("accountType credits").lean();
    const isClientSender = senderUser?.accountType === 'client';
    const recipientIsProvider = recipient.role === 'user' && recipient.accountType === 'provider';

    // Clients can start conversations with admins or providers.
    // Regular providers can only talk to admins (existing behaviour).
    if (req.user.role === "user" && !isClientSender && recipient.role !== "admin") {
      return res.status(403).json({ error: "Users can only start conversations with admins" });
    }
    if (req.user.role === "user" && isClientSender && recipient.role !== "admin" && !recipientIsProvider) {
      return res.status(403).json({ error: "Clients can only start conversations with admins or providers" });
    }

    const existing = await Conversation.findOne({
      participants: { $all: [userId, recipientId] },
    });

    if (existing) return res.json(existing);

    const newConv = await Conversation.create({
      participants: [userId, recipientId],
    });

    res.status(201).json(newConv);
  } catch (err) {
    console.error("❌ Failed to create conversation:", err);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// POST broadcast a single message to all users (admin only)
router.post(
  "/broadcast",
  authMiddleware,
  enforceRestriction("message:send"),
  async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Admins only" });
      }

      const text = String(req.body?.text || "").trim();
      if (!text) {
        return res.status(400).json({ error: "text is required" });
      }

      const adminId = req.user._id;
      const users = await User.find({ role: "user" }).select("_id");

      if (!users.length) {
        return res.status(200).json({
          success: true,
          message: "No users available for broadcast",
          data: { totalRecipients: 0, createdMessages: 0, latestConversationId: null },
        });
      }

      let latestConversationId = null;
      let createdMessages = 0;

      for (const target of users) {
        let conversation = await Conversation.findOne({
          participants: { $all: [adminId, target._id] },
        });

        if (!conversation) {
          conversation = await Conversation.create({
            participants: [adminId, target._id],
          });
        }

        const message = await Message.create({
          conversationId: conversation._id,
          sender: adminId,
          senderId: adminId,
          receiverId: target._id,
          senderRole: "admin",
          text,
          readBy: [adminId],
        });

        await Conversation.findByIdAndUpdate(conversation._id, {
          lastMessage: message._id,
          updatedAt: Date.now(),
        });

        latestConversationId = conversation._id;
        createdMessages += 1;
      }

      return res.status(201).json({
        success: true,
        message: `Broadcast sent to ${createdMessages} user${createdMessages === 1 ? "" : "s"}`,
        data: {
          totalRecipients: users.length,
          createdMessages,
          latestConversationId,
        },
      });
    } catch (err) {
      console.error("❌ Failed to send broadcast:", err);
      return res.status(500).json({ error: "Failed to send broadcast" });
    }
  }
);

export default router;
