import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "@/context/UserContext";

import { getForumThread } from "../services/forumThreadService";

/** Loads one thread plus the viewer's interaction preferences. */
const useForumThread = ({ threadId } = {}) => {
  const { user } = useContext(UserContext) || {};
  const userId = user?._id;
  const requestId = useRef(0);
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(Boolean(threadId));
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!threadId) return null;
    const request = ++requestId.current;

    setLoading(true);
    setError(null);

    try {
      const result = await getForumThread({ threadId });
      if (request !== requestId.current) return null;
      setThread(result);
      return result;
    } catch (err) {
      if (request !== requestId.current) return null;
      setThread(null);
      setError(
        err instanceof Error ? err.message : "Unable to load this discussion."
      );
      return null;
    } finally {
      if (request === requestId.current) setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    load();
    return () => { requestId.current += 1; };
  }, [load, userId]);

  const patchThread = useCallback((patch) => {
    setThread((current) => (current ? { ...current, ...patch } : current));
  }, []);

  return { thread, loading, error, reload: load, patchThread };
};

export default useForumThread;
