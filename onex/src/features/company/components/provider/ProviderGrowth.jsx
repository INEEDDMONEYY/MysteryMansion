import { motion } from "framer-motion";
import { providerPageData } from "../../data/providerPageData";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
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

export default function ProviderGrowth() {
  const { growth } = providerPageData;

  return (
    <section className="relative overflow-hidden bg-white px-6 py-24 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-pink-100/70 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-yellow-100/60 blur-3xl" />
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
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">
                {growth.eyebrow}
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">
                {growth.title}
              </h2>

              <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
                {growth.description}
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="mt-10 space-y-5"
            >
              {growth.points.map((point) => {
                const Icon = point.icon;

                return (
                  <motion.div
                    key={point.title}
                    variants={itemVariants}
                    className="flex gap-4"
                  >
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-950">
                        {point.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        {point.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Growth Visual */}
          <motion.div
            initial={{ opacity: 0, x: 35, scale: 0.96 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-pink-200/70 to-yellow-100/60 blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl sm:p-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-600">
                    {growth.visual.label}
                  </p>

                  <h3 className="mt-2 text-2xl font-black text-gray-950">
                    Build your presence
                  </h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                  <div className="h-3 w-3 rounded-full bg-pink-600" />
                </div>
              </div>

              <div className="mt-10 space-y-4">
                {growth.visual.metrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.15 + index * 0.12,
                      duration: 0.5,
                    }}
                    className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-black text-pink-600 shadow-sm">
                      {metric.value}
                    </div>

                    <div className="h-px flex-1 bg-gray-200" />

                    <span className="font-bold text-gray-900">
                      {metric.label}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl bg-black p-5">
                <p className="text-sm leading-6 text-gray-400">
                  Growth starts with creating a presence people can discover,
                  understand, and connect with.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}