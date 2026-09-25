// 📦 Post Formatting Utilities

export const formatPhoneNumber = (value = "") => {
  const digits = String(value).replace(/\D/g, "").slice(0, 10);

  if (!digits) return "";

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};

export const getPhoneHref = (value = "") => {
  const digits = String(value).replace(/\D/g, "");

  if (!digits) return "";

  return `tel:${digits}`;
};

export const getPostedAgoLabel = (createdAt) => {
  if (!createdAt) return "";

  const created = new Date(createdAt);

  if (Number.isNaN(created.getTime())) {
    return "";
  }

  const diffMs = Date.now() - created.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (diffMs < minute) {
    return "Posted just now";
  }

  if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);

    return `Posted ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);

    return `Posted ${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  if (diffMs < week) {
    const days = Math.floor(diffMs / day);

    return `Posted ${days} day${days === 1 ? "" : "s"} ago`;
  }

  if (diffMs < month) {
    const weeks = Math.floor(diffMs / week);

    return `Posted ${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }

  if (diffMs < year) {
    const months = Math.floor(diffMs / month);

    return `Posted ${months} month${months === 1 ? "" : "s"} ago`;
  }

  const years = Math.floor(diffMs / year);

  return `Posted ${years} year${years === 1 ? "" : "s"} ago`;
};