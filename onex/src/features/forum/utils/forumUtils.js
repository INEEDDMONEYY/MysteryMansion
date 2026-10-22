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