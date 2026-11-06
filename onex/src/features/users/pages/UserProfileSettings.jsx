
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/context/UserContext";
import { saveProfileDetails as saveProfileDetailsRequest } from "@/features/users/services/profileDetailsService";
import UpdateProfileSettings from "@/shared/components/user/settings/UpdateProfileSettings";
import ReferencesLinks from "@/shared/components/References/ReferencesLinks";
import {
  UserRound,
  MapPin,
  Eye,
  Clock3,
  Save,
  Ruler,
  Weight,
  Palette,
  Users,
  ListChecks,
  Plus,
  X,
} from "lucide-react";

const inputClassName =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

const labelClassName = "mb-1.5 block text-sm font-medium text-gray-700";

const normalizeActivities = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((activity) => String(activity).trim())
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\r?\n/)
      .map((activity) => activity.trim())
      .filter(Boolean);
  }

  return [];
};

const createProfileDetails = (user) => ({
  catersTo: user?.catersTo ?? "",
  bodyType: user?.bodyType ?? "",
  height: user?.height ?? "",
  ethnicity: user?.ethnicity ?? "",
  cupSize: user?.cupSize ?? "",
  hairColor: user?.hairColor ?? "",
  eyeColor: user?.eyeColor ?? "",
  weight: user?.weight ?? "",
  tourSchedule: user?.tourSchedule ?? "",
  activities: normalizeActivities(user?.activities),
  showLastActive: user?.showLastActive ?? false,
});

function ProfileField({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  type = "text",
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClassName}>
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${inputClassName} ${Icon ? "pl-10" : ""}`}
        />
      </div>
    </div>
  );
}

function formatLastActive(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function UserProfileSettings({
  onProfileUpdate,
  onSaveProfileDetails,
}) {
  const { user, mergeUser } = useContext(UserContext);

  const [profileDetails, setProfileDetails] = useState(() =>
    createProfileDetails(user),
  );
  const [activityInput, setActivityInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Keyed on the detail values so unrelated user updates don't reset the form.
  const savedDetailsKey = JSON.stringify(createProfileDetails(user));

  useEffect(() => {
    setProfileDetails(JSON.parse(savedDetailsKey));
    setActivityInput("");
  }, [savedDetailsKey]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setProfileDetails((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSaveMessage("");
  };

  const handleAddActivity = () => {
    const activity = activityInput.trim();

    if (!activity) return;

    setProfileDetails((previous) => {
      const alreadyExists = previous.activities.some(
        (item) => item.toLowerCase() === activity.toLowerCase(),
      );

      if (alreadyExists) return previous;

      return {
        ...previous,
        activities: [...previous.activities, activity],
      };
    });

    setActivityInput("");
    setSaveMessage("");
  };

  const handleActivityKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddActivity();
    }
  };

  const handleRemoveActivity = (indexToRemove) => {
    setProfileDetails((previous) => ({
      ...previous,
      activities: previous.activities.filter(
        (_, index) => index !== indexToRemove,
      ),
    }));

    setSaveMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Include a pending activity the user typed but didn't click "Add" for.
    const pending = activityInput.trim();
    const details =
      pending &&
      !profileDetails.activities.some((a) => a.toLowerCase() === pending.toLowerCase())
        ? { ...profileDetails, activities: [...profileDetails.activities, pending] }
        : profileDetails;

    try {
      setSaving(true);
      setSaveMessage("");

      if (typeof onSaveProfileDetails === "function") {
        await onSaveProfileDetails(details);
      } else {
        const updatedUser = await saveProfileDetailsRequest(details);
        mergeUser?.(updatedUser);
      }

      setSaveMessage("Profile details saved successfully.");
    } catch (error) {
      console.error("Failed to save profile details:", error);
      setSaveMessage(error?.message || "Unable to save profile details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const lastActive =
    user?.lastActiveAt || user?.lastActive || user?.lastSeenAt;

  return (
    <div className="relative mx-auto w-full max-w-4xl space-y-8 p-4 sm:p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-pink-700">
          Profile Settings
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage the information displayed on your TopEscortNetwork profile.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <UserRound size={19} className="text-pink-600" />
          <h2 className="font-semibold text-gray-800">
            Profile Information
          </h2>
        </div>

        <div className="rounded-xl border border-pink-100 bg-white p-4 shadow-sm sm:p-6">
          <UpdateProfileSettings
            onProfileUpdate={onProfileUpdate}
            user={user}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Users size={19} className="text-pink-600" />
            <h2 className="font-semibold text-gray-800">
              Profile Details
            </h2>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Add details to help visitors understand your profile.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-pink-100 bg-white p-4 shadow-sm sm:p-6"
        >
          <ProfileField
            label="Caters To"
            name="catersTo"
            value={profileDetails.catersTo}
            onChange={handleChange}
            placeholder="Who do you cater to?"
            icon={Users}
          />

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 font-medium text-gray-800">
                  <Clock3 size={17} className="text-pink-600" />
                  Last Active
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  {formatLastActive(lastActive)}
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="showLastActive"
                  checked={profileDetails.showLastActive}
                  onChange={handleChange}
                  className="h-4 w-4 accent-pink-600"
                />
                Show on profile
              </label>
            </div>

            <p className="mt-3 text-xs leading-5 text-gray-500">
              Your last-active time is based on platform activity. You can
              control whether it appears on your public profile.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <ProfileField
              label="Body Type"
              name="bodyType"
              value={profileDetails.bodyType}
              onChange={handleChange}
              placeholder="Enter body type"
              icon={UserRound}
            />

            <ProfileField
              label="Height"
              name="height"
              value={profileDetails.height}
              onChange={handleChange}
              placeholder="Example: 5 ft 7 in"
              icon={Ruler}
            />

            <ProfileField
              label="Ethnicity"
              name="ethnicity"
              value={profileDetails.ethnicity}
              onChange={handleChange}
              placeholder="Enter ethnicity"
            />

            <ProfileField
              label="Cup Size"
              name="cupSize"
              value={profileDetails.cupSize}
              onChange={handleChange}
              placeholder="Enter cup size"
            />

            <ProfileField
              label="Hair Color"
              name="hairColor"
              value={profileDetails.hairColor}
              onChange={handleChange}
              placeholder="Enter hair color"
              icon={Palette}
            />

            <ProfileField
              label="Eye Color"
              name="eyeColor"
              value={profileDetails.eyeColor}
              onChange={handleChange}
              placeholder="Enter eye color"
              icon={Palette}
            />

            <ProfileField
              label="Weight"
              name="weight"
              value={profileDetails.weight}
              onChange={handleChange}
              placeholder="Example: 140 lb"
              icon={Weight}
            />
          </div>

          <div>
            <label htmlFor="tourSchedule" className={labelClassName}>
              Tour Schedule
            </label>

            <div className="relative">
              <MapPin
                size={17}
                className="pointer-events-none absolute left-3 top-3 text-gray-400"
              />

              <textarea
                id="tourSchedule"
                name="tourSchedule"
                value={profileDetails.tourSchedule}
                onChange={handleChange}
                rows={4}
                placeholder="Add upcoming tour locations, dates, and other schedule information."
                className={`${inputClassName} resize-y pl-10`}
              />
            </div>

            <p className="mt-1.5 text-xs text-gray-500">
              Share upcoming tour information that you want displayed on your
              profile.
            </p>
          </div>

          <section className="space-y-4 border-t border-gray-100 pt-6">
            <div>
              <div className="flex items-center gap-2">
                <ListChecks size={19} className="text-pink-600" />
                <h2 className="font-semibold text-gray-800">
                  Activities
                </h2>
              </div>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                Add activities individually. Each one will appear as a
                separate list item on your published profile.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={activityInput}
                onChange={(event) => setActivityInput(event.target.value)}
                onKeyDown={handleActivityKeyDown}
                placeholder="Enter an activity"
                className={inputClassName}
                aria-label="New activity"
              />

              <button
                type="button"
                onClick={handleAddActivity}
                disabled={!activityInput.trim()}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={17} />
                Add Activity
              </button>
            </div>

            {profileDetails.activities.length > 0 ? (
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Your Activities
                  </h3>

                  <span className="rounded-full bg-pink-100 px-2.5 py-1 text-xs font-semibold text-pink-700">
                    {profileDetails.activities.length} added
                  </span>
                </div>

                <ul className="space-y-2">
                  {profileDetails.activities.map((activity, index) => (
                    <li
                      key={`${activity}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2.5"
                    >
                      <span className="flex min-w-0 items-center gap-3 text-sm text-gray-700">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-pink-500" />
                        <span className="break-words">{activity}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveActivity(index)}
                        className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove ${activity}`}
                        title="Remove activity"
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
                <ListChecks
                  size={23}
                  className="mx-auto text-gray-400"
                />
                <p className="mt-2 text-sm font-medium text-gray-600">
                  No activities added yet.
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Your activities will appear here as you add them.
                </p>
              </div>
            )}
          </section>

          <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p role="status" className="text-sm text-gray-500">
              {saveMessage}
            </p>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save Profile Details"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Eye size={19} className="text-pink-600" />
          <h2 className="font-semibold text-gray-800">
            Profile References & Links
          </h2>
        </div>

        <div className="rounded-xl border border-pink-100 bg-white p-4 shadow-sm sm:p-6">
          <ReferencesLinks editable user={user} />
        </div>
      </section>
    </div>
  );
}
