import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut",
    },
  },
};

export default function ProviderHowItWorks() {
  const { howItWorks } = providerPageData;

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-black px-6 py-24 text-white lg:px-8"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-80 w-80 rounded-full bg-pink-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-yellow-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-400">
            {howItWorks.eyebrow}
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            {howItWorks.title}
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-400">
            {howItWorks.description}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-14 grid gap-5 lg:grid-cols-4"
        >
          {howItWorks.steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-7 transition-all duration-300 hover:border-pink-500/30 hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
                    <Icon className="h-5 w-5" />
                  </div>

                  <span className="text-sm font-black tracking-widest text-white/20">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-bold text-white">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-400">
                  {step.description}
                </p>

                {index < howItWorks.steps.length - 1 && (
                  <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-black text-gray-500">
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}