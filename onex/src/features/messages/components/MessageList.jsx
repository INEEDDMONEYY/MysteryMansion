import { useEffect, useRef } from "react";
import MessageItem from "./MessageItem";

/**
 * Reusable MessageList component for both admin and user dashboards.
 *
 * Props:
 * - messages: Array of { sender: "admin" | "user", text: string, timestamp?: string, avatarUrl?: string }
 * - currentRole: "admin" | "user"  (the perspective of the logged-in user)
 * - className?: optional custom styling classes
 */
export default function MessageList({ messages = [], currentRole = "user", className = "" }) {
  const bottomRef = useRef(null);

  // Auto-scroll to the newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className={`flex-1 overflow-y-auto p-4 bg-gray-50 ${className}`}
      style={{ minHeight: "0px" }} // ensures proper flex scroll behavior
    >
      {messages.length > 0 ? (
        messages.map((msg) => (
          <MessageItem key={msg._id || `${msg.createdAt}-${msg.text}`} message={msg} currentRole={currentRole} />
        ))
      ) : (
        <div className="text-center text-gray-400 mt-10">
          <p>No messages yet. Start the conversation!</p>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
