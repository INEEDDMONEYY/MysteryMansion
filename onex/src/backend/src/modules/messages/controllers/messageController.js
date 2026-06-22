import Message from "../../../models/Message.js";

// ✅ GET all messages between admin & a user
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.query; // Optional filter if admin wants messages from a specific user

    const filter = userId ? { $or: [{ senderId: userId }, { receiverId: userId }] } : {};
    const messages = await Message.find(filter)
      .sort({ createdAt: 1 })
      .populate("senderId", "username role")
      .populate("receiverId", "username role");

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages", error: err.message });
  }
};

// ✅ POST a new message
export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, senderRole, text } = req.body;

    if (!senderId || !receiverId || !text) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const message = await Message.create({ senderId, receiverId, senderRole, text });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: "Failed to send message", error: err.message });
  }
};
