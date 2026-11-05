import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/context/UserContext";
import { fetchProfileConnections, PROFILE_FOLLOW_CHANGED } from "../services/profileSocialService";

export default function useProfileConnections(userId, page = 1) {
  const { user } = useContext(UserContext);
  const viewerId = user?._id || user?.id || "";
  const key = `${userId}:${viewerId}:${page}`;
  const [state, setState] = useState({ key: "", data: null, error: "", loading: true });
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const handler = () => setRefresh((value) => value + 1);
    window.addEventListener(PROFILE_FOLLOW_CHANGED, handler);
    return () => window.removeEventListener(PROFILE_FOLLOW_CHANGED, handler);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setState({ key, data: null, error: "", loading: true });
    if (!userId) return () => controller.abort();
    fetchProfileConnections(userId, page, controller.signal).then((data) => {
      if (!controller.signal.aborted) setState({ key, data, error: "", loading: false });
    }).catch((err) => {
      if (!controller.signal.aborted) setState({
        key, data: null, error: err.response?.data?.error || err.message || "Unable to load profile connections.", loading: false,
      });
    });
    return () => controller.abort();
  }, [userId, viewerId, page, key, refresh]);
  return {
    ...(state.key === key ? state : { data: null, error: "", loading: true }),
    reload: () => setRefresh((value) => value + 1),
  };
}
