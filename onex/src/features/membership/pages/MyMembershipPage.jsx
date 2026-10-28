import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  Coins,
  Crown,
  Lock,
  Rocket,
} from "lucide-react";

import { UserContext } from "@/context/UserContext";
import { setSEO } from "@/shared/utils/seo";
import useMembership from "../hooks/useMembership";
import { MEMBERSHIP_UPDATED_EVENT } from "../context/MembershipContext";
import {
  cancelMembershipRenewal,
  fetchMembershipPlans,
  renewMembershipNow,
  resumeMembershipRenewal,
  upgradeToPlan,
} from "../services/membershipService";

const TIER_ORDER = ["Standard", "Premium", "Elite"];

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

const HISTORY_LABELS = {
  subscribe: "Subscribed",
  upgrade: "Upgraded",
  renew: "Renewed",
  renew_failed: "Renewal failed",
  allocation: "Monthly coin allocation",
  cancel: "Auto-renew turned off",
  resume: "Auto-renew turned on",
  expire: "Membership expired",
};

// Each perk the plans can grant, with how to describe it for a given perks object.
const PERK_ROWS = [
  {
    key: "boostsPerMonth",
    label: "Post boosts",
    enabled: (p) => p.boostsPerMonth > 0,
    detail: (p, m) => `${m.boostsRemaining} of ${p.boostsPerMonth} left this billing period`,
  },
  {
    key: "editForumPosts",
    label: "Edit forum posts",
    enabled: (p) => p.editForumPosts,
    detail: () => "Edit your threads and replies",
  },
  {
    key: "maxPinnedThreads",
    label: "Pin forum threads",
    enabled: (p) => p.maxPinnedThreads > 0,
    detail: (p) => `Up to ${p.maxPinnedThreads} pinned thread${p.maxPinnedThreads === 1 ? "" : "s"}`,
  },
  {
    key: "forumUploads",
    label: "Forum image and GIF uploads",
    enabled: (p) => p.forumUploads,
    detail: () => "Attach images and GIFs to threads and replies",
  },
  {
    key: "createForumCategories",
    label: "Create forum categories",
    enabled: (p) => p.createForumCategories,
    detail: () => "Start new categories for the community",
  },
  {
    key: "forumBorderColor",
    label: "Forum card border customization",
    enabled: (p) => p.forumBorderColor,
    detail: () => "Pick a gradient border colour when you start a discussion",
  },
  {
    key: "profileBadge",
    label: "Membership badge on your profile",
    enabled: (p) => p.profileBadge,
    detail: () => "Shown next to your name",
  },
  {
    key: "betterSearchFilters",
    label: "Better search filters",
    enabled: (p) => p.betterSearchFilters,
    detail: () => "Extra filter options when searching",
  },
];

function Panel({ title, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      {title && <h2 className="text-base font-bold text-gray-900">{title}</h2>}
      <div className={title ? "mt-4" : ""}>{children}</div>
    </section>
  );
}

function ConfirmDialog({ title, body, confirmLabel, busy, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-600">{body}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="min-h-10 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="min-h-10 rounded-lg bg-pink-600 px-4 text-sm font-semibold text-white hover:bg-pink-500 disabled:opacity-50"
          >
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyMembershipPage() {
  const { user } = useContext(UserContext) || {};
  const { membership, refresh } = useMembership();
  const [plans, setPlans] = useState([]);
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const creditsPath = user?.accountType === "client" ? "/client/credits" : "/user/credits";

  useEffect(() => {
    setSEO("My Membership | Mystery Mansion", "", { robots: "noindex, nofollow" });
    fetchMembershipPlans().then(setPlans).catch(() => {});
  }, []);

  const currentPlan = membership.plan;
  const inGrace = membership.status === "grace";
  const cancelled = membership.active && membership.autoRenew === false;

  const upgrades = useMemo(() => {
    if (!currentPlan) return [];
    const currentIndex = TIER_ORDER.indexOf(currentPlan.id);

    return plans
      .filter((plan) => TIER_ORDER.indexOf(plan.id) > currentIndex)
      .map((plan) => ({ ...plan, cost: plan.monthlyCoinCost - currentPlan.monthlyCoinCost }));
  }, [plans, currentPlan]);

  // Which cheapest plan unlocks a perk the member does not have yet.
  const unlockedBy = (rowEnabled) =>
    plans.find((plan) => rowEnabled(plan.perks))?.id || null;

  const runAction = async (action, successMessage) => {
    setBusy(true);
    setFeedback(null);

    try {
      await action();
      await refresh();
      window.dispatchEvent(new Event(MEMBERSHIP_UPDATED_EVENT));
      setFeedback({ type: "success", message: successMessage });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setBusy(false);
      setDialog(null);
    }
  };

  if (!membership.loaded) {
    return (
      <div className="max-w-4xl animate-pulse space-y-4" aria-label="Loading membership">
        <div className="h-40 rounded-2xl bg-gray-200" />
        <div className="h-64 rounded-2xl bg-gray-200" />
      </div>
    );
  }

  if (membership.isAdmin) {
    return (
      <div className="max-w-4xl">
        <Panel>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
              <Crown className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Administrator access</h1>
              <p className="text-sm text-gray-600">Admin accounts have every membership perk without a subscription.</p>
            </div>
          </div>
        </Panel>
      </div>
    );
  }

  if (!membership.active) {
    return (
      <div className="max-w-4xl">
        <Panel>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
              <Rocket className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {membership.status === "expired" ? "Your membership has expired" : "No active membership"}
              </h1>
              <p className="text-sm text-gray-600">
                Memberships are paid with coins and unlock forum boosts, editing, pinning and more.
              </p>
            </div>
          </div>

          <Link
            to="/membership"
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-pink-600"
          >
            View membership plans
          </Link>
        </Panel>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-5 pb-8">
      {feedback && (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          className={`rounded-xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </p>
      )}

      {inGrace && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-bold text-amber-900">Your renewal could not be completed</p>
              <p className="mt-1 text-sm text-amber-800">
                You need {currentPlan.monthlyCoinCost.toLocaleString()} coins. Renew before{" "}
                <strong>{formatDateTime(membership.graceEndsAt)}</strong> or your membership will expire.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <Link
              to={creditsPath}
              className="inline-flex min-h-10 items-center rounded-lg border border-amber-400 px-4 text-sm font-semibold text-amber-900 hover:bg-amber-100"
            >
              Add coins
            </Link>
            <button
              type="button"
              disabled={busy}
              onClick={() => runAction(renewMembershipNow, "Membership renewed.")}
              className="min-h-10 rounded-lg bg-amber-600 px-4 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-60"
            >
              Renew now
            </button>
          </div>
        </div>
      )}

      <Panel>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-pink-600 text-white shadow-lg">
              <Crown className="h-7 w-7" />
            </span>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-600">Your membership</p>
              <h1 className="text-2xl font-black text-gray-950">{currentPlan.name}</h1>
              <span
                className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                  inGrace
                    ? "bg-amber-100 text-amber-800"
                    : cancelled
                      ? "bg-gray-100 text-gray-700"
                      : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {inGrace ? "Renewal pending" : cancelled ? "Ends at period end" : "Active"}
              </span>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4 text-sm sm:text-right">
            <div>
              <dt className="flex items-center gap-1 text-gray-500 sm:justify-end">
                <CalendarClock className="h-3.5 w-3.5" />
                {cancelled ? "Ends on" : "Renews on"}
              </dt>
              <dd className="mt-0.5 font-bold text-gray-900">{formatDate(membership.renewsAt)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-gray-500 sm:justify-end">
                <Coins className="h-3.5 w-3.5" />
                Monthly cost
              </dt>
              <dd className="mt-0.5 font-bold text-gray-900">{currentPlan.monthlyCoinCost.toLocaleString()} coins</dd>
            </div>
          </dl>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4 text-sm">
          <span className="text-gray-500">
            Coin balance: <strong className="text-gray-900">{membership.balance.toLocaleString()}</strong>
          </span>
          <Link to={creditsPath} className="font-semibold text-pink-600 underline underline-offset-4">
            Add coins
          </Link>

          <span className="ml-auto flex gap-2">
            {!inGrace &&
              (cancelled ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => runAction(resumeMembershipRenewal, "Auto-renew is back on.")}
                  className="min-h-10 rounded-lg bg-black px-4 text-sm font-semibold text-white hover:bg-pink-600 disabled:opacity-60"
                >
                  Turn auto-renew on
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    setDialog({
                      title: "Stop auto-renew?",
                      body: `Your perks stay active until ${formatDate(membership.renewsAt)}, then your membership ends.`,
                      confirmLabel: "Stop auto-renew",
                      run: () => runAction(cancelMembershipRenewal, "Auto-renew turned off."),
                    })
                  }
                  className="min-h-10 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel membership
                </button>
              ))}
          </span>
        </div>
      </Panel>

      <Panel title="Your perks">
        <ul className="grid gap-3 sm:grid-cols-2">
          {PERK_ROWS.map((row) => {
            const on = row.enabled(membership.perks);
            const needs = on ? null : unlockedBy(row.enabled);

            return (
              <li
                key={row.key}
                className={`flex items-start gap-3 rounded-xl border p-3 ${
                  on ? "border-emerald-200 bg-emerald-50/50" : "border-gray-200 bg-gray-50"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    on ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {on ? <Check className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                </span>

                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${on ? "text-gray-900" : "text-gray-500"}`}>{row.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {on ? row.detail(membership.perks, membership) : needs ? `Available on ${needs}` : "Not included"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <h3 className="mt-6 text-sm font-bold text-gray-900">Everything in {currentPlan.name}</h3>
        <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {currentPlan.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm text-gray-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-pink-600" />
              {benefit}
            </li>
          ))}
        </ul>
      </Panel>

      {upgrades.length > 0 && !inGrace && (
        <Panel title="Upgrade your plan">
          <ul className="space-y-3">
            {upgrades.map((plan) => (
              <li key={plan.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-gray-900">{plan.name}</p>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    setDialog({
                      title: `Upgrade to ${plan.name}?`,
                      body: `You pay the difference of ${plan.cost.toLocaleString()} coins now. Your billing date stays ${formatDate(
                        membership.renewsAt
                      )}.`,
                      confirmLabel: `Pay ${plan.cost.toLocaleString()} coins`,
                      run: () => runAction(() => upgradeToPlan(plan.id), `Upgraded to ${plan.name}.`),
                    })
                  }
                  className="min-h-10 shrink-0 rounded-lg bg-gradient-to-r from-fuchsia-600 to-pink-600 px-4 text-sm font-bold text-white hover:brightness-110 disabled:opacity-60"
                >
                  Upgrade for {plan.cost.toLocaleString()} coins
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {membership.history.length > 0 && (
        <Panel title="Recent activity">
          <ul className="divide-y divide-gray-100">
            {membership.history.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{HISTORY_LABELS[entry.type] || entry.type}</p>
                  <p className="text-xs text-gray-500">
                    {entry.tier} · {formatDateTime(entry.createdAt)}
                  </p>
                </div>
                {entry.amount !== 0 && (
                  <span className={`shrink-0 font-semibold ${entry.amount > 0 ? "text-emerald-600" : "text-gray-700"}`}>
                    {entry.amount > 0 ? "+" : ""}
                    {entry.amount.toLocaleString()} coins
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {dialog && (
        <ConfirmDialog
          title={dialog.title}
          body={dialog.body}
          confirmLabel={dialog.confirmLabel}
          busy={busy}
          onConfirm={dialog.run}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  );
}
