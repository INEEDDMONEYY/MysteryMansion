import { useState, useEffect, useContext } from "react";
import { MessageSquareText, Shield, RefreshCw, Plus } from "lucide-react";
import MessageInput from "@/shared/components/Messages/MessageInput";
import MessageList from "@/shared/components/Messages/MessageList";
import ConversationList from "@/shared/components/Messages/ConversationList";
import NewConversationModal from "@/shared/components/Messages/NewConversationModal";
import { UserContext } from "@/context/UserContext";
import api from "@/shared/utils/api";

export default function AdminMessages() {
  const { user, loading: userLoading } = useContext(UserContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch conversations
  useEffect(() => {
    if (!user || userLoading) return;
    fetchConversations();
  }, [user, userLoading]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/conversations");
      setConversations(res.data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId) => {
    setLoading(true);
    try {
      const res = await api.get(`/messages/${conversationId}`);
      setMessages(res.data);
      setSelectedConversation(
        conversations.find((c) => c._id === conversationId)
      );
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
      setSidebarOpen(false);
    }
  };

  // Send message
  const handleSend = async (messageData) => {
    if (!selectedConversation) return;
    try {
      const res = await api.post("/messages", {
        conversationId: selectedConversation._id,
        text: messageData.text,
      });
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Refresh messages
  const handleRefresh = () => {
    if (selectedConversation) fetchMessages(selectedConversation._id);
  };

  const conversationTitle = selectedConversation
    ? selectedConversation.participants
        .filter((p) => String(p._id) !== String(user?._id))
        .map((p) => p.username)
        .join(", ") || "Conversation"
    : "Admin Messages";

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="relative flex h-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
      {/* ── Conversation list panel ── */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed md:static top-0 left-0 h-full w-72 bg-neutral-950 border-r border-neutral-800 flex flex-col z-30 transform transition-transform duration-300 ease-in-out md:translate-x-0`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
          <h2 className="text-sm font-semibold text-white">Conversations</h2>
          <button
            onClick={() => setShowNewModal(true)}
            className="p-1.5 bg-rose-600 rounded-lg hover:bg-rose-500 transition"
            title="Start New Conversation"
          >
            <Plus size={16} />
          </button>
        </div>

        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation?._id}
          onSelect={(id) => fetchMessages(id)}
          loading={loading}
        />
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main chat area ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-1.5 rounded-lg hover:bg-neutral-800 transition"
            >
              <Shield size={18} className="text-neutral-400" />
            </button>
            <MessageSquareText size={16} className="text-neutral-500 shrink-0" />
            <h1 className="text-sm font-semibold text-white truncate">{conversationTitle}</h1>
          </div>

          {selectedConversation && (
            <button
              onClick={handleRefresh}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 transition"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-neutral-950/50 p-3 sm:p-4">
          {selectedConversation ? (
            <MessageList messages={messages} currentRole="admin" />
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-500 text-sm text-center p-6">
              Select a conversation or start a new one to begin chatting.
            </div>
          )}
        </div>

        {/* Input */}
        {selectedConversation && (
          <div className="border-t border-neutral-800">
            <MessageInput
              onSend={handleSend}
              senderRole={user?.role || "admin"}
              placeholder={`Message ${conversationTitle}…`}
            />
          </div>
        )}
      </main>

      {/* Mobile FAB */}
      <button
        onClick={() => setShowNewModal(true)}
        className="md:hidden fixed bottom-5 left-5 z-40 p-3 rounded-full bg-rose-600 hover:bg-rose-500 shadow-lg transition"
        aria-label="Start new conversation"
      >
        <Plus size={20} />
      </button>

      {showNewModal && (
        <NewConversationModal
          onClose={() => setShowNewModal(false)}
          currentUserId={user?._id}
          allowBroadcast={user?.role === "admin"}
          onBroadcast={async (result) => {
            await fetchConversations();
            const latestConversationId = result?.data?.latestConversationId;
            if (latestConversationId) fetchMessages(latestConversationId);
          }}
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
