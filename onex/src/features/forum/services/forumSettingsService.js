import api from "@/shared/utils/api";

export const DEFAULT_FORUM_SETTINGS = {
  discussionReplies: true,
  mentions: true,
  followedDiscussionNotifications: true,
  followedCategoryNotifications: false,
  autoFollowDiscussions: true,
  digestFrequency: "weekly",
};

export async function fetchForumSettings() {
  try {
    const { data } = await api.get("/forum/me/settings");
    if (!data?.settings) throw new Error("The server returned no forum settings.");
    return data.settings;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message || "Unable to load forum settings.");
  }
}

export async function saveForumSettings(settings) {
  try {
    const { data } = await api.patch("/forum/me/settings", settings);
    if (!data?.settings) throw new Error("The server returned no saved forum settings.");
    return data.settings;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message || "Unable to save forum settings.");
  }
}
