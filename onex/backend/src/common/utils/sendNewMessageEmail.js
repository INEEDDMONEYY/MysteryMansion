import { sendEmail, FROM_ADDRESS } from './unosend.js';
import { buildEmail, ctaButton, darkCard, heading } from './emailTemplate.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * Sends a "you have a new message" email notification.
 * @param {{ to: string, recipientUsername?: string, senderUsername: string, messageText: string, ctaUrl: string }} opts
 */
export async function sendNewMessageEmail({ to, recipientUsername, senderUsername, messageText, ctaUrl }) {
  if (!to || !senderUsername || !ctaUrl) {
    throw new Error('Missing required parameters for new message email');
  }

  const content = `
    ${heading('You have a new message')}
    <p style="margin:0 0 20px;color:#c8c8c8;">Hi ${escapeHtml(recipientUsername || 'there')},</p>
    <p style="margin:0 0 16px;color:#c8c8c8;">
      <strong style="color:#e2e2e2;">${escapeHtml(senderUsername)}</strong> sent you a message on
      <strong style="color:#e2e2e2;">Mystery Mansion</strong>:
    </p>
    ${darkCard(`
      <p style="margin:0;color:#e2e2e2;font-size:14px;line-height:1.7;">${escapeHtml(messageText).slice(0, 400)}</p>
    `)}
    ${ctaButton('Reply Now', ctaUrl)}
  `;

  await sendEmail({
    from: FROM_ADDRESS,
    to,
    subject: `${senderUsername} sent you a message`,
    html: buildEmail(content),
  });
}
