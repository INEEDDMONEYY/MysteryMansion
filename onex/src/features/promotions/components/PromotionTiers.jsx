import { useState, useEffect } from "react";
import { Star, CheckCircle2, ShieldCheck, Minus, Percent } from "lucide-react";
import api from "@/shared/utils/api";

export default function PromotionTiers() {
  const cashAppTag = "MysteryyyMansion";
  const cashAppBaseUrl = `https://cash.app/$${cashAppTag}`;

  const [discounts, setDiscounts] = useState([]);

  useEffect(() => {
    api.get('/discounts/public')
      .then(res => setDiscounts(res.data?.data || []))
      .catch(() => {});
  }, []);

  // Returns the highest active discount % that applies to a given tier label
  const getDiscount = (tierLabel) => {
    const applicable = discounts.filter(d =>
      d.active && (d.targetTiers.length === 0 || d.targetTiers.includes(tierLabel))
    );
    if (applicable.length === 0) return null;
    return applicable.reduce((best, d) => d.discountPercent > best.discountPercent ? d : best);
  };

  const applyDiscount = (priceStr, pct) => {
    const match = priceStr.match(/\$([\d.]+)/);
    if (!match) return priceStr;
    const original = parseFloat(match[1]);
    const discounted = (original * (1 - pct / 100)).toFixed(2);
    return `$${discounted}`;
  };

  const tiers = [
    {
      label: "1 Week Promotion",
      price: "$12",
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
      label: "2 Weeks Promotion",
      price: "$24",
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
      label: "2 Weeks Promotion + Verification",
      price: "$27",
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
      label: "3 Weeks Promotion",
      price: "$32",
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
      label: "3 Weeks Promotion + Verification",
      price: "$35",
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
      label: "Blue Badge Verification",
      price: "$3 / Monthly",
      benefits: [
        "Blue badge shown on your profile and posts",
        "Builds trust with potential clients",
        "Keeps your verified status active monthly",
        "Post card background color change to blue exclusively for verified accounts",
      ],
      cardClass: "bg-gradient-to-br from-sky-50 via-blue-100 to-blue-200 border-blue-300",
      labelClass: "text-blue-700",
      cancelAnytime: true,
    },
  ];

  return (
    <section className="px-6 py-10 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-black mb-8">
        Promotion Tiers
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier, index) => {
          const deal = getDiscount(tier.label);
          return (
          <div
            key={index}
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

            {/* Discount badge */}
            {deal && (
              <div className="absolute top-3 right-3 flex items-center gap-0.5 bg-pink-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-md">
                <Percent size={9} />
                {deal.discountPercent}% OFF
              </div>
            )}

            <h3 className={`text-xl font-semibold mb-2 ${tier.labelClass}`}>
              {tier.label}
            </h3>

            {/* Price — show struck-out original + discounted if deal active */}
            {deal ? (
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-gray-400 line-through text-sm">{tier.price}</span>
                <span className="text-pink-600 font-bold">{applyDiscount(tier.price, deal.discountPercent)}</span>
              </div>
            ) : (
              <p className="text-gray-600 font-medium mb-2">{tier.price}</p>
            )}
            {deal && (
              <p className="text-[10px] text-pink-600 font-semibold -mt-1 mb-2">{deal.label}</p>
            )}
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
              <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-700">
                <ShieldCheck size={13} className="shrink-0" /> cancel anytime
              </p>
            )}

            <a
              href={cashAppBaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full sm:w-auto sm:self-center items-center justify-center rounded-md bg-gradient-to-r from-black via-zinc-800 to-gray-600 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.06em] text-white transition hover:brightness-110"
            >
              Get {tier.label}
            </a>
          </div>
          );
        })}
      </div>
    </section>
  );
}