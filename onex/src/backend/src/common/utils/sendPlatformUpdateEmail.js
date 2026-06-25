import { sendEmail, FROM_ADDRESS } from './unosend.js';
import env from '../../config/env.js';
import { buildEmail, ctaButton, darkCard, heading } from './emailTemplate.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export async function sendPlatformUpdateEmail({ to, username, title, description, type }) {
  if (!to) throw new Error('Missing required email parameters for platform update notification');

  const updateUrl = `${env.CLIENT_URL}/platform-updates`;
  const typeLabel = type === 'feature' ? 'New Feature' : 'Platform Update';

  const content = `
    ${heading('Platform Update')}
    <p style="margin:0 0 20px;color:#c8c8c8;">Hi ${escapeHtml(username || 'there')},</p>
    <p style="margin:0 0 16px;color:#c8c8c8;">We&rsquo;ve just shipped something new on <strong style="color:#e2e2e2;">Mystery Mansion</strong>. Here&rsquo;s what&rsquo;s changed:</p>
    ${darkCard(`
      <p style="margin:0 0 4px;color:#d5197e;font-size:11px;text-transform:uppercase;letter-spacing:1.2px;font-weight:700;">${escapeHtml(typeLabel)}</p>
      <p style="margin:0 0 10px;color:#ffffff;font-size:17px;font-weight:700;">${escapeHtml(title || '')}</p>
      <p style="margin:0;color:#b0b0b0;font-size:14px;line-height:1.7;">${escapeHtml(description || '')}</p>
    `)}
    ${ctaButton('View All Updates', updateUrl)}
  `;

  await sendEmail({
    from: FROM_ADDRESS,
    to,
    subject: `Mystery Mansion — ${escapeHtml(title || 'Platform Update')}`,
    html: buildEmail(content),
  });
}

export async function notifyUsersAboutPlatformUpdate({ users, update }) {
  const recipients = Array.isArray(users)
    ? users.filter((user) => user?.email && user?.status !== "suspended")
    : [];

  const results = await Promise.allSettled(
    recipients.map((user) =>
      sendPlatformUpdateEmail({
        to: user.email,
        username: user.username,
        title: update.title,
        description: update.description,
        type: update.type,
      })
    )
  );

  const sent = results.filter((result) => result.status === "fulfilled").length;
  const failed = results.length - sent;

  return { sent, failed, attempted: results.length };
}