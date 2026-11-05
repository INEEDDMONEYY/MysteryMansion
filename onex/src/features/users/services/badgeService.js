import api from "@/shared/utils/api";

export async function fetchProfileBadges(userId, signal) {
  const { data } = await api.get(`/badges/${userId}`, { signal });
  if (!Array.isArray(data?.badges) || typeof data?.totalBadges !== "number") {
    throw new Error("Invalid profile badges response.");
  }
  return data;
}
