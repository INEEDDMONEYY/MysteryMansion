import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";

import AnimatedLikeIcon from "@/shared/components/likes/AnimatedLikeIcon";
import useForumInteractions from "../../hooks/useForumInteractions";
import { formatForumCount } from "../../utils/forumUtils";

/**
 * Up/down vote control for a thread or reply. Clicking the active arrow removes the vote.
 * Signed-out visitors trigger onRequireAuth instead; authors cannot vote on their own content.
 */
export default function ForumVoteButton({
  targetType,
  targetId,
  score = 0,
  value = 0,
  canVote = true,
  isOwn = false,
  onRequireAuth,
  onChange,
  orientation = "vertical",
}) {
  const { busy, vote } = useForumInteractions();
  const [current, setCurrent] = useState({ score, value });
  const [error, setError] = useState("");

  useEffect(() => {
    setCurrent({ score, value });
  }, [score, value]);

  const cast = async (next) => {
    if (!canVote) {
      onRequireAuth?.();
      return;
    }

    if (busy || isOwn) return;

    const target = current.value === next ? 0 : next;
    const previous = current;

    setError("");
    setCurrent({ score: current.score + (target - current.value), value: target });

    try {
      const result = await vote(targetType, targetId, target);
      setCurrent({ score: result.score, value: result.value });
      onChange?.(result);
    } catch (err) {
      setCurrent(previous);
      setError(err instanceof Error ? err.message : "Unable to record vote.");
    }
  };

  const arrowClass = (active, activeColor) =>
    `flex h-9 w-9 items-center justify-center rounded-lg transition focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:cursor-not-allowed disabled:opacity-50 ${
      active
        ? activeColor
        : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
    }`;

  return (
    <div
      className={`flex shrink-0 items-center ${
        orientation === "vertical" ? "flex-col" : "flex-row gap-1"
      }`}
    >
      <button
        type="button"
        onClick={() => cast(1)}
        disabled={busy || isOwn}
        aria-label="Upvote"
        aria-pressed={current.value === 1}
        title={isOwn ? "You cannot vote on your own content" : "Upvote"}
        className={arrowClass(current.value === 1, "bg-pink-50")}
      >
        <AnimatedLikeIcon liked={current.value === 1} size={26} />
      </button>

      <span
        className="min-w-8 text-center text-sm font-bold text-gray-800"
        aria-live="polite"
      >
        {formatForumCount(current.score)}
      </span>

      <button
        type="button"
        onClick={() => cast(-1)}
        disabled={busy || isOwn}
        aria-label="Downvote"
        aria-pressed={current.value === -1}
        title={isOwn ? "You cannot vote on your own content" : "Downvote"}
        className={arrowClass(current.value === -1, "bg-gray-200 text-gray-800")}
      >
        <ArrowDown className="h-5 w-5" />
      </button>

      {error && (
        <span role="alert" className="sr-only">
          {error}
        </span>
      )}
    </div>
  );
}
