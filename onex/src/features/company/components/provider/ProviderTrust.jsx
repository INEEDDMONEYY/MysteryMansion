import { motion } from "framer-motion";
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
    x: -25,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut",
    },
  },
};

export default function ProviderTrust() {
  const { trust } = providerPageData;

  const QuoteIcon = trust.quote.icon;

  return (
    <section className="relative overflow-hidden bg-black px-6 py-24 text-white lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-pink-600/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-yellow-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-400">
                {trust.eyebrow}
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                {trust.title}
              </h2>

              <p className="mt-6 max-w-xl text-lg leading-8 text-gray-400">
                {trust.description}
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="mt-10 space-y-5"
            >
              {trust.points.map((point) => {
                const Icon = point.icon;

                return (
                  <motion.div
                    key={point.title}
                    variants={itemVariants}
                    className="flex gap-4"
                  >
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-bold text-white">
                        {point.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-gray-400">
                        {point.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0, x: 35, scale: 0.96 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-pink-500/20 to-yellow-400/10 blur-2xl" />

            <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-sm sm:p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-400">
                <QuoteIcon className="h-7 w-7" />
              </div>

              <blockquote className="mt-8 text-2xl font-semibold leading-10 text-white sm:text-3xl">
                “{trust.quote.text}”
              </blockquote>

              <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500 text-white">
                  <QuoteIcon className="h-4 w-4" />
                </div>

                <span className="text-sm text-gray-400">
                  {trust.quote.label}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}