import PromotionRequest from "../../../models/PromotionRequest.js";
import User from "../../../models/User.js";
import cloudinary from "../../../common/utils/cloudinary.js";

// User submits a promotion request
export const submitPromotionRequest = async (req, res) => {
  try {
    console.log("[PromotionRequest] Incoming request body:", req.body);
    console.log("[PromotionRequest] Incoming file:", req.file);
    console.log("[PromotionRequest] Auth user:", req.user);

    const { tier, transactionId } = req.body;
    const username = req.user?.username;
    const userId = req.user?._id;
    if (!tier || !username) {
      console.error("[PromotionRequest] Missing required fields", { tier, username });
      return res.status(400).json({ error: "Missing required fields." });
    }

    let paymentProofUrl = undefined;
    if (req.file) {
      // Upload to Cloudinary
      try {
        paymentProofUrl = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image", folder: "promotionProofs" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            }
          );
          stream.end(req.file.buffer);
        });
        console.log("[PromotionRequest] Uploaded payment proof to Cloudinary:", paymentProofUrl);
      } catch (err) {
        console.error("[PromotionRequest] Cloudinary upload error:", err);
        return res.status(500).json({ error: "Failed to upload payment proof.", details: err.message });
      }
    }

    try {
      const request = await PromotionRequest.create({
        username,
        userId,
        tier,
        transactionId,
        paymentProofUrl,
      });
      console.log("[PromotionRequest] Created PromotionRequest:", request);
      res.json({ success: true, data: request });
    } catch (dbErr) {
      console.error("[PromotionRequest] DB error:", dbErr);
      res.status(500).json({ error: "Failed to save promotion request.", details: dbErr.message });
    }
  } catch (err) {
    console.error("[PromotionRequest] Unexpected error:", err);
    res.status(500).json({ error: "Failed to submit promotion request.", details: err.message });
  }
};

// Admin: get all promotion requests
export const getPromotionRequests = async (req, res) => {
  try {
    const requests = await PromotionRequest.find().sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch promotion requests." });
  }
};

// Admin: approve/reject a promotion request
export const reviewPromotionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: "Invalid status." });
    const request = await PromotionRequest.findByIdAndUpdate(
      id,
      {
        status,
        notes,
        reviewedBy: req.user?._id,
        reviewedAt: new Date(),
      },
      { new: true }
    );
    if (!request) return res.status(404).json({ error: "Request not found." });
    // If approved, activate promotion for user (implement as needed)
    // ...
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ error: "Failed to review promotion request." });
  }
};
