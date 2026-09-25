import { sendEmail, FROM_ADDRESS } from './unosend.js';
import env from '../../config/env.js';
import { buildEmail, ctaButton, darkCard, heading } from './emailTemplate.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * Sends a "you reached a milestone" email.
 * @param {{ to: string, username?: string, milestoneTitle: string, milestoneDescription?: string }} opts
 */
export async function sendMilestoneAchievedEmail({ to, username, milestoneTitle, milestoneDescription }) {
  if (!to || !milestoneTitle) throw new Error('Missing required parameters for milestone achievement email');

  const milestonesUrl = `${env.CLIENT_URL}/user/milestones`;

  const content = `
    ${heading('Milestone Achieved! 🎉')}
    <p style="margin:0 0 20px;color:#c8c8c8;">Hi ${escapeHtml(username || 'there')},</p>
    <p style="margin:0 0 16px;color:#c8c8c8;">You just reached a new milestone on <strong style="color:#e2e2e2;">Mystery Mansion</strong>:</p>
    ${darkCard(`
      <p style="margin:0 0 4px;color:#d5197e;font-size:11px;text-transform:uppercase;letter-spacing:1.2px;font-weight:700;">Milestone</p>
      <p style="margin:0 0 10px;color:#ffffff;font-size:17px;font-weight:700;">${escapeHtml(milestoneTitle)}</p>
      <p style="margin:0;color:#b0b0b0;font-size:14px;line-height:1.7;">${escapeHtml(milestoneDescription || '')}</p>
    `)}
    ${ctaButton('View Your Milestones', milestonesUrl)}
  `;

  await sendEmail({
    from: FROM_ADDRESS,
    to,
    subject: `Mystery Mansion — You reached "${milestoneTitle}"`,
    html: buildEmail(content),
  });
}

/**
 * Sends an announcement email for one or more newly published (admin-added) milestones.
 * @param {{ to: string, username?: string, milestones: Array<{ title: string, description?: string }> }} opts
 */
export async function sendMilestonesAddedEmail({ to, username, milestones }) {
  if (!to || !Array.isArray(milestones) || milestones.length === 0) {
    throw new Error('Missing required parameters for milestone announcement email');
  }

  const milestonesUrl = `${env.CLIENT_URL}/user/milestones`;
  const isBatch = milestones.length > 1;

  const listHtml = milestones
    .map(
      (m) => `
        <p style="margin:0 0 4px;color:#ffffff;font-size:15px;font-weight:700;">${escapeHtml(m.title)}</p>
        <p style="margin:0 0 14px;color:#b0b0b0;font-size:14px;line-height:1.7;">${escapeHtml(m.description || '')}</p>
      `
    )
    .join('');

  const content = `
    ${heading(isBatch ? `${milestones.length} New Milestones Added! 🎉` : 'New Milestone Added! 🎉')}
    <p style="margin:0 0 20px;color:#c8c8c8;">Hi ${escapeHtml(username || 'there')},</p>
    <p style="margin:0 0 16px;color:#c8c8c8;">
      ${isBatch ? 'New milestones are' : 'A new milestone is'} now available for you to pursue on
      <strong style="color:#e2e2e2;">Mystery Mansion</strong>:
    </p>
    ${darkCard(listHtml)}
    ${ctaButton('View Milestones', milestonesUrl)}
  `;

  await sendEmail({
    from: FROM_ADDRESS,
    to,
    subject: isBatch
      ? `Mystery Mansion — ${milestones.length} new milestones added`
      : `Mystery Mansion — New milestone: "${milestones[0].title}"`,
    html: buildEmail(content),
  });
}
