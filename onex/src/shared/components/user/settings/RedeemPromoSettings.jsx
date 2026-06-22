import { useContext, useState } from "react";
import { Ticket, Gift, Sparkles, BadgeCheck, Rocket, Star, ShieldAlert } from "lucide-react";
import { UserContext } from "@/context/UserContext";
import api from "@/shared/utils/api";
import confetti from "canvas-confetti";

const emitAppToast = (type, message) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("app-toast", { detail: { type, message } }));
};

const emitPromoRefresh = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("promo-updated"));
};

// 🎉 Confetti animation
const fireConfetti = () => {
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
  });
};

export default function RedeemPromoSettings() {
  const { user, setUser } = useContext(UserContext);
  const [promoCode, setPromoCode] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [maxRedeemTooltip, setMaxRedeemTooltip] = useState("");

  const handleRedeem = async (e) => {
    e.preventDefault();
    setStatusMessage("");
    setMaxRedeemTooltip("");

    if (!promoCode.trim()) {
      const message = "Please enter a promo code.";
      setStatusMessage(message);
      emitAppToast("error", message);
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post("/promo-codes/redeem", {
        code: promoCode.trim().toUpperCase(),
      });

      const durationDays = res.data?.data?.durationDays;
      const expiresAt = res.data?.data?.expiresAt;
      const expiryText = expiresAt ? new Date(expiresAt).toLocaleString() : null;
      const updatedUser = res.data?.user;

      const successMessage = durationDays
        ? `Promo accepted. Active for ${durationDays} day${
            durationDays === 1 ? "" : "s"
          }${expiryText ? ` (until ${expiryText})` : ""}.`
        : res.data?.message || "Promo code accepted.";

      // Update user context with new activePromoExpiry
      if (updatedUser && setUser) {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      setStatusMessage(successMessage);
      setMaxRedeemTooltip("");
      emitAppToast("success", successMessage);
      emitPromoRefresh();

      // 🎉 Trigger confetti on success
      fireConfetti();

      setPromoCode("");
    } catch (err) {
      console.error("Failed to redeem promo code", err);

      const message =
        err.response?.data?.error ||
        "Failed to redeem promo code. Please try again.";

      const isMaxRedeemedError =
        err?.response?.status === 409 || /max usage limit/i.test(String(message));

      if (isMaxRedeemedError) {
        const warningMessage =
          "All codes have been redeemed, look at the homepage dev message, if there isn't a code reach out to support via messages to see if the dev has anymore deals available!";

        setStatusMessage("");
        setMaxRedeemTooltip(warningMessage);
        emitAppToast("error", warningMessage);
        return;
      }

      setStatusMessage(message);
      emitAppToast("error", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Animated motivational banner ── */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-pink-600 via-fuchsia-600 to-yellow-500 p-[2px]">
        {/* spinning conic shimmer ring */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-xl bg-[conic-gradient(from_0deg,transparent_60%,rgba(255,255,255,0.35)_80%,transparent_100%)] animate-[spin_3s_linear_infinite]"
        />
        <div className="relative rounded-[10px] bg-gradient-to-br from-pink-700 via-fuchsia-700 to-yellow-600 px-5 py-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="animate-bounce text-yellow-300" />
            <span className="text-sm font-bold uppercase tracking-widest text-yellow-200">
              Exclusive Offer
            </span>
          </div>
          <p className="text-base font-extrabold leading-snug">
            Redeem your code and get featured
          </p>
          <p className="text-xs text-pink-200 mt-1">
            Your profile will appear in the promoted accounts section while the code is active.
          </p>
        </div>
      </div>

      {/* ── Benefit pills ── */}
      <div className="flex flex-wrap gap-2">
        {[
          { icon: <BadgeCheck size={13} className="text-pink-500" />, label: "Promoted badge on every post" },
          { icon: <Rocket size={13} className="text-yellow-500" />, label: "Top placement in the feed" },
          { icon: <Star size={13} className="text-emerald-500" />, label: "Visible to all visitors" },
        ].map(({ icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-medium text-pink-800 animate-pulse"
          >
            {icon}
            {label}
          </span>
        ))}
      </div>

      {/* ── Header ── */}
      <div className="flex items-center gap-2 text-gray-700 font-medium">
        <Ticket size={18} className="text-pink-600" />
        <span>Redeem Promo Code</span>
      </div>

      {user?.username && (
        <p className="text-xs text-gray-400">
          Redeeming as @{user.username}
        </p>
      )}

      {statusMessage && (
        <p className="text-sm text-gray-700">{statusMessage}</p>
      )}

      {/* ── Form ── */}
      <form
        onSubmit={handleRedeem}
        className="flex flex-col sm:flex-row gap-3"
      >
        <input
          type="text"
          value={promoCode}
          onChange={(e) => {
            setPromoCode(e.target.value);
            if (maxRedeemTooltip) setMaxRedeemTooltip("");
          }}
          placeholder="Enter promo code"
          className="flex-1 border border-pink-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
        />

        {/* Pulsing glow wrapper */}
        <span className="relative inline-flex rounded-md">
          <span className="absolute inset-0 rounded-md bg-pink-500 opacity-60 animate-ping" />
          <button
            type="submit"
            disabled={submitting}
            className="relative flex items-center justify-center gap-2 bg-pink-600 text-white px-5 py-2 rounded-md hover:bg-pink-700 active:scale-95 transition font-semibold disabled:opacity-60"
          >
            <Gift size={16} />
            {submitting ? "Redeeming..." : "Redeem Now"}
          </button>
        </span>
      </form>

      {maxRedeemTooltip && (
        <div className="relative rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
          <span
            aria-hidden="true"
            className="absolute -top-1.5 left-6 h-3 w-3 rotate-45 border-l border-t border-amber-300 bg-amber-50"
          />
          <p className="inline-flex items-start gap-2">
            <ShieldAlert size={16} className="mt-0.5 shrink-0 text-amber-700" />
            <span>{maxRedeemTooltip}</span>
          </p>
        </div>
      )}

    </div>
  );
}