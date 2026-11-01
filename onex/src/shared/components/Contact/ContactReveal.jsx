import { useCallback, useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Eye, Loader2, Lock } from "lucide-react";

import { UserContext } from "@/context/UserContext";
import api from "@/shared/utils/api";
import { formatPhoneNumber } from "@/features/posts/utils/PostFormatter";

const phoneDigits = (value = "") => {
  const digits = String(value).replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
};

/**
 * Click-to-reveal contact details. Public APIs only return masked previews
 * (`phoneMasked` / `emailMasked`); the real values are fetched from the
 * sign-in-only endpoint the first time a member clicks one.
 *
 * Pass `ownContact` when the viewer is the owner so their own details show
 * without a round trip.
 */
export function useContactReveal(userId, ownContact = null) {
  const { user } = useContext(UserContext);
  const isSignedIn = Boolean(user?._id || user?.id);

  const [contact, setContact] = useState(ownContact);
  const [revealed, setRevealed] = useState(() => (ownContact ? { phone: true, email: true } : {}));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsSignIn, setNeedsSignIn] = useState(false);

  const ownPhone = ownContact?.phoneNumber || "";
  const ownEmail = ownContact?.email || "";

  useEffect(() => {
    if (ownPhone || ownEmail) {
      setContact({ phoneNumber: ownPhone, email: ownEmail });
      setRevealed({ phone: true, email: true });
    } else {
      setContact(null);
      setRevealed({});
    }
    setError("");
    setNeedsSignIn(false);
  }, [userId, ownPhone, ownEmail]);

  const reveal = useCallback(
    async (field) => {
      if (!isSignedIn) {
        setNeedsSignIn(true);
        return;
      }
      if (contact) {
        setRevealed((prev) => ({ ...prev, [field]: true }));
        return;
      }
      if (!userId) return;

      try {
        setLoading(true);
        setError("");
        const { data } = await api.get(`/users/contact/${encodeURIComponent(userId)}`);
        setContact({ phoneNumber: data?.phoneNumber || "", email: data?.email || "" });
        setRevealed((prev) => ({ ...prev, [field]: true }));
      } catch (err) {
        if (err?.response?.status === 401) {
          setNeedsSignIn(true);
        } else {
          setError(err?.response?.data?.error || "Unable to load contact details.");
        }
      } finally {
        setLoading(false);
      }
    },
    [contact, isSignedIn, userId],
  );

  return { contact, revealed, reveal, loading, error, needsSignIn };
}

const VARIANTS = {
  light: {
    link: "font-medium text-pink-600 underline decoration-pink-400 underline-offset-2 transition-colors hover:text-pink-700",
    masked: "font-medium tracking-wide text-gray-700",
    hint: "text-pink-600",
  },
  dark: {
    link: "font-medium text-gray-200 transition hover:text-white",
    masked: "font-medium tracking-wide text-gray-300",
    hint: "text-pink-400",
  },
};

/**
 * Renders one contact field: masked button until revealed, then a tel:/mailto:
 * link. `field` is "phone" or "email".
 */
export function ContactValue({ field, masked, state, variant = "light", className = "" }) {
  const styles = VARIANTS[variant] || VARIANTS.light;
  const { contact, revealed, reveal, loading } = state;

  if (revealed[field] && contact) {
    const raw = field === "phone" ? contact.phoneNumber : contact.email;
    if (!raw) return <span className={`italic ${styles.masked} ${className}`}>Not provided</span>;

    const href = field === "phone" ? `tel:${phoneDigits(raw)}` : `mailto:${raw}`;
    const label = field === "phone" ? formatPhoneNumber(phoneDigits(raw)) || raw : raw;
    return (
      <a href={href} className={`break-all ${styles.link} ${className}`}>
        {label}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => reveal(field)}
      disabled={loading}
      className={`group inline-flex items-center gap-1.5 text-left ${className}`}
      aria-label={`Show ${field === "phone" ? "phone number" : "email"}`}
    >
      <span className={`break-all ${styles.masked}`}>{masked}</span>
      {loading ? (
        <Loader2 size={12} className={`shrink-0 animate-spin ${styles.hint}`} />
      ) : (
        <span className={`inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold ${styles.hint} group-hover:underline`}>
          <Eye size={12} /> Show
        </span>
      )}
    </button>
  );
}

/** Sign-in / error notice shown under the contact fields. */
export function ContactRevealNotice({ state, variant = "light" }) {
  const location = useLocation();
  const { needsSignIn, error } = state;
  const isDark = variant === "dark";

  if (needsSignIn) {
    return (
      <p className={`flex flex-wrap items-center gap-1 text-xs ${isDark ? "text-gray-300" : "text-gray-600"}`}>
        <Lock size={12} className={isDark ? "text-pink-400" : "text-pink-500"} />
        <Link
          to="/signin"
          state={{ from: location.pathname }}
          className={`font-semibold underline ${isDark ? "text-pink-400" : "text-pink-600"}`}
        >
          Sign in
        </Link>
        or create an account to view contact details.
      </p>
    );
  }

  if (error) {
    return <p className="text-xs text-red-500">{error}</p>;
  }

  return null;
}
