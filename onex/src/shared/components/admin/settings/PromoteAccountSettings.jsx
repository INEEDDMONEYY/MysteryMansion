import { useMemo, useState } from "react";
import { Crown } from "lucide-react";
import confetti from "canvas-confetti";
import api from "@/shared/utils/api";

const SELECT = "bg-neutral-800 border border-neutral-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500";

export default function PromoteAccountSettings({ users = [], onUserPromoted }) {
  const [selectedUser, setSelectedUser] = useState("");
  const [promotionDuration, setPromotionDuration] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [recentlyPromoted, setRecentlyPromoted] = useState([]);

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

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Crown size={16} className="text-amber-400" />
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Promote User Account</h3>
      </div>

      {successMessage && <p className="text-emerald-400 text-sm mb-3">{successMessage}</p>}
      {errorMessage && <p className="text-red-400 text-sm mb-3">{errorMessage}</p>}

      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center mb-4">
        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className={`${SELECT} flex-1`}>
          <option value="">Select user</option>
          {users.map((user) => <option key={user._id} value={user._id}>{user.username}</option>)}
        </select>
        <select value={promotionDuration} onChange={(e) => setPromotionDuration(e.target.value)} className={`${SELECT} flex-1`}>
          <option value="">Promotion duration</option>
          <option value="24hrs">24 hours</option>
          <option value="2days">2 days</option>
          <option value="4days">4 days</option>
          <option value="1week">1 week</option>
        </select>
        <button
          onClick={handlePromoteUser}
          disabled={submitting}
          className="bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700 transition whitespace-nowrap disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Promote"}
        </button>
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
                <div className="flex items-center gap-2">
                  <img
                    src={user.profilePic || "https://cdn-icons-png.flaticon.com/512/9131/9131529.png"}
                    alt={user.username}
                    className="h-8 w-8 rounded-lg object-cover border border-neutral-600"
                  />
                  <p className="text-sm font-medium text-white">{user.username || "Unknown"}</p>
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

