// Unosend transactional email utility — uses native fetch (Node 18+)
import env from '../../config/env.js';
import AdminSettings from '../../models/AdminSettings.js';

const UNOSEND_API_URL = 'https://api.unosend.co/v1/emails';
export const FROM_ADDRESS = 'Mystery Mansion <no-reply@mysterymansion.app>';

/**
 * Send a transactional email via the Unosend REST API.
 * Respects the emailEnabled toggle in AdminSettings — if disabled, the email is
 * silently skipped and { skipped: true } is returned instead of throwing.
 * @param {{ from?: string, to: string|string[], subject: string, html: string }} opts
 */
export async function sendEmail({ from = FROM_ADDRESS, to, subject, html }) {
  // ── Check admin kill-switch ──────────────────────────────────────────────
  try {
    const settings = await AdminSettings.findOne().select('emailEnabled').lean();
    if (settings && settings.emailEnabled === false) {
      console.log(`[Email] Skipped (disabled by admin): "${subject}" → ${Array.isArray(to) ? to.join(', ') : to}`);
      return { skipped: true };
    }
  } catch (settingsErr) {
    // Don't block email if settings check fails — log and continue
    console.warn('[Email] Could not read emailEnabled setting:', settingsErr.message);
  }

  const apiKey = env.UNOSEND_API_KEY;
  if (!apiKey) throw new Error('UNOSEND_API_KEY is not configured');

  const response = await fetch(UNOSEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Unosend API error ${response.status}: ${body}`);
  }

  return response.json();
}
