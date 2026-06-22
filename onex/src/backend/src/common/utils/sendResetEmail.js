// utils/sendzResetEmail.js

import { sendEmail, FROM_ADDRESS } from './unosend.js';
import env from "../../config/env.js";

/**
 * Sends a password reset email to a user
 *
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.username - Username for personalization
 * @param {string} params.resetToken - Token to append to frontend reset password URL
 * @param {boolean} [params.isAdminInvite=false] - Whether this reset email is for an admin-created account
 */
async function sendResetEmail({ to, username, resetToken, isAdminInvite = false }) {
  if (!to || !resetToken) {
    throw new Error("Missing required email parameters: 'to' or 'resetToken'");
  }

  try {
    // Construct the full reset URL pointing to your frontend route
    const resetUrl = `${env.CLIENT_URL}/reset-password/${resetToken}`;

    const subject = isAdminInvite
      ? "Your Mystery Mansion Account Is Ready"
      : "Reset Your Mystery Mansion Password";

    const heading = isAdminInvite
      ? "Your Account Was Created by an Admin"
      : "Password Reset Request";

    const introText = isAdminInvite
      ? `An admin created a <strong>Mystery Mansion</strong> account for you. To finish setup, please create your password using the secure button below.`
      : `We received a request to reset your password for your <strong>Mystery Mansion</strong> account.`;

    const actionLabel = isAdminInvite ? "Create Password" : "Reset Password";

    const footerText = isAdminInvite
      ? "If you were not expecting this account, please contact support."
      : "If you didn’t request this, you can safely ignore this email.";

    await sendEmail({
      from: FROM_ADDRESS,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>${heading}</h2>
          <p>Hi ${username || "there"},</p>
          <p>${introText}</p>
          <p>Click the button below to continue:</p>
          <p style="margin: 20px 0;">
            <a
              href="${resetUrl}"
              style="
                background: #000;
                color: #fff;
                padding: 12px 18px;
                text-decoration: none;
                border-radius: 6px;
                display: inline-block;
              "
            >
              ${actionLabel}
            </a>
          </p>
          <p>This link will expire in <strong>1 hour</strong>.</p>
          <p>${footerText}</p>
          <hr />
          <p style="font-size: 12px; color: #777;">© ${new Date().getFullYear()} Mystery Mansion. All rights reserved.</p>
        </div>
      `,
    });

    console.log(`✅ Password reset email sent to ${to}`);
  } catch (err) {
    console.error("❌ Failed to send reset email:", err.message);
    throw new Error("Email service failed. Please try again later.");
  }
}

export default sendResetEmail;
