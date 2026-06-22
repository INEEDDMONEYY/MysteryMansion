
import { useEffect, useState } from "react";
import { Crown, X } from "lucide-react";
import api from "@/shared/utils/api";

const SELECT = "bg-neutral-800 border border-neutral-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500 w-full";

export default function PromotionRequestsAdmin() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [badgeChecked, setBadgeChecked] = useState(false);
  const [promoChecked, setPromoChecked] = useState(false);
  const [promoDuration, setPromoDuration] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/admin/users");
        setUsers((data?.data || []).filter((u) => u.role !== "admin"));
      } catch { setError("Failed to load users"); }
    };
    fetchUsers();
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      if (!badgeChecked && !promoChecked) throw new Error("Select at least one option");
      if (promoChecked && !promoDuration) throw new Error("Select a promo duration");
      await api.post(`/admin/users/promote`, {
        userId: selectedUser,
        badgeType: badgeChecked ? "blue" : undefined,
        promoActive: promoChecked ? true : undefined,
        duration: promoChecked ? promoDuration : undefined,
      });
      setSuccess("User promotion updated.");
      setSelectedUser(""); setBadgeChecked(false); setPromoChecked(false); setPromoDuration("");
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Failed to promote user");
    } finally { setSaving(false); }
  };

  const handleCancel = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      await api.post(`/admin/users/promote`, { userId: selectedUser, cancel: true });
      setSuccess("Promotion and badge cancelled.");
      setSelectedUser(""); setBadgeChecked(false); setPromoChecked(false); setPromoDuration("");
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Failed to cancel promotion");
    } finally { setSaving(false); }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Crown size={16} className="text-amber-400" />
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Promotion Requests</h3>
      </div>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      {success && <p className="text-emerald-400 text-sm mb-3">{success}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="space-y-1">
          <label className="text-xs text-neutral-400">Select User</label>
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} disabled={saving} className={SELECT}>
            <option value="">-- Select a user --</option>
            {users.map((u) => <option key={u._id} value={u._id}>{u.username} ({u.email})</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-neutral-400">Options</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" checked={badgeChecked} onChange={(e) => setBadgeChecked(e.target.checked)} disabled={saving} />
            <span className="text-sm text-neutral-300">Badge Verification (Blue Check)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" checked={promoChecked} onChange={(e) => setPromoChecked(e.target.checked)} disabled={saving} />
            <span className="text-sm text-neutral-300">Paid Promo</span>
          </label>
          {promoChecked && (
            <select value={promoDuration} onChange={(e) => setPromoDuration(e.target.value)} disabled={saving} className={SELECT}>
              <option value="">-- Select duration --</option>
              <option value="1week">1 Week</option>
              <option value="2weeks">2 Weeks</option>
              <option value="3weeks">3 Weeks</option>
            </select>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !selectedUser || (!badgeChecked && !promoChecked) || (promoChecked && !promoDuration)}
            className="bg-rose-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700 disabled:opacity-60 transition"
          >
            Save Promotion
          </button>
          {(badgeChecked || promoChecked) && (
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-1.5 bg-neutral-800 border border-neutral-700 text-neutral-300 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-700 transition"
            >
              <X size={13} /> Cancel
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-neutral-500 mt-4">
        <strong className="text-neutral-400">Note:</strong> Confirm payment via CashApp manually before promoting.
      </p>
    </div>
  );
}

