import { motion } from "framer-motion";
import { ArrowRight, Coins } from "lucide-react";
import { useContext } from "react";
import { Link } from "react-router-dom";

import { UserContext } from "@/context/UserContext";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);

const formatCredits = (credits) =>
  new Intl.NumberFormat("en-US").format(credits);

export default function CreditPackageCard({ pack, index = 0 }) {
  const { user } = useContext(UserContext) || {};

  if (!pack) return null;

  const isLoggedIn = Boolean(user?._id);
  const creditsPath = user?.accountType === "client" ? "/client/credits" : "/user/credits";
  const packageHref = isLoggedIn
    ? `${creditsPath}?credits=${pack.credits}&package=${encodeURIComponent(pack.name)}`
    : `/signup?package=${encodeURIComponent(pack.id)}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.07 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 p-6 transition duration-300 hover:-translate-y-1 hover:border-fuchsia-400/35 hover:bg-neutral-900 sm:p-7"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/40 to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="flex items-center justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-300">
          <Coins size={23} aria-hidden="true" />
        </div>

        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-neutral-400">
          Credit Package
        </span>
      </div>

      <h2 className="mt-7 text-xl font-bold text-white sm:text-2xl">
        {pack.name}
      </h2>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {formatPrice(pack.price)}
        </span>

        <span className="text-sm text-neutral-500">USD</span>
      </div>

      <div className="mt-6 rounded-xl border border-fuchsia-400/20 bg-fuchsia-500/[0.06] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
          Credits Included
        </p>

        <div className="mt-2 flex items-center gap-2">
          <Coins
            size={20}
            className="shrink-0 text-fuchsia-300"
            aria-hidden="true"
          />

          <span className="text-2xl font-bold text-white">
            {formatCredits(pack.credits)}
          </span>

          <span className="text-sm text-neutral-400">
            credits
          </span>
        </div>
      </div>

      <p className="mt-4 flex-1 text-sm leading-7 text-neutral-400">
        Use your credits on eligible Mystery Mansion platform features when
        credits are required.
      </p>

      <div className="mt-7 border-t border-white/10 pt-6">
        <Link
          to={packageHref}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-5 py-3.5 text-sm font-semibold text-fuchsia-200 transition hover:border-fuchsia-400/60 hover:bg-fuchsia-500/20 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 focus:ring-offset-neutral-950"
        >
          Choose Package
          <ArrowRight size={16} aria-hidden="true" />
        </Link>

        <p className="mt-3 text-center text-xs leading-5 text-neutral-500">
          {isLoggedIn
            ? "Finish your refill from your credits dashboard."
            : "Continue through your account to proceed."}
        </p>
      </div>
    </motion.article>
  );
}