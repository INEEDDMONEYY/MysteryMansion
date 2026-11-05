import api from "@/shared/utils/api";

export async function fetchProgression(userId, signal) {
  const { data } = await api.get(`/progression/${userId}`, { signal });
  if (typeof data?.level !== "number" || typeof data?.rp !== "number") {
    throw new Error("Invalid progression response.");
  }
  return data;
}
