import User from '../../models/User.js';
import Membership from '../../models/Membership.js';
import MembershipTransaction from '../../models/MembershipTransaction.js';
import ForumThread from '../../models/ForumThread.js';
import { createNotification } from '../notifications/notificationController.js';
import { notifyIfLowCredits } from '../credits/creditAlerts.js';
import { addMonth } from '../promotions/promotionService.js';
import {
  ADMIN_PERKS,
  MEMBERSHIP_GRACE_MS,
  MEMBERSHIP_TIERS,
  NO_PERKS,
  TIER_ORDER,
  serializePlan,
} from './membershipCatalog.js';

const fail = (status, error, data) => ({ ok: false, status, error, data });
const succeed = (data) => ({ ok: true, data });

const isLive = (membership, now = new Date()) =>
  Boolean(membership) &&
  (membership.status === 'active' || membership.status === 'grace') &&
  (membership.status === 'grace' ? membership.graceEndsAt > now : membership.renewsAt > now);

const log = (userId, tier, type, extra = {}) =>
  MembershipTransaction.create({ userId, tier, type, ...extra }).catch((err) =>
    console.error('❌ membership transaction log failed:', err.message)
  );

const notify = (userId, title, message, meta = {}) =>
  createNotification({ audience: 'user', type: 'membership_update', title, message, userId, meta }).catch((err) =>
    console.error('❌ membership notification failed:', err.message)
  );

const formatDate = (date) => new Date(date).toLocaleDateString('en-US');

const REMINDER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

// Tells the owner a listing or thread was boosted; meta carries the link target for the toast.
export const notifyBoostApplied = (userId, label, title, until, meta = {}) =>
  createNotification({
    audience: 'user',
    type: 'boost_applied',
    title: `${label} boosted`,
    message: `"${String(title || 'Your listing').slice(0, 80)}" is boosted until ${new Date(until).toLocaleString('en-US')}.`,
    userId,
    meta,
  }).catch((err) => console.error('❌ boost notification failed:', err.message));

// Atomically takes coins; resolves with the new balance or null if funds are short.
async function charge(userId, cost) {
  const updated = await User.findOneAndUpdate(
    { _id: userId, credits: { $gte: cost } },
    { $inc: { credits: -cost } },
    { new: true }
  ).select('credits');
  return updated ? updated.credits : null;
}

async function grantAllocation(userId, tier, amount) {
  if (amount <= 0) return null;
  const updated = await User.findByIdAndUpdate(userId, { $inc: { credits: amount } }, { new: true }).select('credits');
  if (updated) {
    await log(userId, tier, 'allocation', { amount, balanceAfter: updated.credits, note: 'Monthly coin allocation' });
  }
  return updated?.credits ?? null;
}

const refund = (userId, cost) => User.updateOne({ _id: userId }, { $inc: { credits: cost } });

/** The membership that currently grants perks, or null. */
export async function getLiveMembership(userId) {
  const membership = await Membership.findOne({ userId }).lean();
  return isLive(membership) ? membership : null;
}

/** Perks the user may use right now. Admins always get everything. */
export async function getUserPerks(user) {
  if (user?.role === 'admin') return { perks: ADMIN_PERKS, tier: null, membership: null };

  const membership = await getLiveMembership(user._id);
  if (!membership) return { perks: NO_PERKS, tier: null, membership: null };

  return { perks: MEMBERSHIP_TIERS[membership.tier].perks, tier: membership.tier, membership };
}

export async function getMembershipStatus(user) {
  const { perks, tier, membership } = await getUserPerks(user);
  const [account, history] = await Promise.all([
    User.findById(user._id).select('credits forumBorderColor').lean(),
    MembershipTransaction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  const plan = tier ? MEMBERSHIP_TIERS[tier] : null;
  const used = membership?.boostsUsed || 0;

  return {
    isAdmin: user.role === 'admin',
    active: Boolean(membership),
    tier,
    plan: plan ? serializePlan(plan) : null,
    status: membership?.status || null,
    autoRenew: membership?.autoRenew ?? null,
    startedAt: membership?.startedAt || null,
    renewsAt: membership?.renewsAt || null,
    graceEndsAt: membership?.graceEndsAt || null,
    boostsUsed: used,
    boostsRemaining: Math.max(0, perks.boostsPerMonth - used),
    perks,
    balance: account?.credits ?? 0,
    forumBorderColor: perks.forumBorderColor ? account?.forumBorderColor || '' : '',
    history: history.map((h) => ({
      id: String(h._id),
      type: h.type,
      tier: h.tier,
      amount: h.amount,
      balanceAfter: h.balanceAfter,
      note: h.note,
      createdAt: h.createdAt,
    })),
  };
}

export async function subscribe(user, tierId) {
  const tier = MEMBERSHIP_TIERS[tierId];
  if (!tier) return fail(400, 'Unknown membership plan.');
  if (user.role === 'admin') return fail(400, 'Admin accounts already have every membership perk.');

  const existing = await Membership.findOne({ userId: user._id });
  if (isLive(existing)) return fail(409, 'You already have an active membership. Use upgrade to change plans.');

  const balance = await charge(user._id, tier.monthlyCoinCost);
  if (balance === null) {
    const account = await User.findById(user._id).select('credits').lean();
    return fail(402, 'Not enough coins for this membership.', {
      required: tier.monthlyCoinCost,
      balance: account?.credits ?? 0,
    });
  }

  const now = new Date();
  const renewsAt = addMonth(now);
  const fields = {
    tier: tier.id,
    status: 'active',
    autoRenew: true,
    startedAt: now,
    currentPeriodStart: now,
    renewsAt,
    graceEndsAt: null,
    boostsUsed: 0,
  };

  try {
    if (existing) await Membership.updateOne({ _id: existing._id }, { $set: fields });
    else await Membership.create({ userId: user._id, ...fields });
  } catch (err) {
    await refund(user._id, tier.monthlyCoinCost);
    console.error('❌ subscribe failed after charge, refunded:', err.message);
    return fail(500, 'Subscription failed. Your coins were not charged.');
  }

  await log(user._id, tier.id, 'subscribe', {
    amount: -tier.monthlyCoinCost,
    balanceAfter: balance,
    note: `${tier.name} subscription`,
  });
  const finalBalance = (await grantAllocation(user._id, tier.id, tier.monthlyCoinAllocation)) ?? balance;

  notify(
    user._id,
    `${tier.name} activated`,
    `${tier.monthlyCoinCost} coins were charged. Your next renewal is ${formatDate(renewsAt)}.`,
    { tier: tier.id }
  );
  notifyIfLowCredits(user._id, finalBalance);

  return succeed({ tier: tier.id, renewsAt, balance: finalBalance });
}

// Upgrading charges only the price difference and keeps the current billing period.
export async function upgrade(user, tierId) {
  const target = MEMBERSHIP_TIERS[tierId];
  if (!target) return fail(400, 'Unknown membership plan.');

  const membership = await Membership.findOne({ userId: user._id });
  if (!isLive(membership)) return fail(409, 'You need an active membership to upgrade.');

  const current = MEMBERSHIP_TIERS[membership.tier];
  if (TIER_ORDER.indexOf(target.id) <= TIER_ORDER.indexOf(current.id)) {
    return fail(400, 'Choose a higher plan to upgrade. To downgrade, cancel and subscribe again after your period ends.');
  }

  const cost = target.monthlyCoinCost - current.monthlyCoinCost;
  const balance = await charge(user._id, cost);
  if (balance === null) {
    const account = await User.findById(user._id).select('credits').lean();
    return fail(402, 'Not enough coins to upgrade.', { required: cost, balance: account?.credits ?? 0 });
  }

  const updated = await Membership.updateOne(
    { _id: membership._id, tier: current.id },
    { $set: { tier: target.id, status: 'active', graceEndsAt: null } }
  );
  if (!updated.modifiedCount) {
    await refund(user._id, cost);
    return fail(409, 'Your membership changed while upgrading. Please try again.');
  }

  await log(user._id, target.id, 'upgrade', {
    amount: -cost,
    balanceAfter: balance,
    note: `Upgraded from ${current.id}`,
  });
  const finalBalance =
    (await grantAllocation(user._id, target.id, target.monthlyCoinAllocation - current.monthlyCoinAllocation)) ?? balance;

  notify(user._id, `Upgraded to ${target.name}`, `${cost} coins were charged for the upgrade. New perks are active now.`, {
    tier: target.id,
  });
  notifyIfLowCredits(user._id, finalBalance);

  return succeed({ tier: target.id, balance: finalBalance });
}

export async function setAutoRenew(user, autoRenew) {
  const membership = await Membership.findOne({ userId: user._id });
  if (!isLive(membership)) return fail(404, 'No active membership.');
  if (membership.status === 'grace') return fail(409, 'Renew your membership first.');

  membership.autoRenew = autoRenew;
  await membership.save();

  await log(user._id, membership.tier, autoRenew ? 'resume' : 'cancel', {
    note: autoRenew ? 'Auto-renew turned on' : 'Auto-renew turned off',
  });

  if (!autoRenew) {
    notify(
      user._id,
      'Membership will not renew',
      `Your ${membership.tier} perks stay active until ${formatDate(membership.renewsAt)}.`,
      { tier: membership.tier }
    );
  }

  return succeed({ autoRenew, renewsAt: membership.renewsAt });
}

// Takes one renewal payment. Resolves true when the period was extended.
async function attemptRenewal(membership) {
  const tier = MEMBERSHIP_TIERS[membership.tier];
  const balance = await charge(membership.userId, tier.monthlyCoinCost);
  if (balance === null) return false;

  const now = new Date();
  const renewsAt = addMonth(now);
  const updated = await Membership.updateOne(
    { _id: membership._id, status: membership.status, renewsAt: membership.renewsAt },
    { $set: { status: 'active', graceEndsAt: null, currentPeriodStart: now, renewsAt, boostsUsed: 0 } }
  );

  if (!updated.modifiedCount) {
    await refund(membership.userId, tier.monthlyCoinCost);
    return false;
  }

  await log(membership.userId, tier.id, 'renew', {
    amount: -tier.monthlyCoinCost,
    balanceAfter: balance,
    note: `${tier.name} renewal`,
  });
  const finalBalance = (await grantAllocation(membership.userId, tier.id, tier.monthlyCoinAllocation)) ?? balance;

  notify(
    membership.userId,
    `${tier.name} renewed`,
    `${tier.monthlyCoinCost} coins were charged. Next renewal ${formatDate(renewsAt)}.`,
    { tier: tier.id }
  );
  notifyIfLowCredits(membership.userId, finalBalance);
  return true;
}

// Perks that depend on membership are withdrawn when it expires.
async function expire(membership, reason) {
  const updated = await Membership.updateOne(
    { _id: membership._id, status: { $ne: 'expired' } },
    { $set: { status: 'expired', graceEndsAt: null, autoRenew: false } }
  );
  if (!updated.modifiedCount) return;

  await ForumThread.updateMany(
    { authorId: membership.userId, pinnedByMember: true },
    { $set: { pinned: false, pinnedByMember: false } }
  );
  await log(membership.userId, membership.tier, 'expire', { note: reason });
  notify(
    membership.userId,
    'Membership expired',
    `Your ${membership.tier} membership has ended and its perks were removed. Subscribe again any time.`,
    { tier: membership.tier }
  );
}

// Spends one boost from the member's monthly allowance. Admins are unlimited.
export async function consumeBoost(user) {
  if (user.role === 'admin') return succeed({ boostsRemaining: ADMIN_PERKS.boostsPerMonth });

  const { perks, membership } = await getUserPerks(user);
  if (!membership || perks.boostsPerMonth <= 0) {
    return fail(403, 'Boosting a thread is a membership perk. Subscribe to get monthly boosts.');
  }

  const updated = await Membership.findOneAndUpdate(
    { _id: membership._id, boostsUsed: { $lt: perks.boostsPerMonth } },
    { $inc: { boostsUsed: 1 } },
    { new: true }
  );
  if (!updated) return fail(409, `You have used all ${perks.boostsPerMonth} boosts for this billing period.`);

  return succeed({ boostsRemaining: perks.boostsPerMonth - updated.boostsUsed });
}

// Lets a member pay immediately during the grace period.
export async function renewNow(user) {
  const membership = await Membership.findOne({ userId: user._id });
  if (!isLive(membership) || membership.status !== 'grace') return fail(409, 'Your membership does not need a renewal right now.');

  const renewed = await attemptRenewal(membership);
  if (!renewed) {
    const account = await User.findById(user._id).select('credits').lean();
    return fail(402, 'Not enough coins to renew.', {
      required: MEMBERSHIP_TIERS[membership.tier].monthlyCoinCost,
      balance: account?.credits ?? 0,
    });
  }

  return succeed({ tier: membership.tier });
}

export async function processMembershipRenewals(now = new Date()) {
  // One reminder per billing period for memberships that will lapse instead of renewing.
  const ending = await Membership.find({
    status: 'active',
    autoRenew: false,
    renewsAt: { $gt: now, $lte: new Date(now.getTime() + REMINDER_WINDOW_MS) },
  });
  for (const membership of ending) {
    const marked = await Membership.updateOne(
      { _id: membership._id, expiryReminderFor: { $ne: membership.renewsAt } },
      { $set: { expiryReminderFor: membership.renewsAt } }
    );
    if (!marked.modifiedCount) continue;

    const daysLeft = Math.max(1, Math.ceil((membership.renewsAt - now) / (24 * 60 * 60 * 1000)));
    notify(
      membership.userId,
      'Membership expires soon',
      `Your ${membership.tier} membership ends on ${formatDate(membership.renewsAt)} (${daysLeft} day${daysLeft === 1 ? '' : 's'} left) and will not renew. Turn auto-renew back on to keep your perks.`,
      { tier: membership.tier, renewsAt: membership.renewsAt }
    );
  }

  // Billing period ended.
  const due = await Membership.find({ status: 'active', renewsAt: { $lte: now } });
  for (const membership of due) {
    if (!membership.autoRenew) {
      await expire(membership, 'Period ended without auto-renew');
      continue;
    }

    if (await attemptRenewal(membership)) continue;

    const graceEndsAt = new Date(now.getTime() + MEMBERSHIP_GRACE_MS);
    const marked = await Membership.updateOne(
      { _id: membership._id, status: 'active', renewsAt: membership.renewsAt },
      { $set: { status: 'grace', graceEndsAt } }
    );
    if (!marked.modifiedCount) continue;

    await log(membership.userId, membership.tier, 'renew_failed', { note: 'Not enough coins at renewal' });
    notify(
      membership.userId,
      'Membership renewal failed',
      `You need ${MEMBERSHIP_TIERS[membership.tier].monthlyCoinCost} coins. Add coins before ${graceEndsAt.toLocaleString('en-US')} or your membership will expire.`,
      { tier: membership.tier, graceEndsAt }
    );
  }

  // Grace period: retry the charge, expire when the deadline passes.
  const inGrace = await Membership.find({ status: 'grace' });
  for (const membership of inGrace) {
    if (await attemptRenewal(membership)) continue;
    if (membership.graceEndsAt && membership.graceEndsAt <= now) {
      await expire(membership, 'Grace period ended without payment');
    }
  }
}
