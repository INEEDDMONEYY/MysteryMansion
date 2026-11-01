import { sendEmail, FROM_ADDRESS } from './unosend.js';
import { EMAIL_CATEGORIES } from './notificationPreferences.js';
import env from '../../config/env.js';
import { buildEmail, ctaButton, darkCard, heading } from './emailTemplate.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const MEMBERSHIP_COPY = {
  activated: {
    subject: (tier) => `Your ${tier} membership is active 🎉`,
    title: 'Membership Activated! 🎉',
    intro: (tier) => `Welcome aboard — your <strong style="color:#e2e2e2;">${tier}</strong> membership is now active on <strong style="color:#e2e2e2;">Mystery Mansion</strong>.`,
    cta: 'View Your Membership',
  },
  upgraded: {
    subject: (tier) => `You upgraded to ${tier}`,
    title: 'Membership Upgraded ⬆️',
    intro: (tier) => `Your membership was upgraded to <strong style="color:#e2e2e2;">${tier}</strong>. Your new perks are active right now.`,
    cta: 'View Your Perks',
  },
  renewed: {
    subject: (tier) => `Your ${tier} membership renewed`,
    title: 'Membership Renewed ✅',
    intro: (tier) => `Your <strong style="color:#e2e2e2;">${tier}</strong> membership renewed successfully and your perks continue uninterrupted.`,
    cta: 'View Your Membership',
  },
  renewal_failed: {
    subject: (tier) => `Action needed — ${tier} membership renewal failed`,
    title: 'Renewal Failed ⚠️',
    intro: (tier) => `We couldn't renew your <strong style="color:#e2e2e2;">${tier}</strong> membership because your coin balance was too low.`,
    cta: 'Add Coins Now',
    borderColor: '#e0a800',
  },
  expiring_soon: {
    subject: (tier) => `Your ${tier} membership expires soon`,
    title: 'Membership Expiring Soon ⏳',
    intro: (tier) => `Your <strong style="color:#e2e2e2;">${tier}</strong> membership is ending soon and will not auto-renew.`,
    cta: 'Keep My Perks',
    borderColor: '#e0a800',
  },
  expired: {
    subject: (tier) => `Your ${tier} membership has expired`,
    title: 'Membership Expired',
    intro: (tier) => `Your <strong style="color:#e2e2e2;">${tier}</strong> membership has ended and its perks were removed. You can subscribe again any time.`,
    cta: 'Resubscribe',
    borderColor: '#555',
  },
  autorenew_off: {
    subject: (tier) => `Auto-renew turned off for your ${tier} membership`,
    title: 'Auto-Renew Turned Off',
    intro: (tier) => `Auto-renew was turned off for your <strong style="color:#e2e2e2;">${tier}</strong> membership. Your perks stay active until the end of your current billing period.`,
    cta: 'Manage Membership',
    borderColor: '#555',
  },
};

/**
 * Sends a membership lifecycle email.
 * @param {{ to: string, username?: string, event: keyof typeof MEMBERSHIP_COPY, tierName: string, detail?: string }} opts
 */
export async function sendMembershipEmail({ to, username, event, tierName, detail }) {
  const copy = MEMBERSHIP_COPY[event];
  if (!to || !copy || !tierName) throw new Error('Missing required parameters for membership email');

  const membershipUrl = `${env.CLIENT_URL}/user/membership`;
  const safeTier = escapeHtml(tierName);

  const content = `
    ${heading(copy.title)}
    <p style="margin:0 0 20px;color:#c8c8c8;">Hi ${escapeHtml(username || 'there')},</p>
    <p style="margin:0 0 16px;color:#c8c8c8;">${copy.intro(safeTier)}</p>
    ${detail ? darkCard(`
      <p style="margin:0;color:#e2e2e2;font-size:14px;line-height:1.7;">${escapeHtml(detail)}</p>
    `, copy.borderColor ? { borderColor: copy.borderColor } : {}) : ''}
    ${ctaButton(copy.cta, membershipUrl)}
  `;

  await sendEmail({

    category: EMAIL_CATEGORIES.MEMBERSHIP,
    from: FROM_ADDRESS,
    to,
    subject: `Mystery Mansion — ${copy.subject(tierName)}`,
    html: buildEmail(content),
  });
}
