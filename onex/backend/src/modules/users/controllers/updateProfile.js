// controllers/upadeProfile Controller.js
import { v2 as cloudinary } from "cloudinary";
import User from "../../../models/User.js"; // your Mongoose user model

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // assuming you have auth middleware
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    // Handle profilePic upload
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "profile_pics",
      });
      user.profilePic = result.secure_url; // ✅ hosted URL
    }

    // Handle other fields
    if (req.body.username) user.username = req.body.username;
    if (req.body.password) user.password = req.body.password; // hash in real app
    if (req.body.bio) user.bio = req.body.bio;

    await user.save();

    res.json(user); // return updated user with profilePic URL
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};
