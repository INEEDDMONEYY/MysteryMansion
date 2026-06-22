import { useState } from "react";
import { ShieldCheck, Save } from "lucide-react";
import api from "@/shared/utils/api";

export default function UnrestrictUserSetting({ users }) {
  const [selectedUser, setSelectedUser] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState(null);

  const handleUnrestrictUser = async () => {
    if (!selectedUser || !role) {
      setStatus({ type: 'error', msg: 'Please select a user and action.' });
      return;
    }
    try {
      const { data } = await api.put("/admin/settings", {
        field: "roleUnrestriction",
        value: { userId: selectedUser },
      });
      if (!data?.success) throw new Error(data?.error || "Failed to update role");
      setStatus({ type: 'success', msg: selectedUser === '__ALL_USERS__' ? 'Restrictions removed for all non-admin users' : 'User access updated successfully.' });
      setSelectedUser("");
      setRole("");
    } catch (err) {
      setStatus({ type: 'error', msg: err?.response?.data?.error || err.message || "Failed to update role." });
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={16} className="text-emerald-500" />
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Unrestrict User Access</h3>
      </div>

      {status && (
        <p className={`text-sm mb-3 ${status.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>{status.msg}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="flex-1 bg-neutral-800 border border-neutral-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500"
        >
          <option value="">Select a user</option>
          <option value="__ALL_USERS__">All Users (non-admin)</option>
          {users.map((user) => <option key={user._id} value={user._id}>{user.username}</option>)}
        </select>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="flex-1 bg-neutral-800 border border-neutral-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500"
        >
          <option value="">Select action</option>
          <option value="remove">Remove restriction</option>
        </select>

        <button
          onClick={handleUnrestrictUser}
          className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-600 transition whitespace-nowrap"
        >
          <Save size={15} /> Apply
        </button>
      </div>
    </div>
  );
}