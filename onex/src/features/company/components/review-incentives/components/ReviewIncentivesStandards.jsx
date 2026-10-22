import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { reviewIncentivesPageData } from "../data/reviewIncentivesPageData";

export default function ReviewIncentivesStandards() {
  const { standards } = reviewIncentivesPageData;

  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-neutral-950 px-6 py-24 text-white lg:px-8">
      <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-yellow-400/[0.06] blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-yellow-400/25 bg-yellow-400/[0.07] px-4 py-2 text-sm font-medium text-yellow-300">
            <ShieldCheck size={16} aria-hidden="true" />
            {standards.eyebrow}
          </div>

          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            {standards.title}
          </h2>

          <p className="mt-6 text-base leading-8 text-gray-300 sm:text-lg">
            {standards.description}
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2">
          {standards.items.map((item, index) => {
            const Icon = item.icon || ShieldCheck;

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: (index % 2) * 0.1 }}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-yellow-400/25 sm:p-7"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-pink-400/20 bg-pink-500/10 text-pink-300">
                  <Icon size={22} aria-hidden="true" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-gray-400 sm:text-base">
                    {item.description}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}