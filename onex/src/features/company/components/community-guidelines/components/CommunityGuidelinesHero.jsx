import { motion } from "framer-motion";
import { ShieldCheck, Sparkles } from "lucide-react";
import { communityGuidelinesData } from "../data/communityGuidelinesData";

export default function CommunityGuidelinesHero() {
  const { hero } = communityGuidelinesData;

  return (
    <section className="relative overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-yellow-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[640px] max-w-7xl items-center px-6 py-24 lg:px-8">
        <div className="grid w-full items-center gap-16 lg:grid-cols-[1.15fr_0.85fr]">
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
              <Sparkles className="h-4 w-4" />
              {hero.eyebrow}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="max-w-4xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
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
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl shadow-pink-900/20"
            >
              <div className="rounded-2xl bg-gradient-to-br from-pink-600 via-pink-500 to-yellow-400 p-[1px]">
                <div className="rounded-2xl bg-black p-8">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="text-sm text-gray-400">
                        Community Standard
                      </p>

                      <h2 className="mt-1 text-2xl font-bold">
                        Respect. Safety. Accountability.
                      </h2>
                    </div>

                    <div className="rounded-xl bg-pink-500/10 p-3 text-pink-400">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    {[
                      "Respect personal boundaries",
                      "Use authentic information",
                      "Protect private information",
                      "Report harmful behavior",
                    ].map((item, index) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.7 + index * 0.12,
                          duration: 0.4,
                        }}
                        className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-500/10 text-sm font-bold text-pink-400">
                          {index + 1}
                        </div>

                        <span className="text-sm font-medium text-gray-200">
                          {item}
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