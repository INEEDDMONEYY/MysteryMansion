/**
 * Vercel Edge Middleware: per-page link previews for crawlers.
 *
 * Link-preview bots (Facebook, X, Slack, Discord, ...) don't run JavaScript, so
 * they only see the static index.html head. This swaps in the title, description,
 * URL and image for the requested page. Regular visitors pass through untouched.
 */
import { PUBLIC_PAGE_SEO, isPrivateSEOPath, toSafeSearchText, hasExplicitTerms } from './src/shared/utils/seo.js';

const SITE_ORIGIN = 'https://topescortnetwork.com';
const SITE_NAME = 'TopEscortNetwork';
const API_ORIGIN = 'https://uninterested.onrender.com';
const PREVIEW_IMAGE = `${SITE_ORIGIN}/ten-logo.png`;
const PREVIEW_IMAGE_WIDTH = 624;
const PREVIEW_IMAGE_HEIGHT = 236;
const DEFAULT_DESCRIPTION =
  'Discover escort profiles, explore listings, read member reviews, and connect with the TopEscortNetwork community.';
const API_TIMEOUT_MS = 4000;

const CRAWLER_PATTERN =
  /facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|whatsapp|pinterest|skypeuripreview|embedly|redditbot|applebot|googlebot|bingbot|vkshare|iframely/i;

export const config = {
  matcher: ['/((?!api/|assets/|.*\\..*).*)'],
};

const clip = (text, max) => {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
};

async function fetchJson(url) {
  try {
    const res = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function resolvePageMeta(pathname) {
  const staticPage = PUBLIC_PAGE_SEO[pathname];
  if (staticPage) {
    return { title: staticPage.title, description: staticPage.description };
  }

  const postMatch = pathname.match(/^\/posts\/([^/]+)$/);
  if (postMatch) {
    const post = await fetchJson(`${API_ORIGIN}/api/posts/${encodeURIComponent(postMatch[1])}`);
    if (!post) return null;
    const author = post.userId && typeof post.userId === 'object' ? post.userId : {};
    const place = [post.city, post.state].filter(Boolean).join(', ');
    const isProfilePost = post.postType === 'profile';
    const baseTitle = isProfilePost
      ? `${author.username || 'Escort'} Profile`
      : post.title || (author.username ? `Listing by ${author.username}` : 'Listing');
    const title = place ? `${baseTitle} in ${place}` : baseTitle;
    const description = clip(post.description, 160) || `View this listing on ${SITE_NAME}.`;
    return { title: `${title} | ${SITE_NAME}`, description };
  }

  const profileMatch = pathname.match(/^\/profile\/([^/]+)/);
  const userIdMatch = pathname.match(/^\/user\/([^/]+)/);
  if (profileMatch || userIdMatch) {
    const user = profileMatch
      ? await fetchJson(`${API_ORIGIN}/api/users/${encodeURIComponent(profileMatch[1])}`)
      : await fetchJson(`${API_ORIGIN}/api/users/id/${encodeURIComponent(userIdMatch[1])}`);
    if (!user) return null;
    const name = user.displayName || user.username || 'Escort';
    const location = typeof user.location === 'string' ? user.location : '';
    const title = location
      ? `${name} Reviews in ${location} | ${SITE_NAME}`
      : `${name} Reviews & Profile | ${SITE_NAME}`;
    const description = clip(
      [
        `View ${name}'s escort profile on ${SITE_NAME}.`,
        location ? `Located in ${location}.` : '',
        user.bio && !hasExplicitTerms(user.bio) ? user.bio : '',
      ]
        .filter(Boolean)
        .join(' '),
      160
    );
    const avatar = typeof user.profilePic === 'string' && /^https:\/\//.test(user.profilePic) ? user.profilePic : '';
    return { title, description, image: avatar };
  }

  return null;
}

// Keeps the homepage defaults when nothing more specific is known.
const FALLBACK_META = {
  title: `${SITE_NAME} | Escort Profiles, Reviews & Community`,
  description: DEFAULT_DESCRIPTION,
};

const escapeAttr = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

function buildHead({ title, description, url, image }) {
  const safeTitle = escapeAttr(title);
  const safeDescription = escapeAttr(description);
  const safeUrl = escapeAttr(url);
  // Profile avatars are square, so they use the small card and skip the logo's fixed size.
  const safeImage = escapeAttr(image || PREVIEW_IMAGE);
  const imageSize = image
    ? ''
    : `
    <meta property="og:image:width" content="${PREVIEW_IMAGE_WIDTH}" />
    <meta property="og:image:height" content="${PREVIEW_IMAGE_HEIGHT}" />`;
  return `
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />
    <link rel="canonical" href="${safeUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:url" content="${safeUrl}" />
    <meta property="og:image" content="${safeImage}" />${imageSize}
    <meta name="twitter:card" content="${image ? 'summary' : 'summary_large_image'}" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeImage}" />
`;
}

// Replaces the homepage title, description, canonical and social tags in index.html.
function injectHead(html, head) {
  const stripped = html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="description"[\s\S]*?>/i, '')
    .replace(/<link\s+rel="canonical"[^>]*>/i, '')
    .replace(/<meta\s+(?:property|name)="(?:og|twitter):[^"]*"[\s\S]*?>/gi, '');
  return stripped.replace('</head>', `${head}  </head>`);
}

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  if (!CRAWLER_PATTERN.test(userAgent)) return undefined;

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  if (isPrivateSEOPath(pathname)) return undefined;

  const resolved = (await resolvePageMeta(pathname)) || FALLBACK_META;
  const title = toSafeSearchText(resolved.title);
  const description = toSafeSearchText(resolved.description) || DEFAULT_DESCRIPTION;

  const indexResponse = await fetch(new URL('/index.html', request.url));
  if (!indexResponse.ok) return undefined;
  const html = await indexResponse.text();

  const head = buildHead({
    title,
    description,
    url: `${SITE_ORIGIN}${pathname}`,
    image: resolved.image,
  });

  return new Response(injectHead(html, head), {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
