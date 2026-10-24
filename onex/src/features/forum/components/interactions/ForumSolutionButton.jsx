import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import useForumInteractions from "../../hooks/useForumInteractions";

/**
 * Lets the thread author accept a reply as the answer. Everyone else just sees
 * the "Accepted answer" badge on the solution.
 */
export default function ForumSolutionButton({
  threadId,
  replyId,
  isSolution = false,
  canMark = false,
  onChange,
}) {
  const { busy, markSolution, clearSolution } = useForumInteractions();
  const [error, setError] = useState("");

  const toggle = async () => {
    setError("");

    try {
      if (isSolution) {
        await clearSolution(threadId);
        onChange?.(null);
      } else {
        await markSolution(threadId, replyId);
        onChange?.(replyId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update the solution.");
    }
  };

  if (!canMark && !isSolution) return null;

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {isSolution && (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Accepted answer
        </span>
      )}

      {canMark && (
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          className="inline-flex min-h-9 items-center rounded-lg px-2 text-xs font-semibold text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-60"
        >
          {isSolution ? "Remove as answer" : "Mark as answer"}
        </button>
      )}

      {error && (
        <span role="alert" className="text-xs text-red-600">
          {error}
        </span>
      )}
    </span>
  );
}
