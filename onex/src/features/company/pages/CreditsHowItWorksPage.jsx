import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Coins,
  CreditCard,
  History,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { setSEO } from "@/shared/utils/seo";
import { creditsPageData } from "../components/credits/data/creditsPageData";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45 },
  },
};

function ActionLink({ href, children, variant = "primary" }) {
  const className =
    variant === "primary"
      ? "inline-flex items-center justify-center gap-2 rounded-xl bg-fuchsia-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 focus:ring-offset-neutral-950"
      : "inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-neutral-200 transition hover:border-fuchsia-400/40 hover:bg-white/[0.07] hover:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 focus:ring-offset-neutral-950";

  return (
    <Link to={href} className={className}>
      {children}
      <ArrowRight size={16} aria-hidden="true" />
    </Link>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      {eyebrow && (
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-fuchsia-400 sm:text-sm">
          {eyebrow}
        </p>
      )}

      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>

      {description && (
        <p className="mt-5 text-base leading-7 text-neutral-400 sm:text-lg sm:leading-8">
          {description}
        </p>
      )}
    </div>
  );
}

function InfoCard({ item }) {
  const Icon = item.icon || Sparkles;

  return (
    <motion.article
      variants={itemVariants}
      className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 p-6 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-400/30 hover:bg-neutral-900 sm:p-7"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/40 to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-300">
        <Icon size={22} aria-hidden="true" />
      </div>

      <h3 className="text-lg font-semibold text-white sm:text-xl">
        {item.title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-neutral-400 sm:text-base">
        {item.description}
      </p>
    </motion.article>
  );
}

function InfoGrid({ items = [], columns = 3 }) {
  if (!items.length) return null;

  const gridColumns =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-2 xl:grid-cols-4"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      className={`grid gap-5 ${gridColumns}`}
    >
      {items.map((item, index) => (
        <InfoCard key={`${item.title}-${index}`} item={item} />
      ))}
    </motion.div>
  );
}

function CreditsHero({ data }) {
  const { hero } = data;

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
            {hero.eyebrow}
          </div>

          <h1 className="max-w-3xl text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {hero.title}{" "}
            <span className="bg-gradient-to-r from-fuchsia-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              {hero.highlightedTitle}
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-neutral-400 sm:text-lg">
            {hero.description}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ActionLink href="/credit-packages">
              View Credit Options
            </ActionLink>

            <ActionLink href="/credits/learn-more" variant="secondary">
              Learn More About Credits
            </ActionLink>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="relative mx-auto w-full max-w-lg"
        >
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-fuchsia-500/10 via-purple-500/[0.04] to-transparent blur-2xl" />

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/90 p-6 shadow-2xl shadow-black/30 sm:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  {hero.visual.label}
                </p>

                <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                  {hero.visual.title}
                </h2>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-300">
                <Coins size={25} aria-hidden="true" />
              </div>
            </div>

            <div className="space-y-5 pt-7">
              {hero.visual.steps.map((step, index) => (
                <div key={`${step}-${index}`} className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 text-xs font-bold text-fuchsia-300">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="flex-1 border-b border-white/[0.06] pb-5 last:border-0 last:pb-0">
                    <p className="text-sm leading-6 text-neutral-200 sm:text-base">
                      {step}
                    </p>
                  </div>

                  <CheckCircle2
                    size={17}
                    className="mt-1 shrink-0 text-neutral-600"
                    aria-hidden="true"
                  />
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-xl border border-white/[0.06] bg-black/20 p-4">
              <p className="text-xs leading-6 text-neutral-500">
                One account-based balance for eligible Mystery Mansion features.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CreditProcess({ section }) {
  if (!section?.steps?.length) return null;

  return (
    <section className="border-y border-white/[0.06] bg-neutral-900/30 px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {section.steps.map((step, index) => {
            const Icon = step.icon || Coins;

            return (
              <motion.article
                key={`${step.title}-${index}`}
                variants={itemVariants}
                className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-neutral-900/80 p-6 transition duration-300 hover:border-fuchsia-400/30 sm:p-7"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-sm font-bold tracking-[0.2em] text-fuchsia-400">
                    {step.number || String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-300">
                    <Icon size={21} aria-hidden="true" />
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white">
                  {step.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-7 text-neutral-400 sm:text-base">
                  {step.description}
                </p>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

function CreditAccountGuide() {
  const items = [
    {
      title: "Check your available balance",
      description:
        "Before using a credit-based feature, review the balance shown in your account so you can make an informed decision.",
      icon: WalletCards,
    },
    {
      title: "Review feature requirements",
      description:
        "Check the credit requirement presented by an eligible feature before proceeding. Requirements may differ between features.",
      icon: BadgeCheck,
    },
    {
      title: "Review your activity",
      description:
        "Use the credit activity information available in your account to understand recorded credit additions and usage.",
      icon: History,
    },
  ];

  return (
    <section className="px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Managing Your Credits"
          title="Know your balance before you use it."
          description="Your account is the place to check your available credits and review the information provided about your credit activity."
        />

        <InfoGrid items={items} columns={3} />
      </div>
    </section>
  );
}

function CreditNotice() {
  return (
    <section className="px-5 pb-20 sm:px-8 sm:pb-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 rounded-2xl border border-fuchsia-400/15 bg-fuchsia-500/[0.05] p-6 sm:flex-row sm:items-start sm:p-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-300">
          <ShieldCheck size={23} aria-hidden="true" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white sm:text-xl">
            Understand the terms before purchasing.
          </h2>

          <p className="mt-3 text-sm leading-7 text-neutral-400 sm:text-base">
            Credit eligibility, available packages, and applicable purchase
            conditions depend on the current Mystery Mansion offering. Review
            the published terms and credit policies for information about
            purchase conditions, expiration, and refunds.
          </p>

          <Link
            to="/credits/learn-more"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-fuchsia-300 transition hover:text-fuchsia-200"
          >
            Read the credit guide
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CreditsCta() {
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
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-300">
          <CreditCard size={27} aria-hidden="true" />
        </div>

        <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-fuchsia-400 sm:text-sm">
          Ready to Get Started?
        </p>

        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Explore your credit options.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-neutral-400">
          Review the available credit packages and learn how credits can be
          used with eligible Mystery Mansion features.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ActionLink href="/credit-packages">
            View Credit Options
          </ActionLink>

          <ActionLink href="/credits/learn-more" variant="secondary">
            Learn More About Credits
          </ActionLink>
        </div>
      </motion.div>
    </section>
  );
}

export default function CreditsHowItWorksPage() {
  const data = creditsPageData;

  useEffect(() => {
    setSEO(
      "How Credits Work | Mystery Mansion",
      "Learn how Mystery Mansion credits are added to your account, kept in your balance, used on eligible features, and tracked through your account."
    );
  }, []);

  return (
    <>
      <main className="min-h-screen overflow-hidden bg-neutral-950 text-white">
        <CreditsHero data={data} />

        <section className="px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow={data.overview.eyebrow}
              title={data.overview.title}
              description={data.overview.description}
            />

            <InfoGrid items={data.overview.items} columns={2} />
          </div>
        </section>

        <CreditProcess section={data.howItWorks} />

        <section className="border-y border-white/[0.06] bg-neutral-900/30 px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow={data.benefits.eyebrow}
              title={data.benefits.title}
              description={data.benefits.description}
            />

            <InfoGrid items={data.benefits.items} columns={2} />
          </div>
        </section>

        <CreditAccountGuide />

        <CreditNotice />

        <CreditsCta />
      </main>
    </>
  );
}