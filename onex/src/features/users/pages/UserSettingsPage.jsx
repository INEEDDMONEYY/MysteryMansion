
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "@/context/UserContext";
import { FEATURE_FLAGS } from "@/config/featureFlags";

import AgeSettings from "@/shared/components/user/settings/AgeSettings";
import AvailabilitySettings from "@/shared/components/user/settings/AvailabilitySettings";
import PhoneNumberSettings from "@/shared/components/user/settings/PhoneNumberSettings";
import EmailSettings from "@/shared/components/user/settings/EmailSettings";
import GenderSettings from "@/shared/components/user/settings/GenderSettings";
import RedeemPromoSettings from "@/shared/components/user/settings/RedeemPromoSettings";
import DeleteAccountSettings from "@/shared/components/user/settings/DeleteAccountSettings";
import ForumSettingsPanel from "@/features/forum/components/ForumSettingsPanel";
import {
  fetchNotificationPreferences,
  saveNotificationPreferences,
} from "@/features/users/services/notificationPreferencesService";

import {
  UserRound,
  Bell,
  MessagesSquare,
  ShieldCheck,
  Mail,
  MessageSquare,
  HeartHandshake,
  Trophy,
  Crown,
  Flag,
  Settings2,
  Gift,
  Trash2,
  Save,
  Users,
  ChevronRight,
} from "lucide-react";

const notificationOptions = [
  {
    key: "promotionalEmails",
    title: "Promotional Emails",
    description:
      "Receive promotional announcements, special offers, and platform marketing updates.",
    icon: Mail,
  },
  {
    key: "messageEmails",
    title: "Message Emails",
    description:
      "Receive email notifications when you have new messages.",
    icon: MessageSquare,
  },
  {
    key: "accountEngagementEmails",
    title: "Account Engagement Emails",
    description:
      "Receive updates about relevant activity and engagement involving your account.",
    icon: HeartHandshake,
  },
  {
    key: "milestoneNotifications",
    title: "Milestone Notifications",
    description:
      "Receive notifications when you achieve account milestones and progression rewards.",
    icon: Trophy,
  },
  {
    key: "membershipEmails",
    title: "Membership Emails",
    description:
      "Receive membership confirmations, renewal reminders, payment notices, and expiration updates.",
    icon: Crown,
  },
  {
    key: "accountFlaggingEmails",
    title: "Account Flagging Emails",
    description:
      "Receive email notifications about account reports, flags, and related account actions.",
    icon: Flag,
  },
];

// Mirrors the backend defaults (everything on until the member opts out).
const initialNotificationPreferences = {
  promotionalEmails: true,
  messageEmails: true,
  accountEngagementEmails: true,
  milestoneNotifications: true,
  membershipEmails: true,
  accountFlaggingEmails: true,
};

function normalizeAvailability(raw) {
  if (!raw) return { status: "" };
  if (typeof raw === "string") return { status: raw };

  if (typeof raw === "object") {
    return { status: raw.status || "" };
  }

  return { status: "" };
}

function SettingsSection({
  id,
  icon: Icon,
  title,
  description,
  children,
  danger = false,
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 overflow-hidden rounded-2xl border bg-white shadow-sm ${
        danger ? "border-red-200" : "border-gray-200"
      }`}
    >
      <div
        className={`border-b px-5 py-5 sm:px-6 ${
          danger ? "border-red-100 bg-red-50/50" : "border-gray-100"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              danger
                ? "bg-red-100 text-red-600"
                : "bg-pink-50 text-pink-600"
            }`}
          >
            <Icon size={20} />
          </div>

          <div>
            <h2
              className={`text-lg font-bold ${
                danger ? "text-red-700" : "text-gray-900"
              }`}
            >
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm leading-6 text-gray-500">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">{children}</div>
    </section>
  );
}

function NotificationToggle({
  option,
  checked,
  onChange,
}) {
  const Icon = option.icon;

  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-4 last:border-0 last:pb-0">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
          <Icon size={17} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            {option.title}
          </h3>

          <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500">
            {option.description}
          </p>
        </div>
      </div>

      <label className="relative inline-flex shrink-0 cursor-pointer items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(option.key, event.target.checked)}
          className="peer sr-only"
        />

        <span className="h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-pink-600 peer-focus-visible:ring-4 peer-focus-visible:ring-pink-100" />

        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />

        <span className="sr-only">
          {option.title}
        </span>
      </label>
    </div>
  );
}


export default function UserSettingsPage() {
  const { user, mergeUser } = useContext(UserContext);

  const userId = useMemo(
    () => user?._id || user?.id || null,
    [user],
  );

  const availabilityKey = userId
    ? `availability_${userId}`
    : null;

  const [availability, setAvailability] = useState({
    status: "",
  });

  const [notificationPreferences, setNotificationPreferences] =
    useState(initialNotificationPreferences);

  const [savingNotifications, setSavingNotifications] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  useEffect(() => {
    if (!availabilityKey) {
      setAvailability({ status: "" });
      return;
    }

    const saved = localStorage.getItem(availabilityKey);

    if (!saved) {
      setAvailability({ status: "" });
      return;
    }

    try {
      setAvailability(normalizeAvailability(JSON.parse(saved)));
    } catch {
      setAvailability(normalizeAvailability(saved));
    }
  }, [availabilityKey]);

  useEffect(() => {
    if (!availabilityKey) return;

    try {
      localStorage.setItem(
        availabilityKey,
        JSON.stringify(availability),
      );
    } catch (error) {
      console.error("Failed to persist availability:", error);
    }
  }, [availability, availabilityKey]);

  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;

    fetchNotificationPreferences()
      .then((preferences) => {
        if (cancelled) return;
        setNotificationPreferences({
          ...initialNotificationPreferences,
          ...preferences,
        });
      })
      .catch((error) => {
        if (!cancelled) setNotificationMessage(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleNotificationChange = (key, checked) => {
    setNotificationPreferences((previous) => ({
      ...previous,
      [key]: checked,
    }));

    setNotificationMessage("");
  };

  const handleSaveNotifications = async () => {
    try {
      setSavingNotifications(true);
      setNotificationMessage("");

      const saved = await saveNotificationPreferences(notificationPreferences);
      setNotificationPreferences({ ...initialNotificationPreferences, ...saved });
      mergeUser?.({ notificationPreferences: saved });

      setNotificationMessage("Notification preferences saved.");
    } catch (error) {
      console.error("Failed to save notification preferences:", error);
      setNotificationMessage(
        error?.message || "Unable to save notification preferences. Please try again.",
      );
    } finally {
      setSavingNotifications(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 sm:px-6 lg:py-10">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-pink-600">
          <Settings2 size={17} />
          Account Management
        </div>

        <h1 className="text-3xl font-black tracking-tight text-gray-900">
          Settings
        </h1>

        <p className="max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
          Manage your account information, communication preferences,
          and forum experience.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Settings sections">
        {[
          { id: "account-information", label: "Account Information" },
          { id: "notifications", label: "Notifications" },
          { id: "forum-settings", label: "Forum Settings" },
          { id: "account-tools", label: "Account Tools" },
        ].map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-600 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700 sm:text-sm"
          >
            {item.label}
            <ChevronRight size={14} />
          </a>
        ))}
      </nav>

      <SettingsSection
        id="account-information"
        icon={UserRound}
        title="Account Information"
        description="Manage the personal and account information associated with your Mystery Mansion account."
      >
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-bold text-gray-800">
              Email Address
            </h3>
            <EmailSettings user={user} />
          </div>

          {FEATURE_FLAGS.PHONE_NUMBER_SETTINGS && (
            <div className="border-t border-gray-100 pt-5">
              <h3 className="mb-3 text-sm font-bold text-gray-800">
                Phone Number
              </h3>
              <PhoneNumberSettings userId={userId} user={user} />
            </div>
          )}

          {FEATURE_FLAGS.AGE_SETTINGS && (
            <div className="border-t border-gray-100 pt-5">
              <h3 className="mb-3 text-sm font-bold text-gray-800">
                Age
              </h3>
              <AgeSettings userId={userId} user={user} />
            </div>
          )}

          <div className="border-t border-gray-100 pt-5">
            <h3 className="mb-3 text-sm font-bold text-gray-800">
              Gender
            </h3>
            <GenderSettings user={user} />
          </div>

          {FEATURE_FLAGS.AVAILABILITY_SETTINGS && (
            <div className="border-t border-gray-100 pt-5">
              <h3 className="mb-3 text-sm font-bold text-gray-800">
                Availability
              </h3>

              <AvailabilitySettings
                availability={availability}
                setAvailability={setAvailability}
                userId={userId}
              />
            </div>
          )}
        </div>
      </SettingsSection>

      <SettingsSection
        id="notifications"
        icon={Bell}
        title="Notification Preferences"
        description="Choose which types of email communication and account notifications you want to receive."
      >
        <div>
          {notificationOptions.map((option) => (
            <NotificationToggle
              key={option.key}
              option={option}
              checked={Boolean(notificationPreferences[option.key])}
              onChange={handleNotificationChange}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500" role="status">
            {notificationMessage}
          </p>

          <button
            type="button"
            onClick={handleSaveNotifications}
            disabled={savingNotifications}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={16} />
            {savingNotifications ? "Saving..." : "Save Preferences"}
          </button>
        </div>

        <p className="text-xs leading-5 text-gray-400">
          These preferences control optional communication categories.
          Essential security or legally required account notices may still
          be delivered where applicable.
        </p>
      </SettingsSection>

      <SettingsSection
        id="forum-settings"
        icon={MessagesSquare}
        title="Forum Settings"
        description="Manage preferences related to your forum discussions and community participation."
      >
        <ForumSettingsPanel />
      </SettingsSection>

      <SettingsSection
        id="account-tools"
        icon={ShieldCheck}
        title="Account Tools"
        description="Manage account-related tools and sensitive account actions."
      >
        {FEATURE_FLAGS.PROMO_REDEMPTION && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Gift size={18} className="text-pink-600" />
              <h3 className="font-semibold text-gray-800">
                Redeem a Promo Code
              </h3>
            </div>

            <RedeemPromoSettings userId={userId} />
          </div>
        )}

        {FEATURE_FLAGS.DELETE_ACCOUNT_SETTINGS && (
          <div className="border-t border-red-100 pt-6">
            <div className="mb-3 flex items-center gap-2 text-red-600">
              <Trash2 size={18} />
              <h3 className="font-semibold">Danger Zone</h3>
            </div>

            <p className="mb-4 text-sm leading-6 text-gray-500">
              Account deletion is a permanent action. Review the deletion
              information carefully before proceeding.
            </p>

            <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
              <DeleteAccountSettings />
            </div>
          </div>
        )}
      </SettingsSection>
    </div>
  );
}
