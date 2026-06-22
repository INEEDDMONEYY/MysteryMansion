import { useState } from "react";
import { Trash2 } from "lucide-react";
import api from "@/shared/utils/api";

export default function DeleteUserSetting({ users }) {
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState(null);

  const deleteUser = async () => {
    if (!userId) { setStatus({ type: 'error', msg: 'Select a user.' }); return; }
    if (!reason) { setStatus({ type: 'error', msg: 'Select a reason.' }); return; }
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${userId}`, { data: { reason } });
      setStatus({ type: 'success', msg: 'User account deleted.' });
      setUserId("");
      setReason("");
    } catch (err) {
      setStatus({ type: 'error', msg: err?.response?.data?.error || "Failed to delete user" });
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trash2 size={16} className="text-red-500" />
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Delete User Account</h3>
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

        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="flex-1 bg-neutral-800 border border-neutral-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500"
        >
          <option value="">Select reason</option>
          <option value="Intent to use fake or stolen content">Fake or stolen content</option>
          <option value="Fake account">Fake account</option>
        </select>

        <button
          onClick={deleteUser}
          className="flex items-center gap-2 bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition whitespace-nowrap"
        >
          <Trash2 size={15} /> Delete
        </button>
      </div>
    </div>
  );
}