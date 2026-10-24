import { useState, useEffect, useContext, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, CheckCircle2, ShieldCheck, Minus, Percent, Coins } from "lucide-react";
import api from "@/shared/utils/api";
import { UserContext } from "@/context/UserContext";
import { showAppToast } from "@/shared/utils/appToast";

// ids and credit prices mirror backend/src/modules/promotions/promotionCatalog.js (server charges its own price)
const TIERS = [
  {
    id: "promo-1w",
    label: "1 Week Promotion",
    credits: 250,
    benefits: [
      "Priority placement for 7 full days",
      "Increased profile visibility in feed",
      "More profile clicks and engagement",
    ],
    excludes: [
      "Blue verification badge not included",
      "Post card background color change to blue not included",
    ],
    cardClass: "bg-gradient-to-br from-rose-50 via-pink-100 to-pink-200 border-pink-300",
    labelClass: "text-pink-700",
  },
  {
    id: "promo-2w",
    label: "2 Weeks Promotion",
    credits: 425,
    benefits: [
      "14 days of boosted placement",
      "Steady visibility across key sections",
      "Better consistency for lead flow",
    ],
    excludes: [
      "Blue verification badge not included",
      "Post card background color change to blue not included",
    ],
    cardClass: "bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 border-purple-300",
    labelClass: "text-purple-700",
  },
  {
    id: "promo-2w-verified",
    label: "2 Weeks Promotion + Verification",
    credits: 850,
    benefits: [
      "14 days of promoted visibility",
      "Blue verification badge included",
      "Higher trust and stronger profile credibility",
      "Post card background color change to blue exclusively for verified accounts",
    ],
    cardClass: "bg-gradient-to-br from-amber-100 via-yellow-200 to-orange-200 border-amber-400",
    labelClass: "text-amber-800",
    popular: true,
  },
  {
    id: "promo-3w",
    label: "3 Weeks Promotion",
    credits: 1025,
    benefits: [
      "21 days of continuous priority exposure",
      "Longer campaign for sustained reach",
      "Great for maintaining top-of-feed momentum",
    ],
    excludes: [
      "Blue verification badge not included",
      "Post card background color change to blue not included",
    ],
    cardClass: "bg-gradient-to-br from-violet-100 via-indigo-200 to-violet-300 border-violet-400",
    labelClass: "text-violet-800",
  },
  {
    id: "promo-3w-verified",
    label: "3 Weeks Promotion + Verification",
    credits: 1400,
    benefits: [
      "21 days of premium promoted reach",
      "Blue verification badge included",
      "Best long-term value for visibility + trust",
      "Post card background color change to blue exclusively for verified accounts",
    ],
    cardClass: "bg-gradient-to-br from-emerald-50 via-lime-100 to-green-200 border-green-300",
    labelClass: "text-green-800",
    valueable: true,
  },
  {
    id: "blue-badge",
    label: "Blue Badge Verification",
    credits: 50,
    monthly: true,
    benefits: [
      "Blue badge shown on your profile and posts",
      "Builds trust with potential clients",
      "Credits are deducted automatically every month from your purchase date",
      "Post card background color change to blue exclusively for verified accounts",
    ],
    cardClass: "bg-gradient-to-br from-sky-50 via-blue-100 to-blue-200 border-blue-300",
    labelClass: "text-blue-700",
    cancelAnytime: true,
  },
];

const TIER_DAYS = {
  "promo-1w": 7,
  "promo-2w": 14,
  "promo-2w-verified": 14,
  "promo-3w": 21,
  "promo-3w-verified": 21,
};

const DAY_MS = 24 * 60 * 60 * 1000;

const BUTTON_CLASS =
  "mt-4 inline-flex w-full sm:w-auto sm:self-center items-center justify-center rounded-md bg-gradient-to-r from-black via-zinc-800 to-gray-600 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.06em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export default function PromotionTiers() {
  const navigate = useNavigate();
  const { user, refreshUser } = useContext(UserContext) || {};
  const isProvider =
    Boolean(user?._id) && user?.role !== "admin" && (user?.accountType || "provider") === "provider";

  const [discounts, setDiscounts] = useState([]);
  const [status, setStatus] = useState(null);
  const [confirmTier, setConfirmTier] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    api.get("/discounts/public")
      .then((res) => setDiscounts(res.data?.data || []))
      .catch(() => {});
  }, []);

  const loadStatus = useCallback(() => {
    if (!isProvider) {
      setStatus(null);
      return Promise.resolve();
    }
    return api.get("/promotions/status")
      .then((res) => setStatus(res.data?.data || null))
      .catch(() => {});
  }, [isProvider]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Highest active discount % that applies to a given tier label
  const getDiscount = (tierLabel) => {
    const applicable = discounts.filter(
      (d) => d.active && (d.targetTiers.length === 0 || d.targetTiers.includes(tierLabel))
    );
    if (applicable.length === 0) return null;
    return applicable.reduce((best, d) => (d.discountPercent > best.discountPercent ? d : best));
  };

  const getCost = (tier, deal) =>
    deal ? Math.max(0, Math.round(tier.credits * (1 - deal.discountPercent / 100))) : tier.credits;

  // Purchases extend an active promotion from its current end date.
  const getStackedEnd = (tierId) => {
    const days = TIER_DAYS[tierId];
    if (!days) return null;
    const base = status?.activePromoExpiry ? new Date(status.activePromoExpiry) : new Date();
    return new Date(base.getTime() + days * DAY_MS);
  };

  const handleConfirm = async () => {
    if (!confirmTier) return;
    setPurchasing(true);
    setFeedback(null);
    try {
      const res = await api.post("/promotions/purchase", { tierId: confirmTier.id });
      const data = res.data?.data;

      // Reflect the charge and new end date immediately, before the refetch returns.
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              credits: data?.balance ?? prev.credits,
              activePromoExpiry: data?.promoExpiry ?? prev.activePromoExpiry,
              badgeExpiresAt: data?.badgeExpiresAt ?? prev.badgeExpiresAt,
            }
          : prev
      );

      setFeedback({
        type: "success",
        message: `${confirmTier.label} purchased for ${data?.cost ?? confirmTier.cost} credits.`,
      });

      const spent = data?.cost ?? confirmTier.cost;
      const until = data?.badgeExpiresAt || data?.promoExpiry;
      showAppToast({
        type: "promo_purchased",
        title: `${confirmTier.label} purchased`,
        message: confirmTier.monthly
          ? `${spent} credits used. Renews ${formatDate(until)}.`
          : `${spent} credits used. Active until ${formatDate(until)}.`,
      });
      setConfirmTier(null);
      await Promise.all([loadStatus(), refreshUser?.().catch(() => {})]);
      window.dispatchEvent(new Event("promo-updated"));
    } catch (err) {
      setFeedback({
        type: "error",
        message: err?.response?.data?.error || "Purchase failed. Please try again.",
      });
      setConfirmTier(null);
      loadStatus();
    } finally {
      setPurchasing(false);
    }
  };

  const renderAction = (tier, cost) => {
    if (!user?._id) {
      return (
        <button type="button" onClick={() => navigate("/signin")} className={BUTTON_CLASS}>
          Sign in to get {tier.label}
        </button>
      );
    }

    if (!isProvider) {
      return (
        <button type="button" disabled className={BUTTON_CLASS}>
          Providers only
        </button>
      );
    }

    if (tier.monthly && status?.badgeAutoRenew) {
      return (
        <button type="button" disabled className={BUTTON_CLASS}>
          Active{status.badgeExpiresAt ? ` — renews ${formatDate(status.badgeExpiresAt)}` : ""}
        </button>
      );
    }

    if (status && status.credits < cost) {
      return (
        <Link to="/user/credits" className={BUTTON_CLASS}>
          Add {cost - status.credits} more credits
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={() => {
          setFeedback(null);
          setConfirmTier({ ...tier, cost });
        }}
        disabled={!status}
        className={BUTTON_CLASS}
      >
        Get {tier.label}
      </button>
    );
  };

  return (
    <section className="px-6 py-10 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-black mb-2">Promotion Tiers</h2>

      {isProvider && status && (
        <p className="mb-6 flex items-center justify-center gap-1.5 text-sm text-gray-700">
          <Coins size={15} className="text-yellow-500" />
          Your balance: <strong>{status.credits.toLocaleString()} credits</strong>
          <Link to="/user/credits" className="ml-2 text-pink-600 underline">
            Add credits
          </Link>
        </p>
      )}

      {feedback && (
        <p
          role="status"
          className={`mx-auto mb-6 max-w-xl rounded-lg border px-4 py-3 text-center text-sm ${
            feedback.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {TIERS.map((tier) => {
          const deal = getDiscount(tier.label);
          const cost = getCost(tier, deal);
          const unit = tier.monthly ? " / Monthly" : "";

          return (
            <div
              key={tier.id}
              className={`relative backdrop-blur-md border rounded-xl shadow-lg p-6 text-center hover:scale-105 transition flex flex-col ${tier.cardClass}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md ring-2 ring-white inline-flex items-center gap-1">
                  <Star size={11} className="fill-white text-white" /> Best Value
                </div>
              )}
              {tier.valueable && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-emerald-500 via-lime-500 to-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md ring-2 ring-white inline-flex items-center gap-1">
                  <Star size={11} className="fill-white text-white" /> Maximum Exposure
                </div>
              )}

              {deal && (
                <div className="absolute top-3 right-3 flex items-center gap-0.5 bg-pink-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-md">
                  <Percent size={9} />
                  {deal.discountPercent}% OFF
                </div>
              )}

              <h3 className={`text-xl font-semibold mb-2 ${tier.labelClass}`}>{tier.label}</h3>

              {deal ? (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-gray-400 line-through text-sm">{tier.credits} Credits</span>
                  <span className="text-pink-600 font-bold">
                    {cost} Credits{unit}
                  </span>
                </div>
              ) : (
                <p className="text-gray-600 font-medium mb-2">
                  {tier.credits} Credits{unit}
                </p>
              )}
              {deal && <p className="text-[10px] text-pink-600 font-semibold -mt-1 mb-2">{deal.label}</p>}

              <ul className="text-sm text-gray-600 text-left space-y-1.5">
                {tier.benefits.map((benefit) => (
                  <li key={benefit} className="inline-flex items-start gap-2">
                    <CheckCircle2 size={14} className="mt-[2px] shrink-0 text-emerald-600" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              {Array.isArray(tier.excludes) && tier.excludes.length > 0 && (
                <ul className="mt-2 border-t border-gray-300/70 pt-2 text-sm text-left space-y-1.5">
                  {tier.excludes.map((item) => (
                    <li key={item} className="inline-flex items-start gap-2 text-gray-500">
                      <Minus size={14} className="mt-[2px] shrink-0 text-gray-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {tier.cancelAnytime && (
                <p className="mt-3 inline-flex items-center justify-center gap-1 text-xs font-medium text-blue-700">
                  <ShieldCheck size={13} className="shrink-0" /> cancel anytime
                </p>
              )}

              {renderAction(tier, cost)}
            </div>
          );
        })}
      </div>

      {confirmTier && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !purchasing) setConfirmTier(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-purchase-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-gray-900 shadow-2xl"
          >
            <h3 id="confirm-purchase-title" className="text-lg font-bold">
              Confirm purchase
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {confirmTier.monthly
                ? `${confirmTier.cost} credits will be deducted now and again every month from today. You can cancel anytime from My Credits.`
                : `${confirmTier.cost} credits will be deducted for ${confirmTier.label}.`}
            </p>
            {!confirmTier.monthly && getStackedEnd(confirmTier.id) && (
              <p className="mt-2 text-xs text-gray-500">
                {status?.activePromoExpiry
                  ? `Your promotion now ends ${formatDate(status.activePromoExpiry)}; this extends it to ${formatDate(getStackedEnd(confirmTier.id))}.`
                  : `Your promotion will run until ${formatDate(getStackedEnd(confirmTier.id))}.`}
              </p>
            )}
            {status && (
              <p className="mt-2 text-xs text-gray-500">
                Balance after purchase: {(status.credits - confirmTier.cost).toLocaleString()} credits
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmTier(null)}
                disabled={purchasing}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={purchasing}
                className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-500 disabled:opacity-50"
              >
                {purchasing ? "Processing…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
