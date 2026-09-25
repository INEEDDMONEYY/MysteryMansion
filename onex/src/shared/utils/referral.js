// Small helper to persist a referral code across the sign-up flow.
const STORAGE_KEY = "mm_referral_code";

export function storeReferralCode(code) {
  const value = String(code || "").trim();
  if (!value) return;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Ignore storage failures (e.g. private browsing) — referral is best-effort.
  }
}

export function getStoredReferralCode() {
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function clearStoredReferralCode() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
