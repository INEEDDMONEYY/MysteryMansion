import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "@/context/UserContext";
import api from "@/shared/utils/api";

export default function ForumCategoryFollowButton({ categoryId }) {
  const { user } = useContext(UserContext);
  const userId = user?._id || user?.id;
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    setReady(false);
    if (!userId || !categoryId) return () => { cancelled = true; };
    api.get("/forum/me/followed-categories").then(({ data }) => {
      if (!Array.isArray(data?.categoryIds)) throw new Error("Invalid followed-category response.");
      if (!cancelled) {
        setFollowing(data.categoryIds.includes(categoryId));
        setReady(true);
        setError("");
      }
    }).catch((err) => {
      if (!cancelled) setError(err.response?.data?.error || err.message);
    }).finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [userId, categoryId, reload]);
  const toggle = async () => {
    setBusy(true);
    try {
      const { data } = await api.put(`/forum/categories/${categoryId}/follow`, { following: !following });
      if (typeof data?.following !== "boolean") throw new Error("Invalid category follow response.");
      setFollowing(data.following);
      setError("");
    } catch (err) { setError(err.response?.data?.error || err.message); }
    finally { setBusy(false); }
  };
  if (!userId) return <Link to="/signin" className="text-sm text-white underline">Sign in to follow this category</Link>;
  return (
    <div>
      <button type="button" disabled={busy || !ready} onClick={toggle} aria-pressed={following}
        className="min-h-11 rounded-xl border border-white/30 px-5 text-sm font-semibold text-white disabled:opacity-50">
        {busy ? "Loading..." : following ? "Unfollow category" : "Follow category"}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-300">{error} <button type="button" onClick={() => setReload((n) => n + 1)} className="underline">Retry</button></p>}
    </div>
  );
}
