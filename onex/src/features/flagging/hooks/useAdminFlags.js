import { useCallback, useEffect, useState } from "react";
import { fetchAdminFlags, updateAdminFlag } from "../services/flagService";

const useAdminFlags = () => {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setFlags(await fetchAdminFlags());
    } catch (err) {
      setError(err.message);
      setFlags([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateFlag = useCallback(async (flagId, payload) => {
    const updated = await updateAdminFlag(flagId, payload);

    // Keep postTitle, which only the list endpoint resolves.
    setFlags((current) =>
      current.map((flag) =>
        flag._id === flagId ? { ...flag, ...updated, postTitle: flag.postTitle } : flag
      )
    );

    return updated;
  }, []);

  return { flags, loading, error, refresh, updateFlag };
};

export default useAdminFlags;
