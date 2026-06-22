import { useState } from "react";
import { Send } from "lucide-react";

/**
 * A reusable message input component that can be used in both
 * admin and user dashboards.
 *
 * Props:
 * - onSend(messageData): Function called when message is submitted
 * - senderRole: "admin" | "user" (used for message metadata or styling)
 * - placeholder?: Optional input placeholder text
 */
export default function MessageInput({
  onSend,
  senderRole = "user",
  placeholder = "Type a message...",
}) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);

    // Build message data (could include role, timestamp, etc.)
    const messageData = {
      sender: senderRole,
      text: message.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      // Delegate sending logic to parent
      await onSend?.(messageData);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-2 border-t border-gray-200 bg-white"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isSending}
      />
      <button
        type="submit"
        disabled={isSending || !message.trim()}
        className={`p-2 rounded-full text-white ${
          isSending ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        <Send size={18} />
      </button>
    </form>
  );
}
