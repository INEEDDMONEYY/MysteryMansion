import { motion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import { reviewIncentivesPageData } from "../data/reviewIncentivesPageData";

export default function ReviewIncentivesHowItWorks() {
  const { howItWorks } = reviewIncentivesPageData;

  return (
    <section className="relative overflow-hidden bg-black px-6 py-24 text-white lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -bottom-36 left-1/3 h-80 w-80 rounded-full bg-pink-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-500/10 px-4 py-2 text-sm font-medium text-pink-300">
            <Sparkles size={16} aria-hidden="true" />
            {howItWorks.eyebrow}
          </div>

          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            {howItWorks.title}
          </h2>

          <p className="mt-6 text-base leading-8 text-gray-300 sm:text-lg">
            {howItWorks.description}
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {howItWorks.steps.map((step, index) => {
            const Icon = step.icon || Sparkles;

            return (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: index * 0.07 }}
                className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition duration-300 hover:-translate-y-1 hover:border-pink-400/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black tracking-[0.2em] text-pink-400">
                    {step.number}
                  </span>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/10 text-pink-300">
                    <Icon size={21} aria-hidden="true" />
                  </div>
                </div>

                <h3 className="mt-7 text-lg font-bold text-white">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-400">
                  {step.description}
                </p>

                {index < howItWorks.steps.length - 1 && (
                  <div className="mt-6 hidden items-center justify-center text-yellow-400/70 lg:flex">
                    <ArrowDown size={15} aria-hidden="true" />
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}