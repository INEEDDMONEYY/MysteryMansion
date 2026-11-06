/**
 * Test script — sends emails through the configured provider (Cloudflare primary).
 * All test emails default to the verified test inbox unless an address is given.
 *
 * Usage:
 *   node scripts/testEmail.js [email] [type]
 *   node scripts/testEmail.js                             # welcome-provider → test inbox
 *   node scripts/testEmail.js someonetothinkabout@gmail.com milestone
 *   node scripts/testEmail.js all                         # sends every type to the test inbox
 *   node scripts/testEmail.js milestone --mailgun         # send through the Mailgun backup only
 *   node scripts/testEmail.js welcome-provider --cloudflare # Cloudflare only
 *
 * Types:
 *   welcome-provider | welcome-client | verify | reset | deletion | update
 *   message
 *   account-activity-like | account-activity-comment | account-activity-review | account-inactivity
 *   milestone | milestones-added
 *   membership-activated | membership-upgraded | membership-renewed
 *   membership-renewal-failed | membership-expiring | membership-expired | membership-autorenew-off
 *   promo-purchased | promo-badge-renewed | promo-badge-cancelled
 *   promo-badge-removed | promo-badge-expired | promo-expiring
 *   flag-submitted | flag-update | flag-reported-post | flag-reported-account
 *   contact-inquiry
 *   forum-digest
 *   all
 */

import 'dotenv/config';
import sendWelcomeEmail from '../src/common/utils/sendWelcomeEmail.js';
import sendResetEmail from '../src/common/utils/sendResetEmail.js';
import { sendAccountDeletionEmail } from '../src/common/utils/sendAccountDeletionEmail.js';
import { sendPlatformUpdateEmail } from '../src/common/utils/sendPlatformUpdateEmail.js';
import { sendVerificationCodeEmail } from '../src/common/services/emailService.js';
import { sendAccountActivityEmail, sendAccountInactivityEmail } from '../src/common/utils/sendAccountActivityEmail.js';
import { sendMilestoneAchievedEmail, sendMilestonesAddedEmail } from '../src/common/utils/sendMilestoneAchievedEmail.js';
import { sendNewMessageEmail } from '../src/common/utils/sendNewMessageEmail.js';
import { sendMembershipEmail } from '../src/common/utils/sendMembershipEmail.js';
import { sendPromotionEmail } from '../src/common/utils/sendPromotionEmail.js';
import {
  sendFlagSubmittedEmail,
  sendFlagStatusUpdateEmail,
  sendAccountFlaggedEmail,
} from '../src/common/utils/sendAccountFlagEmail.js';
import { sendContactInquiryEmail } from '../src/common/utils/sendContactInquiryEmail.js';
import { sendForumDigestEmail } from '../src/modules/forum/forumDigest.js';

// All test emails go to the verified test inbox by default.
const TEST_INBOX = 'someonetothinkabout@gmail.com';

const cliArgs = process.argv.slice(2);
if (cliArgs.includes('--mailgun')) process.env.EMAIL_FORCE_PROVIDER = 'mailgun';
if (cliArgs.includes('--cloudflare')) process.env.EMAIL_FORCE_PROVIDER = 'cloudflare';
let [arg1, arg2] = cliArgs.filter((a) => !['--mailgun', '--cloudflare'].includes(a));

// Allow `node scripts/testEmail.js milestone` (type only) or `node scripts/testEmail.js all`.
let to = TEST_INBOX;
let type = 'welcome-provider';
if (arg1 && arg1.includes('@')) {
  to = arg1;
  type = arg2 || 'welcome-provider';
} else if (arg1) {
  type = arg1;
}

const SENDERS = {
  'forum-digest': () => sendForumDigestEmail({
    to, username: 'TestMember', frequency: 'weekly', settingsPath: '/user/settings',
    items: [{ id: '000000000000000000000000', title: 'Example discussion (test email)', newDiscussion: true, replyCount: 3 }],
  }),
  'welcome-provider': () => sendWelcomeEmail({ to, username: 'TestProvider', accountType: 'provider' }),
  'welcome-client': () => sendWelcomeEmail({ to, username: 'TestClient', accountType: 'client' }),
  verify: () => sendVerificationCodeEmail({ to, code: '482917' }),
  reset: () => sendResetEmail({ to, username: 'TestUser', resetUrl: 'https://topescortnetwork.com/reset?token=test123' }),
  deletion: () => sendAccountDeletionEmail({ to, username: 'TestUser' }),
  update: () =>
    sendPlatformUpdateEmail({
      recipients: [{ email: to, name: 'TestUser' }],
      subject: 'Test Platform Update',
      updateTitle: 'Test Update',
      updateBody: '<p style="color:#c8c8c8;">This is a test platform update email.</p>',
    }),

  // ── Messages ──────────────────────────────────────────────────────────────
  message: () =>
    sendNewMessageEmail({
      to,
      recipientUsername: 'TestProvider',
      senderUsername: 'TestFan',
      messageText: 'Hey! I saw your profile and would love to chat about a booking.',
      ctaUrl: 'https://topescortnetwork.com/user/messages?conv=test123',
    }),

  // ── Account engagement ────────────────────────────────────────────────────
  'account-activity-like': () =>
    sendAccountActivityEmail({
      to,
      username: 'TestProvider',
      type: 'post_liked',
      message: 'TestFan liked your post.',
      ctaUrl: 'https://topescortnetwork.com/posts/test123',
    }),
  'account-activity-comment': () =>
    sendAccountActivityEmail({
      to,
      username: 'TestProvider',
      type: 'new_comment',
      message: 'TestFan commented on your post: "Looking great!"',
      ctaUrl: 'https://topescortnetwork.com/posts/test123',
    }),
  'account-activity-review': () =>
    sendAccountActivityEmail({
      to,
      username: 'TestProvider',
      type: 'new_review',
      message: 'TestFan left you a review: "Amazing experience, highly recommend!"',
      ctaUrl: 'https://topescortnetwork.com/user/test123',
    }),
  'account-inactivity': () => sendAccountInactivityEmail({ to, username: 'TestProvider', days: 30 }),

  // ── Milestones ────────────────────────────────────────────────────────────
  milestone: () =>
    sendMilestoneAchievedEmail({
      to,
      username: 'TestProvider',
      milestoneTitle: 'Stay Active',
      milestoneDescription: 'Publish at least 3 posts to stay visible on the platform.',
    }),
  'milestones-added': () =>
    sendMilestonesAddedEmail({
      to,
      username: 'TestProvider',
      milestones: [
        { title: 'First Impressions', description: 'Complete your profile with a photo and bio.' },
        { title: 'Conversation Starter', description: 'Reply to 5 messages from clients.' },
      ],
    }),

  // ── Membership ────────────────────────────────────────────────────────────
  'membership-activated': () =>
    sendMembershipEmail({
      to,
      username: 'TestProvider',
      event: 'activated',
      tierName: 'Premium Plan',
      detail: '2400 coins were charged. Your next renewal is 12/1/2026.',
    }),
  'membership-upgraded': () =>
    sendMembershipEmail({
      to,
      username: 'TestProvider',
      event: 'upgraded',
      tierName: 'Elite Plan',
      detail: '600 coins were charged for the upgrade. New perks are active now.',
    }),
  'membership-renewed': () =>
    sendMembershipEmail({
      to,
      username: 'TestProvider',
      event: 'renewed',
      tierName: 'Premium Plan',
      detail: '2400 coins were charged. Next renewal 12/1/2026.',
    }),
  'membership-renewal-failed': () =>
    sendMembershipEmail({
      to,
      username: 'TestProvider',
      event: 'renewal_failed',
      tierName: 'Premium Plan',
      detail: 'You need 2400 coins. Add coins before 11/3/2026, 6:00 PM or your membership will expire.',
    }),
  'membership-expiring': () =>
    sendMembershipEmail({
      to,
      username: 'TestProvider',
      event: 'expiring_soon',
      tierName: 'Premium Plan',
      detail: 'Your membership ends on 11/8/2026 (7 days left) and will not renew. Turn auto-renew back on to keep your perks.',
    }),
  'membership-expired': () =>
    sendMembershipEmail({ to, username: 'TestProvider', event: 'expired', tierName: 'Premium Plan' }),
  'membership-autorenew-off': () =>
    sendMembershipEmail({
      to,
      username: 'TestProvider',
      event: 'autorenew_off',
      tierName: 'Premium Plan',
      detail: 'Your perks stay active until 12/1/2026.',
    }),

  // ── Promotional ───────────────────────────────────────────────────────────
  'promo-purchased': () =>
    sendPromotionEmail({
      to,
      username: 'TestProvider',
      event: 'purchased',
      tierLabel: '7-Day Promotion',
      detail: '500 credits used. Your promotion is active until 11/8/2026.',
    }),
  'promo-badge-renewed': () =>
    sendPromotionEmail({
      to,
      username: 'TestProvider',
      event: 'badge_renewed',
      tierLabel: 'Blue Badge',
      detail: '300 credits were deducted. Next renewal 12/1/2026.',
    }),
  'promo-badge-cancelled': () =>
    sendPromotionEmail({
      to,
      username: 'TestProvider',
      event: 'badge_cancelled',
      tierLabel: 'Blue Badge',
      detail: 'Your badge stays active until 12/1/2026.',
    }),
  'promo-badge-removed': () =>
    sendPromotionEmail({ to, username: 'TestProvider', event: 'badge_removed', tierLabel: 'Blue Badge' }),
  'promo-badge-expired': () =>
    sendPromotionEmail({ to, username: 'TestProvider', event: 'badge_expired', tierLabel: 'Blue Badge' }),
  'promo-expiring': () =>
    sendPromotionEmail({
      to,
      username: 'TestProvider',
      event: 'expiring_soon',
      detail: 'Your promoted account status expires on 11/2/2026, 6:00 PM.',
    }),

  // ── Account flagging ──────────────────────────────────────────────────────
  'flag-submitted': () => sendFlagSubmittedEmail({ to, username: 'TestReporter', targetType: 'post' }),
  'flag-update': () =>
    sendFlagStatusUpdateEmail({
      to,
      username: 'TestReporter',
      statusLabel: 'Action taken',
      message: 'We reviewed the reported content and removed it for violating our guidelines.',
    }),
  'flag-reported-post': () => sendAccountFlaggedEmail({ to, username: 'TestProvider', targetType: 'post' }),
  'flag-reported-account': () => sendAccountFlaggedEmail({ to, username: 'TestProvider', targetType: 'user' }),

  // ── Contact form ──────────────────────────────────────────────────────────
  'contact-inquiry': () =>
    sendContactInquiryEmail({
      to,
      inquiry: {
        name: 'Test Sender',
        email: 'sender@example.com',
        topic: 'Report a Bug',
        subject: 'Location page not loading',
        message: 'When I open the Denver page the listings take a long time to appear.',
      },
    }),
};

const sendOne = async (name) => {
  console.log(`📧  Sending [${name}] email to: ${to}`);
  await SENDERS[name]();
  console.log(`✅  [${name}] sent successfully!`);
};

try {
  if (type === 'all') {
    for (const name of Object.keys(SENDERS)) {
      await sendOne(name);
    }
  } else if (SENDERS[type]) {
    await sendOne(type);
  } else {
    console.error(`❌  Unknown type: ${type}`);
    console.error(`    Valid types: ${Object.keys(SENDERS).join(', ')}, all`);
    process.exit(1);
  }
} catch (err) {
  console.error('❌  Failed:', err.message);
  process.exit(1);
}
process.exit(0);
