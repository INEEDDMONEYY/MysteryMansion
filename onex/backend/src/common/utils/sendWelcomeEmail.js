import { sendEmail, FROM_ADDRESS } from './unosend.js';
import env from '../../config/env.js';
import { buildEmail, ctaButton, darkCard, heading, divider } from './emailTemplate.js';

async function sendWelcomeEmail({ to, username, accountType = 'provider' }) {
  if (!to) throw new Error("Missing required email parameter: 'to'");

  const name = username || 'there';
  const isClient = accountType === 'client';

  const providerContent = `
    ${heading(`Welcome to Mystery Mansion, ${name}!`)}
    <p style="margin:0 0 6px;color:#aaa;font-size:14px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Provider Account</p>
    <p style="margin:0 0 20px;color:#c8c8c8;">Your provider account is active. Start building your presence and getting discovered today — posting is completely free.</p>
    ${darkCard(`
      <p style="margin:0 0 12px;color:#ffffff;font-weight:700;font-size:15px;">Getting started</p>
      <ul style="margin:0;padding:0 0 0 18px;color:#b0b0b0;line-height:2;">
        <li>Complete your profile &mdash; photo, bio, age &amp; location</li>
        <li>Create your first post to start getting visibility</li>
        <li>Set your availability and pricing in your dashboard</li>
        <li>Keep your listing fresh with regular updates</li>
      </ul>
    `)}
    <p style="color:#888;font-size:13px;">The platform is actively monitored for safety. If you ever need help, support is always available.</p>
    ${ctaButton('Go to Your Dashboard', `${env.CLIENT_URL}/user/dashboard`)}
  `;

  const clientContent = `
    ${heading(`Welcome to Mystery Mansion, ${name}!`)}
    <p style="margin:0 0 6px;color:#aaa;font-size:14px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Client Account</p>
    <p style="margin:0 0 20px;color:#c8c8c8;">Your client account is ready. Discover top providers, save your favourites, and be part of the community.</p>
    ${darkCard(`
      <p style="margin:0 0 12px;color:#ffffff;font-weight:700;font-size:15px;">What you can do</p>
      <ul style="margin:0;padding:0 0 0 18px;color:#b0b0b0;line-height:2;">
        <li>Browse &amp; filter provider listings</li>
        <li>Like providers you love and revisit them anytime</li>
        <li>Leave reviews to help the community</li>
        <li>Message providers directly from the platform</li>
      </ul>
    `)}
    ${darkCard(`
      <p style="margin:0 0 8px;color:#d5197e;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Coming Soon &mdash; Platform Currency</p>
      <p style="margin:0;color:#b0b0b0;font-size:14px;line-height:1.6;">We&rsquo;re building an in-platform currency system that will unlock premium interactions, exclusive features, and special perks. Stay tuned &mdash; you&rsquo;ll be the first to know.</p>
    `, { borderColor: '#7c3aed' })}
    ${ctaButton('Browse Listings', `${env.CLIENT_URL}/home`)}
  `;

  await sendEmail({
    from: FROM_ADDRESS,
    to,
    subject: isClient
      ? 'Welcome to Mystery Mansion — Your Client Account is Ready'
      : 'Welcome to Mystery Mansion — Your Provider Account is Active',
    html: buildEmail(isClient ? clientContent : providerContent, { showHero: true }),
  });
}

export default sendWelcomeEmail;
