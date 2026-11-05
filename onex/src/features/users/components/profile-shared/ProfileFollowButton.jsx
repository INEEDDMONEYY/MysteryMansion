import { useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, UserCheck } from "lucide-react";
import { UserContext } from "@/context/UserContext";
import useProfileConnections from "../../hooks/useProfileConnections";
import { setProfileFollow } from "../../services/profileSocialService";

export default function ProfileFollowButton({ userId }) {
  const { user } = useContext(UserContext);
  const viewerId = user?._id || user?.id;
  const { data, loading, error, reload } = useProfileConnections(userId);
  const [pending, setPending] = useState(false);
  const [saveError, setSaveError] = useState("");
  const currentKey = `${viewerId}:${userId}`;
  const keyRef = useRef(currentKey);
  keyRef.current = currentKey;
  if (!userId || String(viewerId) === String(userId)) return null;
  if (!viewerId) {
    return <Link to="/signin" className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white"><UserPlus size={16} />Follow</Link>;
  }
  const viewer = data?.viewer?.userId === String(viewerId) ? data.viewer : null;
  const following = Boolean(viewer?.following);
  const toggle = async () => {
    const startedKey = currentKey;
    setPending(true);
    setSaveError("");
    try { await setProfileFollow(userId, !following); }
    catch (err) {
      if (keyRef.current === startedKey) setSaveError(err.response?.data?.error || err.message || "Unable to update follow.");
    } finally { if (keyRef.current === startedKey) setPending(false); }
  };
  return (
    <div>
      <button type="button" onClick={toggle} disabled={loading || pending || !viewer || user.status === "suspended"}
        aria-pressed={following} title={following ? "Unfollow this account" : "Follow this account"}
        className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-500 disabled:opacity-50">
        {following ? <UserCheck size={16} /> : <UserPlus size={16} />}
        {pending ? "Saving..." : loading ? "Loading..." : viewer?.isFriend ? "Friends" : following ? "Following" : "Follow"}
      </button>
      {(error || saveError) && <p role="alert" className="mt-2 max-w-64 text-xs text-red-300">
        {error || saveError} {error && <button type="button" onClick={reload} className="underline">Retry</button>}
      </p>}
    </div>
  );
}
