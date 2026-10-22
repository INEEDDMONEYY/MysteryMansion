import { motion } from "framer-motion";
import { ArrowRight, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { reviewIncentivesPageData } from "../data/reviewIncentivesPageData";

export default function ReviewIncentivesCta() {
  const { cta } = reviewIncentivesPageData;

  return (
    <section className="relative overflow-hidden bg-black px-6 py-24 text-white lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-pink-600/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-yellow-400/[0.06] blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-14 text-center sm:px-12 sm:py-16"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-pink-400/20 bg-pink-500/10 text-pink-300">
          <Gift size={29} aria-hidden="true" />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
          {cta.eyebrow}
        </p>

        <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
          {cta.title}
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-gray-300 sm:text-lg">
          {cta.description}
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Link
            to={cta.primaryCta.href}
            className="group inline-flex items-center gap-2 rounded-xl bg-pink-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-pink-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-pink-500 hover:shadow-xl hover:shadow-pink-600/30 active:scale-[0.98]"
          >
            {cta.primaryCta.label}
            <ArrowRight
              size={19}
              className="transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>

          <Link
            to={cta.secondaryCta.href}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-yellow-400/30 hover:bg-white/10"
          >
            {cta.secondaryCta.label}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}