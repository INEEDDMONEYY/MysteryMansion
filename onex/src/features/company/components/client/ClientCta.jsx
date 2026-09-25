import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { clientPageData } from "../../data/clientPageData";

export default function ClientCta() {
  const { cta } = clientPageData;

  return (
    <section className="relative overflow-hidden bg-white px-6 py-28 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-100/70 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-4xl text-center"
      >
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">
          {cta.eyebrow}
        </p>

        <h2 className="mt-5 text-4xl font-black tracking-tight text-gray-950 sm:text-6xl">
          {cta.title}
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
          {cta.description}
        </p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-9 flex flex-wrap justify-center gap-4"
        >
          <Link
            to={cta.primaryCta.href}
            className="group inline-flex items-center gap-2 rounded-xl bg-pink-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-pink-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-pink-500 hover:shadow-xl hover:shadow-pink-600/30 active:scale-[0.98]"
          >
            {cta.primaryCta.label}

            <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          <Link
            to={cta.secondaryCta.href}
            className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-7 py-3.5 font-semibold text-gray-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md active:scale-[0.98]"
          >
            {cta.secondaryCta.label}
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}