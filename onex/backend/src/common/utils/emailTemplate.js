/**
 * Mystery Mansion — shared email template builder
 * All transactional emails use this shell for consistent branding.
 */
import env from '../../config/env.js';

// Use EMAIL_ASSET_BASE for images — must be a non-redirecting origin.
// CLIENT_URL is used for CTA links only (redirects are fine for those).
export const LOGO_URL = `${env.EMAIL_ASSET_BASE}/Logo.png`;
export const HERO_URL = `${env.EMAIL_ASSET_BASE}/mm-hero.png`;
export const SITE_URL = env.CLIENT_URL;

const PINK    = '#d5197e';
const DARK_BG = '#0a0a0a';
const CARD_BG = '#141414';
const HEAD_BG = '#0d0d0d';
const BORDER  = '#2a2a2a';
const TEXT    = '#e2e2e2';
const MUTED   = '#888888';

/**
 * Wraps HTML content in the branded Mystery Mansion email shell.
 *
 * @param {string}  content   – inner HTML for the body cell
 * @param {object}  opts
 * @param {boolean} [opts.showHero=false]  – include full-width mm-hero banner after header
 */
export function buildEmail(content, { showHero = false } = {}) {
  const year = new Date().getFullYear();

  const heroRow = showHero ? `
    <tr>
      <td style="padding:0;line-height:0;font-size:0;">
        <img
          src="${HERO_URL}"
          alt="Mystery Mansion"
          width="580"
          style="display:block;width:100%;max-width:580px;border:0;"
        />
      </td>
    </tr>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Mystery Mansion</title>
</head>
<body style="margin:0;padding:0;background:${DARK_BG};font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background:${DARK_BG};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" border="0"
          style="max-width:580px;width:100%;background:${CARD_BG};border-radius:14px;overflow:hidden;border:1px solid ${BORDER};">

          <!-- ── HEADER ─────────────────────────────────────────── -->
          <tr>
            <td style="background:${HEAD_BG};padding:26px 32px 22px;text-align:center;border-bottom:3px solid ${PINK};">
              <a href="${SITE_URL}" style="text-decoration:none;">
                <img
                  src="${LOGO_URL}"
                  alt="Mystery Mansion"
                  width="128"
                  height="auto"
                  style="display:inline-block;border:0;max-width:128px;"
                />
              </a>
            </td>
          </tr>
          ${heroRow}

          <!-- ── BODY ───────────────────────────────────────────── -->
          <tr>
            <td style="padding:36px 36px 28px;color:${TEXT};font-size:15px;line-height:1.75;">
              ${content}
            </td>
          </tr>

          <!-- ── FOOTER ─────────────────────────────────────────── -->
          <tr>
            <td style="background:${HEAD_BG};padding:18px 32px;text-align:center;border-top:1px solid ${BORDER};">
              <p style="margin:0 0 5px;font-size:12px;color:${MUTED};">
                &copy; ${year} Mystery Mansion. All rights reserved.
              </p>
              <p style="margin:0;font-size:12px;color:${MUTED};">
                Need help?&nbsp;
                <a href="mailto:support.mysterymansion@gmail.com"
                  style="color:${PINK};text-decoration:none;">
                  support.mysterymansion@gmail.com
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Pink CTA button */
export function ctaButton(label, url) {
  return `
    <table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
      <tr>
        <td style="border-radius:8px;background:${PINK};">
          <a href="${url}"
            style="display:inline-block;padding:13px 30px;color:#ffffff;font-weight:bold;font-size:15px;text-decoration:none;letter-spacing:0.3px;border-radius:8px;">
            ${label}
          </a>
        </td>
      </tr>
    </table>`;
}

/** Dark card block used for step lists, reason blocks, etc. */
export function darkCard(html, { borderColor = PINK } = {}) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
      <tr>
        <td style="background:#1c1c1c;border-radius:8px;padding:20px 22px;border-left:4px solid ${borderColor};">
          ${html}
        </td>
      </tr>
    </table>`;
}

/** Section heading */
export function heading(text, { size = '22px', color = '#ffffff' } = {}) {
  return `<h2 style="margin:0 0 12px;font-size:${size};color:${color};font-weight:700;">${text}</h2>`;
}

/** Divider */
export const divider = `<hr style="border:none;border-top:1px solid #2a2a2a;margin:24px 0;" />`;
