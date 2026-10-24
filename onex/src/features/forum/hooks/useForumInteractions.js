import { useCallback, useState } from "react";

import {
  markForumReplySolution,
  removeForumReplySolution,
  toggleForumBookmark,
  voteOnForumItem,
} from "../services/forumInteractionService";

/**
 * Vote, bookmark and solution actions. Each resolves with the server result and
 * rejects with a readable message; `busy` is true while a request is in flight.
 */
const useForumInteractions = () => {
  const [busy, setBusy] = useState(false);

  const run = useCallback(async (action) => {
    setBusy(true);

    try {
      return await action();
    } finally {
      setBusy(false);
    }
  }, []);

  const vote = useCallback(
    (targetType, targetId, value) =>
      run(() => voteOnForumItem({ targetType, targetId, value })),
    [run]
  );

  const bookmark = useCallback(
    (targetId) => run(() => toggleForumBookmark({ targetType: "thread", targetId })),
    [run]
  );

  const markSolution = useCallback(
    (threadId, replyId) =>
      run(() => markForumReplySolution({ threadId, replyId })),
    [run]
  );

  const clearSolution = useCallback(
    (threadId) => run(() => removeForumReplySolution({ threadId })),
    [run]
  );

  return { busy, vote, bookmark, markSolution, clearSolution };
};

export default useForumInteractions;
