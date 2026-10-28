import { motion } from "framer-motion";
import { membershipPageData } from "../data/membershipPageData";

export default function MembershipBenefits() {
  const { benefits } = membershipPageData;

  return (
    <section className="relative overflow-hidden bg-black px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <span className="inline-flex rounded-full border border-yellow-300/25 bg-yellow-300/10 px-4 py-2 text-sm font-semibold text-yellow-200">
            {benefits.eyebrow}
          </span>

          <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            {benefits.title}
          </h2>

          <p className="mt-5 leading-7 text-neutral-400 sm:text-lg">
            {benefits.description}
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {benefits.items.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(index * 0.07, 0.25),
                }}
                whileHover={{ y: -4 }}
                className="group rounded-2xl border border-white/[0.08] bg-neutral-950/80 p-6 transition-colors hover:border-fuchsia-500/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-300 transition-colors group-hover:border-fuchsia-400/50 group-hover:bg-fuchsia-500/15">
                  <Icon size={23} />
                </div>

                <h3 className="mt-6 text-lg font-bold">{item.title}</h3>

                <p className="mt-3 text-sm leading-7 text-neutral-400">
                  {item.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}