const isKnown = (value) =>
  typeof value === "string" && value.trim() && !/^unknown\b/i.test(value.trim());

/** "Denver, Colorado" — city + state when known, otherwise the broadest known part. */
export const formatLocation = (location = {}) => {
  const city = isKnown(location?.city) ? location.city.trim() : "";
  const state = isKnown(location?.state) ? location.state.trim() : "";
  const country = isKnown(location?.country) ? location.country.trim() : "";

  if (city && state) return `${city}, ${state}`;
  return city || state || country || "";
};

/** The location the viewer picked/detected via LocationSet (stored locally). */
export const getViewerLocation = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem("userLocation") || "null");
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

/** Query params asking the API for posts near a location (empty when unknown). */
export const toNearParams = (location) => {
  if (!location) return {};
  const params = {};
  ["city", "state", "country"].forEach((key) => {
    if (isKnown(location[key])) params[key] = location[key].trim();
  });
  return Object.keys(params).length ? { ...params, match: "near" } : {};
};

const PRICE_FIELDS = [
  { key: "incallPrice", label: "Incall" },
  { key: "outcallPrice", label: "Outcall" },
  { key: "overnightPrice", label: "Overnight" },
  { key: "flyOutPrice", label: "Fly-out" },
];

/** [{ key, label, amount }] for each price the member has set. */
export const getPriceBadges = (user = {}) =>
  PRICE_FIELDS.map(({ key, label }) => {
    const value = Number(user?.[key]);
    return Number.isFinite(value) && value > 0
      ? { key, label, amount: `$${value.toLocaleString()}` }
      : null;
  }).filter(Boolean);
