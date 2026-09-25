import { sendEmail, FROM_ADDRESS } from './unosend.js';
import env from '../../config/env.js';
import { buildEmail, ctaButton, darkCard, heading } from './emailTemplate.js';
import { allowEmail } from './emailRateLimiter.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const ACTIVITY_COPY = {
  post_liked: { subject: 'Someone liked your post', label: 'New Like' },
  new_comment: { subject: 'New comment on your post', label: 'New Comment' },
  new_review: { subject: 'New review on your profile', label: 'New Review' },
};

// Caps how often a single recipient can be emailed for the same activity type —
// prevents inbox flooding from repeated (or spoofed/multi-account) likes,
// comments, or reviews. In-app notifications are unaffected and still fire
// every time.
const ACTIVITY_EMAIL_LIMIT = 1;
const ACTIVITY_EMAIL_WINDOW_MS = 10 * 60 * 1000; // 10 minutes per (type, recipient)

/**
 * Sends an account-activity email for a like, comment, or review.
 * @param {{ to: string, username?: string, type: 'post_liked'|'new_comment'|'new_review', message: string, ctaUrl?: string }} opts
 */
export async function sendAccountActivityEmail({ to, username, type, message, ctaUrl }) {
  const copy = ACTIVITY_COPY[type];
  if (!to || !copy) throw new Error('Missing required parameters for account activity email');

  if (!allowEmail(`activity:${type}:${to}`, { limit: ACTIVITY_EMAIL_LIMIT, windowMs: ACTIVITY_EMAIL_WINDOW_MS })) {
    console.log(`[Email] Rate-limited (${type}) → ${to}`);
    return { skipped: true, reason: 'rate_limited' };
  }

  const content = `
    ${heading(copy.label)}
    <p style="margin:0 0 20px;color:#c8c8c8;">Hi ${escapeHtml(username || 'there')},</p>
    ${darkCard(`
      <p style="margin:0;color:#e2e2e2;font-size:14px;line-height:1.7;">${escapeHtml(message)}</p>
    `)}
    ${ctaButton('View on Mystery Mansion', ctaUrl || env.CLIENT_URL)}
  `;

  await sendEmail({
    from: FROM_ADDRESS,
    to,
    subject: copy.subject,
    html: buildEmail(content),
  });
}

/**
 * Sends the "it's been N days since your last post" inactivity nudge.
 * @param {{ to: string, username?: string, days: number }} opts
 */
export async function sendAccountInactivityEmail({ to, username, days }) {
  if (!to || !days) throw new Error('Missing required parameters for inactivity email');

  const content = `
    ${heading("We haven't seen you post in a while")}
    <p style="margin:0 0 20px;color:#c8c8c8;">Hi ${escapeHtml(username || 'there')},</p>
    <p style="margin:0 0 16px;color:#c8c8c8;">
      It's been <strong style="color:#e2e2e2;">${days} days</strong> since your last post on
      <strong style="color:#e2e2e2;">Mystery Mansion</strong>. Providers who post regularly stay
      visible and get more views.
    </p>
    ${ctaButton('Create a New Post', `${env.CLIENT_URL}/post`)}
  `;

  await sendEmail({
    from: FROM_ADDRESS,
    to,
    subject: `It's been ${days} days since your last post`,
    html: buildEmail(content),
  });
}
