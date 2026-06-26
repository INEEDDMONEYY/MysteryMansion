import { useEffect, useState, useContext } from "react";
import { ArrowLeft, Coins, AlertCircle, MessageCircle, RefreshCw } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import MessageInput from "@/shared/components/Messages/MessageInput";
import MessageList from "@/shared/components/Messages/MessageList";
import ConversationList from "@/shared/components/Messages/ConversationList";
import NewConversationModal from "@/shared/components/Messages/NewConversationModal";
import { UserContext } from "@/context/UserContext";
import api from "@/shared/utils/api";
import { setSEO } from "@/shared/utils/seo";

const CREDITS_PER_MESSAGE = 20;

export default function UserMessages() {
  const { user, loading: userLoading } = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const [conversations, setConversations]               = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages]                         = useState([]);
  const [showNewModal, setShowNewModal]                 = useState(false);
  const [convLoading, setConvLoading]                   = useState(false);
  const [msgLoading, setMsgLoading]                     = useState(false);
  const [mobileView, setMobileView]                     = useState("list");
  const isClient = user?.accountType === "client";
  const [credits, setCredits] = useState(null);

  // --- Unread tracking ---
  // readMap: { [conversationId]: ISO timestamp of last time the user opened it }
  // Stored in localStorage keyed to the user so different accounts don't share state.
  const readMapKey = user?._id ? `mm_read_${user._id}` : null;
  const [readMap, setReadMap] = useState(() => {
    if (!readMapKey) return {};
    try { return JSON.parse(localStorage.getItem(readMapKey) || '{}'); } catch { return {}; }
  });

  const markRead = (convId) => {
    const now = new Date().toISOString();
    setReadMap((prev) => {
      const next = { ...prev, [convId]: now };
      if (readMapKey) localStorage.setItem(readMapKey, JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    setSEO("Messages | Mystery Mansion", "", { robots: "noindex, nofollow" });
  }, []);

  useEffect(() => {
    if (!user || userLoading) return;
    fetchConversations();
    if (isClient) {
      api.get("/credits/balance").then(r => setCredits(r.data.credits ?? 0)).catch(() => {});
    }
  }, [user, userLoading]);

  const fetchConversations = async () => {
    setConvLoading(true);
    try {
      const { data } = await api.get("/conversations");
      setConversations(data);

      // If a ?conv= param was provided (e.g. from a notification click), auto-open that conversation
      const convId = searchParams.get('conv');
      if (convId) {
        const match = Array.isArray(data) ? data.find((c) => c._id === convId) : null;
        if (match) {
          setSelectedConversation(match);
          setMobileView("chat");
          markRead(convId);
        }
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setConvLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    setMsgLoading(true);
    markRead(conversationId);
    try {
      const { data } = await api.get(`/messages/${conversationId}`);
      setMessages(data);
      setSelectedConversation(conversations.find((c) => c._id === conversationId) || null);
      setMobileView("chat");
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setMsgLoading(false);
    }
  };

  const handleSend = async ({ text }) => {
    if (!selectedConversation) return;
    const { data: msg } = await api.post("/messages", {
      conversationId: selectedConversation._id,
      text,
    });
    setMessages((prev) => [...prev, msg]);
    setConversations((prev) =>
      prev.map((c) =>
        c._id === selectedConversation._id
          ? { ...c, lastMessage: msg, updatedAt: msg.createdAt }
          : c
      )
    );
    if (isClient) setCredits((c) => Math.max(0, (c ?? 0) - CREDITS_PER_MESSAGE));
  };

  const hasAdminConversation = conversations.some((c) =>
    c.participants?.some((p) => p.role === "admin")
  );
  const canStartNew       = isClient ? true : !hasAdminConversation;
  const otherParticipant  = selectedConversation
    ? selectedConversation.participants?.find((p) => String(p._id) !== String(user?._id))
    : null;
  const insufficientCredits = isClient && credits !== null && credits < CREDITS_PER_MESSAGE;

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50 -m-4 md:-m-6">

      {/* Conversation list */}
      <div className={`w-full md:w-80 lg:w-96 shrink-0 flex flex-col md:border-r md:border-gray-200 ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}>
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation?._id}
          currentUserId={user?._id}
          readMap={readMap}
          onSelect={fetchMessages}
          onNew={() => setShowNewModal(true)}
          canNew={canStartNew}
          loading={convLoading}
        />
      </div>

      {/* Chat panel */}
      <div className={`flex-1 flex flex-col min-w-0 bg-white ${mobileView === "list" ? "hidden md:flex" : "flex"}`}>

        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white shadow-sm">
              <button onClick={() => setMobileView("list")} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition">
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                {otherParticipant?.profilePic
                  ? <img src={otherParticipant.profilePic} alt={otherParticipant.username} className="w-full h-full object-cover" />
                  : (otherParticipant?.username || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{otherParticipant?.username || "Unknown"}</p>
                {otherParticipant?.role === "admin" && <p className="text-xs text-pink-500 font-medium">Support</p>}
              </div>
              <button onClick={() => fetchMessages(selectedConversation._id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition" title="Refresh">
                <RefreshCw size={16} />
              </button>
            </div>

            {/* Credits bar */}
            {isClient && credits !== null && (
              <div className={`flex items-center justify-between px-4 py-2 text-xs border-b ${insufficientCredits ? "bg-red-50 border-red-100 text-red-600" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
                <span className="flex items-center gap-1.5">
                  <Coins size={12} />
                  <strong>{credits}</strong> credits — {CREDITS_PER_MESSAGE} per message
                </span>
                {insufficientCredits && (
                  <Link to="/client/credits" className="flex items-center gap-1 font-semibold hover:underline">
                    <AlertCircle size={11} /> Top up
                  </Link>
                )}
              </div>
            )}

            {/* Messages */}
            {msgLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-7 h-7 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
              </div>
            ) : (
              <MessageList messages={messages} currentUserId={user?._id} className="flex-1" />
            )}

            {/* Input */}
            {insufficientCredits ? (
              <div className="px-4 py-4 bg-white border-t border-gray-100 text-center text-sm text-red-500">
                You need at least {CREDITS_PER_MESSAGE} credits to send a message.{" "}
                <Link to="/client/credits" className="font-semibold text-pink-600 hover:underline">Top up credits</Link>
              </div>
            ) : (
              <MessageInput onSend={handleSend} placeholder={`Message ${otherParticipant?.username || ""}\u2026`} />
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8 text-gray-400">
            <MessageCircle size={48} className="opacity-20" />
            <p className="text-base font-medium text-gray-500">Select a conversation</p>
            <p className="text-sm">Or start a new one to begin chatting.</p>
            {canStartNew && (
              <button onClick={() => setShowNewModal(true)} className="mt-2 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-sm font-semibold transition-colors">
                Start a conversation
              </button>
            )}
          </div>
        )}
      </div>

      {showNewModal && (
        <NewConversationModal
          onClose={() => setShowNewModal(false)}
          currentUserId={user?._id}
          restrictToRole={isClient ? null : "admin"}
          excludedRecipientIds={isClient ? [] : conversations.flatMap(c => c.participants || []).filter(p => p.role === "admin").map(p => String(p._id))}
          onCreate={(newConv) => {
            setConversations((prev) => [newConv, ...prev]);
            setShowNewModal(false);
            fetchMessages(newConv._id);
          }}
        />
      )}
    </div>
  );
}
