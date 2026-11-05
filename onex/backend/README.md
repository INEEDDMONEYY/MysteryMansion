# MM Backend

This folder handles all backend logic.

## Profile follows and friends

- `GET /api/social/:userId?page=1` returns public follower/following/friend
  counts, twenty paginated mutual friends (public identity fields only),
  and the authenticated viewer's follow state.
- `PUT /api/social/:userId/follow` requires authentication and boolean
  `following`. Self-follows and suspended accounts are rejected. Repeated
  saves are idempotent; account deletion removes incoming/outgoing records.
- Friends require follows in both directions. Active admins and members
  follow each other by default, for existing and future accounts. These
  defaults are derived at read time rather than backfilled into every account.
  Explicit follows/unfollows override them permanently, so removed admins do
  not reappear on login. Suspended/deleted accounts are excluded.
- Profile headers currently display a fixed Level 1 ring, with a maximum
  planned level of 50; no progression or earned levels are implemented yet.
  The badge section is a visual placeholder awaiting SVG assets and rules,
  not an assertion that users have earned any badges.

## Transactional email

Set `CLOUDFLARE_API_TOKEN` (with Email Sending permission) and
`CLOUDFLARE_ACCOUNT_ID` in the backend environment. Cloudflare becomes the
primary sender for every email template; existing admin and recipient
preferences still apply. The sending domain must be enabled in Cloudflare
Email Sending, not just Email Routing. Arbitrary-recipient sending requires
Workers Paid; verified destination addresses can be used on the free plan.

Run `node scripts/testEmail.js welcome-provider --cloudflare` from this folder
to send to the default test inbox. Delivered and queued recipients are reported
separately; permanent bounces and API failures throw rather than report success.
Cloudflare failures are not retried through the legacy providers, avoiding
duplicate sends after an ambiguous timeout. Without a Cloudflare token, the
legacy Unosend/Mailgun path remains available.

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

## Forum settings and email digests

- `GET/PATCH /api/forum/me/settings` loads/saves the same account-specific
  settings for providers and clients. Accepted booleans are `discussionReplies`,
  `mentions`, `followedDiscussionNotifications`, `followedCategoryNotifications`,
  and `autoFollowDiscussions`; `digestFrequency` accepts `off`, `daily`, `weekly`.
  Defaults match the settings UI: everything enabled except category alerts,
  with a weekly digest. Preferences and digest state are private.
- Auto-follow applies to new participation only. Explicit unfollows and muted
  bells are never overwritten. Reply preferences control replies to your own
  discussions/comments; followed-discussion preferences additionally require
  an enabled thread bell. Mentions use complete `@username` matches and their
  own preference, independent of the thread bell. Each event creates at most
  one notification per recipient, excluding the actor and suspended accounts.
- `GET /api/forum/me/followed-categories` lists followed category IDs.
  `PUT /api/forum/categories/:id/follow` accepts boolean `following`; a Follow
  control is available on each category page. New discussions alert followers
  only when their category-notification preference is on.
- The hourly digest job starts after MongoDB connects. Daily/weekly mean
  elapsed 24 hours/7 days, not a fixed weekday. It summarizes new discussions
  and other members' replies in followed threads and categories, including
  threads whose in-app bells are muted. Archived threads and deleted replies
  are excluded. No new activity means no email; at most 20 discussions are
  listed with an overflow count.
- Digests use the shared email sender (Cloudflare when configured) and admin
  email switch. Digest frequency is an independent email opt-out, rather than
  the promotional or account-engagement email toggle. Changing cadence starts
  a new window; saving unchanged settings does not reset the window.
- A MongoDB watermark and 30-minute lease prevent normal concurrent duplicate
  sends and survive restarts. Failures/admin skips retain the watermark and
  defer another attempt for an hour. Delivery is at-least-once: a crash after
  provider acceptance but before recording success, or an ambiguous timeout,
  can still cause a later duplicate. No cross-provider retry occurs.
- Test the template with `node scripts/testEmail.js forum-digest --cloudflare`;
  this sends sample content to the default test inbox, not a real discussion.

## Forum engagement and inbox

- Thread lists, details, and bookmarks include `followerCount` and up to ten
  follower previews (public ID, username, profile photo only). Only active
  follows with an existing user count. `GET /api/forum/threads/:id/followers`
  refreshes this summary without incrementing thread views.

- `GET /api/forum/me/analytics` returns the signed-in member's engagement
  totals, a 14-day UTC reply/upvote series, and their top five discussions.
  The forum Engagement page and client dashboard share this API and panel.
- `GET /api/forum/me/notifications` returns only that member's `forum_reply`,
  `forum_mention`, and `forum_category`
  alerts, newest first. Supports `page`, `limit` (maximum 50), and
  `unread=true`; includes pagination and the total unread forum count.
- `PATCH /api/forum/me/notifications/:id/read` marks an owned forum alert read.
  `PATCH /api/forum/me/notifications/read-all` marks only owned forum alerts.
  Both update the same records used by the platform notification bell.
- Both pages require sign-in before requesting private account data.

## Profile badges

- `GET /api/badges/:userId` is public. It returns `{ badges, totalBadges }` with
  only the badges the profile has earned. Missing, invalid, or suspended users return 404.
- Badge definitions live in `src/modules/badges/badgeCatalog.js` (100 badges:
  50 `forum` and 50 `time`). Artwork is in `src/assets/icons/forum` (`<id>-<slug>.svg`)
  and `src/assets/icons/time` (`<id>.svg`).
- Time badges come from `User.createdAt`: days are whole elapsed days, months are
  calendar months, and years are whole months divided by 12.
- Forum and reputation stats are computed in `src/modules/badges/badgeEngine.js`.
  Streaks use `User.activity.longestStreak`, which `recordDailyActivity` updates once
  per UTC day from authenticated requests.
- Reputation points: likes received 20, comments 15, reviews received 40,
  milestones 10, solutions 25, and 50 for an account with no open flags
  (`REPUTATION_POINTS`).
- Invites count referral sign-ups only until forum invitations exist.

## Progression (RP and levels)

- `GET /api/progression/:userId` is public. It returns `{ rp, level, maxLevel, levelStartRp,
  nextLevelRp, levelProgress, breakdown }`. `breakdown` lists RP per category. Missing,
  invalid, or suspended users return 404.
- RP rules live in `src/modules/progression/rpRules.js`. Every award is written to the
  `RpLedger` collection with a unique `(userId, eventKey)` index, so awards are idempotent.
  `User.progression.rp` is a cache recomputed from ledger sums, never incremented.
- `syncRpForUser` derives awards from existing data, so past activity is backfilled. It runs
  in the background after profile, post, review, forum, and follow writes, and from
  `getProgression` when the cache is older than 60 minutes.
- Daily login (+5) is awarded once per UTC day from authenticated requests going forward.
  It cannot be backfilled.
- Level curve: level `L` starts at `round(50000 * ((L - 1) / 49) ^ 2)` RP, so level 1 is 0
  and level 50 is 50,000. Curve shape is a design choice, not a confirmed spec.
- Forum replies count toward RP only at 20+ characters, capped at 10 per UTC day.
  Follows are capped at 5 per UTC day.
