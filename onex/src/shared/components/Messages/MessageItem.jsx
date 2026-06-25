export default function MessageItem({ message, currentUserId }) {
  const senderId   = String(message?.sender?._id || message?.sender || '');
  const senderName   = message?.sender?.username || 'User';
  const senderAvatar = message?.sender?.profilePic || '';
  const isOwn        = senderId === String(currentUserId);

  const formattedTime = message?.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex items-end gap-2 mb-1 ${ isOwn ? 'flex-row-reverse' : 'flex-row' }`}>

      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
        {senderAvatar
          ? <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
          : senderName.charAt(0).toUpperCase()}
      </div>

      {/* Bubble */}
      <div className={`max-w-[70%] px-3.5 py-2.5 rounded-2xl shadow-sm ${
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
    </div>
  );
}
