import api from "@/shared/utils/api";

export const saveProfileDetails = async (details) => {
  try {
    const response = await api.patch("/users/me/profile-details", details);
    return response.data?.user ?? response.data;
  } catch (error) {
    throw new Error(
      error?.response?.data?.error || error?.message || "Unable to save profile details.",
    );
  }
};
