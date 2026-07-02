// backend/controllers/platformUpdatesController.js
import PlatformUpdate from "../../../models/PlatformUpdate.js";
import User from "../../../models/User.js";
import { notifyUsersAboutPlatformUpdate } from "../../../common/utils/sendPlatformUpdateEmail.js";

// Create a new update
export const createUpdate = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const safeType = type === "feature" ? "feature" : "platform";
    const newUpdate = await PlatformUpdate.create({
      title,
      description,
      type: safeType,
      createdBy: req.user._id, // assume user is authenticated
    });

    res.status(201).json(newUpdate);

    const users = await User.find({
      email: { $exists: true, $ne: "" },
      status: { $ne: "suspended" },
    }).select("email username status");

    const notificationResult = await notifyUsersAboutPlatformUpdate({
      users,
      update: newUpdate,
    });

    console.log(
      `✅ Platform update email job completed. Attempted: ${notificationResult.attempted}, sent: ${notificationResult.sent}, failed: ${notificationResult.failed}`
    );
  } catch (err) {
    if (res.headersSent) {
      console.error("❌ Platform update notification failed:", err.message);
      return;
    }
    res.status(500).json({ error: "Failed to create update", details: err.message });
  }
};

// Get all updates
export const getUpdates = async (req, res) => {
  try {
    const updates = await PlatformUpdate.find().sort({ createdAt: -1 });
    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch updates", details: err.message });
  }
};

// Update an existing update entry (admin only)
export const updateUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type } = req.body;
    const safeType = type === "feature" ? "feature" : "platform";

    const updated = await PlatformUpdate.findByIdAndUpdate(
      id,
      {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        type: safeType,
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Update not found" });
    }

    return res.json({ success: true, data: updated, message: "Update edited successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to edit update", details: err.message });
  }
};

// Delete update (admin only)
export const deleteUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PlatformUpdate.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Update not found" });
    }

    return res.json({ success: true, message: "Update deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete update", details: err.message });
  }
};
