import { motion } from "framer-motion";
import { communityGuidelinesData } from "../data/communityGuidelinesData";

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

export default function CommunityGuidelinesSection() {
  const { introduction, guidelines, moderation, closing } =
    communityGuidelinesData;

  return (
    <>
      <section className="bg-white px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">
              {introduction.eyebrow}
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">
              {introduction.title}
            </h2>

            <p className="mt-5 text-lg leading-8 text-gray-600">
              {introduction.description}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-14 grid gap-6 md:grid-cols-2"
          >
            {guidelines.map((guideline, index) => {
              const Icon = guideline.icon;

              return (
                <motion.article
                  key={guideline.title}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all duration-300 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-100/60"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-600 transition-colors duration-300 group-hover:bg-pink-600 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="text-sm font-black text-gray-200">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-7 text-xl font-bold text-gray-950">
                    {guideline.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    {guideline.description}
                  </p>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">
                {moderation.eyebrow}
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">
                {moderation.title}
              </h2>

              <p className="mt-5 text-lg leading-8 text-gray-600">
                {moderation.description}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10"
            >
              <div className="space-y-6">
                {moderation.items.map((item, index) => (
                  <div
                    key={item}
                    className="flex gap-4 border-b border-gray-100 pb-6 last:border-b-0 last:pb-0"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-50 text-sm font-bold text-pink-600">
                      {index + 1}
                    </div>

                    <p className="text-sm leading-7 text-gray-600">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-24 text-white lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-400">
              {closing.eyebrow}
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              {closing.title}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-300">
              {closing.description}
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}