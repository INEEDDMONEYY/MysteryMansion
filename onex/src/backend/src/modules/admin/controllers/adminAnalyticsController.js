import AnalyticsEvent from "../../../models/AnalyticsEvent.js";
import User from "../../../models/User.js";

const DAY_MS = 24 * 60 * 60 * 1000;

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

    const [trafficEvents, heartbeatEvents, signupUsers] = await Promise.all([
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
