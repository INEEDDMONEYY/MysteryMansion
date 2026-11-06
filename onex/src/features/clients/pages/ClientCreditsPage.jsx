import BrandLoader from "@/shared/components/Loaders/BrandLoader";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Coins,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Zap,
  Copy,
  DollarSign,
  Rocket,
  BadgeCheck,
} from "lucide-react";
import { UserContext } from "@/context/UserContext";
import api from "@/shared/utils/api";
import { setSEO } from "@/shared/utils/seo";
import EarnCreditsPanel from "@/shared/components/credits/EarnCreditsPanel";

function fmt(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function PackageCard({ pkg, onSelect, selected }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(pkg)}
      className={`relative flex w-full flex-col items-start rounded-2xl border-2 p-4 text-left transition-all ${
        selected
          ? "border-black bg-gray-100 shadow-md"
          : pkg.isPopular
            ? "border-gray-500 bg-gray-50"
            : "border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50"
      }`}
    >
      {pkg.isPopular && (
        <span className="absolute -top-3 left-3 flex items-center gap-1 rounded-full bg-black px-2.5 py-0.5 text-[10px] font-bold text-white">
          <Star size={9} fill="currentColor" />
          Popular
        </span>
      )}

      <p className="text-sm font-bold text-gray-900">
        {pkg.name}
      </p>

      {pkg.description && (
        <p className="mt-0.5 text-xs text-gray-500">
          {pkg.description}
        </p>
      )}

      <p className="mt-2 text-2xl font-extrabold leading-none text-black">
        {fmt(pkg.priceCents)}
      </p>

      <div className="mt-2 flex items-center gap-1.5">
        <Coins size={13} className="text-black" />
        <span className="text-sm font-semibold text-gray-800">
          {pkg.credits.toLocaleString()} credits
        </span>
      </div>

      {selected && (
        <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-black">
          <Zap size={11} className="text-black" />
          Selected — fill your payment note below
        </div>
      )}
    </button>
  );
}

const CASHAPP_TAG = "$MysteryyyMansion";

function PaymentInfoCard() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CASHAPP_TAG);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard errors.
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <DollarSign size={16} className="text-black" />
        <h2 className="text-sm font-semibold text-gray-900">
          Where to Send Payment
        </h2>
      </div>

      <p className="mb-4 text-xs leading-relaxed text-gray-500">
        We accept payment via <strong>Cash App</strong>. Send the amount for
        your chosen package to the tag below, then include the reference in
        your request note.
      </p>

      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-100 px-4 py-3">
        <span className="flex-1 text-base font-bold text-black">
          {CASHAPP_TAG}
        </span>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-800"
        >
          {copied ? (
            <CheckCircle size={13} className="text-white" />
          ) : (
            <Copy size={13} className="text-white" />
          )}

          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <p className="mt-3 text-[11px] text-gray-400">
        After sending payment, include your Cash App username or transaction
        note in the request below so we can verify and approve quickly.
      </p>
    </div>
  );
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-gray-700",
    bg: "bg-gray-50 border-gray-200",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    color: "text-black",
    bg: "bg-gray-100 border-gray-300",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "text-gray-500",
    bg: "bg-gray-50 border-gray-200",
  },
};

function RequestRow({ req }) {
  const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3 ${cfg.bg}`}>
      <Icon size={18} className={`mt-0.5 shrink-0 ${cfg.color}`} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-gray-900">
            +{req.amount} credits
          </span>

          <span className={`text-xs font-medium ${cfg.color}`}>
            {cfg.label}
          </span>
        </div>

        {req.note && (
          <p className="mt-0.5 truncate text-xs text-gray-500">
            {req.note}
          </p>
        )}

        {req.adminNote && (
          <p className="mt-1 text-xs italic text-gray-500">
            Admin: "{req.adminNote}"
          </p>
        )}

        <p className="mt-1 text-[11px] text-gray-400">
          {new Date(req.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

function PromotionStatusCard({
  status,
  onCancelBadge,
  cancelling,
  message,
}) {
  const hasPromo = Boolean(status.activePromoExpiry);
  const hasBadge = status.badgeType === "blue";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Rocket size={15} className="text-black" />
          Promotion &amp; Badge
        </h2>

        <Link
          to="/promote"
          className="text-xs font-semibold text-black hover:underline"
        >
          Browse promotion tiers
        </Link>
      </div>

      <div className="space-y-2 text-sm">
        <p className="text-gray-700">
          Promotion:{" "}
          {hasPromo ? (
            <strong>
              Active until {formatDate(status.activePromoExpiry)}
            </strong>
          ) : (
            <span className="text-gray-500">None active</span>
          )}
        </p>

        <p className="flex items-center gap-1.5 text-gray-700">
          <BadgeCheck size={14} className="text-black" />

          Blue badge:{" "}
          {status.badgeAutoRenew ? (
            <strong>
              Active — {status.badgeMonthlyCredits} credits renew monthly on{" "}
              {formatDate(status.badgeExpiresAt)}
            </strong>
          ) : hasBadge ? (
            <strong>
              Active
              {status.badgeExpiresAt
                ? ` until ${formatDate(status.badgeExpiresAt)}`
                : ""}
            </strong>
          ) : (
            <span className="text-gray-500">Not active</span>
          )}
        </p>
      </div>

      {status.badgeAutoRenew && (
        <button
          type="button"
          onClick={onCancelBadge}
          disabled={cancelling}
          className="mt-4 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-800 transition-colors hover:bg-gray-100 disabled:opacity-50"
        >
          {cancelling ? "Cancelling…" : "Cancel monthly renewal"}
        </button>
      )}

      {message && (
        <p role="status" className="mt-3 text-xs text-gray-600">
          {message}
        </p>
      )}
    </div>
  );
}

export default function ClientCreditsPage() {
  const { user } = useContext(UserContext);

  const isProvider =
    (user?.accountType || "provider") === "provider" &&
    user?.role !== "admin";

  const [promoStatus, setPromoStatus] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [credits, setCredits] = useState(null);
  const [requests, setRequests] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const prefilledRef = useRef(false);

  useEffect(() => {
    setSEO("My Credits | TopEscortNetwork", "", {
      robots: "noindex, nofollow",
    });

    fetchData();
  }, []);

  // Arrived from a package on the public credits page: preselect it for the refill form.
  useEffect(() => {
    if (loadingData || prefilledRef.current) return;

    const wanted = Number(searchParams.get("credits"));

    if (!Number.isInteger(wanted) || wanted < 1 || wanted > 10000) return;

    prefilledRef.current = true;

    const match = packages.find((p) => p.credits === wanted);

    if (match) {
      handleSelectPackage(match);
    } else {
      const name = searchParams.get("package");

      setAmount(String(wanted));
      setNote(
        `Requesting ${wanted} credits${name ? ` — ${name.slice(0, 40)} package` : ""}. `
      );

      setTimeout(
        () =>
          document
            .getElementById("topup-form")
            ?.scrollIntoView({ behavior: "smooth", block: "start" }),
        100
      );
    }

    setSearchParams({}, { replace: true });
  }, [loadingData, packages, searchParams]);

  const fetchData = async () => {
    setLoadingData(true);

    const [balR, reqR, pkgR, statusR] = await Promise.allSettled([
      api.get("/credits/balance"),
      api.get("/credits/requests"),
      api.get("/credits/packages"),
      isProvider
        ? api.get("/promotions/status")
        : Promise.reject(new Error("not a provider")),
    ]);

    if (balR.status === "fulfilled") {
      setCredits(balR.value.data?.credits ?? (isProvider ? 0 : 200));
    }

    if (statusR.status === "fulfilled") {
      setPromoStatus(statusR.value.data?.data || null);
    }

    if (reqR.status === "fulfilled") {
      setRequests(Array.isArray(reqR.value.data) ? reqR.value.data : []);
    }

    if (pkgR.status === "fulfilled") {
      setPackages(Array.isArray(pkgR.value.data) ? pkgR.value.data : []);
    }

    setLoadingData(false);
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPkg(pkg);
    setAmount(String(pkg.credits));
    setNote(
      `Requesting ${pkg.credits} credits — ${pkg.name} package (${fmt(pkg.priceCents)}). `
    );
    setError("");
    setSuccess("");

    setTimeout(
      () =>
        document
          .getElementById("topup-form")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      100
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const amt = Number(amount);

    if (!amt || amt < 1 || !Number.isInteger(amt)) {
      setError("Please enter a whole number of credits.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/credits/request", {
        amount: amt,
        note: note.trim(),
      });

      setSuccess("Request submitted! An admin will review it shortly.");
      setAmount("");
      setNote("");
      setSelectedPkg(null);
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBadge = async () => {
    setCancelling(true);
    setStatusMsg("");

    try {
      await api.post("/promotions/badge/cancel");

      setStatusMsg(
        "Monthly renewal cancelled. Your badge stays active until the end of the paid month."
      );

      fetchData();
    } catch (err) {
      setStatusMsg(
        err?.response?.data?.error || "Failed to cancel renewal."
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-full -m-4 space-y-6 bg-gray-100 p-4 md:-m-6 md:p-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-black">
          <Coins size={24} className="text-black" />
          My Credits
        </h1>

        <p className="mt-0.5 text-sm text-gray-500">
          {isProvider
            ? "Credits pay for promotions and your monthly Blue Badge. Top up below with Cash App."
            : "Messaging is free. Top up below with Cash App."}
        </p>
      </div>

      {/* Balance card */}
      <div
        className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-100 shadow-sm">
          <Coins size={30} className="text-black" />
        </div>

        <div>
          {loadingData ? (
            <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
          ) : (
            <>
              <p className="text-4xl font-extrabold leading-none text-black">
                {credits?.toLocaleString() ?? "—"}
              </p>

            </>
          )}
        </div>
      </div>

      {isProvider && promoStatus && (
        <PromotionStatusCard
          status={promoStatus}
          onCancelBadge={handleCancelBadge}
          cancelling={cancelling}
          message={statusMsg}
        />
      )}

      <EarnCreditsPanel />

      {/* Pricing packages */}
      {packages.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Coins size={15} className="text-black" />
            Credit Packages
          </h2>

          <p className="mb-4 text-xs text-gray-500">
            Choose a package below — it will pre-fill your request. Then add
            your payment details and submit.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg._id}
                pkg={pkg}
                onSelect={handleSelectPackage}
                selected={selectedPkg?._id === pkg._id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Payment info */}
      <PaymentInfoCard />

      {/* Request top-up */}
      <div
        id="topup-form"
        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-2">
          <Plus size={16} className="text-black" />
          <h2 className="text-sm font-semibold text-gray-900">
            Request a Top-Up
          </h2>
        </div>

        <p className="mb-4 text-xs leading-relaxed text-gray-500">
          Submit a request for additional credits. Include your payment
          reference (Venmo, CashApp handle, etc.) and an admin will approve
          and add the credits to your account.
        </p>

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-800">
            <CheckCircle size={16} className="shrink-0 text-black" />
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-800">
            <AlertCircle size={16} className="shrink-0 text-black" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Credits requested
            </label>

            <input
              type="number"
              min="1"
              max="10000"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 200"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-600 focus:ring-2 focus:ring-gray-200"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Payment note{" "}
              <span className="text-gray-400">
                (payment method, reference, etc.)
              </span>
            </label>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Sent $10 via Venmo to @topescortnetwork"
              rows={2}
              maxLength={500}
              className="w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-600 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-black py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit Request"}
          </button>
        </form>
      </div>

      {/* Request history */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Clock size={15} className="text-black" />
          Request History
        </h2>

        {loadingData ? (
          <BrandLoader size="sm" />
        ) : requests.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            No requests yet.
          </p>
        ) : (
          <div className="space-y-2">
            {requests.map((r) => (
              <RequestRow key={r._id} req={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}