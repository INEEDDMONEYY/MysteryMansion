// Distinct from "app-toast", which UserContext uses for its own plain banner.
export const APP_TOAST_EVENT = "credit-toast";

/** Shows a top-right toast from anywhere; type must be a key of TOAST_TYPES in NotificationToastHost. */
export function showAppToast({ type, title, message }) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(APP_TOAST_EVENT, { detail: { type, title, message } }));
}
