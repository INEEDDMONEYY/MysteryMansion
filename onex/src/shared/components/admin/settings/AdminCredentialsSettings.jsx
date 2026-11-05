import { useState } from "react";
import { User, Lock, Save } from "lucide-react";
import api from "@/shared/utils/api";
import { useUser } from "@/context/useUser";

export default function AdminCredentialsSetting() {
  const { user, refreshUser } = useUser();
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState(null);

  const save = async (payload, successMsg, onSuccess) => {
    try {
      await api.put("/admin/settings/credentials", payload);
      await refreshUser?.();
      setStatus({ type: 'success', msg: successMsg });
      onSuccess();
    } catch (err) {
      setStatus({ type: 'error', msg: err?.response?.data?.error || "Failed to save credentials." });
    }
  };

  const saveUsername = () => {
    if (!username.trim()) { setStatus({ type: 'error', msg: 'Username cannot be empty.' }); return; }
    save({ username: username.trim() }, 'Username updated.', () => setUsername(""));
  };

  const savePassword = () => {
    if (!newPassword) { setStatus({ type: 'error', msg: 'Password cannot be empty.' }); return; }
    if (!currentPassword) { setStatus({ type: 'error', msg: 'Enter your current password to set a new one.' }); return; }
    save({ currentPassword, newPassword }, 'Password updated.', () => {
      setCurrentPassword("");
      setNewPassword("");
    });
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
      <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Admin Credentials</h3>

      {status && (
        <p className={`text-sm mb-3 ${status.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>{status.msg}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Username */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs text-neutral-400">
            <User size={13} /> Update Username
          </label>
          <p className="text-xs text-neutral-500">Current: {user?.username || "—"}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="New username"
              className="flex-1 bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500 min-w-0"
            />
            <button
              onClick={saveUsername}
              className="flex items-center gap-1.5 bg-rose-600 text-white px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700 transition shrink-0"
            >
              <Save size={13} /> Save
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Lock size={13} /> Reset Password
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              autoComplete="current-password"
              className="flex-1 bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500 min-w-0"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              autoComplete="new-password"
              className="flex-1 bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500 min-w-0"
            />
            <button
              onClick={savePassword}
              className="flex items-center gap-1.5 bg-rose-600 text-white px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700 transition shrink-0"
            >
              <Save size={13} /> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}