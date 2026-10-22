import User from "../../models/User.js";
import Post from "../../models/Post.js";
import SiteDiscount from "../../models/SiteDiscount.js";
import { createNotification } from "../notifications/notificationController.js";
import {
  PROMOTION_TIERS,
  BLUE_BADGE_MONTHLY_CREDITS,
  applyDiscountPercent,
} from "./promotionCatalog.js";

const DAY_MS = 24 * 60 * 60 * 1000;

const isFuture = (value, now) => Boolean(value) && new Date(value) > now;

// Calendar-month add that keeps the purchase day where possible (Jan 31 -> Feb 28).
export const addMonth = (date) => {
  const source = new Date(date);
  const day = source.getUTCDate();
  const result = new Date(Date.UTC(
    source.getUTCFullYear(),
    source.getUTCMonth() + 1,
    1,
    source.getUTCHours(),
    source.getUTCMinutes(),
    source.getUTCSeconds(),
    source.getUTCMilliseconds(),
  ));
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
};

const notify = (userId, type, title, message, meta = {}) =>
  createNotification({ audience: "user", type, title, message, userId, meta }).catch((err) =>
    console.error("❌ Promotion notification failed:", err.message),
  );

const getBestDiscountPercent = async (tierLabel, now) => {
  const discounts = await SiteDiscount.find({
    active: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  }).lean();

  return discounts
    .filter((d) => !d.targetTiers?.length || d.targetTiers.includes(tierLabel))
    .reduce((best, d) => Math.max(best, d.discountPercent), 0);
};

const refundCredits = (userId, amount) =>
  amount > 0 ? User.updateOne({ _id: userId }, { $inc: { credits: amount } }) : null;

const syncPosts = (userId, fields) => Post.updateMany({ userId }, fields);

// Drops a lapsed blue badge, falling back to pink if a promotion is still running.
const lapseBlueBadge = async (filter) => {
  const user = await User.findOne(filter).select("_id activePromoExpiry").lean();
  if (!user) return null;

  const promoActive = isFuture(user.activePromoExpiry, new Date());
  const fallback = promoActive ? "pink" : "";

  const updated = await User.findOneAndUpdate(
    filter,
    { $set: { badgeAutoRenew: false, badgeExpiresAt: null, badgeType: fallback } },
    { new: true },
  ).select("_id");
  if (!updated) return null;

  await Post.updateMany({ userId: user._id, badgeType: "blue" }, { badgeType: fallback });
  return user._id;
};

export async function getPromotionStatus(userId) {
  const user = await User.findById(userId)
    .select("credits accountType badgeType badgeAutoRenew badgeExpiresAt activePromoExpiry")
    .lean();
  if (!user) return { ok: false, status: 404, error: "User not found" };

  const now = new Date();
  return {
    ok: true,
    data: {
      credits: user.credits ?? 0,
      accountType: user.accountType || "provider",
      badgeType: user.badgeType || "",
      badgeAutoRenew: Boolean(user.badgeAutoRenew),
      badgeExpiresAt: user.badgeExpiresAt || null,
      activePromoExpiry: isFuture(user.activePromoExpiry, now) ? user.activePromoExpiry : null,
      badgeMonthlyCredits: BLUE_BADGE_MONTHLY_CREDITS,
    },
  };
}

export async function purchaseTier(userId, tierId) {
  const tier = PROMOTION_TIERS[tierId];
  if (!tier) return { ok: false, status: 400, error: "Unknown promotion tier." };

  const user = await User.findById(userId)
    .select("accountType credits badgeType badgeExpiresAt badgeAutoRenew activePromoExpiry")
    .lean();
  if (!user) return { ok: false, status: 404, error: "User not found" };
  // lean() skips schema defaults; legacy providers have no stored accountType.
  if ((user.accountType || "provider") !== "provider") {
    return { ok: false, status: 403, error: "Only provider accounts can purchase promotions." };
  }

  const now = new Date();
  const percent = await getBestDiscountPercent(tier.label, now);
  const cost = applyDiscountPercent(tier.credits, percent);

  const permanentBlue = user.badgeType === "blue" && !user.badgeExpiresAt && !user.badgeAutoRenew;
  const activeSubscription = user.badgeType === "blue" && user.badgeAutoRenew;

  if (tier.monthly) {
    if (permanentBlue || user.badgeAutoRenew) {
      return {
        ok: false,
        status: 409,
        error: user.badgeAutoRenew
          ? "Your monthly verified badge is already active."
          : "Your account already has a verified badge.",
      };
    }
  }

  // Atomic charge: only succeeds if the balance covers the cost.
  const chargeFilter = { _id: userId, credits: { $gte: cost } };
  if (tier.monthly) chargeFilter.badgeAutoRenew = { $ne: true };

  const charged = await User.findOneAndUpdate(
    chargeFilter,
    { $inc: { credits: -cost } },
    { new: true },
  ).select("credits");

  if (!charged) {
    return {
      ok: false,
      status: 402,
      error: "Not enough credits for this purchase.",
      data: { required: cost, balance: user.credits ?? 0 },
    };
  }

  try {
    let update;
    let postFields;
    let result;

    if (tier.monthly) {
      const currentBlueExpiry =
        user.badgeType === "blue" && isFuture(user.badgeExpiresAt, now) ? new Date(user.badgeExpiresAt) : now;
      const nextCharge = addMonth(currentBlueExpiry);

      update = { badgeType: "blue", badgeExpiresAt: nextCharge, badgeAutoRenew: true };
      postFields = { badgeType: "blue" };
      result = { badgeExpiresAt: nextCharge };
    } else {
      const currentPromoExpiry = isFuture(user.activePromoExpiry, now) ? new Date(user.activePromoExpiry) : now;
      const promoExpiry = new Date(currentPromoExpiry.getTime() + tier.days * DAY_MS);
      const validBlue =
        user.badgeType === "blue" &&
        (permanentBlue || activeSubscription || isFuture(user.badgeExpiresAt, now));

      update = { activePromoExpiry: promoExpiry };

      if (tier.verified) {
        update.badgeType = "blue";
        if (!permanentBlue && !activeSubscription) {
          const existingBlueExpiry =
            validBlue && isFuture(user.badgeExpiresAt, now) ? new Date(user.badgeExpiresAt) : null;
          update.badgeExpiresAt =
            existingBlueExpiry && existingBlueExpiry > promoExpiry ? existingBlueExpiry : promoExpiry;
        }
      } else {
        update.badgeType = validBlue ? "blue" : "pink";
      }

      postFields = { isPromo: true, promoExpiresAt: promoExpiry, badgeType: update.badgeType };
      result = { promoExpiry };
    }

    await User.updateOne({ _id: userId }, { $set: update });
    await syncPosts(userId, postFields);

    const detail = tier.monthly
      ? `Your Blue Badge is active. ${cost} credits will be deducted each month; next renewal ${result.badgeExpiresAt.toLocaleDateString("en-US")}.`
      : `Your promotion is active until ${result.promoExpiry.toLocaleDateString("en-US")}.`;

    await notify(userId, "promo_approved", `${tier.label} purchased`, `${cost} credits used. ${detail}`, {
      tierId: tier.id,
      cost,
    });

    return {
      ok: true,
      data: {
        tierId: tier.id,
        label: tier.label,
        cost,
        balance: charged.credits,
        badgeType: update.badgeType,
        ...result,
      },
    };
  } catch (err) {
    console.error("❌ Promotion purchase failed after charge, refunding:", err);
    await refundCredits(userId, cost);
    return { ok: false, status: 500, error: "Purchase failed. Your credits were not charged." };
  }
}

export async function cancelBadgeRenewal(userId) {
  const updated = await User.findOneAndUpdate(
    { _id: userId, badgeAutoRenew: true },
    { $set: { badgeAutoRenew: false } },
    { new: true },
  ).select("badgeExpiresAt");

  if (!updated) return { ok: false, status: 404, error: "No active monthly badge to cancel." };

  await notify(
    userId,
    "promo_expiring",
    "Monthly Blue Badge cancelled",
    `You won't be charged again. Your badge stays active until ${new Date(updated.badgeExpiresAt).toLocaleDateString("en-US")}.`,
  );

  return { ok: true, data: { badgeExpiresAt: updated.badgeExpiresAt } };
}

export async function processBadgeRenewals(now = new Date()) {
  const due = await User.find({ badgeAutoRenew: true, badgeExpiresAt: { $lte: now } })
    .select("_id badgeExpiresAt")
    .lean();

  for (const { _id, badgeExpiresAt } of due) {
    let next = addMonth(badgeExpiresAt);
    if (next <= now) next = addMonth(now);

    // Matching the old badgeExpiresAt makes this safe against concurrent runs.
    const renewed = await User.findOneAndUpdate(
      { _id, badgeAutoRenew: true, badgeExpiresAt, credits: { $gte: BLUE_BADGE_MONTHLY_CREDITS } },
      { $inc: { credits: -BLUE_BADGE_MONTHLY_CREDITS }, $set: { badgeExpiresAt: next } },
      { new: true },
    ).select("credits");

    if (renewed) {
      await notify(
        _id,
        "promo_approved",
        "Blue Badge renewed",
        `${BLUE_BADGE_MONTHLY_CREDITS} credits were deducted. Next renewal ${next.toLocaleDateString("en-US")}.`,
      );
      continue;
    }

    const lapsedId = await lapseBlueBadge({ _id, badgeAutoRenew: true, badgeExpiresAt });
    if (lapsedId) {
      await notify(
        lapsedId,
        "low_credits",
        "Blue Badge removed",
        `Your balance was below ${BLUE_BADGE_MONTHLY_CREDITS} credits at renewal, so your Blue Badge was removed. Add credits and resubscribe from the Promote page.`,
      );
    }
  }

  const expired = await User.find({
    badgeType: "blue",
    badgeAutoRenew: { $ne: true },
    badgeExpiresAt: { $ne: null, $lte: now },
  })
    .select("_id badgeExpiresAt")
    .lean();

  for (const { _id, badgeExpiresAt } of expired) {
    const lapsedId = await lapseBlueBadge({
      _id,
      badgeType: "blue",
      badgeAutoRenew: { $ne: true },
      badgeExpiresAt,
    });
    if (lapsedId) {
      await notify(lapsedId, "promo_expiring", "Blue Badge expired", "Your verification badge has expired.");
    }
  }
}
