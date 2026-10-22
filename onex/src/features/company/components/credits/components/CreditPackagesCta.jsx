import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Coins } from "lucide-react";
import { Link } from "react-router-dom";

function CtaLink({ href, children, secondary = false }) {
  const className = secondary
    ? "inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-neutral-200 transition hover:border-fuchsia-400/40 hover:bg-white/[0.07] hover:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 focus:ring-offset-neutral-950"
    : "inline-flex items-center justify-center gap-2 rounded-xl bg-fuchsia-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 focus:ring-offset-neutral-950";

  return (
    <Link to={href} className={className}>
      {children}
      <ArrowRight size={16} aria-hidden="true" />
    </Link>
  );
}

export default function CreditPackagesCta({ data }) {
  if (!data) return null;

  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] px-5 py-20 sm:px-8 sm:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-fuchsia-600/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-4xl rounded-3xl border border-white/10 bg-neutral-900/80 px-6 py-12 text-center sm:px-12 sm:py-16"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-300">
          <Coins size={27} aria-hidden="true" />
        </div>

        {data.eyebrow && (
          <p className="mb-4 mt-6 text-xs font-bold uppercase tracking-[0.24em] text-fuchsia-400 sm:text-sm">
            {data.eyebrow}
          </p>
        )}

        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {data.title}
        </h2>

        {data.description && (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-neutral-400">
            {data.description}
          </p>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {data.primaryCta && (
            <CtaLink href={data.primaryCta.href}>
              {data.primaryCta.label}
            </CtaLink>
          )}

          {data.secondaryCta && (
            <CtaLink href={data.secondaryCta.href} secondary>
              {data.secondaryCta.label}
            </CtaLink>
          )}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-neutral-500">
          <BookOpen size={14} aria-hidden="true" />
          Learn about credit usage and applicable conditions before purchasing.
        </div>
      </motion.div>
    </section>
  );
}