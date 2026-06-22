/**
 * Test script — sends a test email via Unosend.
 * Usage: node scripts/testEmail.js your@email.com
 *
 * Make sure UNOSEND_API_KEY is set in your .env file first.
 */

import 'dotenv/config';
import { sendEmail, FROM_ADDRESS } from '../src/common/utils/unosend.js';

const to = process.argv[2];

if (!to) {
  console.error('❌  Usage: node scripts/testEmail.js your@email.com');
  process.exit(1);
}

console.log(`📧  Sending test email to: ${to}`);
console.log(`    From: ${FROM_ADDRESS}`);

try {
  const result = await sendEmail({
    to,
    subject: '✅ Mystery Mansion — Email Test',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#be185d">Mystery Mansion</h2>
        <p>Your Unosend integration is working correctly! 🎉</p>
        <p style="color:#6b7280;font-size:14px">
          Sent at: ${new Date().toISOString()}
        </p>
      </div>
    `,
  });

  console.log('✅  Email sent successfully!');
  console.log('    Response:', JSON.stringify(result, null, 2));
} catch (err) {
  console.error('❌  Failed to send email:', err.message);
  process.exit(1);
}
