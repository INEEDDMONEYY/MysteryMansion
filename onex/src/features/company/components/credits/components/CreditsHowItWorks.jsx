import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { creditsPageData } from "../data/creditsPageData";

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

export default function CreditsHowItWorks() {
  const { howItWorks } = creditsPageData;

  return (
    <section className="bg-gray-50 px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">
            {howItWorks.eyebrow}
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">
            {howItWorks.title}
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            {howItWorks.description}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-14 grid gap-6 md:grid-cols-2"
        >
          {howItWorks.steps.map((step) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group relative rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all duration-300 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-100/60"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-600 transition-all duration-300 group-hover:bg-pink-600 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>

                  <span className="text-5xl font-black leading-none text-gray-100 transition-colors duration-300 group-hover:text-pink-100">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-bold text-gray-950">
                  {step.title}
                </h3>

                <p className="mt-3 max-w-xl text-sm leading-7 text-gray-600">
                  {step.description}
                </p>

                <ArrowRight className="absolute bottom-7 right-7 h-5 w-5 text-gray-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-pink-500" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}