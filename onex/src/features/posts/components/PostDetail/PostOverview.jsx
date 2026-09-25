// 🧑 Post Overview

export default function PostOverview({
  gender = "",
  age = "",
  location = "",
  categories = [],
}) {
  return (
    <section className="border-b border-gray-200 py-6">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold text-pink-500">
          Overview
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gender && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Gender
              </p>
              <p className="mt-1 text-sm font-medium text-gray-700">
                {gender}
              </p>
            </div>
          )}

          {age && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Age
              </p>
              <p className="mt-1 text-sm font-medium text-gray-700">
                {age}
              </p>
            </div>
          )}

          {location && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Location
              </p>
              <p className="mt-1 text-sm font-medium text-gray-700">
                {location}
              </p>
            </div>
          )}
        </div>

        {categories.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Categories
            </p>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center rounded-full border border-pink-300 bg-pink-50 px-2.5 py-1 text-xs font-semibold text-pink-700"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}