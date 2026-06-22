import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  username: { type: String, default: "" },
  bio: { type: String, default: "" },
  profilePic: { type: String, default: "" },
  availability: {
    status: { type: String, default: "" }
  },
  incallPrice: { type: Number, default: 0 },
  outcallPrice: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Profile", profileSchema);
