import { useState } from "react";
import { Ban } from "lucide-react";
import api from "@/shared/utils/api";

export default function SuspendUserSetting({ users }) {
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState(null);

  const suspendUser = async () => {
    if (!userId) { setStatus({ type: 'error', msg: 'Select a user.' }); return; }
    try {
      await api.put("/admin/settings", { field: "suspendUserId", value: userId });
      setStatus({ type: 'success', msg: 'User suspended.' });
      setUserId("");
    } catch (err) {
      setStatus({ type: 'error', msg: err?.response?.data?.error || err.message || "Failed to suspend user" });
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Ban size={16} className="text-amber-500" />
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Suspend User Account</h3>
      </div>

      {status && (
        <p className={`text-sm mb-3 ${status.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>{status.msg}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="flex-1 bg-neutral-800 border border-neutral-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500"
        >
          <option value="">Select user</option>
          {users.map((u) => <option key={u._id} value={u._id}>{u.username}</option>)}
        </select>

        <button
          onClick={suspendUser}
          className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-700 transition whitespace-nowrap"
        >
          <Ban size={15} /> Suspend
        </button>
      </div>
    </div>
  );
}