const DEFAULT_SITE_URL = "https://mysterymansion.app";
const SCHEMA_SCRIPT_ID = "mystery-mansion-page-schema";

const SITE_ORIGIN = (
  import.meta.env.VITE_SITE_URL?.trim() || DEFAULT_SITE_URL
).replace(/\/+$/, "");

const DEFAULT_ROBOTS = "index, follow";
const NOINDEX_ROBOTS = "noindex, follow";
const PRIVATE_ROBOTS = "noindex, nofollow";
const SITE_NAME = "Mystery Mansion";
const DEFAULT_OG_IMAGE_PATH = "/MMNoBg2%20(1).png";
const DEFAULT_DESCRIPTION =
  "Discover provider profiles, explore listings, read member reviews, and connect with the Mystery Mansion community.";

// ─────────────────────────────────────────────────────────────
// SAFE SEARCH
// ─────────────────────────────────────────────────────────────

// Account, auth, and admin screens are never indexed, whatever robots value
// the page asks for.
const PRIVATE_PATH_PATTERNS = [
  /^\/admin(\/|$)/,
  /^\/client(\/|$)/,
  /^\/user\/(dashboard|saved-posts|profile|profilepage|messages|activity|notifications|liked-posts|milestones|credits|membership|referrals|reports|settings|media)(\/|$)/,
  /^\/(signin|signup|forgotpass|signout|post)$/,
  /^\/reset-password(\/|$)/,
  /^\/forum\/create$/,
  /^\/referral\//,
];

// Informational pages without user-generated listings. These stay eligible
// for SafeSearch results; every other page is labelled as adult content.
const GENERAL_AUDIENCE_PATHS = new Set([
  "/become-a-client",
  "/become-a-provider",
  "/membership",
  "/promote",
  "/credits",
  "/credits/how-it-works",
  "/credits/learn-more",
  "/credit-packages",
  "/review-incentives",
  "/referrals",
  "/community-guidelines",
  "/faq",
  "/milestones",
  "/privacy-policy",
  "/terms-policy",
  "/terms-of-use",
  "/platform-updates",
  "/contact",
]);

// Neutral wording for metadata so titles, descriptions, and snippets stay
// descriptive without explicit terms.
const SAFE_SEARCH_REPLACEMENTS = [
  [/\bsex[\s-]?workers\b/gi, "providers"],
  [/\bsex[\s-]?work(er)?\b/gi, "provider"],
  [/\bescorts\b/gi, "providers"],
  [/\bescort(ing)?\b/gi, "provider"],
];

const EXPLICIT_TERMS =
  /\b(porn\w*|xxx|nsfw|nudes?|nudity|naked|sex|sexy|sexual\w*|erotic\w*|fetish\w*|bdsm|kink\w*|onlyfans|gfe|pse|bbbj|full[\s-]service|happy[\s-]ending)\b/gi;

function matchCase(source, replacement) {
  return source[0] === source[0].toUpperCase()
    ? replacement[0].toUpperCase() + replacement.slice(1)
    : replacement;
}

/**
 * True when text contains terms that should never reach search snippets.
 */
export function hasExplicitTerms(text) {
  EXPLICIT_TERMS.lastIndex = 0;
  return EXPLICIT_TERMS.test(String(text || ""));
}

/**
 * Rewrites metadata text into neutral wording for SafeSearch.
 */
export function toSafeSearchText(text) {
  if (!text) return "";

  let output = String(text);

  SAFE_SEARCH_REPLACEMENTS.forEach(([pattern, replacement]) => {
    output = output.replace(pattern, (match) =>
      matchCase(match, replacement)
    );
  });

  return output
    .replace(EXPLICIT_TERMS, "")
    .replace(/\s+([,.!?])/g, "$1")
    .replace(/,(\s*,)+/g, ",")
    .replace(/\|(\s*\|)+/g, "|")
    .replace(/[&,]\s*(?=\||$)/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,|.-]+|[\s,|-]+$/g, "")
    .trim();
}

function getCurrentPath() {
  if (typeof window === "undefined") return "/";
  return normalizePath(window.location.pathname);
}

/**
 * Private routes (dashboards, auth, admin) are always noindex.
 */
export function isPrivateSEOPath(path = getCurrentPath()) {
  const cleanPath = normalizePath(path);
  return PRIVATE_PATH_PATTERNS.some((pattern) => pattern.test(cleanPath));
}

/**
 * Pages showing listings, profiles, reviews, or forum posts are labelled
 * adult so Google SafeSearch filters them.
 */
export function isAdultContentPath(path = getCurrentPath()) {
  return !GENERAL_AUDIENCE_PATHS.has(normalizePath(path));
}

function getSiteOrigin() {
  try {
    return new URL(SITE_ORIGIN).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

function normalizePath(path = "/") {
  const cleanPath = `/${String(path).replace(/^\/+|\/+$/g, "")}`;
  return cleanPath === "/" ? "/" : cleanPath;
}

function getCanonicalUrl(canonicalPath, includeQuery = false) {
  const origin = getSiteOrigin();

  if (typeof window === "undefined") {
    return `${origin}${normalizePath(canonicalPath || "/")}`;
  }

  try {
    const url = new URL(
      canonicalPath || window.location.pathname,
      origin
    );

    url.hash = "";

    if (!includeQuery) {
      url.search = "";
    }

    return url.toString();
  } catch {
    return `${origin}${normalizePath(window.location.pathname)}`;
  }
}

function setMetaTag(selector, attribute, value, createAttributes = null) {
  if (typeof document === "undefined") return;

  let element = document.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");

    Object.entries(createAttributes || {}).forEach(([key, val]) => {
      element.setAttribute(key, val);
    });

    document.head.appendChild(element);
  }

  element.setAttribute(attribute, value ?? "");
}

function setCanonical(url) {
  if (typeof document === "undefined") return;

  let link = document.querySelector('link[rel="canonical"]');

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }

  link.setAttribute("href", url);
}

export function setStructuredData(schema) {
  if (typeof document === "undefined") return;

  let script = document.getElementById(SCHEMA_SCRIPT_ID);

  if (!schema) {
    script?.remove();
    return;
  }

  if (!script) {
    script = document.createElement("script");
    script.id = SCHEMA_SCRIPT_ID;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(schema);
}

function createPageSchema({
  title,
  description,
  url,
  type = "WebPage",
  breadcrumb,
}) {
  const graph = [
    {
      "@type": type,
      "@id": `${url}#webpage`,
      name: toSafeSearchText(title),
      description: toSafeSearchText(description),
      url,
      ...(breadcrumb && {
        breadcrumb: {
          "@id": `${url}#breadcrumb`,
        },
      }),
    },
  ];

  if (breadcrumb?.length) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: breadcrumb.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: toSafeSearchText(item.name),
        item: item.url,
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

/**
 * General SEO metadata.
 *
 * Existing usage remains supported:
 * setSEO(title, description, { robots, canonicalPath })
 *
 * Additional options:
 * canonicalPath
 * includeQuery
 * robots
 * ogImage
 * ogType
 * schema
 * adultContent  - overrides the path-based SafeSearch rating
 * safeSearch    - set false to skip neutral-wording cleanup
 */
export function setSEO(rawTitle, rawDescription, options = {}) {
  if (typeof document === "undefined") return;

  const {
    robots: requestedRobots = DEFAULT_ROBOTS,
    canonicalPath,
    includeQuery = false,
    ogImage,
    ogType = "website",
    schema = null,
    adultContent,
    safeSearch = true,
  } = options;

  const currentPath = getCurrentPath();

  const title = safeSearch
    ? toSafeSearchText(rawTitle)
    : rawTitle;

  const description =
    (safeSearch
      ? toSafeSearchText(rawDescription)
      : rawDescription) || DEFAULT_DESCRIPTION;

  const robots = isPrivateSEOPath(currentPath)
    ? PRIVATE_ROBOTS
    : requestedRobots;

  const isAdult =
    typeof adultContent === "boolean"
      ? adultContent
      : isAdultContentPath(currentPath);

  if (title) {
    document.title = title;
  }

  const canonicalUrl = getCanonicalUrl(
    canonicalPath,
    includeQuery
  );

  // Google SafeSearch label for pages with adult listings.
  if (isAdult) {
    setMetaTag(
      'meta[name="rating"]',
      "content",
      "adult",
      { name: "rating" }
    );
  } else {
    document.querySelector('meta[name="rating"]')?.remove();
  }

  setMetaTag(
    'meta[name="description"]',
    "content",
    description || "",
    { name: "description" }
  );

  setMetaTag(
    'meta[name="robots"]',
    "content",
    robots,
    { name: "robots" }
  );

  setMetaTag(
    'meta[property="og:title"]',
    "content",
    title || "",
    { property: "og:title" }
  );

  setMetaTag(
    'meta[property="og:description"]',
    "content",
    description || "",
    { property: "og:description" }
  );

  setMetaTag(
    'meta[property="og:url"]',
    "content",
    canonicalUrl,
    { property: "og:url" }
  );

  setMetaTag(
    'meta[property="og:type"]',
    "content",
    ogType,
    { property: "og:type" }
  );

  setMetaTag(
    'meta[name="twitter:card"]',
    "content",
    "summary_large_image",
    { name: "twitter:card" }
  );

  setMetaTag(
    'meta[name="twitter:title"]',
    "content",
    title || "",
    { name: "twitter:title" }
  );

  setMetaTag(
    'meta[name="twitter:description"]',
    "content",
    description || "",
    { name: "twitter:description" }
  );

  setMetaTag(
    'meta[name="twitter:url"]',
    "content",
    canonicalUrl,
    { name: "twitter:url" }
  );

  // Fall back to the site image so a previous page's image doesn't linger.
  const image =
    ogImage || `${getSiteOrigin()}${DEFAULT_OG_IMAGE_PATH}`;

  setMetaTag(
    'meta[property="og:image"]',
    "content",
    image,
    { property: "og:image" }
  );

  setMetaTag(
    'meta[name="twitter:image"]',
    "content",
    image,
    { name: "twitter:image" }
  );

  setMetaTag(
    'meta[property="og:site_name"]',
    "content",
    SITE_NAME,
    { property: "og:site_name" }
  );

  setCanonical(canonicalUrl);
  setStructuredData(schema);
}

/**
 * Converts names and locations into URL-friendly slugs.
 */
export function createSEOSlug(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Location URL:
 * /locations/denver
 * /locations/denver-colorado
 */
export function buildLocationPath(city, state = "") {
  if (typeof city === "object" && city !== null) {
    state = city.state || "";
    city = city.city || "";
  }

  const citySlug = createSEOSlug(city);
  const stateSlug = createSEOSlug(state);

  if (!citySlug) return "/locations";

  const slug = stateSlug
    ? `${citySlug}-${stateSlug}`
    : citySlug;

  return `/locations/${slug}`;
}

/**
 * Provider URL (matches the /profile/:username route):
 * /profile/provider-name
 */
export function buildProviderProfilePath(provider) {
  const username =
    typeof provider === "string"
      ? provider
      : provider?.username || "";

  if (username) {
    return `/profile/${encodeURIComponent(String(username).trim())}`;
  }

  const id = provider?._id || provider?.id;

  return id ? `/user/${id}` : "/";
}

/**
 * Determines whether a location page contains enough useful content
 * to be considered for indexing.
 *
 * Default threshold:
 * - At least 3 real provider profiles
 * - At least one meaningful unique content signal:
 *   unique introduction, local reviews, or explicitly verified content.
 */
export function isIndexableLocationPage({
  providerCount = 0,
  reviewCount = 0,
  uniqueIntroduction = "",
  hasUniqueContent = false,
  minimumProviders = 3,
} = {}) {
  const hasInventory =
    Number(providerCount) >= minimumProviders;

  const hasUniqueIntroduction =
    String(uniqueIntroduction).trim().length >= 120;

  const hasReviews =
    Number(reviewCount) >= 3;

  return (
    hasInventory &&
    (
      hasUniqueIntroduction ||
      hasReviews ||
      hasUniqueContent === true
    )
  );
}

/**
 * Location SEO.
 *
 * Supports the existing call:
 * setLocationSEO({ city, state })
 *
 * Additional options:
 * providerCount
 * reviewCount
 * uniqueIntroduction
 * hasUniqueContent
 * providers
 * indexable
 * canonicalPath
 * parentState  { name, path } — adds the state page to the breadcrumb
 */
export function setLocationSEO(location, options = {}) {
  const city =
    typeof location === "string"
      ? location.trim()
      : location?.city?.trim();

  const state =
    typeof location === "object"
      ? location?.state?.trim()
      : "";

  const cityKnown =
    city &&
    !city.toLowerCase().includes("unknown");

  const stateKnown =
    state &&
    !state.toLowerCase().includes("unknown");

  const place = cityKnown
    ? [city, stateKnown ? state : ""]
        .filter(Boolean)
        .join(", ")
    : stateKnown
      ? state
      : null;

  if (!place) {
    setSEO(
      "Explore Providers by Location | Mystery Mansion",
      "Explore provider profiles and reviews on Mystery Mansion. Browse available locations and discover local profiles.",
      {
        robots: NOINDEX_ROBOTS,
        canonicalPath: options.canonicalPath || "/locations",
      }
    );

    return;
  }

  const {
    providerCount = 0,
    reviewCount = 0,
    uniqueIntroduction = "",
    hasUniqueContent = false,
    providers = [],
    indexable,
    canonicalPath,
    parentState,
  } = options;

  const qualityCheck = isIndexableLocationPage({
    providerCount,
    reviewCount,
    uniqueIntroduction,
    hasUniqueContent,
  });

  const shouldIndex =
    typeof indexable === "boolean"
      ? indexable
      : qualityCheck;

  const pageTitle =
    `Provider Reviews in ${place} | Mystery Mansion`;

  const pageDescription =
    `Explore provider profiles in ${place} on Mystery Mansion. Browse local profiles and read member reviews to learn more about providers in your area.`;

  const path =
    canonicalPath ||
    buildLocationPath(cityKnown ? city : state, cityKnown && stateKnown ? state : "");

  let schema = null;

  if (shouldIndex) {
    const breadcrumb = [
      {
        name: "Home",
        url: getSiteOrigin(),
      },
      ...(path.startsWith("/locations/")
        ? [
            {
              name: "Locations",
              url: `${getSiteOrigin()}/locations`,
            },
          ]
        : []),
      ...(parentState?.name && parentState?.path
        ? [
            {
              name: parentState.name,
              url: `${getSiteOrigin()}${parentState.path}`,
            },
          ]
        : []),
      {
        name: place,
        url: `${getSiteOrigin()}${path}`,
      },
    ];

    const items = providers
      .filter((provider) => provider?.username)
      .map((provider, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Person",
          name: provider.username || provider.name,
          url: `${getSiteOrigin()}${buildProviderProfilePath(provider)}`,
        },
      }));

    schema = createPageSchema({
      title: pageTitle,
      description: pageDescription,
      url: getCanonicalUrl(path),
      type: "CollectionPage",
      breadcrumb,
    });

    if (items.length) {
      schema["@graph"].push({
        "@type": "ItemList",
        name: `Providers in ${place}`,
        numberOfItems: items.length,
        itemListElement: items,
      });
    }
  }

  setSEO(pageTitle, pageDescription, {
    canonicalPath: path,
    robots: shouldIndex
      ? DEFAULT_ROBOTS
      : NOINDEX_ROBOTS,
    schema,
  });
}

/**
 * Determines whether a provider profile has enough useful content
 * to be considered for indexing.
 *
 * Requires at least two meaningful profile content signals.
 */
export function isIndexableProviderProfile(provider) {
  if (!provider) return false;

  const visibility = String(
    provider.visibility || provider.status || ""
  ).toLowerCase();

  const isUnavailable = [
    "private",
    "inactive",
    "suspended",
    "deleted",
    "unpublished",
  ].includes(visibility);

  if (
    provider.isPublic === false ||
    provider.public === false ||
    isUnavailable ||
    provider.accountType === "client" ||
    provider.role === "admin" ||
    provider.isSuspended === true ||
    provider.suspended === true
  ) {
    return false;
  }

  const contentSignals = [
    String(provider.bio || "").trim().length >= 80,
    Boolean(provider.profilePic),
    Boolean(provider.location?.city || provider.location),
    Array.isArray(provider.activities) &&
      provider.activities.length > 0,
    Number(provider.reviewCount || 0) > 0,
    Array.isArray(provider.services) &&
      provider.services.length > 0,
    Array.isArray(provider.media) &&
      provider.media.length > 0,
  ];

  return contentSignals.filter(Boolean).length >= 2;
}

/**
 * Provider profile SEO.
 *
 * Example:
 * setProviderProfileSEO(provider)
 *
 * Additional options:
 * indexable
 * canonicalPath
 * reviews
 */
export function setProviderProfileSEO(provider, options = {}) {
  const name =
    provider?.displayName ||
    provider?.username ||
    provider?.name ||
    "Provider";

  const location =
    typeof provider?.location === "string"
      ? provider.location
      : [
          provider?.location?.city,
          provider?.location?.state,
        ]
          .filter(Boolean)
          .join(", ");

  const reviewCount = Number(provider?.reviewCount || 0);

  const shouldIndex =
    typeof options.indexable === "boolean"
      ? options.indexable
      : isIndexableProviderProfile(provider);

  const path =
    options.canonicalPath ||
    buildProviderProfilePath(provider);

  const title = location
    ? `${name} Reviews in ${location} | Mystery Mansion`
    : `${name} Reviews & Profile | Mystery Mansion`;

  // Bios are user-written; leave them out of snippets when they're explicit.
  const safeBio =
    provider?.bio && !hasExplicitTerms(provider.bio)
      ? String(provider.bio).trim()
      : "";

  const descriptionParts = [
    `View ${name}'s provider profile on Mystery Mansion.`,
    location ? `Located in ${location}.` : "",
    reviewCount > 0
      ? `Read ${reviewCount} member review${reviewCount === 1 ? "" : "s"}.`
      : "",
    safeBio ? safeBio.slice(0, 130) : "",
  ].filter(Boolean);

  const description = descriptionParts.join(" ");

  let schema = null;

  if (shouldIndex) {
    const canonicalUrl = getCanonicalUrl(path);

    const person = {
      "@type": "Person",
      name,
      url: canonicalUrl,
    };

    if (provider?.profilePic) {
      person.image = provider.profilePic;
    }

    if (safeBio) {
      person.description = safeBio;
    }

    if (location) {
      person.address = {
        "@type": "PostalAddress",
        addressLocality:
          provider?.location?.city || location,
        ...(provider?.location?.state && {
          addressRegion: provider.location.state,
        }),
      };
    }

    schema = createPageSchema({
      title,
      description,
      url: canonicalUrl,
      type: "ProfilePage",
      breadcrumb: [
        {
          name: "Home",
          url: getSiteOrigin(),
        },
        {
          name,
          url: canonicalUrl,
        },
      ],
    });

    schema["@graph"].push({
      "@type": "Person",
      "@id": `${canonicalUrl}#person`,
      ...person,
    });

    schema["@graph"][0].mainEntity = {
      "@id": `${canonicalUrl}#person`,
    };
  }

  setSEO(title, description, {
    canonicalPath: path,
    robots: shouldIndex
      ? DEFAULT_ROBOTS
      : NOINDEX_ROBOTS,
    ogImage: provider?.profilePic || undefined,
    ogType: "profile",
    schema,
  });
}

/**
 * Post detail SEO.
 *
 * Listings are indexable when they have a real title and enough text.
 * Profile posts duplicate the author's profile, so they point their
 * canonical there and stay out of the index.
 */
export function setPostSEO(post, options = {}) {
  if (!post) return;

  const author = post.userId && typeof post.userId === "object"
    ? post.userId
    : {};

  const authorName = author.username || "";
  const place = [post.city, post.state].filter(Boolean).join(", ");
  const postPath = `/posts/${post._id || post.id || ""}`;
  const isProfilePost = post.postType === "profile";

  const baseTitle = isProfilePost
    ? `${authorName || "Provider"} Profile`
    : post.title || (authorName ? `Listing by ${authorName}` : "Listing");

  const title = place
    ? `${baseTitle} in ${place} | Mystery Mansion`
    : `${baseTitle} | Mystery Mansion`;

  const body = String(post.description || "").trim();
  const safeBody = hasExplicitTerms(body) ? "" : body.slice(0, 140);

  const description = [
    authorName
      ? `View this listing by ${authorName} on Mystery Mansion.`
      : "View this listing on Mystery Mansion.",
    place ? `Located in ${place}.` : "",
    safeBody,
  ]
    .filter(Boolean)
    .join(" ");

  const qualityCheck =
    !isProfilePost &&
    toSafeSearchText(post.title).length >= 3 &&
    body.length >= 40;

  const shouldIndex =
    typeof options.indexable === "boolean"
      ? options.indexable
      : qualityCheck;

  const canonicalPath =
    options.canonicalPath ||
    (isProfilePost && authorName
      ? buildProviderProfilePath(author)
      : postPath);

  const canonicalUrl = getCanonicalUrl(canonicalPath);

  setSEO(title, description, {
    canonicalPath,
    robots: shouldIndex ? DEFAULT_ROBOTS : NOINDEX_ROBOTS,
    ogType: "article",
    ogImage: options.image || author.profilePic || undefined,
    schema: shouldIndex
      ? createPageSchema({
          title,
          description,
          url: canonicalUrl,
          type: "WebPage",
          breadcrumb: [
            { name: "Home", url: getSiteOrigin() },
            { name: baseTitle, url: canonicalUrl },
          ],
        })
      : null,
  });
}

/**
 * Dynamic search pages should not be indexed by default.
 *
 * A curated search landing page can be indexed only when explicitly
 * enabled and it contains sufficient results and original content.
 */
export function setSearchSEO({
  query = "",
  resultCount = 0,
  uniqueContent = "",
  indexable = false,
  canonicalPath = "/search",
  minimumResults = 5,
} = {}) {
  const hasUsefulContent =
    String(uniqueContent).trim().length >= 120;

  const shouldIndex =
    indexable === true &&
    Number(resultCount) >= minimumResults &&
    hasUsefulContent;

  const cleanQuery = String(query).trim();

  const title = shouldIndex && cleanQuery
    ? `${cleanQuery} | Mystery Mansion`
    : "Search Mystery Mansion";

  const description = shouldIndex
    ? String(uniqueContent).trim().slice(0, 250)
    : "Search Mystery Mansion for provider profiles, reviews, and listings.";

  setSEO(title, description, {
    canonicalPath,
    robots: shouldIndex
      ? DEFAULT_ROBOTS
      : NOINDEX_ROBOTS,
  });
}

// ─────────────────────────────────────────────────────────────
// PUBLIC PAGE SEO REGISTRY
// ─────────────────────────────────────────────────────────────

export const PUBLIC_PAGE_SEO = {
  "/": {
    title: "Mystery Mansion | Provider Profiles, Reviews & Community",
    description:
      "Discover provider profiles, explore listings, read member reviews, and connect with the Mystery Mansion community.",
    label: "Home",
    indexable: true,
  },

  "/locations": {
    title: "Browse Providers by Location | Mystery Mansion",
    description:
      "Browse Mystery Mansion provider profiles and listings by city and state. Find local profiles and member reviews near you.",
    label: "Locations",
    indexable: true,
  },

  // GET STARTED

  "/become-a-client": {
    title: "Become a Client | Mystery Mansion",
    description:
      "Join Mystery Mansion as a client. Discover provider profiles, explore listings, connect with providers, and participate in the community.",
    label: "Become a Client",
    indexable: true,
  },

  "/become-a-provider": {
    title: "Become a Provider | Mystery Mansion",
    description:
      "Create your provider presence on Mystery Mansion. Build your profile, publish listings, connect with clients, and grow your visibility.",
    label: "Become a Provider",
    indexable: true,
  },

  "/membership": {
    title: "Mystery Mansion Membership | Membership Benefits",
    description:
      "Explore Mystery Mansion membership options, account benefits, and membership features.",
    label: "Membership",
    indexable: true,
  },

  "/promote": {
    title: "Promote Your Account | Mystery Mansion",
    description:
      "Explore account promotion options on Mystery Mansion and discover ways to increase your profile visibility.",
    label: "Promote Account",
    indexable: true,
  },

  // CREDITS AND REWARDS

  "/credits": {
    title: "Mystery Mansion Credits | How Credits Work",
    description:
      "Learn how Mystery Mansion credits work, how they are used for messaging, and how to manage your account credit balance.",
    label: "Credits",
    indexable: true,
  },

  "/credit-packages": {
    title: "Credit Packages | Mystery Mansion",
    description:
      "Explore Mystery Mansion credit packages and learn how to request additional account credits.",
    label: "Credit Packages",
    indexable: true,
  },

  "/review-incentives": {
    title: "Review Incentives | Mystery Mansion",
    description:
      "Discover the Mystery Mansion review incentive program and learn how eligible members can participate.",
    label: "Review Incentives",
    indexable: true,
  },

  "/referrals": {
    title: "Referral Program | Mystery Mansion",
    description:
      "Explore the Mystery Mansion referral program and learn how to participate in platform referrals.",
    label: "Referrals",
    indexable: true,
  },

  // COMMUNITY

  "/community-guidelines": {
    title: "Community Guidelines | Mystery Mansion",
    description:
      "Read the Mystery Mansion community guidelines, member expectations, participation standards, and platform conduct rules.",
    label: "Community Guidelines",
    indexable: true,
  },

  "/forum": {
    title: "Community Forums | Mystery Mansion",
    description:
      "Explore Mystery Mansion community forums, participate in discussions, share experiences, and connect with other members.",
    label: "Forums",
    indexable: false,
  },

  "/faq": {
    title: "Frequently Asked Questions | Mystery Mansion",
    description:
      "Find answers to common Mystery Mansion questions about accounts, provider profiles, memberships, credits, messaging, and platform features.",
    label: "FAQ",
    indexable: true,
  },

  "/milestones": {
    title: "Member Milestones & Achievements | Mystery Mansion",
    description:
      "Discover Mystery Mansion milestones, account progression, achievements, and platform participation features.",
    label: "Milestones",
    indexable: true,
  },

  // LEGAL

  "/privacy-policy": {
    title: "Privacy Policy | Mystery Mansion",
    description:
      "Review the Mystery Mansion privacy policy to understand how personal information is collected, used, and handled.",
    label: "Privacy Policy",
    indexable: true,
  },

  "/terms-policy": {
    title: "Terms of Service | Mystery Mansion",
    description:
      "Read the Mystery Mansion terms of service, platform conditions, account responsibilities, and rules for using the platform.",
    label: "Terms of Service",
    indexable: true,
  },

  // UPDATES AND SUPPORT

  "/platform-updates": {
    title: "Platform Updates & Release Notes | Mystery Mansion",
    description:
      "Explore Mystery Mansion platform updates, release notes, new features, improvements, and technical changes.",
    label: "Platform Updates",
    indexable: false,
  },

  "/contact": {
    title: "Contact & Support | Mystery Mansion",
    description:
      "Contact Mystery Mansion for account assistance, platform questions, technical support, and general inquiries.",
    label: "Contact Support",
    indexable: true,
  },
};

/**
 * Normalizes a public page path before looking it up.
 *
 * Handles:
 * /membership
 * /membership/
 * /membership?source=footer
 */
// Duplicate routes that share a page with a registry entry.
const PUBLIC_PAGE_ALIASES = {
  "/home": "/",
  "/terms-of-use": "/terms-policy",
};

function normalizePublicPagePath(path) {
  if (!path) return "/";

  let cleanPath;

  try {
    const parsed = new URL(path, getSiteOrigin());
    cleanPath = normalizePath(parsed.pathname);
  } catch {
    cleanPath = normalizePath(String(path).split("?")[0].split("#")[0]);
  }

  return PUBLIC_PAGE_ALIASES[cleanPath] || cleanPath;
}

/**
 * Applies centralized SEO metadata to a public footer page.
 *
 * Usage:
 * setPublicPageSEO("/membership");
 *
 * Optional overrides:
 * title
 * description
 * indexable
 * robots
 * canonicalPath
 * ogImage
 * schema
 *
 * Returns false when the path is not registered.
 */
export function setPublicPageSEO(path, options = {}) {
  if (typeof document === "undefined") return false;

  const pagePath =
    path ||
    (typeof window !== "undefined"
      ? window.location.pathname
      : "/");

  const normalizedPath =
    normalizePublicPagePath(pagePath);

  const page = PUBLIC_PAGE_SEO[normalizedPath];

  if (!page) return false;

  const title = options.title || page.title;
  const description =
    options.description || page.description;

  const canonicalPath =
    options.canonicalPath || normalizedPath;

  const shouldIndex =
    typeof options.indexable === "boolean"
      ? options.indexable
      : page.indexable;

  const canonicalUrl =
    getCanonicalUrl(canonicalPath);

  const breadcrumb = [
    {
      name: "Home",
      url: getSiteOrigin(),
    },
  ];

  if (normalizedPath !== "/") {
    breadcrumb.push({
      name: page.label,
      url: canonicalUrl,
    });
  }

  const schema =
    options.schema ||
    createPageSchema({
      title,
      description,
      url: canonicalUrl,
      type: "WebPage",
      breadcrumb,
    });

  setSEO(title, description, {
    canonicalPath,
    robots:
      options.robots ||
      (shouldIndex
        ? DEFAULT_ROBOTS
        : NOINDEX_ROBOTS),
    ogType: "website",
    ogImage: options.ogImage,
    schema,
  });

  return true;
}
// ─────────────────────────────────────────────────────────────
// ROUTE-LEVEL SEO
// ─────────────────────────────────────────────────────────────

// Public pages that build their own metadata from loaded data.
const DYNAMIC_PUBLIC_PATTERNS = [
  /^\/category\/[^/]+$/,
  /^\/locations\/[^/]+$/,
  /^\/posts\/[^/]+$/,
  /^\/user\/[^/]+(\/[^/]+)?$/,
  /^\/profile\/[^/]+(\/[^/]+)?$/,
  /^\/reviews\/[^/]+$/,
  /^\/forum\/.+$/,
  /^\/credits\/.+$/,
];

const SEGMENT_LABELS = {
  admin: "Admin",
  client: "Client",
  user: "Account",
  signin: "Sign In",
  signup: "Sign Up",
  forgotpass: "Forgot Password",
  signout: "Sign Out",
  post: "Create a Post",
  profilepage: "My Profile",
};

function labelFromPath(path) {
  const segments = path.split("/").filter(Boolean);
  const last = segments[segments.length - 1] || "";

  if (SEGMENT_LABELS[last]) return SEGMENT_LABELS[last];

  return last
    .split("-")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Applies baseline metadata whenever the route changes.
 *
 * Runs before page effects, so pages that call setSEO / setPublicPageSEO /
 * setProviderProfileSEO / setPostSEO still win. Registered public pages get
 * their registry entry; private and unknown routes get a noindex fallback so
 * a previous page's metadata never lingers.
 */
export function applyRouteSEO(pathname) {
  if (typeof document === "undefined") return;

  const path = normalizePublicPagePath(pathname);

  if (setPublicPageSEO(path)) return;

  const isPrivate = isPrivateSEOPath(path);

  // Profiles, posts, categories, etc. replace this neutral baseline once
  // their data loads.
  if (
    !isPrivate &&
    DYNAMIC_PUBLIC_PATTERNS.some((pattern) => pattern.test(path))
  ) {
    setSEO(SITE_NAME, DEFAULT_DESCRIPTION, { canonicalPath: path });
    return;
  }

  const label = labelFromPath(path);

  setSEO(
    label ? `${label} | ${SITE_NAME}` : SITE_NAME,
    DEFAULT_DESCRIPTION,
    {
      canonicalPath: path,
      robots: isPrivate ? PRIVATE_ROBOTS : NOINDEX_ROBOTS,
    }
  );
}
