import { useEffect, useState } from "react";
import { AtSign, MessagesSquare, Bookmark, FolderHeart, Bell, Save } from "lucide-react";
import { DEFAULT_FORUM_SETTINGS, fetchForumSettings, saveForumSettings } from "../services/forumSettingsService";

const options = [
  { key: "discussionReplies", label: "Replies to My Discussions", description: "Notifications for replies to your discussions and comments.", icon: MessagesSquare },
  { key: "mentions", label: "Mentions", description: "Notifications when someone @mentions you in a discussion or reply.", icon: AtSign },
  { key: "followedDiscussionNotifications", label: "Followed Discussions", description: "Reply alerts from followed discussions with the thread bell enabled.", icon: Bookmark },
  { key: "followedCategoryNotifications", label: "Followed Categories", description: "New discussion alerts from categories you follow.", icon: FolderHeart },
  { key: "autoFollowDiscussions", label: "Automatically Follow Discussions", description: "Follow discussions you create or reply to. Existing unfollows and muted bells are preserved.", icon: Bell },
];

export default function ForumSettingsPanel({
  initialSettings = DEFAULT_FORUM_SETTINGS,
  onSave = saveForumSettings,
}) {
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_FORUM_SETTINGS, ...initialSettings }));
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoaded(false);
    setMessage("");
    fetchForumSettings().then((data) => {
      if (!cancelled) { setSettings(data); setError(false); setLoaded(true); }
    }).catch((err) => {
      if (!cancelled) { setMessage(err.message); setError(true); }
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [reload]);
  const update = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setMessage("");
  };
  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const saved = await onSave(settings);
      if (saved) setSettings(saved);
      setError(false);
      setMessage("Your forum settings have been saved.");
    } catch (err) { setError(true); setMessage(err.message || "Unable to save forum settings."); }
    finally { setSaving(false); }
  };
  return (
    <div className="space-y-4">
      <fieldset disabled={loading || saving || !loaded}>
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <label key={option.key} className="flex items-center justify-between gap-4 border-b border-gray-100 py-5">
              <span className="flex items-start gap-3">
                <Icon size={19} className="mt-1 shrink-0 text-pink-600" />
                <span><span className="block font-semibold text-gray-900">{option.label}</span>
                  <span className="mt-1 block text-sm text-gray-500">{option.description}</span></span>
              </span>
              <span className="relative inline-flex shrink-0">
                <input type="checkbox" role="switch" aria-label={option.label} checked={Boolean(settings[option.key])}
                  onChange={(event) => update(option.key, event.target.checked)}
                  className="peer sr-only" />
                <span className="h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-black peer-focus-visible:ring-4 peer-focus-visible:ring-pink-100" />
                <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </span>
            </label>
          );
        })}
        <label className="flex flex-wrap items-center justify-between gap-3 py-5">
          <span><span className="block font-semibold text-gray-900">Forum Email Digest</span>
            <span className="block text-sm text-gray-500">New discussions and replies in followed threads and categories. No activity means no email.</span></span>
          <select value={settings.digestFrequency} onChange={(event) => update("digestFrequency", event.target.value)}
            className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm">
            <option value="off">Off</option><option value="daily">Daily</option><option value="weekly">Weekly</option>
          </select>
        </label>
      </fieldset>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <p role={error ? "alert" : "status"} className={error ? "text-sm text-red-600" : "text-sm text-gray-500"}>
          {loading ? "Loading forum settings..." : message}
        </p>
        {error && <button type="button" onClick={() => setReload((n) => n + 1)} className="text-sm underline">Reload settings</button>}
        <button type="button" onClick={save} disabled={loading || saving || !loaded}
          className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
          <Save size={17} />{saving ? "Saving..." : "Save Forum Settings"}
        </button>
      </div>
    </div>
  );
}
