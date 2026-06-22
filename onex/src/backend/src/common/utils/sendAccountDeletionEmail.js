import { sendEmail, FROM_ADDRESS } from './unosend.js';

/**
 * Sends an account deletion email to a user with reason and appeal instructions
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.username - Username for personalization
 * @param {string} params.reason - Reason for deletion
 */
export async function sendAccountDeletionEmail({ to, username, reason }) {
  if (!to || !reason) {
    throw new Error("Missing required email parameters: 'to' or 'reason'");
  }

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
      </div>
    `,
  });
}

