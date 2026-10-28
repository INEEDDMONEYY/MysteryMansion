import { forumRequest } from "./forumApi";

/** Engagement the signed-in member's forum threads and replies received from other people. */
export const getMyForumAnalytics = () =>
  forumRequest({ method: "get", url: "/forum/me/analytics" });
