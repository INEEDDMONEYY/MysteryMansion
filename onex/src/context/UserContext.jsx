// Frontend UserContext file (updated with error timeout)
import { createContext, useState, useEffect, useRef } from "react";
import api, { setAuthToken, clearAuthData, getAuthToken } from '@/shared/utils/api';

export const UserContext = createContext();

const keyFor = (base, userId) => (userId ? `${base}_${userId}` : base);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // A cached user without a token is a leftover from an old session.
    if (!getAuthToken()) return null;
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });
  // Bumped on every sign-in/sign-out so responses from an earlier session
  // (e.g. a slow /auth/me during server warm-up) can't overwrite the new state.
  const authEpochRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appToast, setAppToast] = useState(null);

  const RESTRICTION_LABELS = {
    "no-posting": "Posting is disabled for your account.",
    "no-comments": "Messaging/commenting is disabled for your account.",
    "read-only": "Your account is in read-only mode.",
  };

  const persistUser = (u) => {
    if (!u) return;
    try {
      localStorage.setItem("user", JSON.stringify(u));
      localStorage.setItem(`user_${u._id}`, JSON.stringify(u));
      if (u._id) {
        localStorage.setItem(keyFor("userProfile", u._id), JSON.stringify(u));
      }
    } catch (e) {
      console.error("Failed to persist user:", e);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const epoch = authEpochRef.current;
    let didTimeout = false;
    const timeoutId = setTimeout(() => {
      didTimeout = true;
      setError("User load timed out. Please try again.");
      setLoading(false);
    }, 10000); // 10-second timeout

    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        if (didTimeout || epoch !== authEpochRef.current) return;

        const fetched = res.data?.user ?? res.data;
        setUser(fetched);
        persistUser(fetched);
      } catch (err) {
        if (didTimeout || epoch !== authEpochRef.current) return;
        // Only an auth rejection ends the session; network errors while the
        // server is waking up keep the cached user signed in.
        if (err.response?.status === 401) {
          clearAuthData();
          setUser(null);
        }
        setError(err.response?.data?.error || err.message);
      } finally {
        if (!didTimeout) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    fetchUser();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep other open tabs in sync when the user signs in or out elsewhere.
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== "token" && event.key !== "user" && event.key !== null) return;
      authEpochRef.current += 1;
      if (!getAuthToken()) {
        setUser(null);
        return;
      }
      try {
        setUser(JSON.parse(localStorage.getItem("user") || "null"));
      } catch {
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Sessions can last days, so claim the daily-login reward once per day on load.
  useEffect(() => {
    if (!user?._id || !getAuthToken()) return;
    const today = new Date().toISOString().slice(0, 10);
    const storageKey = `daily_login_${user._id}`;
    if (localStorage.getItem(storageKey) === today) return;
    api.post("/credits/earn/daily-login")
      .then(() => localStorage.setItem(storageKey, today))
      .catch(() => {});
  }, [user?._id]);

  useEffect(() => {
    const restriction = user?.roleRestriction;
    if (!restriction) return;

    setAppToast({
      type: "warning",
      message: RESTRICTION_LABELS[restriction] || `Restriction applied: ${restriction}`,
    });

    const timer = setTimeout(() => setAppToast(null), 3500);
    return () => clearTimeout(timer);
  }, [user?.roleRestriction]);

  useEffect(() => {
    const handleAppToast = (event) => {
      const message = event?.detail?.message || "This action is restricted for your account.";
      const type = event?.detail?.type || "error";

      setAppToast({ type, message });
      setTimeout(() => setAppToast(null), 3500);
    };

    window.addEventListener("restriction-toast", handleAppToast);
    window.addEventListener("app-toast", handleAppToast);
    return () => {
      window.removeEventListener("restriction-toast", handleAppToast);
      window.removeEventListener("app-toast", handleAppToast);
    };
  }, []);

  // Shared by email/password and Google sign-in.
  const completeSignIn = async (request, fallbackMessage) => {
    const epoch = ++authEpochRef.current;
    try {
      const res = await request();
      const { token, user: returnedUser } = res.data;
      if (epoch !== authEpochRef.current) throw new Error("Sign-in was interrupted. Please try again.");
      setAuthToken(token);
      let authUser = returnedUser ?? res.data;

      // Hydrate from canonical user endpoint to ensure profilePic/restrictions are current
      try {
        const meRes = await api.get("/auth/me");
        authUser = meRes.data?.user ?? meRes.data ?? authUser;
      } catch (meErr) {
        console.warn("/me hydration failed after login, using signin payload", meErr?.message || meErr);
      }

      if (epoch !== authEpochRef.current) throw new Error("Sign-in was interrupted. Please try again.");
      setUser(authUser);
      persistUser(authUser);
      setLoading(false); // ✅ Clear loading state after successful login
      return authUser;
    } catch (err) {
      setLoading(false); // ✅ Clear loading state on error too
      const error = new Error(err.response?.data?.error || err.message || fallbackMessage);
      error.status = err.response?.status;
      error.data = err.response?.data;
      throw error;
    }
  };

  const login = (email, password) =>
    completeSignIn(
      () => api.post("/auth/signin", { email: email?.trim()?.toLowerCase(), password }),
      "Login failed",
    );

  const loginWithGoogle = (credential) =>
    completeSignIn(() => api.post("/auth/google", { credential }), "Google sign-in failed");

  const logout = async () => {
    authEpochRef.current += 1;
    // Send the request with the current token, but clear local state right away
    // so the navbar updates instantly instead of after the network round-trip.
    const token = getAuthToken();
    const request = api.post(
      "/auth/logout",
      null,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
    );
    clearAuthData();
    setUser(null);
    try {
      await request;
    } catch (err) {
      console.warn("Logout error:", err.message || err);
    }
  };

  const updateProfile = async (data, isFormData = false) => {
    try {
      let res;

      if (isFormData) {
        res = await api.post("/users/update-profile", data);
      } else {
        res = await api.post("/users/update-profile", data);
      }

      const returned = res.data?.user ?? res.data;
      if (!returned) throw new Error("No user returned from update");

      const mergedUser = { ...(user || {}), ...returned };
      setUser(mergedUser);
      persistUser(mergedUser);

      return mergedUser;
    } catch (err) {
      throw new Error(err.response?.data?.error || "Profile update failed");
    }
  };

  // Merges a server-returned user (or partial) into state and local storage.
  const mergeUser = (partial) => {
    if (!partial) return null;
    let merged = null;
    setUser((current) => {
      merged = { ...(current || {}), ...partial };
      persistUser(merged);
      return merged;
    });
    return merged;
  };

  const refreshUser = async () => {
    const epoch = authEpochRef.current;
    try {
      const res = await api.get("/auth/me");
      const fetched = res.data?.user ?? res.data;
      if (epoch !== authEpochRef.current) return null;
      setUser(fetched);
      persistUser(fetched);
      return fetched;
    } catch (err) {
      console.error("Refresh user failed:", err.response?.data || err.message);
      throw err;
    }
  };

  const deleteAccount = async () => {
    try {
      const currentUserId = user?._id || user?.id;
      await api.delete("/users/delete-account");

      authEpochRef.current += 1;
      clearAuthData();
      if (currentUserId) {
        localStorage.removeItem(`user_${currentUserId}`);
        localStorage.removeItem(keyFor("userProfile", currentUserId));
      }

      setUser(null);
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.error || "Failed to delete account");
    }
  };

  return (
    <>
      {appToast && (
        <div
          className={`fixed top-4 right-4 z-[9999] max-w-sm rounded-md px-4 py-3 text-sm text-white shadow-lg ${
            appToast.type === "warning"
              ? "bg-amber-600"
              : appToast.type === "success"
                ? "bg-green-600"
                : "bg-red-600"
          }`}
        >
          {appToast.message}
        </div>
      )}

      <UserContext.Provider
        value={{
          user,
          setUser,
          login,
          loginWithGoogle,
          logout,
          updateProfile,
          mergeUser,
          refreshUser,
          deleteAccount,
          loading,
          error,
        }}
      >
        {children}
      </UserContext.Provider>
    </>
  );
};