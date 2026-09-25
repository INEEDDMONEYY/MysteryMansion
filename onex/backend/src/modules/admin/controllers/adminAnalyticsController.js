import AnalyticsEvent from "../../../models/AnalyticsEvent.js";
import User from "../../../models/User.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const ACTIVE_WINDOW_MS = 2 * 60 * 1000; // "active now" = seen in the last 2 minutes
const IDLE_WINDOW_MS = 15 * 60 * 1000; // "recently idle" = last seen 2-15 minutes ago

function categorizeActivity(pagePath = "") {
  const p = String(pagePath || "").toLowerCase();
  if (/edit|settings|\/new|create/.test(p)) return "editing";
  if (/messages/.test(p)) return "messaging";
  if (/\/posts?\/|\/user\/|\/client\/|\/provider\//.test(p)) return "viewing";
  return "browsing";
}

async function getActiveNowStats() {
  const since = new Date(Date.now() - IDLE_WINDOW_MS);
  const recentEvents = await AnalyticsEvent.find({ occurredAt: { $gte: since } })
    .select("sessionId pagePath occurredAt")
    .sort({ occurredAt: -1 })
    .lean();

  // Keep only the most recent event per session (list is sorted newest-first).
  const latestBySession = new Map();
  for (const event of recentEvents) {
    const key = String(event.sessionId || "");
    if (!key || latestBySession.has(key)) continue;
    latestBySession.set(key, event);
  }

  const now = Date.now();
  const breakdown = { browsing: 0, viewing: 0, editing: 0, messaging: 0 };
  let activeCount = 0;
  let idleCount = 0;

  for (const event of latestBySession.values()) {
    const age = now - new Date(event.occurredAt).getTime();
    if (age <= ACTIVE_WINDOW_MS) {
      activeCount += 1;
      breakdown[categorizeActivity(event.pagePath)] += 1;
    } else {
      idleCount += 1;
    }
  }

  return {
    total: activeCount,
    idle: idleCount,
    breakdown,
    windowSeconds: ACTIVE_WINDOW_MS / 1000,
  };
}

function getRangeDays(range = "7d") {
  const map = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
  return map[range] || 7;
}

function toDateKey(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function buildDateBuckets(rangeDays) {
  const out = [];
  const now = new Date();
  for (let i = rangeDays - 1; i >= 0; i -= 1) {
    const d = new Date(now.getTime() - i * DAY_MS);
    out.push({ key: toDateKey(d), date: d });
  }
  return out;
}

export const getAdminAnalytics = async (req, res) => {
  try {
    const { range = "7d", userType = "all", activityType = "all" } = req.query;
    const rangeDays = getRangeDays(range);
    const startDate = new Date(Date.now() - (rangeDays - 1) * DAY_MS);
    startDate.setHours(0, 0, 0, 0);

    const dateBuckets = buildDateBuckets(rangeDays);
    const trafficByDay = new Map(dateBuckets.map((d) => [d.key, { visits: 0, sessions: new Set() }]));
    const signupsByDay = new Map(dateBuckets.map((d) => [d.key, 0]));

    const trafficQuery = {
      eventType: "page_view",
      occurredAt: { $gte: startDate },
    };

    if (activityType === "posts") {
      trafficQuery.pagePath = { $regex: "^/posts|^/post", $options: "i" };
    } else if (activityType === "logins") {
      trafficQuery.pagePath = { $regex: "^/signin|^/signup", $options: "i" };
    } else if (activityType === "comments") {
      trafficQuery.pagePath = { $regex: "comment", $options: "i" };
    }

    const [trafficEvents, heartbeatEvents, signupUsers, activeNow] = await Promise.all([
      AnalyticsEvent.find(trafficQuery)
        .select("occurredAt sessionId")
        .lean(),
      AnalyticsEvent.find({ eventType: "heartbeat", occurredAt: { $gte: startDate } })
        .select("activeSeconds sessionId")
        .lean(),
      User.find({
        createdAt: { $gte: startDate },
        ...(userType === "admin" ? { role: "admin" } : {}),
        ...(userType === "user" ? { role: "user" } : {}),
      })
        .select("createdAt")
        .lean(),
      getActiveNowStats(),
    ]);

    trafficEvents.forEach((event) => {
      const key = toDateKey(event.occurredAt);
      const bucket = trafficByDay.get(key);
      if (!bucket) return;
      bucket.visits += 1;
      if (event.sessionId) bucket.sessions.add(String(event.sessionId));
    });

    signupUsers.forEach((user) => {
      const key = toDateKey(user.createdAt);
      if (!signupsByDay.has(key)) return;
      signupsByDay.set(key, (signupsByDay.get(key) || 0) + 1);
    });

    const sessionDurationSeconds = new Map();
    heartbeatEvents.forEach((event) => {
      if (!event.sessionId) return;
      const key = String(event.sessionId);
      const current = sessionDurationSeconds.get(key) || 0;
      sessionDurationSeconds.set(key, current + Number(event.activeSeconds || 0));
    });

    const totalDurationSeconds = [...sessionDurationSeconds.values()].reduce((sum, s) => sum + s, 0);
    const trackedSessions = sessionDurationSeconds.size;
    const averageBrowseSeconds = trackedSessions > 0 ? totalDurationSeconds / trackedSessions : 0;

    const traffic = dateBuckets.map(({ key, date }) => {
      const bucket = trafficByDay.get(key) || { visits: 0, sessions: new Set() };
      return {
        date: date.toISOString(),
        visits: bucket.visits,
        uniqueVisitors: bucket.sessions.size,
      };
    });

    const signups = dateBuckets.map(({ key, date }) => ({
      date: date.toISOString(),
      count: signupsByDay.get(key) || 0,
    }));

    return res.status(200).json({
      success: true,
      data: {
        traffic,
        signups,
        activeNow,
        session: {
          averageBrowseSeconds,
          trackedSessions,
          totalDurationSeconds,
        },
        summary: {
          totalVisits: traffic.reduce((sum, item) => sum + item.visits, 0),
          totalUniqueVisitors: new Set(trafficEvents.map((e) => String(e.sessionId || ""))).size,
          totalSignups: signups.reduce((sum, item) => sum + item.count, 0),
        },
      },
    });
  } catch (err) {
    console.error("❌ Failed to fetch admin analytics:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch analytics" });
  }
};
