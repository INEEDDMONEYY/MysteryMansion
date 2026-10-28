import { motion } from "framer-motion";
import {
  AlertTriangle,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Coins,
  ShieldCheck,
} from "lucide-react";
import { membershipPageData } from "../data/membershipPageData";

const renewalIcons = [AlertTriangle, BellRing, Coins, Clock3];

export default function MembershipHowItWorks() {
  const { howItWorks, renewal } = membershipPageData;

  return (
    <>
      <section
        id="membership-how-it-works"
        className="scroll-mt-24 bg-neutral-950 px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
            className="mx-auto mb-14 max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-2 text-sm font-semibold text-fuchsia-300">
              <CalendarClock size={16} />
              {howItWorks.eyebrow}
            </span>

            <h2 className="mt-5 text-3xl font-black sm:text-4xl">
              {howItWorks.title}
            </h2>

            <p className="mt-5 leading-7 text-neutral-400 sm:text-lg">
              {howItWorks.description}
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {howItWorks.steps.map((step, index) => (
              <motion.article
                key={step.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(index * 0.08, 0.3),
                }}
                className="relative rounded-2xl border border-white/[0.08] bg-black p-6"
              >
                <span className="text-sm font-black tracking-[0.2em] text-fuchsia-400">
                  {step.number}
                </span>

                <h3 className="mt-5 text-xl font-bold">{step.title}</h3>

                <p className="mt-3 text-sm leading-7 text-neutral-400">
                  {step.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-black px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-24">
        <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-[130px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-yellow-300/25 bg-yellow-300/10 px-4 py-2 text-sm font-semibold text-yellow-200">
                <Clock3 size={16} />
                {renewal.eyebrow}
              </span>

              <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
                {renewal.title}
              </h2>

              <p className="mt-5 leading-7 text-neutral-400">
                {renewal.description}
              </p>

              <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-5 py-4">
                <Clock3 className="text-fuchsia-300" size={28} />

                <div>
                  <p className="text-2xl font-black text-white">
                    {renewal.gracePeriod}
                  </p>
                  <p className="text-sm text-neutral-400">
                    Fixed renewal grace period
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-4">
              {renewal.steps.map((step, index) => {
                const Icon = renewalIcons[index] || CheckCircle2;

                return (
                  <motion.article
                    key={step.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{
                      duration: 0.45,
                      delay: Math.min(index * 0.07, 0.25),
                    }}
                    className="flex gap-4 rounded-2xl border border-white/[0.08] bg-neutral-950 p-5 sm:p-6"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-300">
                      <Icon size={21} />
                    </div>

                    <div>
                      <h3 className="font-bold text-white">{step.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-neutral-400">
                        {step.description}
                      </p>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-xl border border-yellow-300/20 bg-yellow-300/[0.05] p-4 text-sm leading-6 text-neutral-300">
            <ShieldCheck
              className="mt-0.5 shrink-0 text-yellow-200"
              size={20}
            />
            <p>{renewal.note}</p>
          </div>
        </div>
      </section>
    </>
  );
}