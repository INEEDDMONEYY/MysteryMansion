import { sendEmail, FROM_ADDRESS } from './unosend.js';
import { buildEmail, darkCard, heading, divider } from './emailTemplate.js';

export async function sendAccountDeletionEmail({ to, username, reason }) {
  if (!to || !reason) {
    throw new Error("Missing required email parameters: 'to' or 'reason'");
  }

  function escapeHtml(v = '') {
    return String(v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  const content = `
    ${heading('Account Deletion Notice')}
    <p style="margin:0 0 20px;color:#c8c8c8;">Hi ${escapeHtml(username || 'there')},</p>
    <p style="margin:0 0 16px;color:#c8c8c8;">Your <strong style="color:#e2e2e2;">Mystery Mansion</strong> account has been removed by our moderation team for the following reason:</p>
    ${darkCard(`
      <p style="margin:0;color:#e2e2e2;font-size:14px;line-height:1.7;">${escapeHtml(reason)}</p>
    `, { borderColor: '#e53e3e' })}
    <p style="margin:0 0 20px;color:#888;font-size:14px;">
      If you believe this was a mistake or would like to appeal, reply to this email or contact us at
      <a href="mailto:support.mysterymansion@gmail.com" style="color:#d5197e;text-decoration:none;">support.mysterymansion@gmail.com</a>
      with your username and any relevant context.
    </p>
    ${divider}
    <p style="margin:0;color:#666;font-size:13px;">Mystery Mansion Team</p>
  `;

  await sendEmail({
    from: FROM_ADDRESS,
    to,
    subject: 'Your Mystery Mansion Account Has Been Removed',
    html: buildEmail(content),
  });
}

