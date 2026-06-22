// Common Email Service
// Consolidates all email utilities
import { sendEmail, FROM_ADDRESS } from '../utils/unosend.js';
import env from "../../config/env.js";

/**
 * Sends a welcome email to a new user
 */
export async function sendWelcomeEmail({ to, username }) {
  if (!to) {
    throw new Error("Missing required email parameter: 'to'");
  }

  await sendEmail({
    from: FROM_ADDRESS,
    to,
    subject: "Welcome to Mystery Mansion",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Welcome to Mystery Mansion 🎉🎊</h2>
        <p>Hi ${username || "there"},</p>
        <p>Glad to have you here.</p>
        <p>You can post your ad for free and start getting exposure right away.</p>
        <p><strong>To get started:</strong></p>
        <ul style="margin: 8px 0 16px 18px; padding: 0;">
          <li>Complete your profile (photo + bio + age + gender).</li>
          <li>Create your first post to start getting exposure.</li>
          <li>Set your availability and pricing in your dashboard settings.</li>
        </ul>
        <p>If you need anything, just message support — the platform is actively monitored for safety.</p>
        <p style="margin: 20px 0;">
          <a
            href="${env.CLIENT_URL}/home"
            style="background: #111; color: #fff; padding: 12px 18px; text-decoration: none; border-radius: 6px; display: inline-block;"
          >
            Go to Mystery Mansion
          </a>
        </p>
        <hr />
        <p style="font-size: 12px; color: #777;">© ${new Date().getFullYear()} Mystery Mansion. All rights reserved.</p>
      </div>
    `,
  });
}

/**
 * Sends a password reset email to a user
 */
export async function sendResetEmail({ to, username, resetToken, isAdminInvite = false }) {
  if (!to || !resetToken) {
    throw new Error("Missing required email parameters: 'to' or 'resetToken'");
  }

  try {
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
      : "If you didn't request this, you can safely ignore this email.";

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

/**
 * Sends a platform update email to a user
 */
export async function sendPlatformUpdateEmail({ to, username, title, description, type }) {
  if (!to) {
    throw new Error("Missing required email parameters for platform update notification");
  }

  function escapeHtml(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  const updateUrl = `${env.CLIENT_URL}/platform-updates`;
  const safeType = type === "feature" ? "feature" : "platform";

  await sendEmail({
    from: FROM_ADDRESS,
    to,
    subject: "New platform updates are available",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2 style="margin-bottom: 8px;">Platform updates are available</h2>
        <p>Hi ${escapeHtml(username || "there")},</p>
        <p>We have released new ${safeType} updates to make your Mystery Mansion experience even better.</p>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(description)}</p>
        <p style="margin: 20px 0;">
          <a
            href="${updateUrl}"
            style="background: #111; color: #fff; padding: 12px 18px; text-decoration: none; border-radius: 6px; display: inline-block;"
          >
            View Updates
          </a>
        </p>
        <hr />
        <p style="font-size: 12px; color: #777;">© ${new Date().getFullYear()} Mystery Mansion. All rights reserved.</p>
      </div>
    `,
  });
}

/**
 * Sends an account deletion email to a user
 */
export async function sendAccountDeletionEmail({ to, username, reason }) {
  if (!to || !reason) {
    throw new Error("Missing required email parameters: 'to' or 'reason'");
  }

  try {
    await sendEmail({
      from: FROM_ADDRESS,
      to,
      subject: "Your Account Has Been Deleted",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Account Deletion Notice</h2>
          <p>Hi ${username || "there"},</p>
          <p>Your account has been deleted by our team due to the following reason:</p>
          <blockquote style="background: #ffeaea; padding: 10px; border-left: 4px solid #e53e3e;">${reason}</blockquote>
          <p>If you believe this was a mistake or wish to appeal, please contact our development team at <a href="mailto:support.mysterymansion@gmail.com">support.mysterymansion@gmail.com</a> with your username and any relevant information.</p>
          <p>Thank you,<br/>Mystery Mansion Team</p>
          <hr />
          <p style="font-size: 12px; color: #777;">© ${new Date().getFullYear()} Mystery Mansion. All rights reserved.</p>
        </div>
      `,
    });

    console.log(`✅ Account deletion email sent to ${to}`);
  } catch (err) {
    console.error("❌ Failed to send account deletion email:", err.message);
    throw new Error("Email service failed. Please try again later.");
  }
}
