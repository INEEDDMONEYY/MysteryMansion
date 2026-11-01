import api from "@/shared/utils/api";

const toError = (error, fallback) =>
  new Error(error?.response?.data?.error || error?.message || fallback);

export const fetchNotificationPreferences = async () => {
  try {
    const { data } = await api.get("/users/me/notification-preferences");
    return data?.preferences || {};
  } catch (error) {
    throw toError(error, "Unable to load notification preferences.");
  }
};

export const saveNotificationPreferences = async (preferences) => {
  try {
    const { data } = await api.patch("/users/me/notification-preferences", preferences);
    return data?.preferences || preferences;
  } catch (error) {
    throw toError(error, "Unable to save notification preferences.");
  }
};
