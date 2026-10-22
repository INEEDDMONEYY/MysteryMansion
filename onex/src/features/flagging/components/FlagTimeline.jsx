import { getFlagStatusLabel, getFlagStatusStyle } from "../data/flagStatuses";

const THEMES = {
  dark: {
    line: "border-neutral-800",
    title: "text-white",
    message: "text-neutral-400",
    meta: "text-neutral-500",
  },
  light: {
    line: "border-gray-200",
    title: "text-gray-900",
    message: "text-gray-600",
    meta: "text-gray-400",
  },
};

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

const FlagTimeline = ({ entries = [], theme = "dark", showAuthor = false }) => {
  const styles = THEMES[theme] || THEMES.dark;
  const ordered = [...entries].reverse();

  if (!ordered.length) {
    return <p className={`text-sm ${styles.meta}`}>No updates yet.</p>;
  }

  return (
    <ol className={`ml-1.5 border-l ${styles.line}`}>
      {ordered.map((entry, index) => (
        <li key={entry._id || index} className="relative pb-5 pl-5 last:pb-0">
          <span
            className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ${
              getFlagStatusStyle(entry.status).dot
            }`}
          />

          <p className={`text-sm font-medium ${styles.title}`}>
            {getFlagStatusLabel(entry.status)}
          </p>

          {entry.message && (
            <p className={`mt-0.5 text-sm ${styles.message}`}>{entry.message}</p>
          )}

          <p className={`mt-0.5 text-xs ${styles.meta}`}>
            {formatDateTime(entry.createdAt)}
            {showAuthor && entry.updatedBy?.username
              ? ` · ${entry.updatedBy.username}`
              : ""}
          </p>
        </li>
      ))}
    </ol>
  );
};

export default FlagTimeline;
