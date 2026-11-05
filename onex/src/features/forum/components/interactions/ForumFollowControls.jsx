import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellOff, Check, Plus } from "lucide-react";
import { UserContext } from "@/context/UserContext";
import { setForumThreadFollow, FORUM_FOLLOW_CHANGED } from "../../services/forumThreadService";
import { showAppToast } from "@/shared/utils/appToast";

function FollowControls({ threadId, initialFollowing, initialNotifications, userId }) {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    following: initialFollowing,
    notificationsEnabled: initialNotifications,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const sync = ({ detail }) => {
      if (detail.userId === userId && detail.threadId === threadId) setSettings(detail.settings);
    };
    window.addEventListener(FORUM_FOLLOW_CHANGED, sync);
    return () => window.removeEventListener(FORUM_FOLLOW_CHANGED, sync);
  }, [threadId, userId]);

  const save = async (updates) => {
    if (!userId) {
      navigate("/signin");
      return null;
    }
    if (saving) return null;
    setSaving(true);
    setError("");
    try {
      const result = await setForumThreadFollow(threadId, updates);
      setSettings(result);
      window.dispatchEvent(new CustomEvent(FORUM_FOLLOW_CHANGED, {
        detail: { threadId, userId, settings: result },
      }));
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update thread preferences.");
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Following turns on reply alerts; unfollowing turns them off.
  const toggleFollow = async () => {
    const next = !settings.following;
    const result = await save({ following: next, notificationsEnabled: next });
    if (result) {
      showAppToast({
        type: "forum_follow",
        title: next ? "Thread followed" : "Thread unfollowed",
        message: next
          ? "You'll get alerts for new replies and replies to your comments."
          : "You won't get alerts for this thread anymore.",
      });
    }
  };

  const buttonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-50";

  return (
    <div>
      <div className="flex flex-wrap gap-2" aria-label="Thread follow preferences">
        <button
          type="button"
          disabled={saving}
          aria-pressed={settings.following}
          onClick={toggleFollow}
          className={`${buttonClass} ${settings.following ? "border-pink-200 bg-pink-50 text-pink-700" : "border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-600"}`}
        >
          {settings.following ? <Check size={16} /> : <Plus size={16} />}
          {settings.following ? "Following" : "Follow"}
        </button>
        <button
          type="button"
          disabled={saving}
          aria-pressed={settings.notificationsEnabled}
          aria-label={settings.notificationsEnabled ? "Turn off thread notifications" : "Turn on thread notifications"}
          title={settings.notificationsEnabled ? "Thread notifications on" : "Thread notifications off. Turn on to follow and receive reply alerts."}
          onClick={() => save({ following: true, notificationsEnabled: !settings.notificationsEnabled })}
          className={`${buttonClass} ${settings.notificationsEnabled ? "border-pink-200 bg-pink-50 text-pink-700" : "border-gray-200 text-gray-500 hover:text-pink-600"}`}
        >
          {settings.notificationsEnabled ? <Bell size={17} /> : <BellOff size={17} />}
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function ForumFollowControls({ thread }) {
  const { user } = useContext(UserContext) || {};
  const threadId = thread.id || thread._id;
  const userId = user?._id;
  const isViewer = Boolean(userId && thread.viewer?.userId === userId);
  const following = Boolean(isViewer && thread.viewer?.following);
  const notifications = Boolean(isViewer && thread.viewer?.notificationsEnabled);
  return (
    <FollowControls
      key={`${userId || "guest"}:${threadId}:${following}:${notifications}`}
      threadId={threadId}
      userId={userId}
      initialFollowing={following}
      initialNotifications={notifications}
    />
  );
}
