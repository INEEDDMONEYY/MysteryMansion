import { useContext, useEffect, useMemo, useState } from "react";
import { Mail, Loader2, CheckCircle, XCircle } from "lucide-react";
import { UserContext } from "@/context/UserContext";

export default function EmailSettings({ user }) {
  const { updateProfile } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [promoEmails, setPromoEmails] = useState(true);
  const [activityEmails, setActivityEmails] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const userId = user?._id || user?.id || "";
  const prefsKey = useMemo(
    () => (userId ? `emailPrefs_${userId}` : "emailPrefs"),
    [userId]
  );

  useEffect(() => {
    setEmail((user?.email || "").trim());
  }, [user?.email]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(prefsKey);
      if (!raw) return;
      const prefs = JSON.parse(raw);
      if (typeof prefs?.promoEmails === "boolean") setPromoEmails(prefs.promoEmails);
      if (typeof prefs?.activityEmails === "boolean") setActivityEmails(prefs.activityEmails);
    } catch {
      // no-op on malformed localStorage
    }
  }, [prefsKey]);

  const handleSave = async () => {
    if (!email.trim()) {
      setToast({ type: "error", message: "Email cannot be empty." });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ email: email.trim().toLowerCase() });

      localStorage.setItem(
        prefsKey,
        JSON.stringify({ promoEmails, activityEmails })
      );

      setToast({ type: "success", message: "Email settings updated successfully!" });
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Failed to update email settings.",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <section className="w-full px-4 py-6 md:px-6 lg:px-8">
      {toast && (
        <div
          className={`flex items-center justify-center gap-2 px-4 py-2 mb-4 rounded-lg shadow text-white text-sm transition-all ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="bg-white rounded-lg p-6 flex flex-col items-center justify-center space-y-4 max-w-md mx-auto text-center">
        <label className="block text-pink-600 font-medium flex items-center gap-2">
          <Mail size={16} /> Email Address
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full max-w-xs border border-pink-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 text-center"
        />

        <div className="w-full max-w-xs text-left space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={promoEmails}
              onChange={(e) => setPromoEmails(e.target.checked)}
              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            Receive promotional emails
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={activityEmails}
              onChange={(e) => setActivityEmails(e.target.checked)}
              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            Receive activity notifications
          </label>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleSave}
          className={`flex items-center justify-center gap-2 bg-pink-600 text-white px-6 py-2 rounded transition ${
            loading ? "opacity-70 cursor-not-allowed" : "hover:bg-pink-700"
          }`}
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : "Save"}
        </button>
      </div>
    </section>
  );
}