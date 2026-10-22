import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Coins, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

function HeroLink({ href, children, variant = "primary" }) {
  const className =
    variant === "primary"
      ? "inline-flex items-center justify-center gap-2 rounded-xl bg-fuchsia-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 focus:ring-offset-neutral-950"
      : "inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-neutral-200 transition hover:border-fuchsia-400/40 hover:bg-white/[0.07] hover:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 focus:ring-offset-neutral-950";

  const isAnchor = href.startsWith("#");

  if (isAnchor) {
    return (
      <a href={href} className={className}>
        {children}
        {variant === "primary" ? (
          <ArrowDown size={16} aria-hidden="true" />
        ) : (
          <ArrowRight size={16} aria-hidden="true" />
        )}
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      {children}
      <ArrowRight size={16} aria-hidden="true" />
    </Link>
  );
}

export default function CreditPackagesHero({ data }) {
  if (!data) return null;

  return (
    <section className="relative overflow-hidden border-b border-white/[0.06]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-36 top-0 h-96 w-96 rounded-full bg-fuchsia-600/10 blur-[120px]" />
        <div className="absolute -right-20 top-20 h-80 w-80 rounded-full bg-purple-600/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/[0.07] px-4 py-2 text-xs font-semibold tracking-wide text-fuchsia-300 sm:text-sm">
            <Sparkles size={15} aria-hidden="true" />
            {data.eyebrow}
          </div>

          <h1 className="max-w-3xl text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {data.title}{" "}
            <span className="bg-gradient-to-r from-fuchsia-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              {data.highlightedTitle}
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-neutral-400 sm:text-lg">
            {data.description}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            {data.primaryCta && (
              <HeroLink href={data.primaryCta.href}>
                {data.primaryCta.label}
              </HeroLink>
            )}

            {data.secondaryCta && (
              <HeroLink
                href={data.secondaryCta.href}
                variant="secondary"
              >
                {data.secondaryCta.label}
              </HeroLink>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="relative mx-auto w-full max-w-lg"
        >
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-fuchsia-500/10 via-purple-500/[0.04] to-transparent blur-2xl" />

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/90 p-7 shadow-2xl shadow-black/30 sm:p-9">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-300">
              <Coins size={29} aria-hidden="true" />
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.24em] text-fuchsia-400">
              One Credit System
            </p>

            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              Your credits. Your account.
            </h2>

            <p className="mt-4 text-sm leading-7 text-neutral-400 sm:text-base">
              Explore the available package prices, understand the eligible
              uses of credits, and review your account balance as you use
              Mystery Mansion.
            </p>

            <div className="mt-7 space-y-4 border-t border-white/10 pt-6">
              {[
                "Multiple package price options",
                "Account-based credit balance",
                "Usage on eligible platform features",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fuchsia-500/10 text-fuchsia-300">
                    <Sparkles size={12} aria-hidden="true" />
                  </span>

                  <p className="text-sm leading-6 text-neutral-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}