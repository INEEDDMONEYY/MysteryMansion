import { Activity, Clock3, ListChecks, MapPin } from "lucide-react";

export const DETAIL_FIELDS = [
  { key: "catersTo", label: "Caters To" },
  { key: "bodyType", label: "Body Type" },
  { key: "height", label: "Height" },
  { key: "weight", label: "Weight" },
  { key: "ethnicity", label: "Ethnicity" },
  { key: "cupSize", label: "Cup Size" },
  { key: "hairColor", label: "Hair Color" },
  { key: "eyeColor", label: "Eye Color" },
];

export const formatLastActive = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";

  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 10) return "Online recently";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const clean = (value) => (typeof value === "string" ? value.trim() : "");

/** Visible profile details (empty fields dropped; last-active only if opted in). */
export const getProfileDetails = (details) => {
  if (!details) return { stats: [], lastActive: "", tourSchedule: "", activities: [] };
  return {
    stats: DETAIL_FIELDS
      .map((field) => ({ ...field, value: clean(details[field.key]) }))
      .filter((field) => field.value),
    lastActive: details.showLastActive ? formatLastActive(details.lastActiveAt) : "",
    tourSchedule: clean(details.tourSchedule),
    activities: Array.isArray(details.activities)
      ? details.activities.map(clean).filter(Boolean)
      : [],
  };
};

/** Right-column stats panel built from a provider's profile details. */
export default function ProviderProfileStats({
  details,
  className = "space-y-4 lg:sticky lg:top-6 lg:self-start",
}) {
  if (!details) return null;

  const { stats, lastActive, tourSchedule, activities } = getProfileDetails(details);

  if (!stats.length && !lastActive && !tourSchedule && !activities.length) return null;

  return (
    <aside className={className}>
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <header className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <Activity className="h-4 w-4 text-pink-500" />
          <h2 className="text-sm font-semibold text-gray-900">Profile Stats</h2>
        </header>

        {lastActive && (
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3 text-sm">
            <Clock3 className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">Last active</span>
            <span className="ml-auto font-medium text-gray-900">{lastActive}</span>
          </div>
        )}

        {stats.length > 0 && (
          <dl className="divide-y divide-gray-100">
            {stats.map((stat) => (
              <div key={stat.key} className="flex items-start justify-between gap-4 px-5 py-2.5 text-sm">
                <dt className="shrink-0 text-gray-500">{stat.label}</dt>
                <dd className="text-right font-medium text-gray-900 break-words">{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {tourSchedule && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <MapPin className="h-4 w-4 text-pink-500" />
            Tour Schedule
          </h2>
          <p className="whitespace-pre-line text-sm text-gray-700">{tourSchedule}</p>
        </section>
      )}

      {activities.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <ListChecks className="h-4 w-4 text-pink-500" />
            Activities
          </h2>
          <ul className="flex flex-wrap gap-2">
            {activities.map((activity) => (
              <li
                key={activity}
                className="rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-medium text-pink-700"
              >
                {activity}
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
