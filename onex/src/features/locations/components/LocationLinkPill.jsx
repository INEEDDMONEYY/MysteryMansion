import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

// Compact link to a /locations/:slug page with its listing count.
export default function LocationLinkPill({ location, showState = false, tone = "light" }) {
  if (!location?.slug) return null;

  const label =
    location.type === "state" || !location.city
      ? location.state
      : showState && location.state
        ? `${location.city}, ${location.state}`
        : location.city;

  const styles =
    tone === "dark"
      ? "border-white/10 bg-white/5 text-white/85 hover:border-pink-500/50 hover:text-white"
      : "border-gray-200 bg-white text-gray-800 hover:border-pink-400 hover:text-pink-600";

  return (
    <Link
      to={`/locations/${location.slug}`}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${styles}`}
    >
      <MapPin size={14} className="shrink-0 text-pink-500" />
      <span>{label}</span>
      {Number(location.postCount) > 0 && (
        <span className={tone === "dark" ? "text-white/50" : "text-gray-400"}>
          {location.postCount}
        </span>
      )}
    </Link>
  );
}
