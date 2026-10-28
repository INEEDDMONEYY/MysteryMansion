import { motion } from "framer-motion";
import { ArrowRight, Crown } from "lucide-react";
import { membershipPageData } from "../data/membershipPageData";

export default function MembershipCta() {
  const { cta } = membershipPageData;

  return (
    <section className="bg-black px-4 pb-20 pt-8 text-white sm:px-6 lg:px-8 lg:pb-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55 }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-600/25 via-neutral-950 to-yellow-400/10 p-px"
      >
        <div className="relative overflow-hidden rounded-3xl bg-neutral-950 px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute left-1/2 top-0 h-52 w-80 -translate-x-1/2 rounded-full bg-fuchsia-500/15 blur-[100px]" />

          <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-300/30 bg-yellow-300/10 text-yellow-200">
            <Crown size={28} />
          </div>

          <p className="relative mt-6 text-sm font-bold uppercase tracking-[0.2em] text-fuchsia-300">
            {cta.eyebrow}
          </p>

          <h2 className="relative mx-auto mt-4 max-w-3xl text-3xl font-black sm:text-4xl lg:text-5xl">
            {cta.title}
          </h2>

          <p className="relative mx-auto mt-5 max-w-2xl leading-7 text-neutral-400 sm:text-lg">
            {cta.description}
          </p>

          <div className="relative mt-8 flex flex-col justify-center gap-3 min-[420px]:flex-row">
            <a
              href={cta.primaryCta.href}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-6 py-3.5 font-bold text-white transition hover:brightness-110"
            >
              {cta.primaryCta.label}
              <ArrowRight size={18} />
            </a>

            <a
              href={cta.secondaryCta.href}
              className="inline-flex items-center justify-center rounded-xl border border-neutral-700 px-6 py-3.5 font-semibold text-neutral-200 transition hover:border-yellow-300/40 hover:bg-white/[0.04]"
            >
              {cta.secondaryCta.label}
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}