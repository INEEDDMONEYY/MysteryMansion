import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Users,
  Trophy,
  Crown,
  ShieldAlert,
  AtSign,
  MessagesSquare,
  Bookmark,
  FolderHeart,
  Bell,
  Save,
  Info,
  Settings2,
  CheckCircle2,
} from "lucide-react";
import {
  fetchNotificationPreferences,
  saveNotificationPreferences,
} from "@/features/users/services/notificationPreferencesService";

// Mirrors the backend defaults (everything on until the member opts out).
const DEFAULT_NOTIFICATION_PREFERENCES = {
  promotionalEmails: true,
  messageEmails: true,
  accountEngagementEmails: true,
  milestoneNotifications: true,
  membershipEmails: true,
  accountFlaggingEmails: true,
};

const DEFAULT_FORUM_SETTINGS = {
  discussionReplies: true,
  mentions: true,
  followedDiscussionNotifications: true,
  followedCategoryNotifications: false,
  autoFollowDiscussions: true,
  digestFrequency: "weekly",
};

const emailPreferenceOptions = [
  {
    key: "promotionalEmails",
    label: "Promotional Emails",
    description:
      "Receive announcements about promotions, special offers, and platform campaigns.",
    icon: Mail,
  },
  {
    key: "messageEmails",
    label: "Message Emails",
    description:
      "Receive email notifications when another member sends you a message.",
    icon: MessageSquare,
  },
  {
    key: "accountEngagementEmails",
    label: "Account Engagement",
    description:
      "Receive updates about activity and engagement involving your account.",
    icon: Users,
  },
  {
    key: "milestoneNotifications",
    label: "Milestone Notifications",
    description:
      "Receive updates when you reach account milestones and progression achievements.",
    icon: Trophy,
  },
  {
    key: "membershipEmails",
    label: "Membership Emails",
    description:
      "Receive membership updates, renewal reminders, and important membership notices.",
    icon: Crown,
  },
  {
    key: "accountFlaggingEmails",
    label: "Account Flagging Emails",
    description:
      "Receive email notifications about account flags and related account activity.",
    icon: ShieldAlert,
  },
];

const forumPreferenceOptions = [
  {
    key: "discussionReplies",
    label: "Replies to My Discussions",
    description:
      "Get notified when someone replies to a discussion you started.",
    icon: MessagesSquare,
  },
  {
    key: "mentions",
    label: "Mentions",
    description:
      "Get notified when another member mentions you in a forum discussion or reply.",
    icon: AtSign,
  },
  {
    key: "followedDiscussionNotifications",
    label: "Followed Discussions",
    description:
      "Receive notifications when new replies are posted in discussions you follow.",
    icon: Bookmark,
  },
  {
    key: "followedCategoryNotifications",
    label: "Followed Categories",
    description:
      "Receive notifications about new discussions in forum categories you follow.",
    icon: FolderHeart,
  },
  {
    key: "autoFollowDiscussions",
    label: "Automatically Follow Discussions",
    description:
      "Automatically follow discussions you create or participate in.",
    icon: Bell,
  },
];

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? "bg-black" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function PreferenceRow({ option, checked, onChange }) {
  const Icon = option.icon;

  return (
    <div className="flex items-center justify-between gap-5 border-b border-gray-100 py-5 last:border-b-0 last:pb-0">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-black">
          <Icon size={19} className="text-black" />
        </div>

        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900">
            {option.label}
          </h3>

          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            {option.description}
          </p>
        </div>
      </div>

      <Toggle
        checked={checked}
        onChange={onChange}
        label={option.label}
      />
    </div>
  );
}

function SettingsCard({ title, description, icon: Icon, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="flex items-start gap-3 border-b border-gray-100 px-5 py-5 sm:px-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-black">
          <Icon size={21} className="text-black" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        </div>
      </div>

      <div className="px-5 py-2 sm:px-6">{children}</div>
    </motion.section>
  );
}

function SaveButton({ saving, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Save size={17} className="text-white" />
      {saving ? "Saving..." : children}
    </button>
  );
}

export default function ClientSettingsPage({
  initialNotificationPreferences = DEFAULT_NOTIFICATION_PREFERENCES,
  initialForumSettings = DEFAULT_FORUM_SETTINGS,
  onSaveNotificationPreferences = saveNotificationPreferences,
  onSaveForumSettings,
}) {
  const [emailPreferences, setEmailPreferences] = useState(() => ({
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...initialNotificationPreferences,
  }));

  const [forumSettings, setForumSettings] = useState(() => ({
    ...DEFAULT_FORUM_SETTINGS,
    ...initialForumSettings,
  }));

  const [emailSaving, setEmailSaving] = useState(false);
  const [forumSaving, setForumSaving] = useState(false);

  const [emailMessage, setEmailMessage] = useState("");
  const [forumMessage, setForumMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchNotificationPreferences()
      .then((preferences) => {
        if (!cancelled) {
          setEmailPreferences((current) => ({ ...current, ...preferences }));
        }
      })
      .catch((error) => {
        if (!cancelled) setEmailMessage(error.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateEmailPreference = (key) => {
    setEmailPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));

    setEmailMessage("");
  };

  const updateForumSetting = (key) => {
    setForumSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));

    setForumMessage("");
  };

  const handleSaveEmailPreferences = async () => {
    if (!onSaveNotificationPreferences) {
      setEmailMessage(
        "Email preferences are not connected to a save handler yet."
      );
      return;
    }

    try {
      setEmailSaving(true);
      setEmailMessage("");

      await onSaveNotificationPreferences(emailPreferences);

      setEmailMessage("Your email preferences have been saved.");
    } catch (error) {
      setEmailMessage(
        error?.message || "Unable to save your email preferences."
      );
    } finally {
      setEmailSaving(false);
    }
  };

  const handleSaveForumSettings = async () => {
    if (!onSaveForumSettings) {
      setForumMessage(
        "Forum preferences are not connected to a save handler yet."
      );
      return;
    }

    try {
      setForumSaving(true);
      setForumMessage("");

      await onSaveForumSettings(forumSettings);

      setForumMessage("Your forum settings have been saved.");
    } catch (error) {
      setForumMessage(
        error?.message || "Unable to save your forum settings."
      );
    } finally {
      setForumSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-7">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-black">
            <Settings2 size={20} className="text-black" />

            <span className="text-sm font-semibold uppercase tracking-wider">
              Account Preferences
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-black">
            Client Settings
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-base">
            Manage how Mystery Mansion communicates with you and customize
            your forum experience.
          </p>
        </motion.div>

        <div className="flex gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <Info
            className="mt-0.5 shrink-0 text-black"
            size={19}
          />

          <p className="text-sm leading-relaxed text-gray-600">
            Your preferences help determine which optional notifications you
            receive. Important account and security communications may still
            be sent when necessary.
          </p>
        </div>

        <SettingsCard
          title="Email Preferences"
          description="Choose which account updates and notifications you receive by email."
          icon={Mail}
        >
          {emailPreferenceOptions.map((option) => (
            <PreferenceRow
              key={option.key}
              option={option}
              checked={Boolean(emailPreferences[option.key])}
              onChange={() => updateEmailPreference(option.key)}
            />
          ))}

          <div className="flex flex-col gap-3 border-t border-gray-100 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p
              className="text-sm text-gray-500"
              aria-live="polite"
            >
              {emailMessage}
            </p>

            <SaveButton
              saving={emailSaving}
              onClick={handleSaveEmailPreferences}
            >
              Save Email Preferences
            </SaveButton>
          </div>
        </SettingsCard>

        <SettingsCard
          title="Forum Settings"
          description="Control your forum notifications and discussion preferences."
          icon={MessagesSquare}
        >
          {forumPreferenceOptions.map((option) => (
            <PreferenceRow
              key={option.key}
              option={option}
              checked={Boolean(forumSettings[option.key])}
              onChange={() => updateForumSetting(option.key)}
            />
          ))}

          <div className="border-t border-gray-100 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Forum Email Digest
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Choose how often you receive a summary of forum activity.
                </p>
              </div>

              <select
                value={forumSettings.digestFrequency}
                onChange={(event) => {
                  setForumSettings((current) => ({
                    ...current,
                    digestFrequency: event.target.value,
                  }));

                  setForumMessage("");
                }}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 sm:w-48"
              >
                <option value="off">Off</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p
              className="text-sm text-gray-500"
              aria-live="polite"
            >
              {forumMessage}
            </p>

            <SaveButton
              saving={forumSaving}
              onClick={handleSaveForumSettings}
            >
              Save Forum Settings
            </SaveButton>
          </div>
        </SettingsCard>

        <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <CheckCircle2
            className="mt-0.5 shrink-0 text-black"
            size={19}
          />

          <p className="text-sm leading-relaxed text-gray-500">
            You can return to this page at any time to update your preferences.
            Changes take effect once they are successfully saved.
          </p>
        </div>
      </div>
    </div>
  );
}