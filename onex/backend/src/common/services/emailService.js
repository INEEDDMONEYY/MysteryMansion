// Common Email Service
// Consolidates all email utilities
import { sendEmail, FROM_ADDRESS } from '../utils/unosend.js';
import { buildEmail, ctaButton, darkCard, heading, SITE_URL } from '../utils/emailTemplate.js';
import env from "../../config/env.js";

/**
 * Sends a 6-digit email verification code to a prospective user.
 */
export async function sendVerificationCodeEmail({ to, code }) {
  if (!to || !code) throw new Error("Missing required parameters: 'to' or 'code'");

  const content = `
    ${heading('Verify Your Email')}
    <p style="margin:0 0 20px;color:#c8c8c8;">
      Use the code below to verify your email address. It expires in
      <strong style="color:#e2e2e2;">10 minutes</strong>.
    </p>

    <!-- OTP block -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:28px 0;">
      <tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0" border="0"
            style="background:#1c1c1c;border:2px solid #d5197e;border-radius:12px;padding:22px 40px;">
            <tr>
              <td align="center" style="font-size:42px;font-weight:700;letter-spacing:14px;
                color:#ffffff;font-family:'Courier New',Courier,monospace;line-height:1;">
                ${code}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${darkCard(`
      <p style="margin:0;color:#888;font-size:13px;line-height:1.6;">
        This code is single-use and cannot be reused. If you did not request this,
        you can safely ignore this email.
      </p>
    `, { borderColor: '#555' })}
  `;

  await sendEmail({
    from: FROM_ADDRESS,
    to,
    subject: 'Your Mystery Mansion verification code',
    html: buildEmail(content),
  });
}
