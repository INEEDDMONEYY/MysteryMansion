import {
  SlidersHorizontal,
  X,
} from "lucide-react";

export default function HomeFilters({
  showFilters = false,
  onToggle,
  filterOptions = {},
  pendingState = "",
  pendingCity = "",
  pendingGender = "",
  activeFilters = {},
  onStateChange,
  onCityChange,
  onGenderChange,
  onApply,
  onClear,
}) {
  const states =
    Array.isArray(filterOptions?.states)
      ? filterOptions.states
      : [];

  const cities =
    Array.isArray(filterOptions?.cities)
      ? filterOptions.cities
      : [];

  const genders =
    Array.isArray(filterOptions?.genders)
      ? filterOptions.genders
      : [];

  const hasActiveFilters =
    Boolean(activeFilters?.state) ||
    Boolean(activeFilters?.city) ||
    Boolean(activeFilters?.gender);

  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-10">
        <div className="border-y border-black/10 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-600">
                Refine
              </p>

              <h2 className="mt-1 text-lg font-bold text-black">
                Filter Results
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-700">
                  Filters active
                </span>
              )}

              <button
                type="button"
                onClick={onToggle}
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:border-pink-500 hover:text-pink-600"
              >
                <SlidersHorizontal size={17} />

                {showFilters
                  ? "Hide Filters"
                  : "Show Filters"}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* State */}
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  State
                </span>

                <select
                  value={pendingState}
                  onChange={(event) =>
                    onStateChange?.(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10"
                >
                  <option value="">
                    All states
                  </option>

                  {states.map(
                    (state) => (
                      <option
                        key={state}
                        value={state}
                      >
                        {state}
                      </option>
                    )
                  )}
                </select>
              </label>

              {/* City */}
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  City
                </span>

                <select
                  value={pendingCity}
                  onChange={(event) =>
                    onCityChange?.(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10"
                >
                  <option value="">
                    All cities
                  </option>

                  {cities.map(
                    (city) => (
                      <option
                        key={city}
                        value={city}
                      >
                        {city}
                      </option>
                    )
                  )}
                </select>
              </label>

              {/* Gender */}
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Gender
                </span>

                <select
                  value={pendingGender}
                  onChange={(event) =>
                    onGenderChange?.(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10"
                >
                  <option value="">
                    All genders
                  </option>

                  {genders.map(
                    (gender) => (
                      <option
                        key={gender}
                        value={gender}
                      >
                        {gender}
                      </option>
                    )
                  )}
                </select>
              </label>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 md:col-span-3">
                <button
                  type="button"
                  onClick={onApply}
                  className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-600"
                >
                  Apply Filters
                </button>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={onClear}
                    className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-red-300 hover:text-red-600"
                  >
                    <X size={16} />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}