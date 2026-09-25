import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { clientPageData } from "../../data/clientPageData";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const stepVariants = {
  hidden: {
    opacity: 0,
    y: 35,
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

export default function ClientHowItWorks() {
  const { howItWorks } = clientPageData;

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-gray-950 px-6 py-24 text-white lg:px-8"
    >
      <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-pink-600/10 blur-3xl" />
      <div className="absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-yellow-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
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
          viewport={{ once: true, amount: 0.15 }}
          className="mt-16 grid gap-8 lg:grid-cols-3"
        >
          {howItWorks.steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                variants={stepVariants}
                className="relative"
              >
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black tracking-widest text-pink-400">
                      {step.number}
                    </span>

                    <div className="rounded-xl bg-pink-500/10 p-3 text-pink-400">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  <h3 className="mt-8 text-2xl font-bold">{step.title}</h3>

                  <p className="mt-4 leading-7 text-gray-400">
                    {step.description}
                  </p>
                </div>

                {index < howItWorks.steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.4,
                      duration: 0.5,
                    }}
                    className="absolute -right-5 top-1/2 hidden origin-left lg:block"
                  >
                    <ArrowRight className="h-8 w-8 text-pink-500/60" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}