import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import EmailVerification from '../../../models/EmailVerification.js';
import User from '../../../models/User.js';
import env from '../../../config/env.js';
import { sendVerificationCodeEmail } from '../../../common/services/emailService.js';

const MAX_SENDS_PER_WINDOW = 3;       // max 3 sends per 60-minute window
const WINDOW_MS             = 60 * 60 * 1000;  // 60 minutes
const RESEND_COOLDOWN_MS    = 60 * 1000;       // 60-second resend cooldown
const CODE_TTL_MS           = 10 * 60 * 1000;  // code valid for 10 minutes
const MAX_ATTEMPTS          = 5;               // burn code after 5 wrong guesses

function generateCode() {
  return String(crypto.randomInt(100000, 999999));
}

// ── POST /api/auth/email-verify/send ──────────────────────────────────────────
export async function sendVerificationCode(req, res) {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    // Block emails already registered
    const existing = await User.findOne({ email }).select('_id').lean();
    if (existing) {
      return res.status(409).json({ error: 'This email is already registered. Please sign in.' });
    }

    const now = new Date();
    let record = await EmailVerification.findOne({ email });

    if (record) {
      // ── Rate limit: 60-second resend cooldown ──────────────────────────
      const secsSinceLastSend = (now - record.lastSentAt) / 1000;
      if (secsSinceLastSend < 60) {
        const waitSecs = Math.ceil(60 - secsSinceLastSend);
        return res.status(429).json({
          error: `Please wait ${waitSecs} second${waitSecs !== 1 ? 's' : ''} before requesting a new code.`,
          retryAfterSeconds: waitSecs,
        });
      }

      // ── Rate limit: max 3 sends per 60-minute window ───────────────────
      const windowExpired = (now - record.windowStart) > WINDOW_MS;
      if (!windowExpired && record.sendCount >= MAX_SENDS_PER_WINDOW) {
        const windowResetMs = WINDOW_MS - (now - record.windowStart);
        const waitMins = Math.ceil(windowResetMs / 60000);
        return res.status(429).json({
          error: `Too many verification attempts. Please try again in ${waitMins} minute${waitMins !== 1 ? 's' : ''}.`,
          retryAfterMinutes: waitMins,
        });
      }
    }

    // Generate and hash the code
    const code     = generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(now.getTime() + CODE_TTL_MS);

    if (record) {
      const windowExpired = (now - record.windowStart) > WINDOW_MS;
      record.codeHash    = codeHash;
      record.expiresAt   = expiresAt;
      record.lastSentAt  = now;
      record.attempts    = 0;
      record.verified    = false;
      record.sendCount   = windowExpired ? 1 : record.sendCount + 1;
      if (windowExpired) record.windowStart = now;
      await record.save();
    } else {
      await EmailVerification.create({ email, codeHash, expiresAt });
    }

    await sendVerificationCodeEmail({ to: email, code });

    return res.json({
      message: 'Verification code sent. Check your inbox.',
      expiresInSeconds: CODE_TTL_MS / 1000,
    });
  } catch (err) {
    console.error('[EmailVerify] send error:', err.message);
    return res.status(500).json({ error: 'Failed to send verification code.' });
  }
}

// ── POST /api/auth/email-verify/confirm ───────────────────────────────────────
export async function confirmVerificationCode(req, res) {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const code  = String(req.body.code || '').trim();

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required.' });
    }

    const record = await EmailVerification.findOne({ email });

    if (!record) {
      return res.status(400).json({ error: 'No verification code found. Please request a new one.' });
    }

    if (record.verified) {
      return res.status(400).json({ error: 'This code has already been used.' });
    }

    if (new Date() > record.expiresAt) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      return res.status(400).json({ error: 'Too many incorrect attempts. Please request a new code.' });
    }

    const match = await bcrypt.compare(code, record.codeHash);
    if (!match) {
      record.attempts += 1;
      await record.save();
      const remaining = MAX_ATTEMPTS - record.attempts;
      return res.status(400).json({
        error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
      });
    }

    // Mark verified and issue a short-lived signed token
    record.verified = true;
    await record.save();

    const verificationToken = jwt.sign(
      { email, purpose: 'email-verify' },
      env.JWT_SECRET,
      { expiresIn: '15m' },
    );

    return res.json({
      message: 'Email verified successfully.',
      verificationToken,
      email,
    });
  } catch (err) {
    console.error('[EmailVerify] confirm error:', err.message);
    return res.status(500).json({ error: 'Failed to confirm verification code.' });
  }
}
