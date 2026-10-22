
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Coins,
  Gift,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { reviewIncentivesPageData } from "../data/reviewIncentivesPageData";

const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  }

  return String(value);
};

const getCreditReward = (creditsAwarded) => {
  if (creditsAwarded === null || creditsAwarded === undefined || creditsAwarded === "") {
    return "To be configured";
  }

  return `${Number(creditsAwarded).toLocaleString()} ${
    Number(creditsAwarded) === 1 ? "credit" : "credits"
  }`;
};

const getMoneyReward = (tier) => {
  if (tier.moneyRewardEnabled === false) {
    return "No monetary reward at this milestone";
  }

  if (tier.moneyRewardEnabled !== true) {
    return "Eligibility to be confirmed";
  }

  const amount = formatMoney(tier.moneyReward);

  return amount || "Reward amount to be configured";
};

export default function ReviewIncentivesMilestones() {
  const milestones = reviewIncentivesPageData.milestones;

  if (!milestones || !Array.isArray(milestones.tiers) || milestones.tiers.length === 0) {
    return null;
  }

  return (
    <section
      id="incentive-milestones"
      className="relative overflow-hidden bg-black px-4 py-20 text-white sm:px-6 lg:px-8"
    >
      <div className="pointer-events-none absolute left-1/2 top-20 h-80 w-80 -translate-x-1/2 rounded-full bg-fuchsia-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-yellow-400/5 blur-[110px]" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-2 text-sm font-semibold text-fuchsia-300">
            <Sparkles size={16} />
            {milestones.eyebrow || "Referral Milestones"}
          </div>

          <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            {milestones.title || "Every milestone is progress."}
          </h2>

          {milestones.description && (
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-neutral-400 sm:text-lg">
              {milestones.description}
            </p>
          )}
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {milestones.tiers.map((tier, index) => (
            <motion.article
              key={tier.id || tier.signups}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: Math.min(index * 0.07, 0.35) }}
              whileHover={{ y: -5 }}
              className="group relative h-full rounded-2xl bg-gradient-to-br from-fuchsia-500/35 via-neutral-800 to-yellow-400/20 p-px"
            >
              <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-neutral-950 p-6 sm:p-7">
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-fuchsia-500/10 blur-3xl transition-colors group-hover:bg-fuchsia-500/20" />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300">
                    <Gift size={23} />
                  </div>

                  <span className="rounded-full border border-yellow-400/25 bg-yellow-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-yellow-300">
                    {tier.isOpenEnded ? "Advanced milestone" : "Milestone"}
                  </span>
                </div>

                <div className="relative mt-6">
                  <p className="text-sm font-medium text-neutral-400">
                    {milestones.countLabel || "Verified signups"}
                  </p>

                  <h3 className="mt-2 text-4xl font-black tracking-tight text-white">
                    {tier.isOpenEnded
                      ? `${Number(tier.signups).toLocaleString()}+`
                      : Number(tier.signups).toLocaleString()}
                  </h3>

                  <p className="mt-2 text-sm font-semibold text-fuchsia-300">
                    {tier.label ||
                      `${Number(tier.signups).toLocaleString()}${
                        tier.isOpenEnded ? "+" : ""
                      } signups`}
                  </p>
                </div>

                {tier.description && (
                  <p className="relative mt-4 min-h-12 text-sm leading-6 text-neutral-400">
                    {tier.description}
                  </p>
                )}

                <div className="relative my-6 h-px bg-gradient-to-r from-fuchsia-500/40 via-neutral-700 to-yellow-400/30" />

                <div className="relative space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-fuchsia-500/10 text-fuchsia-300">
                      <Coins size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        {milestones.creditRewardLabel || "Credit reward"}
                      </p>
                      <p className="mt-1 break-words font-bold text-white">
                        {getCreditReward(tier.creditsAwarded)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-300">
                      <Wallet size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        {milestones.moneyRewardLabel || "Monetary incentive"}
                      </p>
                      <p className="mt-1 break-words text-sm font-semibold text-neutral-200">
                        {getMoneyReward(tier)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative mt-auto pt-7">
                  <div className="flex items-center justify-between border-t border-neutral-800 pt-4 text-xs text-neutral-500">
                    <span className="inline-flex items-center gap-2">
                      <Users size={14} />
                      Referral progress
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="text-fuchsia-300 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {milestones.rewardNote && (
          <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-6 text-neutral-500">
            {milestones.rewardNote}
          </p>
        )}
      </div>
    </section>
  );
}
