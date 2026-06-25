/**
 * Test script — sends redesigned emails via Unosend.
 * Usage:
 *   node scripts/testEmail.js your@email.com welcome-provider
 *   node scripts/testEmail.js your@email.com welcome-client
 *   node scripts/testEmail.js your@email.com verify
 *   node scripts/testEmail.js your@email.com reset
 *   node scripts/testEmail.js your@email.com deletion
 *   node scripts/testEmail.js your@email.com update
 */

import 'dotenv/config';
import sendWelcomeEmail from '../src/common/utils/sendWelcomeEmail.js';
import sendResetEmail from '../src/common/utils/sendResetEmail.js';
import { sendAccountDeletionEmail } from '../src/common/utils/sendAccountDeletionEmail.js';
import { sendPlatformUpdateEmail } from '../src/common/utils/sendPlatformUpdateEmail.js';
import { sendVerificationCodeEmail } from '../src/common/services/emailService.js';

const to   = process.argv[2];
const type = process.argv[3] || 'welcome-provider';

if (!to) {
  console.error('❌  Usage: node scripts/testEmail.js your@email.com [type]');
  process.exit(1);
}

console.log(`📧  Sending [${type}] email to: ${to}`);

try {
  switch (type) {
    case 'welcome-provider':
      await sendWelcomeEmail({ to, username: 'TestProvider', accountType: 'provider' });
      break;
    case 'welcome-client':
      await sendWelcomeEmail({ to, username: 'TestClient', accountType: 'client' });
      break;
    case 'verify':
      await sendVerificationCodeEmail({ to, code: '482917' });
      break;
    case 'reset':
      await sendResetEmail({ to, username: 'TestUser', resetUrl: 'https://mysterymansion.app/reset?token=test123' });
      break;
    case 'deletion':
      await sendAccountDeletionEmail({ to, username: 'TestUser' });
      break;
    case 'update':
      await sendPlatformUpdateEmail({
        recipients: [{ email: to, name: 'TestUser' }],
        subject: 'Test Platform Update',
        updateTitle: 'Test Update',
        updateBody: '<p style="color:#c8c8c8;">This is a test platform update email.</p>',
      });
      break;
    default:
      console.error(`❌  Unknown type: ${type}`);
      process.exit(1);
  }
  console.log('✅  Email sent successfully!');
} catch (err) {
  console.error('❌  Failed:', err.message);
  process.exit(1);
}
