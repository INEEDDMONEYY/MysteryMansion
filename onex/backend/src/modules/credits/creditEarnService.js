import User from '../../models/User.js';
import CreditEarnRule from '../../models/CreditEarnRule.js';
import CreditTransaction from '../../models/CreditTransaction.js';
import { createNotification } from '../notifications/notificationController.js';
import Notification from '../../models/Notification.js';

/**
 * Built-in earn events. To add a new one:
 *   1. add an entry here (it is seeded on the next server start, switched OFF),
 *   2. call awardCredits({ userId, eventKey: '<key>', refId: '<unique id>' }) where it happens
 *      and add the key to HOOKED_KEYS,
 *   3. turn it on and tune it in Admin > Earn Rules.
 * One-off or contest-style rewards need no code: create a manual rule in the admin page.
 */
export const EVENT_DEFINITIONS = [
  { key: 'daily_login', label: 'Daily login', description: 'Sign in once per day.', credits: 5, roles: ['provider', 'client'], limitPerDay: 1, notify: false },
  { key: 'create_post', label: 'Publish a post', description: 'Create a new post.', credits: 10, roles: ['provider'], limitPerDay: 3 },
  { key: 'thread_post', label: 'Start a forum thread', description: 'Start a new discussion thread in the forum.', credits: 5, roles: ['provider', 'client'], limitPerDay: 3 },
  { key: 'thread_reply', label: 'Reply in a forum thread', description: 'Reply to a forum thread.', credits: 2, roles: ['provider', 'client'], limitPerDay: 10 },
  { key: 'comment_post', label: 'Comment on a post', description: "Comment on someone else's post.", credits: 1, roles: ['provider', 'client'], limitPerDay: 5 },
  { key: 'leave_review', label: 'Leave a review', description: 'Write a review for another member.', credits: 10, roles: ['provider', 'client'], limitPerDay: 3 },
  { key: 'receive_review', label: 'Receive a review', description: 'Another member reviews you.', credits: 5, roles: ['provider'], limitPerDay: 5 },
  { key: 'referral_signup', label: 'Referral signs up', description: 'Someone creates an account with your referral link.', credits: 25, roles: ['provider'], limitPerDay: 0 },
  { key: 'post_twice', label: 'Publish a post twice', description: 'Post twice times a day', credits: 25, roles: ['provider'], limitPerDay: 2 },
  { key: 'promote_account', label: 'Promote account', description: 'Promote your account.', credits: 40, roles: ['provider'], limitPerDay: 1 },
  
];

// Events that application code currently triggers.
export const HOOKED_KEYS = new Set([
  'daily_login',
  'create_post',
  'thread_post',
  'thread_reply',
  'comment_post',
  'leave_review',
  'receive_review',
  'referral_signup',
  'post_twice',
  'promote_account',
]);

// Daily earn limits reset at midnight Mountain time (MDT in summer), wherever the member is.
const EARN_TIME_ZONE = 'America/Denver';

const mountainDateParts = (date) =>
  Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: EARN_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map((p) => [p.type, Number(p.value)])
  );

/** The Mountain-time calendar date, e.g. "2026-10-28". */
export const dayKey = (date = new Date()) => {
  const { year, month, day } = mountainDateParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

/** The UTC instant at which the current Mountain-time day began. */
const startOfEarnDay = (date = new Date()) => {
  const { year, month, day } = mountainDateParts(date);
  const guess = new Date(Date.UTC(year, month - 1, day));
  const shown = mountainDateParts(guess);
  const shownAsUtc = Date.UTC(shown.year, shown.month - 1, shown.day, shown.hour, shown.minute, shown.second);
  return new Date(guess.getTime() - (shownAsUtc - guess.getTime()));
};

export const effectiveRole = (user) =>
  user?.role === 'admin' ? 'admin' : user?.accountType || 'provider';

const skipped = (reason) => ({ awarded: false, reason });

export async function seedDefaultEarnRules() {
  try {
    await Promise.all(
      EVENT_DEFINITIONS.map((def, index) =>
        CreditEarnRule.updateOne(
          { key: def.key },
          {
            $setOnInsert: {
              ...def,
              isSystem: true,
              isActive: false,
              trigger: 'automatic',
              sortOrder: index,
            },
          },
          { upsert: true }
        )
      )
    );
  } catch (err) {
    console.error('❌ Failed to seed earn rules:', err.message);
  }
}

/**
 * Pays out an earn rule. Never throws, so callers can fire-and-forget it without
 * risking the request they are attached to.
 * force=true skips the active/role/limit checks (admin grants).
 */
export async function awardCredits({
  userId,
  eventKey,
  refId = '',
  meta = {},
  force = false,
  amount = null,
  source = 'earn',
  grantedBy = null,
  note = '',
}) {
  try {
    if (!userId || !eventKey) return skipped('invalid');

    const rule = await CreditEarnRule.findOne({ key: eventKey }).lean();
    if (!rule) return skipped('unknown_rule');
    if (!force && !rule.isActive) return skipped('inactive');

    const user = await User.findById(userId).select('role accountType status').lean();
    if (!user) return skipped('no_user');
    if (user.status === 'suspended') return skipped('suspended');

    if (!force) {
      const eligible = user.role === 'admin' || rule.roles.includes(effectiveRole(user));
      if (!eligible) return skipped('role');

      if (rule.lifetimeLimit > 0) {
        const total = await CreditTransaction.countDocuments({ userId, ruleKey: eventKey });
        if (total >= rule.lifetimeLimit) return skipped('lifetime_limit');
      }
      if (rule.limitPerDay > 0) {
        const today = await CreditTransaction.countDocuments({
          userId,
          ruleKey: eventKey,
          createdAt: { $gte: startOfEarnDay() },
        });
        if (today >= rule.limitPerDay) return skipped('daily_limit');
      }
    }

    const payout = Number.isInteger(amount) && amount > 0 ? amount : rule.credits;

    let tx;
    try {
      tx = await CreditTransaction.create({
        userId,
        ruleKey: eventKey,
        amount: payout,
        refId: String(refId || ''),
        source,
        grantedBy,
        note,
        meta,
      });
    } catch (err) {
      if (err?.code === 11000) return skipped('duplicate');
      throw err;
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $inc: { credits: payout } },
      { new: true }
    ).select('credits');

    if (!updated) {
      await CreditTransaction.deleteOne({ _id: tx._id });
      return skipped('no_user');
    }

    await CreditTransaction.updateOne({ _id: tx._id }, { balanceAfter: updated.credits });

    if (rule.notify || source === 'admin_grant') {
      createNotification({
        audience: 'user',
        type: 'credits_earned',
        title: `+${payout} credits`,
        message: `You earned ${payout} credits: ${rule.label}.`,
        userId,
        meta: { ruleKey: eventKey, amount: payout },
      }).catch(() => {});
    }

    return { awarded: true, amount: payout, balance: updated.credits };
  } catch (err) {
    console.error(`❌ awardCredits(${eventKey}) failed:`, err.message);
    return skipped('error');
  }
}

/**
 * Tells every eligible member that a rule is now live. Call when a rule is created active
 * or switched on. Never throws.
 */
export async function announceEarnRule(rule) {
  try {
    const accountTypes = (rule.roles || []).filter((r) => r !== 'admin');
    if (accountTypes.length === 0) return 0;

    // Legacy accounts have no stored accountType and count as providers.
    const typeFilter = [{ accountType: { $in: accountTypes } }];
    if (accountTypes.includes('provider')) typeFilter.push({ accountType: { $exists: false } });

    const users = await User.find({ role: 'user', status: 'active', $or: typeFilter })
      .select('_id')
      .lean();
    if (users.length === 0) return 0;

    const limit = rule.limitPerDay > 0 ? ` (up to ${rule.limitPerDay}/day)` : '';
    await Notification.insertMany(
      users.map((u) => ({
        audience: 'user',
        type: 'earn_rule_added',
        title: 'New way to earn credits',
        message: `${rule.label}: earn ${rule.credits} credits${limit}.`,
        userId: u._id,
        meta: { ruleKey: rule.key, credits: rule.credits },
      }))
    );
    return users.length;
  } catch (err) {
    console.error('❌ announceEarnRule failed:', err.message);
    return 0;
  }
}

/** Active rules the user can earn from, with today's and lifetime progress. */
export async function getEarnOverview(user) {
  const role = effectiveRole(user);
  const filter = { isActive: true };
  if (user.role !== 'admin') filter.roles = role;

  const [rules, usage] = await Promise.all([
    CreditEarnRule.find(filter).sort({ sortOrder: 1, createdAt: 1 }).lean(),
    CreditTransaction.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$ruleKey',
          total: { $sum: 1 },
          today: { $sum: { $cond: [{ $gte: ['$createdAt', startOfEarnDay()] }, 1, 0] } },
        },
      },
    ]),
  ]);

  const usageByKey = new Map(usage.map((u) => [u._id, u]));

  return rules.map((rule) => {
    const used = usageByKey.get(rule.key) || { total: 0, today: 0 };
    const doneForever = rule.lifetimeLimit > 0 && used.total >= rule.lifetimeLimit;
    const doneToday = rule.limitPerDay > 0 && used.today >= rule.limitPerDay;

    return {
      key: rule.key,
      label: rule.label,
      description: rule.description,
      credits: rule.credits,
      limitPerDay: rule.limitPerDay,
      lifetimeLimit: rule.lifetimeLimit,
      trigger: rule.trigger,
      earnedToday: used.today,
      earnedTotal: used.total,
      available: !doneForever && !doneToday,
    };
  });
}
