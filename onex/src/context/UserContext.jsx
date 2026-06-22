// Frontend UserContext file (updated with error timeout)
import { createContext, useState, useEffect } from "react";
import api, { setAuthToken, clearAuthData, getAuthToken } from '@/shared/utils/api';

export const UserContext = createContext();

const keyFor = (base, userId) => (userId ? `${base}_${userId}` : base);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
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

    let didTimeout = false;
    const timeoutId = setTimeout(() => {
      didTimeout = true;
      setError("User load timed out. Please try again.");
      setLoading(false);
    }, 10000); // 10-second timeout

    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        if (didTimeout) return; // ignore if timed out

        const fetched = res.data?.user ?? res.data;
        setUser(fetched);
        persistUser(fetched);
      } catch (err) {
        if (didTimeout) return;
        clearAuthData();
        setUser(null);
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

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/signin", { email: email?.trim()?.toLowerCase(), password });
      const { token, user: returnedUser } = res.data;
      setAuthToken(token);
      let authUser = returnedUser ?? res.data;

      // Hydrate from canonical user endpoint to ensure profilePic/restrictions are current
      try {
        const meRes = await api.get("/auth/me");
        authUser = meRes.data?.user ?? meRes.data ?? authUser;
      } catch (meErr) {
        console.warn("/me hydration failed after login, using signin payload", meErr?.message || meErr);
      }

      setUser(authUser);
      persistUser(authUser);
      setLoading(false); // ✅ Clear loading state after successful login
      return authUser;
    } catch (err) {
      setLoading(false); // ✅ Clear loading state on error too
      throw new Error(err.response?.data?.error || "Login failed");
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Logout error:", err.message || err);
    }
    clearAuthData();
    setUser(null);
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

  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me");
      const fetched = res.data?.user ?? res.data;
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
          logout,
          updateProfile,
          refreshUser,
          deleteAccount,
          loading,
          error,
        }}
      >
        {!loading ? (
          children
        ) : (
          <p className="text-center mt-10">
            {error ? `Error: ${error}` : "Loading..."}
          </p>
        )}
      </UserContext.Provider>
    </>
  );
};