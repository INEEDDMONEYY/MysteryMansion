import { useState, useRef, useLayoutEffect } from "react";
import { Send } from "lucide-react";

export default function MessageInput({
  onSend,
  placeholder = "Type a message…",
  disabled = false,
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending || disabled) return;
    setSending(true);
    try {
      await onSend?.({ text: trimmed });
      setText("");
      inputRef.current?.focus();
    } catch (err) {
      console.error("MessageInput send error:", err);
    } finally {
      setSending(false);
    }
  };

  // Grow with the text so new lines stay visible (capped by max-h-32).
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  // Enter inserts a new line; Ctrl/Cmd+Enter is a keyboard shortcut to send.
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 px-4 py-3 bg-white border-t border-gray-100"
    >
      <textarea
        ref={inputRef}
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        enterKeyHint="enter"
        aria-label="Message"
        disabled={disabled || sending}
        className="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent disabled:opacity-50 max-h-32 overflow-y-auto leading-relaxed"
        style={{ minHeight: '42px' }}
      />
      <button
        type="submit"
        aria-label="Send message"
        title="Send (Ctrl+Enter)"
        disabled={!text.trim() || sending || disabled}
        className="shrink-0 w-10 h-10 rounded-full bg-pink-600 hover:bg-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
      >
        <Send size={16} />
      </button>
    </form>
  );
}
