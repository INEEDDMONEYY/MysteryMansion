import { useEffect, useRef, useState } from "react";
import { Smile } from "lucide-react";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export default function MessageItem({ message, currentUserId, onReact }) {
  const senderId   = String(message?.sender?._id || message?.sender || '');
  const senderName   = message?.sender?.username || 'User';
  const senderAvatar = message?.sender?.profilePic || '';
  const isOwn        = senderId === String(currentUserId);

  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [pickerOpen]);

  const formattedTime = message?.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  // Group raw {emoji, userId} reactions into { emoji: [userId, ...] } for counts/pills
  const grouped = (message?.reactions || []).reduce((acc, r) => {
    const uid = String(r.userId?._id || r.userId || '');
    (acc[r.emoji] ||= []).push(uid);
    return acc;
  }, {});

  const handlePick = (emoji) => {
    onReact?.(message._id, emoji);
    setPickerOpen(false);
  };

  return (
    <div className={`group flex items-end gap-2 mb-1 ${ isOwn ? 'flex-row-reverse' : 'flex-row' }`}>

      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
        {senderAvatar
          ? <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
          : senderName.charAt(0).toUpperCase()}
      </div>

      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className="relative">
          {/* Bubble */}
          <div className={`px-3.5 py-2.5 rounded-2xl shadow-sm ${
            isOwn
              ? 'bg-pink-600 text-white rounded-br-sm'
              : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm'
          }`}>
            <p className="text-sm leading-relaxed break-words">{message.text}</p>
            {formattedTime && (
              <span className={`block text-[10px] mt-1 text-right ${ isOwn ? 'text-pink-200' : 'text-gray-400' }`}>
                {formattedTime}
              </span>
            )}
          </div>

          {/* Reaction trigger — visible on hover */}
          {onReact && (
            <button
              onClick={() => setPickerOpen((v) => !v)}
              className={`absolute top-1/2 -translate-y-1/2 ${isOwn ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 focus:opacity-100 transition p-1.5 rounded-full hover:bg-gray-200 text-gray-400`}
              title="React"
            >
              <Smile size={14} />
            </button>
          )}

          {/* Emoji picker popover */}
          {pickerOpen && (
            <div
              ref={pickerRef}
              className={`absolute z-10 -top-11 ${isOwn ? 'right-0' : 'left-0'} flex gap-1 bg-white border border-gray-200 rounded-full shadow-lg px-2 py-1.5`}
            >
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handlePick(emoji)}
                  className="text-base leading-none hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reaction pills */}
        {Object.keys(grouped).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(grouped).map(([emoji, userIds]) => {
              const mine = userIds.includes(String(currentUserId));
              return (
                <button
                  key={emoji}
                  onClick={() => onReact?.(message._id, emoji)}
                  className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full border transition ${
                    mine
                      ? 'bg-pink-50 border-pink-300 text-pink-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{userIds.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

