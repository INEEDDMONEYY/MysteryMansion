import { motion } from "framer-motion";
import { ArrowUpRight, CircleDollarSign, Wallet } from "lucide-react";
import { reviewIncentivesPageData } from "../data/reviewIncentivesPageData";

export default function ReviewIncentivesPayoutOptions() {
  const { moneyIncentives } = reviewIncentivesPageData;
  const options = moneyIncentives.payoutOptions || [];

  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-neutral-950 px-6 py-24 text-white lg:px-8">
      <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-yellow-400/[0.07] blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-yellow-400/25 bg-yellow-400/[0.07] px-4 py-2 text-sm font-medium text-yellow-300">
            <CircleDollarSign size={17} aria-hidden="true" />
            {moneyIncentives.eyebrow}
          </div>

          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            {moneyIncentives.title}
          </h2>

          <p className="mt-6 text-base leading-8 text-gray-300 sm:text-lg">
            {moneyIncentives.description}
          </p>
        </motion.div>

        <div className="mx-auto max-w-4xl rounded-2xl border border-pink-400/20 bg-gradient-to-br from-pink-950/30 via-neutral-950 to-yellow-950/10 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-300">
              <Wallet size={23} aria-hidden="true" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                Supported payout methods
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-300 sm:text-base">
                {moneyIncentives.eligibilityDescription}
              </p>
            </div>
          </div>

          {options.length > 0 ? (
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {options.map((option, index) => {
                const name =
                  typeof option === "string" ? option : option.name;
                const description =
                  typeof option === "string" ? "" : option.description;

                return (
                  <motion.article
                    key={option.id || name || index}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.4, delay: (index % 2) * 0.08 }}
                    className="rounded-xl border border-white/10 bg-black/40 p-5 transition hover:border-yellow-400/30"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-semibold text-white">{name}</h4>
                      <ArrowUpRight
                        size={17}
                        className="shrink-0 text-yellow-300"
                        aria-hidden="true"
                      />
                    </div>

                    {description && (
                      <p className="mt-2 text-sm leading-6 text-gray-400">
                        {description}
                      </p>
                    )}

                    {typeof option === "object" && option.processingTime && (
                      <p className="mt-3 text-xs text-gray-500">
                        Processing: {option.processingTime}
                      </p>
                    )}
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <div className="mt-7 rounded-xl border border-dashed border-white/15 bg-black/30 p-5">
              <p className="text-sm leading-7 text-gray-400">
                Add your existing supported payout methods to the
                `payoutOptions` array in `reviewIncentivesPageData.js` to show
                them here.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}