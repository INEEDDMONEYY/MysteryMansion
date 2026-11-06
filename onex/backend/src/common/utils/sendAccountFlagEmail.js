import { sendEmail, FROM_ADDRESS } from './unosend.js';
import { EMAIL_CATEGORIES } from './notificationPreferences.js';
import env from '../../config/env.js';
import { buildEmail, ctaButton, darkCard, heading } from './emailTemplate.js';
import { allowEmail } from './emailRateLimiter.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Caps "your account/post was reported" emails per recipient so repeated or
// coordinated reports can't flood an inbox. In-app notifications still fire.
const FLAGGED_EMAIL_LIMIT = 1;
const FLAGGED_EMAIL_WINDOW_MS = 60 * 60 * 1000; // 1 hour per recipient

/**
 * Confirms to the reporter that their report was received.
 * @param {{ to: string, username?: string, targetType: 'post'|'user' }} opts
 */
export async function sendFlagSubmittedEmail({ to, username, targetType }) {
  if (!to || !targetType) throw new Error('Missing required parameters for flag submitted email');

  const targetLabel = targetType === 'post' ? 'post' : 'account';
  const content = `
    ${heading('Report Received')}
    <p style="margin:0 0 20px;color:#c8c8c8;">Hi ${escapeHtml(username || 'there')},</p>
    <p style="margin:0 0 16px;color:#c8c8c8;">
      Thanks for helping keep <strong style="color:#e2e2e2;">TopEscortNetwork</strong> safe.
      We received your report about a ${targetLabel} and our team will review it shortly.
    </p>
    ${darkCard(`
      <p style="margin:0;color:#e2e2e2;font-size:14px;line-height:1.7;">
        You'll get an update by email and in-app notification whenever the status of your report changes.
      </p>
    `)}
    ${ctaButton('Track Your Report', `${env.CLIENT_URL}/user/reports`)}
  `;

  await sendEmail({

    category: EMAIL_CATEGORIES.ACCOUNT_FLAGS,
    from: FROM_ADDRESS,
    to,
    subject: 'TopEscortNetwork — We received your report',
    html: buildEmail(content),
  });
}

/**
 * Tells the reporter the status of their report changed.
 * @param {{ to: string, username?: string, statusLabel: string, message?: string }} opts
 */
export async function sendFlagStatusUpdateEmail({ to, username, statusLabel, message }) {
  if (!to || !statusLabel) throw new Error('Missing required parameters for flag status email');

  const content = `
    ${heading('Update on Your Report')}
    <p style="margin:0 0 20px;color:#c8c8c8;">Hi ${escapeHtml(username || 'there')},</p>
    <p style="margin:0 0 16px;color:#c8c8c8;">
      The status of a report you submitted on <strong style="color:#e2e2e2;">TopEscortNetwork</strong> has changed:
    </p>
    ${darkCard(`
      <p style="margin:0 0 4px;color:#d5197e;font-size:11px;text-transform:uppercase;letter-spacing:1.2px;font-weight:700;">New Status</p>
      <p style="margin:0 0 10px;color:#ffffff;font-size:17px;font-weight:700;">${escapeHtml(statusLabel)}</p>
      ${message ? `<p style="margin:0;color:#b0b0b0;font-size:14px;line-height:1.7;">${escapeHtml(message)}</p>` : ''}
    `)}
    ${ctaButton('View Report Details', `${env.CLIENT_URL}/user/reports`)}
  `;

  await sendEmail({

    category: EMAIL_CATEGORIES.ACCOUNT_FLAGS,
    from: FROM_ADDRESS,
    to,
    subject: `TopEscortNetwork — Your report is now: ${statusLabel}`,
    html: buildEmail(content),
  });
}

/**
 * Notifies a user that their account or post was reported (reporter identity
 * is never included). Rate-limited per recipient.
 * @param {{ to: string, username?: string, targetType: 'post'|'user' }} opts
 */
export async function sendAccountFlaggedEmail({ to, username, targetType }) {
  if (!to || !targetType) throw new Error('Missing required parameters for account flagged email');

  if (!allowEmail(`flagged:${to}`, { limit: FLAGGED_EMAIL_LIMIT, windowMs: FLAGGED_EMAIL_WINDOW_MS })) {
    console.log(`[Email] Rate-limited (account flagged) → ${to}`);
    return { skipped: true, reason: 'rate_limited' };
  }

  const isPost = targetType === 'post';
  const content = `
    ${heading(isPost ? 'Your Post Was Reported' : 'Your Account Was Reported')}
    <p style="margin:0 0 20px;color:#c8c8c8;">Hi ${escapeHtml(username || 'there')},</p>
    <p style="margin:0 0 16px;color:#c8c8c8;">
      A report was submitted about your ${isPost ? 'post' : 'account'} on
      <strong style="color:#e2e2e2;">TopEscortNetwork</strong> and is waiting for review by our team.
    </p>
    ${darkCard(`
      <p style="margin:0;color:#e2e2e2;font-size:14px;line-height:1.7;">
        No action is required from you right now. If our team needs anything, or takes any action,
        you'll be notified. Please review our community guidelines to make sure your content complies.
      </p>
    `, { borderColor: '#e0a800' })}
    ${ctaButton('Review Community Guidelines', `${env.CLIENT_URL}/community-guidelines`)}
  `;

  await sendEmail({

    category: EMAIL_CATEGORIES.ACCOUNT_FLAGS,
    from: FROM_ADDRESS,
    to,
    subject: isPost
      ? 'TopEscortNetwork — Your post was reported'
      : 'TopEscortNetwork — Your account was reported',
    html: buildEmail(content),
  });
}
