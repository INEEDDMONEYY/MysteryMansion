import { useEffect } from "react";
import { motion } from "framer-motion";
import { Info, ShieldCheck } from "lucide-react";

import { setSEO } from "@/shared/utils/seo";

import {
  CreditPackagesHero,
  CreditPackagesGrid,
  CreditPackagesCta,
} from "../components/credits/components";

import { creditPackagesPageData } from "../components/credits/data/creditPackagesPageData";

export default function CreditPackagesPage() {
  const { hero, packages, information, cta } = creditPackagesPageData;

  useEffect(() => {
    setSEO(
      "Credit Packages & Pricing | Mystery Mansion",
      "Explore Mystery Mansion credit packages, compare available prices and credit quantities, and learn how credits can be used on eligible platform features."
    );
  }, []);

  return (
    <>
      <main className="min-h-screen overflow-hidden bg-neutral-950 text-white">
        <CreditPackagesHero data={hero} />

        <section
          id="credit-packages"
          className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45 }}
              className="mx-auto mb-12 max-w-3xl text-center"
            >
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-fuchsia-400 sm:text-sm">
                Available Packages
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Choose your credit package.
              </h2>

              <p className="mt-5 text-base leading-7 text-neutral-400 sm:text-lg sm:leading-8">
                Compare package prices and included credits to find an option
                that suits your intended use of eligible Mystery Mansion
                features.
              </p>
            </motion.div>

            <CreditPackagesGrid packages={packages} />

            <div className="mt-8 flex items-start gap-3 rounded-xl border border-white/10 bg-neutral-900/50 p-4 sm:p-5">
              <Info
                size={20}
                className="mt-0.5 shrink-0 text-fuchsia-300"
                aria-hidden="true"
              />

              <p className="text-sm leading-6 text-neutral-400">
                Review the listed price, included credit quantity, and
                applicable purchase conditions before completing a
                transaction.
              </p>
            </div>
          </div>
        </section>

        {information && (
          <section className="border-y border-white/[0.06] bg-neutral-900/30 px-5 py-16 sm:px-8 sm:py-20">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45 }}
              className="mx-auto flex max-w-5xl flex-col gap-5 rounded-2xl border border-white/10 bg-neutral-900/80 p-6 sm:flex-row sm:items-start sm:p-8"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-300">
                <ShieldCheck size={23} aria-hidden="true" />
              </div>

              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-fuchsia-400">
                  {information.eyebrow}
                </p>

                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {information.title}
                </h2>

                <p className="mt-4 text-sm leading-7 text-neutral-400 sm:text-base">
                  {information.description}
                </p>
              </div>
            </motion.div>
          </section>
        )}

        <CreditPackagesCta data={cta} />
      </main>
    </>
  );
}