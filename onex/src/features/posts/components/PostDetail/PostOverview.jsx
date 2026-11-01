// 🧑 Post Overview — basics plus the author's profile stats, tour schedule and
// activities in one flat, background-free section.
import { Clock3 } from "lucide-react";
import { Link } from "react-router-dom";

import { getProfileDetails } from "@/features/users/components/provider-profile/ProviderProfileStats";

const SubHeading = ({ children }) => (
  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
    {children}
  </h3>
);

const Pill = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-pink-300 px-2.5 py-1 text-xs font-semibold text-pink-700">
    {children}
  </span>
);

export default function PostOverview({
  gender = "",
  age = "",
  location = "",
  locationHref = "",
  categories = [],
  details = null,
}) {
  const { stats, lastActive, tourSchedule, activities } = getProfileDetails(details);

  const facts = [
    gender && { key: "gender", label: "Gender", value: gender },
    age && { key: "age", label: "Age", value: age },
    location && {
      key: "location",
      label: "Location",
      value: locationHref ? (
        <Link to={locationHref} className="text-pink-600 hover:underline">
          {location}
        </Link>
      ) : (
        location
      ),
    },
    ...stats,
  ].filter(Boolean);

  return (
    <section className="border-b border-gray-200 py-6">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold text-pink-500">Overview</h2>
          {lastActive && (
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock3 className="h-3.5 w-3.5" />
              Last active <span className="font-medium text-gray-700">{lastActive}</span>
            </p>
          )}
        </div>

        {facts.length > 0 && (
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.key} className="min-w-0 border-l-2 border-pink-200 pl-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {fact.label}
                </dt>
                <dd className="mt-0.5 break-words text-sm font-medium text-gray-800">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {activities.length > 0 && (
          <div className="mt-6">
            <SubHeading>Activities</SubHeading>
            <div className="flex flex-wrap gap-2">
              {activities.map((activity) => (
                <Pill key={activity}>{activity}</Pill>
              ))}
            </div>
          </div>
        )}

        {tourSchedule && (
          <div className="mt-6">
            <SubHeading>Tour Schedule</SubHeading>
            <p className="whitespace-pre-line text-sm text-gray-700">{tourSchedule}</p>
          </div>
        )}

        {categories.length > 0 && (
          <div className="mt-6">
            <SubHeading>Categories</SubHeading>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Pill key={category}>{category}</Pill>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
