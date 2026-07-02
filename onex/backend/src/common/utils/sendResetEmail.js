import { sendEmail, FROM_ADDRESS } from './unosend.js';
import env from '../../config/env.js';
import { buildEmail, ctaButton, darkCard, heading, divider } from './emailTemplate.js';

async function sendResetEmail({ to, username, resetToken, isAdminInvite = false }) {
  if (!to || !resetToken) {
    throw new Error("Missing required email parameters: 'to' or 'resetToken'");
  }

  try {
    const resetUrl = env.CLIENT_URL + '/reset-password/' + resetToken;

    const subject = isAdminInvite
      ? 'Your Mystery Mansion Account Is Ready'
      : 'Reset Your Mystery Mansion Password';

    const title = isAdminInvite ? 'Account Created by Admin' : 'Password Reset Request';

    const intro = isAdminInvite
      ? 'An admin has created a <strong style="color:#e2e2e2;">Mystery Mansion</strong> account for you. Use the button below to set your password and activate your account.'
      : 'We received a request to reset the password on your <strong style="color:#e2e2e2;">Mystery Mansion</strong> account. If this was you, click below to continue.';

    const actionLabel = isAdminInvite ? 'Create My Password' : 'Reset My Password';

    const footerNote = isAdminInvite
      ? 'If you were not expecting this, please contact support immediately.'
      : 'If you did not request a reset, you can safely ignore this email. Your password has not changed.';

    const content = [
      heading(title),
      '<p style="margin:0 0 20px;color:#c8c8c8;">Hi ' + (username || 'there') + ',</p>',
      '<p style="margin:0 0 20px;color:#c8c8c8;">' + intro + '</p>',
      ctaButton(actionLabel, resetUrl),
      darkCard('<p style="margin:0;color:#888;font-size:13px;line-height:1.6;">This link expires in <strong style="color:#e2e2e2;">1 hour</strong>. ' + footerNote + '</p>', { borderColor: '#555' }),
    ].join('');

    await sendEmail({ from: FROM_ADDRESS, to, subject, html: buildEmail(content) });
    console.log('Password reset email sent to ' + to);
  } catch (err) {
    console.error('Failed to send reset email:', err.message);
    throw new Error('Email service failed. Please try again later.');
  }
}

export default sendResetEmail;
