import { sendEmail, FROM_ADDRESS } from './unosend.js';
import { buildEmail, ctaButton, darkCard, heading } from './emailTemplate.js';
import env from '../../config/env.js';

// Support inbox that receives new contact-form inquiries.
export const CONTACT_INBOX =
  process.env.CONTACT_INBOX_EMAIL?.trim() || 'support.mysterymansion@gmail.com';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const row = (label, value) => `
  <p style="margin:0 0 8px;color:#8a8a8a;font-size:12px;text-transform:uppercase;letter-spacing:1px;">${label}</p>
  <p style="margin:0 0 16px;color:#e2e2e2;font-size:14px;">${escapeHtml(value)}</p>`;

/**
 * Alerts the support inbox about a new contact-form inquiry. Transactional
 * (no notification category) so it isn't affected by user email preferences.
 */
export async function sendContactInquiryEmail({ to = CONTACT_INBOX, inquiry }) {
  if (!inquiry) throw new Error('Missing inquiry for contact notification');

  const content = `
    ${heading('New Contact Inquiry')}
    <p style="margin:0 0 20px;color:#c8c8c8;">A new inquiry was submitted through the contact form.</p>
    ${darkCard(`
      ${row('Inquiry Type', inquiry.topic)}
      ${row('From', `${inquiry.name} <${inquiry.email}>`)}
      ${row('Subject', inquiry.subject)}
      <p style="margin:0 0 8px;color:#8a8a8a;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Message</p>
      <p style="margin:0;color:#e2e2e2;font-size:14px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(inquiry.message)}</p>
    `)}
    ${ctaButton('Open in Admin Dashboard', `${env.CLIENT_URL}/admin/contact-inquiries`)}
  `;

  return sendEmail({
    from: FROM_ADDRESS,
    to,
    subject: `[Contact] ${String(inquiry.topic)} — ${String(inquiry.subject).slice(0, 80)}`,
    html: buildEmail(content),
  });
}
