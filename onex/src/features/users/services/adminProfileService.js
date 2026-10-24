import api from "@/shared/utils/api";

const get = async (url, params) => {
  try {
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.error || error?.message || "Request failed."
    );
  }
};

export const fetchAdminActivity = (params) =>
  get("/admin/profile-data/activity", params);

export const fetchAdminMedia = (params) =>
  get("/admin/profile-data/media", params);

export const fetchAdminResolvedFlags = (params) =>
  get("/admin/profile-data/resolved-flags", params);
