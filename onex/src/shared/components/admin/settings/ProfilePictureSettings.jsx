import { useState } from "react";
import { ImageIcon, Upload } from "lucide-react";
import api from "@/shared/utils/api";

export default function ProfilePictureSetting({ onProfileUpdate, currentProfile }) {
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(currentProfile || null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleProfileUpload = async () => {
    if (!profilePic) { setStatus({ type: 'error', msg: 'Please select a file first.' }); return; }
    const formData = new FormData();
    formData.append("profilePic", profilePic);
    setUploading(true);
    try {
      const { data } = await api.post("/admin/profile/picture", formData);
      setPreview(data.url);
      localStorage.setItem("profilePicture", data.url);
      onProfileUpdate?.(data.url);
      setStatus({ type: 'success', msg: 'Profile picture updated.' });
    } catch (err) {
      setStatus({ type: 'error', msg: err?.response?.data?.error || "Failed to upload profile picture." });
    } finally {
      setUploading(false);
      setProfilePic(null);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ImageIcon size={16} className="text-neutral-500" />
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Admin Profile Picture</h3>
      </div>

      {status && (
        <p className={`text-sm mb-3 ${status.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>{status.msg}</p>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {preview && (
          <img src={preview} alt="Preview" className="h-16 w-16 rounded-2xl object-cover border border-neutral-700 shrink-0" />
        )}

        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
          <label className="flex-1 cursor-pointer">
            <span className="block w-full bg-neutral-800 border border-neutral-700 text-neutral-400 rounded-xl px-3 py-2.5 text-sm hover:bg-neutral-700 transition text-center">
              {profilePic ? profilePic.name : 'Choose image…'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files[0];
                setProfilePic(file);
                if (file) setPreview(URL.createObjectURL(file));
              }}
            />
          </label>

          <button
            onClick={handleProfileUpload}
            disabled={uploading || !profilePic}
            className="flex items-center gap-1.5 bg-rose-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700 transition disabled:opacity-50 whitespace-nowrap"
          >
            <Upload size={15} /> {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}