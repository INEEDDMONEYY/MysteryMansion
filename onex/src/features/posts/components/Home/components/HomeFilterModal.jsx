import { useEffect, useId } from "react";
import { X } from "lucide-react";

const selectClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10";

const labelClass =
  "mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500";

export default function HomeFilterModal({
  showFilters = false,
  onClose,
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
  const titleId = useId();

  useEffect(() => {
    if (!showFilters) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showFilters, onClose]);

  if (!showFilters) return null;

  const states =
    Array.isArray(filterOptions?.states)
      ? filterOptions.states
      : [];

  // Scope the city list to the selected state; fall back to every city
  // (across all states) when no state is chosen yet.
  const cities = pendingState
    ? filterOptions?.citiesByState?.[pendingState] || []
    : Array.isArray(filterOptions?.cities)
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-600">
              Refine
            </p>

            <h2 id={titleId} className="mt-1 text-lg font-bold text-black">
              Filter Results
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-black"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <label className="block">
            <span className={labelClass}>State</span>

            <select
              value={pendingState}
              onChange={(event) => onStateChange?.(event.target.value)}
              className={selectClass}
            >
              <option value="">All states</option>

              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={labelClass}>City</span>

            <select
              value={pendingCity}
              onChange={(event) => onCityChange?.(event.target.value)}
              className={selectClass}
            >
              <option value="">All cities</option>

              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={labelClass}>Gender</span>

            <select
              value={pendingGender}
              onChange={(event) => onGenderChange?.(event.target.value)}
              className={selectClass}
            >
              <option value="">All genders</option>

              {genders.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
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
    </div>
  );
}
