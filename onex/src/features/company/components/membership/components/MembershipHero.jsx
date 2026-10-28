import { motion } from "framer-motion";
import { ArrowDown, Crown, Sparkles } from "lucide-react";
import { membershipPageData } from "../data/membershipPageData";

export default function MembershipHero() {
  const { hero } = membershipPageData;

  return (
    <section className="relative isolate overflow-hidden bg-black px-4 pb-20 pt-20 text-white sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(217,70,239,0.17),_transparent_55%)]" />
      <div className="pointer-events-none absolute -left-32 top-40 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-yellow-400/10 blur-[130px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-2 text-sm font-semibold text-fuchsia-300">
            <Sparkles size={16} />
            {hero.eyebrow}
          </div>

          <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-7xl">
            {hero.title}{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 via-pink-500 to-yellow-300 bg-clip-text text-transparent">
              {hero.highlightedTitle}
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-neutral-300 sm:text-lg">
            {hero.description}
          </p>

          <div className="mt-9 flex flex-col gap-3 min-[420px]:flex-row">
            <a
              href={hero.primaryCta.href}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-fuchsia-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-fuchsia-950/30 transition hover:-translate-y-0.5 hover:brightness-110"
            >
              {hero.primaryCta.label}
              <ArrowDown size={18} />
            </a>

            <a
              href={hero.secondaryCta.href}
              className="inline-flex items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900/70 px-6 py-3.5 font-semibold text-neutral-100 transition hover:border-fuchsia-400/50 hover:bg-neutral-800"
            >
              {hero.secondaryCta.label}
            </a>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
            {hero.highlights.map((highlight) => (
              <div
                key={highlight}
                className="flex items-center gap-2 text-sm text-neutral-400"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-300" />
                {highlight}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-fuchsia-500/30 via-transparent to-yellow-400/20 blur-2xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-950/90 p-7 shadow-2xl shadow-fuchsia-950/20 sm:p-9">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />

            <div className="relative flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-300">
                <Crown size={30} />
              </div>

              <span className="rounded-full border border-yellow-300/25 bg-yellow-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-yellow-200">
                Membership
              </span>
            </div>

            <p className="relative mt-9 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
              The Mystery Mansion Experience
            </p>

            <h2 className="relative mt-3 text-3xl font-black leading-tight sm:text-4xl">
              Membership built around you.
            </h2>

            <p className="relative mt-4 leading-7 text-neutral-400">
              Transparent pricing, monthly coin billing, and clear renewal
              expectations.
            </p>

            <div className="relative mt-8 h-px bg-gradient-to-r from-fuchsia-500/70 via-neutral-700 to-yellow-300/60" />

            <div className="relative mt-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-neutral-500">Billing cycle</p>
                <p className="mt-1 font-bold text-white">Monthly</p>
              </div>

              <div className="text-right">
                <p className="text-sm text-neutral-500">Payment method</p>
                <p className="mt-1 font-bold text-yellow-200">
                  Platform coins
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}