import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Coins, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { UserContext } from "@/context/UserContext";
import useMembership from "@/features/membership/hooks/useMembership";
import { MEMBERSHIP_UPDATED_EVENT } from "@/features/membership/context/MembershipContext";
import {
  fetchMembershipPlans,
  subscribeToPlan,
  upgradeToPlan,
} from "@/features/membership/services/membershipService";

const TIER_ORDER = ["Standard", "Premium", "Elite"];

const buttonClass =
  "mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-5 py-3.5 font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60";

const mutedButtonClass =
  "mt-8 inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 px-5 py-3.5 font-bold text-neutral-500";

export default function MembershipPlans() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext) || {};
  const { membership, refresh } = useMembership();

  const [plans, setPlans] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMembershipPlans()
      .then(setPlans)
      .catch(() => setPlans([]));
  }, []);

  const dashboardBase = user?.accountType === "client" ? "/client" : "/user";
  const currentIndex = membership.active ? TIER_ORDER.indexOf(membership.tier) : -1;

  const startPurchase = (plan) => {
    setError("");

    if (membership.active) {
      const cost = plan.monthlyCoinCost - membership.plan.monthlyCoinCost;
      setConfirm({ plan, cost, upgrade: true });
    } else {
      setConfirm({ plan, cost: plan.monthlyCoinCost, upgrade: false });
    }
  };

  const completePurchase = async () => {
    setBusy(true);
    setError("");

    try {
      if (confirm.upgrade) await upgradeToPlan(confirm.plan.id);
      else await subscribeToPlan(confirm.plan.id);

      await refresh();
      window.dispatchEvent(new Event(MEMBERSHIP_UPDATED_EVENT));
      setConfirm(null);
      navigate(`${dashboardBase}/membership`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const renderAction = (plan) => {
    if (!user?._id) {
      return (
        <button type="button" onClick={() => navigate("/signin")} className={buttonClass}>
          Sign in to subscribe
          <ArrowRight size={17} />
        </button>
      );
    }

    if (membership.isAdmin) {
      return <button type="button" disabled className={mutedButtonClass}>Admins have every perk</button>;
    }

    if (!membership.loaded) {
      return <button type="button" disabled className={mutedButtonClass}>Loading...</button>;
    }

    const index = TIER_ORDER.indexOf(plan.id);

    if (membership.active) {
      if (index === currentIndex) {
        return (
          <Link to={`${dashboardBase}/membership`} className={buttonClass}>
            Your plan — manage
            <ArrowRight size={17} />
          </Link>
        );
      }

      if (index < currentIndex) {
        return <button type="button" disabled className={mutedButtonClass}>Below your current plan</button>;
      }

      const cost = plan.monthlyCoinCost - membership.plan.monthlyCoinCost;

      return membership.balance < cost ? (
        <Link to={`${dashboardBase}/credits`} className={buttonClass}>
          Add {(cost - membership.balance).toLocaleString()} more coins
        </Link>
      ) : (
        <button type="button" onClick={() => startPurchase(plan)} className={buttonClass}>
          Upgrade for {cost.toLocaleString()} coins
          <ArrowRight size={17} />
        </button>
      );
    }

    return membership.balance < plan.monthlyCoinCost ? (
      <Link to={`${dashboardBase}/credits`} className={buttonClass}>
        Add {(plan.monthlyCoinCost - membership.balance).toLocaleString()} more coins
      </Link>
    ) : (
      <button type="button" onClick={() => startPurchase(plan)} className={buttonClass}>
        Subscribe
        <ArrowRight size={17} />
      </button>
    );
  };

  return (
    <section
      id="membership-plans"
      className="relative scroll-mt-24 overflow-hidden bg-neutral-950 px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-2 text-sm font-semibold text-fuchsia-300">
            <Sparkles size={16} />
            Membership Options
          </span>

          <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Find your membership.
          </h2>

          <p className="mt-5 text-base leading-7 text-neutral-400 sm:text-lg">
            Compare monthly coin costs and included benefits before you subscribe.
          </p>

          {membership.active && (
            <p className="mt-4 text-sm font-semibold text-emerald-300">
              You are on the {membership.plan.name}.
            </p>
          )}
        </motion.div>

        {plans === null ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading plans">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-96 animate-pulse rounded-2xl bg-neutral-900" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-fuchsia-500/40 via-neutral-700 to-yellow-300/30 p-px">
            <div className="rounded-3xl bg-neutral-950 px-6 py-12 text-center sm:px-12 sm:py-16">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-300/25 bg-yellow-300/10 text-yellow-200">
                <Coins size={30} />
              </div>

              <h3 className="mt-6 text-2xl font-black sm:text-3xl">Membership options are unavailable.</h3>

              <p className="mx-auto mt-4 max-w-xl leading-7 text-neutral-400">
                We could not load the plans right now. Please try again in a moment.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.article
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: Math.min(index * 0.08, 0.3) }}
                whileHover={{ y: -5 }}
                className={`relative flex h-full flex-col rounded-2xl p-px ${
                  plan.featured
                    ? "bg-gradient-to-br from-fuchsia-400 via-pink-600 to-yellow-300"
                    : "bg-gradient-to-br from-neutral-700 via-neutral-800 to-fuchsia-500/30"
                }`}
              >
                <div className="flex h-full flex-col rounded-2xl bg-neutral-950 p-6 sm:p-7">
                  {plan.featured && (
                    <span className="mb-4 inline-flex w-fit rounded-full bg-yellow-300 px-3 py-1 text-xs font-black uppercase tracking-wider text-black">
                      Featured
                    </span>
                  )}

                  <h3 className="text-2xl font-black">{plan.name}</h3>

                  <p className="mt-3 min-h-12 leading-6 text-neutral-400">{plan.description}</p>

                  <div className="my-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm text-neutral-500">Monthly subscription</p>

                    <div className="mt-2 flex items-center gap-2">
                      <Coins className="shrink-0 text-yellow-300" size={23} />
                      <span className="text-3xl font-black">{plan.monthlyCoinCost.toLocaleString()}</span>
                    </div>

                    <p className="mt-1 text-sm text-neutral-500">platform coins per month</p>
                  </div>

                  <div className="flex-1">
                    <p className="mb-4 text-sm font-bold text-neutral-200">What's included</p>

                    <ul className="space-y-3">
                      {plan.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-3 text-sm leading-6 text-neutral-300">
                          <Check className="mt-1 shrink-0 text-fuchsia-300" size={16} />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {renderAction(plan)}

                  <p className="mt-3 text-center text-xs leading-5 text-neutral-500">
                    Subscription payments are processed by the backend.
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) setConfirm(null);
          }}
        >
          <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-2xl bg-white p-6 text-gray-900 shadow-2xl">
            <h3 className="text-lg font-bold">
              {confirm.upgrade ? `Upgrade to ${confirm.plan.name}?` : `Subscribe to ${confirm.plan.name}?`}
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {confirm.upgrade
                ? `You pay ${confirm.cost.toLocaleString()} coins now, the difference between plans. Your billing date does not change.`
                : `${confirm.cost.toLocaleString()} coins are charged now and again every month. You can stop auto-renew any time from My Membership.`}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Balance after payment: {(membership.balance - confirm.cost).toLocaleString()} coins
            </p>

            {error && (
              <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                disabled={busy}
                className="min-h-10 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={completePurchase}
                disabled={busy}
                className="min-h-10 rounded-lg bg-pink-600 px-4 text-sm font-semibold text-white hover:bg-pink-500 disabled:opacity-50"
              >
                {busy ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
