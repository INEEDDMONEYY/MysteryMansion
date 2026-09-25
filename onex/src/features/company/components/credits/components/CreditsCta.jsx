import { motion } from "framer-motion";
import { ArrowRight, Coins } from "lucide-react";
import { Link } from "react-router-dom";

export default function CreditsCta() {
  return (
    <section className="bg-black px-6 py-24 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] px-8 py-14 shadow-2xl sm:px-12 lg:px-16 lg:py-16"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-500/10 px-4 py-2 text-sm font-medium text-pink-300">
                <Coins className="h-4 w-4" />
                Mystery Mansion Credits
              </div>

              <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
                Ready to learn more about credits?
              </h2>

              <p className="mt-5 text-lg leading-8 text-gray-300">
                Explore the Mystery Mansion credit system and understand how
                credits fit into the platform before using them.
              </p>
            </div>

            <Link
              to="/credits/how-it-works"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-pink-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-pink-500 hover:shadow-xl hover:shadow-pink-600/30 sm:w-auto"
            >
              Learn More
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}