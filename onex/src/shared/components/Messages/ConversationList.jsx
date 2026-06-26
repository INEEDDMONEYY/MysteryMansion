import { MessageSquarePlus } from "lucide-react";

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ConversationList({
  conversations = [],
  selectedId,
  currentUserId,
  readMap = {},
  onSelect,
  onNew,
  canNew = true,
  loading = false,
}) {
  // A conversation is "unread" when its lastMessage is newer than the stored read timestamp.
  const isUnread = (conv) => {
    if (!conv.lastMessage?.createdAt) return false;
    const lastMsgTime = new Date(conv.lastMessage.createdAt).getTime();
    const lastRead    = readMap[conv._id] ? new Date(readMap[conv._id]).getTime() : 0;
    return lastMsgTime > lastRead;
  };
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900 text-base">Messages</h2>
        {canNew && (
          <button
            onClick={onNew}
            className="p-1.5 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 transition"
            title="New conversation"
          >
            <MessageSquarePlus size={18} />
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-1 p-2">
            {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-center text-sm text-gray-400 mt-12 px-4">No conversations yet.</p>
        ) : (
          conversations.map((conv) => {
            const other = conv.participants?.find(
              (p) => String(p._id) !== String(currentUserId)
            ) || {};
            const isActive  = selectedId === conv._id;
            const unread    = !isActive && isUnread(conv);
            const lastText  = conv.lastMessage?.text || 'No messages yet';
            const lastTime  = conv.lastMessage?.createdAt || conv.updatedAt;
            const initial   = (other.username || '?').charAt(0).toUpperCase();

            return (
              <button
                key={conv._id}
                onClick={() => onSelect(conv._id)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left ${
                  isActive ? 'bg-pink-50 border-r-2 border-pink-500' : ''
                }`}
              >
                {/* Avatar */}
                <div className="shrink-0 relative w-11 h-11">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {other.profilePic
                      ? <img src={other.profilePic} alt={other.username} className="w-full h-full object-cover" />
                      : initial}
                  </div>
                  {/* Unread red dot */}
                  {unread && (
                    <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className={`text-sm truncate ${
                      unread ? 'font-bold text-gray-900' : isActive ? 'font-semibold text-pink-700' : 'font-semibold text-gray-900'
                    }`}>
                      {other.username || 'Unknown'}
                    </span>
                    <span className={`text-[11px] shrink-0 ml-2 ${unread ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                      {timeAgo(lastTime)}
                    </span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${unread ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                    {lastText}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
