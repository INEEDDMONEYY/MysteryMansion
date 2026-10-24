import { useCallback, useEffect, useState } from "react";

import { getForumThread } from "../services/forumThreadService";

/** Loads one thread plus the viewer's vote/bookmark state. */
const useForumThread = ({ threadId } = {}) => {
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(Boolean(threadId));
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!threadId) return null;

    setLoading(true);
    setError(null);

    try {
      const result = await getForumThread({ threadId });
      setThread(result);
      return result;
    } catch (err) {
      setThread(null);
      setError(
        err instanceof Error ? err.message : "Unable to load this discussion."
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    load();
  }, [load]);

  const patchThread = useCallback((patch) => {
    setThread((current) => (current ? { ...current, ...patch } : current));
  }, []);

  return { thread, loading, error, reload: load, patchThread };
};

export default useForumThread;
