import express from "express";
import Message from "../../models/Message.js";
import Conversation from "../../models/Conversation.js";
import { authMiddleware } from "../../common/middleware/authMiddleware.js";
import { enforceRestriction } from "../../common/middleware/restrictionMiddleware.js";

const router = express.Router();

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
      "_id role"
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

    if (req.user.role === "user" && recipients.some((participant) => participant.role !== "admin")) {
      return res.status(403).json({ error: "Users can only message admins" });
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
    res.status(201).json(populated);
  } catch (err) {
    console.error("❌ Failed to send message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
