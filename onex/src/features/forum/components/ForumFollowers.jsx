import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserRound } from "lucide-react";
import { forumRequest } from "../services/forumApi";
import { FORUM_FOLLOW_CHANGED } from "../services/forumThreadService";

function FollowerAvatar({ follower }) {
  const [failed, setFailed] = useState(false);
  return (
    <Link
      to={`/user/${encodeURIComponent(follower.id)}`}
      title={follower.username}
      aria-label={`View ${follower.username}'s profile`}
      className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gray-100 text-gray-500 hover:z-10 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-pink-500"
    >
      {follower.profilePic && !failed ? (
        <img src={follower.profilePic} alt="" width={32} height={32} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover" />
      ) : <UserRound size={15} aria-hidden="true" />}
    </Link>
  );
}

export default function ForumFollowers({ thread }) {
  const threadId = thread.id || thread._id;
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let request = 0;
    const sync = async ({ detail }) => {
      if (detail.threadId !== threadId) return;
      const current = ++request;
      try {
        const result = await forumRequest({ method: "get", url: `/forum/threads/${encodeURIComponent(threadId)}/followers` });
        if (active && current === request) {
          setSummary(result);
          setError("");
        }
      } catch (err) {
        if (active && current === request) setError(err instanceof Error ? err.message : "Unable to refresh followers.");
      }
    };
    window.addEventListener(FORUM_FOLLOW_CHANGED, sync);
    return () => {
      active = false;
      window.removeEventListener(FORUM_FOLLOW_CHANGED, sync);
    };
  }, [threadId]);

  const count = summary?.followerCount ?? thread.followerCount ?? 0;
  const followers = (summary?.followers ?? thread.followers ?? []).slice(0, 10);
  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <div className="flex flex-wrap items-center gap-3">
        {followers.length > 0 && (
          <div className="flex -space-x-3">
            {followers.map((follower) => <FollowerAvatar key={`${follower.id}:${follower.profilePic}`} follower={follower} />)}
            {count > 10 && (
              <span aria-label={`${count - 10} more followers`} className="relative flex h-8 min-w-8 items-center justify-center rounded-full border-2 border-white bg-pink-50 px-1 text-xs font-bold text-pink-700">
                +{count - 10}
              </span>
            )}
          </div>
        )}
        <span className="text-xs font-medium text-gray-500" aria-live="polite">
          {count.toLocaleString()} {count === 1 ? "follower" : "followers"}
        </span>
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
