// Shared transactional email utility (native fetch, Node 18+).
import env from '../../config/env.js';
import AdminSettings from '../../models/AdminSettings.js';
import { isEmailCategoryAllowed } from './notificationPreferences.js';

const UNOSEND_API_URL = 'https://api.unosend.co/v1/emails';
const PROVIDER_TIMEOUT_MS = 10_000;
export const FROM_ADDRESS = 'TopEscortNetwork <no-reply@topescortnetwork.com>';

/**
 * Send a transactional email via Cloudflare when configured.
 * Respects the emailEnabled toggle in AdminSettings — if disabled, the email is
 * silently skipped and { skipped: true } is returned instead of throwing.
 * Optional mail passes a `category` (see notificationPreferences.js); it is
 * skipped the same way when the recipient has opted out of that category.
 * @param {{ from?: string, to: string|string[], subject: string, html: string, category?: string }} opts
 */
export async function sendEmail({ from = FROM_ADDRESS, to, subject, html, category }) {
  // ── Check admin kill-switch ──────────────────────────────────────────────
  try {
    const settings = await AdminSettings.findOne().select('emailEnabled').lean();
    if (settings && settings.emailEnabled === false) {
      console.log(`[Email] Skipped (disabled by admin): "${subject}" → ${Array.isArray(to) ? to.join(', ') : to}`);
      return { skipped: true };
    }
  } catch (settingsErr) {
    // Don't block email if settings check fails — log and continue
    console.warn('[Email] Could not read emailEnabled setting:', settingsErr.message);
  }

  if (category) {
    const recipients = Array.isArray(to) ? to : [to];
    const allowed = [];
    for (const address of recipients) {
      try {
        if (await isEmailCategoryAllowed(address, category)) allowed.push(address);
      } catch (prefErr) {
        // Never drop mail because the preference lookup failed.
        console.warn('[Email] Could not read notification preferences:', prefErr.message);
        allowed.push(address);
      }
    }
    if (allowed.length === 0) {
      console.log(`[Email] Skipped (recipient opted out of ${category}): "${subject}"`);
      return { skipped: true, reason: 'opted_out' };
    }
    to = Array.isArray(to) ? allowed : allowed[0];
  }

  const message = { from, to: Array.isArray(to) ? to : [to], subject, html };
  const forced = (process.env.EMAIL_FORCE_PROVIDER || '').toLowerCase();
  if (forced && !['cloudflare', 'unosend', 'mailgun'].includes(forced)) {
    throw new Error(`Unknown email provider: ${forced}`);
  }
  if (forced === 'cloudflare' || (!forced && env.CLOUDFLARE_API_TOKEN)) {
    const result = await sendViaCloudflare(message);
    console.log(`[Email] Cloudflare accepted "${subject}": delivered=${result.delivered.length}, queued=${result.queued.length}`);
    return result;
  }

  if (forced !== 'mailgun') {
    try {
      return await sendViaUnosend(message);
    } catch (unosendErr) {
      if (!isMailgunConfigured()) throw unosendErr;
      console.warn(`[Email] Unosend failed, falling back to Mailgun: ${unosendErr.message}`);
    }
  }

  const result = await sendViaMailgun(message);
  console.log(`[Email] Sent via Mailgun: "${subject}" (${result.id})`);
  return result;
}

async function sendViaCloudflare({ from, to, subject, html }) {
  if (!env.CLOUDFLARE_API_TOKEN || !/^[a-f0-9]{32}$/i.test(env.CLOUDFLARE_ACCOUNT_ID || '')) {
    throw new Error('Cloudflare email requires CLOUDFLARE_API_TOKEN and a valid CLOUDFLARE_ACCOUNT_ID');
  }
  const namedFrom = from.match(/^\s*(.*?)\s*<([^<>]+)>\s*$/);
  const sender = namedFrom
    ? { address: namedFrom[2], name: namedFrom[1] }
    : from;
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/email/sending/send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: sender, to, subject, html }),
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    }
  );
  const body = await response.json();
  if (!response.ok || body.success !== true) {
    const errors = (body.errors || []).map(({ code, message }) => `${code}: ${message}`).join('; ');
    throw new Error(`Cloudflare Email API error ${response.status}: ${errors || 'Unsuccessful response'}`);
  }
  const result = body.result;
  if (!result || !['delivered', 'queued', 'permanent_bounces'].every((key) => Array.isArray(result[key]))) {
    throw new Error('Cloudflare Email API returned an invalid delivery result');
  }
  if (result.permanent_bounces.length) {
    throw new Error(`Cloudflare Email reported ${result.permanent_bounces.length} permanent bounce(s)`);
  }
  if (to.some((address) => ![...result.delivered, ...result.queued].includes(address))) {
    throw new Error('Cloudflare Email did not accept all recipients');
  }
  return { ...result, provider: 'cloudflare' };
}

async function sendViaUnosend({ from, to, subject, html }) {
  const apiKey = env.UNOSEND_API_KEY;
  if (!apiKey) throw new Error('UNOSEND_API_KEY is not configured');

  const response = await fetch(UNOSEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Unosend API error ${response.status}: ${body.slice(0, 300)}`);
  }

  return { provider: 'unosend', ...(await response.json()) };
}

function getMailgunDomain(from = FROM_ADDRESS) {
  if (env.MAILGUN_DOMAIN) return env.MAILGUN_DOMAIN;
  const match = String(from).match(/@([^>\s]+)/);
  return match ? match[1] : '';
}

export function isMailgunConfigured() {
  return Boolean(env.MAILGUN_API_KEY && getMailgunDomain());
}

/**
 * Send through the Mailgun Messages API (POST /v3/{domain}/messages,
 * HTTP Basic auth "api:<key>", multipart form fields).
 */
export async function sendViaMailgun({ from = FROM_ADDRESS, to, subject, html }) {
  const apiKey = env.MAILGUN_API_KEY;
  const domain = getMailgunDomain(from);
  if (!apiKey || !domain) throw new Error('Mailgun is not configured (MAILGUN_API_KEY / MAILGUN_DOMAIN)');

  const form = new FormData();
  form.append('from', from);
  for (const address of Array.isArray(to) ? to : [to]) form.append('to', address);
  form.append('subject', subject);
  form.append('html', html);

  const response = await fetch(`${env.MAILGUN_BASE_URL}/v3/${encodeURIComponent(domain)}/messages`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}` },
    body: form,
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Mailgun API error ${response.status}: ${body.slice(0, 300)}`);
  }

  return { provider: 'mailgun', ...(await response.json()) };
}
