import { useMemo, useState } from "react";
import { Crown, X } from "lucide-react";
import confetti from "canvas-confetti";
import api from "@/shared/utils/api";

const SELECT = "bg-neutral-800 border border-neutral-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500";

const DURATION_OPTIONS = [
  { value: "24hrs",   label: "24 hours" },
  { value: "2days",   label: "2 days" },
  { value: "4days",   label: "4 days" },
  { value: "1week",   label: "1 week" },
  { value: "2weeks",  label: "2 weeks" },
  { value: "3weeks",  label: "3 weeks" },
  { value: "monthly", label: "1 month" },
];

export default function PromoteAccountSettings({ users = [], onUserPromoted }) {
  const [selectedUser, setSelectedUser] = useState("");
  const [promotionDuration, setPromotionDuration] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [recentlyPromoted, setRecentlyPromoted] = useState([]);

  // Only show provider accounts (exclude admins and clients)
  const selectableUsers = useMemo(
    () => users.filter((u) => u.role !== "admin" && u.accountType === "provider"),
    [users]
  );

  const activePromotedUsers = useMemo(() => {
    const now = new Date();
    return users.filter((user) => {
      if (!user?.activePromoExpiry) return false;
      const expiry = new Date(user.activePromoExpiry);
      return !Number.isNaN(expiry.getTime()) && expiry > now;
    });
  }, [users]);

  const promotedUsers = [...recentlyPromoted, ...activePromotedUsers].filter(
    (user, index, arr) => index === arr.findIndex((item) => item?._id === user?._id)
  );

  const selectedUserProfile = users.find((user) => user._id === selectedUser);

  const showConfetti = () => confetti({
    particleCount: 140, spread: 90, origin: { y: 0.6 },
    colors: ["#ec4899", "#f472b6", "#fb7185", "#f9a8d4"],
  });

  const handlePromoteUser = async () => {
    setSuccessMessage(""); setErrorMessage("");
    if (!selectedUser || !promotionDuration) {
      setErrorMessage("Please select a user and promotion duration.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await api.post("/admin/users/promote",
        { userId: selectedUser, duration: promotionDuration },
        { withCredentials: true }
      );
      const promotedUser = response?.data?.data?.promotedUser;
      const expiresAt = response?.data?.data?.expiresAt;
      const selectedUsername = selectedUserProfile?.username || promotedUser?.username || "User";
      const promotedEntry = promotedUser || selectedUserProfile;
      if (promotedEntry) {
        const updatedEntry = { ...promotedEntry, activePromoExpiry: expiresAt || promotedUser?.activePromoExpiry };
        setRecentlyPromoted((prev) => [updatedEntry, ...prev.filter((item) => item?._id !== promotedEntry._id)]);
        onUserPromoted?.(promotedEntry._id, expiresAt || promotedUser?.activePromoExpiry);
      }
      showConfetti();
      setSuccessMessage(`${selectedUsername} is now in the promoted accounts section.`);
      setSelectedUser(""); setPromotionDuration("");
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Failed to promote user.");
    } finally { setSubmitting(false); }
  };

  const handlePromoteAll = async () => {
    setSuccessMessage(""); setErrorMessage("");
    if (!promotionDuration) {
      setErrorMessage("Please select a promotion duration first.");
      return;
    }
    if (!window.confirm(`Promote ALL ${selectableUsers.length} users for the selected duration?`)) return;
    setSubmitting(true);
    try {
      const response = await api.post("/admin/users/promote-all",
        { duration: promotionDuration },
        { withCredentials: true }
      );
      showConfetti();
      setSuccessMessage(response?.data?.message || "All users promoted.");
      setPromotionDuration("");
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Failed to promote all users.");
    } finally { setSubmitting(false); }
  };

  const handleCancelUser = async (userId, username) => {
    setSuccessMessage(""); setErrorMessage("");
    if (!window.confirm(`Cancel promotion for ${username}?`)) return;
    setSubmitting(true);
    try {
      await api.post("/admin/users/promote", { userId, cancel: true }, { withCredentials: true });
      setRecentlyPromoted((prev) => prev.filter((u) => u._id !== userId));
      onUserPromoted?.(userId, null);
      setSuccessMessage(`Promotion cancelled for ${username}.`);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Failed to cancel promotion.");
    } finally { setSubmitting(false); }
  };

  const handleCancelAll = async () => {
    setSuccessMessage(""); setErrorMessage("");
    if (!window.confirm(`Cancel ALL active promotions? This cannot be undone.`)) return;
    setSubmitting(true);
    try {
      const response = await api.post("/admin/users/cancel-all-promotions", {}, { withCredentials: true });
      setRecentlyPromoted([]);
      setSuccessMessage(response?.data?.message || "All promotions cancelled.");
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Failed to cancel all promotions.");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Crown size={16} className="text-amber-400" />
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Promote User Account</h3>
      </div>

      {successMessage && <p className="text-emerald-400 text-sm mb-3">{successMessage}</p>}
      {errorMessage && <p className="text-red-400 text-sm mb-3">{errorMessage}</p>}

      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center mb-3">
        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className={`${SELECT} flex-1`}>
          <option value="">Select user</option>
          {selectableUsers.map((user) => <option key={user._id} value={user._id}>{user.username}</option>)}
        </select>
        <select value={promotionDuration} onChange={(e) => setPromotionDuration(e.target.value)} className={`${SELECT} flex-1`}>
          <option value="">Promotion duration</option>
          {DURATION_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button
          onClick={handlePromoteUser}
          disabled={submitting}
          className="bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700 transition whitespace-nowrap disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Promote"}
        </button>
      </div>

      {/* Promote All + Cancel All row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={handlePromoteAll}
          disabled={submitting || !promotionDuration}
          className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/40 text-amber-400 hover:bg-amber-500/25 px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Crown size={13} />
          Promote All ({selectableUsers.length})
        </button>
        {promotedUsers.length > 0 && (
          <button
            onClick={handleCancelAll}
            disabled={submitting}
            className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-40"
          >
            <X size={13} />
            Cancel All ({promotedUsers.length})
          </button>
        )}
        {!promotionDuration && (
          <span className="text-xs text-neutral-500">Select a duration to promote</span>
        )}
      </div>

      {selectedUserProfile && (
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-3 mb-4">
          <p className="text-xs text-neutral-500 mb-2">Selected user</p>
          <div className="flex items-center gap-3">
            <img
              src={selectedUserProfile.profilePic || "https://cdn-icons-png.flaticon.com/512/9131/9131529.png"}
              alt={selectedUserProfile.username}
              className="h-9 w-9 rounded-xl object-cover border border-neutral-600"
            />
            <div>
              <p className="text-sm font-medium text-white">{selectedUserProfile.username}</p>
              <p className="text-xs text-neutral-500">Will be promoted after saving.</p>
            </div>
          </div>
        </div>
      )}

      {promotedUsers.length > 0 && (
        <div>
          <p className="text-xs text-neutral-500 mb-3">Currently promoted accounts</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {promotedUsers.map((user) => (
              <div key={user._id} className="bg-neutral-800 border border-neutral-700 rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={user.profilePic || "https://cdn-icons-png.flaticon.com/512/9131/9131529.png"}
                      alt={user.username}
                      className="h-8 w-8 rounded-lg object-cover border border-neutral-600 shrink-0"
                    />
                    <p className="text-sm font-medium text-white truncate">{user.username || "Unknown"}</p>
                  </div>
                  <button
                    onClick={() => handleCancelUser(user._id, user.username || "this user")}
                    disabled={submitting}
                    title="Cancel promotion"
                    className="shrink-0 p-1 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-40"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  Active until: {user.activePromoExpiry ? new Date(user.activePromoExpiry).toLocaleString() : "Unknown"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

