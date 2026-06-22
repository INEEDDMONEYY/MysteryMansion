import User from "../../../models/User.js";
import cloudinary from "../../../common/utils/cloudinary.js";
import streamifier from "streamifier";

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { username, password, bio } = req.body;

    if (username) user.username = username;
    if (bio) user.bio = bio;
    if (password) user.password = password;

    // 📸 Upload profile image to Cloudinary
    if (req.file) {
      // Convert buffer to stream for Cloudinary
      const uploadStream = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "profiles" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

      const result = await uploadStream();
      user.image = result.secure_url;
    }

    await user.save();

    res.json({
      message: "Profile updated",
      user,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res
      .status(500)
      .json({ error: "Failed to update profile", details: err.message });
  }
};
