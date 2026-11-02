import { forumRequest } from "./forumApi";

export const getForumNotifications = ({ page = 1, unread = false } = {}) =>
  forumRequest({
    method: "get",
    url: "/forum/me/notifications",
    params: { page, limit: 20, unread: unread || undefined },
  });

export const markForumNotificationRead = (id) =>
  forumRequest({
    method: "patch",
    url: `/forum/me/notifications/${encodeURIComponent(id)}/read`,
  });

export const markAllForumNotificationsRead = () =>
  forumRequest({ method: "patch", url: "/forum/me/notifications/read-all" });
