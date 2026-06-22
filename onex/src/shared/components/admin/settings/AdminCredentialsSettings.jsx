import { useState } from "react";
import { User, Lock, Save } from "lucide-react";
import api from "@/shared/utils/api";

export default function AdminCredentialsSetting() {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState(null);

  const saveCredentials = async (field, value, label) => {
    if (!value.trim()) { setStatus({ type: 'error', msg: `${label} cannot be empty.` }); return; }
    try {
      await api.put("/admin/settings/credentials", {
        username: field === 'username' ? value : undefined,
        password: field === 'password' ? value : undefined,
      });
      setStatus({ type: 'success', msg: `${label} updated.` });
      if (field === 'username') setUsername("");
      else setNewPassword("");
    } catch (err) {
      setStatus({ type: 'error', msg: err?.response?.data?.error || `Failed to update ${label.toLowerCase()}.` });
    }
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
          <div className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="New username"
              className="flex-1 bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500 min-w-0"
            />
            <button
              onClick={() => saveCredentials('username', username, 'Username')}
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
          <div className="flex gap-2">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="flex-1 bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500 min-w-0"
            />
            <button
              onClick={() => saveCredentials('password', newPassword, 'Password')}
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