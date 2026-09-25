// In-memory sliding-window rate limiter for outbound notification emails.
// Single-process only (no Redis) — sufficient for this deployment's scale and
// prevents notification-email abuse/spoofing (e.g. spamming likes/comments/
// messages to flood a recipient's inbox) without blocking the underlying action.

const buckets = new Map(); // key -> timestamps (ms) of recent allowed sends

function prune(timestamps, windowMs, now) {
  while (timestamps.length && now - timestamps[0] > windowMs) timestamps.shift();
}

/**
 * Returns true (and records the occurrence) if the action identified by `key`
 * is allowed under the given rate limit; returns false if it should be
 * suppressed.
 * @param {string} key - unique bucket identifier, e.g. `${type}:${recipientId}`
 * @param {{ limit?: number, windowMs?: number }} opts
 */
export function allowEmail(key, { limit = 1, windowMs = 10 * 60 * 1000 } = {}) {
  const now = Date.now();
  let timestamps = buckets.get(key);
  if (!timestamps) {
    timestamps = [];
    buckets.set(key, timestamps);
  }
  prune(timestamps, windowMs, now);
  if (timestamps.length >= limit) return false;
  timestamps.push(now);
  return true;
}

// Periodic sweep so long-idle keys (one-off senders, closed accounts, etc.)
// don't accumulate in memory forever.
setInterval(() => {
  const now = Date.now();
  const staleAfterMs = 60 * 60 * 1000;
  for (const [key, timestamps] of buckets) {
    prune(timestamps, staleAfterMs, now);
    if (timestamps.length === 0) buckets.delete(key);
  }
}, 10 * 60 * 1000).unref();
