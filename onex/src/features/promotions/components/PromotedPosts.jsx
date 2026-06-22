import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import api from "@/shared/utils/api";

const PLACEHOLDER_PROFILE = {
  profilePic:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
  username: "YourUsername",
  bio: "This is how promoted profiles are displayed to users.",
};

function useCountdown(expiryDate) {
  const calcRemaining = () => {
    const diff = new Date(expiryDate).getTime() - Date.now();
    if (diff <= 0) return null;
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  };

  const [remaining, setRemaining] = useState(calcRemaining);

  useEffect(() => {
    const id = setInterval(() => {
      const next = calcRemaining();
      setRemaining(next);
      if (!next) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiryDate]);

  return remaining;
}

function CountdownBadge({ expiryDate, isVerified = false }) {
  const remaining = useCountdown(expiryDate);

  if (!remaining) {
    return (
      <span className="mt-2 block w-full bg-transparent text-[10px] font-semibold leading-tight text-gray-400">
        Promotion ended
      </span>
    );
  }

  const parts = [];
  if (remaining.days > 0) parts.push(`${remaining.days}d`);
  parts.push(
    `${String(remaining.hours).padStart(2, "0")}h`,
    `${String(remaining.minutes).padStart(2, "0")}m`,
    `${String(remaining.seconds).padStart(2, "0")}s`,
  );

  return (
    <span className={`mt-2 block w-full bg-transparent text-[10px] font-semibold leading-tight ${isVerified ? "text-blue-500" : "text-pink-500"} tabular-nums`}>
      ⏱ {parts.join(" ")}
    </span>
  );
}

function ProfileCard({ profile, isPlaceholder = false }) {
  const userId = profile?._id || profile?.id || profile?.userId || "";
  const username = profile?.username || "";
  const profilePath = userId
    ? `/user/${userId}`
    : username
      ? `/profile/${encodeURIComponent(username)}`
      : null;

  // Check if user has blue badge (verified)
  const isVerified = profile?.badgeType === "blue";

  const cardClasses = `relative z-10 flex h-[238px] w-[210px] flex-shrink-0 flex-col rounded-[11px] p-4 text-center transition-all duration-200 sm:h-[248px] ${
    isPlaceholder
      ? "bg-gradient-to-br from-pink-50 via-white to-rose-50 shadow-sm"
      : isVerified
        ? "bg-gradient-to-br from-blue-50/85 via-white to-cyan-50/80 backdrop-blur-sm shadow-sm hover:shadow-blue-200"
        : "bg-gradient-to-br from-pink-50/85 via-white to-rose-50/80 backdrop-blur-sm shadow-sm hover:shadow-pink-200"
  }`;

  const rotatingBorder = (
    <Motion.span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 rounded-xl ${
        isVerified
          ? "bg-[conic-gradient(from_180deg_at_50%_50%,#93c5fd_0deg,#60a5fa_90deg,#3b82f6_180deg,#bfdbfe_270deg,#93c5fd_360deg)]"
          : "bg-[conic-gradient(from_180deg_at_50%_50%,#f9a8d4_0deg,#fbcfe8_90deg,#fda4af_180deg,#fce7f3_270deg,#f9a8d4_360deg)]"
      }`}
      animate={{ rotate: 360 }}
      transition={{ duration: 10, ease: "linear", repeat: Infinity }}
    />
  );

  const verifiedBadge = !isPlaceholder ? (
    <span
      className={`absolute right-2 top-2 z-30 inline-flex h-6 w-6 items-center justify-center rounded-full ${
        isVerified ? "bg-blue-600" : "bg-pink-600"
      } shadow-md pointer-events-none`}
      aria-label={isVerified ? "Verified account" : "Promoted account"}
      title={isVerified ? "Verified account" : "Promoted account"}
    >
      <BadgeCheck size={14} className="text-white" />
    </span>
  ) : null;

  const cardContent = (
    <>
      <img
        src={profile.profilePic || "https://via.placeholder.com/64?text=?"}
        alt={username || "Promoted user"}
        className={`w-16 h-16 rounded-full object-cover border-2 ${
          isVerified ? "border-blue-300" : "border-pink-300"
        } mx-auto mb-3`}
      />
      <h3 className={`text-sm font-semibold ${
        isVerified ? "text-blue-600" : "text-pink-600"
      } break-words`}>{username}</h3>
      <div className="mt-1 min-h-[48px]">
        <p
          className="text-xs text-gray-600 break-words overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {profile.bio || "No bio provided."}
        </p>
      </div>
      <div className="mt-auto min-h-[28px]">
        {!isPlaceholder && profile.activePromoExpiry && (
          <CountdownBadge expiryDate={profile.activePromoExpiry} isVerified={isVerified} />
        )}
      </div>
    </>
  );

  if (!isPlaceholder && profilePath) {
    return (
      <Motion.div
        animate={{
          y: [0, 0, -2, 1, -1, 0],
          rotate: [0, 0, -0.9, 0.9, -0.4, 0],
          x: [0, 0, -0.8, 0.8, -0.5, 0],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          times: [0, 0.72, 0.82, 0.9, 0.96, 1],
        }}
        className="relative w-[210px] flex-shrink-0 rounded-xl p-[1px] overflow-hidden"
      >
        {rotatingBorder}
        {verifiedBadge}
        <Link to={profilePath} className={`${cardClasses} cursor-pointer`}>
          {cardContent}
        </Link>
      </Motion.div>
    );
  }

  return (
    <Motion.article
      animate={{
        y: [0, 0, -2, 1, -1, 0],
        rotate: [0, 0, -0.9, 0.9, -0.4, 0],
        x: [0, 0, -0.8, 0.8, -0.5, 0],
      }}
      transition={{
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        times: [0, 0.72, 0.82, 0.9, 0.96, 1],
      }}
      className="relative w-[210px] flex-shrink-0 rounded-xl p-[1px] overflow-hidden"
    >
      {rotatingBorder}
      {verifiedBadge}
      <div className={cardClasses}>{cardContent}</div>
    </Motion.article>
  );
}

export default function PromotedPosts() {
  const [promotedUsers, setPromotedUsers] = useState([]);

  useEffect(() => {
    const fetchPromoted = async () => {
      try {
        const { data } = await api.get("/public/users/promoted");
        const users = Array.isArray(data?.data) ? data.data : [];
        setPromotedUsers(users);
      } catch (err) {
        console.error("Failed to fetch promoted users:", err);
        setPromotedUsers([]);
      }
    };

    fetchPromoted();

    const handlePromoUpdated = () => {
      fetchPromoted();
    };
    window.addEventListener("promo-updated", handlePromoUpdated);

    // Re-fetch every 60 s so expired accounts drop off without a full page reload
    const id = setInterval(fetchPromoted, 60_000);
    return () => {
      clearInterval(id);
      window.removeEventListener("promo-updated", handlePromoUpdated);
    };
  }, []);

  return (
    <section className="px-6 py-10 max-w-7xl mx-auto">
      {/* Title + Description */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white">Promoted Posts</h2>
        <button
          type="button"
          className="mt-3 px-3 py-1 text-[11px] font-semibold rounded-full bg-pink-600 text-white shadow-sm"
        >
          Promoted accounts
        </button>
      </div>

      {/* Scrollable Profile Row */}
      <div
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-transparent"
        style={{
          scrollbarWidth: "thin",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {promotedUsers.length > 0 ? (
          promotedUsers.map((user) => (
            <ProfileCard key={user._id || user.id} profile={user} />
          ))
        ) : (
          <ProfileCard profile={PLACEHOLDER_PROFILE} isPlaceholder />
        )}
      </div>
    </section>
  );
}
