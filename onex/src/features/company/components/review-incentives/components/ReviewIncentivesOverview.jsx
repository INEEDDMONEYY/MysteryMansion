import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { reviewIncentivesPageData } from "../data/reviewIncentivesPageData";

export default function ReviewIncentivesOverview() {
  const { overview } = reviewIncentivesPageData;

  return (
    <section className="relative overflow-hidden bg-black px-6 py-24 text-white lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
            {overview.eyebrow}
          </p>

          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            {overview.title}
          </h2>

          <p className="mt-6 text-base leading-8 text-gray-300 sm:text-lg">
            {overview.description}
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {overview.items.map((item, index) => {
            const Icon = item.icon || Sparkles;

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-7 transition duration-300 hover:-translate-y-1 hover:border-pink-400/35"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-yellow-400 opacity-0 transition group-hover:opacity-100" />

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-pink-400/20 bg-pink-500/10 text-pink-300">
                  <Icon size={25} aria-hidden="true" />
                </div>

                <h3 className="mt-6 text-xl font-bold text-white">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-400 sm:text-base">
                  {item.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}