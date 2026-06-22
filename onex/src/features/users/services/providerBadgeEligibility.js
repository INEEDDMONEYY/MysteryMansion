// Users who sign up within this launch window receive the Permanent Provider badge.
export const PERMANENT_PROVIDER_WINDOW_START = "2026-03-17T00:00:00.000Z";
export const PERMANENT_PROVIDER_WINDOW_END = "2026-05-17T23:59:59.999Z";

export const hasPermanentProviderBadge = (createdAt) => {
  if (!createdAt) return false;

  const createdMs = new Date(createdAt).getTime();
  const startMs = new Date(PERMANENT_PROVIDER_WINDOW_START).getTime();
  const endMs = new Date(PERMANENT_PROVIDER_WINDOW_END).getTime();

  if (!Number.isFinite(createdMs) || !Number.isFinite(startMs) || !Number.isFinite(endMs)) {
    return false;
  }

  return createdMs >= startMs && createdMs <= endMs;
};

export default { hasPermanentProviderBadge };