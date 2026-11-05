import { useEffect, useRef, useState } from "react";

import api from "@/shared/utils/api";

const MENTION_TOKEN = /(^|[\s([{])@([^\s@]{0,40})$/;
const SEARCH_DEBOUNCE_MS = 200;

// A textarea that suggests usernames while the caret sits on an "@" token.
export default function MentionTextarea({ value, onChange, onKeyDown, ...textareaProps }) {
  const textareaRef = useRef(null);
  const requestRef = useRef(0);
  const [mention, setMention] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!mention) {
      setSuggestions([]);
      return undefined;
    }
    const requestId = ++requestRef.current;
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get("/forum/users/mention-search", { params: { q: mention.query } });
        if (requestId === requestRef.current) {
          setSuggestions(data.users || []);
          setActiveIndex(0);
        }
      } catch {
        if (requestId === requestRef.current) setSuggestions([]);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [mention]);

  const updateMention = (text, caret) => {
    const match = MENTION_TOKEN.exec(text.slice(0, caret));
    setMention(match ? { start: caret - match[2].length - 1, query: match[2] } : null);
  };

  const handleChange = (event) => {
    onChange?.(event.target.value);
    updateMention(event.target.value, event.target.selectionStart);
  };

  const pick = (username) => {
    if (!mention) return;
    const textarea = textareaRef.current;
    const caret = textarea?.selectionStart ?? value.length;
    const insert = `@${username} `;
    const next = value.slice(0, mention.start) + insert + value.slice(caret);
    onChange?.(next);
    setMention(null);
    setSuggestions([]);
    requestAnimationFrame(() => {
      const position = mention.start + insert.length;
      textarea?.focus();
      textarea?.setSelectionRange(position, position);
    });
  };

  const handleKeyDown = (event) => {
    if (suggestions.length) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % suggestions.length);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) => (index - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        pick(suggestions[activeIndex].username);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setMention(null);
        setSuggestions([]);
        return;
      }
    }
    onKeyDown?.(event);
  };

  return (
    <div className="relative">
      <textarea
        {...textareaProps}
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={(event) => updateMention(event.target.value, event.target.selectionStart)}
        onBlur={() => setTimeout(() => setSuggestions([]), 150)}
      />

      {suggestions.length > 0 && (
        <ul
          role="listbox"
          aria-label="Mention suggestions"
          className="absolute left-0 top-full z-20 mt-1 max-h-60 w-64 max-w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          {suggestions.map((user, index) => (
            <li
              key={user.username}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => {
                event.preventDefault();
                pick(user.username);
              }}
              className={`cursor-pointer truncate px-3 py-2 text-sm ${
                index === activeIndex ? "bg-pink-50 text-pink-700" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              @{user.username}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
