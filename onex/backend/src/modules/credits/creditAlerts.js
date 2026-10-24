import Notification from '../../models/Notification.js';
import { createNotification } from '../notifications/notificationController.js';

export const LOW_CREDITS_THRESHOLD = 250;
const LOW_CREDITS_COOLDOWN_MS = 24 * 60 * 60 * 1000;

/**
 * Warns a user when their balance is under the threshold, at most once per cooldown so
 * every spend does not produce another alert. Never throws.
 */
export async function notifyIfLowCredits(userId, balance) {
  try {
    if (!userId || !Number.isFinite(balance) || balance >= LOW_CREDITS_THRESHOLD) return false;

    const recent = await Notification.exists({
      audience: 'user',
      userId,
      type: 'low_credits',
      createdAt: { $gt: new Date(Date.now() - LOW_CREDITS_COOLDOWN_MS) },
    });
    if (recent) return false;

    await createNotification({
      audience: 'user',
      type: 'low_credits',
      title: 'Your credits are running low',
      message: `You have ${balance} credits left, under ${LOW_CREDITS_THRESHOLD}. Top up to keep using credit features.`,
      userId,
      meta: { credits: balance, threshold: LOW_CREDITS_THRESHOLD },
    });
    return true;
  } catch (err) {
    console.error('❌ notifyIfLowCredits failed:', err.message);
    return false;
  }
}
