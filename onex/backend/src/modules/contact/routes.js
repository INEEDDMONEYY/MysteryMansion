import express from 'express';
import ContactInquiry, { CONTACT_TOPICS } from '../../models/ContactInquiry.js';
import { optionalAuthMiddleware } from '../../common/middleware/authMiddleware.js';
import { allowEmail } from '../../common/utils/emailRateLimiter.js';
import { sendContactInquiryEmail } from '../../common/utils/sendContactInquiryEmail.js';

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HOUR_MS = 60 * 60 * 1000;

const LIMITS = {
  name: 100,
  email: 254,
  subject: 150,
  message: 5000,
};

const clientIp = (req) =>
  String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
  req.ip ||
  'unknown';

const text = (value) => (typeof value === 'string' ? value.trim() : '');

// POST /api/contact — public contact form submission.
router.post('/', optionalAuthMiddleware, async (req, res) => {
  try {
    const body = req.body || {};

    // Honeypot: real visitors never see or fill this field.
    if (text(body.website)) {
      return res.status(201).json({ success: true });
    }

    const inquiry = {
      name: text(body.name),
      email: text(body.email).toLowerCase(),
      topic: text(body.topic),
      subject: text(body.subject),
      message: text(body.message),
    };

    const errors = {};
    if (!inquiry.name) errors.name = 'Please enter your name.';
    if (!EMAIL_RE.test(inquiry.email)) errors.email = 'Please enter a valid email address.';
    if (!CONTACT_TOPICS.includes(inquiry.topic)) errors.topic = 'Please choose an inquiry type.';
    if (!inquiry.subject) errors.subject = 'Please enter a subject.';
    if (inquiry.message.length < 10) errors.message = 'Please enter a message of at least 10 characters.';

    for (const [field, max] of Object.entries(LIMITS)) {
      if (inquiry[field].length > max) errors[field] = `Must be ${max} characters or fewer.`;
    }

    if (Object.keys(errors).length) {
      return res.status(400).json({ error: 'Please fix the highlighted fields.', fields: errors });
    }

    // Per-IP and per-address caps, plus a global ceiling against floods.
    const allowed =
      allowEmail(`contact:ip:${clientIp(req)}`, { limit: 5, windowMs: HOUR_MS }) &&
      allowEmail(`contact:email:${inquiry.email}`, { limit: 3, windowMs: HOUR_MS }) &&
      allowEmail('contact:global', { limit: 200, windowMs: HOUR_MS });

    if (!allowed) {
      return res.status(429).json({
        error: 'Too many inquiries sent recently. Please try again later or email us directly.',
      });
    }

    const saved = await ContactInquiry.create({
      ...inquiry,
      userId: req.user?._id || null,
    });

    sendContactInquiryEmail({ inquiry: saved }).catch((err) =>
      console.error('❌ [contact] Failed to send inquiry email:', err.message)
    );

    return res.status(201).json({ success: true, id: saved._id });
  } catch (err) {
    console.error('❌ [contact] Failed to save inquiry:', err);
    return res.status(500).json({ error: 'We could not send your inquiry. Please try again.' });
  }
});

export default router;
