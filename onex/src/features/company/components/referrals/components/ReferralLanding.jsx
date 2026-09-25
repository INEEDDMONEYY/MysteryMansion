import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Link2,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ReferralLanding({
  providerName = "A Mystery Mansion Provider",
  referralCode = "",
}) {
  const signupHref = referralCode
    ? `/signup?type=client&ref=${encodeURIComponent(referralCode)}`
    : "/signup?type=client";

  return (
    <section className="relative overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-pink-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-yellow-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-24 lg:px-8 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-500/10 px-4 py-2 text-sm font-medium text-pink-300">
            <Link2 className="h-4 w-4" />
            You have been invited
          </div>

          <h1 className="mt-7 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
            Welcome to
            <span className="block bg-gradient-to-r from-pink-400 via-pink-500 to-yellow-400 bg-clip-text text-transparent">
              Mystery Mansion.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-gray-300 sm:text-xl">
            <span className="font-semibold text-white">
              {providerName}
            </span>{" "}
            invited you to explore Mystery Mansion and create a Client
            account.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              to={signupHref}
              className="group inline-flex items-center gap-2 rounded-xl bg-pink-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-pink-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-pink-500 hover:shadow-xl hover:shadow-pink-600/30"
            >
              Create Client Account
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <Link
              to="/home"
              className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10"
            >
              Explore First
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.7,
            ease: "easeOut",
          }}
          className="mx-auto mt-16 grid max-w-5xl gap-5 md:grid-cols-3"
        >
          {[
            {
              title: "Personal Invitation",
              description:
                "This invitation connects you to the Mystery Mansion experience through your referring provider.",
              icon: BadgeCheck,
            },
            {
              title: "Client Access",
              description:
                "Continue into Client registration to begin exploring profiles, categories, and platform features.",
              icon: UserPlus,
            },
            {
              title: "Built for the Community",
              description:
                "Mystery Mansion is designed to help providers and clients connect through a structured platform experience.",
              icon: ShieldCheck,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                whileHover={{ y: -5 }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 transition-all duration-300 hover:border-pink-400/30"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
                  <Icon className="h-5 w-5" />
                </div>

                <h2 className="mt-6 text-xl font-bold">
                  {item.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-gray-400">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mx-auto mt-8 flex max-w-5xl items-center justify-center gap-2 text-center text-xs text-gray-500">
          <Sparkles className="h-4 w-4 text-pink-400" />
          Your invitation information can be connected to the referral system
          when registration begins.
        </div>
      </div>
    </section>
  );
}