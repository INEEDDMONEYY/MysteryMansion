/**
 * Updates document title and key meta tags for SEO.
 */
export function setSEO(title, description, options = {}) {
  const { robots = "index, follow", canonicalPath } = options;

  if (title) document.title = title;

  const canonicalOrigin =
    import.meta.env.VITE_SITE_URL?.trim().replace(/\/+$/, '') ||
    'https://mysterymansion.app';
  const canonicalUrl =
    typeof window !== 'undefined'
      ? canonicalPath
        ? `${canonicalOrigin}${canonicalPath}`
        : `${canonicalOrigin}${window.location.pathname}${window.location.search}`
      : canonicalOrigin;

  const set = (selector, attr, value) => {
    const el = document.querySelector(selector);
    if (el && value) el.setAttribute(attr, value);
  };

  const setCanonical = (value) => {
    if (!value) return;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', value);
  };

  set('meta[name="description"]', 'content', description);
  set('meta[property="og:title"]', 'content', title);
  set('meta[property="og:description"]', 'content', description);
  set('meta[property="og:url"]', 'content', canonicalUrl);
  set('meta[name="twitter:title"]', 'content', title);
  set('meta[name="twitter:description"]', 'content', description);
  set('meta[name="twitter:url"]', 'content', canonicalUrl);
  set('meta[name="robots"]', 'content', robots);
  setCanonical(canonicalUrl);
}

/**
 * Sets location-specific SEO — e.g. "Escorts in Denver | Mystery Mansion".
 * Falls back to a generic title when no valid city/state is available.
 */
export function setLocationSEO(location) {
  const city = location?.city?.trim();
  const state = location?.state?.trim();

  const cityKnown = city && !city.toLowerCase().includes('unknown');
  const stateKnown = state && !state.toLowerCase().includes('unknown');

  const place = cityKnown ? city : stateKnown ? state : null;

  if (place) {
    setSEO(
      `Escorts in ${place} | Mystery Mansion`,
      `Find escorts in ${place} on Mystery Mansion. Browse verified escort profiles, search listings, and read client reviews near ${place}.`
    );
  } else {
    setSEO(
      'Find Escorts Near You | Mystery Mansion',
      'Browse verified escort profiles and listings on Mystery Mansion. Search by city or state to find escorts near you.'
    );
  }
}
