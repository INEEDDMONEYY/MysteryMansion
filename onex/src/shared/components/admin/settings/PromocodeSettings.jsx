import { useEffect, useState } from "react";
import { Ticket, Plus, Trash2 } from "lucide-react";
import api from "@/shared/utils/api";

const INPUT = "bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500 w-full";
const SELECT = "bg-neutral-800 border border-neutral-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500 w-full";

export default function PromocodeSettings() {
  const [code, setCode] = useState("");
  const [duration, setDuration] = useState("7");
  const [maxUses, setMaxUses] = useState("1");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [promoCodes, setPromoCodes] = useState([]);

  const fetchPromoCodes = async () => {
    try {
      const res = await api.get("/admin/promo-codes");
      const codes = res.data?.data;
      setPromoCodes(Array.isArray(codes) ? codes : []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load promo codes.");
    }
  };

  useEffect(() => { fetchPromoCodes(); }, []);

  const handleCreateCode = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) { setError("Promo code is required."); return; }
    try {
      const res = await api.post("/admin/promo-codes", {
        code: normalizedCode,
        durationDays: Number(duration),
        maxUses: Number(maxUses),
        assignedUser: userId.trim() || "",
      });
      const created = res.data?.data;
      if (created) setPromoCodes((prev) => [created, ...prev]);
      setSuccess(`Promo code ${normalizedCode} created.`);
      setCode(""); setDuration("7"); setMaxUses("1"); setUserId("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create promo code.");
    }
  };

  const handleDeleteCode = async (promoId, promoCode) => {
    if (!promoId) return;
    if (!window.confirm(`Delete promo code ${promoCode || ""}?`)) return;
    setError(""); setSuccess(""); setDeletingId(promoId);
    try {
      await api.delete(`/admin/promo-codes/${promoId}`);
      setPromoCodes((prev) => prev.filter((p) => (p._id || p.id) !== promoId));
      setSuccess(`Promo code ${promoCode || ""} deleted.`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete promo code.");
    } finally { setDeletingId(""); }
  };

  return (
    <div className="space-y-4">
      {/* Create form */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Ticket size={16} className="text-amber-400" />
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Create Promo Code</h3>
        </div>

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        {success && <p className="text-emerald-400 text-sm mb-3">{success}</p>}

        <form onSubmit={handleCreateCode} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-400">Code</label>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="FREEPOST" required className={INPUT} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-400">Duration</label>
            <select value={duration} onChange={(e) => setDuration(e.target.value)} className={SELECT}>
              <option value="1">1 Day</option>
              <option value="7">7 Days</option>
              <option value="30">30 Days</option>
              <option value="90">90 Days</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-400">Max Uses</label>
            <input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} min="1" className={INPUT} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-400">Assign to User (optional)</label>
            <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Username or ID" className={INPUT} />
          </div>
          <div className="sm:col-span-2 xl:col-span-4 flex justify-end">
            <button type="submit" className="flex items-center gap-1.5 bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700 transition">
              <Plus size={15} /> Create Code
            </button>
          </div>
        </form>
      </div>

      {/* Existing codes */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Active Promo Codes</h3>

        {promoCodes.length === 0 ? (
          <p className="text-neutral-500 text-sm">No promo codes created yet.</p>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {promoCodes.map((promo) => (
                <div key={promo._id || promo.id} className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-amber-400">{promo.code}</span>
                    <span className="text-xs text-neutral-500">{promo.createdAt ? new Date(promo.createdAt).toLocaleDateString() : "-"}</span>
                  </div>
                  <div className="text-sm text-neutral-300 space-y-1">
                    <p><span className="text-neutral-500">Duration:</span> {promo.durationDays || promo.duration} days</p>
                    <p><span className="text-neutral-500">Uses:</span> {promo.usageCount || 0}/{promo.maxUses}</p>
                    <p><span className="text-neutral-500">Assigned:</span> {promo.assignedUser?.username || promo.assignedUser?.email || "All Users"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCode(promo._id || promo.id, promo.code)}
                    disabled={deletingId === (promo._id || promo.id)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 bg-red-700 text-white px-3 py-2 rounded-xl text-xs font-medium hover:bg-red-600 disabled:opacity-60"
                  >
                    <Trash2 size={12} /> {deletingId === (promo._id || promo.id) ? "Deleting…" : "Delete"}
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-neutral-800">
                    <th className="pb-2 text-xs text-neutral-400 font-medium">Code</th>
                    <th className="pb-2 text-xs text-neutral-400 font-medium">Duration</th>
                    <th className="pb-2 text-xs text-neutral-400 font-medium">Uses</th>
                    <th className="pb-2 text-xs text-neutral-400 font-medium">Assigned</th>
                    <th className="pb-2 text-xs text-neutral-400 font-medium">Created</th>
                    <th className="pb-2 text-xs text-neutral-400 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {promoCodes.map((promo) => (
                    <tr key={promo._id || promo.id}>
                      <td className="py-3 font-semibold text-amber-400">{promo.code}</td>
                      <td className="py-3 text-neutral-300">{promo.durationDays || promo.duration}d</td>
                      <td className="py-3 text-neutral-300">{promo.usageCount || 0}/{promo.maxUses}</td>
                      <td className="py-3 text-neutral-300">{promo.assignedUser?.username || promo.assignedUser?.email || "All"}</td>
                      <td className="py-3 text-neutral-500 text-xs">{promo.createdAt ? new Date(promo.createdAt).toLocaleDateString() : "-"}</td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteCode(promo._id || promo.id, promo.code)}
                          disabled={deletingId === (promo._id || promo.id)}
                          className="flex items-center gap-1 ml-auto bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600 disabled:opacity-60"
                        >
                          <Trash2 size={11} /> {deletingId === (promo._id || promo.id) ? "Deleting…" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

