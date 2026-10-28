import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion as Motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Coins,
  Crown,
  Flag,
  MessageCircle,
  MessageSquare,
  PlusCircle,
  Rocket,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";

import { UserContext } from "@/context/UserContext";
import api from "@/shared/utils/api";
import { APP_TOAST_EVENT } from "@/shared/utils/appToast";
import { MEMBERSHIP_UPDATED_EVENT } from "@/features/membership/context/MembershipContext";

const POLL_MS = 20_000;
const MAX_VISIBLE = 3;
const FIRST_LOAD_WINDOW_MS = 10 * 60 * 1000;
const seenKey = (userId) => `credit-toast-seen:${userId}`;

// Add a row here to give another notification type a toast.
const TOAST_TYPES = {
  membership_update: {
    icon: Crown,
    label: "Membership",
    accent: "text-fuchsia-400",
    ring: "bg-fuchsia-500/15",
    cta: "View membership",
    target: "membership",
    ms: 9000,
  },
  boost_applied: {
    icon: Rocket,
    label: "Boost active",
    accent: "text-amber-400",
    ring: "bg-amber-500/15",
    cta: "View boosted",
    target: "boost",
    ms: 8000,
  },
  forum_reply: {
    icon: MessageSquare,
    label: "Forum reply",
    accent: "text-pink-400",
    ring: "bg-pink-500/15",
    cta: "View reply",
    target: "thread",
    ms: 9000,
  },
  new_comment: {
    icon: MessageCircle,
    label: "New comment",
    accent: "text-yellow-400",
    ring: "bg-yellow-500/15",
    cta: "View comment",
    target: "post",
    ms: 9000,
  },
  promo_purchased: {
    icon: Rocket,
    label: "Promotion purchased",
    accent: "text-pink-400",
    ring: "bg-pink-500/15",
    cta: "View credits",
    target: "credits",
    ms: 8000,
  },
  credits_earned: {
    icon: Coins,
    label: "Credits earned",
    accent: "text-emerald-400",
    ring: "bg-emerald-500/15",
    cta: "View credits",
    target: "credits",
    ms: 6000,
  },
  credits_added: {
    icon: PlusCircle,
    label: "Credits added",
    accent: "text-emerald-400",
    ring: "bg-emerald-500/15",
    cta: "View credits",
    target: "credits",
    ms: 7000,
  },
  earn_rule_added: {
    icon: Sparkles,
    label: "New way to earn",
    accent: "text-pink-400",
    ring: "bg-pink-500/15",
    cta: "See how",
    target: "credits",
    ms: 8000,
  },
  milestone_added: {
    icon: Trophy,
    label: "New milestone",
    accent: "text-purple-400",
    ring: "bg-purple-500/15",
    cta: "View milestones",
    target: "milestones",
    ms: 8000,
  },
  low_credits: {
    icon: AlertTriangle,
    label: "Low credits",
    accent: "text-amber-400",
    ring: "bg-amber-500/15",
    cta: "Top up",
    target: "credits",
    ms: 10000,
  },
  flag_submitted: {
    icon: CheckCircle2,
    label: "Report submitted",
    accent: "text-emerald-400",
    ring: "bg-emerald-500/15",
    cta: "View my reports",
    target: "reports",
    ms: 7000,
  },
  flag_update: {
    icon: Flag,
    label: "Report update",
    accent: "text-sky-400",
    ring: "bg-sky-500/15",
    cta: "View reports",
    target: "reports",
    ms: 8000,
  },
};

function ToastCard({ toast, onDismiss, onOpen }) {
  const meta = TOAST_TYPES[toast.type];
  const Icon = meta.icon;
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (paused) return undefined;
    const id = setTimeout(() => onDismiss(toast._id), meta.ms);
    return () => clearTimeout(id);
  }, [paused, toast._id, meta.ms, onDismiss]);

  return (
    <Motion.div
      layout={!reduceMotion}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
      transition={{ duration: 0.2 }}
      role={toast.type === "low_credits" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto w-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/95 text-white shadow-2xl shadow-black/40 backdrop-blur"
    >
      <div className="flex items-start gap-3 p-3 sm:p-4">
        <span
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.ring}`}
        >
          <Icon size={18} className={meta.accent} />
        </span>

        <div className="min-w-0 flex-1">
          <p className={`text-[11px] font-semibold uppercase tracking-wide ${meta.accent}`}>
            {meta.label}
          </p>
          <p className="mt-0.5 break-words text-sm font-semibold leading-snug text-white">
            {toast.title}
          </p>
          <p className="mt-0.5 break-words text-xs leading-snug text-neutral-400">
            {toast.message}
          </p>

          <button
            type="button"
            onClick={() => onOpen(toast)}
            className="mt-2 inline-flex min-h-9 items-center rounded-lg bg-white/10 px-3 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            {meta.cta}
          </button>
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast._id)}
          aria-label="Dismiss notification"
          className="-mr-1 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    </Motion.div>
  );
}

/**
 * Pops notifications (forum replies, post comments, credits, reports) in the top-right
 * corner for every signed-in role; full width with safe-area insets on phones.
 */
export default function NotificationToastHost() {
  const { user } = useContext(UserContext) || {};
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);
  const shownRef = useRef(new Set());

  const userId = user?._id;
  const loggedIn = Boolean(userId);
  const isAdmin = user?.role === "admin";
  const isClient = user?.accountType === "client";

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t._id !== id));
  }, []);

  const open = useCallback(
    (toast) => {
      const target = TOAST_TYPES[toast.type]?.target;
      dismiss(toast._id);

      if ((target === "thread" || target === "boost") && toast.meta?.threadId) {
        navigate(`/forum/thread/${toast.meta.threadId}`);
        return;
      }

      if ((target === "post" || target === "boost") && toast.meta?.postId) {
        navigate(`/posts/${toast.meta.postId}`);
        return;
      }

      if (target === "reports") {
        navigate(isAdmin ? "/admin/reported-flags" : isClient ? "/client/reports" : "/user/reports");
        return;
      }

      // Credits, milestones and membership pages do not exist for admins.
      if (isAdmin || (target !== "credits" && target !== "milestones" && target !== "membership")) return;

      navigate(`${isClient ? "/client" : "/user"}/${target}`);
    },
    [dismiss, isAdmin, isClient, navigate]
  );

  // Toasts raised in the app itself (e.g. a report was just submitted).
  useEffect(() => {
    if (!loggedIn) return undefined;

    const onAppToast = (event) => {
      const { type, title, message } = event.detail || {};
      if (!TOAST_TYPES[type]) return;
      const toast = { _id: `local-${Date.now()}-${Math.random()}`, type, title, message };
      setToasts((prev) => [...prev, toast].slice(-MAX_VISIBLE));
    };

    window.addEventListener(APP_TOAST_EVENT, onAppToast);
    return () => window.removeEventListener(APP_TOAST_EVENT, onAppToast);
  }, [loggedIn]);

  useEffect(() => {
    if (!loggedIn) return undefined;

    let cancelled = false;
    const key = seenKey(userId);

    const poll = async () => {
      try {
        const { data } = await api.get("/notifications/user", { params: { limit: 15 } });
        if (cancelled) return;

        const stored = Number(localStorage.getItem(key));
        const since = Number.isFinite(stored) && stored > 0 ? stored : Date.now() - FIRST_LOAD_WINDOW_MS;

        const fresh = (data?.notifications || [])
          .filter(
            (n) =>
              TOAST_TYPES[n.type] &&
              !shownRef.current.has(n._id) &&
              new Date(n.createdAt).getTime() > since
          )
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        if (fresh.length === 0) return;

        fresh.forEach((n) => shownRef.current.add(n._id));
        localStorage.setItem(key, String(new Date(fresh[fresh.length - 1].createdAt).getTime()));
        setToasts((prev) => [...prev, ...fresh].slice(-MAX_VISIBLE));
      } catch {
        // Not signed in or offline; try again next tick.
      }
    };

    poll();
    const id = setInterval(poll, POLL_MS);
    // Purchases and boosts fire this event; the notification is written just after the response.
    let eventTimer;
    const onMembershipEvent = () => {
      clearTimeout(eventTimer);
      eventTimer = setTimeout(poll, 800);
    };
    window.addEventListener(MEMBERSHIP_UPDATED_EVENT, onMembershipEvent);
    const onVisible = () => {
      if (document.visibilityState === "visible") poll();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(id);
      clearTimeout(eventTimer);
      window.removeEventListener(MEMBERSHIP_UPDATED_EVENT, onMembershipEvent);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loggedIn, userId]);

  useEffect(() => {
    if (!loggedIn) setToasts([]);
  }, [loggedIn]);

  if (!loggedIn) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed top-[calc(env(safe-area-inset-top,0px)+0.75rem)] left-[calc(env(safe-area-inset-left,0px)+0.75rem)] right-[calc(env(safe-area-inset-right,0px)+0.75rem)] z-[9990] flex flex-col gap-2 sm:left-auto sm:right-4 sm:top-4 sm:w-96"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastCard key={toast._id} toast={toast} onDismiss={dismiss} onOpen={open} />
        ))}
      </AnimatePresence>
    </div>
  );
}
