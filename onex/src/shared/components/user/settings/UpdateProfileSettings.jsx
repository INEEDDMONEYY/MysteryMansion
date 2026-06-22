import { useState, useContext, useEffect } from "react";
import { User, Key, Image, FileText, Loader2, CheckCircle, XCircle } from "lucide-react";
import { UserContext } from "@/context/UserContext";
import { FEATURE_FLAGS } from "@/config/featureFlags";

export default function UpdateProfileSettings({ onProfileUpdate }) {
  const { user: ctxUser, setUser: setCtxUser, updateProfile } = useContext(UserContext);

  const userId = ctxUser?._id || ctxUser?.id || null;

  // Local editable states
  const [username, setUsername] = useState(ctxUser?.username || "");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState(ctxUser?.bio || "");
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(ctxUser?.profilePic || null);

  // UI state
  const [loadingField, setLoadingField] = useState(null);
  const [toast, setToast] = useState(null);

  const profileKey = userId ? `userProfile_${userId}` : null;

  // Read and write per-user profile to localStorage
  const readStoredProfile = () => {
    if (!profileKey) return null;
    try {
      const raw = localStorage.getItem(profileKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const writeStoredProfile = (userObj) => {
    if (!profileKey || !userObj) return;
    try {
      localStorage.setItem(profileKey, JSON.stringify(userObj));
    } catch (err) {
      console.error("Failed to write stored profile:", err);
    }
  };

  // Sync local state with stored profile / context on mount or userId change
  useEffect(() => {
    if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    const stored = readStoredProfile();
    const source = stored || ctxUser || {};
    setUsername(source.username || "");
    setBio(source.bio || "");
    setPreviewUrl(source.profilePic || null);
    setProfilePic(null);
  }, [userId]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleUpdate = async (field, payload = null) => {
    if (!field) return;

    let data;
    let isFormData = false;

    if (field === "profilePic") {
      data = new FormData();
      if (profilePic) {
        data.append("profilePic", profilePic);
        isFormData = true;
      }
    } else {
      data = {};
      if (field === "username") data.username = username;
      if (field === "password") data.password = password;
      if (field === "bio") data.bio = bio;
      if (field === "meetupPrice") data.meetupPrice = payload;
    }

    try {
      setLoadingField(field);

      const updatedUserFromServer = await updateProfile(data, field, isFormData);

      const fullUpdatedUser = {
        ...ctxUser,
        username: field === "username" ? username : ctxUser.username,
        bio: field === "bio" ? bio : ctxUser.bio,
        profilePic:
          field === "profilePic"
            ? updatedUserFromServer?.profilePic || previewUrl
            : ctxUser.profilePic,
      };

      writeStoredProfile(fullUpdatedUser);

      if (setCtxUser) setCtxUser(fullUpdatedUser);

      if (field === "username") setUsername(fullUpdatedUser.username);
      if (field === "bio") setBio(fullUpdatedUser.bio);
      if (field === "profilePic") {
        if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(fullUpdatedUser.profilePic);
        setProfilePic(null);
      }
      if (field === "password") setPassword("");

      setToast({
        type: "success",
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`,
      });

      if (onProfileUpdate) onProfileUpdate();
    } catch (err) {
      console.error("Error updating profile:", err);
      setToast({ type: "error", message: err.message || "Failed to update profile." });
    } finally {
      setLoadingField(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleFileChange = (file) => {
    setProfilePic(file);
    if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  return (
    <>
      {toast && (
        <div
          className={`absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-white text-sm transition-all ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Profile Picture (Feature Flag) */}
      {FEATURE_FLAGS.ENABLE_PROFILE_PIC_UPDATE && (
        <section className="flex flex-col sm:flex-row items-center gap-4 border-b border-pink-100 pb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-pink-400 shadow">
            <img
              src={previewUrl || ctxUser?.profilePic || "https://via.placeholder.com/96"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-3 w-full">
            <label className="flex items-center gap-2 font-medium text-gray-700">
              <Image size={18} className="text-pink-600" /> Update Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-800"
            />
            <button
              type="button"
              disabled={loadingField === "profilePic" || !profilePic}
              onClick={() => handleUpdate("profilePic")}
              className={`flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded transition ${
                loadingField === "profilePic" || !profilePic
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-pink-700"
              }`}
            >
              {loadingField === "profilePic" ? <Loader2 className="animate-spin" size={16} /> : "Save Picture"}
            </button>
          </div>
        </section>
      )}

      {/* Username */}
      <section className="space-y-3 border-b border-pink-100 pb-6">
        <label className="flex items-center gap-2 font-medium text-gray-700">
          <User size={18} className="text-pink-600" /> Update Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-800"
          placeholder="Update username"
        />
        <button
          type="button"
          disabled={loadingField === "username"}
          onClick={() => handleUpdate("username")}
          className={`flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded transition ${
            loadingField === "username" ? "opacity-70 cursor-not-allowed" : "hover:bg-pink-700"
          }`}
        >
          {loadingField === "username" ? <Loader2 className="animate-spin" size={16} /> : "Save Username"}
        </button>
      </section>

      {/* Password */}
      <section className="space-y-3 border-b border-pink-100 pb-6">
        <label className="flex items-center gap-2 font-medium text-gray-700">
          <Key size={18} className="text-pink-600" /> Update Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-800"
          placeholder="Enter new password"
        />
        <button
          type="button"
          disabled={loadingField === "password"}
          onClick={() => handleUpdate("password")}
          className={`flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded transition ${
            loadingField === "password" ? "opacity-70 cursor-not-allowed" : "hover:bg-pink-700"
          }`}
        >
          {loadingField === "password" ? <Loader2 className="animate-spin" size={16} /> : "Save Password"}
        </button>
      </section>

      {/* Profile Bio (Feature Flag) */}
      {FEATURE_FLAGS.profile_bio_updates && (
        <section className="space-y-3 border-b border-pink-100 pb-6">
          <label className="flex items-center gap-2 font-medium text-gray-700">
            <FileText size={18} className="text-pink-600" /> Update Profile Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-800 resize-none"
            placeholder="Tell us a bit about yourself..."
          />
          <button
            type="button"
            disabled={loadingField === "bio"}
            onClick={() => handleUpdate("bio")}
            className={`flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded transition ${
              loadingField === "bio" ? "opacity-70 cursor-not-allowed" : "hover:bg-pink-700"
            }`}
          >
            {loadingField === "bio" ? <Loader2 className="animate-spin" size={16} /> : "Save Bio"}
          </button>
        </section>
      )}
    </>
  );
}
