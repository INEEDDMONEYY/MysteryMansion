// Canonical city/state/country handling for posts so filtering and
// discovery match regardless of how a location was typed or detected.
import { normalizeState } from './stateNormalizer.js';

const US_STATES = new Set([
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois',
  'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts',
  'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming',
]);

const CA_PROVINCES = new Set([
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
  'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan',
  'Northwest Territories', 'Nunavut', 'Yukon',
]);

const COUNTRY_ALIASES = {
  us: 'United States',
  usa: 'United States',
  'u s': 'United States',
  'u s a': 'United States',
  'united states': 'United States',
  'united states of america': 'United States',
  america: 'United States',
  ca: 'Canada',
  can: 'Canada',
  canada: 'Canada',
  uk: 'United Kingdom',
  gb: 'United Kingdom',
  'great britain': 'United Kingdom',
  'united kingdom': 'United Kingdom',
};

const SMALL_WORDS = new Set(['of', 'and', 'the', 'de', 'la', 'del']);

const isUnknown = (value) => /^unknown\b/i.test(value);

const toTitleCase = (value) =>
  value
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (!word) return word;
      if (index > 0 && SMALL_WORDS.has(word)) return word;
      // Capitalise after hyphens/apostrophes too: "wilkes-barre", "coeur d'alene".
      return word.replace(/(^|[-'])([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());
    })
    .join(' ');

const clean = (value, max = 80) => {
  if (value === undefined || value === null) return '';
  const text = String(value)
    .replace(/[^\p{L}\p{N}\s.'-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
  return text && !isUnknown(text) ? text : '';
};

const CITY_ABBREVIATIONS = { bch: 'Beach', spgs: 'Springs', spg: 'Springs', hts: 'Heights', twp: 'Township' };

export function normalizeCity(city) {
  // "Hanover (Baltimore)" -> "Hanover", "Roebuck/Birmingham" -> "Roebuck"
  const primary = String(city ?? '')
    .replace(/\([^)]*\)/g, ' ')
    .split(/[/|&]/)[0];
  const cleaned = clean(primary).replace(/\.$/, '');
  if (!cleaned) return '';
  return toTitleCase(cleaned)
    .replace(/\b(Bch|Spgs|Spg|Hts|Twp)\b\.?/g, (word) => CITY_ABBREVIATIONS[word.replace('.', '').toLowerCase()])
    // "St Louis" / "st. louis" -> "St. Louis", "Ft Worth" -> "Ft. Worth"
    .replace(/\b(St|Ste|Ft|Mt)\.?(?=\s)/g, '$1.');
}

export function normalizeStateName(state) {
  const cleaned = clean(state).replace(/\./g, '');
  if (!cleaned) return '';
  if (/^d\s?c$/i.test(cleaned) || /^washington d\s?c$/i.test(cleaned)) return 'District of Columbia';
  const full = normalizeState(cleaned);
  return full ? toTitleCase(full) : '';
}

export function normalizeCountry(country) {
  const cleaned = clean(country).replace(/\./g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  return COUNTRY_ALIASES[cleaned.toLowerCase()] || toTitleCase(cleaned);
}

/** "Denver, CO" / "Denver, Colorado, USA" -> { city, state, country } */
export function parseLocationString(value) {
  const parts = String(value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return { city: '', state: '', country: '' };
  if (parts.length === 1) {
    const asState = normalizeStateName(parts[0]);
    return US_STATES.has(asState) || CA_PROVINCES.has(asState)
      ? { city: '', state: parts[0], country: '' }
      : { city: parts[0], state: '', country: '' };
  }
  return { city: parts[0], state: parts[1] || '', country: parts[2] || '' };
}

/** Returns a canonical { city, state, country }; empty strings for unknown parts. */
export function normalizeLocation({ city, state, country } = {}) {
  let rawCity = city;
  let rawState = state;

  // Legacy/manual input sometimes packs the state into the city field.
  if (!clean(rawState) && typeof rawCity === 'string' && rawCity.includes(',')) {
    const parsed = parseLocationString(rawCity);
    rawCity = parsed.city;
    rawState = parsed.state;
    country = country || parsed.country;
  }

  const normalizedState = normalizeStateName(rawState);
  // A recognised state/province decides the country, which also repairs
  // values typed into the wrong field (e.g. a neighbourhood as the country).
  let normalizedCountry = normalizeCountry(country);
  if (US_STATES.has(normalizedState)) normalizedCountry = 'United States';
  else if (CA_PROVINCES.has(normalizedState)) normalizedCountry = 'Canada';

  return {
    city: normalizeCity(rawCity),
    state: normalizedState,
    country: normalizedCountry,
  };
}

export const hasLocation = (loc) => Boolean(loc?.city || loc?.state || loc?.country);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Case-insensitive exact match, tolerant of legacy un-normalized values. */
export const exactMatch = (value) => new RegExp(`^\\s*${escapeRegex(value)}\\s*$`, 'i');

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';
const GEOCODE_TIMEOUT_MS = 5000;

/**
 * Resolves coordinates to a normalized city/state/country. Coordinates are
 * only used for this lookup and never stored. Returns null on failure.
 */
export async function reverseGeocode(latitude, longitude) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEOCODE_TIMEOUT_MS);

  try {
    const url = `${NOMINATIM_URL}?format=json&zoom=10&addressdetails=1&lat=${lat}&lon=${lon}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        // Nominatim's usage policy requires an identifying User-Agent.
        'User-Agent': 'MysteryMansion/1.0 (https://mysterymansion.app)',
        'Accept-Language': 'en',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const address = data?.address || {};
    const location = normalizeLocation({
      city: address.city || address.town || address.village || address.municipality || address.county || '',
      state: address.state || address.province || address.region || '',
      country: address.country_code === 'us' ? 'United States' : address.country || '',
    });
    return hasLocation(location) ? location : null;
  } catch (err) {
    console.warn('⚠️ reverseGeocode failed:', err?.name === 'AbortError' ? 'timeout' : err?.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export default {
  normalizeCity,
  normalizeStateName,
  normalizeCountry,
  normalizeLocation,
  parseLocationString,
  reverseGeocode,
  hasLocation,
  exactMatch,
};
