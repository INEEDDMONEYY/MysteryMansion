import api from "@/shared/utils/api";

export const PROFILE_FOLLOW_CHANGED = "profile-follow-changed";

export async function fetchProfileConnections(userId, page, signal) {
  const { data } = await api.get(`/social/${userId}`, { params: { page }, signal });
  if (!Array.isArray(data?.friends) || !data?.viewer || !data?.pagination) {
    throw new Error("Invalid profile connections response.");
  }
  return data;
}

export async function setProfileFollow(userId, following) {
  const { data } = await api.put(`/social/${userId}/follow`, { following });
  if (typeof data?.following !== "boolean") throw new Error("Invalid profile follow response.");
  window.dispatchEvent(new CustomEvent(PROFILE_FOLLOW_CHANGED));
  return data;
}
