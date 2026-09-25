import { motion } from "framer-motion";
import {
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";
import { reviewIncentivesPageData } from "../data/reviewIncentivesPageData";

export default function ReviewIncentivesStandards() {
  const { standards } =
    reviewIncentivesPageData;

  return (
    <section className="bg-white px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-pink-600">
              {standards.eyebrow}
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">
              {standards.title}
            </h2>

            <p className="mt-5 text-lg leading-8 text-gray-600">
              {standards.description}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-gray-200 bg-gray-50 p-8 sm:p-10"
          >
            <div className="space-y-6">
              {standards.items.map((item, index) => (
                <div
                  key={item}
                  className="flex gap-4 border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-pink-600 shadow-sm">
                    <BadgeCheck className="h-4 w-4" />
                  </div>

                  <div>
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">
                      Standard {index + 1}
                    </span>

                    <p className="text-sm leading-7 text-gray-600">
                      {item}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}