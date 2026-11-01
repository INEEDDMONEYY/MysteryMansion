import crypto from 'crypto';
import express from 'express';
import SearchQuery from '../../models/SearchQuery.js';
import User from '../../models/User.js';
import { optionalAuthMiddleware } from '../../common/middleware/authMiddleware.js';
import { allowEmail } from '../../common/utils/emailRateLimiter.js';

const router = express.Router();

const WINDOW_DAYS = 30;
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_LIMIT = 10;
const HOUR_MS = 60 * 60 * 1000;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Lowercase, collapse whitespace, keep characters usernames can contain.
export const normalizeSearchTerm = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9 _.\-']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 40);

const clientIp = (req) =>
  String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || 'unknown';

const visitorKeyFor = (req, day) => {
  const identity = req.user?._id
    ? `u:${req.user._id}`
    : `a:${clientIp(req)}|${req.headers['user-agent'] || ''}`;
  // Daily salt so anonymous keys can't be correlated across days.
  return crypto.createHash('sha256').update(`${day}|${identity}`).digest('hex').slice(0, 32);
};

// Only terms that match a real, visible provider are counted, so the public
// "Popular Searches" list can't be filled with junk or abusive text.
const matchesVisibleUser = (term) =>
  User.exists({
    role: 'user',
    status: { $ne: 'suspended' },
    username: { $regex: escapeRegex(term), $options: 'i' },
  });

let popularCache = { at: 0, items: [], total: 0 };

export const invalidatePopularSearches = () => {
  popularCache = { at: 0, items: [], total: 0 };
};

// POST /api/search/log  { term }
router.post('/log', optionalAuthMiddleware, async (req, res) => {
  try {
    const term = normalizeSearchTerm(req.body?.term);
    if (term.length < 2) return res.status(204).end();

    const day = new Date().toISOString().slice(0, 10);
    const visitorKey = visitorKeyFor(req, day);

    if (!allowEmail(`search:${visitorKey}`, { limit: 30, windowMs: HOUR_MS })) {
      return res.status(204).end();
    }

    if (!(await matchesVisibleUser(term))) return res.status(204).end();

    await SearchQuery.updateOne(
      { term, visitorKey, day },
      { $setOnInsert: { term, visitorKey, day, createdAt: new Date() } },
      { upsert: true }
    );

    return res.status(204).end();
  } catch (err) {
    if (err?.code !== 11000) console.error('❌ [search/log]', err.message);
    return res.status(204).end();
  }
});

// GET /api/search/popular?limit=5
router.get('/popular', async (req, res) => {
  try {
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number.parseInt(req.query.limit, 10) || 5));

    if (Date.now() - popularCache.at > CACHE_TTL_MS) {
      const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
      const [ranked, total] = await Promise.all([
        SearchQuery.aggregate([
          { $match: { createdAt: { $gte: since } } },
          { $group: { _id: '$term', count: { $sum: 1 }, lastSearchedAt: { $max: '$createdAt' } } },
          { $sort: { count: -1, lastSearchedAt: -1 } },
          { $limit: MAX_LIMIT * 2 },
        ]),
        SearchQuery.countDocuments({ createdAt: { $gte: since } }),
      ]);

      // Re-check visibility so suspended/deleted providers drop off the list.
      const visible = [];
      for (const row of ranked) {
        if (visible.length >= MAX_LIMIT) break;
        if (await matchesVisibleUser(row._id)) visible.push(row);
      }

      popularCache = {
        at: Date.now(),
        total,
        items: visible.map((row) => ({
          term: row._id,
          count: row.count,
          percent: total ? Math.round((row.count / total) * 100) : 0,
        })),
      };
    }

    res.set('Cache-Control', 'public, max-age=300');
    return res.json({
      windowDays: WINDOW_DAYS,
      total: popularCache.total,
      items: popularCache.items.slice(0, limit),
    });
  } catch (err) {
    console.error('❌ [search/popular]', err);
    return res.status(500).json({ error: 'Failed to load popular searches' });
  }
});

export default router;
