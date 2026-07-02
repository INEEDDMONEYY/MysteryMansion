/**
 * profileViewNotificationJob.js
 * 
 * Runs every hour. Once per day (at the first run after 8am UTC) it
 * aggregates yesterday's profile page-view analytics and sends each
 * provider/user a single "Your profile was visited X times today" notification.
 *
 * Uses the same setInterval pattern as promoExpiryReminderJob.js.
 */

import AnalyticsEvent from '../../models/AnalyticsEvent.js';
import Notification from '../../models/Notification.js';
import { createNotification } from '../../modules/notifications/notificationController.js';

// Interval: check every hour
const JOB_INTERVAL_MS = 60 * 60 * 1000;

// Profile page path pattern: /user/<ObjectId>
const PROFILE_PATH_RE = /^\/user\/([a-f0-9]{24})(?:\/.*)?$/i;

async function processProfileViewNotifications() {
  const now = new Date();

  // Only run between 08:00 and 09:00 UTC to send "yesterday's" counts once per day
  const utcHour = now.getUTCHours();
  if (utcHour < 8 || utcHour >= 9) return;

  // Yesterday's window
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - 1);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  // Aggregate page_view events for profile paths
  const views = await AnalyticsEvent.find({
    eventType: 'page_view',
    pagePath:  { $regex: '^/user/' },
    occurredAt: { $gte: start, $lt: end },
  })
    .select('pagePath sessionId')
    .lean();

  // Build map: userId → Set<sessionId> (unique sessions = unique visitors)
  const visitMap = {};
  for (const v of views) {
    const match = v.pagePath.match(PROFILE_PATH_RE);
    if (!match) continue;
    const uid = match[1];
    if (!visitMap[uid]) visitMap[uid] = new Set();
    visitMap[uid].add(v.sessionId || 'unknown');
  }

  const dateLabel = start.toISOString().split('T')[0];

  for (const [userId, sessions] of Object.entries(visitMap)) {
    const count = sessions.size;
    if (count === 0) continue;

    // Dedup: skip if we already sent a profile_visited notification for this date
    const existing = await Notification.findOne({
      audience: 'user',
      type: 'profile_visited',
      userId,
      'meta.date': dateLabel,
    }).lean();
    if (existing) continue;

    await createNotification({
      audience: 'user',
      type: 'profile_visited',
      title: 'Profile visits',
      message: `Your profile was visited ${count} time${count !== 1 ? 's' : ''} today.`,
      userId,
      meta: { count, date: dateLabel },
    });
  }
}

export function startProfileViewNotificationJob() {
  if (process.env.NODE_ENV === 'test') return () => {};

  let running = false;

  const run = async () => {
    if (running) return;
    running = true;
    try {
      await processProfileViewNotifications();
    } catch (err) {
      console.error('❌ Profile view notification job failed:', err);
    } finally {
      running = false;
    }
  };

  run();
  const id = setInterval(run, JOB_INTERVAL_MS);
  return () => clearInterval(id);
}
