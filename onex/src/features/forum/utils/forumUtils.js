export const normalizeForumId = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();

  return normalized || null;
};

export const isValidForumId = (value) =>
  Boolean(normalizeForumId(value));

export const createForumSlug = (value) => {
  if (!value) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

export const isArchivedForumItem = (item) =>
  Boolean(item?.archived);

export const isPinnedForumItem = (item) =>
  Boolean(item?.pinned);

export const getForumItemState = (item) => {
  if (!item) {
    return "unknown";
  }

  if (item.archived) {
    return "archived";
  }

  if (item.pinned) {
    return "pinned";
  }

  return "active";
};

export const formatForumCount = (value) => {
  const count = Number(value);

  if (!Number.isFinite(count) || count < 0) {
    return "0";
  }

  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }

  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }

  return String(Math.floor(count));
};

export const formatForumDate = (value) => {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() !== new Date().getFullYear()
        ? "numeric"
        : undefined,
  }).format(date);
};

export const formatForumTimeAgo = (value) => {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return formatForumDate(value);
};