export const FLAG_STATUS_OPTIONS = Object.freeze([
  { id: "pending", label: "Received" },
  { id: "investigating", label: "Under investigation" },
  { id: "action_taken", label: "Action taken" },
  { id: "resolved", label: "Resolved" },
  { id: "dismissed", label: "Dismissed" },
]);

const STATUS_STYLES = {
  pending: {
    dark: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    light: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-400",
  },
  investigating: {
    dark: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    light: "border-sky-200 bg-sky-50 text-sky-700",
    dot: "bg-sky-400",
  },
  action_taken: {
    dark: "border-violet-400/30 bg-violet-400/10 text-violet-300",
    light: "border-violet-200 bg-violet-50 text-violet-700",
    dot: "bg-violet-400",
  },
  resolved: {
    dark: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    light: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-400",
  },
  dismissed: {
    dark: "border-neutral-600 bg-neutral-800 text-neutral-300",
    light: "border-gray-200 bg-gray-100 text-gray-600",
    dot: "bg-neutral-400",
  },
};

export const getFlagStatusLabel = (status) =>
  FLAG_STATUS_OPTIONS.find((option) => option.id === status)?.label || status;

export const getFlagStatusStyle = (status) =>
  STATUS_STYLES[status] || STATUS_STYLES.pending;
