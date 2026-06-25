import { useEffect, useState, useContext } from "react";
import {
  MessageSquareText,
  Plus,
  RefreshCw,
  Menu,
  Coins,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import MessageInput from "@/shared/components/Messages/MessageInput";
import MessageList from "@/shared/components/Messages/MessageList";
import ConversationList from "@/shared/components/Messages/ConversationList";
import NewConversationModal from "@/shared/components/Messages/NewConversationModal";
import { UserContext } from "@/context/UserContext"; // ✅ use context directly
import api from "@/shared/utils/api";

export default function UserMessages() {
  const { user, loading: userLoading } = useContext(UserContext); // ✅ Step 2
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isClient = user?.accountType === 'client';
  const [credits, setCredits] = useState(null);

  const adminParticipantIds = Array.from(
    new Set(
      conversations.flatMap((conversation) =>
        (conversation?.participants || [])
          .filter((participant) => participant?.role === "admin" && participant?._id)
          .map((participant) => String(participant?._id))
      )
    )
  );
  const hasAdminConversation = adminParticipantIds.length > 0;

  // For the "+" button: clients can message providers too,
  // so disable only if they already have a conversation with every available recipient (impossible to know upfront).
  // For non-client users, disable once they have an admin conversation.
  const canStartNew = isClient ? true : !hasAdminConversation;

  // 🔹 Fetch conversations from backend
  useEffect(() => {
    if (!user || userLoading) return;
    fetchConversations();
    if (user.accountType === 'client') {
      api.get('/credits/balance').then(r => setCredits(r.data.credits ?? 0)).catch(() => {});
    }
  }, [user, userLoading]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/conversations");
      setConversations(res.data);
    } catch (err) {
      console.error("❌ Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch messages for selected conversation
  const fetchMessages = async (conversationId) => {
    setLoading(true);
    try {
      const res = await api.get(`/messages/${conversationId}`);
      setMessages(res.data);
      setSelectedConversation(
        conversations.find((c) => c._id === conversationId)
      );
    } catch (err) {
      console.error("❌ Failed to load messages:", err);
    } finally {
      setLoading(false);
      setSidebarOpen(false);
    }
  };

  // 🔹 Send a new message
  const handleSend = async (messageData) => {
    if (!selectedConversation) return;

    try {
      const res = await api.post("/messages", {
        conversationId: selectedConversation._id,
        text: messageData.text,
      });

      setMessages((prev) => [...prev, res.data]);
      // Deduct 20 credits locally for instant UI feedback (client only)
      if (isClient) setCredits((c) => Math.max(0, (c ?? 0) - 20));
    } catch (err) {
      if (err?.response?.status === 402) {
        // Insufficient credits — refresh balance from server
        api.get('/credits/balance').then(r => setCredits(r.data.credits ?? 0)).catch(() => {});
      }
      console.error("❌ Failed to send message:", err);
    }
  };

  // 🔹 Refresh messages
  const handleRefresh = () => {
    if (selectedConversation) fetchMessages(selectedConversation._id);
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <p>Loading your messages...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex bg-gradient-to-br from-black via-gray-900 to-pink-700 text-white">
      {/* Sidebar (Conversations) */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed md:static top-0 left-0 h-full w-72 bg-black/30 border-r border-pink-500/40 flex flex-col z-30 transform transition-transform duration-300 ease-in-out md:translate-x-0`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-pink-500/40 bg-black/40">
          <h2 className="text-lg font-semibold tracking-wide">Messages</h2>
          <button
            onClick={() => setShowNewModal(true)}
            disabled={!canStartNew}
            className="p-1.5 bg-pink-600 rounded-lg hover:bg-pink-500 transition disabled:cursor-not-allowed disabled:opacity-50"
            title={canStartNew ? 'Start New Conversation' : 'Admin already exists in your message list'}
          >
            <Plus size={18} />
          </button>
        </div>

        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation?._id}
          onSelect={(id) => fetchMessages(id)}
          loading={loading}
        />
      </aside>

      {/* Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col md:ml-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-pink-500/40 bg-black/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-1 rounded hover:bg-pink-600/30 transition"
            >
              <Menu size={22} className="text-pink-400" />
            </button>
            <MessageSquareText className="text-pink-400" size={20} />
            <h1 className="text-lg font-semibold truncate max-w-[150px] sm:max-w-none">
              {selectedConversation
                ? selectedConversation.participants
                    .filter((p) => p._id !== user._id)
                    .map((p) => p.username)
                    .join(", ")
                : "Messages"}
            </h1>
          </div>

          {selectedConversation && (
            <button
              onClick={handleRefresh}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-sm font-medium"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          )}
        </div>

        {/* Messages Section */}
        <div className="flex-1 overflow-y-auto bg-white/10 backdrop-blur-sm">
          {selectedConversation ? (
            <MessageList messages={messages} currentRole={user.role} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300 text-center p-6">
              <p>Select a conversation or start a new one to begin chatting.</p>
            </div>
          )}
        </div>

        {/* Message Input */}
        {selectedConversation && (
          <div className="border-t border-pink-500/30 bg-black/30">
            {/* Credits indicator (client only) */}
            {isClient && credits !== null && (
              <div className={`flex items-center justify-between px-4 py-2 text-xs border-b border-pink-500/20 ${
                credits < 20 ? 'bg-red-900/40 text-red-300' : 'bg-black/20 text-pink-300'
              }`}>
                <span className="flex items-center gap-1.5">
                  <Coins size={13} />
                  <strong>{credits}</strong> credits remaining
                  &nbsp;&mdash;&nbsp;20 per message
                </span>
                {credits < 20 && (
                  <Link
                    to="/client/credits"
                    className="flex items-center gap-1 text-yellow-400 font-semibold hover:underline"
                  >
                    <AlertCircle size={12} /> Top up
                  </Link>
                )}
              </div>
            )}
            {isClient && credits !== null && credits < 20 ? (
              <div className="px-4 py-4 text-center text-sm text-red-300">
                You need at least 20 credits to send a message.&nbsp;
                <Link to="/client/credits" className="text-yellow-400 font-semibold hover:underline">Top up credits</Link>
              </div>
            ) : (
              <MessageInput
                onSend={handleSend}
                senderRole={user.role}
                placeholder={`Message ${
                  selectedConversation.participants
                    .filter((p) => p._id !== user._id)
                    .map((p) => p.username)
                    .join(", ")
                }...`}
              />
            )}
          </div>
        )}
      </main>

      {/* New Conversation Modal */}
      {showNewModal && (
        <NewConversationModal
          onClose={() => setShowNewModal(false)}
          currentUserId={user?._id}
          restrictToRole={isClient ? null : "admin"}
          accountTypeFilter={isClient ? null : null}
          excludedRecipientIds={isClient ? [] : adminParticipantIds}
          onCreate={(newConversation) => {
            setConversations((prev) => [newConversation, ...prev]);
            setShowNewModal(false);
            fetchMessages(newConversation._id);
          }}
        />
      )}
    </div>
  );
}
