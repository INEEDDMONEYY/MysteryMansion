import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { providerPageData } from "../../data/providerPageData";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function ProviderHero() {
  const { hero } = providerPageData;

  return (
    <section className="relative overflow-hidden bg-black px-6 py-24 text-white sm:py-28 lg:px-8 lg:py-32">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-pink-600/20 blur-3xl" />
        <div className="absolute right-[-10rem] top-1/3 h-[32rem] w-[32rem] rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/3 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-pink-300 backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4" />
              {hero.eyebrow}
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mt-7 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl"
            >
              {hero.title}{" "}
              <span className="bg-gradient-to-r from-pink-400 via-pink-500 to-yellow-300 bg-clip-text text-transparent">
                {hero.highlightedTitle}
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-7 max-w-2xl text-lg leading-8 text-gray-400 sm:text-xl"
            >
              {hero.description}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-9 flex flex-wrap gap-4"
            >
              <Link
                to={hero.primaryCta.href}
                className="group inline-flex items-center gap-2 rounded-xl bg-pink-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-pink-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-pink-500 hover:shadow-xl hover:shadow-pink-600/30 active:scale-[0.98]"
              >
                {hero.primaryCta.label}

                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <a
                href={hero.secondaryCta.href}
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-7 py-3.5 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98]"
              >
                {hero.secondaryCta.label}
              </a>
            </motion.div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.25,
              ease: "easeOut",
            }}
            className="relative mx-auto w-full max-w-xl lg:mx-0"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              {/* Glow */}
              <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-pink-500/25 via-transparent to-yellow-400/15 blur-2xl" />

              {/* Main Card */}
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-400">
                      {hero.visual.label}
                    </p>

                    <h2 className="mt-2 text-2xl font-black text-white">
                      {hero.visual.title}
                    </h2>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-7 space-y-4">
                  {hero.visual.steps.map((step, index) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.7 + index * 0.15,
                        duration: 0.5,
                      }}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-sm font-black text-pink-400">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold text-white">{step}</p>
                      </div>

                      <div className="h-2 w-2 rounded-full bg-pink-400 shadow-lg shadow-pink-500/50" />
                    </motion.div>
                  ))}
                </div>

                <div className="mt-7 rounded-2xl border border-pink-500/10 bg-gradient-to-r from-pink-500/10 to-yellow-400/5 p-5">
                  <p className="text-sm leading-6 text-gray-400">
                    Build your presence, showcase your work, and connect with
                    the people looking for what you provide.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}