import { sendEmail, FROM_ADDRESS } from './unosend.js';
import { EMAIL_CATEGORIES } from './notificationPreferences.js';
import env from '../../config/env.js';
import { buildEmail, ctaButton, darkCard, heading } from './emailTemplate.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const PROMOTION_COPY = {
  purchased: {
    subject: (label) => `${label} purchased 🎉`,
    title: 'Promotion Active! 🎉',
      intro: (label) => `Your <strong style="color:#e2e2e2;">${label}</strong> purchase is confirmed and your promotion is live on <strong style="color:#e2e2e2;">TopEscortNetwork</strong>.`,
    cta: 'View Promotion Status',
  },
  badge_renewed: {
    subject: () => 'Your Blue Badge renewed',
    title: 'Blue Badge Renewed ✅',
    intro: () => 'Your monthly <strong style="color:#e2e2e2;">Blue Badge</strong> renewed successfully and stays on your profile.',
    cta: 'View Promotion Status',
  },
  badge_removed: {
    subject: () => 'Your Blue Badge was removed',
    title: 'Blue Badge Removed ⚠️',
    intro: () => 'Your credit balance was too low at renewal, so your <strong style="color:#e2e2e2;">Blue Badge</strong> was removed. Add credits and resubscribe from the Promote page any time.',
    cta: 'Add Credits',
    borderColor: '#e0a800',
  },
  badge_expired: {
    subject: () => 'Your Blue Badge expired',
    title: 'Blue Badge Expired',
    intro: () => 'Your verification badge has expired. You can purchase a new promotion from the Promote page whenever you like.',
    cta: 'Promote Again',
    borderColor: '#555',
  },
  badge_cancelled: {
    subject: () => 'Monthly Blue Badge cancelled',
    title: 'Blue Badge Cancelled',
    intro: () => "You won't be charged again for your monthly <strong style=\"color:#e2e2e2;\">Blue Badge</strong>. It stays active until the end of your current period.",
    cta: 'View Promotion Status',
    borderColor: '#555',
  },
  expiring_soon: {
    subject: () => 'Your promotion expires soon',
    title: 'Promotion Expiring Soon ⏳',
    intro: () => 'Your promoted account status is about to end. Post as much as possible before your account returns to standard status to get the most out of your remaining window.',
    cta: 'Create a New Post',
    borderColor: '#e0a800',
  },
};

/**
 * Sends a promotional-status email (purchases, badge renewals, expiry).
 * @param {{ to: string, username?: string, event: keyof typeof PROMOTION_COPY, tierLabel?: string, detail?: string }} opts
 */
export async function sendPromotionEmail({ to, username, event, tierLabel, detail }) {
  const copy = PROMOTION_COPY[event];
  if (!to || !copy) throw new Error('Missing required parameters for promotion email');

  const ctaUrl = event === 'expiring_soon' ? `${env.CLIENT_URL}/post` : `${env.CLIENT_URL}/promote`;
  const safeLabel = escapeHtml(tierLabel || 'Promotion');

  const content = `
    ${heading(copy.title)}
    <p style="margin:0 0 20px;color:#c8c8c8;">Hi ${escapeHtml(username || 'there')},</p>
    <p style="margin:0 0 16px;color:#c8c8c8;">${copy.intro(safeLabel)}</p>
    ${detail ? darkCard(`
      <p style="margin:0;color:#e2e2e2;font-size:14px;line-height:1.7;">${escapeHtml(detail)}</p>
    `, copy.borderColor ? { borderColor: copy.borderColor } : {}) : ''}
    ${ctaButton(copy.cta, ctaUrl)}
  `;

  await sendEmail({

    category: EMAIL_CATEGORIES.PROMOTIONAL,
    from: FROM_ADDRESS,
    to,
    subject: `TopEscortNetwork — ${copy.subject(tierLabel)}`,
    html: buildEmail(content),
  });
}
