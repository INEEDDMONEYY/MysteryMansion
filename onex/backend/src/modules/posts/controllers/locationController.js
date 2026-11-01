import mongoose from 'mongoose';
import Post from '../../../models/Post.js';
import Review from '../../../models/Review.js';
import {
  getLocationIndex,
  resolveLocationSlug,
  summarizeEntry,
  toSlug,
} from '../../../common/utils/locationIndex.js';
import { AUTHOR_LIST_FIELDS } from './postController.js';

const SITE_URL = (process.env.SITE_URL || 'https://mysterymansion.app').replace(/\/+$/, '');
const MAX_LOCATION_POSTS = 120;
const MAX_NEARBY = 12;
const MAX_TOP_PROVIDERS = 12;

// Thin location pages stay out of search. Shared by the page response and the
// sitemap so both always agree.
const MIN_INDEX_PROVIDERS = 3;
const MIN_INDEX_REVIEWS = 3;
const MIN_INDEX_POSTS = 6;

const isIndexableLocation = ({ providerCount, postCount, reviewCount }) =>
  providerCount >= MIN_INDEX_PROVIDERS &&
  (reviewCount >= MIN_INDEX_REVIEWS || postCount >= MIN_INDEX_POSTS);

const byPopularity = (a, b) =>
  b.postCount - a.postCount || a.slug.localeCompare(b.slug);

// ---------------- GET /api/posts/locations ----------------
// Directory of every city/state that has listings, grouped by state.
export async function listLocations(req, res) {
  try {
    const { cities, states } = await getLocationIndex();

    const cityList = [...cities.values()].map(summarizeEntry).sort(byPopularity);

    const stateList = [...states.values()]
      .map((entry) => ({
        ...summarizeEntry(entry),
        cities: cityList
          .filter((city) => city.state === entry.state)
          .sort((a, b) => a.city.localeCompare(b.city)),
      }))
      .sort((a, b) => a.state.localeCompare(b.state));

    // Cities whose state couldn't be determined still deserve a page.
    const unassignedCities = cityList.filter((city) => !city.state);

    res.json({
      states: stateList,
      unassignedCities,
      popular: cityList.slice(0, 12),
      totals: {
        cities: cityList.length,
        states: stateList.length,
      },
    });
  } catch (err) {
    console.error('❌ [listLocations] Error:', err);
    res.status(500).json({ error: 'Failed to load locations' });
  }
}

// ---------------- GET /api/posts/locations/:slug ----------------
export async function getLocation(req, res) {
  try {
    const entry = await resolveLocationSlug(req.params.slug);
    if (!entry) return res.status(404).json({ error: 'Location not found' });

    const posts = await Post.find({ _id: { $in: entry.postIds } })
      .sort({ boostedUntil: -1, createdAt: -1 })
      .limit(MAX_LOCATION_POSTS)
      .populate({ path: 'userId', select: `${AUTHOR_LIST_FIELDS} status` })
      .lean();

    // Hide listings from suspended or deleted accounts.
    const visiblePosts = posts.filter(
      (post) => post.userId && typeof post.userId === 'object' && post.userId.status !== 'suspended'
    );
    visiblePosts.forEach((post) => {
      delete post.userId.status;
    });

    const providerMap = new Map();
    for (const post of visiblePosts) {
      const author = post.userId;
      const id = String(author._id);
      if (!providerMap.has(id)) {
        providerMap.set(id, {
          _id: author._id,
          username: author.username,
          profilePic: author.profilePic || '',
          gender: author.gender || '',
          badgeType: author.badgeType || '',
          postCount: 0,
          reviewCount: 0,
          averageRating: 0,
        });
      }
      providerMap.get(id).postCount += 1;
    }

    const providerIds = [...providerMap.keys()].map((id) => new mongoose.Types.ObjectId(id));

    const reviewStats = providerIds.length
      ? await Review.aggregate([
          { $match: { targetUserId: { $in: providerIds } } },
          {
            $group: {
              _id: '$targetUserId',
              count: { $sum: 1 },
              average: { $avg: '$rating' },
            },
          },
        ])
      : [];

    let reviewCount = 0;
    let ratingTotal = 0;
    for (const stat of reviewStats) {
      const provider = providerMap.get(String(stat._id));
      if (!provider) continue;
      provider.reviewCount = stat.count;
      provider.averageRating = Math.round(stat.average * 10) / 10;
      reviewCount += stat.count;
      ratingTotal += stat.average * stat.count;
    }

    const providers = [...providerMap.values()]
      .sort((a, b) => b.reviewCount - a.reviewCount || b.postCount - a.postCount)
      .slice(0, MAX_TOP_PROVIDERS);

    // Nearby: other cities in the same state (city page) or the state's cities (state page).
    const { cities, states } = await getLocationIndex();
    const nearby = entry.state
      ? [...cities.values()]
          .filter((city) => city.state === entry.state && city.slug !== entry.slug)
          .map(summarizeEntry)
          .sort(byPopularity)
          .slice(0, MAX_NEARBY)
      : [];

    const stateEntry =
      entry.type === 'city' && entry.state ? states.get(toSlug(entry.state)) : null;

    res.json({
      location: summarizeEntry(entry),
      parentState: stateEntry ? summarizeEntry(stateEntry) : null,
      indexable: isIndexableLocation({
        providerCount: providerMap.size,
        postCount: visiblePosts.length,
        reviewCount,
      }),
      posts: visiblePosts,
      providers,
      nearby,
      stats: {
        postCount: visiblePosts.length,
        providerCount: providerMap.size,
        reviewCount,
        averageRating: reviewCount ? Math.round((ratingTotal / reviewCount) * 10) / 10 : 0,
      },
    });
  } catch (err) {
    console.error('❌ [getLocation] Error:', err);
    res.status(500).json({ error: 'Failed to load location' });
  }
}

// ---------------- GET /api/posts/locations/sitemap.xml ----------------
// Lists location pages that clear the same quality bar seo.js uses for indexing.
export async function locationsSitemap(req, res) {
  try {
    const { cities, states } = await getLocationIndex();
    const entries = [...states.values(), ...cities.values()];

    const reviewCounts = new Map(
      (
        await Review.aggregate([{ $group: { _id: '$targetUserId', count: { $sum: 1 } } }])
      ).map((row) => [String(row._id), row.count])
    );

    const urls = [{ loc: `${SITE_URL}/locations`, lastmod: null }];
    for (const entry of entries) {
      let reviewCount = 0;
      for (const id of entry.providerIds) reviewCount += reviewCounts.get(id) || 0;

      if (
        !isIndexableLocation({
          providerCount: entry.providerIds.size,
          postCount: entry.postIds.length,
          reviewCount,
        })
      ) {
        continue;
      }

      urls.push({
        loc: `${SITE_URL}/locations/${entry.slug}`,
        lastmod: entry.latestPostAt ? new Date(entry.latestPostAt).toISOString().slice(0, 10) : null,
      });
    }

    const body = urls
      .map(
        ({ loc, lastmod }) =>
          `  <url>\n    <loc>${loc}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}  </url>`
      )
      .join('\n');

    res
      .type('application/xml')
      .set('Cache-Control', 'public, max-age=3600')
      .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
  } catch (err) {
    console.error('❌ [locationsSitemap] Error:', err);
    res.status(500).type('text/plain').send('Failed to build sitemap');
  }
}
