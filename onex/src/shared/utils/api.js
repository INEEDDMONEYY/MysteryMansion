// API.js 
import axios from "axios";

// In DEV: use relative paths — Vite proxy (vite.config.js) forwards /api → Render.
// This means the browser makes same-origin requests (no CORS) and Render is never
// called directly by the browser, eliminating CORS issues entirely.
//
// In PROD: use same-origin (Vercel rewrites /api → Render at the CDN level).
//
// An explicit VITE_BACKEND_URL env var always overrides this logic.

const _envOverride =
  import.meta.env.VITE_BACKEND_URL?.trim() ||
  import.meta.env.VITE_API_BASE?.trim() ||
  import.meta.env.VITE_API_URL?.trim();

let API_BASE;
if (_envOverride) {
  API_BASE = _envOverride;
} else if (import.meta.env.DEV) {
  API_BASE = ""; // Vite proxy handles routing — no direct Render calls from browser
} else {
  // Production: same-origin (Vercel /api rewrite handles backend routing)
  API_BASE = typeof window !== "undefined" ? window.location.origin : "https://uninterested.onrender.com";
}

API_BASE = API_BASE.replace(/\/+$/, "");

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});

const RESTRICTION_LABELS = {
  "no-posting": "Posting is disabled for your account.",
  "no-comments": "Messaging/commenting is disabled for your account.",
  "read-only": "Your account is in read-only mode.",
};

const emitRestrictionToast = (payload) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("restriction-toast", { detail: payload }));
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;

    // ✅ Axios will now automatically handle FormData Content-Type
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const restriction = data?.restriction;

    if (status === 403 && restriction) {
      emitRestrictionToast({
        type: "error",
        message:
          data?.error ||
          RESTRICTION_LABELS[restriction] ||
          "This action is restricted for your account.",
      });
    }

    return Promise.reject(error);
  }
);

export const getAuthToken = () => localStorage.getItem("token");
export const setAuthToken = (token) => token ? localStorage.setItem("token", token) : localStorage.removeItem("token");
export const clearAuthData = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); };

export default api;
