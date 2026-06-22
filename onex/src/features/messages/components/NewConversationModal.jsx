import { useEffect, useMemo, useState } from "react";
import { X, Send } from "lucide-react";
import api from "@/shared/utils/api";

export default function NewConversationModal({
  onClose,
  onCreated,
  onCreate,
  onBroadcast,
  currentUserId,
  restrictToRole,
  excludedRecipientIds,
  allowBroadcast = false,
}) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [mode, setMode] = useState("direct");
  const [loading, setLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const handleCreated = onCreated || onCreate;
  const normalizedExcludedRecipientIds = useMemo(
    () => (Array.isArray(excludedRecipientIds) ? excludedRecipientIds.map(String) : []),
    [excludedRecipientIds]
  );

  const excludedRecipientIdsKey = normalizedExcludedRecipientIds.join("|");

  // Fetch users and filter by role/exclusions when provided.
  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const { data } = await api.get("/public/users");
        const rawUsers = Array.isArray(data)
          ? data
          : data?.data || data?.users || [];

        const excludedSet = new Set(normalizedExcludedRecipientIds);
        const filteredUsers = rawUsers.filter((user) => {
          if (!user?._id) return false;
          if (currentUserId && String(user._id) === String(currentUserId)) return false;
          if (restrictToRole && user.role !== restrictToRole) return false;
          if (excludedSet.has(String(user._id))) return false;
          return true;
        });

        if (!isMounted) return;
        setUsers(filteredUsers);
      } catch (err) {
        console.error("Error loading users:", err);
        if (!isMounted) return;
        setUsers([]);
      } finally {
        if (!isMounted) return;
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [currentUserId, restrictToRole, excludedRecipientIdsKey, normalizedExcludedRecipientIds]);

  // Create conversation
  const handleCreate = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const { data: newConv } = await api.post("/conversations", { recipientId: selectedUser });
      if (typeof handleCreated === "function") {
        handleCreated(newConv);
      }
      onClose();
    } catch (err) {
      console.error("Create conversation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async () => {
    if (!announcementText.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/conversations/broadcast", {
        text: announcementText.trim(),
      });

      if (typeof onBroadcast === "function") {
        onBroadcast(data);
      }

      onClose();
    } catch (err) {
      console.error("Broadcast error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl shadow-xl w-full max-w-md border border-pink-600/40 max-h-[90vh] overflow-y-auto">
        <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Start New Conversation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-pink-400 transition">
            <X size={20} />
          </button>
        </div>

        {allowBroadcast && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("direct")}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                mode === "direct"
                  ? "bg-pink-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Single User
            </button>
            <button
              type="button"
              onClick={() => setMode("broadcast")}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                mode === "broadcast"
                  ? "bg-pink-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Message All Users
            </button>
          </div>
        )}

        {mode === "direct" ? (
          <>
            {/* Dropdown */}
            <label className="block text-sm text-gray-300 mb-2">Select a user:</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              disabled={isLoadingUsers || users.length === 0}
              className="w-full bg-gray-800 text-white p-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-pink-500 mb-4"
            >
              <option value="">
                {isLoadingUsers ? "Loading users..." : "-- Choose User --"}
              </option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.username}
                </option>
              ))}
            </select>

            {!isLoadingUsers && users.length === 0 && (
              <p className="mb-4 text-xs text-gray-400">
                No users available to start a new conversation.
              </p>
            )}
          </>
        ) : (
          <>
            <label className="block text-sm text-gray-300 mb-2">Message to all users:</label>
            <textarea
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              rows={5}
              placeholder="Write one message that will be sent to every user..."
              className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-pink-500 mb-2 resize-none"
            />
            <p className="mb-4 text-xs text-gray-400">
              This creates or reuses each user conversation and sends this message once.
            </p>
          </>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={mode === "broadcast" ? handleBroadcast : handleCreate}
            disabled={
              mode === "broadcast"
                ? !announcementText.trim() || loading
                : !selectedUser || loading || isLoadingUsers || users.length === 0
            }
            className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Send size={16} />
            {loading ? "Sending..." : mode === "broadcast" ? "Send to All" : "Start Chat"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
