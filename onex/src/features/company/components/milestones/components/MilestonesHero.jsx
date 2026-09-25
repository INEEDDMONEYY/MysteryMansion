import { motion } from "framer-motion";
import { ArrowRight, Flag, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { milestonesPageData } from "../data/milestonesPageData";

export default function MilestonesHero() {
  const { hero } = milestonesPageData;

  return (
    <section className="relative overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-yellow-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center px-6 py-24 lg:px-8">
        <div className="grid w-full items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-500/10 px-4 py-2 text-sm font-medium text-pink-300"
            >
              <Flag className="h-4 w-4" />
              {hero.eyebrow}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
            >
              {hero.title}

              <span className="block bg-gradient-to-r from-pink-400 via-pink-500 to-yellow-400 bg-clip-text text-transparent">
                {hero.highlightedTitle}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-7 max-w-2xl text-lg leading-8 text-gray-300 sm:text-xl"
            >
              {hero.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="mt-9 flex flex-wrap gap-4"
            >
              <a
                href={hero.primaryCta.href}
                className="group inline-flex items-center gap-2 rounded-xl bg-pink-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-pink-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-pink-500 hover:shadow-xl hover:shadow-pink-600/30 active:scale-[0.98]"
              >
                {hero.primaryCta.label}

                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </a>

              <Link
                to={hero.secondaryCta.href}
                className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
              >
                {hero.secondaryCta.label}
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.25,
              duration: 0.8,
              ease: "easeOut",
            }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl shadow-pink-900/20"
            >
              <div className="rounded-2xl bg-gradient-to-br from-pink-600 via-pink-500 to-yellow-400 p-[1px]">
                <div className="rounded-2xl bg-black p-8">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">
                        {hero.visual.label}
                      </p>

                      <h2 className="mt-1 text-2xl font-bold">
                        {hero.visual.title}
                      </h2>
                    </div>

                    <div className="rounded-xl bg-pink-500/10 p-3 text-pink-400">
                      <Sparkles className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {hero.visual.steps.map((step, index) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.8 + index * 0.12,
                          duration: 0.4,
                        }}
                        className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-500/10 text-sm font-bold text-pink-400">
                          {index + 1}
                        </div>

                        <span className="text-sm font-medium text-gray-200">
                          {step}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}