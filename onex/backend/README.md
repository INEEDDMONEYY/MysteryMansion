# MM Backend

This folder handles all backend logic.

## Forum thread follows

- `GET /api/forum/threads?followed=true` lists the signed-in member's followed,
  non-archived threads using the standard pagination and sorting parameters.
- `PUT /api/forum/threads/:id/follow` accepts boolean `following` and
  `notificationsEnabled` fields. Enabling notifications requires following.
  Settings are account-specific and persisted in `ForumFollow`.
- Following alone saves the thread without reply alerts. The bell enables
  in-app `forum_reply` notifications through the existing notification system.
  Turning the bell off or unfollowing also mutes automatic author/comment
  alerts for that thread. Existing author/comment alerts remain unchanged
  until the member explicitly saves a preference.
- Reply notifications exclude the reply author and deduplicate recipients.
  Deleting a thread removes its follow preferences.

## Forum engagement and inbox

- Thread lists, details, and bookmarks include `followerCount` and up to ten
  follower previews (public ID, username, profile photo only). Only active
  follows with an existing user count. `GET /api/forum/threads/:id/followers`
  refreshes this summary without incrementing thread views.

- `GET /api/forum/me/analytics` returns the signed-in member's engagement
  totals, a 14-day UTC reply/upvote series, and their top five discussions.
  The forum Engagement page and client dashboard share this API and panel.
- `GET /api/forum/me/notifications` returns only that member's `forum_reply`
  alerts, newest first. Supports `page`, `limit` (maximum 50), and
  `unread=true`; includes pagination and the total unread forum count.
- `PATCH /api/forum/me/notifications/:id/read` marks an owned forum alert read.
  `PATCH /api/forum/me/notifications/read-all` marks only owned forum alerts.
  Both update the same records used by the platform notification bell.
- Both pages require sign-in before requesting private account data.