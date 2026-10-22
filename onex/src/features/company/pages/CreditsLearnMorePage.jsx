import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Coins,
  Sparkles,
} from "lucide-react";

import { setSEO } from "@/shared/utils/seo";
import { creditsLearnMoreData } from "../components/credits/data/creditsPageData";

const CREDIT_PACKAGES_PATH = "/credits/learn-more";

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

const resolveHref = (href) =>
  !href || href === "*" ? CREDIT_PACKAGES_PATH : href;

function ActionLink({ href, children, variant = "primary" }) {
  const className =
    variant === "primary"
      ? "inline-flex items-center justify-center gap-2 rounded-xl bg-fuchsia-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 focus:ring-offset-neutral-950"
      : "inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-neutral-200 transition hover:border-fuchsia-400/40 hover:bg-white/[0.07] hover:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 focus:ring-offset-neutral-950";

  return (
    <Link to={resolveHref(href)} className={className}>
      {children}
      <ArrowRight size={16} aria-hidden="true" />
    </Link>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = true,
}) {
  return (
    <div
      className={`mb-12 max-w-3xl ${
        centered ? "mx-auto text-center" : "text-left"
      }`}
    >
      {eyebrow && (
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-fuchsia-400 sm:text-sm">
          {eyebrow}
        </p>
      )}

      {title && (
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h2>
      )}

      {description && (
        <p className="mt-5 text-base leading-7 text-neutral-400 sm:text-lg sm:leading-8">
          {description}
        </p>
      )}
    </div>
  );
}

function FeatureCard({ item }) {
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

      {item.description && (
        <p className="mt-3 text-sm leading-7 text-neutral-400 sm:text-base">
          {item.description}
        </p>
      )}

      {item.number && (
        <span className="absolute right-6 top-6 text-sm font-bold tracking-wider text-neutral-700">
          {item.number}
        </span>
      )}
    </motion.article>
  );
}

function FeatureGrid({ items = [], columns = 3 }) {
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
        <FeatureCard key={`${item.title}-${index}`} item={item} />
      ))}
    </motion.div>
  );
}

function CreditStep({ step, index }) {
  const Icon = step.icon || Coins;

  return (
    <motion.article
      variants={itemVariants}
      className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-neutral-900/70 p-6 sm:p-7"
    >
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm font-bold tracking-[0.2em] text-fuchsia-400">
          {step.number || String(index + 1).padStart(2, "0")}
        </span>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-300">
          <Icon size={21} aria-hidden="true" />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-white">{step.title}</h3>

      {step.description && (
        <p className="mt-3 flex-1 text-sm leading-7 text-neutral-400 sm:text-base">
          {step.description}
        </p>
      )}
    </motion.article>
  );
}

function CreditSteps({ items = [] }) {
  if (!items.length) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {items.map((item, index) => (
        <CreditStep
          key={`${item.title}-${index}`}
          step={item}
          index={index}
        />
      ))}
    </motion.div>
  );
}

function CreditFaqs({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(0);

  if (!items.length) return null;

  return (
    <div className="mx-auto max-w-3xl divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/70">
      {items.map((item, index) => {
        const Icon = item.icon || CircleHelp;
        const isOpen = openIndex === index;
        const panelId = `credit-faq-panel-${index}`;

        return (
          <div key={item.question} className="px-5 sm:px-7">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() =>
                setOpenIndex((current) =>
                  current === index ? -1 : index
                )
              }
              className="flex w-full items-center gap-4 py-5 text-left sm:py-6"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-300">
                <Icon size={19} aria-hidden="true" />
              </span>

              <span className="flex-1 text-sm font-semibold leading-6 text-white sm:text-base">
                {item.question}
              </span>

              <ChevronDown
                size={19}
                aria-hidden="true"
                className={`shrink-0 text-neutral-400 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-fuchsia-300" : ""
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 pl-14 text-sm leading-7 text-neutral-400 sm:text-base">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function CreditHero({ data }) {
  const { hero } = data;

  if (!hero) return null;

  const visualSteps = hero.visual?.steps || [];

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
          {hero.eyebrow && (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/[0.07] px-4 py-2 text-xs font-semibold tracking-wide text-fuchsia-300 sm:text-sm">
              <Sparkles size={15} aria-hidden="true" />
              {hero.eyebrow}
            </div>
          )}

          <h1 className="max-w-3xl text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {hero.title}{" "}
            <span className="bg-gradient-to-r from-fuchsia-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              {hero.highlightedTitle}
            </span>
          </h1>

          {hero.description && (
            <p className="mt-7 max-w-2xl text-base leading-8 text-neutral-400 sm:text-lg">
              {hero.description}
            </p>
          )}

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            {hero.primaryCta && (
              <ActionLink href={hero.primaryCta.href}>
                {hero.primaryCta.label}
              </ActionLink>
            )}

            {hero.secondaryCta && (
              <ActionLink
                href={hero.secondaryCta.href}
                variant="secondary"
              >
                {hero.secondaryCta.label}
              </ActionLink>
            )}
          </div>

          <a
            href="#credits-overview"
            className="mt-10 inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-fuchsia-300"
          >
            Explore the credit system
            <ArrowDown size={15} aria-hidden="true" />
          </a>
        </motion.div>

        {hero.visual && (
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

              {visualSteps.length > 0 && (
                <div className="space-y-5 pt-7">
                  {visualSteps.map((step, index) => (
                    <div
                      key={`${step}-${index}`}
                      className="flex items-start gap-4"
                    >
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
              )}

              <div className="mt-7 rounded-xl border border-white/[0.06] bg-black/20 p-4">
                <p className="text-xs leading-6 text-neutral-500">
                  Your balance and credit usage are associated with your
                  Mystery Mansion account.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function InformationSection({ section, columns = 3 }) {
  if (!section) return null;

  return (
    <section className="px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
        />

        <FeatureGrid items={section.items || []} columns={columns} />
      </div>
    </section>
  );
}

function ImportantInformationSection({ section }) {
  if (!section) return null;

  const items = section.items || [];

  return (
    <section className="px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
          centered={false}
        />

        <div className="space-y-4">
          {items.map((item, index) => {
            const Icon = item.icon || CircleHelp;

            return (
              <motion.article
                key={`${item.title}-${index}`}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-neutral-900/60 p-5 sm:p-6"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-300">
                  <Icon size={21} aria-hidden="true" />
                </div>

                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>

                  {item.description && (
                    <p className="mt-2 text-sm leading-7 text-neutral-400 sm:text-base">
                      {item.description}
                    </p>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CreditFaqSection({ section }) {
  if (!section) return null;

  return (
    <section className="border-y border-white/[0.06] bg-neutral-900/30 px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
        />

        <CreditFaqs items={section.items || []} />
      </div>
    </section>
  );
}

function CreditsCta({ data }) {
  if (!data) return null;

  return (
    <section className="relative overflow-hidden px-5 py-20 sm:px-8 sm:py-28">
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
          <Coins size={27} aria-hidden="true" />
        </div>

        {data.eyebrow && (
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-fuchsia-400 sm:text-sm">
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
            <ActionLink href={data.primaryCta.href}>
              {data.primaryCta.label}
            </ActionLink>
          )}

          {data.secondaryCta && (
            <ActionLink
              href={data.secondaryCta.href}
              variant="secondary"
            >
              {data.secondaryCta.label}
            </ActionLink>
          )}
        </div>
      </motion.div>
    </section>
  );
}

export default function CreditsLearnMorePage() {
  const data = creditsLearnMoreData;

  useEffect(() => {
    setSEO(
      "Learn More About Credits | Mystery Mansion",
      "Learn how Mystery Mansion credits work, how to add credits, where they can be used, and how to understand your credit balance and activity."
    );
  }, []);

  if (!data) return null;

  return (
    <>
      <main className="min-h-screen overflow-hidden bg-neutral-950 text-white">
        <CreditHero data={data} />

        <div id="credits-overview" className="scroll-mt-20">
          <InformationSection section={data.introduction} columns={3} />
        </div>

        {data.gettingCredits && (
          <section className="border-y border-white/[0.06] bg-neutral-900/30 px-5 py-20 sm:px-8 sm:py-24">
            <div className="mx-auto max-w-7xl">
              <SectionHeading
                eyebrow={data.gettingCredits.eyebrow}
                title={data.gettingCredits.title}
                description={data.gettingCredits.description}
              />

              <CreditSteps items={data.gettingCredits.steps || []} />
            </div>
          </section>
        )}

        <InformationSection section={data.usingCredits} columns={3} />

        {data.usingCredits && (
          <section className="px-5 pb-20 sm:px-8 sm:pb-24">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-fuchsia-400/15 bg-fuchsia-500/[0.05] p-6 sm:flex-row sm:items-center sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-300">
                    <CircleHelp size={22} aria-hidden="true" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      Want the step-by-step explanation?
                    </h3>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
                      Visit our dedicated guide for a closer look at adding
                      credits, keeping your balance, using eligible features,
                      and tracking your activity.
                    </p>
                  </div>
                </div>

                <ActionLink
                  href="/credits/how-it-works"
                  variant="secondary"
                >
                  How Credits Work
                </ActionLink>
              </div>
            </div>
          </section>
        )}

        {data.trackingCredits && (
          <section className="border-y border-white/[0.06] bg-neutral-900/30 px-5 py-20 sm:px-8 sm:py-24">
            <div className="mx-auto max-w-7xl">
              <SectionHeading
                eyebrow={data.trackingCredits.eyebrow}
                title={data.trackingCredits.title}
                description={data.trackingCredits.description}
              />

              <FeatureGrid
                items={data.trackingCredits.items || []}
                columns={3}
              />
            </div>
          </section>
        )}

        <ImportantInformationSection
          section={data.importantInformation}
        />

        <CreditFaqSection section={data.faqs} />

        <CreditsCta data={data.cta} />
      </main>
    </>
  );
}