import User from '../../../models/User.js';
import PromoCode from '../../../models/PromoCode.js';
import { sendEmail, FROM_ADDRESS } from '../../../common/utils/unosend.js';
import env from '../../../config/env.js';

/**
 * POST /api/admin/email-users
 * Send a custom email to all users or a specific set of users.
 *
 * Body:
 *   target      "all" | "individual"
 *   userIds     string[]   (required when target === "individual")
 *   subject     string     (required)
 *   message     string     (required)
 *   promoCode   string     (optional — code string, looked up for details)
 */
export const emailUsers = async (req, res) => {
  try {
    const { target, userIds, subject, message, promoCode } = req.body;

    if (!subject?.trim()) return res.status(400).json({ error: 'Subject is required.' });
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required.' });
    if (!['all', 'individual'].includes(target))
      return res.status(400).json({ error: 'target must be "all" or "individual".' });

    // Resolve recipients
    let recipients = [];
    if (target === 'all') {
      recipients = await User.find({ role: { $ne: 'admin' } }).select('email username');
    } else {
      if (!Array.isArray(userIds) || userIds.length === 0)
        return res.status(400).json({ error: 'userIds is required when target is "individual".' });
      recipients = await User.find({ _id: { $in: userIds } }).select('email username');
    }

    if (recipients.length === 0)
      return res.status(404).json({ error: 'No recipients found.' });

    // Optionally look up the promo code for display details
    let promoDetails = null;
    if (promoCode?.trim()) {
      promoDetails = await PromoCode.findOne({
        code: promoCode.trim().toUpperCase(),
        isActive: true,
      });
    }

    const promoBlock = promoDetails
      ? `
        <div style="margin:24px 0;padding:20px 24px;background:#f9f0ff;border-left:4px solid #a855f7;border-radius:8px;">
          <p style="margin:0 0 6px;font-size:13px;color:#7e22ce;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Exclusive Promo Code</p>
          <p style="margin:0;font-size:28px;font-weight:700;letter-spacing:.15em;color:#111;">${promoDetails.code}</p>
          <p style="margin:6px 0 0;font-size:13px;color:#555;">
            Grants <strong>${promoDetails.durationDays} day${promoDetails.durationDays !== 1 ? 's' : ''}</strong> of promotion.
            Valid for the next available redemption.
          </p>
        </div>
      `
      : '';

    // Send emails (fire all in parallel, collect results)
    const results = await Promise.allSettled(
      recipients.map((user) =>
        sendEmail({
          from: FROM_ADDRESS,
          to: user.email,
          subject: subject.trim(),
          html: buildEmailHtml({ username: user.username, message: message.trim(), promoBlock }),
        }),
      ),
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    res.status(200).json({
      success: true,
      sent,
      failed,
      total: recipients.length,
    });
  } catch (err) {
    console.error('emailUsers error:', err);
    res.status(500).json({ error: 'Server error while sending emails.' });
  }
};

function buildEmailHtml({ username, message, promoBlock }) {
  const paragraphs = message
    .split('\n')
    .filter(Boolean)
    .map((line) => `<p style="margin:0 0 12px;line-height:1.7;color:#333;">${line}</p>`)
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111;">
      <div style="background:#111;padding:28px 32px;border-radius:12px 12px 0 0;">
        <h1 style="margin:0;font-size:20px;color:#fff;font-weight:700;letter-spacing:-.3px;">
          Mystery Mansion
        </h1>
      </div>
      <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
        <p style="margin:0 0 20px;font-size:15px;color:#555;">Hi ${username || 'there'},</p>
        ${paragraphs}
        ${promoBlock}
        <div style="margin-top:28px;">
          <a
            href="${env.CLIENT_URL || 'https://mysterymansion.app'}/home"
            style="display:inline-block;background:#111;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;"
          >
            Visit Mystery Mansion
          </a>
        </div>
        <hr style="margin:28px 0;border:none;border-top:1px solid #e5e7eb;" />
        <p style="margin:0;font-size:11px;color:#9ca3af;">
          © ${new Date().getFullYear()} Mystery Mansion. You are receiving this because you have an account on our platform.
        </p>
      </div>
    </div>
  `;
}
