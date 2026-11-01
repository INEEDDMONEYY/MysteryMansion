import Post from '../../models/Post.js';
import { normalizeLocation } from './locationNormalizer.js';

const CACHE_TTL_MS = 5 * 60 * 1000;

let cache = null;
let cacheBuiltAt = 0;
let pending = null;

/** Mirrors createSEOSlug in src/shared/utils/seo.js so URLs match on both sides. */
export function toSlug(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** "/locations/denver-colorado" uses this slug; state pages use the state alone. */
export function toLocationSlug({ city = '', state = '' } = {}) {
  const citySlug = toSlug(city);
  const stateSlug = toSlug(state);
  if (citySlug && stateSlug) return `${citySlug}-${stateSlug}`;
  return citySlug || stateSlug;
}

const emptyEntry = (fields) => ({
  ...fields,
  postIds: [],
  providerIds: new Set(),
  latestPostAt: null,
});

const addPost = (entry, post) => {
  entry.postIds.push(post._id);
  if (post.userId) entry.providerIds.add(String(post.userId));
  if (!entry.latestPostAt || post.createdAt > entry.latestPostAt) {
    entry.latestPostAt = post.createdAt;
  }
};

async function buildIndex() {
  // Normalising in JS (rather than matching raw fields in Mongo) keeps legacy
  // values such as "CO" or "denver, colorado" grouped with their canonical city.
  const posts = await Post.find(
    {
      $or: [
        { city: { $exists: true, $ne: '' } },
        { state: { $exists: true, $ne: '' } },
      ],
    },
    { city: 1, state: 1, country: 1, userId: 1, createdAt: 1 }
  ).lean();

  const cities = new Map();
  const states = new Map();

  for (const post of posts) {
    const { city, state, country } = normalizeLocation(post);

    if (state) {
      const stateSlug = toSlug(state);
      if (!states.has(stateSlug)) {
        states.set(stateSlug, emptyEntry({ type: 'state', city: '', state, country, slug: stateSlug }));
      }
      addPost(states.get(stateSlug), post);
    }

    if (city) {
      const slug = toLocationSlug({ city, state });
      if (!cities.has(slug)) {
        cities.set(slug, emptyEntry({ type: 'city', city, state, country, slug }));
      }
      addPost(cities.get(slug), post);
    }
  }

  return { cities, states };
}

/** Cached { cities: Map<slug, entry>, states: Map<slug, entry> } built from all posts. */
export async function getLocationIndex() {
  if (cache && Date.now() - cacheBuiltAt < CACHE_TTL_MS) return cache;

  if (!pending) {
    pending = buildIndex()
      .then((index) => {
        cache = index;
        cacheBuiltAt = Date.now();
        return index;
      })
      .finally(() => {
        pending = null;
      });
  }

  return pending;
}

/** Drop the cache so new or edited posts show up on location pages immediately. */
export function invalidateLocationIndex() {
  cache = null;
  cacheBuiltAt = 0;
}

/** State slugs win over bare city slugs ("new-york" is the state page). */
export async function resolveLocationSlug(slug) {
  const key = toSlug(slug);
  if (!key) return null;

  const { cities, states } = await getLocationIndex();
  return states.get(key) || cities.get(key) || null;
}

/** Plain-JSON summary of an index entry. */
export const summarizeEntry = (entry) => ({
  type: entry.type,
  city: entry.city,
  state: entry.state,
  country: entry.country,
  slug: entry.slug,
  postCount: entry.postIds.length,
  providerCount: entry.providerIds.size,
  latestPostAt: entry.latestPostAt,
});
