import { useState } from "react";
import { ShieldAlert, Save } from "lucide-react";
import api from "@/shared/utils/api";

export default function RestrictUserSetting({ users }) {
  const [userId, setUserId] = useState("");
  const [restriction, setRestriction] = useState("");
  const [status, setStatus] = useState(null); // { type: 'success'|'error', msg }

  const handleRestrict = async () => {
    if (!userId || !restriction) {
      setStatus({ type: 'error', msg: 'Please select a user and restriction.' });
      return;
    }
    try {
      const { data } = await api.put("/admin/settings", {
        field: "roleRestriction",
        value: { userId, restriction },
      });
      if (!data?.success) throw new Error(data?.error || "Failed to restrict user");
      setStatus({ type: 'success', msg: userId === '__ALL_USERS__' ? `Restriction applied to all non-admin users: ${restriction}` : `Restriction applied: ${restriction}` });
      setUserId("");
      setRestriction("");
    } catch (err) {
      setStatus({ type: 'error', msg: err?.response?.data?.error || err.message || "Failed to restrict user" });
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert size={16} className="text-neutral-500" />
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Restrict Role Access</h3>
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
          <option value="">Select a user</option>
          <option value="__ALL_USERS__">All Users (non-admin)</option>
          {users.map((u) => <option key={u._id} value={u._id}>{u.username}</option>)}
        </select>

        <select
          value={restriction}
          onChange={(e) => setRestriction(e.target.value)}
          className="flex-1 bg-neutral-800 border border-neutral-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500"
        >
          <option value="">Select restriction</option>
          <option value="no-posting">Restrict posting</option>
          <option value="no-comments">Restrict commenting</option>
          <option value="read-only">Read-only access</option>
        </select>

        <button
          onClick={handleRestrict}
          className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700 transition whitespace-nowrap"
        >
          <Save size={15} /> Apply
        </button>
      </div>
    </div>
  );
}