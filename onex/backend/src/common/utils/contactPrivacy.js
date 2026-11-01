// Contact details are never sent to the browser in full on public surfaces —
// only masked previews. Signed-in members fetch the real values on demand via
// GET /api/users/contact/:userId.

const MASKED_EMAIL_TAIL = '*********';

/** "7205551234" / "+1 (720) 555-1234" → "720-***-****" */
export const maskPhone = (value) => {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  if (digits.length < 3) return '';
  return `${digits.slice(0, 3)}-***-****`;
};

/** "theodore@example.com" → "the*********" (fixed tail so length isn't leaked) */
export const maskEmail = (value) => {
  const email = String(value || '').trim();
  const local = email.split('@')[0] || '';
  if (!email.includes('@') || !local) return '';
  const visible = local.length > 3 ? local.slice(0, 3) : local.slice(0, 1);
  return `${visible}${MASKED_EMAIL_TAIL}`;
};

/**
 * Replaces `phoneNumber` / `email` on a plain user object with
 * `phoneMasked` / `emailMasked`. Returns the same object for chaining.
 */
export const applyContactMask = (user) => {
  if (!user || typeof user !== 'object') return user;
  const phoneMasked = maskPhone(user.phoneNumber);
  const emailMasked = maskEmail(user.email);
  delete user.phoneNumber;
  delete user.email;
  user.phoneMasked = phoneMasked;
  user.emailMasked = emailMasked;
  return user;
};
